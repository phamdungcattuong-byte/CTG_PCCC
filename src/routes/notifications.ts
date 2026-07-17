// Notifications + Admin Audit Log routes per docs/API-CONTRACT.md §7 + §16.
// Audit log is immutable per QĐ.03 Điều 78 — no DELETE endpoint is exposed.
import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { requireAuth, requirePermission } from '../middleware/auth'
import { newUuid } from '../lib/crypto'

const notifications = new Hono<AppEnv>()

notifications.use('*', requireAuth)

// ---------------------------------------------------------------------------
// GET /notifications   ?read=&kind=
// ---------------------------------------------------------------------------
notifications.get('/notifications', async (c) => {
  const user = c.var.user!
  const read = c.req.query('read')
  const kind = c.req.query('kind')
  let sql = 'SELECT * FROM notifications WHERE user_id = ?'
  const binds: any[] = [user.id]
  if (read === 'true') sql += ' AND read_at IS NOT NULL'
  if (read === 'false') sql += ' AND read_at IS NULL'
  if (kind) { sql += ' AND kind = ?'; binds.push(kind) }
  sql += ' ORDER BY created_at DESC LIMIT 100'
  const { results } = await c.env.DB.prepare(sql).bind(...binds).all()
  return c.json({ ok: true, data: results })
})

// PATCH /notifications/:id/read
notifications.patch('/notifications/:id/read', async (c) => {
  const id = c.req.param('id')
  const user = c.var.user!
  const existing = await c.env.DB.prepare('SELECT * FROM notifications WHERE id = ? AND user_id = ?').bind(id, user.id).first()
  if (!existing) return c.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy thông báo' } }, 404)
  await c.env.DB.prepare(`UPDATE notifications SET read_at = datetime('now') WHERE id = ?`).bind(id).run()
  const row = await c.env.DB.prepare('SELECT * FROM notifications WHERE id = ?').bind(id).first()
  return c.json({ ok: true, data: row })
})

// POST /notifications/mark-all-read
notifications.post('/notifications/mark-all-read', async (c) => {
  const user = c.var.user!
  await c.env.DB.prepare(`UPDATE notifications SET read_at = datetime('now') WHERE user_id = ? AND read_at IS NULL`).bind(user.id).run()
  return c.json({ ok: true, data: { ok: true } })
})

// POST /notifications/subscribe   { channel, token }
notifications.post('/notifications/subscribe', async (c) => {
  const user = c.var.user!
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.channel !== 'string' || typeof body.token !== 'string') {
    return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'Thiếu channel hoặc token' } }, 400)
  }
  const id = newUuid()
  await c.env.DB
    .prepare(`INSERT INTO notification_subscriptions (id, user_id, channel, token) VALUES (?, ?, ?, ?)`)
    .bind(id, user.id, body.channel, body.token)
    .run()
  const row = await c.env.DB.prepare('SELECT * FROM notification_subscriptions WHERE id = ?').bind(id).first()
  return c.json({ ok: true, data: row }, 201)
})

// ---------------------------------------------------------------------------
// GET /audit   ?actor=&action=&obj=&from=&to=&limit=   (audit.read or super)
// ---------------------------------------------------------------------------
notifications.get('/audit', requirePermission('audit.read'), async (c) => {
  const actor = c.req.query('actor')
  const action = c.req.query('action')
  const obj = c.req.query('obj')
  const from = c.req.query('from')
  const to = c.req.query('to')
  const limit = Math.min(Number(c.req.query('limit') ?? 100), 1000)
  let sql = 'SELECT * FROM audit_log WHERE 1=1'
  const binds: any[] = []
  if (actor) { sql += ' AND actor_id = ?'; binds.push(actor) }
  if (action) { sql += ' AND action = ?'; binds.push(action) }
  if (obj) { sql += ' AND (object_type = ? OR object_label LIKE ?)'; binds.push(obj, `%${obj}%`) }
  if (from) { sql += ' AND created_at >= ?'; binds.push(from) }
  if (to) { sql += ' AND created_at <= ?'; binds.push(to) }
  sql += ' ORDER BY created_at DESC LIMIT ?'
  binds.push(limit)
  const { results } = await c.env.DB.prepare(sql).bind(...binds).all()
  return c.json({ ok: true, data: results })
})

// GET /audit/export  ?format=csv|xlsx  (csv only for now — xlsx needs a lib, deferred)
notifications.get('/audit/export', requirePermission('audit.read'), async (c) => {
  const format = c.req.query('format') ?? 'csv'
  const { results } = await c.env.DB.prepare('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 5000').all<any>()
  if (format === 'xlsx') {
    return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'Định dạng xlsx chưa hỗ trợ, dùng csv' } }, 400)
  }
  const header = 'id,actor_id,action,object_label,object_type,object_id,detail,ip,created_at'
  const rows = results.map((r) =>
    [r.id, r.actor_id, r.action, r.object_label, r.object_type, r.object_id, r.detail, r.ip, r.created_at]
      .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
      .join(',')
  )
  const csv = [header, ...rows].join('\n')
  return c.body(csv, 200, { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="audit_log.csv"' })
})

export default notifications
