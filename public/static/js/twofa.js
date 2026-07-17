// Xác thực 2 lớp (2FA) — self-service TOTP setup/confirm/disable UI.
// Backend: POST /auth/2fa/setup|confirm|disable, GET /auth/2fa/status
// (src/routes/auth.ts). Renders into the "Bảo mật tài khoản" card on the
// "Nhiệm vụ của tôi" section (#sec-my) and the #modal-2fa popup.
(function () {
  const $ = (id) => document.getElementById(id);
  let qrLibLoaded = false;

  function ensureQrLib() {
    return new Promise((resolve) => {
      if (window.QRCode || qrLibLoaded) return resolve();
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';
      s.onload = () => { qrLibLoaded = true; resolve(); };
      s.onerror = () => resolve(); // degrade to showing the raw secret only
      document.head.appendChild(s);
    });
  }

  async function refreshStatusBadge() {
    const badge = $('twoFaStatusBadge');
    const btn = $('twoFaActionBtn');
    if (!badge) return;
    try {
      const st = await window.API.get('/auth/2fa/status');
      if (st.twoFactorEnabled) {
        badge.textContent = '✓ Đã bật';
        badge.className = 'badge bg-good';
        if (btn) btn.textContent = 'Tắt 2FA';
      } else {
        badge.textContent = 'Chưa bật';
        badge.className = 'badge bg-warn';
        if (btn) btn.textContent = 'Thiết lập 2FA';
      }
      return st.twoFactorEnabled;
    } catch (e) {
      badge.textContent = '—';
      return null;
    }
  }
  window.MODULE_HOOKS = window.MODULE_HOOKS || {};
  window.MODULE_HOOKS.my2fa = refreshStatusBadge;

  window.open2faModal = async function () {
    const enabled = await refreshStatusBadge();
    const body = $('twoFaModalBody');
    $('twoFaModalTitle').textContent = enabled ? 'Tắt xác thực 2 lớp' : 'Thiết lập xác thực 2 lớp';
    if (enabled) {
      body.innerHTML = `
        <p class="muted small">Nhập mã 6 số hiện tại từ ứng dụng xác thực để xác nhận tắt 2FA cho tài khoản này. Sau khi tắt, đăng nhập chỉ cần mật khẩu.</p>
        <input id="tfaDisableCode" inputmode="numeric" maxlength="6" placeholder="000000" style="text-align:center;font-size:20px;letter-spacing:.3em;width:100%;margin:10px 0" />
        <div id="tfaDisableErr" class="alert-box ab-crit" style="display:none"></div>
        <div class="flex" style="gap:8px;justify-content:flex-end;margin-top:10px">
          <button class="btn btn-ghost" onclick="window.closeModal('2fa')">Đóng</button>
          <button class="btn btn-orange" id="tfaDisableBtn">Tắt 2FA</button>
        </div>`;
      window.openModal('2fa');
      $('tfaDisableBtn').addEventListener('click', async () => {
        const code = $('tfaDisableCode').value.trim();
        const errEl = $('tfaDisableErr');
        errEl.style.display = 'none';
        if (!/^\d{6}$/.test(code)) { errEl.textContent = 'Nhập đủ 6 số'; errEl.style.display = ''; return; }
        try {
          await window.API.post('/auth/2fa/disable', { code });
          window.toast('Đã tắt xác thực 2 lớp', 'warn');
          window.closeModal('2fa');
          refreshStatusBadge();
        } catch (e) {
          errEl.textContent = e.message || 'Mã xác thực không đúng';
          errEl.style.display = '';
        }
      });
      return;
    }

    // Not enabled yet — generate a new secret + QR to scan, then confirm.
    body.innerHTML = `<div class="muted small" style="text-align:center;padding:20px">Đang tạo mã bí mật…</div>`;
    window.openModal('2fa');
    let setupData;
    try {
      setupData = await window.API.post('/auth/2fa/setup', {});
    } catch (e) {
      body.innerHTML = `<div class="alert-box ab-crit">Không thể khởi tạo 2FA: ${e.message || ''}</div>`;
      return;
    }
    body.innerHTML = `
      <p class="muted small">1. Mở ứng dụng xác thực (Google Authenticator, Authy, Microsoft Authenticator…) trên điện thoại.<br/>2. Quét mã QR dưới đây, hoặc nhập mã bí mật thủ công.<br/>3. Nhập mã 6 số hiện tại để xác nhận.</p>
      <div id="tfaQrWrap" style="display:flex;justify-content:center;padding:12px;background:#fff;border-radius:8px;margin:10px 0"><div class="muted small">Đang tạo mã QR…</div></div>
      <div class="muted small" style="text-align:center;word-break:break-all;margin-bottom:10px">Mã bí mật: <b id="tfaSecretText">${setupData.secret}</b></div>
      <input id="tfaConfirmCode" inputmode="numeric" maxlength="6" placeholder="000000" style="text-align:center;font-size:20px;letter-spacing:.3em;width:100%;margin:6px 0" />
      <div id="tfaConfirmErr" class="alert-box ab-crit" style="display:none"></div>
      <div class="flex" style="gap:8px;justify-content:flex-end;margin-top:10px">
        <button class="btn btn-ghost" onclick="window.closeModal('2fa')">Hủy</button>
        <button class="btn btn-primary" id="tfaConfirmBtn">Xác nhận &amp; bật 2FA</button>
      </div>`;

    ensureQrLib().then(() => {
      const wrap = $('tfaQrWrap');
      if (!wrap) return;
      if (window.QRCode && window.QRCode.toCanvas) {
        wrap.innerHTML = '';
        const canvas = document.createElement('canvas');
        wrap.appendChild(canvas);
        window.QRCode.toCanvas(canvas, setupData.otpauthUrl, { width: 200 }, (err) => {
          if (err) wrap.innerHTML = '<div class="muted small">Không tạo được mã QR — dùng mã bí mật ở trên.</div>';
        });
      } else {
        wrap.innerHTML = '<div class="muted small">Không tải được thư viện QR — dùng mã bí mật ở trên để thêm thủ công.</div>';
      }
    });

    $('tfaConfirmBtn').addEventListener('click', async () => {
      const code = $('tfaConfirmCode').value.trim();
      const errEl = $('tfaConfirmErr');
      errEl.style.display = 'none';
      if (!/^\d{6}$/.test(code)) { errEl.textContent = 'Nhập đủ 6 số'; errEl.style.display = ''; return; }
      try {
        await window.API.post('/auth/2fa/confirm', { code });
        window.toast('✓ Đã bật xác thực 2 lớp', 'ok');
        window.closeModal('2fa');
        refreshStatusBadge();
      } catch (e) {
        errEl.textContent = e.message || 'Mã xác thực không đúng';
        errEl.style.display = '';
      }
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    // Refresh badge once the "my" section becomes visible for the first time;
    // bootstrap.js's initial hook-run for the active section already covers
    // reloads landing directly on #sec-my.
    if (window.API) refreshStatusBadge();
  });
})();
