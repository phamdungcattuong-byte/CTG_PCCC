// Admin CRUD UI for the Camera registry — new "Camera" tab in Quản trị hệ
// thống (admin.js). Loaded after admin.js + security-camera.js. Registers
// window.renderCameraAdmin so admin.js's renderAdminTab() dispatch map picks
// it up (see the TABS/renderers edits in admin.js). Reuses the
// #modal-admin-generic pattern (openUserForm/saveUser style) already used
// by the Users tab, and hits the real /api/v1/cameras + /api/v1/sites APIs
// — no in-memory-only mock data here, unlike the older admin.js tabs.
(function () {
  const $ = (id) => document.getElementById(id);
  const CAM_ADMIN = { rows: [], sites: [] };

  async function loadCameraAdminData() {
    try {
      CAM_ADMIN.rows = await window.API.get('/cameras');
    } catch (e) {
      console.warn('load cameras (admin) failed', e);
      CAM_ADMIN.rows = [];
    }
    try {
      CAM_ADMIN.sites = await window.API.get('/sites');
    } catch (e) {
      CAM_ADMIN.sites = [];
    }
  }

  function statusBadge(status) {
    return status === 'online'
      ? '<span class="badge bg-good">● online</span>'
      : status === 'maintenance'
      ? '<span class="badge bg-warn">🔧 bảo trì</span>'
      : '<span class="badge bg-navy">○ offline</span>';
  }

  function camRowsHTML(list) {
    if (!list.length) {
      return '<tr><td colspan="7" class="muted small" style="text-align:center;padding:20px">Chưa có camera nào. Nhấn "+ Thêm camera" để đăng ký.</td></tr>';
    }
    return list.map((cam) => {
      const kindLabel = cam.kind === 'residential' ? '🏢 Chung cư' : '🏗️ Công trường';
      const urlKind = cam.embed_url ? 'Embed (cloud)' : cam.hls_url ? 'HLS (.m3u8)' : '<span class="muted">chưa cấu hình</span>';
      return `<tr>
        <td><b style="color:var(--ink-heading)">${cam.name}</b><br><span class="tiny muted mono">${cam.id.slice(0, 8)}…</span></td>
        <td class="small">${kindLabel}</td>
        <td class="small">${cam.site_name || '<span class="muted">—</span>'}</td>
        <td class="small">${cam.vendor || '<span class="muted">—</span>'}</td>
        <td class="small">${urlKind}</td>
        <td>${statusBadge(cam.status)}${cam.open_alerts ? ` <span class="badge bg-crit">⚠ ${cam.open_alerts}</span>` : ''}</td>
        <td class="flex" style="gap:4px">
          <button class="btn btn-ghost btn-sm" onclick="window.openCameraForm('${cam.id}')">✏️</button>
          <button class="btn btn-ghost btn-sm" onclick="window.deleteCameraAdmin('${cam.id}')">🗑</button>
        </td>
      </tr>`;
    }).join('');
  }

  window.renderCameraAdmin = async function (el) {
    el.innerHTML = '<div class="muted small" style="padding:20px">Đang tải danh mục camera…</div>';
    await loadCameraAdminData();
    el.innerHTML = `
      <div class="flex mb">
        <h2 style="color:var(--ink-heading)">Quản lý Camera an ninh</h2>
        <span class="badge bg-teal">${CAM_ADMIN.rows.length} camera</span>
        <div class="right flex">
          <button class="btn btn-primary" onclick="window.openCameraForm()">+ Thêm camera</button>
        </div>
      </div>

      <div class="alert-box ab-info mb">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z"/></svg>
        <div><b>Live-feed thật:</b> mỗi camera cần <b>1 trong 2</b> loại URL — <b>Embed URL</b> (iframe player của nền tảng cloud CCTV, VD: Hik-Connect, EZVIZ, DMSS) hoặc <b>HLS URL</b> (.m3u8, phát bằng hls.js ngay trên trình duyệt). Cloudflare Workers không xử lý video — trình duyệt người xem tự giải mã.</div>
      </div>

      <div class="card">
        <div class="card-b" style="padding:0">
          <table id="cameraAdminTable">
            <thead><tr>
              <th>Tên camera</th>
              <th>Khu vực</th>
              <th>Cơ sở (site)</th>
              <th>Vendor</th>
              <th>Loại luồng</th>
              <th>Trạng thái</th>
              <th style="width:100px">Thao tác</th>
            </tr></thead>
            <tbody id="cameraAdminBody">${camRowsHTML(CAM_ADMIN.rows)}</tbody>
          </table>
        </div>
      </div>
    `;
  };

  window.openCameraForm = function (id) {
    const cam = id ? CAM_ADMIN.rows.find((x) => x.id === id) : null;
    const isEdit = !!cam;
    const modal = $('modal-admin-generic');
    modal.querySelector('.modal').innerHTML = `
      <div class="modal-h"><h3>${isEdit ? 'Sửa camera: ' + cam.name : 'Thêm camera mới'}</h3>
        <button class="drawer-close right" onclick="window.closeModal('admin-generic')">✕</button>
      </div>
      <div class="modal-b">
        <div class="grid g2">
          <div><label class="small b" style="color:var(--ink-2)">Tên camera</label><input id="cf_name" value="${cam?.name || ''}" placeholder="VD: Cổng chính CT1"></div>
          <div><label class="small b" style="color:var(--ink-2)">Khu vực</label>
            <select id="cf_kind">
              <option value="residential" ${cam?.kind === 'residential' ? 'selected' : ''}>🏢 Chung cư</option>
              <option value="construction" ${!cam || cam?.kind === 'construction' ? 'selected' : ''}>🏗️ Công trường</option>
            </select>
          </div>
          <div><label class="small b" style="color:var(--ink-2)">Cơ sở (site) — tuỳ chọn</label>
            <select id="cf_siteId">
              <option value="">— Không gắn site —</option>
              ${CAM_ADMIN.sites.map((s) => `<option value="${s.id}" ${cam?.site_id === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
            </select>
          </div>
          <div><label class="small b" style="color:var(--ink-2)">Vendor / nền tảng cloud</label><input id="cf_vendor" value="${cam?.vendor || ''}" placeholder="VD: EZVIZ, Hik-Connect, Dahua DMSS"></div>
          <div style="grid-column:1/-1"><label class="small b" style="color:var(--ink-2)">Embed URL (iframe player vendor) — dùng 1 trong 2</label><input id="cf_embedUrl" value="${cam?.embed_url || ''}" placeholder="https://open.ys7.com/ext/embed/..."></div>
          <div style="grid-column:1/-1"><label class="small b" style="color:var(--ink-2)">HLS URL (.m3u8) — dùng 1 trong 2</label><input id="cf_hlsUrl" value="${cam?.hls_url || ''}" placeholder="https://.../stream.m3u8"></div>
          <div><label class="small b" style="color:var(--ink-2)">Vị trí lắp đặt (ghi chú)</label><input id="cf_locationNote" value="${cam?.location_note || ''}" placeholder="VD: Cổng bảo vệ tầng 1"></div>
          <div><label class="small b" style="color:var(--ink-2)">Trạng thái</label>
            <select id="cf_status">
              <option value="online" ${!cam || cam?.status === 'online' ? 'selected' : ''}>● Online</option>
              <option value="offline" ${cam?.status === 'offline' ? 'selected' : ''}>○ Offline</option>
              <option value="maintenance" ${cam?.status === 'maintenance' ? 'selected' : ''}>🔧 Bảo trì</option>
            </select>
          </div>
        </div>
      </div>
      <div class="modal-f">
        <button class="btn btn-ghost" onclick="window.closeModal('admin-generic')">Huỷ</button>
        <button class="btn btn-primary" onclick="window.saveCameraAdmin('${cam?.id || ''}')">💾 ${isEdit ? 'Lưu' : 'Tạo'}</button>
      </div>
    `;
    window.openModal('admin-generic');
  };

  window.saveCameraAdmin = async function (id) {
    const name = $('cf_name').value.trim();
    if (!name) { window.toast('Nhập tên camera', 'warn'); return; }
    const hlsUrl = $('cf_hlsUrl').value.trim();
    const embedUrl = $('cf_embedUrl').value.trim();
    if (!hlsUrl && !embedUrl) { window.toast('Cần ít nhất 1 URL luồng (Embed hoặc HLS)', 'warn'); return; }
    const payload = {
      name,
      kind: $('cf_kind').value,
      siteId: $('cf_siteId').value || null,
      vendor: $('cf_vendor').value.trim() || null,
      embedUrl: embedUrl || null,
      hlsUrl: hlsUrl || null,
      locationNote: $('cf_locationNote').value.trim() || null,
      status: $('cf_status').value,
    };
    try {
      if (id) {
        await window.API.patch('/cameras/' + id, payload);
        window.toast('✓ Đã cập nhật camera <b>' + name + '</b>', 'good');
      } else {
        await window.API.post('/cameras', payload);
        window.toast('✓ Đã thêm camera <b>' + name + '</b>', 'good');
      }
      window.closeModal('admin-generic');
      const tabEl = document.getElementById('adminTabContent');
      if (tabEl) await window.renderCameraAdmin(tabEl);
      if (window.MODULE_HOOKS && window.MODULE_HOOKS.security) window.MODULE_HOOKS.security();
    } catch (e) {
      window.toast('Lỗi lưu camera: ' + (e.message || ''), 'crit');
      console.error(e);
    }
  };

  window.deleteCameraAdmin = async function (id) {
    const cam = CAM_ADMIN.rows.find((x) => x.id === id);
    if (!cam) return;
    if (!confirm('Xoá camera "' + cam.name + '"? Toàn bộ cảnh báo liên quan cũng sẽ bị xoá. Thao tác sẽ được ghi vào Audit Log.')) return;
    try {
      await window.API.del('/cameras/' + id);
      window.toast('🗑 Đã xoá camera <b>' + cam.name + '</b>', 'warn');
      const tabEl = document.getElementById('adminTabContent');
      if (tabEl) await window.renderCameraAdmin(tabEl);
      if (window.MODULE_HOOKS && window.MODULE_HOOKS.security) window.MODULE_HOOKS.security();
    } catch (e) {
      window.toast('Lỗi xoá camera: ' + (e.message || ''), 'crit');
      console.error(e);
    }
  };
})();
