// Relief Projects (Cứu trợ) CRUD — core + basic sub-resources, per
// docs/API-CONTRACT.md §15. Full sub-resource set (beneficiaries import,
// approvals, budget/expenses, reports/pdf) implemented for the tables that
// exist in 0003_relief_projects.sql; PDF report generation itself is
// deferred (would need a PDF lib — out of scope for Phase 1, we just persist
// report metadata + accept an already-generated file via R2 upload).
import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { requireAuth, requirePermission, requireAnyPermission } from '../middleware/auth'
import { newUuid } from '../lib/crypto'
import { insertAuditLog } from '../lib/db'

const relief = new Hono<AppEnv>()
relief.use('*', requireAuth)

// BUGFIX: every relief_* sub-resource table has project_id TEXT NOT NULL
// REFERENCES relief_projects(id). None of the sub-resource POST/PATCH routes
// were checking the parent project actually exists (nor is soft-deleted)
// before inserting — an unknown/deleted :id hit an unhandled D1 FOREIGN KEY
// constraint error -> generic 500. Call this first in every mutating
// sub-resource handler and short-circuit with a clean 404 if missing.
async function requireProject(c: any, db: D1Database, id: string) {
  const project = await db.prepare('SELECT id FROM relief_projects WHERE id = ? AND deleted_at IS NULL').bind(id).first<{ id: string }>()
  if (!project) {
    return c.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy dự án cứu trợ' } }, 404)
  }
  return null
}

async function loadProjectFull(db: D1Database, id: string) {
  const project = await db.prepare('SELECT * FROM relief_projects WHERE id = ? AND deleted_at IS NULL').bind(id).first<any>()
  if (!project) return null
  const [priorities, team, vehicles, cargo, itinerary, tasks, approvals] = await Promise.all([
    db.prepare('SELECT label FROM relief_beneficiary_priorities WHERE project_id = ?').bind(id).all(),
    db.prepare('SELECT * FROM relief_team_members WHERE project_id = ?').bind(id).all(),
    db.prepare('SELECT * FROM relief_vehicles WHERE project_id = ?').bind(id).all(),
    db.prepare('SELECT * FROM relief_cargo WHERE project_id = ?').bind(id).all(),
    db.prepare('SELECT * FROM relief_itinerary WHERE project_id = ? ORDER BY day').bind(id).all(),
    db.prepare('SELECT * FROM relief_tasks WHERE project_id = ?').bind(id).all(),
    db.prepare('SELECT * FROM relief_approvals WHERE project_id = ?').bind(id).all(),
  ])
  return {
    ...project,
    beneficiaryPriorities: priorities.results.map((r: any) => r.label),
    team: team.results,
    vehicles: vehicles.results,
    cargo: cargo.results,
    itinerary: itinerary.results,
    tasks: tasks.results,
    approvals: approvals.results,
  }
}

// ---------------------------------------------------------------------------
// GET /relief-projects  ?status=&disaster=&year=
// ---------------------------------------------------------------------------
relief.get('/', async (c) => {
  const status = c.req.query('status')
  const disaster = c.req.query('disaster')
  const year = c.req.query('year')
  let sql = 'SELECT * FROM relief_projects WHERE deleted_at IS NULL'
  const binds: any[] = []
  if (status) { sql += ' AND status = ?'; binds.push(status) }
  if (disaster) { sql += ' AND disaster = ?'; binds.push(disaster) }
  if (year) { sql += " AND strftime('%Y', start_date) = ?"; binds.push(year) }
  sql += ' ORDER BY start_date DESC'
  const { results } = await c.env.DB.prepare(sql).bind(...binds).all()
  return c.json({ ok: true, data: results })
})

// POST /relief-projects -> 201
relief.post('/', requirePermission('relief.manage'), async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.name !== 'string' || typeof body.disaster !== 'string') {
    return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'Thiếu name hoặc disaster' } }, 400)
  }
  const id = newUuid()
  const code = body.code || `CTR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`
  await c.env.DB
    .prepare(
      `INSERT INTO relief_projects (id, code, name, disaster, disaster_label, region_province, region_commune, region_gps, status, priority, start_date, end_date, days, budget_total, beneficiaries_households, beneficiaries_people)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id, code, body.name, body.disaster, body.disasterLabel ?? null, body.regionProvince ?? null, body.regionCommune ?? null,
      body.regionGps ?? null, body.status ?? 'drafting', body.priority ?? 'medium', body.startDate ?? null, body.endDate ?? null,
      body.days ?? null, body.budgetTotal ?? 0, body.beneficiariesHouseholds ?? 0, body.beneficiariesPeople ?? 0
    )
    .run()
  if (Array.isArray(body.beneficiaryPriorities)) {
    for (const label of body.beneficiaryPriorities) {
      await c.env.DB.prepare('INSERT INTO relief_beneficiary_priorities (project_id, label) VALUES (?, ?)').bind(id, label).run()
    }
  }
  await insertAuditLog(c.env.DB, { id: newUuid(), actorId: c.var.user!.id, action: 'create', objectType: 'relief_project', objectId: id, objectLabel: body.name })
  const full = await loadProjectFull(c.env.DB, id)
  return c.json({ ok: true, data: full }, 201)
})

// GET /relief-projects/:id
relief.get('/:id', async (c) => {
  const full = await loadProjectFull(c.env.DB, c.req.param('id'))
  if (!full) return c.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy dự án' } }, 404)
  return c.json({ ok: true, data: full })
})

// PATCH /relief-projects/:id
relief.patch('/:id', requirePermission('relief.manage'), async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => null)
  const existing: any = await c.env.DB.prepare('SELECT * FROM relief_projects WHERE id = ? AND deleted_at IS NULL').bind(id).first()
  if (!existing) return c.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy dự án' } }, 404)

  const fields = [
    'name', 'disaster', 'disaster_label', 'region_province', 'region_commune', 'region_gps', 'status', 'status_label',
    'priority', 'start_date', 'end_date', 'days', 'budget_total', 'budget_donation', 'budget_company', 'budget_sponsor',
    'budget_spent', 'budget_committed', 'beneficiaries_households', 'beneficiaries_people',
    'outcome_households', 'outcome_people', 'outcome_money_distributed', 'outcome_goods_value', 'outcome_lives_impacted', 'outcome_press_coverage',
  ]
  const camel = (s: string) => s.replace(/_([a-z])/g, (_, ch) => ch.toUpperCase())
  const sets: string[] = []
  const binds: any[] = []
  for (const f of fields) {
    const key = camel(f)
    if (body && body[key] !== undefined) {
      sets.push(`${f} = ?`)
      binds.push(body[key])
    }
  }
  if (sets.length) {
    sets.push("updated_at = datetime('now')")
    await c.env.DB.prepare(`UPDATE relief_projects SET ${sets.join(', ')} WHERE id = ?`).bind(...binds, id).run()
  }
  await insertAuditLog(c.env.DB, { id: newUuid(), actorId: c.var.user!.id, action: 'update', objectType: 'relief_project', objectId: id, objectLabel: existing.name })
  const full = await loadProjectFull(c.env.DB, id)
  return c.json({ ok: true, data: full })
})

// DELETE /relief-projects/:id  (soft delete)
relief.delete('/:id', requirePermission('relief.manage'), async (c) => {
  const id = c.req.param('id')
  const existing: any = await c.env.DB.prepare('SELECT * FROM relief_projects WHERE id = ? AND deleted_at IS NULL').bind(id).first()
  if (!existing) return c.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy dự án' } }, 404)
  await c.env.DB.prepare(`UPDATE relief_projects SET deleted_at = datetime('now') WHERE id = ?`).bind(id).run()
  await insertAuditLog(c.env.DB, { id: newUuid(), actorId: c.var.user!.id, action: 'delete', objectType: 'relief_project', objectId: id, objectLabel: existing.name })
  return c.body(null, 204)
})

// ---------------------------------------------------------------------------
// Team members
// ---------------------------------------------------------------------------
relief.get('/:id/team', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM relief_team_members WHERE project_id = ?').bind(c.req.param('id')).all()
  return c.json({ ok: true, data: results })
})
relief.post('/:id/team', requirePermission('relief.manage'), async (c) => {
  const id = c.req.param('id')
  const notFound = await requireProject(c, c.env.DB, id)
  if (notFound) return notFound
  const body = await c.req.json().catch(() => null)
  // BUGFIX: person_id has FK REFERENCES users(id) — validate before insert.
  if (body?.personId) {
    const person = await c.env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(body.personId).first()
    if (!person) return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'personId không tồn tại' } }, 400)
  }
  const memberId = newUuid()
  await c.env.DB
    .prepare('INSERT INTO relief_team_members (id, project_id, person_id, role_label, phone) VALUES (?, ?, ?, ?, ?)')
    .bind(memberId, id, body?.personId ?? null, body?.roleLabel ?? body?.role ?? null, body?.phone ?? null)
    .run()
  const row = await c.env.DB.prepare('SELECT * FROM relief_team_members WHERE id = ?').bind(memberId).first()
  return c.json({ ok: true, data: row }, 201)
})
relief.delete('/:id/team/:memberId', requirePermission('relief.manage'), async (c) => {
  await c.env.DB.prepare('DELETE FROM relief_team_members WHERE id = ? AND project_id = ?').bind(c.req.param('memberId'), c.req.param('id')).run()
  return c.body(null, 204)
})

// ---------------------------------------------------------------------------
// Vehicles
// ---------------------------------------------------------------------------
relief.get('/:id/vehicles', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM relief_vehicles WHERE project_id = ?').bind(c.req.param('id')).all()
  return c.json({ ok: true, data: results })
})
relief.post('/:id/vehicles', requirePermission('relief.manage'), async (c) => {
  const id = c.req.param('id')
  const notFound = await requireProject(c, c.env.DB, id)
  if (notFound) return notFound
  const body = await c.req.json().catch(() => null)
  const vid = newUuid()
  await c.env.DB
    .prepare('INSERT INTO relief_vehicles (id, project_id, type, plate, driver, capacity) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(vid, id, body?.type ?? null, body?.plate ?? null, body?.driver ?? null, body?.capacity ?? null)
    .run()
  const row = await c.env.DB.prepare('SELECT * FROM relief_vehicles WHERE id = ?').bind(vid).first()
  return c.json({ ok: true, data: row }, 201)
})
relief.patch('/:id/vehicles/:vid', requirePermission('relief.manage'), async (c) => {
  const { vid } = c.req.param()
  const body = await c.req.json().catch(() => null)
  const existing: any = await c.env.DB.prepare('SELECT * FROM relief_vehicles WHERE id = ?').bind(vid).first()
  if (!existing) return c.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy xe' } }, 404)
  await c.env.DB
    .prepare('UPDATE relief_vehicles SET type=?, plate=?, driver=?, capacity=? WHERE id=?')
    .bind(body?.type ?? existing.type, body?.plate ?? existing.plate, body?.driver ?? existing.driver, body?.capacity ?? existing.capacity, vid)
    .run()
  const row = await c.env.DB.prepare('SELECT * FROM relief_vehicles WHERE id = ?').bind(vid).first()
  return c.json({ ok: true, data: row })
})
relief.delete('/:id/vehicles/:vid', requirePermission('relief.manage'), async (c) => {
  await c.env.DB.prepare('DELETE FROM relief_vehicles WHERE id = ? AND project_id = ?').bind(c.req.param('vid'), c.req.param('id')).run()
  return c.body(null, 204)
})

// ---------------------------------------------------------------------------
// Cargo
// ---------------------------------------------------------------------------
relief.get('/:id/cargo', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM relief_cargo WHERE project_id = ?').bind(c.req.param('id')).all()
  return c.json({ ok: true, data: results })
})
relief.post('/:id/cargo', requirePermission('relief.manage'), async (c) => {
  const id = c.req.param('id')
  const notFound = await requireProject(c, c.env.DB, id)
  if (notFound) return notFound
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.item !== 'string') return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'Thiếu item' } }, 400)
  const cid = newUuid()
  await c.env.DB
    .prepare('INSERT INTO relief_cargo (id, project_id, item, qty, unit, total_label, per_label, cost) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(cid, id, body.item, body.qty ?? null, body.unit ?? null, body.totalLabel ?? null, body.perLabel ?? null, body.cost ?? null)
    .run()
  const row = await c.env.DB.prepare('SELECT * FROM relief_cargo WHERE id = ?').bind(cid).first()
  return c.json({ ok: true, data: row }, 201)
})
relief.patch('/:id/cargo/:cid', requirePermission('relief.manage'), async (c) => {
  const { cid } = c.req.param()
  const body = await c.req.json().catch(() => null)
  const existing: any = await c.env.DB.prepare('SELECT * FROM relief_cargo WHERE id = ?').bind(cid).first()
  if (!existing) return c.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy hàng hoá' } }, 404)
  await c.env.DB
    .prepare('UPDATE relief_cargo SET item=?, qty=?, unit=?, total_label=?, per_label=?, cost=? WHERE id=?')
    .bind(body?.item ?? existing.item, body?.qty ?? existing.qty, body?.unit ?? existing.unit, body?.totalLabel ?? existing.total_label, body?.perLabel ?? existing.per_label, body?.cost ?? existing.cost, cid)
    .run()
  const row = await c.env.DB.prepare('SELECT * FROM relief_cargo WHERE id = ?').bind(cid).first()
  return c.json({ ok: true, data: row })
})

// ---------------------------------------------------------------------------
// Itinerary
// ---------------------------------------------------------------------------
relief.get('/:id/itinerary', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM relief_itinerary WHERE project_id = ? ORDER BY day').bind(c.req.param('id')).all()
  return c.json({ ok: true, data: results })
})
relief.post('/:id/itinerary', requirePermission('relief.manage'), async (c) => {
  const id = c.req.param('id')
  const notFound = await requireProject(c, c.env.DB, id)
  if (notFound) return notFound
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.day !== 'number') return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'Thiếu day' } }, 400)
  // BUGFIX: relief_itinerary has UNIQUE(project_id, day) — inserting a
  // duplicate day for the same project previously hit an unhandled D1
  // UNIQUE constraint error -> generic 500. Reject explicitly with a 409.
  const dup = await c.env.DB.prepare('SELECT id FROM relief_itinerary WHERE project_id = ? AND day = ?').bind(id, body.day).first()
  if (dup) return c.json({ ok: false, error: { code: 'CONFLICT', message: `Ngày ${body.day} đã tồn tại trong hành trình, dùng PATCH để sửa` } }, 409)
  const iid = newUuid()
  await c.env.DB
    .prepare('INSERT INTO relief_itinerary (id, project_id, day, date_label, from_label, to_label, distance_label, activities, sleep_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(iid, id, body.day, body.dateLabel ?? null, body.fromLabel ?? null, body.toLabel ?? null, body.distanceLabel ?? null, body.activities ?? null, body.sleepAt ?? null)
    .run()
  const row = await c.env.DB.prepare('SELECT * FROM relief_itinerary WHERE id = ?').bind(iid).first()
  return c.json({ ok: true, data: row }, 201)
})
relief.patch('/:id/itinerary/:day', requirePermission('relief.manage'), async (c) => {
  const { id, day } = c.req.param()
  const body = await c.req.json().catch(() => null)
  const existing: any = await c.env.DB.prepare('SELECT * FROM relief_itinerary WHERE project_id = ? AND day = ?').bind(id, day).first()
  if (!existing) return c.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy ngày hành trình' } }, 404)
  await c.env.DB
    .prepare('UPDATE relief_itinerary SET date_label=?, from_label=?, to_label=?, distance_label=?, activities=?, sleep_at=? WHERE id=?')
    .bind(body?.dateLabel ?? existing.date_label, body?.fromLabel ?? existing.from_label, body?.toLabel ?? existing.to_label, body?.distanceLabel ?? existing.distance_label, body?.activities ?? existing.activities, body?.sleepAt ?? existing.sleep_at, existing.id)
    .run()
  const row = await c.env.DB.prepare('SELECT * FROM relief_itinerary WHERE id = ?').bind(existing.id).first()
  return c.json({ ok: true, data: row })
})
relief.delete('/:id/itinerary/:day', requirePermission('relief.manage'), async (c) => {
  await c.env.DB.prepare('DELETE FROM relief_itinerary WHERE project_id = ? AND day = ?').bind(c.req.param('id'), c.req.param('day')).run()
  return c.body(null, 204)
})

// ---------------------------------------------------------------------------
// Tasks (project-scoped)
// ---------------------------------------------------------------------------
relief.get('/:id/tasks', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM relief_tasks WHERE project_id = ?').bind(c.req.param('id')).all()
  return c.json({ ok: true, data: results })
})
relief.post('/:id/tasks', requireAnyPermission('relief.manage', 'team.lead'), async (c) => {
  const id = c.req.param('id')
  const notFound = await requireProject(c, c.env.DB, id)
  if (notFound) return notFound
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.title !== 'string') return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'Thiếu title' } }, 400)
  // BUGFIX: owner_id has FK REFERENCES users(id) — validate before insert.
  if (body.ownerId) {
    const owner = await c.env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(body.ownerId).first()
    if (!owner) return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'ownerId không tồn tại' } }, 400)
  }
  const tid = newUuid()
  await c.env.DB
    .prepare('INSERT INTO relief_tasks (id, project_id, title, owner_id, deadline, status) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(tid, id, body.title, body.ownerId ?? null, body.deadline ?? null, body.status ?? 'issued')
    .run()
  const row = await c.env.DB.prepare('SELECT * FROM relief_tasks WHERE id = ?').bind(tid).first()
  return c.json({ ok: true, data: row }, 201)
})
relief.patch('/:id/tasks/:tid', requireAnyPermission('relief.manage', 'team.lead'), async (c) => {
  const { tid } = c.req.param()
  const body = await c.req.json().catch(() => null)
  const existing: any = await c.env.DB.prepare('SELECT * FROM relief_tasks WHERE id = ?').bind(tid).first()
  if (!existing) return c.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy nhiệm vụ' } }, 404)
  if (body?.ownerId) {
    const owner = await c.env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(body.ownerId).first()
    if (!owner) return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'ownerId không tồn tại' } }, 400)
  }
  await c.env.DB
    .prepare('UPDATE relief_tasks SET title=?, owner_id=?, deadline=?, status=? WHERE id=?')
    .bind(body?.title ?? existing.title, body?.ownerId ?? existing.owner_id, body?.deadline ?? existing.deadline, body?.status ?? existing.status, tid)
    .run()
  const row = await c.env.DB.prepare('SELECT * FROM relief_tasks WHERE id = ?').bind(tid).first()
  return c.json({ ok: true, data: row })
})

// ---------------------------------------------------------------------------
// Logs (multipart with photos)
// ---------------------------------------------------------------------------
relief.get('/:id/logs', async (c) => {
  const id = c.req.param('id')
  const { results: logs } = await c.env.DB.prepare('SELECT * FROM relief_logs WHERE project_id = ? ORDER BY logged_at DESC').bind(id).all<any>()
  for (const log of logs) {
    const { results: photos } = await c.env.DB.prepare('SELECT r2_key FROM relief_log_photos WHERE log_id = ?').bind(log.id).all()
    log.photos = photos.map((p: any) => p.r2_key)
  }
  return c.json({ ok: true, data: logs })
})
relief.post('/:id/logs', requireAnyPermission('relief.manage', 'team.lead'), async (c) => {
  const id = c.req.param('id')
  const notFound = await requireProject(c, c.env.DB, id)
  if (notFound) return notFound
  const user = c.var.user!
  const contentType = c.req.header('Content-Type') || ''
  let message = ''
  const photoKeys: string[] = []
  if (contentType.includes('multipart/form-data')) {
    const form = await c.req.formData()
    message = String(form.get('msg') ?? '')
    for (const [, value] of form.entries()) {
      if (value instanceof File) {
        const ext = value.name.split('.').pop() || 'jpg'
        const r2Key = `relief-logs/${id}/${newUuid()}.${ext}`
        await c.env.R2.put(r2Key, await value.arrayBuffer(), { httpMetadata: { contentType: value.type || 'image/jpeg' } })
        photoKeys.push(r2Key)
      }
    }
  } else {
    const body = await c.req.json().catch(() => null)
    message = body?.msg ?? ''
  }
  if (!message) return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'Thiếu msg' } }, 400)

  const logId = newUuid()
  await c.env.DB.prepare('INSERT INTO relief_logs (id, project_id, author_id, message) VALUES (?, ?, ?, ?)').bind(logId, id, user.id, message).run()
  for (const key of photoKeys) {
    await c.env.DB.prepare('INSERT INTO relief_log_photos (log_id, r2_key) VALUES (?, ?)').bind(logId, key).run()
  }
  const row = await c.env.DB.prepare('SELECT * FROM relief_logs WHERE id = ?').bind(logId).first()
  return c.json({ ok: true, data: { ...row, photos: photoKeys } }, 201)
})

// ---------------------------------------------------------------------------
// Beneficiaries
// ---------------------------------------------------------------------------
relief.get('/:id/beneficiaries', async (c) => {
  const id = c.req.param('id')
  const priority = c.req.query('priority')
  const status = c.req.query('status')
  let sql = 'SELECT * FROM relief_beneficiaries WHERE project_id = ?'
  const binds: any[] = [id]
  if (priority) { sql += ' AND priority = ?'; binds.push(priority) }
  if (status) { sql += ' AND status = ?'; binds.push(status) }
  const { results } = await c.env.DB.prepare(sql).bind(...binds).all()
  return c.json({ ok: true, data: results })
})
relief.patch('/:id/beneficiaries/:bid', requireAnyPermission('relief.manage', 'team.lead'), async (c) => {
  const { bid } = c.req.param()
  const body = await c.req.json().catch(() => null)
  const existing: any = await c.env.DB.prepare('SELECT * FROM relief_beneficiaries WHERE id = ?').bind(bid).first()
  if (!existing) return c.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy hộ dân' } }, 404)
  await c.env.DB
    .prepare(`UPDATE relief_beneficiaries SET status=?, signed_at=?, photo_url=?, updated_at=datetime('now') WHERE id=?`)
    .bind(body?.status ?? existing.status, body?.signedAt ?? existing.signed_at, body?.photoUrl ?? existing.photo_url, bid)
    .run()
  const row = await c.env.DB.prepare('SELECT * FROM relief_beneficiaries WHERE id = ?').bind(bid).first()
  return c.json({ ok: true, data: row })
})

// ---------------------------------------------------------------------------
// Approvals
// ---------------------------------------------------------------------------
relief.get('/:id/approvals', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM relief_approvals WHERE project_id = ?').bind(c.req.param('id')).all()
  return c.json({ ok: true, data: results })
})
const VALID_APPROVAL_ROLES = ['ct', 'tgd', 'congdoan', 'phapche']
relief.post('/:id/approvals/:role', requireAnyPermission('approve.high', 'relief.manage'), async (c) => {
  const { id, role } = c.req.param()
  const notFound = await requireProject(c, c.env.DB, id)
  if (notFound) return notFound
  if (!VALID_APPROVAL_ROLES.includes(role)) {
    return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: `role phải là một trong: ${VALID_APPROVAL_ROLES.join(', ')}` } }, 400)
  }
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.decision !== 'string') return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'Thiếu decision' } }, 400)
  await c.env.DB
    .prepare(
      `INSERT INTO relief_approvals (project_id, role, decision, note, decided_by, decided_at) VALUES (?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(project_id, role) DO UPDATE SET decision=excluded.decision, note=excluded.note, decided_by=excluded.decided_by, decided_at=excluded.decided_at`
    )
    .bind(id, role, body.decision, body.note ?? null, c.var.user!.id)
    .run()
  const row = await c.env.DB.prepare('SELECT * FROM relief_approvals WHERE project_id = ? AND role = ?').bind(id, role).first()
  return c.json({ ok: true, data: row })
})

// ---------------------------------------------------------------------------
// Budget / Expenses
// ---------------------------------------------------------------------------
relief.get('/:id/budget/summary', async (c) => {
  const id = c.req.param('id')
  const project: any = await c.env.DB.prepare('SELECT * FROM relief_projects WHERE id = ?').bind(id).first()
  if (!project) return c.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy dự án' } }, 404)
  const spentRow = await c.env.DB.prepare('SELECT COALESCE(SUM(amount),0) s FROM relief_expenses WHERE project_id = ?').bind(id).first<{ s: number }>()
  return c.json({
    ok: true,
    data: {
      total: project.budget_total, donation: project.budget_donation, company: project.budget_company, sponsor: project.budget_sponsor,
      committed: project.budget_committed, spent: spentRow?.s ?? 0, remaining: (project.budget_total ?? 0) - (spentRow?.s ?? 0),
    },
  })
})
relief.get('/:id/expenses', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM relief_expenses WHERE project_id = ? ORDER BY created_at DESC').bind(c.req.param('id')).all()
  return c.json({ ok: true, data: results })
})
relief.post('/:id/expenses', requireAnyPermission('relief.manage', 'budget.commit'), async (c) => {
  const id = c.req.param('id')
  const notFound = await requireProject(c, c.env.DB, id)
  if (notFound) return notFound
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.item !== 'string' || typeof body.amount !== 'number') {
    return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'Thiếu item hoặc amount' } }, 400)
  }
  // BUGFIX: a zero/negative amount would silently corrupt budget_spent
  // (it's additive: budget_spent = budget_spent + amount) with no validation.
  if (!(body.amount > 0)) {
    return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'amount phải lớn hơn 0' } }, 400)
  }
  const eid = newUuid()
  await c.env.DB
    .prepare('INSERT INTO relief_expenses (id, project_id, item, amount, invoice_ref, created_by) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(eid, id, body.item, body.amount, body.invoice ?? null, c.var.user!.id)
    .run()
  await c.env.DB.prepare(`UPDATE relief_projects SET budget_spent = budget_spent + ? WHERE id = ?`).bind(body.amount, id).run()
  const row = await c.env.DB.prepare('SELECT * FROM relief_expenses WHERE id = ?').bind(eid).first()
  return c.json({ ok: true, data: row }, 201)
})

// ---------------------------------------------------------------------------
// Reports (metadata only; actual PDF generation deferred — accept upload)
// ---------------------------------------------------------------------------
relief.get('/:id/reports', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM relief_reports WHERE project_id = ? ORDER BY created_at DESC').bind(c.req.param('id')).all()
  return c.json({ ok: true, data: results })
})
relief.post('/:id/reports/:type', requirePermission('relief.manage'), async (c) => {
  const { id, type } = c.req.param()
  const notFound = await requireProject(c, c.env.DB, id)
  if (notFound) return notFound
  const contentType = c.req.header('Content-Type') || ''
  let r2Key: string | null = null
  if (contentType.includes('multipart/form-data')) {
    const form = await c.req.formData()
    const file = form.get('file')
    if (file instanceof File) {
      r2Key = `relief-reports/${id}/${type}-${newUuid()}.pdf`
      await c.env.R2.put(r2Key, await file.arrayBuffer(), { httpMetadata: { contentType: 'application/pdf' } })
    }
  }
  const rid = newUuid()
  await c.env.DB
    .prepare('INSERT INTO relief_reports (id, project_id, report_type, r2_key, created_by) VALUES (?, ?, ?, ?, ?)')
    .bind(rid, id, type, r2Key, c.var.user!.id)
    .run()
  const row = await c.env.DB.prepare('SELECT * FROM relief_reports WHERE id = ?').bind(rid).first()
  return c.json({ ok: true, data: row }, 201)
})

export default relief
