// Overrides for ctg-modules.js — loaded after ctg-modules.js.
// Replaces the in-memory task/activation/incident mutation entry points
// with calls to the real Events/Tasks/Incidents API, while leaving all pure
// render functions (taskCardHTML, renderTaskList, renderMy, etc.) untouched
// — they already read from window.STATE.tasks/logs, we just make sure that
// state is populated/mutated via the API instead of local-only writes.
(function () {
  const $ = (id) => document.getElementById(id);

  function refreshAfterMutation() {
    if (window.MODULE_HOOKS.activation) window.MODULE_HOOKS.activation();
    if (window.MODULE_HOOKS.my) window.MODULE_HOOKS.my();
    if (window.MODULE_HOOKS.dashboard) window.MODULE_HOOKS.dashboard();
    if (window.MODULE_HOOKS.log) window.MODULE_HOOKS.log();
  }

  // -------------------------------------------------------------------
  // confirmActivate — POST /events/activate, replace local task/log gen.
  // -------------------------------------------------------------------
  window.confirmActivate = async function () {
    const k = window.SIM._pendingLevel ?? window.SIM.level;
    const name = $('inpName').value.trim() || 'Sự kiện chưa đặt tên';
    const btn = document.querySelector('#sec-activation .btn-primary');
    if (btn) btn.disabled = true;
    try {
      const full = await window.API.post('/events/activate', { level: k, name: name });
      window.STATE.activeEventId = full.id;
      window.SIM.eventName = name;
      window.applyLevel(k);
      window.STATE.tasks = (full.tasks || []).map((t) =>
        window.API.mapTask({
          id: t.id, code: t.code, unit_code: null, owner_id: t.ownerId, checker_id: null,
          title: t.title, description: null, phase_id: null, deadline: null,
          status: 'issued', progress: 0, note: null, level: k, event_id: full.id,
        })
      );
      // Fetch full task rows (with unit/phase/deadline) for accurate rendering.
      try {
        const taskRows = await window.API.get('/events/' + full.id + '/tasks');
        window.STATE.tasks = taskRows.map(window.API.mapTask);
      } catch (e) { console.warn(e); }

      window.STATE.logs = (full.logs || []).map(window.API.mapLog);
      window.pushLog(`⚡ Kích hoạt Cấp ${k} — ${name}. Sinh ${window.STATE.tasks.length} nhiệm vụ.`, k >= 3 ? 'crit' : k >= 2 ? 'warn' : 'info');
      window.toast(`⚡ Đã kích hoạt — ${window.STATE.tasks.length} nhiệm vụ đã phát`, 'warn', 4500);
      await window.refreshNotifs();
      refreshAfterMutation();
    } catch (e) {
      window.toast('Lỗi kích hoạt: ' + (e.message || 'không xác định'), 'crit');
      console.error(e);
    } finally {
      if (btn) btn.disabled = false;
    }
  };

  // -------------------------------------------------------------------
  // openTaskDetail — same modal markup, but Ack/Done buttons now call
  // the real API and refresh local state from the server response.
  // -------------------------------------------------------------------
  const origOpenTaskDetail = window.openTaskDetail;
  window.openTaskDetail = function (id) {
    origOpenTaskDetail(id);
    const t = window.STATE.tasks.find((x) => x.id === id);
    if (!t) return;
    const eventId = t.eventId || window.STATE.activeEventId;
    const p = window.byId(window.PEOPLE, t.ownerId);

    $('modalTaskAck').onclick = async () => {
      try {
        await window.API.post('/events/' + eventId + '/tasks/' + id + '/ack', {});
        t.status = 'doing';
        window.pushLog(`✓ ${p?.name || ''} đã xác nhận nhiệm vụ: ${t.title}`, 'info');
        window.closeModal('task');
        refreshAfterMutation();
      } catch (e) {
        window.toast('Lỗi xác nhận: ' + (e.message || ''), 'crit');
      }
    };

    $('modalTaskDone').onclick = async () => {
      const note = $('taskNote').value;
      try {
        await window.API.patch('/events/' + eventId + '/tasks/' + id, { note: note });
        await window.API.post('/events/' + eventId + '/tasks/' + id + '/done', {});
        t.status = 'done';
        t.note = note;
        window.pushLog(`✅ ${p?.name || ''} hoàn thành: ${t.title}`, 'info');
        window.closeModal('task');
        refreshAfterMutation();
      } catch (e) {
        window.toast('Lỗi hoàn thành: ' + (e.message || ''), 'crit');
      }
    };
  };

  // -------------------------------------------------------------------
  // ackAllMine — ack every 'issued' task owned by me via the API.
  // -------------------------------------------------------------------
  window.ackAllMine = async function () {
    const mine = window.myTasks().filter((t) => t.status === 'issued');
    if (!mine.length) { window.toast('Không có nhiệm vụ mới để xác nhận', 'warn'); return; }
    const eventId = window.STATE.activeEventId;
    try {
      await Promise.all(mine.map((t) => window.API.post('/events/' + eventId + '/tasks/' + t.id + '/ack', {})));
      mine.forEach((t) => (t.status = 'doing'));
      window.pushLog(`✓ ${window.byId(window.PEOPLE, window.STATE.me)?.name || ''} xác nhận nhận toàn bộ ${mine.length} nhiệm vụ.`, 'info');
      window.toast('✓ Đã xác nhận nhận toàn bộ nhiệm vụ', 'good');
      refreshAfterMutation();
    } catch (e) {
      window.toast('Lỗi xác nhận hàng loạt: ' + (e.message || ''), 'crit');
    }
  };

  // -------------------------------------------------------------------
  // saveIncident — POST /incidents (auto-creates event + tasks server-side).
  // -------------------------------------------------------------------
  window.saveIncident = async function () {
    const type = $('incType').value;
    const siteId = $('incSite').value;
    const desc = $('incDesc').value.trim() || '(không mô tả)';
    const labels = { fire: '🔥 CHÁY', flood: '💧 NGẬP', wind: '🌬 GIÓ LỐC', power: '⚡ SỰ CỐ ĐIỆN', injury: '🩹 CHẤN THƯƠNG' };
    window.closeModal('incident');
    try {
      const result = await window.API.post('/incidents', { type: type, siteId: siteId, desc: desc });
      window.STATE.activeEventId = result.event.id;
      window.SIM.eventName = result.event.name;
      window.applyLevel(result.event.level);
      const taskRows = await window.API.get('/events/' + result.event.id + '/tasks');
      window.STATE.tasks = taskRows.map(window.API.mapTask);
      window.pushLog(`🚨 ${labels[type] || type} — ${desc}`, 'crit');
      window.toast('🚨 Đã phát lệnh ứng phó', 'crit');
      await window.refreshNotifs();
      refreshAfterMutation();
      window.SIM.scenario = type === 'fire' ? 'fire' : 'storm';
      document.querySelectorAll('.scenario-sw button').forEach((b) => b.classList.toggle('on', b.dataset.s === window.SIM.scenario));
      window.go(type === 'fire' ? 'pccc' : 'dashboard');
    } catch (e) {
      window.toast('Lỗi phát lệnh ứng phó: ' + (e.message || ''), 'crit');
      console.error(e);
    }
  };

  // -------------------------------------------------------------------
  // exportLog — fetch full server-side log list (not just the in-memory
  // 100-cap) for the active event before exporting to CSV.
  // -------------------------------------------------------------------
  const origExportLog = window.exportLog;
  window.exportLog = async function () {
    const eventId = window.STATE.activeEventId;
    if (eventId) {
      try {
        const rows = await window.API.get('/events/' + eventId + '/logs?limit=500');
        window.STATE.logs = rows.map(window.API.mapLog);
      } catch (e) { console.warn(e); }
    }
    origExportLog();
  };
})();
