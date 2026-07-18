// Camera Security Subsystem — live-feed viewing for chung cư (residential
// sites) and công trường (construction sites). Cloudflare Workers never
// decode/relay the actual video: each camera row stores either an `hls_url`
// (.m3u8 — played client-side with hls.js) or an `embed_url` (iframe/player
// URL from the vendor's own cloud CCTV platform, e.g. Hikvision Hik-Connect,
// EZVIZ, Dahua DMSS). This route only manages the registry + manual security
// alerts/notes raised by duty staff while watching a feed — see migration
// 0006_ai_camera_features.sql.
import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { requireAuth, requirePermission } from '../middleware/auth'
import { newUuid } from '../lib/crypto'
import { insertAuditLog } from '../lib/db'

const cameras = new Hono<AppEnv>()
cameras.use('*', requireAuth)

// GET /cameras?siteId=&kind=  -> list (any authenticated user with camera.view)
cameras.get('/', requirePermission('camera.view'), async (c) => {
  const siteId = c.req.query('siteId')
  const kind = c.req.query('kind')
  const conditions: string[] = []
  const binds: any[] = []
  if (siteId) {
    conditions.push('cam.site_id = ?')
    binds.push(siteId)
  }
  if (kind) {
    conditions.push('cam.kind = ?')
    binds.push(kind)
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const { results } = await c.env.DB
    .prepare(
      `SELECT cam.*, s.name AS site_name, s.risk AS site_risk,
              (SELECT COUNT(*) FROM camera_alerts a WHERE a.camera_id = cam.id AND a.status = 'open') AS open_alerts
       FROM cameras cam LEFT JOIN sites s ON s.id = cam.site_id
       ${where} ORDER BY cam.kind, cam.sort_order, cam.name`
    )
    .bind(...binds)
    .all()
  return c.json({ ok: true, data: results })
})

// GET /cameras/alerts/feed?status=open -> cross-camera alert feed for the
// dashboard/notification bell. Registered BEFORE /:id so 'alerts' isn't
// captured as a camera id.
cameras.get('/alerts/feed', requirePermission('camera.view'), async (c) => {
  const status = c.req.query('status') || 'open'
  const { results } = await c.env.DB
    .prepare(
      `SELECT a.*, cam.name AS camera_name, cam.kind AS camera_kind, s.name AS site_name
       FROM camera_alerts a
       JOIN cameras cam ON cam.id = a.camera_id
       LEFT JOIN sites s ON s.id = cam.site_id
       WHERE a.status = ? ORDER BY a.created_at DESC LIMIT 50`
    )
    .bind(status)
    .all()
  return c.json({ ok: true, data: results })
})

// GET /cameras/:id -> single camera + recent alerts
cameras.get('/:id', requirePermission('camera.view'), async (c) => {
  const id = c.req.param('id')
  const cam = await c.env.DB
    .prepare(`SELECT cam.*, s.name AS site_name FROM cameras cam LEFT JOIN sites s ON s.id = cam.site_id WHERE cam.id = ?`)
    .bind(id)
    .first()
  if (!cam) return c.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy camera' } }, 404)
  const { results: alerts } = await c.env.DB
    .prepare('SELECT * FROM camera_alerts WHERE camera_id = ? ORDER BY created_at DESC LIMIT 20')
    .bind(id)
    .all()
  return c.json({ ok: true, data: { ...cam, alerts } })
})

// POST /cameras  { siteId, name, kind, hlsUrl?, embedUrl?, vendor?, locationNote? }
cameras.post('/', requirePermission('camera.manage'), async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.name !== 'string' || !body.name.trim()) {
    return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'Thiếu tên camera' } }, 400)
  }
  if (!body.hlsUrl && !body.embedUrl) {
    return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'Cần ít nhất 1 URL luồng (HLS hoặc Embed)' } }, 400)
  }
  // BUGFIX: cameras.site_id has FOREIGN KEY REFERENCES sites(id). If the caller
  // supplied a siteId that doesn't exist, inserting it raw would throw an
  // unhandled D1 FOREIGN KEY constraint error -> generic 500. Reject explicitly.
  if (body.siteId) {
    const site = await c.env.DB.prepare('SELECT id FROM sites WHERE id = ?').bind(body.siteId).first()
    if (!site) return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'siteId không tồn tại' } }, 400)
  }
  const user = c.var.user!
  const id = newUuid()
  await c.env.DB
    .prepare(
      `INSERT INTO cameras (id, site_id, name, stream_url, hls_url, embed_url, kind, vendor, location_note, status, sort_order, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'online', ?, ?)`
    )
    .bind(
      id,
      body.siteId ?? null,
      body.name.trim(),
      body.streamUrl ?? null,
      body.hlsUrl ?? null,
      body.embedUrl ?? null,
      body.kind === 'residential' ? 'residential' : 'construction',
      body.vendor ?? null,
      body.locationNote ?? null,
      body.sortOrder ?? 0,
      user.id
    )
    .run()
  await insertAuditLog(c.env.DB, { id: newUuid(), actorId: user.id, action: 'create', objectType: 'camera', objectId: id, objectLabel: body.name.trim() })
  const row = await c.env.DB.prepare('SELECT * FROM cameras WHERE id = ?').bind(id).first()
  return c.json({ ok: true, data: row }, 201)
})

// PATCH /cameras/:id  { name?, siteId?, kind?, hlsUrl?, embedUrl?, vendor?, locationNote?, status?, sortOrder? }
cameras.patch('/:id', requirePermission('camera.manage'), async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => null)
  const existing: any = await c.env.DB.prepare('SELECT * FROM cameras WHERE id = ?').bind(id).first()
  if (!existing) return c.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy camera' } }, 404)
  // BUGFIX: same FK risk as POST / — validate siteId before UPDATE if provided.
  if (body?.siteId) {
    const site = await c.env.DB.prepare('SELECT id FROM sites WHERE id = ?').bind(body.siteId).first()
    if (!site) return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'siteId không tồn tại' } }, 400)
  }
  const user = c.var.user!
  await c.env.DB
    .prepare(
      `UPDATE cameras SET
        name = ?, site_id = ?, kind = ?, stream_url = ?, hls_url = ?, embed_url = ?,
        vendor = ?, location_note = ?, status = ?, sort_order = ?, updated_at = datetime('now')
       WHERE id = ?`
    )
    .bind(
      body?.name ?? existing.name,
      body?.siteId ?? existing.site_id,
      body?.kind ?? existing.kind,
      body?.streamUrl ?? existing.stream_url,
      body?.hlsUrl ?? existing.hls_url,
      body?.embedUrl ?? existing.embed_url,
      body?.vendor ?? existing.vendor,
      body?.locationNote ?? existing.location_note,
      body?.status ?? existing.status,
      body?.sortOrder ?? existing.sort_order,
      id
    )
    .run()
  await insertAuditLog(c.env.DB, { id: newUuid(), actorId: user.id, action: 'update', objectType: 'camera', objectId: id, objectLabel: body?.name ?? existing.name })
  const row = await c.env.DB.prepare('SELECT * FROM cameras WHERE id = ?').bind(id).first()
  return c.json({ ok: true, data: row })
})

// DELETE /cameras/:id
cameras.delete('/:id', requirePermission('camera.manage'), async (c) => {
  const id = c.req.param('id')
  const existing: any = await c.env.DB.prepare('SELECT * FROM cameras WHERE id = ?').bind(id).first()
  if (!existing) return c.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy camera' } }, 404)
  const user = c.var.user!
  await c.env.DB.prepare('DELETE FROM camera_alerts WHERE camera_id = ?').bind(id).run()
  await c.env.DB.prepare('DELETE FROM cameras WHERE id = ?').bind(id).run()
  await insertAuditLog(c.env.DB, { id: newUuid(), actorId: user.id, action: 'delete', objectType: 'camera', objectId: id, objectLabel: existing.name })
  return c.json({ ok: true, data: { id } })
})

// POST /cameras/:id/alerts  { severity, message } -> raise a manual security alert
cameras.post('/:id/alerts', requirePermission('camera.view'), async (c) => {
  const cameraId = c.req.param('id')
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.message !== 'string' || !body.message.trim()) {
    return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'Thiếu nội dung cảnh báo' } }, 400)
  }
  const cam: any = await c.env.DB.prepare('SELECT * FROM cameras WHERE id = ?').bind(cameraId).first()
  if (!cam) return c.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy camera' } }, 404)
  const user = c.var.user!
  const id = newUuid()
  const severity = ['info', 'warn', 'crit'].includes(body.severity) ? body.severity : 'info'
  await c.env.DB
    .prepare(`INSERT INTO camera_alerts (id, camera_id, raised_by, severity, message) VALUES (?, ?, ?, ?, ?)`)
    .bind(id, cameraId, user.id, severity, body.message.trim())
    .run()
  await insertAuditLog(c.env.DB, {
    id: newUuid(),
    actorId: user.id,
    action: 'create',
    objectType: 'camera_alert',
    objectId: id,
    objectLabel: `${cam.name}: ${body.message.trim()}`,
  })
  const row = await c.env.DB.prepare('SELECT * FROM camera_alerts WHERE id = ?').bind(id).first()
  return c.json({ ok: true, data: row }, 201)
})

// PATCH /cameras/:camId/alerts/:alertId  { status: 'resolved' }
cameras.patch('/:camId/alerts/:alertId', requirePermission('camera.manage'), async (c) => {
  const alertId = c.req.param('alertId')
  const existing: any = await c.env.DB.prepare('SELECT * FROM camera_alerts WHERE id = ?').bind(alertId).first()
  if (!existing) return c.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy cảnh báo' } }, 404)
  const user = c.var.user!
  await c.env.DB
    .prepare(`UPDATE camera_alerts SET status = 'resolved', resolved_at = datetime('now'), resolved_by = ? WHERE id = ?`)
    .bind(user.id, alertId)
    .run()
  const row = await c.env.DB.prepare('SELECT * FROM camera_alerts WHERE id = ?').bind(alertId).first()
  return c.json({ ok: true, data: row })
})

export default cameras
