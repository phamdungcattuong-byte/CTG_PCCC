// ============================================================
// CTG CORE — state, navigation, activation, tasks, scenarios
// ============================================================
(function () {
  'use strict';

  // ---------- Section titles ----------
  const SEC_TITLES = {
    dashboard:  { t:'Bảng điều hành tổng thể',           s:'Toàn cảnh sự cố · lực lượng · tài nguyên' },
    activation: { t:'Kích hoạt & Nhiệm vụ',              s:'Chọn cấp độ · phát lệnh · giám sát tiến độ' },
    my:         { t:'Nhiệm vụ của tôi',                  s:'Việc trực tiếp giao cho tôi trong sự kiện hiện tại' },
    pccc:       { t:'PCCC & CNCH',                       s:'Phòng cháy chữa cháy · cứu nạn cứu hộ' },
    scenario:   { t:'Kịch bản tình huống',               s:'Kịch bản chuẩn theo cấp độ · diễn tập' },
    cost:       { t:'Chi phí chuẩn',                     s:'Cơ cấu chi phí ứng phó theo cấp độ' },
    force:      { t:'Lực lượng & Kho vật tư',            s:'Danh sách trực · tồn kho · điện thoại' },
    qd03:       { t:'Quy định QĐ.03 · Cứu trợ',          s:'Nguyên tắc, cấm, quy trình cứu trợ' },
    process:    { t:'Quy trình & Pháp lý',               s:'QT-08 · căn cứ pháp lý · biểu mẫu' },
    log:        { t:'Nhật ký & Báo cáo',                 s:'Nhật ký sự kiện · AAR · xuất báo cáo' },
    relief:     { t:'Dự án cứu trợ',                     s:'Chuyến cứu trợ vùng thiên tai — kế hoạch, đội đi, ngân sách, hồ sơ' },
    security:   { t:'An ninh Camera',                    s:'Live-feed camera an ninh · chung cư & công trường · cảnh báo' },
    admin:      { t:'Quản trị hệ thống',                 s:'Người dùng · vai trò · dữ liệu · cấu hình · audit log' },
  };
  window.SEC_TITLES = SEC_TITLES;

  // ---------- Simulation clock ----------
  // In demo, clock ticks fast — 1 real second = 30 sim seconds during timeline auto-play
  window.SIM = {
    now: new Date('2026-07-25T06:00:00+07:00'),
    tick: false,        // is scenario timeline auto-playing?
    speed: 1,           // real->sim multiplier
    scenario: 'norm',   // norm | storm | fire
    level: 0,
    eventName: '',
  };

  // ---------- Persistent state ----------
  window.STATE = {
    tasks: [],           // { id, code, unit, unitList, ownerId, title, desc, phase, deadline, status, evidence, note, level }
    logs: [],
    notifs: [],
    me: null,            // person id — set from picker
    subtab: {},          // module -> tab id
  };

  // ---------- Theme (dark/light) ----------
  window.setTheme = function(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('ctg.theme', theme);
    // Re-render dashboard bits that depend on colors
    if (window.MODULE_HOOKS?.dashboard) try { window.MODULE_HOOKS.dashboard(); } catch(e) {}
    // Emit event so other views can react
    window.dispatchEvent(new CustomEvent('ctg:theme', { detail: theme }));
  };
  window.toggleTheme = function() {
    const cur = document.documentElement.dataset.theme || 'dark';
    window.setTheme(cur === 'dark' ? 'light' : 'dark');
    window.toast(cur === 'dark' ? '☀ Đã chuyển sang chế độ Sáng' : '🌙 Đã chuyển sang chế độ Tối', 'info');
  };

  // ---------- Device preview ----------
  window.setDevice = function(mode) {
    document.body.classList.remove('dev-desktop','dev-tablet','dev-mobile');
    if (mode !== 'desktop') document.body.classList.add('dev-' + mode);
    localStorage.setItem('ctg.device', mode);
    document.querySelectorAll('.device-sw button').forEach(b => b.classList.toggle('on', b.dataset.dev === mode));
    // Close sidebar if we shrink
    if (mode !== 'desktop') window.toggleSidebar(false);
  };

  // ---------- Sidebar toggle (mobile drawer) ----------
  window.toggleSidebar = function(force) {
    const sb = document.getElementById('sidebar');
    const bd = document.getElementById('sidebarBackdrop');
    if (!sb) return;
    const want = force === undefined ? !sb.classList.contains('open') : !!force;
    sb.classList.toggle('open', want);
    if (bd) bd.classList.toggle('on', want);
  };

  // ---------- Sidebar collapse (desktop — icon-only mode) ----------
  window.toggleSidebarCollapse = function(force) {
    const app = document.querySelector('.app');
    if (!app) return;
    const want = force === undefined ? !app.classList.contains('sb-collapsed') : !!force;
    app.classList.toggle('sb-collapsed', want);
    localStorage.setItem('ctg.sbCollapsed', want ? '1' : '0');
    // Update button label
    const lbl = document.querySelector('.sb-toggle-lbl');
    if (lbl) lbl.textContent = want ? '' : 'Thu gọn thanh bên';
  };

  // ---------- Toast ----------
  const toastWrap = () => {
    let el = document.getElementById('toastWrap');
    if (!el) { el = document.createElement('div'); el.id='toastWrap'; el.className='toast-wrap'; document.body.appendChild(el); }
    return el;
  };
  window.toast = function(msg, type='info', ms=3200) {
    const w = toastWrap();
    const t = document.createElement('div');
    t.className = 'toast ' + (type||'');
    t.innerHTML = msg;
    w.appendChild(t);
    setTimeout(() => { t.style.opacity='0'; t.style.transform='translateX(20px)'; setTimeout(()=>t.remove(),300); }, ms);
  };

  // ---------- Navigation ----------
  window.go = function(sec) {
    document.querySelectorAll('.section').forEach(s => s.classList.toggle('active', s.id === 'sec-'+sec));
    document.querySelectorAll('.nav-btn[data-sec]').forEach(b => b.classList.toggle('active', b.dataset.sec === sec));
    document.querySelectorAll('.mobile-nav button[data-mnav]').forEach(b => b.classList.toggle('active', b.dataset.mnav === sec));
    const st = SEC_TITLES[sec];
    if (st) {
      document.getElementById('secTitle').textContent = st.t;
      const subEl = document.getElementById('secSubtitle');
      if (subEl) subEl.textContent = st.s;
    }
    // trigger render hook if module has one
    if (window.MODULE_HOOKS && window.MODULE_HOOKS[sec]) window.MODULE_HOOKS[sec]();
    if (window.innerWidth < 1024 || document.body.classList.contains('dev-mobile') || document.body.classList.contains('dev-tablet')) {
      window.toggleSidebar(false);
    }
    window.scrollTo(0, 0);
    localStorage.setItem('ctg.lastSec', sec);
  };

  // ---------- Clock ----------
  function formatVNTime(d) {
    const p = n => String(n).padStart(2,'0');
    return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  }
  function formatVNDate(d) {
    const w = ['CN','T2','T3','T4','T5','T6','T7'][d.getDay()];
    return `${w} · ${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  }
  window.tickClock = function () {
    if (window.SIM.tick) {
      window.SIM.now = new Date(window.SIM.now.getTime() + 1000 * window.SIM.speed);
    } else {
      // real time reference so demo remains believable
      window.SIM.now = new Date();
    }
    const el = document.getElementById('clock');
    if (el) el.innerHTML = `<span class="live-dot"></span><span class="clock-time">${formatVNTime(window.SIM.now)}</span> <span class="clock-date muted small">${formatVNDate(window.SIM.now)}</span>`;
  };

  // ---------- Level helpers ----------
  window.currentLevel = () => window.LEVELS[window.SIM.level];
  window.getLevelBadgeHTML = function() {
    const lv = window.currentLevel();
    return `<span class="badge bg-${lv.cls}">● ${lv.code}</span>`;
  };

  window.applyLevel = function(k) {
    window.SIM.level = k;
    const lv = window.LEVELS[k];
    const banner = document.getElementById('levelBanner');
    if (banner) {
      banner.className = 'level-banner ' + lv.cls;
      document.getElementById('lbCode').textContent = lv.code + ' — ' + lv.name;
      document.getElementById('lbDesc').textContent = lv.trigger + '  ⟶  ' + lv.act.split('.')[0] + '.';
    }
    const tb = document.getElementById('topLevelBadge');
    if (tb) tb.outerHTML = window.getLevelBadgeHTML().replace('badge ', 'badge ') .replace('<span ','<span id="topLevelBadge" ');
    document.querySelectorAll('[data-level-badge]').forEach(el => el.innerHTML = window.getLevelBadgeHTML());
    document.body.dataset.level = lv.cls;
  };

  // ---------- Task management ----------
  let TASK_SEQ = 0;
  window.newTaskId = () => 'T' + (++TASK_SEQ).toString().padStart(4,'0');

  window.generateTasksForLevel = function(k) {
    // TASK_LIB entries: { u:unit, p:phase, l:levelMinRequired, t:title, o:owner, c:checker, n:note }
    if (!window.TASK_LIB) return;
    const now = window.SIM.now.getTime();
    // Filter: include tasks whose level <= current level (higher levels inherit lower-level tasks)
    // For demo we take a mixed selection to make dashboards feel full
    const eligible = window.TASK_LIB.filter(t => (t.l == null) || (t.l <= k));
    // sample ~28 tasks, prefer higher-level ones
    const sorted = eligible.slice().sort((a, b) => (b.l||0) - (a.l||0));
    const picked = sorted.slice(0, 28);
    window.STATE.tasks = picked.map((t, i) => {
      const unitCode = t.u || 'BCH';
      // find a person whose unit matches (case-insensitive); fallback rotate PEOPLE
      const candidates = window.PEOPLE.filter(p => p.unit === unitCode);
      const person = candidates[i % Math.max(1, candidates.length)] || window.PEOPLE[i % window.PEOPLE.length];
      // deadline: derive hours from phase
      const phaseObj = (window.PHASES || []).find(x => x.id === t.p) || { off: 6 };
      // Use abs(off) as hours; clamp
      const hours = Math.max(1, Math.min(72, Math.abs(phaseObj.off || 6) || 6));
      const dueMs = now + hours * 3600 * 1000;
      return {
        id:      window.newTaskId(),
        code:    'TSK-'+String(i+1).padStart(3,'0'),
        unit:    unitCode,
        unitAll: [unitCode],
        ownerId: person.id,
        title:   t.t || 'Nhiệm vụ',
        desc:    (t.o ? 'Người thực hiện gợi ý (theo phương án): ' + t.o : '') + (t.c ? ' · Kiểm tra: ' + t.c : '') + (t.n ? ' · Lưu ý: ' + t.n : ''),
        phase:   t.p || 'T24',
        deadline: dueMs,
        status:  'issued',
        progress: 0,
        note:    '',
        level:   k,
      };
    });
    // Send some notifs
    window.STATE.notifs = window.STATE.tasks.slice(0, 6).map(t => ({
      id: 'n_'+t.id, kind:'task', taskId: t.id,
      title: 'Bạn được giao: ' + t.title,
      desc: 'Đơn vị: ' + (window.UNITS[t.unit]?.short || t.unit) + ' · Deadline: ' + new Date(t.deadline).toLocaleString('vi-VN', { hour:'2-digit', minute:'2-digit', day:'2-digit', month:'2-digit' }),
      time: window.SIM.now.getTime(),
      read: false,
      ownerId: t.ownerId,
    }));
    window.renderBell();
  };

  window.taskProgress = function() {
    const t = window.STATE.tasks;
    if (!t.length) return { total:0, ack:0, doing:0, done:0, overdue:0 };
    return {
      total: t.length,
      ack: t.filter(x => x.status !== 'issued').length,
      doing: t.filter(x => x.status === 'doing' || x.status === 'ack').length,
      done: t.filter(x => x.status === 'done').length,
      overdue: t.filter(x => x.status === 'overdue' || (x.deadline < window.SIM.now.getTime() && x.status !== 'done')).length,
    };
  };

  window.unitProgress = function() {
    const t = window.STATE.tasks;
    const by = {};
    t.forEach(x => {
      by[x.unit] = by[x.unit] || { total:0, done:0 };
      by[x.unit].total++;
      if (x.status === 'done') by[x.unit].done++;
    });
    return Object.entries(by)
      .map(([u, v]) => ({ unit:u, total:v.total, done:v.done, pct: Math.round(v.done / v.total * 100) }))
      .sort((a,b) => b.pct - a.pct);
  };

  // ---------- Notif bell ----------
  window.renderBell = function() {
    const cnt = window.STATE.notifs.filter(n => !n.read).length;
    const el = document.getElementById('bellCnt');
    if (el) { el.textContent = cnt; el.style.display = cnt ? '' : 'none'; }
    const navMy = document.getElementById('navMyCount');
    if (navMy) {
      const my = window.myTasks().length;
      navMy.textContent = my; navMy.style.display = my ? '' : 'none';
    }
    const navTask = document.getElementById('navTaskCount');
    if (navTask) {
      const tot = window.STATE.tasks.length;
      navTask.textContent = tot; navTask.style.display = tot ? '' : 'none';
    }
  };

  window.toggleNotifPanel = function(e) {
    const p = document.getElementById('notifPanel');
    p.classList.toggle('open');
    window.renderNotifList();
    if (e) e.stopPropagation();
  };

  window.renderNotifList = function() {
    const el = document.getElementById('notifList');
    if (!el) return;
    if (!window.STATE.notifs.length) {
      el.innerHTML = '<div class="muted small" style="padding:20px;text-align:center">Chưa có thông báo điều động nào</div>';
      return;
    }
    const arr = [...window.STATE.notifs].sort((a,b) => b.time - a.time);
    el.innerHTML = arr.map(n => {
      const person = n.ownerId && window.byId(window.PEOPLE, n.ownerId);
      const av = person ? `<div class="avatar avatar-sm ${person.gradient}">${person.short}</div>` : `<div class="avatar avatar-sm">!</div>`;
      const tm = new Date(n.time).toLocaleTimeString('vi-VN', { hour:'2-digit', minute:'2-digit' });
      return `<div class="notif-item ${n.read ? '' : 'unread'}" onclick="window.readNotif('${n.id}')">
        ${av}
        <div class="n-body">
          <div class="n-t">${n.title}</div>
          <div class="n-d">${n.desc}</div>
          <div class="n-time">${tm}</div>
        </div>
      </div>`;
    }).join('');
  };

  window.readNotif = function(id) {
    const n = window.STATE.notifs.find(x => x.id === id);
    if (!n) return;
    n.read = true;
    window.renderBell(); window.renderNotifList();
    if (n.taskId) { window.go('my'); }
  };

  window.markAllRead = function() {
    window.STATE.notifs.forEach(n => n.read = true);
    window.renderBell(); window.renderNotifList();
  };

  // ---------- My tasks ----------
  window.myTasks = function() {
    const me = window.STATE.me;
    if (!me) return [];
    return window.STATE.tasks.filter(t => t.ownerId === me);
  };

  window.setMe = function(personId) {
    window.STATE.me = personId;
    localStorage.setItem('ctg.me', personId);
    const p = window.byId(window.PEOPLE, personId);
    if (p) {
      const el = document.getElementById('meBadge');
      if (el) el.innerHTML = `<div class="avatar avatar-sm ${p.gradient}">${p.short}</div><span>${p.name.split(' ').slice(-2).join(' ')}</span>`;
    }
    window.renderBell();
    if (window.MODULE_HOOKS?.my) window.MODULE_HOOKS.my();
    if (window.MODULE_HOOKS?.dashboard) window.MODULE_HOOKS.dashboard();
  };

  // ---------- Drill mode ----------
  window.toggleDrill = function() {
    document.body.classList.toggle('drill');
    const on = document.body.classList.contains('drill');
    window.toast(on ? '⚠ Đã bật chế độ diễn tập' : 'Đã tắt chế độ diễn tập', on ? 'warn' : 'good');
    const lbl = document.getElementById('drillLbl');
    if (lbl) lbl.textContent = on ? 'Tắt chế độ diễn tập' : 'Bật chế độ diễn tập';
  };

  // ---------- Scenario switcher ----------
  window.setScenario = function(kind) {
    window.SIM.scenario = kind;
    document.querySelectorAll('.scenario-sw button').forEach(b => b.classList.toggle('on', b.dataset.s === kind));
    if (kind === 'norm') {
      window.applyLevel(0);
      window.STATE.tasks = [];
      window.STATE.notifs = [];
      window.SIM.eventName = '';
      window.renderBell();
      window.toast('Đã chuyển về trạng thái THƯỜNG TRỰC. Dữ liệu sự kiện đã xoá.', 'good');
    } else if (kind === 'storm') {
      window.SIM.eventName = 'Bão số 3 – BAVI';
      window.applyLevel(3);
      window.generateTasksForLevel(3);
      // Simulate some progress so dashboard/leaderboard show a mix of statuses
      window.STATE.tasks.forEach((t, i) => {
        const r = (i * 13) % 100;
        if (r < 40) t.status = 'done';
        else if (r < 65) t.status = 'doing';
        else if (r < 85) t.status = 'ack';
        // else 'issued'
      });
      window.pushLog('🌀 Kích hoạt sự kiện: Bão BAVI (Cấp 3 – ĐỎ). Ban chỉ huy vào chế độ 24/24.', 'crit');
      window.pushLog('📢 Phát 28 nhiệm vụ tới 12 đầu mối. Zalo & SMS đã gửi.', 'info');
      window.pushLog('✓ 11/28 nhiệm vụ đã hoàn thành. 7 đang thực hiện. Chưa có quá hạn.', 'info');
      window.toast('🌀 Đã kích hoạt kịch bản BÃO BAVI — Cấp ĐỎ', 'warn');
    } else if (kind === 'fire') {
      window.SIM.eventName = 'Cháy xưởng CT HIJ-KL';
      window.applyLevel(3);
      window.generateTasksForLevel(3);
      // For fire, most tasks are new/urgent
      window.STATE.tasks.forEach((t, i) => {
        if (i < 3) t.status = 'done';       // first response steps done
        else if (i < 8) t.status = 'doing';
        else if (i < 12) t.status = 'ack';
      });
      window.pushLog('🔥 Kích hoạt sự cố CHÁY tại Cụm CT HIJ-KL. Gọi 114 – sơ tán khẩn.', 'crit');
      window.pushLog('🚒 Đội PCCC cơ sở (8 người) đã triển khai. Xe 114 dự kiến tới 06:30.', 'warn');
      window.pushLog('👥 Sơ tán 142 người khỏi khu B. Điểm tập kết: bãi E ngoài xưởng.', 'info');
      window.toast('🔥 Đã kích hoạt kịch bản CHÁY CT HIJ-KL — Cấp ĐỎ', 'crit');
    }
    // Only re-render the currently active section + always-visible dashboard bits, defer the rest.
    // This keeps setScenario snappy on big-data modules like scenarios/qd03.
    const activeSec = document.querySelector('.section.active')?.id?.replace('sec-','');
    ['dashboard', activeSec].filter(Boolean).forEach(k => {
      try { window.MODULE_HOOKS[k]?.(); } catch(e) { console.warn(e); }
    });
    window.renderBell();
  };

  // ---------- Demo timeline (auto-play scripted events) ----------
  window.runDemoTimeline = function() {
    if (window.SIM.scenario === 'norm') {
      window.toast('Kích hoạt kịch bản (BAVI hoặc Cháy) trước khi chạy timeline demo.', 'warn');
      return;
    }
    const btn = document.getElementById('demoBtn');
    if (btn) { btn.disabled = true; btn.style.opacity = '.5'; }

    const steps = window.SIM.scenario === 'storm' ? [
      { delay: 0,    log: '⏱ T-06:00 · Sơ tán công nhân về khu trú ẩn (TT Đông y).', level: 'info' },
      { delay: 2500, log: '✅ HIJ-KL báo cáo: đã hạ cần cẩu tháp, chằng buộc lần cuối.', level: 'info',
        act: () => { window.STATE.tasks.filter(t=>t.unit==='CT').slice(0,3).forEach(t=>t.status='done'); } },
      { delay: 5000, log: '⚠ Cụm CT S báo: 2 công nhân từ chối sơ tán — CHT đã can thiệp.', level: 'warn' },
      { delay: 7500, log: '📞 VP Chủ tịch nhận điện cảnh sát PCCC 114: sẵn sàng chi viện nếu cần.', level: 'info' },
      { delay: 10000, log: '💧 T-03:00 · Mưa lớn bắt đầu. Kích hoạt tất cả máy bơm chống úng.', level: 'warn',
        act: () => { window.STATE.tasks.filter(t=>t.phase==='T24').forEach(t=>t.status='done'); } },
      { delay: 13000, log: '⚠ ECO: bơm B-01 quá tải. Đội cơ động xuất kho bơm dự phòng 5HP.', level: 'warn' },
      { delay: 16000, log: '🌀 T+00:00 · Bão đổ bộ. Gió giật cấp 10. Không thi công. Toàn hệ trực 24/24.', level: 'crit',
        act: () => { window.applyLevel(4); window.SIM.eventName = 'Bão BAVI · TÂM BÃO'; } },
      { delay: 20000, log: '✅ Đã điểm danh: 508/508 nhân sự an toàn. Không thương vong.', level: 'info' },
    ] : [
      { delay: 0,    log: '⏱ 06:14 · Chuông báo cháy khu B tầng 3. Gọi 114.', level: 'crit' },
      { delay: 2000, log: '🚒 Đội PCCC cơ sở tiếp cận. Sử dụng bình MFZL4 khống chế.', level: 'warn',
        act: () => { window.STATE.tasks.slice(0,2).forEach(t=>t.status='done'); } },
      { delay: 4500, log: '👥 Sơ tán 142/142 công nhân theo đường thoát chính. Không kẹt.', level: 'info',
        act: () => { window.STATE.tasks.slice(2,6).forEach(t=>t.status='done'); } },
      { delay: 7000, log: '⚡ Đã cắt điện tổng khu B. Thang máy về tầng 1 khoá.', level: 'info' },
      { delay: 9500, log: '🚒 Xe cứu hoả 114 (2 xe) tới hiện trường. Bàn giao sơ đồ + chìa khoá kỹ thuật.', level: 'warn' },
      { delay: 13000, log: '✅ Đã dập tắt hoàn toàn. Không thương vong. Thiệt hại vật chất ước ~180 triệu.', level: 'info',
        act: () => { window.STATE.tasks.forEach(t=>t.status='done'); } },
      { delay: 16000, log: '📋 Lập biên bản hiện trường. Bảo vệ khu vực. Chờ điều tra nguyên nhân.', level: 'info' },
    ];

    steps.forEach(s => {
      setTimeout(() => {
        if (s.act) try { s.act(); } catch(e){}
        window.pushLog(s.log, s.level);
        if (window.MODULE_HOOKS.dashboard) window.MODULE_HOOKS.dashboard();
        if (window.MODULE_HOOKS.my) window.MODULE_HOOKS.my();
      }, s.delay);
    });

    const total = steps[steps.length-1].delay + 2000;
    setTimeout(() => {
      if (btn) { btn.disabled = false; btn.style.opacity = ''; }
      window.toast('✓ Đã chạy xong timeline demo. Xem <b>Nhật ký</b> để tổng kết.', 'good', 5000);
    }, total);
    window.toast('▶ Bắt đầu chạy timeline — quan sát nhật ký & KPIs cập nhật.', 'good');
  };

  // ---------- Log ----------
  window.pushLog = function(msg, level='info') {
    window.STATE.logs.unshift({ time: window.SIM.now.getTime(), msg, level });
    if (window.MODULE_HOOKS?.log) window.MODULE_HOOKS.log();
    if (window.renderRecentLog) window.renderRecentLog();
  };

  // ---------- Emergency incident ----------
  window.openIncident = function() {
    window.openModal('incident');
  };
  window.reportFire = function(site) {
    const s = window.byId(window.SITES, site) || window.SITES[0];
    window.SIM.eventName = 'Cháy tại ' + s.name;
    window.applyLevel(3);
    window.generateTasksForLevel(3);
    window.pushLog(`🔥 Báo cháy tại ${s.name} (${s.staff} người có mặt). Sơ tán khẩn cấp.`, 'crit');
    window.STATE.notifs.unshift({
      id:'nfire'+Date.now(), kind:'incident',
      title:'⚠️ CÓ CHÁY tại '+s.name,
      desc:'Đội PCCC cơ sở đã xuất phát. Gọi 114 · Sơ tán khu vực.',
      time: window.SIM.now.getTime(), read:false,
    });
    window.renderBell();
    window.setScenario('fire');
    window.go('pccc');
  };

  // ---------- Modals ----------
  window.openModal = function(id) {
    const m = document.getElementById('modal-'+id);
    if (!m) return;
    m.classList.add('open');
  };
  window.closeModal = function(id) {
    const m = id ? document.getElementById('modal-'+id) : document.querySelector('.modal-overlay.open');
    if (m) m.classList.remove('open');
  };

  // ---------- Init ----------
  window.MODULE_HOOKS = window.MODULE_HOOKS || {};

  window.initCore = function() {
    // Load persisted theme + device
    const savedTheme = localStorage.getItem('ctg.theme') || 'dark';
    document.documentElement.dataset.theme = savedTheme;
    const savedDevice = localStorage.getItem('ctg.device') || 'desktop';
    window.setDevice(savedDevice);
    // Sidebar collapsed state
    if (localStorage.getItem('ctg.sbCollapsed') === '1') {
      window.toggleSidebarCollapse(true);
    }

    // Attach nav clicks
    document.querySelectorAll('.nav-btn[data-sec]').forEach(b => {
      b.addEventListener('click', () => window.go(b.dataset.sec));
    });
    // Load saved section
    const saved = localStorage.getItem('ctg.lastSec');
    if (saved && SEC_TITLES[saved]) window.go(saved); else window.go('dashboard');
    // Me
    const me = localStorage.getItem('ctg.me') || 'cht';
    window.setMe(me);
    // Clock
    window.tickClock();
    setInterval(window.tickClock, 1000);
    // Close notif on outside click
    document.addEventListener('click', (e) => {
      const p = document.getElementById('notifPanel');
      if (!p || !p.classList.contains('open')) return;
      if (p.contains(e.target) || e.target.closest('.bell-btn')) return;
      p.classList.remove('open');
    });
    // Escape closes modals + drawers
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
        document.querySelectorAll('.drawer.open').forEach(d => d.classList.remove('open'));
      }
      // Hotkey [ toggles sidebar collapse (desktop only)
      if (e.key === '[' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = (e.target && e.target.tagName || '').toLowerCase();
        if (tag !== 'input' && tag !== 'textarea' && !e.target.isContentEditable) {
          e.preventDefault();
          window.toggleSidebarCollapse();
        }
      }
    });
    // Initial level = 0
    window.applyLevel(0);
    window.renderBell();
  };
})();
