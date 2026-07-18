// Incidents (Báo sự cố khẩn) per docs/API-CONTRACT.md §6. Mirrors
// ctg-core.js#reportFireAt: creating an incident auto-generates an Event
// (level 3 / ĐỎ by default for fire/flood) + tasks from the task library,
// exactly like /events/activate, so we delegate to the same task-generation
// logic conceptually (duplicated here in compact form to avoid a circular
// import between events.ts and incidents.ts).
import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { requireAuth } from '../middleware/auth'
import { newUuid } from '../lib/crypto'
import { insertAuditLog } from '../lib/db'

const incidents = new Hono<AppEnv>()
incidents.use('*', requireAuth)

// POST /incidents  { type, siteId, desc } -> Incident + auto Event + tasks[]
incidents.post('/', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.type !== 'string') {
    return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'Thiếu type' } }, 400)
  }
  const db = c.env.DB
  const user = c.var.user!
  const level = body.level ?? 3 // fire/flood default to Cấp 3 ĐỎ per prototype's reportFireAt

  // BUGFIX: events.level has FOREIGN KEY REFERENCES levels(k), valid range 0-4.
  // An out-of-range level (e.g. negative, or > 4) previously hit an unhandled
  // D1 FK constraint error -> generic 500. Validate explicitly.
  if (!Number.isInteger(level) || level < 0 || level > 4) {
    return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'level phải là số nguyên từ 0 đến 4' } }, 400)
  }

  const eventId = newUuid()
  const site = body.siteId ? await db.prepare('SELECT * FROM sites WHERE id = ?').bind(body.siteId).first<any>() : null
  // BUGFIX: incidents.site_id has a FOREIGN KEY constraint to sites(id). If the
  // caller supplied a siteId that doesn't exist, inserting it raw would throw an
  // unhandled D1 FOREIGN KEY constraint error -> generic 500. Reject explicitly.
  if (body.siteId && !site) {
    return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'siteId không tồn tại' } }, 400)
  }
  const eventName = body.eventName || (site ? `${body.type === 'fire' ? 'Cháy' : 'Sự cố'} tại ${site.name}` : `Sự cố ${body.type}`)

  await db
    .prepare(`INSERT INTO events (id, type, name, level, status, activated_by) VALUES (?, ?, ?, ?, 'active', ?)`)
    .bind(eventId, body.type, eventName, level, user.id)
    .run()

  const { results: templates } = await db
    .prepare('SELECT * FROM task_templates WHERE active = 1 AND min_level <= ? ORDER BY min_level DESC LIMIT 12')
    .bind(level)
    .all<any>()

  const eventShort = eventId.slice(0, 8)
  const createdTasks: any[] = []
  let i = 0
  for (const t of templates) {
    i++
    const taskId = newUuid()
    let owner: { id: string } | null = null
    if (t.unit_code) owner = await db.prepare('SELECT id FROM users WHERE unit_code = ? AND active = 1 LIMIT 1').bind(t.unit_code).first<{ id: string }>()
    const deadline = new Date(Date.now() + 6 * 3600 * 1000).toISOString()
    // tasks.code is globally UNIQUE — prefix with a slice of the event id.
    await db
      .prepare(
        `INSERT INTO tasks (id, code, event_id, template_id, unit_code, owner_id, title, phase_id, deadline, status, level)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'issued', ?)`
      )
      .bind(taskId, `TSK-${eventShort}-${String(i).padStart(3, '0')}`, eventId, t.id, t.unit_code, owner?.id ?? null, t.title, t.phase_id, deadline, level)
      .run()
    createdTasks.push({ id: taskId, title: t.title, ownerId: owner?.id ?? null })
  }

  const incidentId = newUuid()
  await db
    .prepare(
      `INSERT INTO incidents (id, type, site_id, description, status, event_id, reported_by) VALUES (?, ?, ?, ?, 'open', ?, ?)`
    )
    .bind(incidentId, body.type, body.siteId ?? null, body.desc ?? null, eventId, user.id)
    .run()

  await db
    .prepare(`INSERT INTO event_logs (id, event_id, author_id, level, message) VALUES (?, ?, ?, 'crit', ?)`)
    .bind(newUuid(), eventId, user.id, `Báo sự cố: ${eventName}. ${body.desc ?? ''}`)
    .run()

  await insertAuditLog(db, { id: newUuid(), actorId: user.id, action: 'create', objectType: 'incident', objectId: incidentId, objectLabel: eventName })

  const incident = await db.prepare('SELECT * FROM incidents WHERE id = ?').bind(incidentId).first()
  return c.json({ ok: true, data: { ...incident, event: { id: eventId, name: eventName, level }, tasks: createdTasks } }, 201)
})

// GET /incidents/:id  -> Incident + timeline
incidents.get('/:id', async (c) => {
  const id = c.req.param('id')
  const incident: any = await c.env.DB.prepare('SELECT * FROM incidents WHERE id = ?').bind(id).first()
  if (!incident) return c.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy sự cố' } }, 404)
  const logs = incident.event_id
    ? (await c.env.DB.prepare('SELECT * FROM event_logs WHERE event_id = ? ORDER BY created_at').bind(incident.event_id).all()).results
    : []
  return c.json({ ok: true, data: { ...incident, timeline: logs } })
})

// PATCH /incidents/:id  { status, resolution }
incidents.patch('/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => null)
  const existing: any = await c.env.DB.prepare('SELECT * FROM incidents WHERE id = ?').bind(id).first()
  if (!existing) return c.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy sự cố' } }, 404)
  await c.env.DB
    .prepare(`UPDATE incidents SET status=?, resolution=?, updated_at=datetime('now') WHERE id=?`)
    .bind(body?.status ?? existing.status, body?.resolution ?? existing.resolution, id)
    .run()
  const row = await c.env.DB.prepare('SELECT * FROM incidents WHERE id = ?').bind(id).first()
  return c.json({ ok: true, data: row })
})

export default incidents
