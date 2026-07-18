# CTG Command Center

## Tổng quan dự án
- **Tên**: CTG Command Center — Trung tâm điều hành PCLB · PCCC · Cứu trợ
- **Mục tiêu**: Số hoá quy trình chỉ huy ứng phó thiên tai/hoả hoạn và cứu trợ của Cát Tường Group theo QĐ.03, thay thế bản demo tĩnh (window.* mock data) bằng hệ thống production thực: đăng nhập, phân quyền theo vai trò, dữ liệu tồn tại qua Cloudflare D1, vận hành đa người dùng đồng thời.
- **Vai trò (8)**: `super` (toàn quyền), `bch` (Ban chỉ huy — activate/approve), `unit_head` (trưởng đơn vị), `relief` (điều phối cứu trợ), `warehouse` (kho vận), `duty` (trực ban), `audit` (kiểm toán/pháp chế), `viewer` (chỉ xem).

## URL
- **Production**: https://03c19794-534c-4832-b179-50d9bc9ca041.vip.gensparksite.com
- **Trang đăng nhập**: `/login`
- **GitHub**: https://github.com/phamdungcattuong-byte/CTG_PCCC (branch `main`)

## Kiến trúc & Data
- **Backend**: Hono (SSR JSX) chạy trên Cloudflare Workers, deploy qua Genspark Hosted Deploy (Workers for Platform).
- **Database**: Cloudflare D1 (SQLite) — 64 bảng (units, roles, users, events, tasks, notifications, audit_log, refresh_tokens, relief_projects + các bảng con team/vehicles/cargo/itinerary/tasks/approvals, group_store, relief_levels, level_phases, v.v.)
- **Storage file**: Cloudflare R2 (bucket riêng, dùng cho evidence upload của task done).
- **Auth**: JWT tự ký (HMAC-SHA256 qua `hono/utils/jwt`) + PBKDF2-SHA256 (100.000 vòng) băm mật khẩu, cookie httpOnly `ctg_token` (access, 15 phút) / `ctg_refresh` (refresh, 30 ngày).
- **RBAC**: middleware `requireAuth` / `requirePermission` / `requireAnyPermission`; role `super` có quyền `*` (wildcard).
- **Realtime (Phase 1)**: polling 15 giây (không dùng WebSocket vì giới hạn Cloudflare Workers).
- **Frontend**: giữ nguyên giao diện/render logic của bản prototype gốc (`ctg-core.js`, `ctg-modules.js`, `admin.js`, `relief.js`) nhưng **override toàn bộ các hàm mutation** (activate, ack, done, saveUser, saveIncident, ...) để gọi API thực thay vì mutate mảng JS trong bộ nhớ. Các file override: `core-override.js`, `modules-override.js`, `admin-override.js`, `relief-override.js`, `chat-ai-override.js`, cùng `api-client.js` (fetch wrapper + shape adapters D1 row ↔ prototype object).
- **Trợ lý AI**: `chat-ai-override.js` gọi thật `POST /api/v1/ai/chat` → backend proxy tới Genspark LLM proxy (`gpt-5-mini`, `max_tokens:1500` vì reasoning token tiêu hao trước khi sinh nội dung). Mất kết nối → tự rơi về 6 câu trả lời mẫu ngoại tuyến sẵn có trong `chat-ai.js` (kèm cảnh báo "phản hồi dự phòng").
- **An ninh Camera** (`security-camera.js` + `camera-admin.js`): phân hệ MỚI (không phải override) xem **live-feed thật** từ camera chung cư/công trường. Cloudflare Workers không xử lý video — mỗi camera lưu **1 trong 2** loại URL: `embed_url` (iframe player của nền tảng cloud CCTV vendor — Hik-Connect/EZVIZ/DMSS...) hoặc `hls_url` (.m3u8, phát bằng `hls.js` nạp lười qua CDN, fallback HLS gốc cho Safari). Trang "An ninh Camera" hiển thị lưới camera + nguồn cảnh báo mở; modal toàn màn hình cho phát video và ghi cảnh báo an ninh thủ công. Tab **Camera** trong Quản trị hệ thống quản lý CRUD danh mục camera (thay cho ô "Camera Stream URL" trang trí cũ). `renderCamGrid()` gốc trong `ctg-modules.js` (mini-preview trang trí ở Dashboard/PCCC) được giữ nguyên, không đụng tới.

## API chính (base path `/api/v1`)
| Method | Path | Chức năng |
|---|---|---|
| POST | `/auth/login` | Đăng nhập, trả JWT + set cookie |
| POST | `/auth/logout` | Đăng xuất |
| POST | `/auth/refresh` | Làm mới access token |
| GET | `/auth/me` | Thông tin user hiện tại |
| GET | `/events?active=true` | Lấy sự kiện đang hoạt động |
| POST | `/events/activate` | Kích hoạt cấp độ ứng phó (sinh task tự động theo cấp) |
| POST | `/events/:id/deactivate` | Hạ cấp / kết thúc sự kiện |
| GET/POST | `/events/:id/tasks` | Danh sách / tạo task |
| PATCH | `/events/:id/tasks/:tid` | Cập nhật task |
| POST | `/events/:id/tasks/:tid/ack` | Xác nhận đã nhận task |
| POST | `/events/:id/tasks/:tid/done` | Hoàn thành task (hỗ trợ multipart evidence) |
| GET/POST | `/events/:id/logs` | Nhật ký sự kiện |
| POST | `/incidents` | Báo cáo sự cố (tự sinh event + task) |
| GET/PATCH | `/notifications` | Thông báo, đánh dấu đã đọc |
| POST | `/notifications/mark-all-read` | Đánh dấu tất cả đã đọc |
| GET | `/audit`, `/audit/export` | Nhật ký kiểm toán |
| GET/POST/PATCH/DELETE | `/users` | Quản trị người dùng (yêu cầu quyền `admin.manage` cho POST/PATCH/DELETE) |
| GET/POST/PATCH | `/relief-projects` | Dự án cứu trợ (team/vehicles/cargo/itinerary/tasks/approvals) |
| POST | `/auth/change-password` | Đổi mật khẩu (tự phục vụ, yêu cầu mustChangePassword hiện tại) |
| POST | `/ai/chat` | Hỏi trợ lý AI (LLM thật — model `gpt-5-mini` qua Genspark LLM proxy), log mọi lượt hỏi/đáp vào `ai_chat_logs` |
| GET/POST/PATCH/DELETE | `/cameras` | Quản lý danh mục camera an ninh (`camera.manage`); GET yêu cầu `camera.view` |
| GET | `/cameras/alerts/feed?status=open` | Nguồn cảnh báo an ninh đang mở (mọi camera) |
| GET | `/cameras/:id` | Chi tiết 1 camera + 20 cảnh báo gần nhất |
| POST | `/cameras/:id/alerts` | Ghi cảnh báo an ninh thủ công khi đang xem live-feed (`camera.view`) |
| PATCH | `/cameras/:camId/alerts/:alertId` | Đánh dấu đã xử lý cảnh báo (`camera.manage`) |

Envelope phản hồi thống nhất: `{ok:true, data}` hoặc `{ok:false, error:{code,message}}`.

## Hướng dẫn sử dụng
1. Truy cập URL production, đăng nhập bằng tài khoản được cấp (username = mã người dùng, VD: `pt1`, `cht`, `vpct1`...). **Mật khẩu mặc định cho toàn bộ 24 tài khoản seed: `Cattuong@2026`** — cần đổi ngay khi đưa vào vận hành thật.
2. Vai trò `bch`/`super` có thể kích hoạt cấp độ ứng phó (Activation) → hệ thống tự sinh danh sách nhiệm vụ (task) theo mốc thời gian (DUR/R0/R24/R72/R7...) và gán cho đơn vị/người phụ trách.
3. Người được giao nhiệm vụ đăng nhập, vào mục "Của tôi" để **Xác nhận (ack)** rồi **Hoàn thành (done)**.
4. Vai trò `admin`/`super` vào mục Quản trị để quản lý người dùng, xem nhật ký kiểm toán.
5. Vai trò `relief` quản lý các dự án cứu trợ (ngân sách, đội, phương tiện, hàng hoá, lịch trình).

## Bảo mật đăng nhập
- **Rate-limiting**: tối đa 5 lần đăng nhập sai / phút, tính theo cả **username** và **IP** (D1-backed sliding window, không dùng KV/memory vì Cloudflare Workers không có in-memory limiter). Vượt ngưỡng → HTTP 429 `RATE_LIMITED`.
- **Buộc đổi mật khẩu lần đầu**: toàn bộ 24 tài khoản seed có cờ `must_change_password = 1`. Khi đăng nhập, nếu cờ này = true, app shell hiển thị modal chặn buộc đổi mật khẩu trước khi vào hệ thống (`bootstrap.js` → `showForceChangePasswordModal`). Gọi `POST /auth/change-password` với mật khẩu hiện tại đúng + mật khẩu mới (≥ 8 ký tự, khác mật khẩu cũ) sẽ tự xóa cờ này.
- Migration: `migrations/0005_security_hardening.sql` (thêm cột `must_change_password` vào `users`, bảng `login_attempts`).

## Trạng thái GitHub
✅ Đã kết nối — repository https://github.com/phamdungcattuong-byte/CTG_PCCC, branch `main`, đã push toàn bộ lịch sử commit (commit mới nhất `436f44f`).

## Việc đã hoàn thành
- [x] Toàn bộ backend API (auth, events/tasks, notifications, users, relief-projects, incidents) — đã test end-to-end qua curl trên cả sandbox và **production thật**.
- [x] Toàn bộ 4 override script (core/modules/admin/relief) nối UI prototype với API thực.
- [x] Deploy lên Cloudflare qua Genspark Hosted Deploy — Worker + D1 + R2 đã tạo, 4 migration đã apply.
- [x] Seed dữ liệu tham chiếu (14 units, 8 roles), 24 người dùng, 4 dự án cứu trợ vào D1 production.
- [x] Set secret `JWT_SECRET` cho production (secret riêng, khác với `.dev.vars` dùng lúc dev).
- [x] Verify toàn luồng trên production: login → activate (sinh 28 task) → ack → done → deactivate → notifications → relief-projects → users (kiểm tra RBAC theo từng role).
- [x] Sửa bug `active` dropdown trong admin-override.js (trước đó luôn lưu giá trị `1` bất kể lựa chọn).
- [x] Sửa route `POST /users` để lưu đúng cột `active` khi tạo user mới (trước đó luôn bỏ qua giá trị client gửi lên, mặc định DB = 1) — đã test 3 case (active:false/true/omit) trên sandbox và production, đã redeploy.
- [x] Rate-limiting cho login (5 lần sai/phút theo username+IP, D1-backed) — test 6 lần đăng nhập sai trên cả sandbox và production, xác nhận HTTP 429 ở lần thứ 6.
- [x] Buộc đổi mật khẩu lần đầu cho 24 tài khoản seed (cờ `must_change_password`) + endpoint `POST /auth/change-password` + modal chặn UI — test toàn bộ round-trip (login → modal → đổi → cờ về false) trên production.
- [x] Thêm `favicon.svg` (khắc phục 404 trước đó), áp dụng cho cả trang `/login` và app shell qua `renderer.tsx`.

## Việc đã hoàn thành (AI + An ninh Camera — bổ sung 17/07/2026)
- [x] Migration `0006_ai_camera_features.sql`: mở rộng bảng `cameras` (embed_url, kind, vendor, location_note, sort_order, created_by), bảng mới `camera_alerts`, `ai_chat_logs`; quyền mới `camera.view`/`camera.manage`; cập nhật `perms_json` cho `bch`/`unit_head`/`duty`/`audit` — đã apply local D1, **CHƯA apply production**.
- [x] `POST /api/v1/ai/chat` — LLM thật (`gpt-5-mini` qua Genspark LLM proxy), test round-trip trả lời tiếng Việt đúng, log D1. Sửa 2 bug: API key sai (dùng `GSK_API_KEY` thay `GENSPARK_TOKEN` hết hạn) và `max_tokens` quá thấp bị reasoning token ăn hết (nâng lên 1500).
- [x] `/api/v1/cameras` CRUD + `/cameras/:id/alerts` — test đủ RBAC (duty xem/báo cảnh báo được, không tạo/sửa/xoá được camera).
- [x] Frontend: nav "An ninh Camera", section + modal xem toàn màn hình, `security-camera.js` (lưới camera, phát HLS qua hls.js/iframe embed, ghi cảnh báo), tab **Camera** trong Quản trị (`camera-admin.js`, CRUD đầy đủ) — build + test qua curl (page HTML chứa đủ script/section/modal, API trả đúng field JS cần), xoá ô "Camera Stream URL" trang trí cũ.
- [x] Đã commit git (`main`), README cập nhật.

## Việc đã hoàn thành (2FA, polling camera, hiện/ẩn mật khẩu — bổ sung 18/07/2026)
- [x] **2FA (TOTP)** đầy đủ backend (`/auth/2fa/setup`, `/auth/2fa/confirm`, `/auth/2fa/disable`, `/auth/2fa/login-verify`) + frontend (`twofa.js` tự phục vụ trong "Bảo mật tài khoản"; `login.js` có bước 2 nhập mã 6 số khi tài khoản đã bật 2FA).
- [x] **Tự động polling camera/cảnh báo**: `bootstrap.js` thăm dò 15 giây, chỉ gọi `MODULE_HOOKS.security()` khi đang ở section "An ninh Camera" (không tốn tài nguyên khi ở section khác).
- [x] **Hiện/ẩn mật khẩu** (icon con mắt) cho ô mật khẩu trang `/login` và cả 3 ô trong modal "Đổi mật khẩu bắt buộc" — file mới `password-toggle.js` (event delegation, dùng chung cho cả hai nơi), CSS `.login-password-wrap`/`.login-pw-toggle` trong `command-center.css`.
- [x] Đã test qua Playwright (headless Chromium) thật: click-through toggle đổi `type` giữa `password`/`text`, đăng nhập thành công, modal đổi mật khẩu bắt buộc hiển thị đúng.

## Deploy production — HOÀN TẤT (17/07/2026)
- [x] `gsk hosted deploy` — redeploy Worker thành công, migration `0006_ai_camera_features.sql` tự động apply lên D1 production (17 lệnh, verify `camera_alerts`/`ai_chat_logs`/quyền `camera.*` đã có).
- [x] Set secret production `OPENAI_API_KEY` + `OPENAI_BASE_URL` (cùng giá trị đã test working ở sandbox) qua `gsk hosted secret_put` — `JWT_SECRET` cũ vẫn giữ nguyên (3 secret tổng).
- [x] Test full trên URL production thật (`https://03c19794-534c-4832-b179-50d9bc9ca041.vip.gensparksite.com`): login `ct` → hỏi AI thật (trả lời tiếng Việt đúng ngữ cảnh QĐ.03) → tạo/xem/xoá camera → ghi + xem cảnh báo an ninh → **RBAC**: login `atv` (role `duty`) xem camera + báo cảnh báo được (200/201) nhưng tạo camera bị chặn đúng (403 `INSUFFICIENT_PERMISSIONS`). Trang chủ chứa đủ nav/section/modal/script mới.
- [x] Dọn dữ liệu test khỏi D1 production (`camera_alerts`, `cameras`, `ai_chat_logs` đều rỗng trở lại).

## Redeploy production — HOÀN TẤT (18/07/2026)
- [x] `gsk hosted deploy` — redeploy Worker thành công (không cần rebuild DB, không có migration mới), đưa lên production: fix CSS trang đăng nhập (`.login-page`/`.login-card`, commit `bf771ca`) và tính năng hiện/ẩn mật khẩu (`password-toggle.js`, commit `436f44f`).
- [x] Verify qua Playwright (headless Chromium) thật trên URL production (`https://03c19794-534c-4832-b179-50d9bc9ca041.vip.gensparksite.com`): icon con mắt đổi `type` giữa password/text đúng trên `/login`; đăng nhập `tgd`/`Cattuong@2026` thành công → hiện modal "Đổi mật khẩu bắt buộc" (đúng hành vi vì tài khoản chưa đổi mật khẩu mặc định) → cả 3 icon con mắt trong modal cũng hoạt động đúng.

## Việc chưa hoàn thành / Cần làm tiếp
- [ ] Cân nhắc thêm `Idempotency-Key` cho `confirmActivate` để chống double-click kích hoạt trùng.
- [ ] Đổi mật khẩu thật cho 24 tài khoản — cờ `must_change_password` đã bắt buộc điều này ngay lần đăng nhập đầu tiên của mọi người dùng thật, nhưng admin nên chủ động nhắc người dùng thực hiện.

## Triển khai
- **Platform**: Cloudflare Workers (Genspark Hosted Deploy — Workers for Platform, tài khoản Cloudflare do Genspark quản lý)
- **Trạng thái**: ✅ Đang hoạt động (Active) — deploy lần đầu thành công
- **Tech stack**: Hono + TypeScript + Cloudflare D1/R2 + Vite + Wrangler
- **Cập nhật lần cuối**: 2026-07-17 (thêm AI thật + phân hệ An ninh Camera — đã redeploy production, test đầy đủ trên URL thật)
