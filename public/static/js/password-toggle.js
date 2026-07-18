// Password show/hide toggle for login-style password fields.
// Works via event delegation so it applies to both the static /login page
// markup (src/routes/pages.tsx) and the dynamically-injected forced
// password-change modal (bootstrap.js#showForceChangePasswordModal) without
// needing per-instance wiring. Any input wrapped as:
//   <div class="login-password-wrap">
//     <input type="password" .../>
//     <button type="button" class="login-pw-toggle">...</button>
//   </div>
// gets show/hide behaviour automatically.
(function () {
  function eyeIcon() {
    return (
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M1 12s4-7.5 11-7.5S23 12 23 12s-4 7.5-11 7.5S1 12 1 12z"/>' +
      '<circle cx="12" cy="12" r="3"/>' +
      '</svg>'
    );
  }
  function eyeOffIcon() {
    return (
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M17.94 17.94A10.9 10.9 0 0 1 12 19.5C5 19.5 1 12 1 12a18.6 18.6 0 0 1 5.06-5.94M9.9 4.24A10.4 10.4 0 0 1 12 4.5c7 0 11 7.5 11 7.5a18.5 18.5 0 0 1-2.16 3.19"/>' +
      '<path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>' +
      '<line x1="1" y1="1" x2="23" y2="23"/>' +
      '</svg>'
    );
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.login-pw-toggle') : null;
    if (!btn) return;
    var wrap = btn.closest('.login-password-wrap');
    var input = wrap ? wrap.querySelector('input') : null;
    if (!input) return;

    var willShow = input.type === 'password';
    input.type = willShow ? 'text' : 'password';
    btn.innerHTML = willShow ? eyeOffIcon() : eyeIcon();
    btn.setAttribute('aria-label', willShow ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
    btn.setAttribute('aria-pressed', willShow ? 'true' : 'false');

    // Keep focus + caret in the field after toggling, for a smooth UX.
    var pos = input.selectionStart;
    input.focus();
    if (typeof pos === 'number') {
      try { input.setSelectionRange(pos, pos); } catch (_e) {}
    }
  });
})();
