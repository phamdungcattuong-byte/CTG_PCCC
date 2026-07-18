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

  // Blocking modal shown when the logged-in account has must_change_password
  // set (all 24 seeded accounts share the same default password, so this
  // forces every one of them off it on first login). Reuses the login card
  // visual style; injected into <body> since the app shell markup hasn't
  // rendered app content behind an unmet gate.
  function showForceChangePasswordModal(me) {
    return new Promise(function (resolve) {
      var overlay = document.createElement('div');
      overlay.className = 'login-page';
      overlay.style.position = 'fixed';
      overlay.style.inset = '0';
      overlay.style.zIndex = '9999';
      // Password-visibility toggle button markup, shared across all three
      // fields below; behaviour is wired globally by password-toggle.js
      // (event delegation on .login-pw-toggle inside .login-password-wrap).
      var eyeSvg =
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7.5 11-7.5S23 12 23 12s-4 7.5-11 7.5S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>';
      function pwToggleBtn() {
        return '<button type="button" class="login-pw-toggle" aria-label="Hiện mật khẩu" aria-pressed="false" tabindex="-1">' + eyeSvg + '</button>';
      }
      overlay.innerHTML =
        '<div class="login-card card">' +
        '  <h1 class="login-title">Đổi mật khẩu bắt buộc</h1>' +
        '  <p class="muted small login-sub">Tài khoản của bạn đang dùng mật khẩu mặc định. Vui lòng đặt mật khẩu mới trước khi tiếp tục.</p>' +
        '  <form id="fcpForm" class="login-form" autocomplete="off">' +
        '    <label class="small b login-label">Mật khẩu hiện tại</label>' +
        '    <div class="login-password-wrap"><input id="fcpCurrent" type="password" autocomplete="current-password" required />' + pwToggleBtn() + '</div>' +
        '    <label class="small b login-label">Mật khẩu mới (tối thiểu 8 ký tự)</label>' +
        '    <div class="login-password-wrap"><input id="fcpNew" type="password" autocomplete="new-password" minlength="8" required />' + pwToggleBtn() + '</div>' +
        '    <label class="small b login-label">Nhập lại mật khẩu mới</label>' +
        '    <div class="login-password-wrap"><input id="fcpConfirm" type="password" autocomplete="new-password" minlength="8" required />' + pwToggleBtn() + '</div>' +
        '    <div id="fcpError" class="alert-box ab-crit login-error" style="display:none"></div>' +
        '    <button type="submit" class="btn btn-primary btn-lg login-submit" id="fcpSubmit">Đổi mật khẩu</button>' +
        '  </form>' +
        '</div>';
      document.body.appendChild(overlay);

      var form = overlay.querySelector('#fcpForm');
      var errBox = overlay.querySelector('#fcpError');
      var submitBtn = overlay.querySelector('#fcpSubmit');

      form.addEventListener('submit', async function (e) {
        e.preventDefault();
        errBox.style.display = 'none';
        var current = overlay.querySelector('#fcpCurrent').value;
        var next = overlay.querySelector('#fcpNew').value;
        var confirm = overlay.querySelector('#fcpConfirm').value;
        if (next !== confirm) {
          errBox.textContent = 'Mật khẩu mới nhập lại không khớp';
          errBox.style.display = '';
          return;
        }
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang xử lý…';
        try {
          await window.API.post('/auth/change-password', { currentPassword: current, newPassword: next });
          document.body.removeChild(overlay);
          resolve();
        } catch (err) {
          errBox.textContent = err.message || 'Không thể đổi mật khẩu';
          errBox.style.display = '';
          submitBtn.disabled = false;
          submitBtn.textContent = 'Đổi mật khẩu';
        }
      });
    });
  }

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

    if (me.mustChangePassword) {
      await showForceChangePasswordModal(me);
      me.mustChangePassword = false;
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

    // Dedicated faster poll (5s) for the "An ninh Camera" section only — camera
    // status/open-alerts are more time-sensitive than the general 15s sweep
    // above, and only fires while that section is actually the visible one
    // (avoids extra API calls when the user is elsewhere in the app). Also
    // skipped while the camera fullscreen viewer modal is open, so it doesn't
    // fight with the live HLS player / in-progress alert form.
    setInterval(function () {
      if (document.hidden) return;
      var sec = document.querySelector('.section.active')?.id?.replace('sec-', '');
      if (sec !== 'security') return;
      if (document.querySelector('#modal-cam-view.open')) return;
      if (window.MODULE_HOOKS && window.MODULE_HOOKS.security) {
        try { window.MODULE_HOOKS.security(); } catch (e) { console.warn(e); }
      }
    }, 5000);
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
