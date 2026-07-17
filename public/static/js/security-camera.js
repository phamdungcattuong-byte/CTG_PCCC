// Phân hệ An ninh Camera — live-feed thật cho chung cư (residential) và
// công trường (construction), backed by /api/v1/cameras (registry: mỗi
// camera lưu hls_url .m3u8 HOẶC embed_url iframe từ platform cloud CCTV
// của vendor — Hikvision Hik-Connect, EZVIZ, Dahua DMSS...).
//
// Cloudflare Workers KHÔNG xử lý/relay video: trình duyệt tự phát HLS bằng
// hls.js (CDN, nạp lười khi cần) hoặc nhúng iframe player của vendor.
// Đây là module MỚI (không phải override) — renderCamGrid() ở
// ctg-modules.js (mini preview trên Dashboard/PCCC) vẫn giữ dạng mô phỏng
// trang trí, không đụng tới.
(function () {
  window.MODULE_HOOKS = window.MODULE_HOOKS || {};
  const $ = (id) => document.getElementById(id);

  const SEC_STATE = { kind: 'all', cameras: [], alerts: [], hlsLoaded: false, activeCamId: null, hlsInstance: null };
  window.SEC_STATE = SEC_STATE;

  function ensureHlsJs() {
    return new Promise((resolve) => {
      if (window.Hls || SEC_STATE.hlsLoaded) return resolve();
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
      s.onload = () => { SEC_STATE.hlsLoaded = true; resolve(); };
      s.onerror = () => resolve(); // degrade gracefully — <video> can still try native HLS (Safari)
      document.head.appendChild(s);
    });
  }

  function severityBadge(sev) {
    const map = { info: 'bg-teal', warn: 'bg-warn', crit: 'bg-crit' };
    const label = { info: 'Thông tin', warn: 'Cảnh báo', crit: 'Nghiêm trọng' };
    return `<span class="badge ${map[sev] || 'bg-teal'}">${label[sev] || sev}</span>`;
  }

  function camTileHTML(cam) {
    const kindLabel = cam.kind === 'residential' ? '🏢 Chung cư' : '🏗️ Công trường';
    const statusOk = cam.status === 'online';
    const alertCount = cam.open_alerts || 0;
    return `<div class="cam ${alertCount > 0 ? 'alert' : ''}" style="aspect-ratio:16/9" onclick="window.openCameraView('${cam.id}')">
      <div class="cam-scene"></div>
      <div class="cam-hud">
        <div class="flex" style="justify-content:space-between;width:100%">
          <div class="live" style="background:${statusOk ? 'rgba(16,185,129,.85)' : 'rgba(107,114,128,.85)'}">${statusOk ? 'LIVE' : 'OFFLINE'}</div>
          ${alertCount > 0 ? `<div class="live" style="background:rgba(239,68,68,.9)">⚠ ${alertCount}</div>` : ''}
        </div>
        <div class="flex" style="justify-content:space-between;width:100%">
          <div style="font-size:10px;background:rgba(0,0,0,.6);padding:2px 6px;border-radius:4px">${cam.name}</div>
          <div style="font-size:10px;background:rgba(0,0,0,.6);padding:2px 6px;border-radius:4px">${kindLabel}</div>
        </div>
      </div>
    </div>`;
  }

  async function refreshCameras() {
    try {
      const q = SEC_STATE.kind !== 'all' ? '?kind=' + SEC_STATE.kind : '';
      SEC_STATE.cameras = await window.API.get('/cameras' + q);
    } catch (e) {
      console.warn('load cameras failed', e);
      SEC_STATE.cameras = [];
    }
    try {
      SEC_STATE.alerts = await window.API.get('/cameras/alerts/feed?status=open');
    } catch (e) {
      SEC_STATE.alerts = [];
    }
  }

  function renderSecurity() {
    const el = $('securityContent');
    if (!el) return;
    el.innerHTML = `
      <div class="alert-box ab-info mb">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z"/></svg>
        <div><b>An ninh Camera</b> — live-feed thật từ hệ thống camera chung cư &amp; công trường. Nhấn vào ô camera để xem toàn màn hình và ghi cảnh báo an ninh.</div>
      </div>

      <div class="flex mb" style="gap:8px;flex-wrap:wrap">
        <button class="btn btn-sm ${SEC_STATE.kind === 'all' ? 'btn-primary' : 'btn-ghost'}" data-camkind="all">Tất cả</button>
        <button class="btn btn-sm ${SEC_STATE.kind === 'residential' ? 'btn-primary' : 'btn-ghost'}" data-camkind="residential">🏢 Chung cư</button>
        <button class="btn btn-sm ${SEC_STATE.kind === 'construction' ? 'btn-primary' : 'btn-ghost'}" data-camkind="construction">🏗️ Công trường</button>
        <span class="right muted small" id="secCamCount"></span>
      </div>

      <div class="grid" style="grid-template-columns:1.6fr 1fr;gap:14px;align-items:start">
        <div class="card">
          <div class="card-h"><h3>Camera trực tiếp</h3></div>
          <div class="card-b">
            <div class="cam-grid" id="secCamGrid"></div>
          </div>
        </div>
        <div class="card">
          <div class="card-h"><h3>Cảnh báo an ninh đang mở</h3><span class="right badge bg-crit" id="secAlertCount">0</span></div>
          <div class="card-b stack" id="secAlertFeed" style="max-height:640px;overflow-y:auto"></div>
        </div>
      </div>
    `;
    el.querySelectorAll('[data-camkind]').forEach((b) => {
      b.addEventListener('click', () => { SEC_STATE.kind = b.dataset.camkind; loadAndRender(); });
    });
    renderCamGridReal();
    renderAlertFeed();
  }

  function renderCamGridReal() {
    const grid = $('secCamGrid');
    const count = $('secCamCount');
    if (!grid) return;
    if (count) count.textContent = SEC_STATE.cameras.length + ' camera';
    if (!SEC_STATE.cameras.length) {
      grid.innerHTML = '<div class="muted small" style="padding:20px;text-align:center">Chưa có camera nào được đăng ký. Vào Quản trị hệ thống → Camera để thêm.</div>';
      return;
    }
    grid.innerHTML = SEC_STATE.cameras.map(camTileHTML).join('');
  }

  function renderAlertFeed() {
    const feed = $('secAlertFeed');
    const countEl = $('secAlertCount');
    if (!feed) return;
    if (countEl) countEl.textContent = SEC_STATE.alerts.length;
    if (!SEC_STATE.alerts.length) {
      feed.innerHTML = '<div class="muted small">Không có cảnh báo an ninh nào đang mở.</div>';
      return;
    }
    feed.innerHTML = SEC_STATE.alerts.map((a) => {
      const t = new Date(a.created_at.replace(' ', 'T') + 'Z').toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
      return `<div class="alert-box ${a.severity === 'crit' ? 'ab-crit' : a.severity === 'warn' ? 'ab-warn' : 'ab-info'}" style="cursor:pointer" onclick="window.openCameraView('${a.camera_id}')">
        <div style="flex:1">
          <div class="flex" style="justify-content:space-between">
            <b class="small">${a.camera_name}</b>${severityBadge(a.severity)}
          </div>
          <div class="small">${a.message}</div>
          <div class="muted small">${a.site_name || ''} · ${t}</div>
        </div>
      </div>`;
    }).join('');
  }

  async function loadAndRender() {
    await refreshCameras();
    renderSecurity();
  }
  window.MODULE_HOOKS.security = loadAndRender;

  // ---------------------------------------------------------------------
  // Fullscreen camera viewer modal — plays hls_url via hls.js/native HLS,
  // or embeds embed_url in an iframe (vendor cloud player). Also lets duty
  // staff raise a manual security alert while watching.
  // ---------------------------------------------------------------------
  window.openCameraView = async function (camId) {
    SEC_STATE.activeCamId = camId;
    let cam;
    try {
      cam = await window.API.get('/cameras/' + camId);
    } catch (e) {
      window.toast('Không tải được thông tin camera: ' + (e.message || ''), 'crit');
      return;
    }
    $('camViewTitle').textContent = `${cam.name} — ${cam.site_name || ''}`;
    const body = $('camViewBody');
    body.innerHTML = `
      <div id="camPlayerWrap" style="aspect-ratio:16/9;background:#000;border-radius:8px;overflow:hidden;position:relative"></div>
      <div class="stack mt" id="camAlertHistory"></div>
    `;
    const wrap = $('camPlayerWrap');
    if (cam.embed_url) {
      wrap.innerHTML = `<iframe src="${cam.embed_url}" style="width:100%;height:100%;border:0" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
    } else if (cam.hls_url) {
      wrap.innerHTML = `<video id="camVideoEl" style="width:100%;height:100%;object-fit:contain;background:#000" controls autoplay muted playsinline></video>`;
      await ensureHlsJs();
      const video = $('camVideoEl');
      if (SEC_STATE.hlsInstance) { try { SEC_STATE.hlsInstance.destroy(); } catch (e) {} SEC_STATE.hlsInstance = null; }
      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls();
        hls.loadSource(cam.hls_url);
        hls.attachMedia(video);
        SEC_STATE.hlsInstance = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = cam.hls_url; // native HLS (Safari)
      } else {
        wrap.innerHTML = '<div class="muted small" style="padding:20px;text-align:center;color:#fff">Trình duyệt không hỗ trợ phát HLS.</div>';
      }
    } else {
      wrap.innerHTML = '<div class="muted small" style="padding:20px;text-align:center;color:#fff">Camera chưa cấu hình URL luồng.</div>';
    }

    const hist = $('camAlertHistory');
    hist.innerHTML = (cam.alerts || []).length
      ? cam.alerts.map((a) => `<div class="alert-box ${a.status === 'resolved' ? 'ab-info' : a.severity === 'crit' ? 'ab-crit' : 'ab-warn'}">
          <div style="flex:1"><b class="small">${a.status === 'resolved' ? '✓ Đã xử lý' : 'Đang mở'}</b> — ${a.message}
          <div class="muted small">${a.created_at}</div></div>
        </div>`).join('')
      : '<div class="muted small">Chưa có cảnh báo cho camera này.</div>';

    $('camAlertMsg').value = '';
    window.openModal('cam-view');
  };

  const origCloseModal = window.closeModal;
  window.closeModal = function (id) {
    if ((id === 'cam-view' || !id) && SEC_STATE.hlsInstance) {
      try { SEC_STATE.hlsInstance.destroy(); } catch (e) {}
      SEC_STATE.hlsInstance = null;
    }
    origCloseModal(id);
  };

  document.addEventListener('DOMContentLoaded', function () {
    const btn = $('camAlertBtn');
    if (btn) {
      btn.addEventListener('click', async function () {
        const msg = $('camAlertMsg').value.trim();
        if (!msg) { window.toast('Nhập nội dung cảnh báo', 'warn'); return; }
        if (!SEC_STATE.activeCamId) return;
        btn.disabled = true;
        try {
          await window.API.post('/cameras/' + SEC_STATE.activeCamId + '/alerts', { severity: 'warn', message: msg });
          window.toast('🚨 Đã ghi nhận cảnh báo an ninh', 'warn');
          window.closeModal('cam-view');
          if (window.MODULE_HOOKS.security) window.MODULE_HOOKS.security();
        } catch (e) {
          window.toast('Lỗi ghi cảnh báo: ' + (e.message || ''), 'crit');
        } finally {
          btn.disabled = false;
        }
      });
    }
  });
})();
