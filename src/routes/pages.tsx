// Server-rendered HTML pages: /login and the main app shell (/).
// The app shell is the prototype's index.html, ported into JSX, with a
// small bootstrap script tag list. Real page markup/behaviour lives in the
// static assets (public/static/assets/*) copied from the handoff prototype;
// this file only supplies the two HTML documents Hono serves.
import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import type { AppEnv } from '../types'
import { ACCESS_COOKIE_NAME } from '../middleware/auth'

const pages = new Hono<AppEnv>()

pages.get('/login', (c) => {
  const existing = getCookie(c, ACCESS_COOKIE_NAME)
  if (existing) {
    return c.redirect('/')
  }
  return c.render(
    <div class="login-page">
      <div class="login-card card">
        <div class="login-brand">
          <div class="brand-logo">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 6.5V12c0 5.2 3.8 9.2 9 10 5.2-.8 9-4.8 9-10V6.5L12 2z" fill="#fff" opacity=".92" />
              <path d="M12 5.2L6 8.2v3.9c0 3.6 2.5 6.4 6 7.1 3.5-.7 6-3.5 6-7.1V8.2l-6-3z" fill="#065F46" />
              <path d="M12 8l1.2 2.5 2.8.4-2 2 .5 2.7L12 14.3l-2.5 1.3.5-2.7-2-2 2.8-.4L12 8z" fill="#F39200" />
            </svg>
          </div>
          <div>
            <div class="brand-name">CÁT TƯỜNG GROUP</div>
            <div class="brand-sub">Command Center</div>
          </div>
        </div>
        <h1 class="login-title">Đăng nhập hệ thống</h1>
        <p class="muted small login-sub">Trung tâm điều hành PCLB · PCCC · Cứu trợ — Cát Tường Group</p>

        <form id="loginForm" class="login-form" autocomplete="off">
          <label class="small b login-label">Tài khoản</label>
          <input id="loginUsername" name="username" placeholder="ví dụ: ct, tgd, cht…" autocomplete="username" required />

          <label class="small b login-label">Mật khẩu</label>
          <input id="loginPassword" name="password" type="password" placeholder="••••••••" autocomplete="current-password" required />

          <div id="loginError" class="alert-box ab-crit login-error" style="display:none"></div>

          <button type="submit" class="btn btn-primary btn-lg login-submit" id="loginSubmit">Đăng nhập</button>
        </form>

        <div class="login-foot muted tiny">
          Phiên bản 2.2 · 07/2026 · Mã: PCLB-PCCC-CC-02<br />
          Căn cứ: QĐ.03 (17/07/2026)
        </div>
      </div>
      <script src="/static/js/login.js"></script>
    </div>
  )
})

pages.get('/', (c) => {
  const token = getCookie(c, ACCESS_COOKIE_NAME)
  if (!token) {
    return c.redirect('/login')
  }
  return c.render(<AppShell />)
})

function AppShell() {
  return (
    <>
      <div class="drill-banner" id="drillBanner" style="display:none">⚠ CHẾ ĐỘ DIỄN TẬP — DỮ LIỆU KHÔNG PHẢI SỰ KIỆN THẬT ⚠</div>

      <div class="sidebar-backdrop" id="sidebarBackdrop" onclick="window.toggleSidebar(false)"></div>

      <div class="app">
        <aside class="sidebar" id="sidebar">
          <div class="brand">
            <div class="brand-logo">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 6.5V12c0 5.2 3.8 9.2 9 10 5.2-.8 9-4.8 9-10V6.5L12 2z" fill="#fff" opacity=".92" />
                <path d="M12 5.2L6 8.2v3.9c0 3.6 2.5 6.4 6 7.1 3.5-.7 6-3.5 6-7.1V8.2l-6-3z" fill="#065F46" />
                <path d="M12 8l1.2 2.5 2.8.4-2 2 .5 2.7L12 14.3l-2.5 1.3.5-2.7-2-2 2.8-.4L12 8z" fill="#F39200" />
              </svg>
            </div>
            <div>
              <div class="brand-name">CÁT TƯỜNG GROUP</div>
              <div class="brand-sub">Command Center</div>
            </div>
          </div>

          <div class="nav-group">Điều hành</div>
          <button class="nav-btn active" data-sec="dashboard" data-tip="Bảng điều hành">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg>
            Bảng điều hành</button>
          <button class="nav-btn" data-sec="activation" data-tip="Kích hoạt & Nhiệm vụ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" /></svg>
            Kích hoạt &amp; Nhiệm vụ <span class="nav-badge" id="navTaskCount" style="display:none">0</span></button>
          <button class="nav-btn" data-sec="my" data-tip="Nhiệm vụ của tôi">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="3.5" /><path d="M5.5 20c.7-3.6 3.2-5.5 6.5-5.5s5.8 1.9 6.5 5.5" /></svg>
            Nhiệm vụ của tôi <span class="nav-badge" id="navMyCount" style="display:none">0</span></button>
          <button class="nav-btn" data-sec="pccc" data-tip="PCCC & CNCH">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22c4.4 0 7-2.8 7-7 0-3-1.8-4.6-3-6.5-1-1.6-1.6-3.3-1.5-5.5-2.6 1.4-4 3.2-4.4 5.5-.2 1.2 0 2.4-.6 3-.7.8-2-.4-2.2-2C5.8 11 5 12.9 5 15c0 4.2 2.6 7 7 7z" /></svg>
            PCCC &amp; CNCH</button>
          <button class="nav-btn" data-sec="scenario" data-tip="Kịch bản tình huống">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 4h6l5 8-5 8H9L4 12l5-8z" /><path d="M12 9v4M12 16.5v.5" /></svg>
            Kịch bản tình huống</button>
          <button class="nav-btn" data-sec="cost" data-tip="Chi phí chuẩn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h4" /></svg>
            Chi phí chuẩn</button>
          <button class="nav-btn" data-sec="force" data-tip="Lực lượng & Kho">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20c.6-3.3 2.8-5 5.5-5s4.9 1.7 5.5 5" /><circle cx="17" cy="9" r="2.5" /><path d="M15.5 14.6c2.6.2 4.4 1.7 5 4.9" /></svg>
            Lực lượng &amp; Kho</button>
          <button class="nav-btn" data-sec="qd03" data-tip="Quy định QĐ.03">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z" /><path d="M9 12l2 2 4-4" /></svg>
            Quy định QĐ.03</button>
          <button class="nav-btn" data-sec="process" data-tip="Quy trình & Pháp lý">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-3" /><path d="M17 3h4v4M21 3l-9 9" /></svg>
            Quy trình &amp; Pháp lý</button>
          <button class="nav-btn" data-sec="log" data-tip="Nhật ký & Báo cáo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" /><path d="M14 2v6h6M9 13h6M9 17h6" /></svg>
            Nhật ký &amp; Báo cáo</button>

          <div class="nav-group">Dự án &amp; Chiến dịch</div>
          <button class="nav-btn" data-sec="relief" data-tip="Dự án cứu trợ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.6a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.07a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
            Dự án cứu trợ</button>

          <div class="nav-group">Hệ thống</div>
          <button class="nav-btn" data-sec="admin" data-tip="Quản trị hệ thống">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
            Quản trị hệ thống</button>

          <div class="nav-group">Thao tác nhanh</div>
          <button class="nav-btn" onclick="window.openIncident()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l10 18H2L12 3z" /><path d="M12 10v4.5M12 17.6v.4" /></svg>
            Báo sự cố khẩn</button>
          <button class="nav-btn" onclick="window.logout()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
            Đăng xuất</button>

          <button class="sb-toggle" onclick="window.toggleSidebarCollapse()" title="Thu gọn sidebar (phím [)" aria-label="Thu gọn / mở rộng thanh bên">
            <svg class="sb-toggle-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6" /></svg>
            <span class="sb-toggle-lbl">Thu gọn thanh bên</span>
          </button>

          <div class="sidebar-foot">
            <b style="color:#A6B5CC">Cát Tường Group</b><br />
            TP Bắc Ninh · Bắc Ninh<br />
            NƠXH · Xây dựng · Quản lý vận hành<br /><br />
            <span>Phiên bản 2.2 · 07/2026<br />Mã: PCLB-PCCC-CC-02<br />Căn cứ: QĐ.03 (17/07/2026)</span>
          </div>
        </aside>

        <div class="main">
          <div class="topbar">
            <button class="menu-btn" onclick="window.toggleSidebar()" aria-label="Mở menu">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
            </button>
            <div>
              <h1 id="secTitle">Bảng điều hành tổng thể</h1>
              <div class="sub-title" id="secSubtitle">Toàn cảnh sự cố · lực lượng · tài nguyên</div>
            </div>

            <div class="top-meta">
              <div class="scenario-sw" role="tablist" aria-label="Kịch bản demo">
                <button data-s="norm" class="on" onclick="window.setScenario('norm')"><span class="dot"></span><span class="lbl">Thường trực</span></button>
                <button data-s="storm" onclick="window.setScenario('storm')"><span class="dot"></span><span class="lbl">🌀 Bão BAVI</span></button>
                <button data-s="fire" onclick="window.setScenario('fire')"><span class="dot"></span><span class="lbl">🔥 Cháy CT HIJ-KL</span></button>
              </div>
              <button class="btn btn-ghost btn-sm" onclick="window.runDemoTimeline()" title="Chạy timeline diễn biến tự động" id="demoBtn">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                <span class="lbl">Chạy timeline</span>
              </button>

              <div class="bell-wrap">
                <button class="bell-btn" onclick="window.toggleNotifPanel(event)" title="Thông báo điều động">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 9a6 6 0 10-12 0c0 5-2 6-2 6h16s-2-1-2-6z" /><path d="M10.3 20a2 2 0 003.4 0" /></svg>
                  <span class="bell-cnt" id="bellCnt" style="display:none">0</span>
                </button>
                <div class="notif-panel" id="notifPanel">
                  <div class="notif-head">
                    <b style="font-size:13px;color:#fff">Thông báo điều động</b>
                    <span class="right"></span>
                    <button class="btn btn-ghost btn-sm" onclick="window.markAllRead()">Đã đọc tất cả</button>
                  </div>
                  <div id="notifList"></div>
                </div>
              </div>

              <div class="clock" id="clock"></div>

              <button class="theme-btn" onclick="window.toggleTheme()" title="Chuyển sáng/tối" aria-label="Chuyển giao diện sáng tối">
                <svg class="icon-moon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
                <svg class="icon-sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>
              </button>

              <button class="btn btn-ghost btn-sm" id="meBadge" onclick="window.logout()" title="Đăng xuất">—</button>
            </div>
          </div>

          <div class="content">
            <section class="section active" id="sec-dashboard">
              <div class="level-banner lv0" id="levelBanner">
                <div>
                  <div style="font-size:10.5px;letter-spacing:.14em;font-weight:700;color:currentColor;opacity:.9">CẤP ĐỘ VẬN HÀNH HIỆN TẠI</div>
                  <div class="lv-code" id="lbCode">XANH — SẴN SÀNG MÙA MƯA BÃO</div>
                  <div class="lv-desc" id="lbDesc">Không có hình thái thời tiết nguy hiểm. Duy trì checklist hằng ngày mùa mưa bão và tự kiểm tra PCCC định kỳ.</div>
                  <div class="flex mt8">
                    <span class="badge bg-navy"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="4" /></svg> EOC Level 3 – Giám sát</span>
                    <span class="badge bg-teal">🌡 30°C · Ẩm 82% · Gió 2m/s</span>
                    <span class="badge bg-navy" id="eventBadge" style="display:none"></span>
                  </div>
                </div>
                <div class="right flex gap-lg">
                  <div class="radar"><div class="sweep"></div><div class="blip" style="left:60%;top:30%"></div><div class="blip" style="left:35%;top:70%;animation-delay:.7s"></div></div>
                  <div class="countdown" id="cdBox" style="display:none">
                    <div class="cd-num" id="cdNum">—:—</div>
                    <div class="cd-lbl" id="cdLbl">tới thời điểm ảnh hưởng</div>
                  </div>
                  <button class="btn btn-orange btn-lg" onclick="window.go('activation')">⚡ Trung tâm kích hoạt</button>
                </div>
              </div>

              <div class="grid g4">
                <div class="stat"><div class="s-lbl">Nhiệm vụ đã phát</div><div class="s-val" id="kTotal">0</div><div class="s-sub">Trong sự kiện hiện tại</div></div>
                <div class="stat navy"><div class="s-lbl">Đã xác nhận</div><div class="s-val" id="kAck">—</div><div class="s-sub">Tỷ lệ nhận lệnh</div></div>
                <div class="stat good"><div class="s-lbl">Hoàn thành</div><div class="s-val" id="kDone">—</div><div class="s-sub">Có ảnh xác nhận</div></div>
                <div class="stat crit"><div class="s-lbl">Quá hạn / Vướng mắc</div><div class="s-val" id="kRisk">0</div><div class="s-sub">Cần chỉ huy can thiệp</div></div>
              </div>

              <div class="grid mt" style="grid-template-columns:1.4fr 1fr">
                <div class="card">
                  <div class="card-h">
                    <h3>Bản đồ tác nghiệp — Bắc Ninh</h3>
                    <span class="badge bg-teal">🛰 Realtime</span>
                    <span class="right muted small">Click marker để xem chi tiết cơ sở</span>
                  </div>
                  <div class="card-b" style="padding:12px">
                    <div id="dashMap" style="height:400px;position:relative"></div>
                  </div>
                </div>

                <div class="card">
                  <div class="card-h">
                    <h3>Dự báo &amp; Timeline diễn biến</h3>
                  </div>
                  <div class="card-b">
                    <div class="flex" style="gap:14px">
                      <div style="font-size:48px;line-height:1">☀️</div>
                      <div>
                        <div style="font-family:var(--mono);font-size:28px;font-weight:700;color:#fff">30°</div>
                        <div class="muted small">TP Bắc Ninh · Ẩm 82% · Gió ĐN 2m/s</div>
                        <div class="tiny" style="color:var(--teal-glow);margin-top:2px">Nguồn Open-Meteo · Đối chiếu nchmf.gov.vn</div>
                      </div>
                    </div>
                    <hr />
                    <div id="wxForecast" class="grid" style="grid-template-columns:repeat(5,1fr);gap:6px"></div>
                    <hr />
                    <div class="b small mb" style="color:var(--ink)">Diễn biến sự kiện (dòng thời gian)</div>
                    <div id="tlMini" class="stack" style="gap:6px"></div>
                  </div>
                </div>
              </div>

              <div class="grid mt g2">
                <div class="card">
                  <div class="card-h">
                    <h3>Bảng xếp hạng đơn vị — Tiến độ chấp hành</h3>
                    <span class="right badge bg-teal" id="unitProgLbl">Chưa có sự kiện</span>
                    <div class="sub">Tỷ lệ nhiệm vụ hoàn thành / tổng nhiệm vụ được phát cho từng đơn vị trong sự kiện hiện tại.</div>
                  </div>
                  <div id="leaderboard"><div class="card-b muted">Kích hoạt sự kiện để xem xếp hạng đơn vị.</div></div>
                </div>

                <div class="card">
                  <div class="card-h">
                    <h3>Bản đồ nhiệt rủi ro theo cụm dự án</h3>
                    <span class="right badge bg-warn">Cập nhật liên tục</span>
                    <div class="sub">Chỉ số rủi ro tổng hợp (tồn kho + nhân sự + thời tiết + tuổi công trình + báo cáo diễn tập).</div>
                  </div>
                  <div class="card-b">
                    <div class="heat-grid" id="riskHeatmap"></div>
                  </div>
                </div>
              </div>

              <div class="grid mt" style="grid-template-columns:1.4fr 1fr">
                <div class="card">
                  <div class="card-h">
                    <h3>Camera trực tuyến — Cơ sở trọng yếu</h3>
                    <span class="badge bg-crit"><span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:currentColor;box-shadow:0 0 8px currentColor;animation:pulse-glow 1.4s infinite;margin-right:2px"></span> LIVE</span>
                    <span class="right muted small">Click ô để mở toàn màn hình</span>
                  </div>
                  <div class="card-b">
                    <div class="cam-grid" id="camGrid"></div>
                  </div>
                </div>

                <div class="card">
                  <div class="card-h">
                    <h3>Diễn biến mới nhất</h3>
                    <button class="btn btn-ghost btn-sm right" onclick="window.go('log')">Xem nhật ký →</button>
                  </div>
                  <div class="card-b stack" id="recentLog"><div class="muted small">Chưa có sự kiện nào được ghi nhận trong phiên làm việc này.</div></div>
                </div>
              </div>

              <div class="card mt">
                <div class="card-h">
                  <h3>Lịch trực &amp; mốc báo cáo bắt buộc</h3>
                  <div class="sub">Theo Phương án công trường + QT-08 + Báo cáo kiểm kê 16/07/2026.</div>
                </div>
                <div class="card-b">
                  <div class="grid g4">
                    <div class="alert-box ab-info"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></svg><div><b>Hằng ngày 19:00</b><br />Chỉ huy phó nhận đủ báo cáo đóng cửa · cắt điện các cụm tòa (kèm ảnh).</div></div>
                    <div class="alert-box ab-info"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></svg><div><b>06:30 &amp; 16:30 hằng ngày</b><br />Bản tin thời tiết Zalo toàn công ty (MKT-ZL-01/02) trong mùa mưa bão.</div></div>
                    <div class="alert-box ab-warn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l10 18H2L12 3z" /><path d="M12 10v4.5M12 17.6v.4" /></svg><div><b>Hạn 31/07/2026 — Đ.74 QĐ.03</b><br />Đối chiếu 100% hiện vật, gắn mã CTG-PCLB, sơ đồ kho, chốt người quản lý (10 ngày làm việc từ 17/07).</div></div>
                    <div class="alert-box ab-warn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l10 18H2L12 3z" /><path d="M12 10v4.5M12 17.6v.4" /></svg><div><b>Hạn 07/08/2026 — Đ.74 QĐ.03</b><br />Từng đơn vị ban hành/cập nhật phương án chi tiết, danh sách trực, định mức, sơ đồ rủi ro (15 ngày làm việc).</div></div>
                  </div>
                </div>
              </div>
            </section>

            <section class="section" id="sec-activation">
              <div class="card">
                <div class="card-h">
                  <h3>Bước 1 · Nhận định tình hình &amp; chọn cấp độ kích hoạt</h3>
                  <div class="sub">Nguyên tắc: <b>bản tin dự báo là tín hiệu kích hoạt</b>. Mỗi cấp độ gắn sẵn gói nhiệm vụ tới từng bộ phận — kích hoạt là phát lệnh, không soạn lại từ đầu.</div>
                </div>
                <div class="card-b">
                  <div class="alert-box ab-info mb"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg><div><b>Thẩm quyền (Điều 8 QĐ.03):</b> Chủ tịch quyết định Cấp 3–4 · TGĐ/người ủy quyền Cấp 1–2 · Chỉ huy hiện trường được kích hoạt tại chỗ khi có nguy cơ trực tiếp.</div></div>

                  <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px" id="levelPicker"></div>

                  <hr />

                  <div class="grid g4">
                    <div><label class="small b" style="color:var(--ink-2)">Loại hình thái</label>
                      <select id="inpType">
                        <option value="mua">Mưa lớn / dông lốc</option>
                        <option value="atnd">Áp thấp nhiệt đới</option>
                        <option value="baobd">Tin bão trên Biển Đông</option>
                        <option value="baokc" selected>Bão KHẨN CẤP (≤48h)</option>
                        <option value="baodl">Bão đã đổ bộ đất liền</option>
                        <option value="pccc">Sự cố cháy / CNCH</option>
                      </select>
                    </div>
                    <div><label class="small b" style="color:var(--ink-2)">Tên sự kiện</label>
                      <input id="inpName" placeholder="Bão BAVI" value="Bão số 3 — BAVI" />
                    </div>
                    <div><label class="small b" style="color:var(--ink-2)">Cấp gió dự báo</label>
                      <select id="inpWind">
                        <option value="6">Cấp 6–7 · giật mạnh</option>
                        <option value="8">Cấp 8–9 · bão</option>
                        <option value="10" selected>Cấp 10–11 · bão mạnh</option>
                        <option value="12">Cấp 12–13 · rất mạnh</option>
                        <option value="14">≥14 · đặc biệt</option>
                      </select>
                    </div>
                    <div><label class="small b" style="color:var(--ink-2)">Thời điểm ảnh hưởng (giờ)</label>
                      <input id="inpHours" type="number" value="12" min="1" max="120" />
                    </div>
                  </div>

                  <div class="flex mt">
                    <button class="btn btn-primary btn-lg" onclick="window.confirmActivate()">⚡ Kích hoạt &amp; phát nhiệm vụ</button>
                    <button class="btn btn-ghost" onclick="window.deactivateEvent()">Đóng sự kiện · về Thường trực</button>
                    <span class="right muted small">Lệnh sẽ được gửi ngay qua Zalo/SMS tới danh sách trực &amp; sinh nhiệm vụ tới từng người.</span>
                  </div>
                </div>
              </div>

              <div class="card mt">
                <div class="card-h">
                  <h3>Bước 2 · Nhiệm vụ đã phát — Giám sát chấp hành</h3>
                  <span class="right badge bg-navy" id="taskCounts">0 nhiệm vụ</span>
                </div>
                <div class="card-b">
                  <div class="phase-strip" id="phaseStrip"></div>
                  <div class="stack" id="taskList"><div class="muted small">Chưa kích hoạt sự kiện. Chọn cấp độ ở Bước 1 để phát nhiệm vụ.</div></div>
                </div>
              </div>
            </section>

            <section class="section" id="sec-my">
              <div class="card" style="background:linear-gradient(135deg,rgba(22,168,153,.1),var(--bg-2))">
                <div class="card-b flex" style="gap:18px;padding:20px 24px">
                  <div class="avatar avatar-lg" id="myAvatar">?</div>
                  <div style="flex:1">
                    <div class="muted tiny b" style="letter-spacing:.1em">CÁN BỘ ĐANG TRỰC</div>
                    <div id="myName" style="font-size:22px;font-weight:700;color:#fff;margin:2px 0">—</div>
                    <div class="muted small" id="myRole">—</div>
                    <div class="flex mt8" style="gap:6px">
                      <span class="badge bg-good"><span style="width:6px;height:6px;border-radius:50%;background:currentColor;box-shadow:0 0 6px currentColor;display:inline-block"></span> ONLINE</span>
                      <span class="badge bg-navy" id="myUnitBadge">—</span>
                      <span class="badge bg-teal" id="myPhone">—</span>
                    </div>
                  </div>
                  <div class="right stack" style="align-items:flex-end">
                    <div class="muted tiny">Trạng thái hoạt động: <b style="color:var(--good)">Sẵn sàng nhận lệnh</b></div>
                  </div>
                </div>
              </div>

              <div class="grid mt g4">
                <div class="stat"><div class="s-lbl">Tổng nhiệm vụ</div><div class="s-val" id="myKTotal">0</div><div class="s-sub">Được giao trong sự kiện này</div></div>
                <div class="stat navy"><div class="s-lbl">Đang thực hiện</div><div class="s-val" id="myKDoing">0</div><div class="s-sub">Đã xác nhận, chưa xong</div></div>
                <div class="stat good"><div class="s-lbl">Đã hoàn thành</div><div class="s-val" id="myKDone">0</div><div class="s-sub">Kèm ảnh xác nhận</div></div>
                <div class="stat crit"><div class="s-lbl">Sắp / đã quá hạn</div><div class="s-val" id="myKOver">0</div><div class="s-sub">Cần hoàn thành ngay</div></div>
              </div>

              <div class="grid mt" style="grid-template-columns:1.5fr 1fr">
                <div class="card">
                  <div class="card-h">
                    <h3>Nhiệm vụ được giao cho tôi</h3>
                    <button class="btn btn-primary btn-sm right" onclick="window.ackAllMine()">✓ Xác nhận nhận toàn bộ</button>
                  </div>
                  <div class="card-b">
                    <div class="phase-strip" id="myTabs">
                      <button class="on" data-tab="all">Tất cả</button>
                      <button data-tab="new">Chưa nhận</button>
                      <button data-tab="doing">Đang làm</button>
                      <button data-tab="done">Đã xong</button>
                    </div>
                    <div class="stack" id="myTaskList"></div>
                  </div>
                </div>

                <div class="card">
                  <div class="card-h"><h3>Người báo cáo cho tôi (drill-down)</h3>
                    <div class="sub">Click để xem danh sách nhiệm vụ tôi đã phân công.</div>
                  </div>
                  <div class="card-b">
                    <div id="myOrgTree" class="stack"></div>
                  </div>
                </div>
              </div>
            </section>

            <section class="section" id="sec-pccc">
              <div class="grid" style="grid-template-columns:1.4fr 1fr;gap:14px">
                <div class="card">
                  <div class="card-h">
                    <h3>Sơ đồ mặt bằng — Cụm CT HIJ-KL</h3>
                    <span class="badge bg-teal">🚒 Đội PCCC cơ sở: 8 người</span>
                    <span class="right badge bg-warn" id="pcccStatus">Sẵn sàng</span>
                  </div>
                  <div class="card-b" style="padding:12px">
                    <div id="pcccFloorplan" style="aspect-ratio:16/10;background:radial-gradient(circle at 50% 50%,#0F1A2C,#05080F);border-radius:8px;border:1px solid var(--line);position:relative;overflow:hidden"></div>
                  </div>
                </div>
                <div class="card">
                  <div class="card-h"><h3>5 bước xử lý khi có cháy</h3></div>
                  <div class="card-b stack" id="fireSteps"></div>
                </div>
              </div>

              <div class="grid mt g2">
                <div class="card">
                  <div class="card-h">
                    <h3>Camera các điểm nóng</h3>
                    <span class="badge bg-crit" id="pcccCamAlert" style="display:none">⚠ Phát hiện khói</span>
                  </div>
                  <div class="card-b">
                    <div class="cam-grid" id="pcccCams"></div>
                  </div>
                </div>
                <div class="card">
                  <div class="card-h">
                    <h3>Kiểm kê PCCC</h3>
                    <span class="right muted small">Cập nhật 16/07/2026 · Ban chỉ huy</span>
                  </div>
                  <div class="card-b" id="pcccInv"></div>
                </div>
              </div>
            </section>

            <section class="section" id="sec-scenario">
              <div class="card">
                <div class="card-h">
                  <h3>Kịch bản chuẩn theo cấp độ vận hành</h3>
                  <div class="sub">Kịch bản có sẵn được kích hoạt tự động theo cấp độ. Có thể diễn tập từng kịch bản để đo phản ứng.</div>
                </div>
                <div class="card-b">
                  <div id="scenarioList" class="stack"></div>
                </div>
              </div>
            </section>

            <section class="section" id="sec-cost">
              <div class="card">
                <div class="card-h"><h3>Cơ cấu chi phí ứng phó theo cấp độ</h3></div>
                <div class="card-b" id="costTable"></div>
              </div>
            </section>

            <section class="section" id="sec-force">
              <div class="grid" style="grid-template-columns:1fr 1fr;gap:14px">
                <div class="card">
                  <div class="card-h"><h3>Danh bạ trực chỉ huy</h3><span class="right muted small">Nhấp icon để gọi/chat</span></div>
                  <div class="card-b stack" id="phonebook"></div>
                </div>
                <div class="card">
                  <div class="card-h"><h3>Tồn kho — Định mức &amp; thực tế</h3></div>
                  <div class="card-b" id="inventory"></div>
                </div>
              </div>
            </section>

            <section class="section" id="sec-qd03">
              <div class="grid g2">
                <div class="card">
                  <div class="card-h"><h3>Nguyên tắc hoạt động PCLB-PCCC</h3></div>
                  <div class="card-b stack" id="qd03Principles"></div>
                </div>
                <div class="card">
                  <div class="card-h"><h3>Các hành vi bị nghiêm cấm</h3></div>
                  <div class="card-b stack" id="qd03Forbidden"></div>
                </div>
              </div>
              <div class="card mt">
                <div class="card-h"><h3>Ma trận trách nhiệm &amp; Biểu mẫu chuẩn</h3></div>
                <div class="card-b" id="qd03Matrix"></div>
              </div>
            </section>

            <section class="section" id="sec-process">
              <div class="card">
                <div class="card-h"><h3>Quy trình QT-08 — Ứng phó thiên tai · sự cố · cháy nổ</h3></div>
                <div class="card-b" id="processFlow"></div>
              </div>
            </section>

            <section class="section" id="sec-log">
              <div class="card">
                <div class="card-h">
                  <h3>Nhật ký sự kiện</h3>
                  <button class="btn btn-ghost btn-sm right" onclick="window.exportLog()">⭳ Xuất CSV</button>
                </div>
                <div class="card-b" id="logList"></div>
              </div>
            </section>

            <section class="section" id="sec-relief">
              <div id="reliefContent"></div>
            </section>

            <section class="section" id="sec-admin">
              <div id="adminContent"></div>
            </section>
          </div>
        </div>
      </div>

      <div class="fab-stack">
        <button class="fab orange" onclick="window.openAI()" title="Trợ lý AI">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8V4H8" /><rect x="4" y="8" width="16" height="12" rx="2" /><path d="M2 14h2M20 14h2M15 13v2M9 13v2" /></svg>
        </button>
        <button class="fab" onclick="window.openChat()" title="Chat ban chỉ huy">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
          <span class="fab-badge" id="chatBadge">3</span>
        </button>
      </div>

      <div class="drawer" id="chatDrawer">
        <div class="drawer-h">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal-glow)" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
          <div>
            <h3>Chat ban chỉ huy</h3>
            <div class="muted tiny">6 thành viên · <span style="color:var(--good)">4 online</span></div>
          </div>
          <button class="drawer-close right" onclick="window.closeChat()">✕</button>
        </div>
        <div class="drawer-body" id="chatBody"></div>
        <div class="drawer-foot">
          <div class="chat-composer">
            <input id="chatInput" placeholder="Nhập tin nhắn…" onkeypress="if(event.key==='Enter')window.sendChat()" />
            <button class="btn btn-primary btn-sm" onclick="window.sendChat()">↑ Gửi</button>
          </div>
        </div>
      </div>

      <div class="drawer" id="aiDrawer">
        <div class="drawer-h">
          <div class="avatar avatar-sm grad-c">🤖</div>
          <div>
            <h3>Trợ lý AI Điều hành</h3>
            <div class="muted tiny">Tra QĐ.03 · gợi ý hành động · soạn lệnh</div>
          </div>
          <button class="drawer-close right" onclick="window.closeAI()">✕</button>
        </div>
        <div class="drawer-body">
          <div id="aiPills" class="ai-pills"></div>
          <div id="aiBody"></div>
        </div>
        <div class="drawer-foot">
          <div class="chat-composer">
            <input id="aiInput" placeholder="Hỏi trợ lý…" onkeypress="if(event.key==='Enter')window.askAI()" />
            <button class="btn btn-primary btn-sm" onclick="window.askAI()">↑ Hỏi</button>
          </div>
        </div>
      </div>

      <div class="modal-overlay" id="modal-task">
        <div class="modal">
          <div class="modal-h"><h3 id="modalTaskTitle">Chi tiết nhiệm vụ</h3>
            <button class="drawer-close right" onclick="window.closeModal('task')">✕</button>
          </div>
          <div class="modal-b" id="modalTaskBody"></div>
          <div class="modal-f">
            <button class="btn btn-ghost" onclick="window.closeModal('task')">Đóng</button>
            <button class="btn btn-primary" id="modalTaskAck">✓ Xác nhận</button>
            <button class="btn btn-orange" id="modalTaskDone">Hoàn thành</button>
          </div>
        </div>
      </div>

      <div class="modal-overlay" id="modal-admin-generic">
        <div class="modal"></div>
      </div>

      <div class="modal-overlay" id="modal-incident">
        <div class="modal">
          <div class="modal-h"><h3 style="color:var(--crit)">⚠ Báo sự cố khẩn</h3>
            <button class="drawer-close right" onclick="window.closeModal('incident')">✕</button>
          </div>
          <div class="modal-b">
            <div class="alert-box ab-crit mb">Lệnh này sẽ được phát ngay lập tức tới toàn bộ Ban chỉ huy và tự động sinh nhiệm vụ ứng phó.</div>
            <div class="stack">
              <div>
                <label class="small b" style="color:var(--ink-2)">Loại sự cố</label>
                <select id="incType">
                  <option value="fire">🔥 Cháy — CNCH</option>
                  <option value="flood">💧 Ngập / úng cục bộ</option>
                  <option value="wind">🌬 Gió lốc / mái tôn</option>
                  <option value="power">⚡ Sự cố điện</option>
                  <option value="injury">🩹 Có người bị thương</option>
                </select>
              </div>
              <div>
                <label class="small b" style="color:var(--ink-2)">Vị trí</label>
                <select id="incSite"></select>
              </div>
              <div>
                <label class="small b" style="color:var(--ink-2)">Mô tả nhanh</label>
                <textarea id="incDesc" rows="3" placeholder="Ví dụ: Phát hiện khói tại tầng 3 khu B, chưa có lửa lớn, đã ngắt điện."></textarea>
              </div>
            </div>
          </div>
          <div class="modal-f">
            <button class="btn btn-ghost" onclick="window.closeModal('incident')">Huỷ</button>
            <button class="btn btn-danger" onclick="window.saveIncident()">🚨 Phát lệnh ứng phó</button>
          </div>
        </div>
      </div>

      <nav class="mobile-nav" aria-label="Điều hướng chính">
        <div class="mobile-nav-inner">
          <button data-mnav="dashboard" onclick="window.go('dashboard')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg>
            <span>Bảng ĐH</span>
          </button>
          <button data-mnav="my" onclick="window.go('my')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="3.5" /><path d="M5.5 20c.7-3.6 3.2-5.5 6.5-5.5s5.8 1.9 6.5 5.5" /></svg>
            <span>Việc tôi</span>
          </button>
          <button data-mnav="activation" onclick="window.go('activation')" style="position:relative">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="var(--teal-glow)" stroke="none" style="filter:drop-shadow(0 0 6px var(--teal-glow))"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" /></svg>
            <span style="font-weight:600;color:var(--teal-glow)">Kích hoạt</span>
          </button>
          <button data-mnav="relief" onclick="window.go('relief')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.6a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.07a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
            <span>Cứu trợ</span>
          </button>
          <button data-mnav="menu" onclick="window.toggleSidebar()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
            <span>Thêm</span>
          </button>
        </div>
      </nav>

      <script src="/static/assets/ctg-data.js"></script>
      <script src="/static/assets/mock-people.js"></script>
      <script src="/static/assets/relief-data.js"></script>
      <script src="/static/assets/map-bacninh.js"></script>
      <script src="/static/js/api-client.js"></script>
      <script src="/static/assets/ctg-core.js"></script>
      <script src="/static/js/core-override.js"></script>
      <script src="/static/assets/chat-ai.js"></script>
      <script src="/static/js/chat-ai-override.js"></script>
      <script src="/static/assets/ctg-modules.js"></script>
      <script src="/static/js/modules-override.js"></script>
      <script src="/static/assets/relief.js"></script>
      <script src="/static/js/relief-override.js"></script>
      <script src="/static/assets/admin.js"></script>
      <script src="/static/js/admin-override.js"></script>
      <script src="/static/js/bootstrap.js"></script>
    </>
  )
}

export default pages
