// Boot sequence for the authenticated app shell (/).
// Fetches the current user + reference data, patches window.PEOPLE with
// real role_id, then runs the prototype's initCore()/initModules() exactly
// as the original index.html did in its inline tail script.
(function () {
  window.logout = async function () {
    try { await window.API.post('/auth/logout', {}); } catch (e) {}
    window.location.href = '/login';
  };

  window.deactivateEvent = async function () {
    try {
      var ev = window.STATE.activeEventId;
      if (ev) await window.API.post('/events/' + ev + '/deactivate', {});
    } catch (e) { console.warn(e); }
    window.setScenario('norm');
  };

  async function boot() {
    var me;
    try {
      me = await window.API.get('/auth/me');
      // Merge real role_id/name onto the matching mock PEOPLE entry (by id)
      // so existing render code (byId(PEOPLE,...)) keeps working unchanged;
      // if the logged-in account isn't one of the 24 seed people, add it.
      if (window.PEOPLE) {
        var match = window.PEOPLE.find(function (p) { return p.id === me.id; });
        if (match) {
          match.roleId = me.roleId;
          match.name = me.name || match.name;
          match.role = me.businessTitle || match.role;
        } else {
          window.PEOPLE.unshift({
            id: me.id, name: me.name, role: me.businessTitle || '', unit: me.unitCode || 'BCH',
            short: me.shortLabel || (me.name || '').split(' ').slice(-2).map(function (s) { return s[0]; }).join('').toUpperCase(),
            gradient: me.gradientClass || 'grad-a', phone: me.phone || '', online: true, roleId: me.roleId,
          });
        }
      }
    } catch (e) {
      // Not authenticated — should not normally happen since / redirects to /login.
      window.location.href = '/login';
      return;
    }

    // Run the original prototype boot sequence. initCore() calls
    // window.setMe(<localStorage-cached id, defaults to 'cht'>) internally —
    // override that immediately after with the REAL logged-in user's id so
    // window.STATE.me (a person-id string, per myTasks()/setMe()) and the
    // topbar badge reflect who actually logged in, not a stale demo persona.
    if (window.initCore) window.initCore();
    window.setMe(me.id);
    if (window.initModules) window.initModules();

    // Load any currently-active event (persisted server-side) so the
    // dashboard/activation/my views reflect real state on first paint,
    // then re-render the sections that are already visible.
    if (window.loadActiveEvent) {
      await window.loadActiveEvent();
    }
    if (window.refreshNotifs) {
      await window.refreshNotifs();
    }
    var activeSec = document.querySelector('.section.active')?.id?.replace('sec-', '');
    ['dashboard', 'my', activeSec].filter(Boolean).forEach(function (k) {
      try { window.MODULE_HOOKS[k] && window.MODULE_HOOKS[k](); } catch (e) { console.warn(e); }
    });

    // Poll for updates every 15s (Phase-1 realtime substitute) so other
    // logged-in users' actions (task ack/done, new activations) show up
    // without a full page reload.
    setInterval(function () {
      if (document.hidden) return;
      if (window.loadActiveEvent) {
        window.loadActiveEvent().then(function () {
          var sec = document.querySelector('.section.active')?.id?.replace('sec-', '');
          ['dashboard', 'my', sec].filter(Boolean).forEach(function (k) {
            try { window.MODULE_HOOKS[k] && window.MODULE_HOOKS[k](); } catch (e) {}
          });
        });
      }
      if (window.refreshNotifs) window.refreshNotifs();
    }, 15000);
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
