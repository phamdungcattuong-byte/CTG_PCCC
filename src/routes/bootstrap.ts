// Bootstrap / reference-data routes per docs/API-CONTRACT.md §2-4, §9-10.
// These are mostly read-heavy config tables the SPA needs on every load to
// replace the prototype's static window.UNITS / window.LEVELS / etc. globals
// (ctg-data.js, mock-people.js). All GET list endpoints require only
// `requireAuth` (any logged-in role may read reference data) — write
// endpoints (create/update task templates, units, etc.) require the
// `admin.manage` permission held only by `super`.
import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { requireAuth, requirePermission } from '../middleware/auth'
import { newUuid } from '../lib/crypto'

const bootstrap = new Hono<AppEnv>()

bootstrap.use('*', requireAuth)

// ---------------------------------------------------------------------------
// GET /units
// ---------------------------------------------------------------------------
bootstrap.get('/units', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM units ORDER BY sort_order, code').all()
  return c.json({ ok: true, data: results })
})

bootstrap.post('/units', requirePermission('admin.manage'), async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.code !== 'string' || typeof body.name !== 'string') {
    return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'Thiếu code hoặc name' } }, 400)
  }
  await c.env.DB
    .prepare(
      `INSERT INTO units (code, name, short, icon, parent_code, sort_order) VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(body.code, body.name, body.short ?? body.name, body.icon ?? null, body.parentCode ?? null, body.sortOrder ?? 0)
    .run()
  const row = await c.env.DB.prepare('SELECT * FROM units WHERE code = ?').bind(body.code).first()
  return c.json({ ok: true, data: row }, 201)
})

bootstrap.patch('/units/:code', requirePermission('admin.manage'), async (c) => {
  const code = c.req.param('code')
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'Body không hợp lệ' } }, 400)
  const existing = await c.env.DB.prepare('SELECT * FROM units WHERE code = ?').bind(code).first()
  if (!existing) return c.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy đơn vị' } }, 404)
  await c.env.DB
    .prepare(
      `UPDATE units SET name = ?, short = ?, icon = ?, parent_code = ?, sort_order = ?, updated_at = datetime('now') WHERE code = ?`
    )
    .bind(
      body.name ?? existing.name,
      body.short ?? existing.short,
      body.icon ?? existing.icon,
      body.parentCode ?? existing.parent_code,
      body.sortOrder ?? existing.sort_order,
      code
    )
    .run()
  const row = await c.env.DB.prepare('SELECT * FROM units WHERE code = ?').bind(code).first()
  return c.json({ ok: true, data: row })
})

bootstrap.delete('/units/:code', requirePermission('admin.manage'), async (c) => {
  const code = c.req.param('code')
  await c.env.DB.prepare('DELETE FROM units WHERE code = ?').bind(code).run()
  return c.body(null, 204)
})

// ---------------------------------------------------------------------------
// GET /roles, GET /permissions
// ---------------------------------------------------------------------------
bootstrap.get('/roles', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM roles ORDER BY id').all()
  const data = results.map((r: any) => ({ ...r, perms: JSON.parse(r.perms_json || '[]') }))
  return c.json({ ok: true, data })
})

bootstrap.patch('/roles/:id', requirePermission('admin.manage'), async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => null)
  const existing = await c.env.DB.prepare('SELECT * FROM roles WHERE id = ?').bind(id).first()
  if (!existing) return c.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy vai trò' } }, 404)
  const permsJson = body?.perms ? JSON.stringify(body.perms) : (existing as any).perms_json
  await c.env.DB
    .prepare(`UPDATE roles SET name = ?, description = ?, color = ?, perms_json = ?, updated_at = datetime('now') WHERE id = ?`)
    .bind(body?.name ?? (existing as any).name, body?.description ?? (existing as any).description, body?.color ?? (existing as any).color, permsJson, id)
    .run()
  const row = await c.env.DB.prepare('SELECT * FROM roles WHERE id = ?').bind(id).first()
  return c.json({ ok: true, data: { ...(row as any), perms: JSON.parse((row as any).perms_json || '[]') } })
})

bootstrap.get('/permissions', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM permissions ORDER BY code').all()
  return c.json({ ok: true, data: results })
})

// ---------------------------------------------------------------------------
// GET /sites, /sites/:id/staff
// ---------------------------------------------------------------------------
bootstrap.get('/sites', async (c) => {
  const unit = c.req.query('unit')
  const kind = c.req.query('kind')
  const risk = c.req.query('risk')
  let sql = 'SELECT * FROM sites WHERE deleted_at IS NULL'
  const binds: any[] = []
  if (unit) { sql += ' AND unit_code = ?'; binds.push(unit) }
  if (kind) { sql += ' AND kind = ?'; binds.push(kind) }
  if (risk) { sql += ' AND risk = ?'; binds.push(risk) }
  sql += ' ORDER BY name'
  const { results } = await c.env.DB.prepare(sql).bind(...binds).all()
  return c.json({ ok: true, data: results })
})

bootstrap.post('/sites', requirePermission('admin.manage'), async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.name !== 'string') {
    return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'Thiếu name' } }, 400)
  }
  const id = body.id || newUuid()
  await c.env.DB
    .prepare(
      `INSERT INTO sites (id, name, unit_code, x, y, kind, staff, risk, description, latitude, longitude, address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(id, body.name, body.unitCode ?? null, body.x ?? null, body.y ?? null, body.kind ?? null, body.staff ?? 0, body.risk ?? 'ok', body.description ?? null, body.latitude ?? null, body.longitude ?? null, body.address ?? null)
    .run()
  const row = await c.env.DB.prepare('SELECT * FROM sites WHERE id = ?').bind(id).first()
  return c.json({ ok: true, data: row }, 201)
})

bootstrap.patch('/sites/:id', requirePermission('admin.manage'), async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => null)
  const existing: any = await c.env.DB.prepare('SELECT * FROM sites WHERE id = ?').bind(id).first()
  if (!existing) return c.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy site' } }, 404)
  await c.env.DB
    .prepare(
      `UPDATE sites SET name=?, unit_code=?, x=?, y=?, kind=?, staff=?, risk=?, description=?, latitude=?, longitude=?, address=?, updated_at=datetime('now') WHERE id=?`
    )
    .bind(
      body?.name ?? existing.name, body?.unitCode ?? existing.unit_code, body?.x ?? existing.x, body?.y ?? existing.y,
      body?.kind ?? existing.kind, body?.staff ?? existing.staff, body?.risk ?? existing.risk, body?.description ?? existing.description,
      body?.latitude ?? existing.latitude, body?.longitude ?? existing.longitude, body?.address ?? existing.address, id
    )
    .run()
  const row = await c.env.DB.prepare('SELECT * FROM sites WHERE id = ?').bind(id).first()
  return c.json({ ok: true, data: row })
})

bootstrap.get('/sites/:id/staff', async (c) => {
  const id = c.req.param('id')
  const { results } = await c.env.DB
    .prepare(
      `SELECT u.id, u.name, u.business_title, u.short_label, u.gradient_class, u.phone, u.avatar_url, u.role_id, u.online
       FROM site_staff ss JOIN users u ON u.id = ss.user_id WHERE ss.site_id = ?`
    )
    .bind(id)
    .all()
  return c.json({ ok: true, data: results })
})

// ---------------------------------------------------------------------------
// GET /levels, /phases  (config, read-only)
// ---------------------------------------------------------------------------
bootstrap.get('/levels', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM levels ORDER BY k').all()
  return c.json({ ok: true, data: results })
})

bootstrap.get('/phases', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM phases ORDER BY off_hours').all()
  return c.json({ ok: true, data: results })
})

bootstrap.get('/levels/:k/phases', async (c) => {
  const k = c.req.param('k')
  const { results } = await c.env.DB
    .prepare('SELECT p.* FROM level_phases lp JOIN phases p ON p.id = lp.phase_id WHERE lp.level_k = ? ORDER BY p.off_hours')
    .bind(k)
    .all()
  return c.json({ ok: true, data: results })
})

// ---------------------------------------------------------------------------
// Task templates — GET list w/ filters, POST/PATCH/DELETE admin.manage only
// ---------------------------------------------------------------------------
bootstrap.get('/task-templates', async (c) => {
  const unit = c.req.query('unit')
  const phase = c.req.query('phase')
  const minLevel = c.req.query('minLevel')
  const q = c.req.query('q')
  let sql = 'SELECT * FROM task_templates WHERE active = 1'
  const binds: any[] = []
  if (unit) { sql += ' AND unit_code = ?'; binds.push(unit) }
  if (phase) { sql += ' AND phase_id = ?'; binds.push(phase) }
  if (minLevel) { sql += ' AND min_level <= ?'; binds.push(Number(minLevel)) }
  if (q) { sql += ' AND title LIKE ?'; binds.push(`%${q}%`) }
  sql += ' ORDER BY unit_code, phase_id'
  const { results } = await c.env.DB.prepare(sql).bind(...binds).all()
  return c.json({ ok: true, data: results })
})

bootstrap.post('/task-templates', requirePermission('admin.manage'), async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.title !== 'string') {
    return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'Thiếu title' } }, 400)
  }
  const id = newUuid()
  await c.env.DB
    .prepare(
      `INSERT INTO task_templates (id, code, unit_code, phase_id, min_level, title, suggested_owner, suggested_checker, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(id, body.code ?? null, body.unitCode ?? null, body.phaseId ?? null, body.minLevel ?? 0, body.title, body.suggestedOwner ?? null, body.suggestedChecker ?? null, body.note ?? null)
    .run()
  const row = await c.env.DB.prepare('SELECT * FROM task_templates WHERE id = ?').bind(id).first()
  return c.json({ ok: true, data: row }, 201)
})

bootstrap.patch('/task-templates/:id', requirePermission('admin.manage'), async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => null)
  const existing: any = await c.env.DB.prepare('SELECT * FROM task_templates WHERE id = ?').bind(id).first()
  if (!existing) return c.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy mẫu nhiệm vụ' } }, 404)
  await c.env.DB
    .prepare(
      `UPDATE task_templates SET unit_code=?, phase_id=?, min_level=?, title=?, suggested_owner=?, suggested_checker=?, note=?, active=?, updated_at=datetime('now') WHERE id=?`
    )
    .bind(
      body?.unitCode ?? existing.unit_code, body?.phaseId ?? existing.phase_id, body?.minLevel ?? existing.min_level,
      body?.title ?? existing.title, body?.suggestedOwner ?? existing.suggested_owner, body?.suggestedChecker ?? existing.suggested_checker,
      body?.note ?? existing.note, body?.active ?? existing.active, id
    )
    .run()
  const row = await c.env.DB.prepare('SELECT * FROM task_templates WHERE id = ?').bind(id).first()
  return c.json({ ok: true, data: row })
})

bootstrap.delete('/task-templates/:id', requirePermission('admin.manage'), async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare('UPDATE task_templates SET active = 0 WHERE id = ?').bind(id).run()
  return c.body(null, 204)
})

// ---------------------------------------------------------------------------
// Norms (định mức)
// ---------------------------------------------------------------------------
bootstrap.get('/norms', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM norms ORDER BY category, id').all()
  return c.json({ ok: true, data: results })
})

bootstrap.patch('/norms/:id', requirePermission('admin.manage'), async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => null)
  const existing: any = await c.env.DB.prepare('SELECT * FROM norms WHERE id = ?').bind(id).first()
  if (!existing) return c.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy định mức' } }, 404)
  await c.env.DB
    .prepare('UPDATE norms SET name=?, unit=?, tn=?, cty=?, eco=?, ctn=?, note=? WHERE id=?')
    .bind(body?.name ?? existing.name, body?.unit ?? existing.unit, body?.tn ?? existing.tn, body?.cty ?? existing.cty, body?.eco ?? existing.eco, body?.ctn ?? existing.ctn, body?.note ?? existing.note, id)
    .run()
  const row = await c.env.DB.prepare('SELECT * FROM norms WHERE id = ?').bind(id).first()
  return c.json({ ok: true, data: row })
})

// ---------------------------------------------------------------------------
// Scenarios (kịch bản) + actions
// ---------------------------------------------------------------------------
bootstrap.get('/scenarios', async (c) => {
  const group = c.req.query('group')
  const level = c.req.query('level')
  let sql = 'SELECT * FROM scenarios WHERE 1=1'
  const binds: any[] = []
  if (group) { sql += ' AND grp = ?'; binds.push(group) }
  if (level) { sql += ' AND lv = ?'; binds.push(Number(level)) }
  sql += ' ORDER BY id'
  const { results } = await c.env.DB.prepare(sql).bind(...binds).all()
  return c.json({ ok: true, data: results })
})

bootstrap.get('/scenarios/:id', async (c) => {
  const id = c.req.param('id')
  const scenario = await c.env.DB.prepare('SELECT * FROM scenarios WHERE id = ?').bind(id).first()
  if (!scenario) return c.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy kịch bản' } }, 404)
  const { results: actions } = await c.env.DB.prepare('SELECT * FROM scenario_actions WHERE scenario_id = ? ORDER BY seq').bind(id).all()
  return c.json({ ok: true, data: { ...scenario, actions } })
})

bootstrap.post('/scenarios', requirePermission('admin.manage'), async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.name !== 'string') {
    return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'Thiếu name' } }, 400)
  }
  const id = body.id || newUuid()
  await c.env.DB
    .prepare(
      `INSERT INTO scenarios (id, grp, lv, name, trigger_desc, assumption, force_desc, sla, drill) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(id, body.grp ?? 'B', body.lv ?? 1, body.name, body.triggerDesc ?? null, body.assumption ?? null, body.forceDesc ?? null, body.sla ?? null, body.drill ?? null)
    .run()
  const row = await c.env.DB.prepare('SELECT * FROM scenarios WHERE id = ?').bind(id).first()
  return c.json({ ok: true, data: row }, 201)
})

bootstrap.patch('/scenarios/:id', requirePermission('admin.manage'), async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => null)
  const existing: any = await c.env.DB.prepare('SELECT * FROM scenarios WHERE id = ?').bind(id).first()
  if (!existing) return c.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy kịch bản' } }, 404)
  await c.env.DB
    .prepare(
      `UPDATE scenarios SET grp=?, lv=?, name=?, trigger_desc=?, assumption=?, force_desc=?, sla=?, drill=?, updated_at=datetime('now') WHERE id=?`
    )
    .bind(
      body?.grp ?? existing.grp, body?.lv ?? existing.lv, body?.name ?? existing.name, body?.triggerDesc ?? existing.trigger_desc,
      body?.assumption ?? existing.assumption, body?.forceDesc ?? existing.force_desc, body?.sla ?? existing.sla, body?.drill ?? existing.drill, id
    )
    .run()
  const row = await c.env.DB.prepare('SELECT * FROM scenarios WHERE id = ?').bind(id).first()
  return c.json({ ok: true, data: row })
})

export default bootstrap
