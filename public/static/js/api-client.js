// Minimal fetch wrapper for the CTG Command Center API.
// Envelope: { ok:true, data } | { ok:false, error:{code,message} }
(function () {
  async function call(method, path, body, opts) {
    const init = {
      method,
      credentials: 'same-origin',
      headers: {},
    };
    if (body !== undefined && !(body instanceof FormData)) {
      init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(body);
    } else if (body instanceof FormData) {
      init.body = body;
    }
    if (opts && opts.idempotencyKey) {
      init.headers['Idempotency-Key'] = opts.idempotencyKey;
    }
    const res = await fetch('/api/v1' + path, init);
    let json;
    try { json = await res.json(); } catch (e) { json = { ok: false, error: { code: 'PARSE_ERROR', message: 'Phản hồi không hợp lệ' } }; }
    if (!json.ok) {
      const err = new Error((json.error && json.error.message) || 'Lỗi không xác định');
      err.code = json.error && json.error.code;
      err.status = res.status;
      throw err;
    }
    return json.data;
  }

  window.API = {
    get: (path) => call('GET', path),
    post: (path, body, opts) => call('POST', path, body, opts),
    patch: (path, body) => call('PATCH', path, body),
    del: (path) => call('DELETE', path),
  };

  // -------------------------------------------------------------------------
  // Shape adapters: D1 rows (snake_case, ISO datetime strings) <-> the
  // prototype's in-memory shapes (camelCase, epoch-ms numbers) that
  // ctg-core.js / ctg-modules.js / admin.js render functions already expect.
  // Keeping these centralized means the override scripts never hand-roll
  // field mapping twice.
  // -------------------------------------------------------------------------
  window.API.mapTask = function (row) {
    return {
      id: row.id,
      code: row.code,
      unit: row.unit_code,
      unitAll: [row.unit_code],
      ownerId: row.owner_id,
      checkerId: row.checker_id,
      title: row.title,
      desc: row.description || '',
      phase: row.phase_id,
      deadline: row.deadline ? new Date(row.deadline).getTime() : Date.now() + 6 * 3600 * 1000,
      status: row.status,
      progress: row.progress || 0,
      note: row.note || '',
      level: row.level,
      eventId: row.event_id,
    };
  };

  window.API.mapLog = function (row) {
    return { time: new Date(row.created_at).getTime(), msg: row.message, level: row.level };
  };

  window.API.mapUser = function (row) {
    return {
      id: row.id,
      name: row.name,
      role: row.business_title || '',
      unit: row.unit_code || '',
      short: row.short_label || (row.name || '').split(' ').slice(-2).map((s) => s[0]).join('').toUpperCase(),
      gradient: row.gradient_class || 'grad-a',
      phone: row.phone || '',
      online: !!row.online,
      roleId: row.role_id,
    };
  };

  // Reshapes a flat relief_projects D1 row (+ sub-resource arrays from
  // loadProjectFull) into the nested shape relief.js/relief-data.js already
  // expect (p.budget.total, p.region.province, p.beneficiaries.households…).
  window.API.mapReliefProject = function (row) {
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      disaster: row.disaster,
      disasterLabel: row.disaster_label || '',
      region: { province: row.region_province || '', commune: row.region_commune || '', gps: row.region_gps || '' },
      status: row.status,
      statusLabel: row.status_label || '',
      priority: row.priority,
      startDate: row.start_date,
      endDate: row.end_date,
      days: row.days,
      budget: {
        total: row.budget_total || 0,
        sources: { donation: row.budget_donation || 0, company: row.budget_company || 0, sponsor: row.budget_sponsor || 0 },
        spent: row.budget_spent || 0,
        committed: row.budget_committed || 0,
      },
      beneficiaries: {
        households: row.beneficiaries_households || 0,
        people: row.beneficiaries_people || 0,
        priority: row.beneficiaryPriorities || [],
      },
      team: (row.team || []).map((t) => ({ personId: t.person_id, role: t.role, phone: t.phone })),
      vehicles: (row.vehicles || []).map((v) => ({ id: v.id, type: v.vehicle_type, plate: v.plate, driver: v.driver, capacity: v.capacity })),
      cargo: (row.cargo || []).map((c) => ({ id: c.id, item: c.item, qty: c.qty, unit: c.unit, total: c.total_label, per: c.per_label, cost: c.cost })),
      itinerary: (row.itinerary || []).map((it) => ({ day: it.day, date: it.date, from: it.from_place, to: it.to_place, distance: it.distance, activities: it.activities, sleepAt: it.sleep_at })),
      tasks: (row.tasks || []).map((t) => ({ id: t.id, title: t.title, owner: t.owner_id, deadline: t.deadline, status: t.status })),
      approvals: (row.approvals || []).reduce((acc, a) => { acc[a.role] = a.status; return acc; }, {}),
      logs: [],
      media: [],
      outcome: row.outcome_households != null ? {
        households: row.outcome_households, people: row.outcome_people,
        moneyDistributed: row.outcome_money_distributed, goodsValue: row.outcome_goods_value,
        livesImpacted: row.outcome_lives_impacted, pressCoverage: row.outcome_press_coverage,
      } : null,
    };
  };

  window.API.mapAuditRow = function (row) {
    return { t: new Date(row.created_at).getTime(), actor: row.actor_id, action: row.action, obj: row.object_label, detail: row.detail };
  };

  window.API.mapNotif = function (row) {
    return {
      id: row.id,
      kind: row.kind,
      taskId: row.ref_type === 'task' ? row.ref_id : null,
      title: row.title,
      desc: row.body || '',
      time: new Date(row.created_at).getTime(),
      read: !!row.read_at,
      ownerId: (window.STATE && window.STATE.me) || null,
    };
  };
})();
