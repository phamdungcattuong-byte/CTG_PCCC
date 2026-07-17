// ============================================================
// CTG ADMIN — Phân hệ Quản trị hệ thống
// ============================================================
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);

  const ADMIN_STATE = { activeTab: 'overview', auditLog: [] };
  window.ADMIN_STATE = ADMIN_STATE;

  // Seed audit log with some history
  function seedAuditLog() {
    if (ADMIN_STATE.auditLog.length) return;
    const now = Date.now();
    ADMIN_STATE.auditLog = [
      { t: now - 3600000*2, actor: 'ct',   action: 'approve', obj: 'Dự án CTR-2026-01', detail: 'Phê duyệt ngân sách 850tr' },
      { t: now - 3600000*3, actor: 'tgd',  action: 'create',  obj: 'Nhiệm vụ TSK-201', detail: 'Tạo nhiệm vụ giao vp2' },
      { t: now - 3600000*5, actor: 'it1',  action: 'update',  obj: 'Cấu hình hệ thống', detail: 'Sửa Weather API key' },
      { t: now - 3600000*8, actor: 'vpct1',action: 'assign',  obj: 'Người dùng dy1', detail: 'Gán vai trò "Y tế đoàn"' },
      { t: now - 3600000*12, actor: 'pt1', action: 'activate',obj: 'Cấp độ ĐỎ', detail: 'Kích hoạt kịch bản B3 (test)' },
      { t: now - 3600000*24, actor: 'ct',  action: 'login',   obj: 'Hệ thống', detail: 'Đăng nhập từ IP 10.0.1.24 (Chrome/Mac)' },
      { t: now - 3600000*30, actor: 'vp3', action: 'export',  obj: 'Báo cáo tài chính', detail: 'Xuất Excel BC-Yagi-2024' },
      { t: now - 3600000*48, actor: 'ct',  action: 'delete',  obj: 'Người dùng test01', detail: 'Xoá user test' },
    ];
  }

  // ========================================================
  // ROLES (RBAC)
  // ========================================================
  const ROLES = window.ROLES = [
    { id: 'super',    name: 'Super Admin',        desc: 'Toàn quyền hệ thống — chỉ VP Chủ tịch & IT',        color: 'grad-f', perms: ['*'] },
    { id: 'bch',      name: 'Ban Chỉ huy',        desc: 'Kích hoạt sự kiện, xem tất cả, phê duyệt cấp cao',   color: 'grad-a', perms: ['view.all','activate','approve.high'] },
    { id: 'unit_head',name: 'Trưởng đơn vị',      desc: 'Quản lý nhân sự & nhiệm vụ của đơn vị mình',         color: 'grad-b', perms: ['view.unit','assign.tasks','report.unit'] },
    { id: 'relief',   name: 'Trưởng đoàn cứu trợ',desc: 'Quản lý dự án cứu trợ, đội đi, ngân sách chuyến',    color: 'grad-c', perms: ['relief.manage','budget.commit','team.lead'] },
    { id: 'warehouse',name: 'Thủ kho',            desc: 'Cập nhật tồn kho, xuất nhập vật tư',                 color: 'grad-e', perms: ['inventory.edit','export.stock'] },
    { id: 'duty',     name: 'Cán bộ trực',        desc: 'Nhận/báo cáo nhiệm vụ, ghi nhật ký',                 color: 'grad-g', perms: ['task.receive','log.write'] },
    { id: 'audit',    name: 'Kiểm soát nội bộ',   desc: 'Xem báo cáo, audit log — chỉ đọc',                   color: 'grad-d', perms: ['view.all','audit.read'] },
    { id: 'viewer',   name: 'Người xem',          desc: 'Cư dân/khách — chỉ xem thông báo công khai',         color: 'grad-e', perms: ['view.public'] },
  ];

  // Assign a mock role to each person
  function assignMockRoles() {
    const map = {
      ct: 'bch', tgd: 'bch', pt1: 'bch', pt2: 'relief',
      cht: 'unit_head', chp1: 'unit_head', chp2: 'unit_head', atv: 'duty',
      tn1: 'unit_head', tn2: 'duty', eco1: 'unit_head', eco2: 'duty',
      ctn1: 'unit_head', nm1: 'unit_head', yp1: 'unit_head', dy1: 'unit_head',
      vp1: 'unit_head', vp2: 'warehouse', vp3: 'audit', vp4: 'duty',
      mkt1: 'unit_head', vpct1: 'super', it1: 'super', pc1: 'audit',
    };
    (window.PEOPLE || []).forEach(p => {
      if (!p.roleId) p.roleId = map[p.id] || 'duty';
    });
  }

  // ========================================================
  // TABS
  // ========================================================
  const TABS = [
    { k: 'overview',  l: 'Tổng quan',        icon: '📊' },
    { k: 'users',     l: 'Người dùng',       icon: '👥' },
    { k: 'roles',     l: 'Vai trò & Quyền',  icon: '🔐' },
    { k: 'units',     l: 'Đơn vị & Cơ sở',   icon: '🏢' },
    { k: 'tasklib',   l: 'Nhiệm vụ mẫu',     icon: '📋' },
    { k: 'scenarios', l: 'Kịch bản',         icon: '🎯' },
    { k: 'norms',     l: 'Định mức',         icon: '📦' },
    { k: 'cameras',   l: 'Camera',           icon: '📷' },
    { k: 'config',    l: 'Cấu hình',         icon: '⚙️' },
    { k: 'audit',     l: 'Audit Log',        icon: '📜' },
  ];

  function pushAudit(action, obj, detail) {
    ADMIN_STATE.auditLog.unshift({ t: Date.now(), actor: window.STATE?.me || 'system', action, obj, detail });
  }

  window.renderAdmin = function() {
    seedAuditLog();
    assignMockRoles();
    const el = $('adminContent');
    if (!el) return;
    const cur = ADMIN_STATE.activeTab;

    el.innerHTML = `
      <div class="alert-box ab-info mb">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z"/></svg>
        <div><b>Phân hệ Quản trị</b> — chỉ Super Admin có quyền truy cập đầy đủ. Mọi thay đổi được ghi vào <b>Audit Log</b> theo QĐ.03 Chương IX.</div>
      </div>

      <div class="grid" style="grid-template-columns:220px 1fr;gap:14px;align-items:start">
        <div class="card" style="position:sticky;top:calc(var(--topbar-h) + 20px)">
          <div class="card-b" style="padding:6px">
            <div class="stack" style="gap:2px">
              ${TABS.map(t => `
                <button class="nav-btn ${t.k===cur?'active':''}" style="width:100%" onclick="window.adminTab('${t.k}')">
                  <span style="width:18px;text-align:center">${t.icon}</span>
                  <span>${t.l}</span>
                </button>
              `).join('')}
            </div>
          </div>
        </div>
        <div id="adminTabContent"></div>
      </div>
    `;
    renderAdminTab();
  };

  window.adminTab = function(k) {
    ADMIN_STATE.activeTab = k;
    // Toggle active
    document.querySelectorAll('#adminContent .nav-btn').forEach(b => {
      b.classList.remove('active');
      if (b.textContent.trim().endsWith(TABS.find(t => t.k === k).l)) b.classList.add('active');
    });
    renderAdminTab();
  };

  function renderAdminTab() {
    const el = $('adminTabContent');
    if (!el) return;
    const renderers = {
      overview: renderOverview,
      users: renderUsers,
      roles: renderRoles,
      units: renderUnits,
      tasklib: renderTaskLib,
      scenarios: renderScenariosAdmin,
      norms: renderNorms,
      cameras: window.renderCameraAdmin || function (el) { el.innerHTML = '<div class="muted small">Đang tải...</div>'; },
      config: renderConfig,
      audit: renderAudit,
    };
    try { (renderers[ADMIN_STATE.activeTab] || renderOverview)(el); }
    catch(e) { console.warn(e); el.innerHTML = '<div class="alert-box ab-crit">Lỗi: ' + e.message + '</div>'; }
  }

  // ========================================================
  // OVERVIEW
  // ========================================================
  function renderOverview(el) {
    const users = window.PEOPLE.length;
    const online = window.PEOPLE.filter(p => p.online).length;
    const units = Object.keys(window.UNITS).length;
    const sites = window.SITES.length;
    const tasks = window.TASK_LIB.length;
    const scenarios = window.SCENARIOS.length;
    const reliefTotal = (window.RELIEF_PROJECTS || []).length;
    const auditEntries = ADMIN_STATE.auditLog.length;

    el.innerHTML = `
      <h2 style="color:var(--ink-heading);margin-bottom:14px">Tổng quan hệ thống</h2>

      <div class="grid g4 mb">
        <div class="stat"><div class="s-lbl">Người dùng</div><div class="s-val">${users}</div><div class="s-sub">${online} đang online</div></div>
        <div class="stat navy"><div class="s-lbl">Đơn vị</div><div class="s-val">${units}</div><div class="s-sub">${sites} cơ sở/công trường</div></div>
        <div class="stat good"><div class="s-lbl">Nhiệm vụ mẫu</div><div class="s-val">${tasks}</div><div class="s-sub">${scenarios} kịch bản</div></div>
        <div class="stat warn"><div class="s-lbl">Dự án cứu trợ</div><div class="s-val">${reliefTotal}</div><div class="s-sub">Toàn hệ thống</div></div>
      </div>

      <div class="grid" style="grid-template-columns:1.2fr 1fr;gap:14px">
        <div class="card">
          <div class="card-h"><h3>Sức khoẻ hệ thống</h3></div>
          <div class="card-b">
            <div class="stack">
              ${[
                { k: 'DB/Storage', v: 'Hoạt động', pct: 94, cls: 'good' },
                { k: 'API Weather (Open-Meteo)', v: 'Ổn định', pct: 98, cls: 'good' },
                { k: 'Zalo Notify API', v: '2 lần lỗi/24h', pct: 87, cls: '' },
                { k: 'SMS Gateway', v: 'Ổn định', pct: 99, cls: 'good' },
                { k: 'Backup tự động (03:00)', v: 'OK - 07:00 sáng nay', pct: 100, cls: 'good' },
                { k: 'Uptime 30 ngày', v: '99.94%', pct: 99, cls: 'good' },
              ].map(s => `<div>
                <div class="flex" style="gap:6px"><span class="small b">${s.k}</span><span class="right tiny muted">${s.v}</span></div>
                <div class="pbar ${s.cls==='good'?'':s.cls}" style="margin-top:4px"><div class="p-fill" style="width:${s.pct}%"></div></div>
              </div>`).join('')}
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-h"><h3>Hoạt động gần đây</h3>
            <button class="right btn btn-ghost btn-sm" onclick="window.adminTab('audit')">Toàn bộ →</button></div>
          <div class="card-b stack">
            ${ADMIN_STATE.auditLog.slice(0, 6).map(a => auditRow(a)).join('')}
          </div>
        </div>
      </div>

      <div class="card mt">
        <div class="card-h"><h3>Phân bổ người dùng theo vai trò</h3></div>
        <div class="card-b">
          <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px">
            ${ROLES.map(r => {
              const count = window.PEOPLE.filter(p => p.roleId === r.id).length;
              return `<div class="heat-tile ${count===0?'':count<3?'h1':'h2'}" style="cursor:pointer" onclick="window.adminTab('roles')">
                <div class="h-name">${r.name}</div>
                <div class="h-val" style="color:var(--teal-glow)">${count}</div>
                <div class="h-sub">${r.desc.substring(0, 40)}${r.desc.length > 40 ? '…' : ''}</div>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function auditRow(a) {
    const per = window.PEOPLE.find(p => p.id === a.actor);
    const actIcon = { create:'➕', update:'✏️', delete:'🗑', approve:'✓', assign:'👤', activate:'⚡', login:'🔓', export:'📤' }[a.action] || '•';
    const t = new Date(a.t).toLocaleString('vi-VN', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });
    return `<div style="display:flex;gap:10px;padding:8px 10px;background:var(--bg-3);border-radius:8px">
      <div class="avatar avatar-sm ${per?.gradient||''}">${per?.short||'?'}</div>
      <div style="flex:1;min-width:0">
        <div class="small"><span>${actIcon}</span> <b style="color:var(--ink-heading)">${per?.name||a.actor}</b> <span class="muted">${a.action}</span> <b>${a.obj}</b></div>
        <div class="tiny muted">${a.detail}</div>
      </div>
      <div class="tiny muted mono">${t}</div>
    </div>`;
  }

  // ========================================================
  // USERS
  // ========================================================
  function renderUsers(el) {
    el.innerHTML = `
      <div class="flex mb">
        <h2 style="color:var(--ink-heading)">Quản lý người dùng</h2>
        <span class="badge bg-teal">${window.PEOPLE.length} người</span>
        <div class="right flex">
          <input placeholder="Tìm theo tên, đơn vị…" id="userSearch" style="width:240px" oninput="window.filterUsers()">
          <select id="userFilter" onchange="window.filterUsers()" style="width:160px">
            <option value="">Tất cả vai trò</option>
            ${ROLES.map(r => `<option value="${r.id}">${r.name}</option>`).join('')}
          </select>
          <button class="btn btn-primary" onclick="window.openUserForm()">+ Thêm người dùng</button>
        </div>
      </div>

      <div class="card">
        <div class="card-b" style="padding:0">
          <table id="userTable">
            <thead><tr>
              <th style="width:60px">Ảnh</th>
              <th>Họ tên</th>
              <th>Chức vụ</th>
              <th>Đơn vị</th>
              <th>Vai trò hệ thống</th>
              <th>Điện thoại</th>
              <th>Trạng thái</th>
              <th style="width:120px">Thao tác</th>
            </tr></thead>
            <tbody id="userTableBody">
              ${userRows(window.PEOPLE)}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function userRows(list) {
    return list.map(p => {
      const role = ROLES.find(r => r.id === p.roleId) || ROLES[7];
      return `<tr>
        <td><div class="avatar avatar-sm ${p.gradient||''}">${p.short}</div></td>
        <td><b style="color:var(--ink-heading)">${p.name}</b><br><span class="tiny muted mono">${p.id}</span></td>
        <td class="small">${p.role}</td>
        <td class="small">${window.UNITS[p.unit]?.short || p.unit}</td>
        <td><span class="badge bg-teal">${role.name}</span></td>
        <td class="mono small">${p.phone}</td>
        <td>${p.online?'<span class="badge bg-good">● Online</span>':'<span class="badge bg-navy">○ Offline</span>'}</td>
        <td class="flex" style="gap:4px">
          <button class="btn btn-ghost btn-sm" onclick="window.openUserForm('${p.id}')">✏️</button>
          <button class="btn btn-ghost btn-sm" onclick="window.deleteUser('${p.id}')">🗑</button>
        </td>
      </tr>`;
    }).join('');
  }

  window.filterUsers = function() {
    const q = ($('userSearch')?.value || '').toLowerCase();
    const roleId = $('userFilter')?.value || '';
    const filtered = window.PEOPLE.filter(p => {
      const matchQ = !q || p.name.toLowerCase().includes(q) || (p.role||'').toLowerCase().includes(q) || (window.UNITS[p.unit]?.short || '').toLowerCase().includes(q);
      const matchR = !roleId || p.roleId === roleId;
      return matchQ && matchR;
    });
    const body = $('userTableBody');
    if (body) body.innerHTML = userRows(filtered) || '<tr><td colspan="8" class="muted small" style="text-align:center;padding:20px">Không tìm thấy người dùng</td></tr>';
  };

  window.openUserForm = function(id) {
    const p = id ? window.PEOPLE.find(x => x.id === id) : null;
    const isEdit = !!p;
    const modal = $('modal-admin-generic');
    modal.querySelector('.modal').innerHTML = `
      <div class="modal-h"><h3>${isEdit ? 'Sửa người dùng: ' + p.name : 'Thêm người dùng mới'}</h3>
        <button class="drawer-close right" onclick="window.closeModal('admin-generic')">✕</button>
      </div>
      <div class="modal-b">
        <div class="grid g2">
          <div><label class="small b" style="color:var(--ink-2)">Họ tên</label><input id="uf_name" value="${p?.name||''}"></div>
          <div><label class="small b" style="color:var(--ink-2)">Chức vụ</label><input id="uf_role" value="${p?.role||''}"></div>
          <div><label class="small b" style="color:var(--ink-2)">Đơn vị</label>
            <select id="uf_unit">
              ${Object.entries(window.UNITS).map(([k,v])=>`<option value="${k}" ${p?.unit===k?'selected':''}>${v.short}</option>`).join('')}
            </select>
          </div>
          <div><label class="small b" style="color:var(--ink-2)">Vai trò hệ thống</label>
            <select id="uf_roleId">
              ${ROLES.map(r=>`<option value="${r.id}" ${p?.roleId===r.id?'selected':''}>${r.name}</option>`).join('')}
            </select>
          </div>
          <div><label class="small b" style="color:var(--ink-2)">Điện thoại</label><input id="uf_phone" value="${p?.phone||''}" placeholder="09xx.***.xxx"></div>
          <div><label class="small b" style="color:var(--ink-2)">Trạng thái</label>
            <select id="uf_online">
              <option value="true" ${p?.online?'selected':''}>Online</option>
              <option value="false" ${!p?.online?'selected':''}>Offline</option>
            </select>
          </div>
        </div>
      </div>
      <div class="modal-f">
        <button class="btn btn-ghost" onclick="window.closeModal('admin-generic')">Huỷ</button>
        <button class="btn btn-primary" onclick="window.saveUser('${p?.id||''}')">💾 ${isEdit?'Lưu':'Tạo'}</button>
      </div>
    `;
    window.openModal('admin-generic');
  };

  window.saveUser = function(id) {
    const name = $('uf_name').value.trim();
    if (!name) { window.toast('Nhập họ tên', 'warn'); return; }
    const data = {
      name,
      role: $('uf_role').value.trim(),
      unit: $('uf_unit').value,
      roleId: $('uf_roleId').value,
      phone: $('uf_phone').value.trim(),
      online: $('uf_online').value === 'true',
    };
    if (id) {
      const p = window.PEOPLE.find(x => x.id === id);
      if (p) {
        Object.assign(p, data);
        pushAudit('update', 'Người dùng ' + name, 'Cập nhật thông tin');
        window.toast('✓ Đã cập nhật <b>' + name + '</b>', 'good');
      }
    } else {
      const nid = 'u' + Date.now();
      const short = name.split(' ').slice(-2).map(s => s[0]).join('').toUpperCase();
      const gradients = ['grad-a','grad-b','grad-c','grad-d','grad-e','grad-f','grad-g'];
      window.PEOPLE.push({
        id: nid, short, gradient: gradients[Math.floor(Math.random()*7)],
        ...data,
      });
      pushAudit('create', 'Người dùng ' + name, 'Thêm mới');
      window.toast('✓ Đã tạo <b>' + name + '</b>', 'good');
    }
    window.closeModal('admin-generic');
    renderUsers($('adminTabContent'));
  };

  window.deleteUser = function(id) {
    const p = window.PEOPLE.find(x => x.id === id);
    if (!p) return;
    if (!confirm(`Xoá "${p.name}"? Thao tác sẽ được ghi vào Audit Log.`)) return;
    const idx = window.PEOPLE.indexOf(p);
    window.PEOPLE.splice(idx, 1);
    pushAudit('delete', 'Người dùng ' + p.name, 'Xoá vĩnh viễn');
    window.toast('🗑 Đã xoá <b>' + p.name + '</b>', 'warn');
    renderUsers($('adminTabContent'));
  };

  // ========================================================
  // ROLES
  // ========================================================
  function renderRoles(el) {
    el.innerHTML = `
      <h2 style="color:var(--ink-heading);margin-bottom:14px">Vai trò & Phân quyền (RBAC)</h2>

      <div class="alert-box ab-info mb"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z"/></svg>
      <div>8 vai trò chuẩn theo <b>QĐ.03 Chương IV</b>. Mỗi người dùng được gán 1 vai trò chính. Có thể mở rộng permissions ở lớp API sau này.</div></div>

      <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px">
        ${ROLES.map(r => {
          const users = window.PEOPLE.filter(p => p.roleId === r.id);
          return `<div class="card">
            <div class="card-h">
              <div class="avatar avatar-sm ${r.color}" style="width:34px;height:34px;border-radius:8px">🔐</div>
              <h3>${r.name}</h3>
              <span class="right badge bg-teal">${users.length} người</span>
            </div>
            <div class="card-b">
              <div class="small muted mb">${r.desc}</div>
              <div class="tiny b" style="color:var(--teal-glow);margin-top:8px;letter-spacing:.08em">QUYỀN HẠN</div>
              <div class="flex" style="gap:4px;flex-wrap:wrap;margin-top:5px">
                ${r.perms.map(pm => `<span class="tag mono" style="font-size:10.5px">${pm}</span>`).join('')}
              </div>
              ${users.length ? `
                <div class="tiny b" style="color:var(--orange-glow);margin-top:10px;letter-spacing:.08em">NGƯỜI DÙNG (${users.length})</div>
                <div class="avatar-stack mt8">
                  ${users.slice(0, 8).map(u => `<div class="avatar avatar-sm ${u.gradient}" title="${u.name}">${u.short}</div>`).join('')}
                  ${users.length > 8 ? `<div class="avatar avatar-sm" style="background:var(--bg-4)">+${users.length-8}</div>` : ''}
                </div>
              ` : '<div class="tiny muted mt8" style="margin-top:8px">Chưa có người dùng nào</div>'}
            </div>
          </div>`;
        }).join('')}
      </div>
    `;
  }

  // ========================================================
  // UNITS & SITES
  // ========================================================
  function renderUnits(el) {
    el.innerHTML = `
      <div class="flex mb"><h2 style="color:var(--ink-heading)">Đơn vị & Cơ sở</h2>
        <div class="right"><button class="btn btn-primary" onclick="window.toast('Thêm đơn vị mới','info')">+ Thêm đơn vị</button></div>
      </div>

      <div class="grid" style="grid-template-columns:1fr 1fr;gap:14px">
        <div class="card">
          <div class="card-h"><h3>Đơn vị tổ chức</h3><span class="right badge bg-teal">${Object.keys(window.UNITS).length} đơn vị</span></div>
          <div class="card-b" style="padding:0">
            <table>
              <thead><tr><th>Mã</th><th>Tên đơn vị</th><th>Nhân sự</th><th>Vai trò</th></tr></thead>
              <tbody>
                ${Object.entries(window.UNITS).map(([code, u]) => {
                  const cnt = window.PEOPLE.filter(p => p.unit === code).length;
                  return `<tr>
                    <td class="mono tiny">${u.icon} ${code}</td>
                    <td><b style="color:var(--ink-heading)">${u.short}</b><br><span class="tiny muted">${u.name}</span></td>
                    <td class="mono">${cnt}</td>
                    <td><button class="btn btn-ghost btn-sm">Xem</button></td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="card-h"><h3>Cơ sở / Dự án · Kho</h3><span class="right badge bg-teal">${window.SITES.length} cơ sở</span></div>
          <div class="card-b" style="padding:0">
            <table>
              <thead><tr><th>Loại</th><th>Tên</th><th>Đơn vị</th><th>Nhân sự</th><th>Rủi ro</th></tr></thead>
              <tbody>
                ${window.SITES.map(s => {
                  const kindIcon = { construction:'🏗', residential:'🏢', hospitality:'🏨', warehouse:'📦' };
                  const riskB = { crit:'bg-crit', warn:'bg-warn', ok:'bg-good' };
                  return `<tr>
                    <td>${kindIcon[s.kind]||''}</td>
                    <td><b style="color:var(--ink-heading)">${s.name}</b><br><span class="tiny muted">${s.desc}</span></td>
                    <td class="small">${window.UNITS[s.unit]?.short||'—'}</td>
                    <td class="mono">${s.staff}</td>
                    <td><span class="badge ${riskB[s.risk]||''}">${s.risk.toUpperCase()}</span></td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // ========================================================
  // TASK LIB
  // ========================================================
  function renderTaskLib(el) {
    const byUnit = {};
    window.TASK_LIB.forEach(t => { byUnit[t.u] = (byUnit[t.u]||0) + 1; });
    const byPhase = {};
    window.TASK_LIB.forEach(t => { byPhase[t.p] = (byPhase[t.p]||0) + 1; });
    const byLevel = {};
    window.TASK_LIB.forEach(t => { byLevel[t.l] = (byLevel[t.l]||0) + 1; });

    el.innerHTML = `
      <div class="flex mb"><h2 style="color:var(--ink-heading)">Thư viện nhiệm vụ mẫu (TASK_LIB)</h2>
        <span class="badge bg-teal">${window.TASK_LIB.length} nhiệm vụ</span>
        <div class="right flex">
          <select id="tlUnit" onchange="window.filterTaskLib()">
            <option value="">Tất cả đơn vị</option>
            ${Object.entries(window.UNITS).map(([k,v])=>`<option value="${k}">${v.short}</option>`).join('')}
          </select>
          <select id="tlLevel" onchange="window.filterTaskLib()">
            <option value="">Tất cả cấp độ</option>
            ${window.LEVELS.map(l=>`<option value="${l.k}">${l.code}</option>`).join('')}
          </select>
          <input id="tlSearch" placeholder="Tìm nội dung nhiệm vụ…" style="width:260px" oninput="window.filterTaskLib()">
          <button class="btn btn-primary">+ Thêm nhiệm vụ mẫu</button>
        </div>
      </div>

      <div class="grid g4 mb">
        ${window.LEVELS.map(l => `<div class="heat-tile ${['h1','h2','h3','h4','h4'][l.k]}">
          <div class="h-name">Cấp ${l.k} — ${l.code}</div>
          <div class="h-val">${byLevel[l.k] || 0}</div>
          <div class="h-sub">Nhiệm vụ ở cấp này</div>
        </div>`).join('')}
      </div>

      <div class="card">
        <div class="card-b" style="padding:0">
          <table id="tlTable">
            <thead><tr>
              <th style="width:60px">Cấp</th>
              <th style="width:80px">Đơn vị</th>
              <th style="width:90px">Giai đoạn</th>
              <th>Nội dung nhiệm vụ</th>
              <th style="width:140px">Người thực hiện</th>
              <th style="width:120px">Kiểm tra</th>
              <th style="width:80px">Thao tác</th>
            </tr></thead>
            <tbody id="tlTableBody">${tlRows(window.TASK_LIB.slice(0, 40))}</tbody>
          </table>
          <div class="muted small" style="padding:12px 14px;text-align:center;border-top:1px solid var(--line)">Hiển thị 40/${window.TASK_LIB.length} nhiệm vụ. Dùng bộ lọc để thu hẹp.</div>
        </div>
      </div>
    `;
  }

  function tlRows(list) {
    return list.map((t, i) => `<tr>
      <td><span class="badge bg-lv${t.l}">C${t.l}</span></td>
      <td class="small">${window.UNITS[t.u]?.short||t.u}</td>
      <td class="tag" style="font-size:10.5px">${window.PHASES.find(x=>x.id===t.p)?.label||t.p}</td>
      <td class="small">${t.t}</td>
      <td class="tiny">${t.o||'—'}</td>
      <td class="tiny muted">${t.c||'—'}</td>
      <td class="flex" style="gap:2px">
        <button class="btn btn-ghost btn-sm">✏️</button>
        <button class="btn btn-ghost btn-sm">🗑</button>
      </td>
    </tr>`).join('');
  }

  window.filterTaskLib = function() {
    const q = ($('tlSearch')?.value || '').toLowerCase();
    const u = $('tlUnit')?.value;
    const l = $('tlLevel')?.value;
    const filtered = window.TASK_LIB.filter(t =>
      (!u || t.u === u) &&
      (!l || String(t.l) === l) &&
      (!q || (t.t || '').toLowerCase().includes(q))
    ).slice(0, 60);
    const body = $('tlTableBody');
    if (body) body.innerHTML = tlRows(filtered) || '<tr><td colspan="7" class="muted small" style="text-align:center;padding:20px">Không tìm thấy</td></tr>';
  };

  // ========================================================
  // SCENARIOS
  // ========================================================
  function renderScenariosAdmin(el) {
    el.innerHTML = `
      <div class="flex mb">
        <h2 style="color:var(--ink-heading)">Kịch bản ứng phó chuẩn</h2>
        <span class="badge bg-teal">${window.SCENARIOS.length} kịch bản</span>
        <button class="right btn btn-primary">+ Kịch bản mới</button>
      </div>

      <div class="card">
        <div class="card-b" style="padding:0">
          <table>
            <thead><tr>
              <th style="width:80px">Mã</th>
              <th style="width:60px">Nhóm</th>
              <th style="width:60px">Cấp</th>
              <th>Tên kịch bản</th>
              <th style="width:150px">Trigger</th>
              <th style="width:110px">Diễn tập</th>
              <th style="width:100px">Thao tác</th>
            </tr></thead>
            <tbody>
              ${window.SCENARIOS.map(s => `<tr>
                <td class="mono tiny b" style="color:var(--teal-glow)">${s.id}</td>
                <td><span class="badge ${s.g==='B'?'bg-warn':'bg-crit'}">${s.g==='B'?'🌀 PCLB':'🔥 PCCC'}</span></td>
                <td><span class="badge bg-lv${s.lv}">Cấp ${s.lv}</span></td>
                <td><b style="color:var(--ink-heading)">${s.name}</b></td>
                <td class="tiny muted">${s.trg.substring(0,80)}${s.trg.length>80?'…':''}</td>
                <td class="tiny">${s.drill?.substring(0,40)||'—'}</td>
                <td class="flex" style="gap:2px">
                  <button class="btn btn-ghost btn-sm">✏️</button>
                  <button class="btn btn-ghost btn-sm">▶</button>
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // ========================================================
  // NORMS
  // ========================================================
  function renderNorms(el) {
    el.innerHTML = `
      <div class="flex mb">
        <h2 style="color:var(--ink-heading)">Định mức vật tư & Cơ cấu chi phí</h2>
      </div>

      <div class="grid" style="grid-template-columns:1.5fr 1fr;gap:14px">
        <div class="card">
          <div class="card-h">
            <h3>Định mức vật tư (NORMS_V7)</h3>
            <span class="right badge bg-teal">${window.NORMS_V7.length} hạng mục</span>
          </div>
          <div class="card-b" style="padding:0">
            <table>
              <thead><tr><th>Hạng mục</th><th>ĐVT</th><th>TN</th><th>CTY</th><th>ECO</th><th>CTN</th><th></th></tr></thead>
              <tbody>
                ${window.NORMS_V7.slice(0, 15).map(row => {
                  const [cat, name, unit, tn, cty, eco, ctn] = row;
                  return `<tr>
                    <td><b style="color:var(--ink-heading)">${name}</b><br><span class="tiny muted">${cat}</span></td>
                    <td class="mono tiny">${unit}</td>
                    <td class="mono"><input value="${tn}" style="width:50px;padding:3px 6px;font-size:12px"></td>
                    <td class="mono"><input value="${cty}" style="width:50px;padding:3px 6px;font-size:12px"></td>
                    <td class="mono"><input value="${eco}" style="width:50px;padding:3px 6px;font-size:12px"></td>
                    <td class="mono"><input value="${ctn}" style="width:50px;padding:3px 6px;font-size:12px"></td>
                    <td><button class="btn btn-ghost btn-sm">💾</button></td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="card-h">
            <h3>Hạn mức thẩm quyền duyệt chi</h3>
          </div>
          <div class="card-b stack">
            <div class="alert-box ab-info">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></svg>
              <div class="tiny"><b>Nguyên tắc QĐ.03 Điều 41:</b> Mã sự kiện tách riêng; cấm cost-plus-%; hạn mức ủy quyền theo cấp độ.</div>
            </div>
            <table>
              <thead><tr><th>Vai trò</th><th>Hạn mức</th></tr></thead>
              <tbody>
                <tr><td><b style="color:var(--ink-heading)">Trưởng đơn vị / BQL</b></td><td><input value="5000000" style="width:120px"> đ</td></tr>
                <tr><td><b style="color:var(--ink-heading)">Giám đốc đơn vị</b></td><td><input value="20000000" style="width:120px"> đ</td></tr>
                <tr><td><b style="color:var(--ink-heading)">Tổng Giám đốc</b></td><td><input value="100000000" style="width:120px"> đ</td></tr>
                <tr><td><b style="color:var(--ink-heading)">Chủ tịch HĐQT</b></td><td class="b" style="color:var(--good)">Không giới hạn</td></tr>
              </tbody>
            </table>
            <button class="btn btn-primary btn-sm" onclick="window.toast('✓ Đã lưu hạn mức duyệt chi', 'good')">💾 Lưu thay đổi</button>
          </div>
        </div>
      </div>
    `;
  }

  // ========================================================
  // CONFIG
  // ========================================================
  function renderConfig(el) {
    el.innerHTML = `
      <h2 style="color:var(--ink-heading);margin-bottom:14px">Cấu hình hệ thống</h2>

      <div class="grid g2">
        <div class="card">
          <div class="card-h"><h3>Thương hiệu & Giao diện</h3></div>
          <div class="card-b stack">
            <div><label class="small b" style="color:var(--ink-2)">Tên tổ chức</label><input value="Cát Tường Group"></div>
            <div><label class="small b" style="color:var(--ink-2)">Địa chỉ</label><input value="TP Bắc Ninh, tỉnh Bắc Ninh"></div>
            <div><label class="small b" style="color:var(--ink-2)">Múi giờ</label><select><option>UTC+7 (Việt Nam)</option></select></div>
            <div><label class="small b" style="color:var(--ink-2)">Ngôn ngữ mặc định</label><select><option>Tiếng Việt</option><option>English</option></select></div>
            <div><label class="small b" style="color:var(--ink-2)">Giao diện</label><select><option>Dark (Command Center)</option><option>Light</option><option>Auto</option></select></div>
          </div>
        </div>

        <div class="card">
          <div class="card-h"><h3>Tích hợp API & Kênh thông báo</h3></div>
          <div class="card-b stack">
            <div><label class="small b" style="color:var(--ink-2)">Weather API (Open-Meteo)</label>
              <div class="flex"><input value="https://api.open-meteo.com/v1" style="flex:1"><span class="badge bg-good">● OK</span></div></div>
            <div><label class="small b" style="color:var(--ink-2)">Zalo Notify Service</label>
              <div class="flex"><input type="password" value="zns_••••••••••••" style="flex:1"><span class="badge bg-warn">2 lỗi/24h</span></div></div>
            <div><label class="small b" style="color:var(--ink-2)">SMS Gateway</label>
              <div class="flex"><input type="password" value="sms_••••••••••••" style="flex:1"><span class="badge bg-good">● OK</span></div></div>
            <div><label class="small b" style="color:var(--ink-2)">Email SMTP</label>
              <div class="flex"><input value="smtp.cattuong.com.vn:587" style="flex:1"><span class="badge bg-good">● OK</span></div></div>
            <div><label class="small b" style="color:var(--ink-2)">Trợ lý AI (LLM)</label>
              <div class="flex"><input value="gpt-5-mini via Genspark LLM proxy" style="flex:1" disabled><span class="badge bg-good">● OK</span></div></div>
            <div class="alert-box ab-info" style="margin-top:2px">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z"/></svg>
              <div class="tiny">Quản lý camera an ninh (URL luồng HLS/Embed theo từng camera) đã chuyển sang tab <b>📷 Camera</b> ở menu bên trái — không còn cấu hình 1 URL chung ở đây nữa.</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-h"><h3>Bảo mật & Session</h3></div>
          <div class="card-b stack">
            <div class="flex" style="gap:8px"><input type="checkbox" checked style="width:auto"><span class="small">Bắt buộc 2FA cho Super Admin và Ban Chỉ huy</span></div>
            <div class="flex" style="gap:8px"><input type="checkbox" checked style="width:auto"><span class="small">Timeout session 30 phút không hoạt động</span></div>
            <div class="flex" style="gap:8px"><input type="checkbox" checked style="width:auto"><span class="small">Ghi log tất cả hành động sửa/xoá</span></div>
            <div class="flex" style="gap:8px"><input type="checkbox" style="width:auto"><span class="small">Cho phép đăng nhập từ IP nội bộ only</span></div>
            <div><label class="small b" style="color:var(--ink-2)">Chính sách mật khẩu</label>
              <select><option>≥12 ký tự, có chữ hoa/số/ký tự đặc biệt</option><option>≥8 ký tự</option></select></div>
          </div>
        </div>

        <div class="card">
          <div class="card-h"><h3>Sao lưu & Khôi phục</h3></div>
          <div class="card-b stack">
            <div><label class="small b" style="color:var(--ink-2)">Lịch sao lưu tự động</label>
              <select><option>Hằng ngày 03:00</option><option>Hằng tuần</option><option>Tắt</option></select></div>
            <div><label class="small b" style="color:var(--ink-2)">Giữ backup trong</label>
              <select><option>90 ngày</option><option>30 ngày</option><option>1 năm</option></select></div>
            <div class="alert-box ab-ok">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
              <div class="tiny"><b>Backup mới nhất:</b> 03:00 hôm nay · 87 MB · OK</div>
            </div>
            <div class="flex">
              <button class="btn btn-primary btn-sm">💾 Sao lưu ngay</button>
              <button class="btn btn-ghost btn-sm">📥 Khôi phục từ file</button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex mt">
        <button class="right btn btn-primary btn-lg" onclick="window.toast('✓ Đã lưu cấu hình hệ thống', 'good')">💾 Lưu tất cả cấu hình</button>
      </div>
    `;
  }

  // ========================================================
  // AUDIT LOG
  // ========================================================
  function renderAudit(el) {
    el.innerHTML = `
      <div class="flex mb">
        <h2 style="color:var(--ink-heading)">Audit Log — Nhật ký hoạt động</h2>
        <span class="badge bg-teal">${ADMIN_STATE.auditLog.length} bản ghi</span>
        <div class="right flex">
          <select onchange="window.toast('Filter theo hành động','info')">
            <option>Tất cả hành động</option>
            <option>Tạo</option><option>Sửa</option><option>Xoá</option>
            <option>Duyệt</option><option>Kích hoạt</option>
          </select>
          <button class="btn btn-ghost btn-sm">📤 Xuất CSV</button>
        </div>
      </div>

      <div class="alert-box ab-info mb">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z"/></svg>
        <div>Theo QĐ.03 Điều 78, mọi hành động sửa/xoá dữ liệu quan trọng phải được ghi log với: người thực hiện, thời gian, đối tượng, chi tiết. Log không thể xoá bởi người dùng.</div>
      </div>

      <div class="card">
        <div class="card-b" style="padding:0">
          <table>
            <thead><tr>
              <th style="width:150px">Thời gian</th>
              <th style="width:180px">Người thực hiện</th>
              <th style="width:110px">Hành động</th>
              <th style="width:200px">Đối tượng</th>
              <th>Chi tiết</th>
            </tr></thead>
            <tbody>
              ${ADMIN_STATE.auditLog.map(a => {
                const per = window.PEOPLE.find(p => p.id === a.actor);
                const actLabels = { create:'Tạo mới', update:'Cập nhật', delete:'Xoá', approve:'Phê duyệt', assign:'Gán', activate:'Kích hoạt', login:'Đăng nhập', export:'Xuất dữ liệu' };
                const actCls = { create:'bg-good', update:'bg-teal', delete:'bg-crit', approve:'bg-teal', assign:'bg-navy', activate:'bg-warn', login:'bg-navy', export:'bg-teal' };
                return `<tr>
                  <td class="mono tiny">${new Date(a.t).toLocaleString('vi-VN')}</td>
                  <td>
                    <div class="flex" style="gap:8px">
                      <div class="avatar avatar-sm ${per?.gradient||''}">${per?.short||'?'}</div>
                      <div class="small">${per?.name||a.actor}</div>
                    </div>
                  </td>
                  <td><span class="badge ${actCls[a.action]||'bg-navy'}">${actLabels[a.action]||a.action}</span></td>
                  <td class="small"><b style="color:var(--ink-heading)">${a.obj}</b></td>
                  <td class="small muted">${a.detail}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // Hook
  window.MODULE_HOOKS = window.MODULE_HOOKS || {};
  window.MODULE_HOOKS.admin = window.renderAdmin;
})();
