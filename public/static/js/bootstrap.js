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
    try {
      var me = await window.API.get('/auth/me');
      window.STATE.me = me;
      // Merge real role_id onto the matching mock PEOPLE entry (by username/id)
      // so existing render code (byId(PEOPLE,...)) keeps working unchanged.
      if (window.PEOPLE) {
        var match = window.PEOPLE.find(function (p) { return p.id === me.id || p.id === me.username; });
        if (match) { match.roleId = me.roleId; match.name = me.name || match.name; }
        else { window.PEOPLE.unshift(Object.assign({}, me, { unit: me.unitCode })); }
      }
    } catch (e) {
      // Not authenticated — should not normally happen since / redirects to /login.
      window.location.href = '/login';
      return;
    }

    // Run the original prototype boot sequence.
    if (window.initCore) window.initCore();
    if (window.initModules) window.initModules();

    var meBadge = document.getElementById('meBadge');
    if (meBadge && window.STATE.me) meBadge.textContent = window.STATE.me.name || window.STATE.me.username;
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
