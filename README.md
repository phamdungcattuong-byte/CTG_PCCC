# CTG Command Center

## Tổng quan dự án
- **Tên**: CTG Command Center — Trung tâm điều hành PCLB · PCCC · Cứu trợ
- **Mục tiêu**: Số hoá quy trình chỉ huy ứng phó thiên tai/hoả hoạn và cứu trợ của Cát Tường Group theo QĐ.03, thay thế bản demo tĩnh (window.* mock data) bằng hệ thống production thực: đăng nhập, phân quyền theo vai trò, dữ liệu tồn tại qua Cloudflare D1, vận hành đa người dùng đồng thời.
- **Vai trò (8)**: `super` (toàn quyền), `bch` (Ban chỉ huy — activate/approve), `unit_head` (trưởng đơn vị), `relief` (điều phối cứu trợ), `warehouse` (kho vận), `duty` (trực ban), `audit` (kiểm toán/pháp chế), `viewer` (chỉ xem).

## URL
- **Production**: https://03c19794-534c-4832-b179-50d9bc9ca041.vip.gensparksite.com
- **Trang đăng nhập**: `/login`
- **GitHub**: _chưa kết nối — xem mục "Trạng thái GitHub" bên dưới_

## Kiến trúc & Data
- **Backend**: Hono (SSR JSX) chạy trên Cloudflare Workers, deploy qua Genspark Hosted Deploy (Workers for Platform).
- **Database**: Cloudflare D1 (SQLite) — 64 bảng (units, roles, users, events, tasks, notifications, audit_log, refresh_tokens, relief_projects + các bảng con team/vehicles/cargo/itinerary/tasks/approvals, group_store, relief_levels, level_phases, v.v.)
- **Storage file**: Cloudflare R2 (bucket riêng, dùng cho evidence upload của task done).
- **Auth**: JWT tự ký (HMAC-SHA256 qua `hono/utils/jwt`) + PBKDF2-SHA256 (100.000 vòng) băm mật khẩu, cookie httpOnly `ctg_token` (access, 15 phút) / `ctg_refresh` (refresh, 30 ngày).
- **RBAC**: middleware `requireAuth` / `requirePermission` / `requireAnyPermission`; role `super` có quyền `*` (wildcard).
- **Realtime (Phase 1)**: polling 15 giây (không dùng WebSocket vì giới hạn Cloudflare Workers).
- **Frontend**: giữ nguyên giao diện/render logic của bản prototype gốc (`ctg-core.js`, `ctg-modules.js`, `admin.js`, `relief.js`) nhưng **override toàn bộ các hàm mutation** (activate, ack, done, saveUser, saveIncident, ...) để gọi API thực thay vì mutate mảng JS trong bộ nhớ. Các file override: `core-override.js`, `modules-override.js`, `admin-override.js`, `relief-override.js`, cùng `api-client.js` (fetch wrapper + shape adapters D1 row ↔ prototype object).

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

Envelope phản hồi thống nhất: `{ok:true, data}` hoặc `{ok:false, error:{code,message}}`.

## Hướng dẫn sử dụng
1. Truy cập URL production, đăng nhập bằng tài khoản được cấp (username = mã người dùng, VD: `pt1`, `cht`, `vpct1`...). **Mật khẩu mặc định cho toàn bộ 24 tài khoản seed: `Cattuong@2026`** — cần đổi ngay khi đưa vào vận hành thật.
2. Vai trò `bch`/`super` có thể kích hoạt cấp độ ứng phó (Activation) → hệ thống tự sinh danh sách nhiệm vụ (task) theo mốc thời gian (DUR/R0/R24/R72/R7...) và gán cho đơn vị/người phụ trách.
3. Người được giao nhiệm vụ đăng nhập, vào mục "Của tôi" để **Xác nhận (ack)** rồi **Hoàn thành (done)**.
4. Vai trò `admin`/`super` vào mục Quản trị để quản lý người dùng, xem nhật ký kiểm toán.
5. Vai trò `relief` quản lý các dự án cứu trợ (ngân sách, đội, phương tiện, hàng hoá, lịch trình).

## Trạng thái GitHub
GitHub chưa được kết nối cho project này (`setup_github_environment` báo "No GitHub session state found"). Cần vào tab **#github** trong Genspark để hoàn tất authorization, sau đó agent sẽ push code lên repository.

## Việc đã hoàn thành
- [x] Toàn bộ backend API (auth, events/tasks, notifications, users, relief-projects, incidents) — đã test end-to-end qua curl trên cả sandbox và **production thật**.
- [x] Toàn bộ 4 override script (core/modules/admin/relief) nối UI prototype với API thực.
- [x] Deploy lên Cloudflare qua Genspark Hosted Deploy — Worker + D1 + R2 đã tạo, 4 migration đã apply.
- [x] Seed dữ liệu tham chiếu (14 units, 8 roles), 24 người dùng, 4 dự án cứu trợ vào D1 production.
- [x] Set secret `JWT_SECRET` cho production (secret riêng, khác với `.dev.vars` dùng lúc dev).
- [x] Verify toàn luồng trên production: login → activate (sinh 28 task) → ack → done → deactivate → notifications → relief-projects → users (kiểm tra RBAC theo từng role).
- [x] Sửa bug `active` dropdown trong admin-override.js (trước đó luôn lưu giá trị `1` bất kể lựa chọn).

## Việc chưa hoàn thành / Cần làm tiếp
- [ ] **Push code lên GitHub** — đang chờ user hoàn tất authorization ở tab #github.
- [ ] **Test UI qua browser thật** (click-through) — mới verify qua API call trực tiếp (chính là API mà UI gọi), chưa test bằng cách bấm nút trên trình duyệt thật (Playwright Python thiếu system dependencies trong sandbox này để chạy headless Chromium).
- [ ] Route `POST /users` (tạo user mới) chưa lưu cột `active` khi insert (chỉ PATCH mới cập nhật được) — cần bổ sung.
- [ ] Cân nhắc thêm `Idempotency-Key` cho `confirmActivate` để chống double-click kích hoạt trùng.
- [ ] Đổi mật khẩu mặc định `Cattuong@2026` cho 24 tài khoản trước khi đưa vào vận hành thật.
- [ ] Rate-limiting cho login (Cloudflare Workers không có in-memory limiter sẵn — cần bộ đếm D1/KV, đã ghi chú TODO trong code, chưa triển khai — Phase 2).
- [ ] Bổ sung `favicon.ico` (hiện 404, không ảnh hưởng chức năng).
- [ ] 2FA — đã có field trong schema nhưng chưa triển khai endpoint (deferred theo API-CONTRACT).

## Triển khai
- **Platform**: Cloudflare Workers (Genspark Hosted Deploy — Workers for Platform, tài khoản Cloudflare do Genspark quản lý)
- **Trạng thái**: ✅ Đang hoạt động (Active) — deploy lần đầu thành công
- **Tech stack**: Hono + TypeScript + Cloudflare D1/R2 + Vite + Wrangler
- **Cập nhật lần cuối**: 2026-07-17
