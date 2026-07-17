// Overrides for ctg-core.js — loaded after ctg-core.js, before ctg-modules.js.
// Replaces the prototype's in-memory demo simulation with real API-backed
// state for: notifications (bell/panel), and the "norm" (deactivate) branch
// of setScenario. The 'storm'/'fire' demo branches are left mostly intact
// (they are canned demo scripts, not something the backend models 1:1) but
// now also POST a matching real activation so state persists across reloads
// and other logged-in users see the same event.
(function () {
  window.STATE.activeEventId = window.STATE.activeEventId || null;

  // ---------------------------------------------------------------------
  // Notifications — replace static window.STATE.notifs with real fetches.
  // ---------------------------------------------------------------------
  window.refreshNotifs = async function () {
    try {
      const rows = await window.API.get('/notifications');
      window.STATE.notifs = rows.map(window.API.mapNotif);
    } catch (e) { console.warn('refreshNotifs failed', e); }
    window.renderBell();
  };

  const origToggleNotifPanel = window.toggleNotifPanel;
  window.toggleNotifPanel = function (e) {
    const p = document.getElementById('notifPanel');
    const willOpen = p && !p.classList.contains('open');
    if (willOpen) {
      window.refreshNotifs().then(() => origToggleNotifPanel(e));
    } else {
      origToggleNotifPanel(e);
    }
  };

  window.readNotif = async function (id) {
    const n = window.STATE.notifs.find((x) => x.id === id);
    if (!n) return;
    n.read = true;
    try { await window.API.patch('/notifications/' + id + '/read', {}); } catch (e) { console.warn(e); }
    window.renderBell();
    window.renderNotifList();
    if (n.taskId) window.go('my');
  };

  window.markAllRead = async function () {
    window.STATE.notifs.forEach((n) => (n.read = true));
    try { await window.API.post('/notifications/mark-all-read', {}); } catch (e) { console.warn(e); }
    window.renderBell();
    window.renderNotifList();
  };

  // ---------------------------------------------------------------------
  // Load real logs/tasks/notifs for the currently active event (if any)
  // into window.STATE, mirroring generateTasksForLevel's output shape.
  // ---------------------------------------------------------------------
  window.loadActiveEvent = async function () {
    try {
      const events = await window.API.get('/events?active=true');
      const ev = events && events[0];
      if (!ev) {
        window.STATE.activeEventId = null;
        window.STATE.tasks = [];
        window.STATE.logs = [];
        return null;
      }
      window.STATE.activeEventId = ev.id;
      window.SIM.eventName = ev.name;
      window.SIM.level = ev.level;
      window.applyLevel(ev.level);
      const full = await window.API.get('/events/' + ev.id);
      window.STATE.tasks = (full.tasks || []).map(window.API.mapTask);
      window.STATE.logs = (full.logs || []).map(window.API.mapLog);
      return full;
    } catch (e) {
      console.warn('loadActiveEvent failed', e);
      return null;
    }
  };

  // ---------------------------------------------------------------------
  // setScenario('norm') now calls the real deactivate endpoint.
  // 'storm'/'fire' keep the prototype's canned demo narrative locally
  // (no backend "scenario library" exists yet) but also persist a real
  // activation so /events reflects it for other users.
  // ---------------------------------------------------------------------
  const origSetScenario = window.setScenario;
  window.setScenario = function (kind) {
    document.querySelectorAll('.scenario-sw button').forEach((b) => b.classList.toggle('on', b.dataset.s === kind));
    window.SIM.scenario = kind;

    if (kind === 'norm') {
      const evId = window.STATE.activeEventId;
      const finish = () => {
        window.applyLevel(0);
        window.STATE.tasks = [];
        window.STATE.logs = [];
        window.STATE.notifs = [];
        window.STATE.activeEventId = null;
        window.SIM.eventName = '';
        window.renderBell();
        window.toast('Đã chuyển về trạng thái THƯỜNG TRỰC. Dữ liệu sự kiện đã xoá.', 'good');
        const activeSec = document.querySelector('.section.active')?.id?.replace('sec-', '');
        ['dashboard', activeSec].filter(Boolean).forEach((k) => {
          try { window.MODULE_HOOKS[k]?.(); } catch (e) { console.warn(e); }
        });
      };
      if (evId) {
        window.API.post('/events/' + evId + '/deactivate', {}).then(finish).catch(finish);
      } else {
        finish();
      }
      return;
    }

    // storm / fire: run the original canned narrative for immediate visual
    // feedback, then fire a real activation call in the background so the
    // event/tasks persist server-side too.
    origSetScenario(kind);
    const level = 3;
    const name = kind === 'storm' ? 'Bão số 3 – BAVI' : 'Cháy xưởng CT HIJ-KL';
    window.API
      .post('/events/activate', { level, name, type: kind === 'storm' ? 'storm' : 'fire' })
      .then((full) => {
        window.STATE.activeEventId = full.id;
      })
      .catch((e) => console.warn('background activate failed', e));
  };
})();
