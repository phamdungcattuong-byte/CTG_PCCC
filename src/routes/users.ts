// Users CRUD (Admin) per docs/API-CONTRACT.md §2. Only 'admin.manage'
// permission (super role) may create/update/delete users. Any authenticated
// user may list (filtered) for people-picker UIs (assign task, reassign,
// team member picking) — but password fields are always stripped from output.
import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { requireAuth, requirePermission } from '../middleware/auth'
import { newUuid, hashPassword, randomSaltBase64 } from '../lib/crypto'
import { insertAuditLog } from '../lib/db'

const users = new Hono<AppEnv>()

users.use('*', requireAuth)

const SAFE_COLUMNS = `id, username, email, name, business_title, unit_code, short_label, gradient_class, phone, avatar_url, role_id, online, last_login_at, two_factor_enabled, active, created_at, updated_at`

// ---------------------------------------------------------------------------
// GET /users   ?q=&roleId=&unit=&online=&page=&limit=
// ---------------------------------------------------------------------------
users.get('/', async (c) => {
  const q = c.req.query('q')
  const roleId = c.req.query('roleId')
  const unit = c.req.query('unit')
  const online = c.req.query('online')
  const page = Math.max(1, Number(c.req.query('page') ?? 1))
  const limit = Math.min(100, Number(c.req.query('limit') ?? 50))
  const offset = (page - 1) * limit

  let sql = `SELECT ${SAFE_COLUMNS} FROM users WHERE deleted_at IS NULL`
  const binds: any[] = []
  if (q) { sql += ' AND (name LIKE ? OR username LIKE ? OR business_title LIKE ?)'; binds.push(`%${q}%`, `%${q}%`, `%${q}%`) }
  if (roleId) { sql += ' AND role_id = ?'; binds.push(roleId) }
  if (unit) { sql += ' AND unit_code = ?'; binds.push(unit) }
  if (online === 'true') sql += ' AND online = 1'
  if (online === 'false') sql += ' AND online = 0'

  const countRow = await c.env.DB.prepare(`SELECT COUNT(*) c FROM (${sql})`).bind(...binds).first<{ c: number }>()
  sql += ' ORDER BY name LIMIT ? OFFSET ?'
  binds.push(limit, offset)
  const { results } = await c.env.DB.prepare(sql).bind(...binds).all()

  const total = countRow?.c ?? 0
  return c.json({ ok: true, data: results, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
})

// GET /users/:id
users.get('/:id', async (c) => {
  const id = c.req.param('id')
  const row = await c.env.DB.prepare(`SELECT ${SAFE_COLUMNS} FROM users WHERE id = ? AND deleted_at IS NULL`).bind(id).first()
  if (!row) return c.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy người dùng' } }, 404)
  const role = await c.env.DB.prepare('SELECT * FROM roles WHERE id = ?').bind((row as any).role_id).first()
  return c.json({ ok: true, data: { ...row, role } })
})

// POST /users   Person (partial) -> 201 Person
users.post('/', requirePermission('admin.manage'), async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.username !== 'string' || typeof body.name !== 'string' || typeof body.roleId !== 'string') {
    return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'Thiếu username, name hoặc roleId' } }, 400)
  }
  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE username = ?').bind(body.username).first()
  if (existing) return c.json({ ok: false, error: { code: 'CONFLICT', message: 'Username đã tồn tại' } }, 409)

  const role = await c.env.DB.prepare('SELECT id FROM roles WHERE id = ?').bind(body.roleId).first()
  if (!role) return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'roleId không hợp lệ' } }, 400)

  const id = newUuid()
  const password = body.password || `Cattuong@${new Date().getFullYear()}`
  const { hash, salt } = await hashPassword(password)

  await c.env.DB
    .prepare(
      `INSERT INTO users (id, username, email, password_hash, password_salt, name, business_title, unit_code, short_label, gradient_class, phone, avatar_url, role_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(id, body.username, body.email ?? null, hash, salt, body.name, body.businessTitle ?? null, body.unitCode ?? null, body.shortLabel ?? (body.name as string).slice(0, 2).toUpperCase(), body.gradientClass ?? 'grad-a', body.phone ?? null, body.avatarUrl ?? null, body.roleId)
    .run()

  await insertAuditLog(c.env.DB, {
    id: newUuid(),
    actorId: c.var.user!.id,
    action: 'create',
    objectType: 'user',
    objectId: id,
    objectLabel: body.name,
    detail: `Tạo người dùng mới: ${body.username}`,
  })

  const row = await c.env.DB.prepare(`SELECT ${SAFE_COLUMNS} FROM users WHERE id = ?`).bind(id).first()
  return c.json({ ok: true, data: { ...row, initialPassword: body.password ? undefined : password } }, 201)
})

// PATCH /users/:id
users.patch('/:id', requirePermission('admin.manage'), async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => null)
  const existing: any = await c.env.DB.prepare('SELECT * FROM users WHERE id = ? AND deleted_at IS NULL').bind(id).first()
  if (!existing) return c.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy người dùng' } }, 404)

  let passwordHash = existing.password_hash
  let passwordSalt = existing.password_salt
  if (body?.password) {
    const { hash, salt } = await hashPassword(body.password)
    passwordHash = hash
    passwordSalt = salt
  }

  await c.env.DB
    .prepare(
      `UPDATE users SET email=?, name=?, business_title=?, unit_code=?, short_label=?, gradient_class=?, phone=?, avatar_url=?, role_id=?, active=?, password_hash=?, password_salt=?, updated_at=datetime('now') WHERE id=?`
    )
    .bind(
      body?.email ?? existing.email, body?.name ?? existing.name, body?.businessTitle ?? existing.business_title,
      body?.unitCode ?? existing.unit_code, body?.shortLabel ?? existing.short_label, body?.gradientClass ?? existing.gradient_class,
      body?.phone ?? existing.phone, body?.avatarUrl ?? existing.avatar_url, body?.roleId ?? existing.role_id,
      body?.active ?? existing.active, passwordHash, passwordSalt, id
    )
    .run()

  await insertAuditLog(c.env.DB, { id: newUuid(), actorId: c.var.user!.id, action: 'update', objectType: 'user', objectId: id, objectLabel: existing.name, detail: 'Cập nhật thông tin người dùng' })

  const row = await c.env.DB.prepare(`SELECT ${SAFE_COLUMNS} FROM users WHERE id = ?`).bind(id).first()
  return c.json({ ok: true, data: row })
})

// DELETE /users/:id  -> 204  (soft delete; audit)
users.delete('/:id', requirePermission('admin.manage'), async (c) => {
  const id = c.req.param('id')
  const existing: any = await c.env.DB.prepare('SELECT * FROM users WHERE id = ? AND deleted_at IS NULL').bind(id).first()
  if (!existing) return c.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy người dùng' } }, 404)
  await c.env.DB.prepare(`UPDATE users SET deleted_at = datetime('now'), active = 0 WHERE id = ?`).bind(id).run()
  await insertAuditLog(c.env.DB, { id: newUuid(), actorId: c.var.user!.id, action: 'delete', objectType: 'user', objectId: id, objectLabel: existing.name, detail: 'Xoá (soft-delete) người dùng' })
  return c.body(null, 204)
})

export default users
