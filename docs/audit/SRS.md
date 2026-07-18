# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS — SOFTWARE REQUIREMENTS SPECIFICATION)
## Hệ thống CTG Command Center — PCLB · PCCC · Cát Tường Group

**Ngày lập**: 2026-07-18
**Phiên bản**: 1.0
**Nguồn**: `docs/audit/BRD.md` (20 BRQ) + `docs/audit/GAP-ANALYSIS.md` (GAP-01..09) + `docs/audit/PROCESS-RBAC-MODEL.md` (BR-01..21) + đọc trực tiếp mã nguồn hiện có (`src/routes/*.ts`, `migrations/*.sql`, `src/middleware/auth.ts`).
**Quy ước nhãn**: 🟢 VERIFIED (hiện trạng đã xác nhận qua đọc mã nguồn) · 🟡 INFERRED (suy luận từ cấu trúc) · 🟠 ASSUMED (đề xuất TO-BE cần nghiệp vụ xác nhận trước khi lập trình).

**Nguyên tắc soạn tài liệu**: SRS đặc tả **"làm thế nào"** — mỗi Yêu cầu Chức năng (FR) dưới đây bám sát 1 hoặc nhiều BRQ (nguồn BRD), mô tả cụ thể: endpoint/route liên quan, thay đổi permission/validation cần thêm, và tiêu chí hoàn thành ở mức kỹ thuật. **Đây là đặc tả — KHÔNG phải đã lập trình**: theo đúng chỉ đạo "chỉ triển khai mã nguồn khi phát hiện lỗi thật", các FR liên quan đến quyết định nghiệp vụ (đánh dấu 🔴 NEEDS BUSINESS SIGN-OFF) phải được nghiệp vụ xác nhận bằng văn bản trước khi đưa vào Sprint/Backlog thực thi.

---

## PHẦN 1 — TỔNG QUAN HỆ THỐNG (kiến trúc hiện tại — làm nền cho đặc tả)

🟢 VERIFIED — không thay đổi so với AS-IS đã ghi tại GAP-ANALYSIS.md Phần A:

| Thành phần | Công nghệ |
|---|---|
| Backend | Hono 4.x (SSR JSX) trên Cloudflare Workers/Pages |
| CSDL | Cloudflare D1 (SQLite), quản lý qua `migrations/*.sql` |
| Auth | JWT HS256 tự viết (`src/lib/jwt.ts`) + PBKDF2-SHA256-100000 (`src/lib/crypto.ts`), cookie httpOnly `ctg_token`/`ctg_refresh` |
| RBAC | `src/middleware/auth.ts`: `requireAuth`, `requirePermission(p)`, `requireAnyPermission(...p)` — permission string, wildcard `*` cho `super` |
| Envelope API | `{ok:true,data}` / `{ok:false,error:{code,message}}` |
| Kiến trúc Frontend | File gốc `public/static/assets/*.js` (demo/mock, giữ nguyên) + file `*-override.js`/`*-admin.js` ở `public/static/js/` (chèn API thật) |
| Static bypass | `dist/_routes.json` loại trừ `/static/*` khỏi Worker — mọi file trong `public/static/` **không đi qua auth middleware** |

**Ràng buộc kỹ thuật nền tảng** (ảnh hưởng thiết kế mọi FR dưới đây — 🟢):
- Không có tiến trình chạy nền dài hạn gốc trên Cloudflare Workers — mọi logic "định kỳ" (ví dụ kiểm tra task quá hạn) phải dùng Cloudflare Cron Triggers (`scheduled` handler) hoặc kiểm tra tại thời điểm request (lazy check), không thể chạy daemon liên tục.
- CPU time giới hạn 10-30ms/request — mọi FR không được thêm tính toán nặng vào đường dẫn API chính.
- Không truy cập file system runtime — mọi dữ liệu tĩnh phải nằm trong D1/KV/R2, không đọc file trực tiếp.

---

## PHẦN 2 — MÔ HÌNH DỮ LIỆU LIÊN QUAN (tham chiếu, không lặp lại toàn bộ schema)

🟢 VERIFIED — chỉ liệt kê các bảng bị ảnh hưởng trực tiếp bởi các FR trong tài liệu này (schema đầy đủ xem `migrations/000{1..6}_*.sql`):

| Bảng | Cột liên quan tới FR trong SRS này | Ghi chú hiện trạng |
|---|---|---|
| `incidents` | `status` (open/resolved), `event_id`, `reported_by` | Chưa có cột ghi nhận permission-check — liên hệ FR-01/02 |
| `events` | `level` (FK `levels.k`), `status` (active/deactivated/drill), `activated_by`, `idempotency_key` | Liên hệ FR-04, FR-13 |
| `roles` | `perms_json` (JSON array permission string) | Liên hệ FR-08, FR-09 |
| `users` | `role_id` (FK `roles.id`), `unit_code` | Liên hệ FR-10 (ánh xạ tổ chức) |
| `resp_matrix` | 12 dòng chức danh tổ chức, KHÔNG có cột liên kết `roles.id` | Liên hệ FR-10 — cần thêm cột nếu triển khai |
| `phonebook` | Đã tồn tại trong D1, seed 87 dòng, KHÔNG có route API đọc | Liên hệ FR-03 |
| `relief_beneficiaries` | `household_name, address, people_count, priority, status, signed_at, photo_url` | Liên hệ FR-06 |
| `relief_projects` | `status` (chuỗi tự do, không enum) | Liên hệ FR-07 |
| `relief_approvals` | PK kép `(project_id, role)`, cột `decision` (chuỗi tự do) | Liên hệ FR-07b — hiện dùng `ON CONFLICT DO UPDATE` (ghi đè) |
| `camera_alerts` | `status` (open/resolved), `resolved_at`, `resolved_by` | Liên hệ FR-11 |
| `level_phases` | 43 dòng, hiện không được đọc bởi route nào | Liên hệ FR-14 |
| `task_templates` | `min_level`, `unit_code` — hiện lọc `LIMIT 28` khi sinh task | Liên hệ FR-15 |
| `tasks` | `owner_id` (có thể NULL), `status` (issued/ack/doing/done/overdue/blocked) | Liên hệ FR-16, FR-17 |

---

## PHẦN 3 — YÊU CẦU CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)

### Nhóm A — Kiểm soát phân quyền Sự cố khẩn cấp (🔴 P0 — theo BRQ-01, BRQ-02)

#### FR-01 — Kiểm soát quyền tạo Sự cố (Incident) 🔴 NEEDS BUSINESS SIGN-OFF
**Nguồn**: BRQ-01, BR-10, BR-11.
**Hiện trạng** 🟢: `POST /incidents` (`src/routes/incidents.ts:17`) chỉ có `incidents.use('*', requireAuth)` ở cấp module — không có `requirePermission` riêng cho route này. Route tự động sinh kèm 1 `Event` cấp 3 (ĐỎ) theo loại sự cố.
**Đặc tả thay đổi** (chỉ áp dụng SAU KHI nghiệp vụ xác nhận đây là lỗ hổng, không phải chủ đích thiết kế):
- Thêm middleware `requirePermission('incident.report')` (permission mới) hoặc `requireAnyPermission('activate', 'incident.report')` vào route `POST /incidents`.
- Cần quyết định nghiệp vụ: permission `incident.report` nên được gán cho role nào? Đề xuất tối thiểu: `bch`, `unit_head`, `duty` (các role có trách nhiệm hiện trường theo RESP_MATRIX) — **KHÔNG gán cho `viewer`**.
- **Phương án thay thế** (nếu nghiệp vụ xác nhận "ai cũng phải báo được sự cố khẩn" là đúng chủ đích): giữ nguyên quyền tạo mở cho mọi user đã đăng nhập, nhưng **tách rời việc "báo cáo sự cố" và "tự động kích hoạt Event cấp 3"** — đưa việc kích hoạt Event vào một bước riêng cần permission `activate` xác nhận (xem FR-02).
**Tiêu chí hoàn thành**: Có văn bản xác nhận phương án được chọn (giữ nguyên/kiểm soát chặt/tách rời) từ Ban Chỉ huy trước khi cập nhật code; sau khi triển khai, viewer không còn tạo được incident nếu chọn phương án kiểm soát chặt.

#### FR-02 — Tách rời "báo cáo sự cố" và "kích hoạt Event cấp 3" 🔴 NEEDS BUSINESS SIGN-OFF
**Nguồn**: BRQ-01, BR-11.
**Đặc tả đề xuất** (phương án thay thế của FR-01):
- `POST /incidents` chỉ tạo bản ghi `incidents` với `status='open'`, KHÔNG tự sinh Event.
- Thêm route mới `POST /incidents/:id/escalate` (permission `activate`) để người có thẩm quyền xác nhận và kích hoạt Event cấp độ tương ứng (mặc định 3, có thể chọn 1/2/4 tùy đánh giá thực tế) — dùng lại route `POST /events/activate` hiện có làm nền, không viết lại logic sinh task.
**Tiêu chí hoàn thành**: Sự cố có thể được tạo (báo cáo) độc lập với việc kích hoạt Event; chỉ role có permission `activate` mới kích hoạt được Event từ Incident.

#### FR-03 — Kiểm soát quyền đóng/cập nhật Sự cố 🔴 NEEDS BUSINESS SIGN-OFF
**Nguồn**: BRQ-02, BR-12.
**Hiện trạng** 🟢: `PATCH /incidents/:id` (`incidents.ts:104`) chỉ yêu cầu `requireAuth`.
**Đặc tả thay đổi**: Thêm `requireAnyPermission('activate', 'incident.report')` — hoặc ràng buộc chặt hơn: chỉ `reported_by` ban đầu HOẶC role `bch`/`super` được đóng sự cố (cần quyết định nghiệp vụ giữa 2 phương án).
**Tiêu chí hoàn thành**: `viewer` (và role không liên quan) không còn PATCH được `/incidents/:id`.

---

### Nhóm B — Bảo vệ dữ liệu cá nhân (🔴 P0 — theo BRQ-03)

#### FR-04 — Loại bỏ dữ liệu PII cứng khỏi tầng tĩnh công khai
**Nguồn**: BRQ-03, GAP-02.
**Hiện trạng** 🟢: `window.PHONEBOOK` (172 dòng, có SĐT thật) trong `public/static/assets/ctg-data.js`, phục vụ qua `/static/*` — không qua auth middleware (`dist/_routes.json` exclude).
**Đặc tả thay đổi**:
1. Xóa hoặc rút gọn biến `window.PHONEBOOK` khỏi `ctg-data.js` — không còn chứa SĐT thật ở file tĩnh.
2. Thêm route mới `GET /api/v1/phonebook` với `requireAuth` (tối thiểu — cần xác nhận thêm permission cụ thể hay chỉ cần đăng nhập là đủ, theo BRQ-03), đọc từ bảng D1 `phonebook` đã seed sẵn (87 dòng — 🟢 xác nhận đã tồn tại tại `migrations/0001_reference_data.sql:285`, seed tại `seed/0001_seed_reference.sql:529-605`).
   - **🔴 Cần xác nhận nghiệp vụ**: 87 dòng seed hiện có trong bảng `phonebook` D1 và 172 dòng cứng trong `ctg-data.js` có phải là **2 nguồn dữ liệu khác nhau** (không đồng nhất số lượng) — cần rà soát/hợp nhất dữ liệu trước khi go-live, không chỉ chuyển API.
3. Viết override JS mới (theo đúng pattern override đã áp dụng cho các module khác) cho hàm `renderForce()` (`ctg-modules.js:679`) để gọi API thật thay vì đọc `window.PHONEBOOK`.
**Tiêu chí hoàn thành**: Truy cập trực tiếp URL `/static/assets/ctg-data.js` không còn trả về SĐT thật; `GET /api/v1/phonebook` không có token trả về 401.

---

### Nhóm C — Hoàn thiện tích hợp Frontend↔Backend (P1/P2 — thuần kỹ thuật, KHÔNG cần quyết định nghiệp vụ)

#### FR-05 — Kết nối 4 tab Admin với API đã sẵn có
**Nguồn**: BRQ-10, GAP-03.
**Hiện trạng** 🟢: Backend đã đầy đủ CRUD (`bootstrap.ts`), permission `admin.manage` đã áp dụng đúng. Frontend `admin-override.js` chưa gọi các route này.
**Đặc tả**: Viết bổ sung vào `admin-override.js` (hoặc file override mới `admin-tabs-override.js`) 4 nhóm hàm override:
- Tab "Đơn vị & Cơ sở": override CRUD gọi `GET/POST/PATCH/DELETE /units`, `/sites`.
- Tab "Nhiệm vụ mẫu": override CRUD gọi `GET/POST/PATCH/DELETE /task-templates`.
- Tab "Kịch bản": override CRUD gọi `GET/POST/PATCH /scenarios`, `/scenarios/:id`.
- Tab "Định mức": override gọi `GET/PATCH /norms`.
**Tiêu chí hoàn thành**: Thao tác thêm/sửa/xóa trên 4 tab này persist qua reload trang (dữ liệu lưu D1, không mất khi F5).

#### FR-06 — Hoàn thiện hành động ghi module Cứu trợ (bao gồm đối tượng thụ hưởng thật)
**Nguồn**: BRQ-05, GAP-04, Điều cấm QĐ.03 #6.
**Hiện trạng** 🟢: Backend `relief.ts` có đầy đủ CRUD cho team/vehicles/cargo/itinerary/tasks/logs/beneficiaries/approvals/expenses. Frontend `relief-override.js` (36 dòng) chỉ override đọc (list/detail). Tab "Đối tượng thụ hưởng" dùng `sampleHouseholds()` (dữ liệu giả).
**Đặc tả**:
1. Mở rộng `relief-override.js` (hoặc tách thành nhiều file override theo sub-resource) để gọi các route ghi đã có: `POST/PATCH` cho team/vehicles/cargo/itinerary/logs.
2. **Ưu tiên cao nhất trong nhóm này**: thay `renderTabBeneficiaries()` (hiện gọi `sampleHouseholds()`) bằng gọi thật `GET /relief-projects/:id/beneficiaries` và `PATCH /relief-projects/:id/beneficiaries/:bid` — hiển thị đúng `status` (pending/delivered/declined), `signed_at`, `photo_url` thật từ D1, đáp ứng yêu cầu minh bạch Điều cấm #6.
3. Không triển khai tính năng sinh PDF báo cáo (đã tự ghi nhận "out of scope Phase 1" trong `relief.ts` — giữ nguyên phạm vi, không mở rộng).
**Tiêu chí hoàn thành**: Tab Đối tượng thụ hưởng hiển thị dữ liệu thật từ `relief_beneficiaries`, có ảnh/ký xác nhận thật khi có; không còn gọi `sampleHouseholds()` trong code production.

#### FR-07 — Validate enum cho `relief_projects.status`
**Nguồn**: BRQ-13, BR-13.
**Đặc tả**: Thêm kiểm tra tại `PATCH /relief-projects/:id` (`relief.ts:108`): giá trị `status` gửi lên phải thuộc tập `{drafting, planning, approved, in-progress, completed, closed}` (400 nếu không hợp lệ). **🟡 Cần xác nhận thêm**: có cần validate thứ tự chuyển trạng thái hợp lệ (state machine transition) hay chỉ cần validate giá trị nằm trong enum? (Đề xuất tối thiểu: chỉ validate enum trước, transition rule để P3 nếu cần).

#### FR-07b — Validate enum cho `relief_approvals.decision`
**Nguồn**: BRQ-13, BR-15.
**Đặc tả**: Thêm kiểm tra tại `POST /:id/approvals/:role` (`relief.ts:424`): giá trị `decision` phải thuộc tập `{draft, reviewing, approved, rejected}` (400 nếu không hợp lệ, thay cho kiểm tra `typeof === 'string'` hiện tại).

#### FR-08 — Giữ lịch sử thay đổi quyết định phê duyệt cứu trợ
**Nguồn**: BRQ-07, BR-16, Điều cấm QĐ.03 #4.
**Hiện trạng** 🟢: `ON CONFLICT(project_id, role) DO UPDATE` (`relief.ts:426-427`) ghi đè quyết định cũ, không giữ lịch sử.
**Đặc tả**: Thêm bảng mới `relief_approval_history` (`id, project_id, role, decision, note, changed_by, changed_at`) — mỗi lần `POST /:id/approvals/:role` thực hiện UPSERT vào `relief_approvals` như hiện tại, đồng thời INSERT 1 dòng vào bảng lịch sử mới trước khi ghi đè. Bổ sung route đọc `GET /:id/approvals/:role/history`.
**Tiêu chí hoàn thành**: Sau khi 1 vai trò đổi quyết định 2 lần, có thể truy vết đầy đủ cả 2 lần qua route history mới, không mất dữ liệu lần đầu.

#### FR-09 — Cho phép đánh dấu "đã xử lý" cảnh báo camera từ UI
**Nguồn**: BRQ-11, GAP-05.
**Hiện trạng** 🟢: Backend `PATCH /cameras/:camId/alerts/:alertId` (`cameras.ts:199`) đã có, yêu cầu `camera.manage`. Frontend `security-camera.js` không có caller.
**Đặc tả**: Thêm nút "Đánh dấu đã xử lý" trong màn hình lịch sử cảnh báo (`security-camera.js`), gọi `PATCH /cameras/:camId/alerts/:alertId` với `{status:'resolved'}` khi người dùng có quyền `camera.manage` nhấn nút.
**Tiêu chí hoàn thành**: Cảnh báo chuyển từ "Đang mở" sang "✓ Đã xử lý" ngay trên UI sau khi nhấn nút, không cần sửa DB tay.

#### FR-10 — Cho phép xem lại/đóng chính thức Sự cố từ UI
**Nguồn**: BRQ-12, GAP-06.
**Phụ thuộc**: FR-01/FR-02/FR-03 (phải giải quyết vấn đề phân quyền trước).
**Đặc tả**: Thêm màn hình/route frontend gọi `GET /incidents/:id` (xem chi tiết + timeline) và `PATCH /incidents/:id` (đóng, ghi `resolution`) — chỉ hiển thị nút "Đóng sự cố" cho user có quyền theo FR-03.
**Tiêu chí hoàn thành**: Có thể xem chi tiết 1 incident và đóng chính thức (ghi `resolution`) từ UI, đúng theo phân quyền mới.

---

### Nhóm D — RBAC & Ánh xạ tổ chức (P1 — cần xác nhận nghiệp vụ)

#### FR-11 — Xác nhận & ghi nhận chính thức phạm vi permission `admin.manage`/`camera.view`/`camera.manage` 🔴 NEEDS BUSINESS SIGN-OFF
**Nguồn**: BRQ-09, BR-17.
**Đặc tả**: Không phải thay đổi code bắt buộc — là quyết định cần văn bản: xác nhận việc quản trị hệ thống + camera an ninh CHỈ dành cho role `super` (Văn phòng Chủ tịch & IT) là đúng chủ đích. **Nếu nghiệp vụ muốn có vai trò trung gian** (ví dụ "Quản trị camera" riêng không cần full `admin.manage`), cần: (a) thêm permission mới `camera.manage` cho 1 role mới hoặc role `duty`/`bch` hiện có; (b) cập nhật `seed/0001_seed_reference.sql` ROLES section.
**Tiêu chí hoàn thành**: Có văn bản xác nhận + (nếu cần thay đổi) cập nhật seed ROLES tương ứng.

#### FR-12 — Bảng ánh xạ chính thức 12 chức danh tổ chức ↔ 8 role kỹ thuật 🔴 NEEDS BUSINESS SIGN-OFF
**Nguồn**: BRQ-08, BR-19.
**Đặc tả đề xuất**: Thêm cột `default_role_id` (FK `roles.id`, có thể NULL) vào bảng `resp_matrix` — biểu thị role kỹ thuật mặc định gợi ý cho mỗi chức danh tổ chức khi tạo user mới thuộc chức danh đó. Đây là **gợi ý mặc định**, không phải ràng buộc cứng (một chức danh có thể có nhiều user với role khác nhau tùy thực tế).
**Tiêu chí hoàn thành**: Có bảng ánh xạ 12↔8 được nghiệp vụ ký xác nhận bằng văn bản (không nhất thiết phải là ràng buộc DB cứng, có thể là tài liệu quy trình cấp quyền), migration thêm cột `default_role_id` nếu quyết định lưu trong DB.

#### FR-13 — Kiểm soát quyền kích hoạt cấp độ 3-4 theo thẩm quyền cụ thể 🔴 NEEDS BUSINESS SIGN-OFF
**Nguồn**: BRQ-04, BR-02.
**Hiện trạng** 🟢: `POST /events/activate` chỉ kiểm tra permission chung `activate` (role `bch` có), không phân biệt cấp độ.
**Đặc tả đề xuất**: Thêm kiểm tra trong route: nếu `level >= 3`, yêu cầu thêm permission cụ thể (ví dụ `activate.critical` — permission mới) — chỉ gán cho role đại diện thẩm quyền Chủ tịch (🔴 cần xác nhận role nào đại diện — có thể là `super`, hoặc cần role mới `chairman`).
**Tiêu chí hoàn thành**: Role `bch` (không có `activate.critical`) không kích hoạt được cấp 3-4 nếu chính sách này được xác nhận cần áp dụng.

---

### Nhóm E — Hoàn thiện mô hình Cấp độ/Giai đoạn/Nhiệm vụ (P2/P3)

#### FR-14 — Áp dụng ma trận LEVEL_PHASES khi sinh nhiệm vụ tự động 🟡 NEEDS BUSINESS CONFIRMATION VỀ MỨC ĐỘ RÀNG BUỘC
**Nguồn**: BRQ-17, BR-03.
**Hiện trạng** 🟢: `POST /events/activate` sinh task chỉ lọc `min_level <= level`, không lọc theo `level_phases` (43 dòng, không được đọc bởi route nào).
**Đặc tả đề xuất**: Thêm điều kiện lọc `task_templates.phase_id IN (SELECT phase_id FROM level_phases WHERE level = ?)` vào câu query sinh task tại `events.ts:71`.
**🔴 Cần xác nhận trước khi triển khai**: việc lọc thêm theo phase có khả năng làm GIẢM số lượng task sinh ra so với hiện tại (một số template có `min_level` hợp lệ nhưng `phase_id` không thuộc `level_phases` của level đó) — cần nghiệp vụ xác nhận đây là hành vi mong muốn (chỉ sinh task đúng giai đoạn) không phải bug mới.

#### FR-15 — Loại bỏ hoặc nâng giới hạn cứng 28 template/lần kích hoạt
**Nguồn**: BRQ-18, BR-04.
**Hiện trạng** 🟢: `LIMIT 28` tại `events.ts:71`, comment xác nhận là "cap tùy ý cho tương thích demo dataset".
**Đặc tả**: Loại bỏ `LIMIT 28` (hoặc nâng lên giá trị đủ lớn để không cắt mất template, ví dụ 500) — kiểm tra hiệu năng D1 với số lượng template hiện tại (208 template) trước khi go-live.
**Tiêu chí hoàn thành**: Không có task hợp lệ nào bị bỏ sót khi số lượng `task_templates` thỏa `min_level <= level` (và `level_phases` nếu FR-14 được áp dụng) vượt 28.

#### FR-16 — Áp permission owner-check nhất quán cho hành động `ack` nhiệm vụ 🟡 NEEDS BUSINESS CONFIRMATION
**Nguồn**: BRQ-16, BR-08.
**Hiện trạng** 🟢: `POST /events/:id/tasks/:tid/ack` không kiểm tra `owner_id`, khác với `done` (`events.ts:322-324` — chỉ owner/permission `activate`).
**Đặc tả đề xuất** (2 phương án, cần nghiệp vụ chọn):
- (a) Áp cùng ràng buộc owner-only cho `ack` như `done`.
- (b) Giữ nguyên `ack` mở cho mọi user đã đăng nhập (nếu đây là chủ đích để không chặn phản ứng nhanh khi người khác thay mặt ack).
**Tiêu chí hoàn thành**: Có quyết định bằng văn bản chọn phương án, cập nhật code theo đúng phương án được chọn.

#### FR-17 — Cơ chế cảnh báo nhiệm vụ "mồ côi" (không có owner) 🟡 NEEDS BUSINESS CONFIRMATION
**Nguồn**: BRQ-16, BR-09.
**Hiện trạng** 🟢: Logic gán owner tại `events.ts:87-89` chỉ chọn 1 user active đầu tiên trong đơn vị; nếu không có, `owner_id = NULL`, không cảnh báo.
**Đặc tả đề xuất**: Thêm 1 trong 2 giải pháp (cần xác nhận nghiệp vụ chọn, do ràng buộc "không có tiến trình nền" của Cloudflare Workers — Phần 1):
- (a) **Cloudflare Cron Trigger** định kỳ (ví dụ mỗi giờ) quét `tasks WHERE owner_id IS NULL AND status != 'done'`, gửi notification cho `unit_head` liên quan.
- (b) Hiển thị cảnh báo ngay trên dashboard (client-side, khi tải trang) đếm số task `owner_id IS NULL`, không cần cron — đơn giản hơn, phù hợp ràng buộc nền tảng.
**Tiêu chí hoàn thành**: Có ít nhất 1 kênh (dashboard hoặc notification định kỳ) hiển thị số lượng task mồ côi hiện tại.

#### FR-18 — Xác nhận & rà soát quy tắc loại trừ hàng hỏng/hết hạn khỏi định mức kho 🔴 NEEDS BUSINESS SIGN-OFF
**Nguồn**: BRQ-15, BR-20.
**Hiện trạng** 🟢: Quy tắc nghiệp vụ ghi trong `levels` seed (`action_desc` cấp 0): "hàng hỏng/hết hạn KHÔNG tính vào định mức" — 🟡 chưa xác nhận route `GET/PATCH /norms` hoặc bảng `pccc_inventory` có áp dụng logic loại trừ này.
**Đặc tả**: Rà soát chi tiết route `norms` và cách tính `alert` trong `pccc_inventory` (chưa nằm trong phạm vi audit này — cần một vòng khảo sát kỹ thuật riêng nếu nghiệp vụ xác nhận đây là ưu tiên) — SRS này chỉ ghi nhận yêu cầu rà soát, không đặc tả chi tiết do chưa đủ thông tin AS-IS.
**Tiêu chí hoàn thành**: Có báo cáo xác nhận route `norms` có/không áp dụng đúng quy tắc loại trừ; nếu không, bổ sung logic tính toán loại trừ hàng hỏng/hết hạn.

#### FR-19 — Rà soát enforcement cho 7 permission đã seed nhưng chưa dùng 🟡 NEEDS BUSINESS CONFIRMATION
**Nguồn**: BRQ-19, BR-18.
**Hiện trạng** 🟢: `inventory.edit`, `export.stock`, `task.receive`, `log.write`, `view.unit`, `report.unit`, `view.all`, `view.public` — không xuất hiện trong bất kỳ `requirePermission()` nào ở 9 file route hiện tại.
**Đặc tả**: Với mỗi permission, xác nhận: (a) route/chức năng liên quan đã tồn tại nhưng thiếu enforcement (cần bổ sung `requirePermission` cho đúng route), hoặc (b) chức năng liên quan chưa được xây (permission chỉ là placeholder cho roadmap tương lai — không cần hành động ngay). **SRS này không tự kết luận** — cần bảng rà soát riêng cho 7 permission này ở bước Backlog.

#### FR-20 — Kiểm soát nhiều Event active đồng thời 🟡 NEEDS BUSINESS CONFIRMATION
**Nguồn**: BRQ-20, BR-05.
**Hiện trạng** 🟢: Không có ràng buộc UNIQUE/business logic ngăn nhiều `events.status='active'` đồng thời; `GET /events?active=true` không có `ORDER BY` xác định khi có nhiều kết quả.
**Đặc tả đề xuất** (cần xác nhận có phù hợp thực tế đa cơ sở hay không):
- (a) Nếu nghiệp vụ xác nhận **chỉ nên có 1 Event active toàn Group tại 1 thời điểm**: thêm kiểm tra tại `POST /events/activate` — từ chối (409) nếu đã có event active khác, trừ khi có flag "cho phép song song" tường minh.
- (b) Nếu nghiệp vụ xác nhận **nhiều cơ sở có thể có Event active độc lập song song là hợp lệ** (ví dụ 2 công trường khác nhau bị ảnh hưởng riêng biệt cùng lúc): giữ nguyên khả năng nhiều active, nhưng thêm `site_id`/`unit_code` vào điều kiện lọc `GET /events?active=true` để tránh nhầm lẫn hiển thị.
**Tiêu chí hoàn thành**: Có quyết định phương án (a)/(b), triển khai đúng theo phương án chọn.

---

## PHẦN 4 — YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)

| Mã | Yêu cầu | Nguồn/Lý do | Loại |
|---|---|---|---|
| NFR-01 | Mọi endpoint xử lý PII (SĐT danh bạ — FR-04) phải yêu cầu `requireAuth` tối thiểu, không phục vụ qua `/static/*` | GAP-02 | Bảo mật |
| NFR-02 | Mọi thay đổi phân quyền (FR-01/02/03/11/12/13) phải được ghi log vào `audit_log` (bảng đã có, cần xác nhận đang hoạt động đúng — chưa rà soát sâu theo GAP-ANALYSIS Phần D) | BR-16, Điều cấm QĐ.03 #4/#5 | Tuân thủ |
| NFR-03 | Không thêm tiến trình nền dài hạn — mọi giải pháp "định kỳ" (FR-17) phải dùng Cloudflare Cron Triggers hoặc kiểm tra lazy tại request | Ràng buộc nền tảng Cloudflare Workers | Kỹ thuật |
| NFR-04 | Việc nới giới hạn `LIMIT 28` (FR-15) không được làm vượt ngưỡng CPU time 10-30ms/request của D1 query khi số lượng template tăng | Ràng buộc nền tảng | Hiệu năng |
| NFR-05 | Mọi validate enum mới (FR-07, FR-07b) phải trả lỗi theo đúng envelope chuẩn `{ok:false,error:{code,message}}` đã dùng toàn hệ thống | Nhất quán API | Chất lượng |
| NFR-06 | Các override JS mới (FR-05, FR-06, FR-09, FR-10) phải theo đúng kiến trúc override hiện có (không sửa file `assets/*.js` gốc) | Nhất quán kiến trúc đã thiết lập | Bảo trì |

---

## PHẦN 5 — MA TRẬN TRUY VẾT SƠ BỘ (BRQ → FR)

*(Ma trận đầy đủ, chi tiết hơn — bao gồm cả Use Case/User Story/Test Case — sẽ nằm ở tài liệu Traceability Matrix, bước 9)*

| BRQ (BRD) | FR (SRS) tương ứng |
|---|---|
| BRQ-01 | FR-01, FR-02 |
| BRQ-02 | FR-03 |
| BRQ-03 | FR-04 |
| BRQ-04 | FR-13 |
| BRQ-05 | FR-06 |
| BRQ-06 | (chưa có FR riêng — cần quyết định nghiệp vụ trước khi đặc tả, xem BRD Phần 5 BRQ-06) |
| BRQ-07 | FR-08 |
| BRQ-08 | FR-12 |
| BRQ-09 | FR-11 |
| BRQ-10 | FR-05 |
| BRQ-11 | FR-09 |
| BRQ-12 | FR-10 |
| BRQ-13 | FR-07, FR-07b |
| BRQ-14 | (chưa có FR — GAP-07 cần nghiệp vụ trả lời phạm vi trước khi đặc tả) |
| BRQ-15 | FR-18 |
| BRQ-16 | FR-16, FR-17 |
| BRQ-17 | FR-14 |
| BRQ-18 | FR-15 |
| BRQ-19 | FR-19 |
| BRQ-20 | FR-20 |

**Ghi chú khoảng trống truy vết**: BRQ-06 (đồng bộ status dự án ↔ approvals) và BRQ-14 (phạm vi tab Config) **chưa có FR tương ứng** trong SRS này — cả 2 đều cần nghiệp vụ trả lời câu hỏi mở trước khi có thể đặc tả kỹ thuật cụ thể (không phải thiếu sót của SRS, mà là phụ thuộc đầu vào nghiệp vụ chưa có).

---

## PHẦN 6 — GIỚI HẠN CỦA TÀI LIỆU NÀY

- SRS này đặc tả ở mức "yêu cầu kỹ thuật cần làm", KHÔNG bao gồm thiết kế chi tiết implement (ví dụ tên hàm cụ thể, migration SQL đầy đủ) — sẽ được cụ thể hóa trong quá trình Sprint/Backlog thực thi.
- Toàn bộ FR có nhãn 🔴 NEEDS BUSINESS SIGN-OFF **không được lập trình** cho tới khi có xác nhận nghiệp vụ bằng văn bản, đúng theo chỉ đạo dự án.
- BRQ-06 và BRQ-14 chưa được đặc tả FR do thiếu câu trả lời nghiệp vụ — sẽ bổ sung vào SRS phiên bản sau khi có phản hồi.
- FR-18/FR-19 cần một vòng khảo sát kỹ thuật bổ sung (chưa đủ dữ liệu AS-IS về `norms`/`pccc_inventory` chi tiết) trước khi có thể đặc tả cụ thể hơn.
