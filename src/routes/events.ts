// Events & Tasks (Activation) routes per docs/API-CONTRACT.md §5 + §8 (event
// logs are tightly coupled to a single event, so they live here rather than
// a separate file). Mirrors ctg-core.js#generateTasksForLevel / setScenario
// activation flow, but persists everything to D1 instead of window.STATE.
import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { requireAuth, requirePermission, requireAnyPermission } from '../middleware/auth'
import { newUuid } from '../lib/crypto'
import { insertAuditLog } from '../lib/db'

const events = new Hono<AppEnv>()

events.use('*', requireAuth)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function nextTaskCode(db: D1Database, eventId: string): Promise<string> {
  const row = await db.prepare('SELECT COUNT(*) c FROM tasks WHERE event_id = ?').bind(eventId).first<{ c: number }>()
  const n = (row?.c ?? 0) + 1
  // tasks.code is globally UNIQUE — prefix with a slice of the event id.
  return `TSK-${eventId.slice(0, 8)}-${String(n).padStart(3, '0')}`
}

function hoursFromOffset(offHours: number | null | undefined): number {
  const h = Math.abs(offHours ?? 6) || 6
  return Math.max(1, Math.min(72, h))
}

// ---------------------------------------------------------------------------
// POST /events/activate  { level, type, name, wind, hours, scenarioId } -> Event { tasks[] }
// Requires 'activate' permission (bch, super).
// ---------------------------------------------------------------------------
events.post('/events/activate', requireAnyPermission('activate'), async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.level !== 'number' || typeof body.name !== 'string') {
    return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'Thiếu level hoặc name' } }, 400)
  }
  const idempotencyKey = c.req.header('Idempotency-Key') || body.idempotencyKey || null
  const db = c.env.DB
  const user = c.var.user!

  if (idempotencyKey) {
    const existing = await db.prepare('SELECT id FROM events WHERE idempotency_key = ?').bind(idempotencyKey).first<{ id: string }>()
    if (existing) {
      const full = await buildEventPayload(db, existing.id)
      return c.json({ ok: true, data: full })
    }
  }

  const eventId = newUuid()
  const level = body.level as number
  const type = body.type ?? 'other'

  await db
    .prepare(
      `INSERT INTO events (id, code, type, name, level, scenario_id, wind_speed, hours, status, activated_by, idempotency_key)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`
    )
    .bind(eventId, body.code ?? null, type, body.name, level, body.scenarioId ?? null, body.wind ?? null, body.hours ?? null, user.id, idempotencyKey)
    .run()

  // Generate tasks from task_templates whose min_level <= level (mirrors
  // generateTasksForLevel: pick eligible templates, prefer higher levels first,
  // cap at 28 for parity with the prototype's demo dataset density).
  const { results: templates } = await db
    .prepare('SELECT * FROM task_templates WHERE active = 1 AND min_level <= ? ORDER BY min_level DESC LIMIT 28')
    .bind(level)
    .all<any>()

  const { results: phaseRows } = await db.prepare('SELECT id, off_hours FROM phases').all<{ id: string; off_hours: number }>()
  const phaseOffsets = new Map(phaseRows.map((p) => [p.id, p.off_hours]))

  const eventShort = eventId.slice(0, 8)
  const createdTasks: any[] = []
  let i = 0
  for (const t of templates) {
    i++
    const taskId = newUuid()
    // tasks.code is globally UNIQUE (not per-event) — prefix with a slice of
    // the event id to guarantee uniqueness across concurrently-active events.
    const code = `TSK-${eventShort}-${String(i).padStart(3, '0')}`
    const unitCode = t.unit_code ?? null
    // pick an owner: first active user in that unit, else null (unassigned)
    let owner: { id: string } | null = null
    if (unitCode) {
      owner = await db.prepare('SELECT id FROM users WHERE unit_code = ? AND active = 1 LIMIT 1').bind(unitCode).first<{ id: string }>()
    }
    const hours = hoursFromOffset(phaseOffsets.get(t.phase_id ?? '') ?? 6)
    const deadline = new Date(Date.now() + hours * 3600 * 1000).toISOString()

    await db
      .prepare(
        `INSERT INTO tasks (id, code, event_id, template_id, unit_code, owner_id, title, description, phase_id, deadline, status, level)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'issued', ?)`
      )
      .bind(
        taskId, code, eventId, t.id, unitCode, owner?.id ?? null, t.title,
        [t.suggested_owner ? `Người thực hiện gợi ý: ${t.suggested_owner}` : null, t.suggested_checker ? `Kiểm tra: ${t.suggested_checker}` : null, t.note].filter(Boolean).join(' · ') || null,
        t.phase_id, deadline, level
      )
      .run()

    createdTasks.push({ id: taskId, code, ownerId: owner?.id ?? null, title: t.title })

    if (owner) {
      await db
        .prepare(
          `INSERT INTO notifications (id, user_id, kind, title, body, ref_type, ref_id) VALUES (?, ?, 'task', ?, ?, 'task', ?)`
        )
        .bind(newUuid(), owner.id, `Bạn được giao: ${t.title}`, `Deadline: ${deadline}`, taskId)
        .run()
    }
  }

  await db
    .prepare(`INSERT INTO event_logs (id, event_id, author_id, level, message) VALUES (?, ?, ?, 'crit', ?)`)
    .bind(newUuid(), eventId, user.id, `Kích hoạt sự kiện: ${body.name} (Cấp ${level}).`)
    .run()
  await db
    .prepare(`INSERT INTO event_logs (id, event_id, author_id, level, message) VALUES (?, ?, ?, 'info', ?)`)
    .bind(newUuid(), eventId, user.id, `Phát ${createdTasks.length} nhiệm vụ tới các đầu mối.`)
    .run()

  await insertAuditLog(db, {
    id: newUuid(),
    actorId: user.id,
    action: 'activate',
    objectLabel: body.name,
    objectType: 'event',
    objectId: eventId,
    detail: `Kích hoạt cấp ${level}, ${createdTasks.length} nhiệm vụ`,
    ip: c.req.header('CF-Connecting-IP') ?? null,
    userAgent: c.req.header('User-Agent') ?? null,
  })

  const full = await buildEventPayload(db, eventId)
  return c.json({ ok: true, data: full }, 201)
})

// ---------------------------------------------------------------------------
// POST /events/:id/deactivate
// ---------------------------------------------------------------------------
events.post('/events/:id/deactivate', requireAnyPermission('activate'), async (c) => {
  const id = c.req.param('id')
  const db = c.env.DB
  const user = c.var.user!
  const existing = await db.prepare('SELECT * FROM events WHERE id = ?').bind(id).first()
  if (!existing) return c.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy sự kiện' } }, 404)

  await db
    .prepare(`UPDATE events SET status = 'deactivated', deactivated_by = ?, deactivated_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`)
    .bind(user.id, id)
    .run()
  await db
    .prepare(`INSERT INTO event_logs (id, event_id, author_id, level, message) VALUES (?, ?, ?, 'info', 'Đã hạ cấp / kết thúc sự kiện.')`)
    .bind(newUuid(), id, user.id)
    .run()
  await insertAuditLog(db, { id: newUuid(), actorId: user.id, action: 'deactivate', objectType: 'event', objectId: id, objectLabel: (existing as any).name })

  const full = await buildEventPayload(db, id)
  return c.json({ ok: true, data: full })
})

// ---------------------------------------------------------------------------
// GET /events   ?active=&from=&to=
// ---------------------------------------------------------------------------
events.get('/events', async (c) => {
  const active = c.req.query('active')
  const from = c.req.query('from')
  const to = c.req.query('to')
  let sql = 'SELECT * FROM events WHERE 1=1'
  const binds: any[] = []
  if (active === 'true') { sql += " AND status = 'active'"; }
  if (active === 'false') { sql += " AND status != 'active'"; }
  if (from) { sql += ' AND activated_at >= ?'; binds.push(from) }
  if (to) { sql += ' AND activated_at <= ?'; binds.push(to) }
  sql += ' ORDER BY activated_at DESC'
  const { results } = await c.env.DB.prepare(sql).bind(...binds).all()
  return c.json({ ok: true, data: results })
})

// ---------------------------------------------------------------------------
// GET /events/:id  -> Event + tasks + logs + kpi
// ---------------------------------------------------------------------------
events.get('/events/:id', async (c) => {
  const id = c.req.param('id')
  const full = await buildEventPayload(c.env.DB, id)
  if (!full) return c.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy sự kiện' } }, 404)
  return c.json({ ok: true, data: full })
})

async function buildEventPayload(db: D1Database, id: string) {
  const event = await db.prepare('SELECT * FROM events WHERE id = ?').bind(id).first<any>()
  if (!event) return null
  const { results: tasks } = await db.prepare('SELECT * FROM tasks WHERE event_id = ? ORDER BY created_at').bind(id).all()
  const { results: logs } = await db.prepare('SELECT * FROM event_logs WHERE event_id = ? ORDER BY created_at DESC LIMIT 50').bind(id).all()
  const total = tasks.length
  const done = tasks.filter((t: any) => t.status === 'done').length
  const doing = tasks.filter((t: any) => t.status === 'doing').length
  const ack = tasks.filter((t: any) => t.status === 'ack').length
  const overdue = tasks.filter((t: any) => t.status !== 'done' && t.deadline && new Date(t.deadline).getTime() < Date.now()).length
  return { ...event, tasks, logs, kpi: { total, done, doing, ack, overdue, pctDone: total ? Math.round((done / total) * 100) : 0 } }
}

// ---------------------------------------------------------------------------
// GET /events/:id/tasks   ?phase=&owner=&status=
// ---------------------------------------------------------------------------
events.get('/events/:id/tasks', async (c) => {
  const id = c.req.param('id')
  const phase = c.req.query('phase')
  const owner = c.req.query('owner')
  const status = c.req.query('status')
  let sql = 'SELECT * FROM tasks WHERE event_id = ?'
  const binds: any[] = [id]
  if (phase) { sql += ' AND phase_id = ?'; binds.push(phase) }
  if (owner) { sql += ' AND owner_id = ?'; binds.push(owner) }
  if (status) { sql += ' AND status = ?'; binds.push(status) }
  sql += ' ORDER BY created_at'
  const { results } = await c.env.DB.prepare(sql).bind(...binds).all()
  return c.json({ ok: true, data: results })
})

// ---------------------------------------------------------------------------
// POST /events/:id/tasks   -> 201 Task (ad-hoc, outside template library)
// ---------------------------------------------------------------------------
events.post('/events/:id/tasks', requireAnyPermission('activate', 'assign.tasks'), async (c) => {
  const eventId = c.req.param('id')
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.title !== 'string') {
    return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'Thiếu title' } }, 400)
  }
  const eventRow = await c.env.DB.prepare('SELECT level FROM events WHERE id = ?').bind(eventId).first<{ level: number }>()
  if (!eventRow) return c.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy sự kiện' } }, 404)

  const taskId = newUuid()
  const code = await nextTaskCode(c.env.DB, eventId)
  await c.env.DB
    .prepare(
      `INSERT INTO tasks (id, code, event_id, unit_code, owner_id, checker_id, title, description, phase_id, deadline, level)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(taskId, code, eventId, body.unitCode ?? null, body.ownerId ?? null, body.checkerId ?? null, body.title, body.description ?? null, body.phaseId ?? null, body.deadline ?? null, eventRow.level)
    .run()

  if (body.ownerId) {
    await c.env.DB
      .prepare(`INSERT INTO notifications (id, user_id, kind, title, body, ref_type, ref_id) VALUES (?, ?, 'task', ?, ?, 'task', ?)`)
      .bind(newUuid(), body.ownerId, `Bạn được giao: ${body.title}`, body.description ?? '', taskId)
      .run()
  }

  const row = await c.env.DB.prepare('SELECT * FROM tasks WHERE id = ?').bind(taskId).first()
  return c.json({ ok: true, data: row }, 201)
})

// ---------------------------------------------------------------------------
// PATCH /events/:id/tasks/:tid   { status?, note?, deadline? }
// ---------------------------------------------------------------------------
events.patch('/events/:id/tasks/:tid', async (c) => {
  const { id: eventId, tid } = c.req.param()
  const body = await c.req.json().catch(() => null)
  const existing: any = await c.env.DB.prepare('SELECT * FROM tasks WHERE id = ? AND event_id = ?').bind(tid, eventId).first()
  if (!existing) return c.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy nhiệm vụ' } }, 404)

  const user = c.var.user!
  const isOwner = existing.owner_id === user.id
  const canManage = user.permissions.includes('*') || user.permissions.includes('activate') || user.permissions.includes('assign.tasks')
  if (!isOwner && !canManage) {
    return c.json({ ok: false, error: { code: 'INSUFFICIENT_PERMISSIONS', message: 'Không có quyền cập nhật nhiệm vụ này' } }, 403)
  }

  const status = body?.status ?? existing.status
  const note = body?.note ?? existing.note
  const deadline = body?.deadline ?? existing.deadline
  const progress = body?.progress ?? existing.progress
  const ackAt = status === 'ack' && existing.status !== 'ack' ? new Date().toISOString() : existing.ack_at
  const doneAt = status === 'done' && existing.status !== 'done' ? new Date().toISOString() : existing.done_at

  await c.env.DB
    .prepare(`UPDATE tasks SET status=?, note=?, deadline=?, progress=?, ack_at=?, done_at=?, updated_at=datetime('now') WHERE id=?`)
    .bind(status, note, deadline, progress, ackAt, doneAt, tid)
    .run()

  const row = await c.env.DB.prepare('SELECT * FROM tasks WHERE id = ?').bind(tid).first()
  return c.json({ ok: true, data: row })
})

// ---------------------------------------------------------------------------
// POST /events/:id/tasks/:tid/ack
// ---------------------------------------------------------------------------
events.post('/events/:id/tasks/:tid/ack', async (c) => {
  const { id: eventId, tid } = c.req.param()
  const existing: any = await c.env.DB.prepare('SELECT * FROM tasks WHERE id = ? AND event_id = ?').bind(tid, eventId).first()
  if (!existing) return c.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy nhiệm vụ' } }, 404)
  const user = c.var.user!
  if (existing.owner_id !== user.id && !user.permissions.includes('*') && !user.permissions.includes('activate')) {
    return c.json({ ok: false, error: { code: 'INSUFFICIENT_PERMISSIONS', message: 'Chỉ người được giao mới ack được' } }, 403)
  }
  await c.env.DB
    .prepare(`UPDATE tasks SET status='ack', ack_at=datetime('now'), updated_at=datetime('now') WHERE id=?`)
    .bind(tid)
    .run()
  const row = await c.env.DB.prepare('SELECT * FROM tasks WHERE id = ?').bind(tid).first()
  return c.json({ ok: true, data: row })
})

// ---------------------------------------------------------------------------
// POST /events/:id/tasks/:tid/done   multipart evidence -> Task + photos[]
// ---------------------------------------------------------------------------
events.post('/events/:id/tasks/:tid/done', async (c) => {
  const { id: eventId, tid } = c.req.param()
  const existing: any = await c.env.DB.prepare('SELECT * FROM tasks WHERE id = ? AND event_id = ?').bind(tid, eventId).first()
  if (!existing) return c.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy nhiệm vụ' } }, 404)
  const user = c.var.user!
  if (existing.owner_id !== user.id && !user.permissions.includes('*') && !user.permissions.includes('activate')) {
    return c.json({ ok: false, error: { code: 'INSUFFICIENT_PERMISSIONS', message: 'Chỉ người được giao mới hoàn thành được' } }, 403)
  }

  const contentType = c.req.header('Content-Type') || ''
  const evidence: any[] = []
  if (contentType.includes('multipart/form-data')) {
    const form = await c.req.formData()
    for (const [key, value] of form.entries()) {
      if (value instanceof File) {
        const ext = value.name.split('.').pop() || 'bin'
        const r2Key = `task-evidence/${tid}/${newUuid()}.${ext}`
        await c.env.R2.put(r2Key, await value.arrayBuffer(), { httpMetadata: { contentType: value.type || 'application/octet-stream' } })
        const evId = newUuid()
        await c.env.DB
          .prepare(`INSERT INTO task_evidence (id, task_id, kind, r2_key, uploaded_by) VALUES (?, ?, 'photo', ?, ?)`)
          .bind(evId, tid, r2Key, user.id)
          .run()
        evidence.push({ id: evId, r2Key, key })
      }
    }
  }

  await c.env.DB
    .prepare(`UPDATE tasks SET status='done', progress=100, done_at=datetime('now'), updated_at=datetime('now') WHERE id=?`)
    .bind(tid)
    .run()

  const row = await c.env.DB.prepare('SELECT * FROM tasks WHERE id = ?').bind(tid).first()
  return c.json({ ok: true, data: { ...row, evidence } })
})

// ---------------------------------------------------------------------------
// POST /events/:id/tasks/:tid/reassign   { ownerId }
// ---------------------------------------------------------------------------
events.post('/events/:id/tasks/:tid/reassign', requireAnyPermission('activate', 'assign.tasks'), async (c) => {
  const { id: eventId, tid } = c.req.param()
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.ownerId !== 'string') {
    return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'Thiếu ownerId' } }, 400)
  }
  const existing = await c.env.DB.prepare('SELECT * FROM tasks WHERE id = ? AND event_id = ?').bind(tid, eventId).first()
  if (!existing) return c.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy nhiệm vụ' } }, 404)

  await c.env.DB.prepare(`UPDATE tasks SET owner_id = ?, updated_at = datetime('now') WHERE id = ?`).bind(body.ownerId, tid).run()
  await c.env.DB
    .prepare(`INSERT INTO notifications (id, user_id, kind, title, body, ref_type, ref_id) VALUES (?, ?, 'task', ?, ?, 'task', ?)`)
    .bind(newUuid(), body.ownerId, `Bạn được chuyển giao nhiệm vụ: ${(existing as any).title}`, '', tid)
    .run()

  const row = await c.env.DB.prepare('SELECT * FROM tasks WHERE id = ?').bind(tid).first()
  return c.json({ ok: true, data: row })
})

// ---------------------------------------------------------------------------
// GET /events/:id/logs   ?level=&author=&from=&to=&limit=
// POST /events/:id/logs  { msg, level } -> LogEntry
// ---------------------------------------------------------------------------
events.get('/events/:id/logs', async (c) => {
  const id = c.req.param('id')
  const level = c.req.query('level')
  const author = c.req.query('author')
  const from = c.req.query('from')
  const to = c.req.query('to')
  const limit = Math.min(Number(c.req.query('limit') ?? 100), 500)
  let sql = 'SELECT * FROM event_logs WHERE event_id = ?'
  const binds: any[] = [id]
  if (level) { sql += ' AND level = ?'; binds.push(level) }
  if (author) { sql += ' AND author_id = ?'; binds.push(author) }
  if (from) { sql += ' AND created_at >= ?'; binds.push(from) }
  if (to) { sql += ' AND created_at <= ?'; binds.push(to) }
  sql += ' ORDER BY created_at DESC LIMIT ?'
  binds.push(limit)
  const { results } = await c.env.DB.prepare(sql).bind(...binds).all()
  return c.json({ ok: true, data: results })
})

events.post('/events/:id/logs', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.msg !== 'string') {
    return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'Thiếu msg' } }, 400)
  }
  const user = c.var.user!
  const logId = newUuid()
  await c.env.DB
    .prepare(`INSERT INTO event_logs (id, event_id, author_id, level, message) VALUES (?, ?, ?, ?, ?)`)
    .bind(logId, id, user.id, body.level ?? 'info', body.msg)
    .run()
  const row = await c.env.DB.prepare('SELECT * FROM event_logs WHERE id = ?').bind(logId).first()
  return c.json({ ok: true, data: row }, 201)
})

export default events
