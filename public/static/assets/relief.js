// ============================================================
// CTG RELIEF — Dự án cứu trợ thiên tai
// ============================================================
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);

  const RELIEF_STATE = { activeProject: null, activeTab: 'overview' };
  window.RELIEF_STATE = RELIEF_STATE;

  const fmtMoney = n => {
    if (n >= 1e9) return (n/1e9).toFixed(2) + ' tỷ';
    if (n >= 1e6) return (n/1e6).toFixed(0) + ' triệu';
    if (n >= 1e3) return (n/1e3).toFixed(0) + 'k';
    return n.toLocaleString('vi-VN');
  };
  const fmtDate = (d) => {
    if (!d) return '—';
    const dt = typeof d === 'string' ? new Date(d) : new Date(d);
    return String(dt.getDate()).padStart(2,'0') + '/' + String(dt.getMonth()+1).padStart(2,'0') + '/' + dt.getFullYear();
  };

  function statusBadge(status) {
    const s = window.RELIEF_STATUSES[status];
    return `<span class="badge ${s.cls}">${s.label}</span>`;
  }
  function personById(id) { return window.PEOPLE?.find(p => p.id === id); }

  // ========================================================
  // MAIN LIST
  // ========================================================
  window.renderReliefList = function() {
    const el = $('reliefContent');
    if (!el) return;
    RELIEF_STATE.activeProject = null;

    const projects = window.RELIEF_PROJECTS || [];
    const activeCnt = projects.filter(p => p.status === 'in-progress').length;
    const planningCnt = projects.filter(p => p.status === 'planning' || p.status === 'drafting').length;
    const completedCnt = projects.filter(p => p.status === 'completed').length;
    const totalBudget = projects.reduce((s, p) => s + (p.budget?.total || 0), 0);
    const totalHouseholds = projects.reduce((s, p) => s + (p.beneficiaries?.households || 0), 0);
    const totalPeople = projects.reduce((s, p) => s + (p.beneficiaries?.people || 0), 0);

    el.innerHTML = `
      <div class="grid g4 mb">
        <div class="stat crit"><div class="s-lbl">Đang triển khai</div><div class="s-val">${activeCnt}</div><div class="s-sub">Chiến dịch hiện tại</div></div>
        <div class="stat navy"><div class="s-lbl">Đang lập kế hoạch</div><div class="s-val">${planningCnt}</div><div class="s-sub">Sắp khởi động</div></div>
        <div class="stat good"><div class="s-lbl">Đã hoàn thành</div><div class="s-val">${completedCnt}</div><div class="s-sub">Trong lịch sử</div></div>
        <div class="stat"><div class="s-lbl">Tổng ngân sách</div><div class="s-val" style="font-size:22px">${fmtMoney(totalBudget)}</div><div class="s-sub">${totalHouseholds} hộ · ${totalPeople} người</div></div>
      </div>

      <div class="card mb">
        <div class="card-h">
          <h3>Bản đồ chiến dịch — Việt Nam</h3>
          <span class="badge bg-teal">${projects.length} dự án</span>
          <button class="btn btn-primary btn-sm right" onclick="window.openReliefNew()">+ Tạo dự án mới</button>
        </div>
        <div class="card-b" id="reliefMapCard" style="padding:8px"></div>
      </div>

      <div class="card">
        <div class="card-h">
          <h3>Danh sách dự án cứu trợ</h3>
          <div class="scenario-sw right" style="margin:0">
            <button class="on" onclick="window.filterRelief('all', this)">Tất cả</button>
            <button onclick="window.filterRelief('in-progress', this)">Đang chạy</button>
            <button onclick="window.filterRelief('planning', this)">Lập KH</button>
            <button onclick="window.filterRelief('completed', this)">Đã xong</button>
          </div>
        </div>
        <div class="card-b" id="reliefProjectGrid"></div>
      </div>
    `;

    renderReliefMap();
    renderProjectGrid('all');
  };

  window.filterRelief = function(status, btn) {
    document.querySelectorAll('.scenario-sw button').forEach(b => {
      if (b.closest('.card-h')) b.classList.remove('on');
    });
    btn.classList.add('on');
    renderProjectGrid(status);
  };

  function renderProjectGrid(status) {
    const el = $('reliefProjectGrid');
    if (!el) return;
    let list = window.RELIEF_PROJECTS;
    if (status !== 'all') list = list.filter(p => p.status === status);
    if (!list.length) {
      el.innerHTML = '<div class="muted small" style="padding:20px;text-align:center">Không có dự án ở trạng thái này.</div>';
      return;
    }
    el.innerHTML = `<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:12px">${list.map(p => {
      const spent = p.budget.spent || 0;
      const total = p.budget.total || 1;
      const pct = Math.round(spent / total * 100);
      const barCls = pct >= 90 ? 'warn' : pct >= 70 ? '' : '';
      return `<div class="card" style="background:var(--bg-3);cursor:pointer" onclick="window.openReliefProject('${p.id}')">
        <div class="card-h" style="border-bottom:1px solid var(--line);padding:10px 14px">
          <span class="tag" style="font-family:var(--mono)">${p.code}</span>
          ${statusBadge(p.status)}
          ${p.priority === 'critical' ? '<span class="badge bg-crit">⚠ Khẩn</span>' : p.priority === 'high' ? '<span class="badge bg-warn">Cao</span>' : ''}
        </div>
        <div class="card-b" style="padding:12px 14px">
          <div class="b" style="color:var(--ink-heading);font-size:14px;line-height:1.3;margin-bottom:6px">${p.name}</div>
          <div class="muted tiny">${p.disasterLabel} · ${p.region.province}</div>
          <div class="tiny mt8" style="color:var(--teal-glow);margin-top:8px">📅 ${fmtDate(p.startDate)} → ${fmtDate(p.endDate)} <span class="muted">(${p.days} ngày)</span></div>

          <div class="grid g2 mt8" style="gap:8px;margin-top:10px">
            <div>
              <div class="tiny muted">NGÂN SÁCH</div>
              <div class="b" style="color:var(--teal-glow);font-family:var(--mono);font-size:15px">${fmtMoney(p.budget.total)}</div>
              <div class="pbar ${barCls}" style="margin-top:3px"><div class="p-fill" style="width:${pct}%"></div></div>
              <div class="tiny muted">Đã chi ${pct}% · còn ${fmtMoney(total - spent)}</div>
            </div>
            <div>
              <div class="tiny muted">ĐỐI TƯỢNG</div>
              <div class="b" style="color:var(--ink-heading);font-family:var(--mono);font-size:15px">${p.beneficiaries.households} hộ</div>
              <div class="tiny muted" style="margin-top:5px">${p.beneficiaries.people} người</div>
            </div>
          </div>

          <div class="flex mt8" style="margin-top:10px;gap:6px;flex-wrap:wrap">
            ${p.team.slice(0, 5).map(t => {
              const per = personById(t.personId);
              return per ? `<div class="avatar avatar-sm ${per.gradient}" title="${per.name} — ${t.role}">${per.short}</div>` : '';
            }).join('')}
            ${p.team.length > 5 ? `<div class="avatar avatar-sm" style="background:var(--bg-4)">+${p.team.length-5}</div>` : ''}
            <span class="right tiny muted">${p.team.length} người tham gia</span>
          </div>
        </div>
      </div>`;
    }).join('')}</div>`;
  }

  // ========================================================
  // MAP (Vietnam stylized)
  // ========================================================
  function renderReliefMap() {
    const el = $('reliefMapCard');
    if (!el) return;
    // Simple stylized Vietnam with province markers
    const projects = window.RELIEF_PROJECTS.map((p, i) => {
      // Approximate position for known regions
      const pos = {
        'CTR-2026-BAVI':  { x: 30, y: 12 },  // Lào Cai Bắc Bộ
        'CTR-2025-QT':    { x: 46, y: 46 },  // QT-QB miền Trung
        'CTR-2024-YAGI':  { x: 34, y: 8 },   // HG-CB cực Bắc
        'CTR-2026-TRA':   { x: 44, y: 88 },  // Trà Vinh Nam Bộ
      };
      return { ...p, pos: pos[p.id] || { x: 50, y: 50 } };
    });

    el.innerHTML = `<div class="map-wrap" style="aspect-ratio:auto;height:340px;background:radial-gradient(circle at 50% 50%,#0F1A2C,#05080F)">
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" style="position:absolute;inset:0;width:100%;height:100%">
        <defs>
          <pattern id="rmGrid" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M 8 0 L 0 0 0 8" fill="none" stroke="rgba(46,67,99,.3)" stroke-width="0.1"/>
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#rmGrid)"/>

        <!-- Vietnam outline (very stylized S-shape) -->
        <path d="M 35 6 Q 25 8 22 15 L 28 20 L 32 28 L 28 32 L 36 40 L 40 46 L 44 52 L 42 60 L 46 68 L 44 76 L 48 84 L 44 92 L 40 95 Q 46 96 50 92 L 54 86 Q 58 80 56 72 Q 52 62 50 54 Q 48 46 44 38 Q 40 30 42 22 Q 44 14 40 8 Q 38 6 35 6 Z"
              fill="rgba(22,168,153,.08)" stroke="rgba(34,211,193,.5)" stroke-width="0.4"/>

        <!-- Region labels -->
        <text x="26" y="16" fill="#6F819C" font-size="2" font-weight="600">MIỀN BẮC</text>
        <text x="42" y="48" fill="#6F819C" font-size="2" font-weight="600">MIỀN TRUNG</text>
        <text x="46" y="86" fill="#6F819C" font-size="2" font-weight="600">MIỀN NAM</text>

        <!-- HQ Bắc Ninh -->
        <circle cx="34" cy="14" r="1.2" fill="#34D399"/>
        <text x="36" y="15" fill="#34D399" font-size="2" font-weight="700">Cát Tường HQ</text>
      </svg>

      ${projects.map(p => {
        const s = window.RELIEF_STATUSES[p.status];
        return `<div class="map-marker" style="left:${p.pos.x}%;top:${p.pos.y}%" onclick="window.openReliefProject('${p.id}')" title="${p.name}">
          <div class="mk-dot" style="background:${s.color};box-shadow:0 0 0 3px ${s.color}30,0 0 12px ${s.color}"></div>
          <div class="mk-label">${p.code} · ${p.beneficiaries.households} hộ</div>
        </div>`;
      }).join('')}

      <div class="map-legend">
        <div class="lg"><span class="sw" style="background:#F59E0B"></span> Đang chạy</div>
        <div class="lg"><span class="sw" style="background:#FACC15"></span> Đang lập KH</div>
        <div class="lg"><span class="sw" style="background:#22C55E"></span> Đã xong</div>
        <div class="lg"><span class="sw" style="background:#6F819C"></span> Phác thảo</div>
      </div>
    </div>`;
  }

  // ========================================================
  // PROJECT DETAIL
  // ========================================================
  window.openReliefProject = function(id) {
    const p = window.RELIEF_PROJECTS.find(x => x.id === id);
    if (!p) return;
    RELIEF_STATE.activeProject = p;
    RELIEF_STATE.activeTab = 'overview';
    renderProjectDetail();
  };
  window.backToReliefList = function() {
    window.renderReliefList();
  };

  const TABS = [
    { k: 'overview',   l: 'Tổng quan',        icon: '📊' },
    { k: 'team',       l: 'Đội đi',           icon: '👥' },
    { k: 'cargo',      l: 'Hàng cứu trợ',     icon: '📦' },
    { k: 'budget',     l: 'Ngân sách',        icon: '💰' },
    { k: 'itinerary',  l: 'Lịch trình',       icon: '🗺' },
    { k: 'tasks',      l: 'Nhiệm vụ',         icon: '✓' },
    { k: 'beneficiaries', l: 'Đối tượng',    icon: '🏠' },
    { k: 'reports',    l: 'Báo cáo · nhật ký', icon: '📄' },
  ];

  function renderProjectDetail() {
    const el = $('reliefContent');
    const p = RELIEF_STATE.activeProject;
    if (!el || !p) return;
    const cur = RELIEF_STATE.activeTab;

    el.innerHTML = `
      <div class="flex mb" style="gap:10px;flex-wrap:wrap">
        <button class="btn btn-ghost btn-sm" onclick="window.backToReliefList()">← Danh sách dự án</button>
        <span class="tag" style="font-family:var(--mono);font-size:12.5px">${p.code}</span>
        ${statusBadge(p.status)}
        ${p.priority === 'critical' ? '<span class="badge bg-crit">⚠ KHẨN</span>' : p.priority === 'high' ? '<span class="badge bg-warn">Ưu tiên cao</span>' : ''}
        <span class="right muted small">📅 ${fmtDate(p.startDate)} → ${fmtDate(p.endDate)} (${p.days} ngày)</span>
      </div>

      <h2 style="color:var(--ink-heading);font-size:22px;margin-bottom:14px;line-height:1.25">${p.name}</h2>

      <div class="phase-strip mb" id="reliefTabs">
        ${TABS.map(t => `<button class="${t.k===cur?'on':''}" onclick="window.reliefTab('${t.k}')">${t.icon} ${t.l}</button>`).join('')}
      </div>

      <div id="reliefTabContent"></div>
    `;
    renderTabContent();
  }

  window.reliefTab = function(k) {
    RELIEF_STATE.activeTab = k;
    const label = TABS.find(t => t.k === k)?.l;
    document.querySelectorAll('#reliefTabs button').forEach(b => {
      b.classList.toggle('on', b.textContent.trim().endsWith(label));
    });
    renderTabContent();
  };

  function renderTabContent() {
    const el = $('reliefTabContent');
    if (!el) return;
    const tab = RELIEF_STATE.activeTab;
    const renderers = {
      overview: renderTabOverview,
      team: renderTabTeam,
      cargo: renderTabCargo,
      budget: renderTabBudget,
      itinerary: renderTabItinerary,
      tasks: renderTabTasks,
      beneficiaries: renderTabBeneficiaries,
      reports: renderTabReports,
    };
    try { (renderers[tab] || renderTabOverview)(el); } catch(e) { console.warn(e); el.innerHTML = '<div class="alert-box ab-crit">Lỗi hiển thị tab: ' + e.message + '</div>'; }
  }

  function renderTabOverview(el) {
    const p = RELIEF_STATE.activeProject;
    const daysToStart = Math.ceil((new Date(p.startDate) - Date.now()) / 86400000);
    const daysActive = p.status === 'in-progress' ? Math.ceil((Date.now() - new Date(p.startDate)) / 86400000) : null;
    const spent = p.budget.spent;
    const total = p.budget.total;
    const doneTasks = p.tasks.filter(t => t.status === 'done').length;
    const totalTasks = p.tasks.length;

    el.innerHTML = `
      <div class="grid g4 mb">
        <div class="stat"><div class="s-lbl">Đối tượng thụ hưởng</div><div class="s-val">${p.beneficiaries.households}</div><div class="s-sub">Hộ · ${p.beneficiaries.people} người</div></div>
        <div class="stat navy"><div class="s-lbl">Ngân sách</div><div class="s-val" style="font-size:22px">${fmtMoney(total)}</div><div class="s-sub">Đã chi ${Math.round(spent/total*100)}%</div></div>
        <div class="stat good"><div class="s-lbl">Nhiệm vụ</div><div class="s-val">${doneTasks}/${totalTasks}</div><div class="s-sub">Đã hoàn thành</div></div>
        <div class="stat warn"><div class="s-lbl">${daysToStart > 0 ? 'Còn tới chuyến đi' : (daysActive ? 'Đang triển khai' : 'Đã kết thúc')}</div><div class="s-val">${daysToStart > 0 ? daysToStart : (daysActive || 0)}</div><div class="s-sub">Ngày</div></div>
      </div>

      <div class="grid" style="grid-template-columns:1.3fr 1fr;gap:14px">
        <div class="card">
          <div class="card-h"><h3>Thông tin chung</h3></div>
          <div class="card-b">
            <table>
              <tbody>
                <tr><td class="muted small" style="width:180px">Thảm hoạ</td><td><b>${p.disasterLabel}</b></td></tr>
                <tr><td class="muted small">Vùng cứu trợ</td><td>${p.region.province} — ${p.region.commune}</td></tr>
                <tr><td class="muted small">Toạ độ trung tâm</td><td class="mono tiny">${p.region.gps}</td></tr>
                <tr><td class="muted small">Thời gian</td><td>${fmtDate(p.startDate)} → ${fmtDate(p.endDate)} · <b>${p.days} ngày</b></td></tr>
                <tr><td class="muted small">Đội đi</td><td>${p.team.length} người · ${p.vehicles.length} xe</td></tr>
                <tr><td class="muted small">Trưởng đoàn</td><td>${personById(p.team[0]?.personId)?.name || '—'}</td></tr>
                <tr><td class="muted small">Trạng thái</td><td>${statusBadge(p.status)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="card-h"><h3>Trạng thái phê duyệt</h3></div>
          <div class="card-b stack">
            ${['ct','tgd','congdoan','phapche'].map(k => {
              const roleLabels = { ct: 'Chủ tịch HĐQT', tgd: 'Tổng Giám đốc', congdoan: 'Công đoàn', phapche: 'Pháp chế' };
              const s = window.APPROVAL_STATUSES[p.approvals[k] || 'draft'];
              return `<div class="flex" style="padding:8px 10px;background:var(--bg-3);border-radius:8px">
                <div class="b small" style="flex:1">${roleLabels[k]}</div>
                <span class="badge ${s.cls}">${s.icon} ${s.label}</span>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>

      ${p.outcome ? `
        <div class="card mt">
          <div class="card-h">
            <h3>Kết quả tổng kết</h3>
            <span class="badge bg-good">✓ Đã đóng dự án</span>
          </div>
          <div class="card-b">
            <div class="grid g4">
              <div><div class="tiny muted">Đã hỗ trợ</div><div class="b" style="color:var(--ink-heading);font-size:20px">${p.outcome.households} hộ</div><div class="tiny muted">${p.outcome.people} người</div></div>
              <div><div class="tiny muted">Tiền mặt trao</div><div class="b" style="color:var(--teal-glow);font-size:20px">${fmtMoney(p.outcome.moneyDistributed)}</div></div>
              <div><div class="tiny muted">Giá trị hàng hoá</div><div class="b" style="color:var(--teal-glow);font-size:20px">${fmtMoney(p.outcome.goodsValue)}</div></div>
              <div><div class="tiny muted">Truyền thông</div><div class="b small" style="color:var(--ink-heading);line-height:1.4">${p.outcome.pressCoverage}</div></div>
            </div>
            <div class="alert-box ab-ok mt"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
            <div>${p.outcome.livesImpacted}</div></div>
          </div>
        </div>
      ` : ''}
    `;
  }

  function renderTabTeam(el) {
    const p = RELIEF_STATE.activeProject;
    el.innerHTML = `
      <div class="flex mb">
        <span class="badge bg-teal">${p.team.length} người tham gia</span>
        <button class="btn btn-primary btn-sm right" onclick="window.toast('Chức năng thêm thành viên — trong prototype chỉ demo UI','info')">+ Thêm thành viên</button>
      </div>

      <div class="card">
        <div class="card-h"><h3>Danh sách đội đi & phân công vai trò</h3></div>
        <div class="card-b">
          ${p.team.map(t => {
            const per = personById(t.personId);
            if (!per) return '';
            return `<div class="person" style="padding:10px 12px;border-bottom:1px solid var(--line)">
              <div class="avatar avatar-lg ${per.gradient}">${per.short}</div>
              <div style="flex:1">
                <div class="p-name" style="font-size:14.5px">${per.name}</div>
                <div class="p-role">${t.role}</div>
                <div class="tiny muted mt8" style="margin-top:4px">Đơn vị gốc: ${window.UNITS[per.unit]?.short || per.unit}</div>
              </div>
              <div class="stack right" style="align-items:flex-end;gap:4px">
                <span class="mono small">📞 ${t.phone}</span>
                <span class="tiny ${per.online ? 'good' : 'muted'}" style="color:${per.online?'var(--good)':'var(--ink-3)'}">${per.online ? '● Online' : '○ Offline'}</span>
                <div class="flex" style="gap:4px">
                  <button class="btn btn-ghost btn-sm">💬 Chat</button>
                  <button class="btn btn-ghost btn-sm">📞 Gọi</button>
                </div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>

      <div class="card mt">
        <div class="card-h"><h3>Phương tiện di chuyển</h3></div>
        <div class="card-b">
          <table>
            <thead><tr><th>Loại xe</th><th>Biển số</th><th>Lái xe</th><th>Sức chứa</th></tr></thead>
            <tbody>
              ${p.vehicles.map(v => `<tr>
                <td><b style="color:var(--ink-heading)">${v.type}</b></td>
                <td class="mono">${v.plate}</td>
                <td>${v.driver}</td>
                <td class="muted small">${v.capacity}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderTabCargo(el) {
    const p = RELIEF_STATE.activeProject;
    const totalCost = p.cargo.reduce((s, c) => s + (c.cost || 0), 0);
    const totalItems = p.cargo.reduce((s, c) => s + (c.qty || 0), 0);
    el.innerHTML = `
      <div class="grid g3 mb">
        <div class="stat"><div class="s-lbl">Mặt hàng</div><div class="s-val">${p.cargo.length}</div><div class="s-sub">Loại hàng cứu trợ</div></div>
        <div class="stat navy"><div class="s-lbl">Tổng số lượng</div><div class="s-val">${totalItems.toLocaleString('vi-VN')}</div><div class="s-sub">Đơn vị</div></div>
        <div class="stat good"><div class="s-lbl">Giá trị hàng</div><div class="s-val" style="font-size:22px">${fmtMoney(totalCost)}</div><div class="s-sub">Không bao gồm hậu cần</div></div>
      </div>

      <div class="card">
        <div class="card-h">
          <h3>Danh mục hàng cứu trợ</h3>
          <button class="btn btn-primary btn-sm right" onclick="window.toast('Xuất checklist đóng gói (PDF) — demo','info')">🖨 Checklist đóng gói</button>
        </div>
        <div class="card-b">
          <table>
            <thead><tr><th>Mặt hàng</th><th>Số lượng</th><th>Tổng</th><th>Định mức</th><th>Giá trị</th></tr></thead>
            <tbody>
              ${p.cargo.map(c => `<tr>
                <td><b style="color:var(--ink-heading)">${c.item}</b></td>
                <td class="mono">${c.qty.toLocaleString('vi-VN')} ${c.unit}</td>
                <td class="small">${c.total}</td>
                <td class="muted small">${c.per}</td>
                <td class="mono b" style="color:var(--teal-glow)">${fmtMoney(c.cost)}</td>
              </tr>`).join('')}
              <tr style="background:var(--bg-3)">
                <td colspan="4" class="b" style="color:var(--ink-heading);text-align:right">Tổng cộng</td>
                <td class="mono b" style="color:var(--orange-glow);font-size:14px">${fmtMoney(totalCost)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderTabBudget(el) {
    const p = RELIEF_STATE.activeProject;
    const b = p.budget;
    const remaining = b.total - b.spent - b.committed;
    const sourcesTotal = b.sources.donation + b.sources.company + b.sources.sponsor;
    el.innerHTML = `
      <div class="grid" style="grid-template-columns:1fr 1fr;gap:14px">
        <div class="card">
          <div class="card-h"><h3>Nguồn kinh phí</h3></div>
          <div class="card-b">
            <div style="height:200px;position:relative;padding:20px 0">
              ${renderDonut(b.sources)}
            </div>
            <div class="stack mt">
              <div class="flex"><span class="sw" style="width:12px;height:12px;background:#34D399;border-radius:3px"></span>
                <span class="small">Quyên góp CBNV</span>
                <span class="right mono b" style="color:var(--teal-glow)">${fmtMoney(b.sources.donation)}</span></div>
              <div class="flex"><span class="sw" style="width:12px;height:12px;background:#F59E0B;border-radius:3px"></span>
                <span class="small">Ngân sách công ty</span>
                <span class="right mono b" style="color:var(--orange-glow)">${fmtMoney(b.sources.company)}</span></div>
              <div class="flex"><span class="sw" style="width:12px;height:12px;background:#A855F7;border-radius:3px"></span>
                <span class="small">Đối tác tài trợ</span>
                <span class="right mono b" style="color:#C084FC">${fmtMoney(b.sources.sponsor)}</span></div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-h"><h3>Tình trạng chi tiêu</h3></div>
          <div class="card-b">
            <div class="grid g3">
              <div><div class="tiny muted">TỔNG</div><div class="b mono" style="color:var(--ink-heading);font-size:22px">${fmtMoney(b.total)}</div></div>
              <div><div class="tiny muted">ĐÃ CHI</div><div class="b mono" style="color:var(--warn);font-size:22px">${fmtMoney(b.spent)}</div></div>
              <div><div class="tiny muted">CÒN LẠI</div><div class="b mono" style="color:var(--good);font-size:22px">${fmtMoney(remaining)}</div></div>
            </div>
            <div class="mt">
              <div class="tiny muted mb">Tiến độ giải ngân</div>
              <div class="pbar" style="height:14px"><div class="p-fill" style="width:${Math.round(b.spent/b.total*100)}%"></div></div>
              <div class="flex tiny muted mt8" style="justify-content:space-between">
                <span>${Math.round(b.spent/b.total*100)}% đã chi</span>
                <span>${Math.round(b.committed/b.total*100)}% cam kết</span>
                <span>${Math.round(remaining/b.total*100)}% chưa dùng</span>
              </div>
            </div>
            <hr>
            <div class="alert-box ab-info">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v4M12 16h.01M22 12A10 10 0 112 12a10 10 0 0120 0z"/></svg>
              <div class="tiny"><b>Hạn mức duyệt chi:</b><br>
                &lt;5tr: Trưởng đoàn · &lt;20tr: TGĐ · ≥20tr: Chủ tịch</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card mt">
        <div class="card-h">
          <h3>Chi tiết chi phí theo hạng mục</h3>
          <button class="btn btn-primary btn-sm right" onclick="window.toast('Xuất báo cáo tài chính (Excel)','good')">📊 Xuất Excel</button>
        </div>
        <div class="card-b">
          <table>
            <thead><tr><th>Hạng mục</th><th>Ngân sách</th><th>Đã chi</th><th>Còn lại</th><th>Tiến độ</th></tr></thead>
            <tbody>
              ${p.cargo.map((c, i) => {
                const spent = i < 3 && p.status === 'in-progress' ? c.cost : (p.status === 'completed' ? c.cost : 0);
                const pct = Math.round(spent/(c.cost||1)*100);
                return `<tr>
                  <td>${c.item}</td>
                  <td class="mono">${fmtMoney(c.cost)}</td>
                  <td class="mono">${fmtMoney(spent)}</td>
                  <td class="mono muted">${fmtMoney(c.cost - spent)}</td>
                  <td style="width:120px"><div class="pbar"><div class="p-fill" style="width:${pct}%"></div></div><div class="tiny mono muted">${pct}%</div></td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderDonut(sources) {
    const total = sources.donation + sources.company + sources.sponsor;
    if (!total) return '';
    const cx = 100, cy = 90, r = 65;
    let acc = 0;
    const data = [
      { v: sources.donation, c: '#34D399' },
      { v: sources.company,  c: '#F59E0B' },
      { v: sources.sponsor,  c: '#A855F7' },
    ];
    const paths = data.map(d => {
      const pct = d.v / total;
      const a1 = acc * Math.PI * 2 - Math.PI/2;
      acc += pct;
      const a2 = acc * Math.PI * 2 - Math.PI/2;
      const x1 = cx + Math.cos(a1) * r, y1 = cy + Math.sin(a1) * r;
      const x2 = cx + Math.cos(a2) * r, y2 = cy + Math.sin(a2) * r;
      const large = pct > 0.5 ? 1 : 0;
      return `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z" fill="${d.c}" opacity=".85"/>`;
    }).join('');
    return `<svg viewBox="0 0 200 180" style="width:100%;height:100%">
      ${paths}
      <circle cx="${cx}" cy="${cy}" r="30" fill="var(--bg-2)"/>
      <text x="${cx}" y="${cy-3}" text-anchor="middle" fill="#fff" font-size="14" font-weight="700" font-family="var(--mono)">${fmtMoney(total)}</text>
      <text x="${cx}" y="${cy+12}" text-anchor="middle" fill="#A6B5CC" font-size="8">tổng quỹ</text>
    </svg>`;
  }

  function renderTabItinerary(el) {
    const p = RELIEF_STATE.activeProject;
    if (!p.itinerary || !p.itinerary.length) {
      el.innerHTML = '<div class="alert-box ab-info"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg><div>Dự án đang lập kế hoạch. Chưa có lịch trình chi tiết.</div></div>';
      return;
    }
    const totalKm = p.itinerary.reduce((s, d) => {
      const m = String(d.distance).match(/(\d+)/);
      return s + (m ? parseInt(m[1]) : 0);
    }, 0);

    el.innerHTML = `
      <div class="grid g3 mb">
        <div class="stat"><div class="s-lbl">Số ngày</div><div class="s-val">${p.days}</div><div class="s-sub">Chuyến đi tổng thể</div></div>
        <div class="stat navy"><div class="s-lbl">Tổng quãng đường</div><div class="s-val">${totalKm.toLocaleString('vi-VN')} km</div><div class="s-sub">Cả đi + về</div></div>
        <div class="stat good"><div class="s-lbl">Điểm trao</div><div class="s-val">${p.itinerary.filter(d => d.to && !d.to.includes('Bắc Ninh')).length}</div><div class="s-sub">Địa điểm chính</div></div>
      </div>

      <div class="card">
        <div class="card-h">
          <h3>Lịch trình chi tiết theo ngày</h3>
          <button class="btn btn-primary btn-sm right" onclick="window.toast('Xuất lịch trình PDF/Google Sheet','good')">🗺 Xuất lịch trình</button>
        </div>
        <div class="card-b">
          <div class="stack">
            ${p.itinerary.map((d, i) => {
              const isToday = false; // could compute
              return `<div class="alert-box ${isToday ? 'ab-warn' : 'ab-info'}" style="padding:12px 14px">
                <div style="width:52px;flex:none;text-align:center">
                  <div class="mono b" style="color:var(--teal-glow);font-size:15px">N-${d.day}</div>
                  <div class="tiny muted">${d.date}</div>
                </div>
                <div style="flex:1">
                  <div class="b" style="color:var(--ink-heading);font-size:13.5px">📍 ${d.from} → ${d.to} <span class="tag" style="margin-left:6px">${d.distance}</span></div>
                  <div class="small mt8" style="margin-top:6px;color:var(--ink-2);line-height:1.55">${d.activities}</div>
                  ${d.sleepAt && d.sleepAt !== '—' ? `<div class="tiny muted mt8" style="margin-top:4px">🛏 Nghỉ đêm: ${d.sleepAt}</div>` : ''}
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function renderTabTasks(el) {
    const p = RELIEF_STATE.activeProject;
    const done = p.tasks.filter(t => t.status === 'done').length;
    const doing = p.tasks.filter(t => t.status === 'doing' || t.status === 'ack').length;
    const issued = p.tasks.filter(t => t.status === 'issued').length;
    el.innerHTML = `
      <div class="grid g4 mb">
        <div class="stat"><div class="s-lbl">Tổng nhiệm vụ</div><div class="s-val">${p.tasks.length}</div></div>
        <div class="stat good"><div class="s-lbl">Đã xong</div><div class="s-val">${done}</div></div>
        <div class="stat warn"><div class="s-lbl">Đang làm</div><div class="s-val">${doing}</div></div>
        <div class="stat navy"><div class="s-lbl">Chưa nhận</div><div class="s-val">${issued}</div></div>
      </div>

      <div class="card">
        <div class="card-h">
          <h3>Danh sách nhiệm vụ chuẩn bị & thực hiện</h3>
          <button class="btn btn-primary btn-sm right" onclick="window.toast('Thêm nhiệm vụ mới — demo UI','info')">+ Thêm nhiệm vụ</button>
        </div>
        <div class="card-b stack">
          ${p.tasks.map(t => {
            const per = personById(t.owner);
            const badges = {
              issued:  '<span class="badge bg-navy">📮 Chưa nhận</span>',
              ack:     '<span class="badge bg-teal">✓ Đã nhận</span>',
              doing:   '<span class="badge bg-warn">⏳ Đang làm</span>',
              done:    '<span class="badge bg-good">✅ Hoàn thành</span>',
            };
            const overdue = new Date(t.deadline) < Date.now() && t.status !== 'done';
            return `<div class="task ${overdue?'overdue':''} ${t.status==='done'?'done':''}">
              <div class="avatar ${per?.gradient||''}">${per?.short||'?'}</div>
              <div class="t-body">
                <div class="t-title">${t.title}</div>
                <div class="flex mt8" style="gap:6px;flex-wrap:wrap;margin-top:5px">
                  <span class="tag">📅 ${fmtDate(t.deadline)}</span>
                  <span class="tag">Giao cho: ${per?.name || '—'}</span>
                  ${overdue ? '<span class="tag" style="color:var(--crit);border-color:var(--lv3-line)">⚠ Quá hạn</span>' : ''}
                  ${badges[t.status]}
                </div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
    `;
  }

  function renderTabBeneficiaries(el) {
    const p = RELIEF_STATE.activeProject;
    el.innerHTML = `
      <div class="grid g3 mb">
        <div class="stat"><div class="s-lbl">Tổng hộ</div><div class="s-val">${p.beneficiaries.households}</div><div class="s-sub">${p.beneficiaries.people} người</div></div>
        <div class="stat warn"><div class="s-lbl">Hộ ưu tiên</div><div class="s-val">${p.beneficiaries.priority.length}</div><div class="s-sub">Nhóm ưu tiên</div></div>
        <div class="stat good"><div class="s-lbl">Trao thành công</div><div class="s-val">${p.status==='completed'?p.beneficiaries.households:(p.status==='in-progress'?Math.floor(p.beneficiaries.households*0.6):0)}</div><div class="s-sub">Hộ đã nhận</div></div>
      </div>

      <div class="card">
        <div class="card-h"><h3>Nhóm ưu tiên</h3></div>
        <div class="card-b stack">
          ${p.beneficiaries.priority.map(g => `<div class="alert-box ab-warn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l10 18H2L12 3z"/><path d="M12 10v4.5M12 17.6v.4"/></svg>
            <div>${g}</div>
          </div>`).join('')}
        </div>
      </div>

      <div class="card mt">
        <div class="card-h">
          <h3>Danh sách hộ thụ hưởng (mẫu — 8/${p.beneficiaries.households})</h3>
          <button class="btn btn-primary btn-sm right" onclick="window.toast('Nhập danh sách hộ từ Excel','info')">📥 Nhập từ Excel</button>
        </div>
        <div class="card-b">
          <table>
            <thead><tr><th>STT</th><th>Họ tên chủ hộ</th><th>Địa chỉ</th><th>Số nhân khẩu</th><th>Loại hỗ trợ</th><th>Trạng thái</th></tr></thead>
            <tbody>
              ${sampleHouseholds(p).map((h, i) => `<tr>
                <td class="mono">${i+1}</td>
                <td><b style="color:var(--ink-heading)">${h.name}</b><br><span class="tiny muted">CCCD: ${h.id}</span></td>
                <td class="small">${h.addr}</td>
                <td class="mono">${h.members}</td>
                <td><span class="badge bg-teal">${h.type}</span></td>
                <td>${h.status === 'done' ? '<span class="badge bg-good">✓ Đã nhận</span>' : h.status === 'planned' ? '<span class="badge bg-navy">⏳ Kế hoạch</span>' : '<span class="badge bg-warn">Chưa xác nhận</span>'}</td>
              </tr>`).join('')}
            </tbody>
          </table>
          <div class="alert-box ab-info mt"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>
          <div class="tiny">Trong prototype hiển thị 8 hộ mẫu. Danh sách đầy đủ sẽ được nhập từ Excel do MTTQ địa phương cung cấp, có xác thực CCCD và biên bản ký nhận.</div></div>
        </div>
      </div>
    `;
  }

  function sampleHouseholds(p) {
    const names = ['Nguyễn Văn Đại', 'Lò Thị Sao', 'Vàng A Chớ', 'Hoàng Thị Xuân', 'Giàng A Súa', 'Ma Thị Phúc', 'Đặng Văn Tân', 'Sùng Thị Mảy'];
    const addrs = ['Thôn Bản Dền, xã A Mú Sung', 'Bản Cốc Sam, xã Cốc Ly', 'Thôn Lùng Chin Thượng, Sín Chéng', 'Bản Nậm Đét, xã Nậm Đét', 'Thôn Sảng Ma Sáo, Bát Xát', 'Thôn Pờ Chồ, Bắc Hà', 'Bản Cao Sơn, Si Ma Cai', 'Thôn Cốc Rế, xã Bản Mế'];
    const types = ['Hộ ưu tiên (khuyết tật)', 'Hộ nghèo', 'Hộ mất nhà', 'Hộ có trẻ nhỏ', 'Hộ đơn thân', 'Hộ ưu tiên (mất người)', 'Hộ nghèo', 'Hộ nghèo'];
    const statuses = p.status === 'completed' ? ['done','done','done','done','done','done','done','done']
                    : p.status === 'in-progress' ? ['done','done','done','done','planned','planned','planned','planned']
                    : ['planned','planned','planned','planned','planned','planned','planned','planned'];
    return names.map((n, i) => ({
      name: n,
      id: '****' + Math.floor(1000 + Math.random() * 9000),
      addr: addrs[i],
      members: 2 + (i % 5),
      type: types[i],
      status: statuses[i],
    }));
  }

  function renderTabReports(el) {
    const p = RELIEF_STATE.activeProject;
    el.innerHTML = `
      <div class="grid" style="grid-template-columns:1.3fr 1fr;gap:14px">
        <div class="card">
          <div class="card-h">
            <h3>Nhật ký thực địa</h3>
            <span class="right badge bg-teal">${p.logs.length} bản ghi</span>
          </div>
          <div class="card-b stack">
            ${p.logs.map(l => {
              const per = personById(l.author);
              const t = new Date(l.time).toLocaleString('vi-VN', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });
              return `<div style="display:flex;gap:10px;padding:8px 10px;background:var(--bg-3);border-radius:8px">
                <div class="avatar avatar-sm ${per?.gradient||''}">${per?.short||'?'}</div>
                <div style="flex:1">
                  <div class="flex" style="gap:6px;font-size:12px"><b style="color:var(--ink-heading)">${per?.name||'?'}</b><span class="muted mono tiny">${t}</span></div>
                  <div class="small" style="margin-top:3px;color:var(--ink-2)">${l.msg}</div>
                </div>
              </div>`;
            }).join('')}
          </div>
          <div class="card-b" style="border-top:1px solid var(--line)">
            <div class="chat-composer">
              <input placeholder="Ghi nhật ký thực địa (chỉ trưởng đoàn/thư ký)…">
              <button class="btn btn-primary btn-sm" onclick="window.toast('Đã ghi nhật ký — demo','good')">↑ Ghi</button>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-h"><h3>Bộ báo cáo dự án</h3></div>
          <div class="card-b stack">
            ${['Kế hoạch tổng thể (BC-01)', 'Danh sách hộ thụ hưởng (BC-02)', 'Báo cáo tài chính (BC-03)', 'Nhật ký thực địa (BC-04)', 'Ảnh & Truyền thông (BC-05)', 'Báo cáo tổng kết & AAR (BC-06)'].map((r, i) => `
              <div class="flex" style="padding:10px 12px;background:var(--bg-3);border-radius:8px;gap:10px">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal-glow)" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/><path d="M14 2v6h6"/></svg>
                <div style="flex:1">
                  <div class="b small" style="color:var(--ink-heading)">${r}</div>
                  <div class="tiny muted">${i<3 && (p.status === 'completed' || p.status === 'in-progress') ? '✓ Đã ký · ' + fmtDate(p.startDate) : '○ Chưa nộp'}</div>
                </div>
                <button class="btn btn-ghost btn-sm">${i<3 && (p.status === 'completed' || p.status === 'in-progress') ? '📄 Xem' : '✏️ Soạn'}</button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // ========================================================
  // NEW PROJECT WIZARD
  // ========================================================
  window.openReliefNew = function() {
    window.toast('Wizard tạo dự án mới — 4 bước: Thông tin cơ bản → Đối tượng → Ngân sách → Đội đi. Demo hiển thị UI danh sách.', 'info', 5500);
  };

  // Hook
  window.MODULE_HOOKS = window.MODULE_HOOKS || {};
  window.MODULE_HOOKS.relief = window.renderReliefList;
})();
