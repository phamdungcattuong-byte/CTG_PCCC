# BÁO CÁO PHÂN TÍCH KHOẢNG CÁCH (GAP ANALYSIS)
## Hệ thống CTG Command Center — PCLB · PCCC · Cát Tường Group

**Ngày lập**: 2026-07-18
**Phạm vi**: Rà soát toàn diện AS-IS — 55 file mã nguồn/schema/config/seed (100%), đối chiếu chéo Backend API (9 route module) ↔ Frontend override scripts ↔ D1 schema (6 migration files) ↔ Seed data thực tế.
**Phương pháp**: Đọc trực tiếp mã nguồn (không suy diễn từ tài liệu mô tả) + kiểm thử thực nghiệm (login qua API thật, seed local D1, gọi API thật, so sánh output).

**Quy ước nhãn bằng chứng** (bắt buộc dùng cho mọi phát hiện):
- 🟢 **VERIFIED** — Đã đọc trực tiếp mã nguồn và/hoặc kiểm thử thực nghiệm (curl/API call thật), có file:line cụ thể.
- 🟡 **INFERRED** — Suy luận hợp lý từ cấu trúc mã nguồn đã đọc (ví dụ: "route tồn tại nhưng không thấy caller nào" → suy luận "chưa được dùng"), nhưng chưa test runtime 100% mọi đường dẫn.
- 🟠 **ASSUMED** — Giả định dựa trên quy ước đặt tên/ngữ cảnh, cần xác nhận thêm với đội nghiệp vụ hoặc chưa thể kiểm chứng bằng mã nguồn.

---

## PHẦN A — TỔNG QUAN KIẾN TRÚC (bối cảnh cho các phát hiện)

| Thành phần | Công nghệ | Bằng chứng |
|---|---|---|
| Backend | Hono 4.12 (SSR JSX) trên Cloudflare Workers | 🟢 `package.json`, `src/index.tsx` |
| DB | Cloudflare D1 (SQLite), 6 file migration | 🟢 `migrations/0001..0006*.sql` |
| Auth | JWT HS256 tự viết + PBKDF2-SHA256-100000 | 🟢 `src/lib/jwt.ts`, `src/lib/crypto.ts` |
| Envelope API | `{ok:true,data}` / `{ok:false,error:{code,message}}` | 🟢 tất cả route handler đã đọc |
| RBAC | 8 role, permission string + wildcard `*` cho `super` | 🟢 `seed/0001_seed_reference.sql` ROLES section |
| Kiến trúc override | File gốc `assets/*.js` (demo/mock) giữ nguyên, cặp file `*-override.js`/`*-admin.js`/`*-camera.js` ở `public/static/js/` chèn API thật vào các hàm mutation/render | 🟢 đối chiếu trực tiếp 11 file override vs 9 file assets gốc |
| Lỗ hổng route bypass | `dist/_routes.json`: `{"include":["/*"],"exclude":["/static/*"]}` → mọi request `/static/*` **không đi qua Hono Worker/middleware auth** | 🟢 đọc trực tiếp `dist/_routes.json` |

---

## PHẦN B — DANH SÁCH PHÁT HIỆN (GAP ITEMS)

### GAP-01 🔴 [ĐÃ SỬA] — `mapReliefProject()` sai tên cột so với schema D1 thật
**Mức độ**: Cao (Critical) — làm hỏng hiển thị dữ liệu cho toàn bộ module Cứu trợ khi dùng dữ liệu thật.
**Trạng thái**: ✅ Đã sửa, build, seed local D1, kiểm thử thực nghiệm, commit `4018911`, đã push GitHub.

**Bằng chứng 🟢 VERIFIED** (trước khi sửa):
| Trường bị lỗi | File:line (đã sửa) | Đọc sai (cũ) | Cột đúng trong schema |
|---|---|---|---|
| `team[].role` | `public/static/js/api-client.js:111` | `t.role` | `t.role_label` — `migrations/0003_relief_projects.sql` bảng `relief_team_members` |
| `vehicles[].type` | `api-client.js:112` | `v.vehicle_type` | `v.type` — bảng `relief_vehicles` |
| `itinerary[].date` | `api-client.js:114` | `it.date` | `it.date_label` — bảng `relief_itinerary` |
| `itinerary[].from` | `api-client.js:114` | `it.from_place` | `it.from_label` |
| `itinerary[].to` | `api-client.js:114` | `it.to_place` | `it.to_label` |
| `itinerary[].distance` | `api-client.js:114` | `it.distance` | `it.distance_label` |
| `approvals` (reducer key) | `api-client.js:116` | `a.status` | `a.decision` — bảng `relief_approvals` |

**Kiểm thử thực nghiệm** (dự án thật `CTR-2024-YAGI`, 6 thành viên đoàn, 3 xe, 8 ngày lịch trình, 4 phê duyệt):
- **Trước sửa**: `team[].role` = `undefined` (mất toàn bộ vai trò 6 người), `vehicles[].type` = `undefined` (mất loại xe), **toàn bộ 8 dòng itinerary rỗng `{}`**, `approvals` = `{}` (mất hoàn toàn 4 phê duyệt CT/TGĐ/Công đoàn/Pháp chế).
- **Sau sửa**: hiển thị đúng 100% — "Chủ tịch trực tiếp dẫn đoàn", "Xe tải 10 tấn", "15/09 · Bắc Ninh → Hà Giang · 350 km", `{congdoan: approved, ct: approved, phapche: approved, tgd: approved}`.

**Trường không lỗi (đối chứng)**: `cargo[].total`/`.per` map đúng `total_label`/`per_label` từ trước — không sửa.

**Ghi chú**: `cargo` field mapping đúng khiến bug ban đầu bị bỏ sót lâu (module cứu trợ "trông có vẻ hoạt động" vì phần hàng hoá hiển thị đúng, nhưng team/vehicles/itinerary/approvals đều câm lặng ở dữ liệu thật).

---

### GAP-02 🔴 — PII (số điện thoại cá nhân) bị lộ công khai không qua xác thực
**Mức độ**: Cao (Critical) — vi phạm bảo mật dữ liệu cá nhân, không cần đăng nhập.

**Bằng chứng 🟢 VERIFIED**:
- File `public/static/assets/ctg-data.js:339-…` — biến `window.PHONEBOOK` chứa **172 dòng dữ liệu cứng** (hardcoded), mỗi dòng là `[Họ tên, Chức danh, Mô tả, Đơn vị, Nhóm, Số điện thoại]` — số điện thoại thật (10 số, không mã hoá/che), ví dụ dòng đầu: `['Lê Thái Hoàng','Giám đốc QLN','Trưởng team PCLB QLN','VP','','0967861551']`.
- File `dist/_routes.json` = `{"include":["/*"],"exclude":["/static/*"]}` — mọi request tới đường dẫn bắt đầu `/static/*` (bao gồm `ctg-data.js`) **bỏ qua hoàn toàn Cloudflare Worker/Hono**, tức bỏ qua middleware `requireAuth` ở `src/index.tsx`.
- **Suy ra**: bất kỳ ai (không cần đăng nhập, không cần token) truy cập trực tiếp URL `https://<domain>/static/assets/ctg-data.js` sẽ tải được toàn bộ 172 số điện thoại cá nhân của nhân viên (bao gồm cả người dọn vệ sinh, bảo vệ ca đêm — không chỉ cấp quản lý).
- Đối chứng: bảng `phonebook` **đã tồn tại trong D1** (`migrations/0001_reference_data.sql:285`, seed đầy đủ 87 dòng tại `seed/0001_seed_reference.sql:529-605` — nhưng đây là seed riêng, không phải cùng nguồn với 172 dòng cứng trong `ctg-data.js`) — **không có route API nào** đọc bảng `phonebook` này (xác nhận qua grep toàn bộ `src/routes/*.ts`: không có `/phonebook`).

**Kết luận nghiệp vụ**: Đây là lỗi thiết kế kiến trúc — dữ liệu danh bạ được nhúng cứng ở tầng frontend tĩnh thay vì qua API có xác thực, khiến toàn bộ PII công khai trên internet với bất kỳ ai biết URL, hoàn toàn không liên quan gì đến việc có tài khoản hệ thống hay không.

**Đề xuất TO-BE** (không tự thực thi — cần quyết định nghiệp vụ về việc có giữ bảng `phonebook` D1 song song hay hợp nhất với `users`/`PEOPLE`):
1. Xoá `window.PHONEBOOK` cứng khỏi `ctg-data.js`.
2. Bổ sung route `GET /api/v1/phonebook` (có `requireAuth`) đọc từ bảng D1 `phonebook` đã seed sẵn.
3. Viết override cho `renderForce()` (hàm hiện tại tại `ctg-modules.js:679`) để gọi API thật, theo đúng pattern override đã áp dụng cho các module khác.

---

### GAP-03 🟡 — Tab "Đơn vị & Cơ sở", "Nhiệm vụ mẫu", "Kịch bản", "Định mức" trong Admin: Backend đã sẵn sàng, Frontend chưa kết nối
**Mức độ**: Trung bình — không mất dữ liệu (chưa ai dùng để sửa dữ liệu thật), nhưng chức năng "trình diễn" (demo) gây hiểu nhầm về khả năng hệ thống.

**Bằng chứng 🟢 VERIFIED** — Backend API đầy đủ, đã có `requirePermission('admin.manage')`:
| Tab admin.js | Route backend đã có | File:line backend |
|---|---|---|
| Đơn vị & Cơ sở (`units`) | `GET/POST/PATCH/DELETE /units`, `GET/POST/PATCH /sites` | `src/routes/bootstrap.ts:20,25,40,63,100,114,131` |
| Nhiệm vụ mẫu (`tasklib`) | `GET/POST/PATCH/DELETE /task-templates` | `bootstrap.ts:187,203,220,239` |
| Kịch bản (`scenarios`) | `GET/POST/PATCH /scenarios` (+ `/scenarios/:id`) | `bootstrap.ts:269,281,289,305` |
| Định mức (`norms`) | `GET/PATCH /norms` | `bootstrap.ts:248,253` |

**Bằng chứng 🟡 INFERRED** (frontend chưa gọi các route trên):
- `public/static/js/admin-override.js` (đã đọc toàn bộ ở phiên trước) chỉ override các hàm liên quan `auth`/`users`/`audit` — không có bất kỳ đoạn nào gọi `window.API.post('/units'...)`, `/task-templates`, `/scenarios`, hoặc `/norms`.
- Định nghĩa tab tại `public/static/assets/admin.js:59-69` (`TABS` array) liệt kê đủ 10 tab, nhưng phần render nội dung của 4 tab trên (đã đọc ở phiên trước) chỉ thao tác trên biến JS nội bộ (in-memory), không persist qua API.

**Kết luận nghiệp vụ**: Đây **không phải backend thiếu chức năng** — mà là "khoảng cách tích hợp" (integration gap): backend có CRUD hoàn chỉnh, chỉ cần viết thêm override JS gọi API tương ứng. Chi phí sửa thấp hơn nhiều so với việc hiểu nhầm là phải xây mới backend.

---

### GAP-04 🟡 — Toàn bộ hành động ghi (write) trong module Cứu trợ (Relief): Backend đầy đủ, Frontend chỉ đọc
**Mức độ**: Trung bình-Cao — module cứu trợ là nghiệp vụ lõi (theo tài liệu QĐ.03), nhưng người dùng không thể thao tác thật.

**Bằng chứng 🟢 VERIFIED** — `relief.ts` có comment tự mô tả (dòng 1-5): *"Full sub-resource set (beneficiaries import, approvals, budget/expenses, reports/pdf) implemented..."* — xác nhận full CRUD cho:
- `relief_team_members`, `relief_vehicles`, `relief_cargo`, `relief_itinerary`, `relief_tasks`, `relief_logs`, `relief_beneficiaries` (`GET/PATCH /:id/beneficiaries/:bid` — `relief.ts:385,396`), `relief_approvals`, `relief_expenses`, `relief_reports`.

**Bằng chứng 🟢 VERIFIED** — `public/static/js/relief-override.js` (36 dòng, đọc toàn bộ) chỉ override:
```js
window.refreshReliefProjects()   // GET /relief-projects
window.renderReliefList()        // wrap: gọi refresh trước khi render
window.openReliefProject(id)     // GET /relief-projects/:id
```
→ **Không có** override cho bất kỳ hành động ghi nào (thêm thành viên, thêm xe, thêm hàng hoá, thêm lịch trình, ghi log thực địa, phê duyệt, chi phí, báo cáo).

**Bằng chứng 🟢 VERIFIED — Riêng tab "Đối tượng thụ hưởng" (beneficiaries)**:
- `public/static/assets/relief.js:637-696` hàm `renderTabBeneficiaries()` gọi `sampleHouseholds(p)` (dòng 665, định nghĩa dòng 682) — hàm này **sinh dữ liệu giả ngẫu nhiên** (8 tên cố định, mã số CCCD giả `'****' + random 4 số`, trạng thái suy ra từ `p.status` chứ không đọc từ DB).
- Route thật `GET /relief-projects/:id/beneficiaries` (`relief.ts:385`) và bảng `relief_beneficiaries` (có cột `household_name, address, people_count, priority, status[pending|delivered|declined], signed_at, photo_url` — `migrations/0003_relief_projects.sql`) **hoàn toàn không được gọi từ bất kỳ file frontend nào** (grep toàn bộ `public/static/js/*.js` và `public/static/assets/relief.js` cho từ khóa `beneficiaries` chỉ thấy 2 field tổng hợp `households`/`people`, không thấy gọi API chi tiết).

**Ngoại lệ đã tự ghi nhận, không phải thiếu sót audit**: `relief.ts` dòng 1-5 tự nêu rõ **tính năng sinh PDF báo cáo** (report generation) là "out of scope Phase 1" — chỉ lưu metadata + nhận file đã tạo qua R2 upload. Đây là giới hạn phạm vi có chủ đích của backend, không phải bug.

---

### GAP-05 🟡 — Cảnh báo camera an ninh: Tạo được nhưng không thể "xử lý xong" (resolve) từ UI
**Mức độ**: Trung bình — ảnh hưởng vận hành thực tế của tổ an ninh camera.

**Bằng chứng 🟢 VERIFIED**:
- Backend: `cameras.ts:199` — `PATCH /cameras/:camId/alerts/:alertId` với body `{status:'resolved'}`, cập nhật `resolved_at`, `resolved_by` (yêu cầu quyền `camera.manage`).
- Frontend: `public/static/js/security-camera.js` — chỉ có `POST /cameras/:id/alerts` (dòng 218, tạo cảnh báo mới). Đọc toàn bộ file, phần hiển thị lịch sử cảnh báo (dòng 188-193) render nhãn `"✓ Đã xử lý"` dựa trên `a.status === 'resolved'` **để hiển thị**, nhưng không có nút/hành động nào gọi PATCH để đổi trạng thái này.
- **Suy ra 🟡**: một khi cảnh báo được tạo, nó sẽ ở trạng thái "Đang mở" vĩnh viễn trên UI — không có cách nào để tổ trực đánh dấu đã xử lý xong trực tiếp qua UI (có thể phải sửa DB bằng tay hoặc gọi API bằng công cụ ngoài).

---

### GAP-06 🟡 — Sự cố (Incidents): Tạo được nhưng không xem lại/đóng được từ UI
**Mức độ**: Trung bình.

**Bằng chứng 🟢 VERIFIED**:
- Backend: `incidents.ts:93` `GET /incidents/:id` (kèm timeline log sự kiện liên quan), `incidents.ts:104` `PATCH /incidents/:id` (đổi `status`, `resolution`).
- Frontend: `public/static/js/modules-override.js:115-135` — `window.saveIncident()` **chỉ gọi `POST /incidents`** để tạo sự cố mới (tự động sinh Event + Tasks). Grep toàn bộ `public/static/js/*.js` và `public/static/assets/*.js` cho `/incidents` — không tìm thấy bất kỳ lệnh gọi `GET /incidents/:id` hay `PATCH /incidents/:id` nào.
- **Suy ra 🟡**: sau khi phát lệnh ứng phó (tạo incident), không có màn hình nào trong app để xem lại chi tiết sự cố đó theo entity `incidents` (dù đã tự động sinh `Event` liên kết, có thể xem qua trang Event) hoặc chính thức "đóng" sự cố (cập nhật `resolution`).

---

### GAP-07 🟠 — Tab "Cấu hình" (Config) trong Admin: có khả năng hoàn toàn không có backend
**Mức độ**: Thấp-Trung bình — cần xác nhận thêm với đội nghiệp vụ về phạm vi dự kiến của tab này trước khi kết luận là "thiếu" hay "chưa cần".

**Bằng chứng 🟢 VERIFIED** (phần phủ định — xác nhận KHÔNG có gì):
- Grep toàn bộ `src/routes/*.ts` cho từ khóa `config`/`Config`/`/settings`: chỉ tìm thấy 2 kết quả không liên quan (comment về biến môi trường `OPENAI_API_KEY` trong `ai.ts:2`, và comment mô tả nhóm route "config tables" trong `bootstrap.ts:2` — đều không phải route `/config` thực).
- Tab `config` được định nghĩa tại `public/static/assets/admin.js:67` (`{ k: 'config', l: 'Cấu hình', icon: '⚙️' }`) — là 1 trong 10 tab của TABS array, khác với 4 tab ở GAP-03 (những tab đó có backend, chỉ thiếu wiring). Tab Config không có route nào cả trong toàn bộ backend.

**Khác biệt quan trọng với GAP-03**: 4 tab ở GAP-03 là "đã có nhà, chưa nối điện" (chi phí sửa thấp — chỉ viết override JS). Tab Config này là "chưa xây nhà" — nếu cần, phải thiết kế route + schema mới từ đầu. Cần làm rõ với nghiệp vụ: tab này dự kiến cấu hình gì (tham số hệ thống? ngưỡng cảnh báo? thông tin liên hệ khẩn?) trước khi đưa vào backlog.

---

### GAP-08 🟢 [ĐÃ XÁC NHẬN KHÔNG PHẢI BUG] — Ghi chú tự sửa lỗi trong `relief.ts`
**Không phải phát hiện mới của audit này** — chỉ ghi nhận để tránh trùng lặp công nhận công việc.

**Bằng chứng 🟢 VERIFIED**: `relief.ts` chứa comment tự mô tả một lỗi đã được vá trước đó:
```
// BUGFIX: every relief_* sub-resource table has project_id TEXT NOT NULL
// REFERENCES relief_projects(id). None of the sub-resource POST/PATCH routes
// were checking the parent project actually exists (nor is soft-deleted)
// before inserting — an unknown/deleted :id hit an unhandled D1 FOREIGN KEY
// constraint error -> generic 500. Call this first in every mutating
// sub-resource handler and short-circuit with a clean 404 if missing.
```
→ Đội phát triển backend đã tự phát hiện và vá lỗi 500 do vi phạm khóa ngoại trước khi audit này diễn ra. Không cần hành động thêm.

---

### GAP-09 🟢 [KHÔNG PHÁT HIỆN GAP] — Các module đã xác nhận kết nối đầy đủ (đối chứng tích cực)
Để tránh audit bị thiên lệch chỉ liệt kê lỗi, các module sau đã được kiểm tra kỹ và **xác nhận không có khoảng cách frontend-backend**:

| Module | File override | Route backend | Kết luận |
|---|---|---|---|
| Đăng nhập/đổi mật khẩu bắt buộc/đăng xuất | `bootstrap.js` (176 dòng, đọc toàn bộ) | `/auth/*` | 🟢 Kết nối đầy đủ |
| Thông báo, sự kiện hoạt động, kích hoạt/hủy kịch bản | `core-override.js` (126 dòng, đọc toàn bộ) | `/notifications/*`, `/events/*` | 🟢 Kết nối đầy đủ |
| Xác nhận/hoàn thành nhiệm vụ (kèm ảnh minh chứng) | `modules-override.js` (đọc phần liên quan) | `POST /events/:id/tasks/:tid/ack`, `/done` (multipart R2) | 🟢 Kết nối đầy đủ |
| Phát lệnh ứng phó khẩn (tạo sự cố mới) | `modules-override.js:117` `saveIncident()` | `POST /incidents` | 🟢 Kết nối đầy đủ (chỉ thiếu phần xem lại — xem GAP-06) |
| Quản trị camera (thêm/sửa/xoá) | `camera-admin.js` | `GET/POST/PATCH/DELETE /cameras` | 🟢 Kết nối đầy đủ, kể cả `deleteCameraAdmin()` → `DELETE /cameras/:id` |
| Xem luồng camera, danh sách cảnh báo, tạo cảnh báo mới | `security-camera.js` | `GET /cameras`, `/cameras/alerts/feed`, `POST /cameras/:id/alerts` | 🟢 Kết nối đầy đủ (chỉ thiếu resolve — xem GAP-05) |
| Danh sách/chi tiết dự án cứu trợ (chỉ đọc) | `relief-override.js` | `GET /relief-projects`, `GET /relief-projects/:id` | 🟢 Kết nối đầy đủ (chỉ đọc — phần ghi xem GAP-04) |

---

## PHẦN C — TỔNG HỢP ƯU TIÊN (đầu vào cho Backlog ở bước sau)

| # | Gap | Mức độ | Loại | Chi phí sửa ước tính | Trạng thái |
|---|---|---|---|---|---|
| GAP-01 | mapReliefProject sai field | Cao | Bug | Thấp | ✅ Đã sửa |
| GAP-02 | PII lộ qua /static/* | Cao | Bảo mật/Kiến trúc | Trung bình (cần thêm route + override) | Chưa sửa |
| GAP-03 | 4 tab Admin chưa nối API | Trung bình | Thiếu tích hợp FE | Trung bình (viết 4 override) | Chưa sửa |
| GAP-04 | Relief write-actions chưa nối API | Cao | Thiếu tích hợp FE | Cao (nhiều sub-resource) | Chưa sửa |
| GAP-05 | Camera alert resolve chưa có UI | Trung bình | Thiếu tích hợp FE | Thấp (1 nút + 1 API call) | Chưa sửa |
| GAP-06 | Incident không xem lại/đóng được | Trung bình | Thiếu tích hợp FE | Thấp-Trung bình | Chưa sửa |
| GAP-07 | Tab Config không có backend | Thấp-TB | Cần làm rõ nghiệp vụ | Chưa xác định | Cần hỏi nghiệp vụ |

**Ghi chú phương pháp quan trọng**: 5/7 gap (GAP-02 đến GAP-06 trừ GAP-07) đều là **"khoảng cách tích hợp Frontend↔Backend"** — không phải thiếu năng lực backend. Điều này thay đổi đáng kể ước tính effort trong backlog: sửa các gap này rẻ hơn nhiều so với giả định ban đầu là phải "xây thêm chức năng backend mới".

---

## PHẦN D — GIỚI HẠN CỦA BÁO CÁO NÀY

- Báo cáo dựa trên đọc mã nguồn tĩnh + một số kiểm thử API thực nghiệm trên **local D1** (dữ liệu seed, không phải dữ liệu production thật). Chưa kiểm thử trên môi trường production đã deploy.
- Chưa rà soát sâu: `ai.ts` (chat AI), `users.ts` (quản lý người dùng ngoài auth cơ bản), phần audit log chi tiết, và các route `/cameras/alerts/feed` với các tham số filter khác nhau.
- GAP-07 cần input từ đội nghiệp vụ — không thể tự kết luận "thiếu" hay "chưa cần" chỉ từ mã nguồn.
- Danh sách này sẽ là **input trực tiếp** cho bước tiếp theo (Mô hình hoá quy trình/RBAC → BRD/SRS → Backlog) — mọi mục BRD/SRS liên quan tới các gap trên phải trích dẫn lại mã GAP-xx này để đảm bảo truy vết được.
