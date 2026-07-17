// ============================================================
// CTG MODULES — per-section renderers
// ============================================================
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const q = (sel) => document.querySelector(sel);
  const qa = (sel) => document.querySelectorAll(sel);

  window.MODULE_HOOKS = window.MODULE_HOOKS || {};

  // ========================================================
  // DASHBOARD
  // ========================================================
  function renderDashboard() {
    // KPIs
    const p = window.taskProgress();
    $('kTotal').textContent = p.total;
    $('kAck').textContent = p.total ? Math.round(p.ack / p.total * 100) + '%' : '—';
    $('kDone').textContent = p.total ? Math.round(p.done / p.total * 100) + '%' : '—';
    $('kRisk').textContent = p.overdue;

    // Event badge
    const eb = $('eventBadge');
    if (window.SIM.eventName) {
      eb.textContent = '📣 ' + window.SIM.eventName;
      eb.style.display = '';
    } else {
      eb.style.display = 'none';
    }

    // Map
    const dashMap = $('dashMap');
    if (dashMap && !dashMap.dataset.done) {
      window.renderBacNinhMap(dashMap, {
        onSelect: (s) => window.toast(`<b>${s.name}</b><br>${s.desc}<br><span class="muted small">Nhân sự tại chỗ: ${s.staff}</span>`, 'info', 4000),
      });
      dashMap.dataset.done = '1';
    }

    // Weather forecast (mock 5 hourly points)
    const wxF = $('wxForecast');
    if (wxF) {
      const wx = window.SIM.scenario === 'storm'
        ? [
            {h:'07:00', t:29, ico:'🌫', desc:'Nhiều mây'},
            {h:'10:00', t:28, ico:'🌧', desc:'Mưa nhỏ'},
            {h:'13:00', t:27, ico:'⛈', desc:'Mưa dông'},
            {h:'16:00', t:26, ico:'🌀', desc:'Bão đổ bộ'},
            {h:'19:00', t:26, ico:'🌀', desc:'Bão suy yếu'},
          ]
        : [
            {h:'07:00', t:30, ico:'☀️', desc:'Nắng nhẹ'},
            {h:'10:00', t:32, ico:'🌤', desc:'Ít mây'},
            {h:'13:00', t:33, ico:'☀️', desc:'Nắng'},
            {h:'16:00', t:31, ico:'🌤', desc:'Ít mây'},
            {h:'19:00', t:29, ico:'🌙', desc:'Mát'},
          ];
      wxF.innerHTML = wx.map(w => `
        <div style="background:var(--bg-3);border:1px solid var(--line);border-radius:8px;padding:8px;text-align:center">
          <div class="tiny muted">${w.h}</div>
          <div style="font-size:22px;line-height:1;margin:4px 0">${w.ico}</div>
          <div style="font-family:var(--mono);font-weight:700;color:var(--ink-heading);font-size:14px">${w.t}°</div>
          <div class="tiny" style="color:var(--ink-3)">${w.desc}</div>
        </div>
      `).join('');
    }

    // Timeline mini
    renderTimelineMini();

    // Leaderboard
    renderLeaderboard();

    // Risk heatmap
    renderRiskHeatmap();

    // Camera grid
    renderCamGrid('camGrid', window.SIM.scenario === 'fire' ? ['HIJKL','OPQRT','S','KHO_TT'] : ['HIJKL','OPQRT','TN','KHO_TT']);

    // Recent log
    renderRecentLog();
  }
  window.MODULE_HOOKS.dashboard = renderDashboard;

  function renderTimelineMini() {
    const tl = $('tlMini');
    if (!tl) return;
    const scenario = window.SIM.scenario;
    let items;
    if (scenario === 'storm') {
      items = [
        { t: 'T-72h', d: '22/07 08:00', text: 'NCHMF phát bản tin bão BAVI trên Biển Đông', st: 'past' },
        { t: 'T-48h', d: '23/07 12:00', text: 'Kích hoạt Cấp 2 – CAM', st: 'past' },
        { t: 'T-24h', d: '24/07 06:00', text: 'Bão KHẨN CẤP · Kích hoạt Cấp 3', st: 'past' },
        { t: 'T-6h',  d: '25/07 06:00', text: 'Sơ tán · dừng thi công · trực 24/24', st: 'now' },
        { t: 'T+0',   d: '25/07 12:00', text: 'Bão đổ bộ · gió cấp 10', st: '' },
        { t: 'T+24h', d: '26/07 12:00', text: 'Khắc phục · đánh giá thiệt hại', st: '' },
      ];
    } else if (scenario === 'fire') {
      items = [
        { t: '06:12', d: 'Hôm nay', text: 'ATV phát hiện khói khu B tầng 3', st: 'past' },
        { t: '06:14', d: 'Hôm nay', text: 'Chuông báo cháy · gọi 114', st: 'past' },
        { t: '06:15', d: 'Hôm nay', text: 'Đội PCCC cơ sở triển khai · sơ tán', st: 'now' },
        { t: '06:30', d: 'Dự kiến', text: 'Xe cứu hoả 114 tới hiện trường', st: '' },
        { t: '07:00', d: 'Dự kiến', text: 'Kiểm điểm quân số · lập biên bản', st: '' },
      ];
    } else {
      items = [
        { t: '06:00', d: 'Hôm nay', text: 'Trực đêm bàn giao ca sáng', st: 'past' },
        { t: '06:30', d: 'Hôm nay', text: 'Phát bản tin thời tiết Zalo', st: 'past' },
        { t: '08:00', d: 'Hôm nay', text: 'Kiểm tra thiết bị PCCC định kỳ', st: 'now' },
        { t: '16:30', d: 'Hôm nay', text: 'Bản tin thời tiết chiều', st: '' },
        { t: '19:00', d: 'Hôm nay', text: 'Chốt báo cáo đóng cửa các cụm', st: '' },
      ];
    }
    tl.innerHTML = items.map(i => `
      <div style="display:flex;gap:10px;align-items:flex-start;padding:6px 8px;border-radius:6px;${i.st==='now'?'background:rgba(243,146,0,.08);border:1px solid rgba(243,146,0,.3)':''}">
        <div style="width:52px;flex:none">
          <div style="font-family:var(--mono);font-size:11.5px;font-weight:700;color:${i.st==='now'?'var(--orange-glow)':i.st==='past'?'var(--ink-4)':'var(--teal-glow)'}">${i.t}</div>
          <div class="tiny muted">${i.d}</div>
        </div>
        <div style="flex:1;font-size:12px;color:${i.st==='past'?'var(--ink-3)':'var(--ink)'}">${i.text}</div>
      </div>
    `).join('');
  }

  function renderLeaderboard() {
    const el = $('leaderboard');
    if (!el) return;
    const lbl = $('unitProgLbl');
    if (!window.STATE.tasks.length) {
      el.innerHTML = '<div class="card-b muted small">Kích hoạt sự kiện để xem xếp hạng đơn vị theo tiến độ chấp hành nhiệm vụ.</div>';
      lbl.textContent = 'Chưa có sự kiện';
      lbl.className = 'right badge bg-navy';
      return;
    }
    const rows = window.unitProgress();
    lbl.textContent = rows.length + ' đơn vị · TB ' + Math.round(rows.reduce((s,r) => s+r.pct, 0) / rows.length) + '%';
    lbl.className = 'right badge bg-teal';
    const medals = ['gold', 'silver', 'bronze'];
    el.innerHTML = rows.map((r, i) => {
      const u = window.UNITS[r.unit] || { short: r.unit, icon: '❓' };
      const cls = medals[i] || '';
      const barCls = r.pct >= 80 ? '' : r.pct >= 50 ? 'warn' : 'crit';
      return `<div class="lb-row ${cls}">
        <div class="lb-rank">${i < 3 ? ['🥇','🥈','🥉'][i] : '#'+(i+1)}</div>
        <div>
          <div class="lb-name">${u.icon} ${u.short}</div>
          <div class="lb-sub">${r.done}/${r.total} nhiệm vụ hoàn thành</div>
          <div class="pbar ${barCls}" style="width:200px;margin-top:5px"><div class="p-fill" style="width:${r.pct}%"></div></div>
        </div>
        <div class="lb-score">${r.pct}%</div>
        <button class="btn btn-ghost btn-sm" onclick="window.filterByUnit('${r.unit}')">Chi tiết →</button>
      </div>`;
    }).join('');
  }

  window.filterByUnit = function(u) {
    window.go('activation');
    window.toast(`Lọc theo đơn vị: ${window.UNITS[u]?.short || u}`, 'info');
  };

  function renderRiskHeatmap() {
    const el = $('riskHeatmap');
    if (!el) return;
    const scenario = window.SIM.scenario;
    // combine SITES with a computed risk value
    const items = window.SITES.filter(s => s.kind !== 'warehouse').map(s => {
      let v = s.risk === 'crit' ? 82 : s.risk === 'warn' ? 55 : 24;
      if (scenario === 'storm') v += 15;
      if (scenario === 'fire' && s.id === 'HIJKL') v = 96;
      v = Math.min(99, v);
      const h = v >= 80 ? 'h4' : v >= 60 ? 'h3' : v >= 40 ? 'h2' : 'h1';
      return { ...s, v, h };
    }).sort((a,b) => b.v - a.v);
    el.innerHTML = items.map(s => `
      <div class="heat-tile ${s.h}" onclick="window.toast('<b>${s.name}</b><br>${s.desc}', 'info', 4000)">
        <div class="h-name">${s.name}</div>
        <div class="h-val">${s.v}<span style="font-size:12px;color:var(--ink-3)">/100</span></div>
        <div class="h-sub">${s.staff} người · ${s.h==='h4'?'CAO':s.h==='h3'?'Cảnh giác':s.h==='h2'?'Trung bình':'Thấp'}</div>
      </div>
    `).join('');
  }

  function renderCamGrid(elId, siteIds) {
    const el = $(elId);
    if (!el) return;
    const cams = siteIds.map((id, i) => {
      const s = window.byId(window.SITES, id) || { name:id };
      const isAlert = window.SIM.scenario === 'fire' && id === 'HIJKL';
      return { s, isAlert, num: 'CAM-'+String(i+1).padStart(2,'0') };
    });
    el.innerHTML = cams.map(c => {
      const timestamp = new Date().toTimeString().slice(0,8);
      return `<div class="cam ${c.isAlert?'alert':''}" onclick="window.openModal('cam-'+'${c.s.id}')">
        <div class="cam-scene"></div>
        <div class="cam-hud">
          <div class="flex" style="justify-content:space-between;width:100%">
            <div class="live">${c.isAlert?'ALERT':'LIVE'}</div>
            <div class="cam-label">${c.num}</div>
          </div>
          <div class="flex" style="justify-content:space-between;width:100%">
            <div style="font-size:10px;background:rgba(0,0,0,.6);padding:2px 6px;border-radius:4px">${c.s.name}</div>
            <div style="font-size:10px;background:rgba(0,0,0,.6);padding:2px 6px;border-radius:4px;font-family:var(--mono)">${timestamp}</div>
          </div>
        </div>
      </div>`;
    }).join('');
  }

  window.renderRecentLog = function () {
    const el = $('recentLog');
    if (!el) return;
    const logs = window.STATE.logs.slice(0, 6);
    if (!logs.length) {
      el.innerHTML = '<div class="muted small">Chưa có sự kiện nào được ghi nhận trong phiên làm việc này.</div>';
      return;
    }
    el.innerHTML = logs.map(l => {
      const cls = l.level === 'crit' ? 'ab-crit' : l.level === 'warn' ? 'ab-warn' : 'ab-info';
      const t = new Date(l.time).toLocaleTimeString('vi-VN', { hour:'2-digit', minute:'2-digit' });
      return `<div class="alert-box ${cls}"><span style="font-family:var(--mono);font-weight:700">${t}</span><div>${l.msg}</div></div>`;
    }).join('');
  };

  // ========================================================
  // ACTIVATION
  // ========================================================
  function renderActivation() {
    // Level picker
    const lp = $('levelPicker');
    if (lp) {
      lp.innerHTML = window.LEVELS.map((lv, i) => `
        <button class="lv-card ${lv.cls}-c ${i===window.SIM.level?'selected':''}" onclick="window.selectLevel(${i})">
          <div class="lv-t" style="color:currentColor">${lv.qd}</div>
          <h4>${lv.code}</h4>
          <div class="tiny muted mt8" style="margin-top:6px">${lv.name}</div>
          <div class="lv-d">${lv.trigger}</div>
          <div class="tiny mt8" style="color:var(--teal-glow);margin-top:8px">EOC: ${lv.eoc}</div>
        </button>
      `).join('');
    }

    // Phase strip
    renderPhaseStrip();
    renderTaskList();
  }
  window.MODULE_HOOKS.activation = renderActivation;

  window.selectLevel = function(k) {
    document.querySelectorAll('.lv-card').forEach((el, i) => el.classList.toggle('selected', i === k));
    window.SIM._pendingLevel = k;
  };

  window.confirmActivate = function() {
    const k = window.SIM._pendingLevel ?? window.SIM.level;
    const name = $('inpName').value.trim() || 'Sự kiện chưa đặt tên';
    window.SIM.eventName = name;
    window.applyLevel(k);
    window.generateTasksForLevel(k);
    const lv = window.LEVELS[k];
    window.pushLog(`⚡ Kích hoạt ${lv.code} — ${lv.name}. Sự kiện: ${name}. Sinh ${window.STATE.tasks.length} nhiệm vụ.`, k >= 3 ? 'crit' : k >= 2 ? 'warn' : 'info');
    window.toast(`⚡ Đã kích hoạt <b>${lv.code}</b> — ${window.STATE.tasks.length} nhiệm vụ đã phát tới ${new Set(window.STATE.tasks.map(t=>t.ownerId)).size} nhân sự`, 'warn', 4500);
    renderActivation();
    if (window.MODULE_HOOKS.dashboard) window.MODULE_HOOKS.dashboard();
    if (window.MODULE_HOOKS.my) window.MODULE_HOOKS.my();
  };

  const STATE_PHASE_FILTER = { activation: 'ALL' };

  function renderPhaseStrip() {
    const el = $('phaseStrip');
    if (!el) return;
    if (!window.STATE.tasks.length) {
      el.innerHTML = '';
      el.style.display = 'none';
      return;
    }
    el.style.display = '';
    // Count per phase
    const counts = {};
    window.STATE.tasks.forEach(t => { counts[t.phase] = (counts[t.phase]||0) + 1; });
    const cur = STATE_PHASE_FILTER.activation;
    const btns = ['ALL', ...Object.keys(counts)].map(p => {
      const label = p === 'ALL' ? 'Tất cả' : (window.PHASES.find(x=>x.id===p)?.label || p);
      const c = p === 'ALL' ? window.STATE.tasks.length : counts[p];
      return `<button class="${cur===p?'on':''}" onclick="window.setPhaseFilter('${p}')">${label} <span class="cnt">${c}</span></button>`;
    }).join('');
    el.innerHTML = btns;
  }
  window.setPhaseFilter = function(p) {
    STATE_PHASE_FILTER.activation = p;
    renderPhaseStrip();
    renderTaskList();
  };

  function renderTaskList() {
    const el = $('taskList');
    if (!el) return;
    const cnts = $('taskCounts');
    if (!window.STATE.tasks.length) {
      el.innerHTML = '<div class="muted small">Chưa kích hoạt sự kiện. Chọn cấp độ ở Bước 1 để phát nhiệm vụ.</div>';
      if (cnts) cnts.textContent = '0 nhiệm vụ';
      return;
    }
    if (cnts) cnts.textContent = window.STATE.tasks.length + ' nhiệm vụ';
    const filter = STATE_PHASE_FILTER.activation;
    const filtered = filter === 'ALL' ? window.STATE.tasks : window.STATE.tasks.filter(t => t.phase === filter);
    el.innerHTML = filtered.map(t => taskCardHTML(t)).join('') || '<div class="muted small">Không có nhiệm vụ ở giai đoạn này.</div>';
  }

  function taskCardHTML(t) {
    const p = window.byId(window.PEOPLE, t.ownerId);
    const unit = window.UNITS[t.unit] || { short: t.unit, icon: '❓' };
    const now = window.SIM.now.getTime();
    const overdue = t.deadline < now && t.status !== 'done';
    const dueStr = new Date(t.deadline).toLocaleString('vi-VN', { hour:'2-digit', minute:'2-digit', day:'2-digit', month:'2-digit' });
    const remainMs = t.deadline - now;
    const remainStr = remainMs > 0
      ? Math.floor(remainMs / 3600000) + 'h' + String(Math.floor((remainMs % 3600000) / 60000)).padStart(2,'0') + 'p'
      : 'quá ' + Math.floor(-remainMs / 3600000) + 'h';
    const statusBadge = {
      issued:  '<span class="badge bg-navy">📮 Đã phát</span>',
      ack:     '<span class="badge bg-teal">✓ Đã nhận</span>',
      doing:   '<span class="badge bg-warn">⏳ Đang làm</span>',
      done:    '<span class="badge bg-good">✅ Hoàn thành</span>',
      overdue: '<span class="badge bg-crit">⚠ Quá hạn</span>',
    }[overdue && t.status !== 'done' ? 'overdue' : t.status] || '';
    return `<div class="task ${overdue && t.status !== 'done' ? 'overdue' : ''} ${t.status==='done'?'done':''}" onclick="window.openTaskDetail('${t.id}')">
      <div class="avatar ${p?.gradient||''}">${p?.short||'?'}</div>
      <div class="t-body">
        <div class="flex" style="gap:6px;flex-wrap:wrap">
          <span class="tag">${unit.icon} ${unit.short}</span>
          <span class="tag">${window.PHASES.find(x=>x.id===t.phase)?.label || t.phase}</span>
          <span class="tag">📅 ${dueStr}</span>
          <span class="tag ${overdue?'':''}" style="${overdue?'color:var(--crit);border-color:var(--lv3-line)':''}">⏱ ${remainStr}</span>
          ${statusBadge}
        </div>
        <div class="t-title" style="margin-top:6px">${t.title}</div>
        <div class="t-desc">${t.desc}</div>
        <div class="tiny muted" style="margin-top:6px">Giao cho: <b style="color:var(--ink-2)">${p?.name||'?'}</b> · ${p?.role||''}</div>
      </div>
    </div>`;
  }

  window.openTaskDetail = function(id) {
    const t = window.STATE.tasks.find(x => x.id === id);
    if (!t) return;
    const p = window.byId(window.PEOPLE, t.ownerId);
    const body = $('modalTaskBody');
    $('modalTaskTitle').textContent = t.title;
    body.innerHTML = `
      <div class="person mb"><div class="avatar ${p?.gradient||''}">${p?.short||'?'}</div>
        <div><div class="p-name">${p?.name}</div><div class="p-role">${p?.role}</div></div>
        <span class="right badge bg-teal">${p?.phone||''}</span>
      </div>
      <div class="alert-box ab-info mb"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>
      <div>${t.desc}</div></div>
      <div class="grid g2" style="gap:8px">
        <div><label class="small b" style="color:var(--ink-2)">Đơn vị</label><div class="mono">${(window.UNITS[t.unit]?.short)||t.unit}</div></div>
        <div><label class="small b" style="color:var(--ink-2)">Giai đoạn</label><div>${window.PHASES.find(x=>x.id===t.phase)?.label||t.phase}</div></div>
        <div><label class="small b" style="color:var(--ink-2)">Deadline</label><div class="mono">${new Date(t.deadline).toLocaleString('vi-VN')}</div></div>
        <div><label class="small b" style="color:var(--ink-2)">Trạng thái</label><div>${t.status}</div></div>
      </div>
      <label class="small b mt" style="color:var(--ink-2)">Ghi chú/ảnh xác nhận</label>
      <textarea id="taskNote" rows="3" placeholder="Ghi chú thực hiện, số bao cát đã sử dụng, sự cố phát sinh…">${t.note||''}</textarea>
    `;
    $('modalTaskAck').onclick = () => {
      t.status = 'doing';
      window.pushLog(`✓ ${p?.name} đã xác nhận nhiệm vụ: ${t.title}`, 'info');
      window.closeModal('task'); renderTaskList();
      if (window.MODULE_HOOKS.my) window.MODULE_HOOKS.my();
      if (window.MODULE_HOOKS.dashboard) window.MODULE_HOOKS.dashboard();
    };
    $('modalTaskDone').onclick = () => {
      t.status = 'done';
      t.note = $('taskNote').value;
      window.pushLog(`✅ ${p?.name} hoàn thành: ${t.title}`, 'info');
      window.closeModal('task'); renderTaskList();
      if (window.MODULE_HOOKS.my) window.MODULE_HOOKS.my();
      if (window.MODULE_HOOKS.dashboard) window.MODULE_HOOKS.dashboard();
    };
    window.openModal('task');
  };

  // ========================================================
  // MY TASKS
  // ========================================================
  const MY_TAB = { cur: 'all' };

  function renderMy() {
    const me = window.byId(window.PEOPLE, window.STATE.me);
    if (!me) return;
    const av = $('myAvatar');
    av.className = 'avatar avatar-lg ' + (me.gradient||'');
    av.textContent = me.short;
    $('myName').textContent = me.name;
    $('myRole').textContent = me.role;
    $('myUnitBadge').textContent = window.UNITS[me.unit]?.name || me.unit;
    $('myPhone').textContent = '📞 ' + me.phone;

    const mine = window.myTasks();
    const doing = mine.filter(t => t.status === 'ack' || t.status === 'doing').length;
    const done = mine.filter(t => t.status === 'done').length;
    const now = window.SIM.now.getTime();
    const over = mine.filter(t => t.deadline < now && t.status !== 'done').length;
    $('myKTotal').textContent = mine.length;
    $('myKDoing').textContent = doing;
    $('myKDone').textContent = done;
    $('myKOver').textContent = over;

    // Task list by tab
    const el = $('myTaskList');
    const tab = MY_TAB.cur;
    let list = mine;
    if (tab === 'new') list = mine.filter(t => t.status === 'issued');
    else if (tab === 'doing') list = mine.filter(t => t.status === 'ack' || t.status === 'doing');
    else if (tab === 'done') list = mine.filter(t => t.status === 'done');
    if (!list.length) {
      el.innerHTML = `<div class="muted small" style="padding:20px;text-align:center">${!mine.length?'Bạn chưa được giao nhiệm vụ. Kích hoạt một sự kiện để thấy nhiệm vụ.':'Không có nhiệm vụ trong tab này.'}</div>`;
    } else {
      el.innerHTML = list.map(t => taskCardHTML(t)).join('');
    }

    // Attach tab clicks
    qa('#myTabs button').forEach(b => {
      b.classList.toggle('on', b.dataset.tab === tab);
      b.onclick = () => { MY_TAB.cur = b.dataset.tab; renderMy(); };
    });

    // Org tree
    renderMyOrgTree(me);
  }
  window.MODULE_HOOKS.my = renderMy;

  window.ackAllMine = function() {
    const mine = window.myTasks();
    mine.forEach(t => { if (t.status === 'issued') t.status = 'doing'; });
    window.pushLog(`✓ ${window.byId(window.PEOPLE, window.STATE.me)?.name} xác nhận nhận toàn bộ ${mine.length} nhiệm vụ.`, 'info');
    window.toast('✓ Đã xác nhận nhận toàn bộ nhiệm vụ', 'good');
    renderMy();
    if (window.MODULE_HOOKS.dashboard) window.MODULE_HOOKS.dashboard();
  };

  function renderMyOrgTree(me) {
    const el = $('myOrgTree');
    if (!el) return;
    // Simple org structure: me's unit -> subordinates in same unit
    const subs = window.peopleOfUnit(me.unit).filter(p => p.id !== me.id);
    if (!subs.length) {
      el.innerHTML = '<div class="muted small">Bạn không có người báo cáo trực tiếp trong đơn vị này.</div>';
      return;
    }
    el.innerHTML = subs.map(sub => {
      const subTasks = window.STATE.tasks.filter(t => t.ownerId === sub.id);
      const done = subTasks.filter(t => t.status === 'done').length;
      const pct = subTasks.length ? Math.round(done / subTasks.length * 100) : 0;
      const barCls = pct >= 80 ? '' : pct >= 50 ? 'warn' : 'crit';
      return `<div class="org-node" onclick="this.classList.toggle('open');this.nextElementSibling?.classList.toggle('open')">
        <svg class="caret" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>
        <div class="avatar avatar-sm ${sub.gradient||''}">${sub.short}</div>
        <div style="flex:1">
          <div class="p-name">${sub.name}</div>
          <div class="p-role">${sub.role}</div>
        </div>
        <div class="right stack" style="align-items:flex-end;gap:2px">
          <span class="mono b" style="color:var(--teal-glow);font-size:13px">${done}/${subTasks.length}</span>
          <div class="pbar ${barCls}" style="width:80px"><div class="p-fill" style="width:${pct}%"></div></div>
        </div>
      </div>
      <div class="org-children">
        ${subTasks.length ? subTasks.map(t => `<div class="tag" style="display:block;padding:6px 8px">${t.status==='done'?'✅':'○'} ${t.title}</div>`).join('') : '<div class="muted tiny">Chưa được giao nhiệm vụ.</div>'}
      </div>`;
    }).join('');
  }

  // ========================================================
  // PCCC
  // ========================================================
  function renderPccc() {
    // Floorplan
    const fp = $('pcccFloorplan');
    if (fp && !fp.dataset.done) {
      fp.innerHTML = `
        <svg viewBox="0 0 800 500" style="width:100%;height:100%">
          <defs>
            <pattern id="fpGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(46,67,99,.3)" stroke-width="0.5"/>
            </pattern>
          </defs>
          <rect width="800" height="500" fill="url(#fpGrid)"/>
          <!-- Building outline -->
          <rect x="100" y="80" width="600" height="360" fill="rgba(22,168,153,.05)" stroke="rgba(34,211,193,.5)" stroke-width="2"/>
          <!-- Rooms -->
          <rect x="100" y="80" width="180" height="120" fill="none" stroke="rgba(107,125,155,.4)" stroke-width="1"/>
          <text x="190" y="145" text-anchor="middle" fill="#6F819C" font-size="11" font-weight="600">Khu A · Văn phòng</text>
          <rect x="280" y="80" width="240" height="180" fill="rgba(239,68,68,.08)" stroke="rgba(239,68,68,.4)" stroke-width="1" stroke-dasharray="4 2"/>
          <text x="400" y="175" text-anchor="middle" fill="#FCA5A5" font-size="12" font-weight="700">Khu B · Xưởng · CẢNH BÁO</text>
          <rect x="520" y="80" width="180" height="120" fill="none" stroke="rgba(107,125,155,.4)"/>
          <text x="610" y="145" text-anchor="middle" fill="#6F819C" font-size="11">Khu C · Kho vật tư</text>
          <rect x="100" y="260" width="180" height="180" fill="none" stroke="rgba(107,125,155,.4)"/>
          <text x="190" y="355" text-anchor="middle" fill="#6F819C" font-size="11">Khu D · Nhà ăn</text>
          <rect x="520" y="260" width="180" height="180" fill="none" stroke="rgba(107,125,155,.4)"/>
          <text x="610" y="355" text-anchor="middle" fill="#6F819C" font-size="11">Khu E · Bãi tập kết</text>
          <!-- Escape routes -->
          <path d="M 400 260 L 400 470" stroke="#22C55E" stroke-width="3" stroke-dasharray="6 4"/>
          <text x="410" y="470" fill="#22C55E" font-size="10" font-weight="600">Thoát hiểm chính →</text>
          <!-- Fire alarm zone -->
          <g style="animation:pulse-glow 1.4s infinite">
            <circle cx="400" cy="170" r="20" fill="rgba(239,68,68,.3)" stroke="#EF4444" stroke-width="2"/>
            <text x="400" y="176" text-anchor="middle" font-size="18">🔥</text>
          </g>
          <!-- Extinguishers -->
          <g>
            <circle cx="150" cy="180" r="8" fill="#EF4444"/>
            <text x="150" y="184" text-anchor="middle" font-size="11" fill="#fff" font-weight="700">🧯</text>
          </g>
          <g>
            <circle cx="450" cy="240" r="8" fill="#EF4444"/>
            <text x="450" y="244" text-anchor="middle" font-size="11" fill="#fff" font-weight="700">🧯</text>
          </g>
          <g>
            <circle cx="650" cy="180" r="8" fill="#EF4444"/>
            <text x="650" y="184" text-anchor="middle" font-size="11" fill="#fff" font-weight="700">🧯</text>
          </g>
          <!-- Personnel dots -->
          <circle cx="200" cy="120" r="5" fill="#34D399"/>
          <circle cx="220" cy="130" r="5" fill="#34D399"/>
          <circle cx="350" cy="200" r="5" fill="#F59E0B"/>
          <circle cx="380" cy="220" r="5" fill="#F59E0B"/>
          <circle cx="600" cy="380" r="5" fill="#34D399"/>
          <!-- Legend -->
          <g transform="translate(20, 465)">
            <circle cx="0" cy="0" r="5" fill="#34D399"/><text x="10" y="4" fill="#A6B5CC" font-size="10">Nhân sự an toàn</text>
            <circle cx="130" cy="0" r="5" fill="#F59E0B"/><text x="140" y="4" fill="#A6B5CC" font-size="10">Cần sơ tán</text>
            <text x="240" y="4" fill="#EF4444" font-size="10">🧯 Bình cứu hoả</text>
            <text x="370" y="4" fill="#22C55E" font-size="10">→ Đường thoát</text>
          </g>
        </svg>
      `;
      fp.dataset.done = '1';
    }

    // Fire steps — shape [num, title, desc, sla]
    const steps = $('fireSteps');
    if (steps && window.FIRE_STEPS) {
      steps.innerHTML = window.FIRE_STEPS.map((row, i) => {
        const [num, title, desc, sla] = row;
        return `<div class="alert-box ab-warn">
          <div style="width:28px;height:28px;border-radius:50%;background:var(--crit);color:#fff;display:grid;place-items:center;font-weight:700;flex:none">${num || (i+1)}</div>
          <div style="flex:1"><b style="color:#FECACA">${title}</b> <span class="tag" style="margin-left:6px">⏱ ${sla}</span><br>
          <span class="small muted">${desc}</span></div>
        </div>`;
      }).join('');
    }

    // PCCC cameras
    renderCamGrid('pcccCams', ['HIJKL','OPQRT','S','TN']);
    const alertBanner = $('pcccCamAlert');
    if (alertBanner) alertBanner.style.display = window.SIM.scenario === 'fire' ? '' : 'none';
    const stt = $('pcccStatus');
    if (stt) {
      if (window.SIM.scenario === 'fire') {
        stt.textContent = '🔥 ĐANG XỬ LÝ CHÁY'; stt.className = 'right badge bg-crit';
      } else {
        stt.textContent = 'Sẵn sàng'; stt.className = 'right badge bg-good';
      }
    }

    // PCCC inv — shape [name, unit, tn, cty, eco, ctn, note, alert]
    const inv = $('pcccInv');
    if (inv && window.PCCC_INV) {
      inv.innerHTML = `<table>
        <thead><tr><th>Vật tư</th><th>ĐVT</th><th>TN</th><th>CTY</th><th>ECO</th><th>CTN</th><th></th></tr></thead>
        <tbody>${window.PCCC_INV.slice(0, 10).map(row => {
          const [name, unit, tn, cty, eco, ctn, note, alert] = row;
          return `<tr class="${alert?'':''}" ${alert?'style="background:rgba(239,68,68,.06)"':''}>
            <td><b style="color:var(--ink-heading)">${name}</b>${note?`<br><span class="tiny muted">${note}</span>`:''}</td>
            <td class="mono tiny">${unit}</td>
            <td class="mono">${tn}</td>
            <td class="mono">${cty}</td>
            <td class="mono">${eco}</td>
            <td class="mono">${ctn}</td>
            <td>${alert?'<span class="badge bg-crit">⚠</span>':'<span class="badge bg-good">✓</span>'}</td>
          </tr>`;
        }).join('')}</tbody>
      </table>`;
    }
  }
  window.MODULE_HOOKS.pccc = renderPccc;

  // ========================================================
  // SCENARIO
  // ========================================================
  function renderScenarios() {
    const el = $('scenarioList');
    if (!el || !window.SCENARIOS) return;
    // Group by g (B = bão/PCLB, C = cháy/PCCC)
    const groupB = window.SCENARIOS.filter(s => s.g === 'B');
    const groupC = window.SCENARIOS.filter(s => s.g === 'C');
    const renderGroup = (arr, title, icon) => `
      <div class="mb"><h3 style="color:var(--ink);margin:14px 0 8px">${icon} ${title}</h3>
        <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:10px">
          ${arr.map((s, gi) => {
            const idx = window.SCENARIOS.indexOf(s);
            const lv = window.LEVELS[s.lv] || { code:'?', cls:'lv0' };
            return `<div class="card" style="background:var(--bg-3)">
              <div class="card-h">
                <span class="badge bg-${lv.cls}">${s.id}</span>
                <span class="badge bg-navy">Cấp ${s.lv}</span>
                <button class="right btn btn-primary btn-sm" onclick="window.drillScenario(${idx})">▶ Diễn tập</button>
              </div>
              <div class="card-b">
                <div class="b" style="color:var(--ink-heading);font-size:13.5px;margin-bottom:6px">${s.name}</div>
                <div class="tiny b" style="color:var(--teal-glow);margin-top:8px;letter-spacing:.08em">TRIGGER</div>
                <div class="small muted">${s.trg}</div>
                <div class="tiny b" style="color:var(--orange-glow);margin-top:8px;letter-spacing:.08em">GIẢ ĐỊNH</div>
                <div class="small muted">${s.asm}</div>
                <div class="tiny b" style="color:var(--info);margin-top:8px;letter-spacing:.08em">HÀNH ĐỘNG</div>
                <ol style="margin:4px 0 0 18px;font-size:12px;color:var(--ink-2);line-height:1.6">
                  ${(s.act || []).map(a => `<li>${a}</li>`).join('')}
                </ol>
                <div class="alert-box ab-ok mt8" style="margin-top:8px">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
                  <div class="tiny"><b>SLA:</b> ${s.sla}</div>
                </div>
                <div class="tiny muted mt8" style="margin-top:6px">🎯 Diễn tập: ${s.drill}</div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>`;
    el.innerHTML = renderGroup(groupB, 'Nhóm B — Bão · Ngập · PCLB', '🌀') + renderGroup(groupC, 'Nhóm C — Cháy · PCCC · CNCH', '🔥');
  }
  window.MODULE_HOOKS.scenario = renderScenarios;

  window.drillScenario = function(i) {
    const s = window.SCENARIOS[i];
    if (!s) return;
    document.body.classList.add('drill');
    $('drillLbl').textContent = 'Tắt chế độ diễn tập';
    window.toast(`⚠ Bắt đầu diễn tập: <b>${s.name}</b>. Nhiệm vụ được sinh — kiểm tra ở «Kích hoạt».`, 'warn', 5000);
    window.applyLevel(s.lv || 2);
    window.generateTasksForLevel(s.lv || 2);
    window.pushLog(`🎯 Diễn tập: ${s.name}. Đã sinh ${window.STATE.tasks.length} nhiệm vụ.`, 'info');
    if (window.MODULE_HOOKS.dashboard) window.MODULE_HOOKS.dashboard();
  };

  // ========================================================
  // COST
  // ========================================================
  function renderCost() {
    const el = $('costTable');
    if (!el || !window.COST_STRUCT) return;
    // COST_STRUCT shape: [code, name, desc, evidence, approver]
    const rows = window.COST_STRUCT;
    el.innerHTML = `<table>
      <thead><tr><th style="width:56px">Mã</th><th>Hạng mục</th><th>Định mức & nguyên tắc</th><th>Chứng từ</th><th>Thẩm quyền duyệt</th></tr></thead>
      <tbody>${rows.map(r => {
        const [code, name, desc, evid, appr] = Array.isArray(r) ? r : [r.code, r.name, r.desc, r.evid, r.appr];
        return `<tr>
          <td class="mono b" style="color:var(--teal-glow)">${code}</td>
          <td><b style="color:var(--ink-heading)">${name}</b></td>
          <td class="small">${desc}</td>
          <td class="small muted">${evid}</td>
          <td class="small"><span class="badge bg-navy">${appr}</span></td>
        </tr>`;
      }).join('')}</tbody>
    </table>
    <div class="alert-box ab-info mt"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>
    <div><b>Nguyên tắc chi phí ứng phó:</b> Mã sự kiện tách riêng · CẤM cost-plus-% · hạn mức ủy quyền theo cấp độ · kiểm kê bù ngay sau sự kiện (theo Chương VII QĐ.03).</div></div>`;
  }
  window.MODULE_HOOKS.cost = renderCost;

  // ========================================================
  // FORCE & PHONEBOOK
  // ========================================================
  function renderForce() {
    const pb = $('phonebook');
    if (pb) {
      pb.innerHTML = window.PEOPLE.map(p => {
        const u = window.UNITS[p.unit] || { short: p.unit, icon: '❓' };
        return `<div class="person" style="padding:8px 10px;border-radius:8px;background:var(--bg-3);border:1px solid var(--line)">
          <div class="avatar avatar-sm ${p.gradient}">${p.short}</div>
          <div style="flex:1"><div class="p-name">${p.name} ${p.online?'<span class="badge bg-good" style="margin-left:6px;padding:1px 6px;font-size:9.5px">ONLINE</span>':''}</div>
            <div class="p-role">${p.role} · ${u.short}</div>
          </div>
          <div class="right flex" style="gap:4px">
            <a href="tel:${p.phone}" class="btn btn-ghost btn-sm">📞</a>
            <button class="btn btn-ghost btn-sm" onclick="window.toast('Gửi Zalo cho <b>${p.name}</b>','info')">💬</button>
            <span class="mono tiny muted">${p.phone}</span>
          </div>
        </div>`;
      }).join('');
    }
    const inv = $('inventory');
    if (inv && window.NORMS_V7) {
      // Shape: [category, name, unit, tn, cty, eco, ctn, note]
      inv.innerHTML = `<table>
        <thead><tr><th>Hạng mục</th><th>Định mức (TN/CTY/ECO/CTN)</th><th>Thực tế</th><th>Tình trạng</th></tr></thead>
        <tbody>${window.NORMS_V7.slice(0, 15).map(row => {
          const [cat, name, unit, tn, cty, eco, ctn, note] = row;
          const norm = Number(tn || cty || eco || ctn) || 5;
          // Deterministic pseudo-random per name so screens stay stable
          const seed = (name || '').split('').reduce((a,c) => a + c.charCodeAt(0), 0);
          const actual = Math.floor(norm * (0.55 + ((seed * 37) % 100) / 200));
          const pct = Math.round(actual/norm*100);
          const cls = pct >= 90 ? 'bg-good' : pct >= 70 ? 'bg-warn' : 'bg-crit';
          return `<tr>
            <td><b style="color:var(--ink-heading)">${name}</b> <span class="tiny muted">${unit||''}</span><br><span class="tiny muted">${cat}</span></td>
            <td class="mono small">${tn}/${cty}/${eco}/${ctn}</td>
            <td class="mono">${actual}</td>
            <td><span class="badge ${cls}">${pct}%</span></td>
          </tr>`;
        }).join('')}</tbody>
      </table>`;
    }
  }
  window.MODULE_HOOKS.force = renderForce;

  // ========================================================
  // QD03
  // ========================================================
  function renderQd03() {
    const pr = $('qd03Principles');
    if (pr && window.QD03_PRINCIPLES) {
      const arr = Array.isArray(window.QD03_PRINCIPLES) ? window.QD03_PRINCIPLES : Object.values(window.QD03_PRINCIPLES);
      pr.innerHTML = arr.map((p, i) => `<div class="alert-box ab-ok">
        <div style="width:22px;height:22px;border-radius:50%;background:var(--good);color:#fff;display:grid;place-items:center;font-weight:700;font-size:11px;flex:none">${i+1}</div>
        <div>${typeof p === 'string' ? p : (p.t || p.text || p.title || '')}${(p.d||p.desc)?`<br><span class="muted small">${p.d||p.desc}</span>`:''}</div>
      </div>`).join('');
    }
    const fb = $('qd03Forbidden');
    if (fb && window.QD03_FORBIDDEN) {
      const arr = Array.isArray(window.QD03_FORBIDDEN) ? window.QD03_FORBIDDEN : Object.values(window.QD03_FORBIDDEN);
      fb.innerHTML = arr.map(p => `<div class="alert-box ab-crit">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M4.9 4.9l14.2 14.2"/></svg>
        <div>${typeof p === 'string' ? p : (p.t || p.text || p.title || '')}${(p.d||p.desc)?`<br><span class="muted small">${p.d||p.desc}</span>`:''}</div>
      </div>`).join('');
    }
    const mx = $('qd03Matrix');
    if (mx && window.RESP_MATRIX) {
      // Shape: [role, mainResp, keyOutput]
      const rows = window.RESP_MATRIX;
      mx.innerHTML = `<table>
        <thead><tr><th>Vai trò / Vị trí</th><th>Trách nhiệm chính</th><th>Sản phẩm / đầu ra then chốt</th></tr></thead>
        <tbody>${rows.map(r => {
          const [role, resp, out] = Array.isArray(r) ? r : [r.role, r.resp, r.out];
          return `<tr>
            <td><b style="color:var(--ink-heading)">${role}</b></td>
            <td class="small">${resp}</td>
            <td class="small muted">${out || '—'}</td>
          </tr>`;
        }).join('')}</tbody>
      </table>`;
    }
  }
  window.MODULE_HOOKS.qd03 = renderQd03;

  // ========================================================
  // PROCESS
  // ========================================================
  function renderProcess() {
    const el = $('processFlow');
    if (!el) return;
    const steps = [
      { n:1, t:'Nhận diện tình huống', d:'Phát hiện dấu hiệu · nhận bản tin · nhận báo từ hiện trường' },
      { n:2, t:'Đánh giá & Kích hoạt', d:'Chỉ huy xác định cấp độ, ra quyết định kích hoạt theo Điều 8 QĐ.03' },
      { n:3, t:'Phát lệnh & Điều phối', d:'Sinh nhiệm vụ tới từng bộ phận, phát Zalo/SMS đồng thời' },
      { n:4, t:'Thực hiện & Báo cáo', d:'Đơn vị thực hiện, chụp ảnh xác nhận, báo cáo tiến độ real-time' },
      { n:5, t:'Kết thúc & Đánh giá (AAR)', d:'Đóng sự kiện, tổng kết After-Action-Review, cập nhật kịch bản' },
    ];
    el.innerHTML = `<div style="display:flex;gap:0;align-items:stretch;overflow-x:auto;padding:10px 0">${steps.map((s, i) => `
      <div style="flex:1;min-width:200px;position:relative;padding:0 8px">
        <div style="background:var(--bg-3);border:1px solid var(--line);border-radius:12px;padding:14px;min-height:130px">
          <div style="font-family:var(--mono);font-size:11px;color:var(--teal-glow);font-weight:700;letter-spacing:.1em">BƯỚC ${s.n}</div>
          <div class="b" style="color:var(--ink-heading);margin:6px 0;font-size:14px">${s.t}</div>
          <div class="small muted">${s.d}</div>
        </div>
        ${i < steps.length - 1 ? `<div style="position:absolute;right:-6px;top:50%;transform:translateY(-50%);color:var(--teal-glow);font-size:22px;z-index:2">→</div>` : ''}
      </div>
    `).join('')}</div>
    <hr>
    <div class="alert-box ab-info mt"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z"/></svg>
    <div><b>Căn cứ pháp lý:</b> Luật PCTT 2013 (sđ 2020) · Luật PCCC 2001 (sđ 2013) · NĐ 66/2021 · NĐ 136/2020 · QĐ.03 (17/07/2026) · QT-08 nội bộ CTG</div></div>`;
  }
  window.MODULE_HOOKS.process = renderProcess;

  // ========================================================
  // LOG
  // ========================================================
  function renderLog() {
    const el = $('logList');
    if (!el) return;
    if (!window.STATE.logs.length) {
      el.innerHTML = '<div class="muted small" style="padding:30px;text-align:center">Chưa có bản ghi. Kích hoạt sự kiện hoặc thao tác để tạo nhật ký.</div>';
      return;
    }
    el.innerHTML = '<table><thead><tr><th style="width:130px">Thời gian</th><th style="width:80px">Mức</th><th>Nội dung</th></tr></thead><tbody>' +
      window.STATE.logs.map(l => `<tr>
        <td class="mono tiny">${new Date(l.time).toLocaleString('vi-VN')}</td>
        <td><span class="badge ${l.level==='crit'?'bg-crit':l.level==='warn'?'bg-warn':'bg-teal'}">${l.level.toUpperCase()}</span></td>
        <td>${l.msg}</td>
      </tr>`).join('') + '</tbody></table>';
  }
  window.MODULE_HOOKS.log = renderLog;

  window.exportLog = function() {
    if (!window.STATE.logs.length) { window.toast('Chưa có nhật ký để xuất', 'warn'); return; }
    const csv = 'Time,Level,Message\n' + window.STATE.logs.map(l => `"${new Date(l.time).toISOString()}","${l.level}","${l.msg.replace(/"/g,'""')}"`).join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ctg-nhat-ky.csv';
    a.click();
    window.toast('Đã xuất nhật ký', 'good');
  };

  // ========================================================
  // ME PICKER + INCIDENT
  // ========================================================
  function renderMePicker() {
    const el = $('mePicker');
    if (!el) return;
    el.innerHTML = window.PEOPLE.map(p => {
      const u = window.UNITS[p.unit] || { short: p.unit };
      const cur = window.STATE.me === p.id;
      return `<button class="lv-card ${cur?'selected teal-c':''}" onclick="window.setMe('${p.id}');window.closeModal('me');window.toast('Đã chuyển sang <b>${p.name}</b>','good')" style="display:flex;align-items:center;gap:10px;padding:10px 12px">
        <div class="avatar ${p.gradient||''}">${p.short}</div>
        <div style="flex:1;text-align:left">
          <div class="p-name">${p.name}</div>
          <div class="p-role">${p.role}</div>
          <div class="tiny muted">${u.short}</div>
        </div>
      </button>`;
    }).join('');
  }

  function renderIncidentModal() {
    const s = $('incSite');
    if (s && !s.dataset.done) {
      s.innerHTML = window.SITES.filter(x => x.kind !== 'warehouse').map(x => `<option value="${x.id}">${x.name}</option>`).join('');
      s.dataset.done = '1';
    }
  }
  window.saveIncident = function() {
    const type = $('incType').value;
    const siteId = $('incSite').value;
    const desc = $('incDesc').value.trim() || '(không mô tả)';
    const site = window.byId(window.SITES, siteId);
    const labels = { fire:'🔥 CHÁY', flood:'💧 NGẬP', wind:'🌬 GIÓ LỐC', power:'⚡ SỰ CỐ ĐIỆN', injury:'🩹 CHẤN THƯƠNG' };
    window.closeModal('incident');
    if (type === 'fire') {
      window.reportFire(siteId);
    } else {
      window.SIM.eventName = labels[type] + ' tại ' + site.name;
      window.applyLevel(3);
      window.generateTasksForLevel(3);
      window.pushLog(`🚨 ${labels[type]} tại ${site.name} — ${desc}`, 'crit');
      window.setScenario(type === 'fire' ? 'fire' : 'storm');
    }
    window.toast('🚨 Đã phát lệnh ứng phó', 'crit');
  };

  // ========================================================
  // INIT ALL
  // ========================================================
  // Wrap every hook in try/catch so one bad renderer doesn't halt the rest.
  function safeWrap(name, fn) {
    return function() {
      try { return fn.apply(this, arguments); }
      catch (e) { console.warn('[MODULE ' + name + ' failed]', e); }
    };
  }
  Object.keys(window.MODULE_HOOKS).forEach(k => {
    window.MODULE_HOOKS[k] = safeWrap(k, window.MODULE_HOOKS[k]);
  });

  // Lazy render: each section renders only when first navigated to
  const RENDERED = new Set();
  const origGo = window.go;
  window.go = function(sec) {
    origGo(sec);
    if (!RENDERED.has(sec)) {
      RENDERED.add(sec);
      try { window.MODULE_HOOKS[sec]?.(); } catch(e) { console.warn(e); }
    }
  };

  window.initModules = function() {
    try { renderMePicker(); } catch(e) { console.warn(e); }
    try { renderIncidentModal(); } catch(e) { console.warn(e); }
    // Only render the currently active section + always-on widgets
    const activeSec = document.querySelector('.section.active')?.id?.replace('sec-','') || 'dashboard';
    RENDERED.add(activeSec);
    try { window.MODULE_HOOKS[activeSec]?.(); } catch(e) { console.warn(e); }
    // Seed chat/AI
    try { if (window.renderAI) window.renderAI(); } catch(e) {}
    try { if (window.renderChat) window.renderChat(); } catch(e) {}
  };

})();
