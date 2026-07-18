# MÔ HÌNH HÓA QUY TRÌNH · TRẠNG THÁI · PHÂN QUYỀN · BUSINESS RULES
## Hệ thống CTG Command Center — PCLB · PCCC · Cát Tường Group

**Ngày lập**: 2026-07-18
**Nguồn**: Đọc trực tiếp `migrations/*.sql` (schema — nguồn sự thật cấu trúc dữ liệu), `src/routes/*.ts` (logic nghiệp vụ thực thi), `src/middleware/auth.ts` (RBAC engine), `seed/0001_seed_reference.sql` (LEVELS/PHASES/LEVEL_PHASES/ROLES/RESP_MATRIX/QD03_PRINCIPLES/QD03_FORBIDDEN/FIRE_STEPS/SCENARIOS — dữ liệu nghiệp vụ QĐ.03 do đội PCLB/PCCC Cát Tường Group biên soạn).
**Quy ước nhãn**: 🟢 VERIFIED (đọc trực tiếp mã nguồn/schema) · 🟡 INFERRED (suy luận từ cấu trúc, chưa test runtime) · 🟠 ASSUMED (giả định, cần xác nhận nghiệp vụ).

---

## PHẦN 1 — MÔ HÌNH CẤP ĐỘ ỨNG PHÓ (LEVELS) — trục thời gian trung tâm của toàn hệ thống

🟢 VERIFIED — 5 cấp độ, theo Điều 20 QĐ.03, lưu tại bảng `levels` (`migrations/0001_reference_data.sql`), seed tại `seed/0001_seed_reference.sql:34-38`. Cột `k` (0-4) là khóa FK mà `events.level` tham chiếu (`migrations/0002_core_operations.sql:70`: `level INTEGER NOT NULL REFERENCES levels(k)`).

| k | Mã | Tên | Điều kiện kích hoạt (trigger) | Người có quyền quyết định |
|---|---|---|---|---|
| 0 | XANH | Sẵn sàng mùa mưa bão | Mùa mưa bão, chưa có cảnh báo cụ thể (Điều 20.1) | Đơn vị/cơ sở tự duy trì |
| 1 | VÀNG | Cảnh giác (~72 giờ) | Dự báo bão/mưa lớn trong ~72h, hoặc dông lốc gió giật cấp 6-7 | TGĐ/người ủy quyền · GĐ đơn vị/BQL/CHT kích hoạt tại chỗ + báo cáo ngay |
| 2 | CAM | Chuẩn bị ứng phó (24-48h) | Nguy cơ ảnh hưởng 24-48h, TIN BÃO KHẨN CẤP, RRTT cấp 3 | TGĐ/người được ủy quyền quyết định · báo cáo Chủ tịch |
| 3 | ĐỎ | Khẩn cấp | Bão/mưa ảnh hưởng TRỰC TIẾP, gió ≥cấp 10 | **CHỦ TỊCH quyết định** · chỉ huy hiện trường xử lý tức thời khi đe dọa tính mạng |
| 4 | ĐẶC BIỆT | Huy động toàn Group | Thiệt hại lớn, NHIỀU cơ sở cùng ảnh hưởng, cần huy động toàn Group (Điều 20.5) | **CHỦ TỊCH trực tiếp chỉ huy và phê duyệt phương án riêng** |

**Business Rule BR-01** 🟢: Cấp độ là **số nguyên đơn hướng tăng dần theo mức độ nghiêm trọng** (0=thấp nhất, 4=cao nhất), nhưng hệ thống **không ép buộc thứ tự tăng dần tuần tự khi kích hoạt** — `POST /events/activate` (`events.ts:34`) chỉ validate `level` là số nguyên 0-4 hợp lệ (BUGFIX comment tại `events.ts:39-42` xác nhận đây là validation được bổ sung để tránh lỗi FK 500), **không kiểm tra cấp hiện tại trước khi cho phép nhảy cấp** (ví dụ có thể kích hoạt trực tiếp cấp 4 từ trạng thái không có event nào active, hoặc kích hoạt cấp 1 trong khi đang có event cấp 3 active — hệ thống cho phép nhiều `events` có `status='active'` đồng thời, không có ràng buộc UNIQUE hay business logic ngăn 2 event active cùng lúc).

**Business Rule BR-02** 🟡 INFERRED: Theo mô tả nghiệp vụ (`auth_desc` cột trong bảng `levels`), quyền kích hoạt cấp 3-4 thuộc về Chủ tịch — nhưng **middleware chỉ kiểm tra permission string `activate`** (role `bch` có permission này theo seed ROLES, không phân biệt theo mức level). Tức là: **về mặt kỹ thuật, bất kỳ user có permission `activate` (role `bch` hoặc `super`) đều có thể kích hoạt cấp 4 qua API**, không có validation bổ sung "chỉ Chủ tịch mới kích hoạt được cấp 3-4" như văn bản QĐ.03 quy định. Đây là khoảng cách giữa **quy định nghiệp vụ** (văn bản) và **thực thi kỹ thuật** (code) — cần ghi vào BRD như một business rule cần làm rõ: có nên thêm kiểm tra role cụ thể (không chỉ permission chung `activate`) cho cấp 3-4?

---

## PHẦN 2 — MÔ HÌNH GIAI ĐOẠN (PHASES) VÀ MA TRẬN LEVEL × PHASE

🟢 VERIFIED — 15 giai đoạn (`phases` bảng, seed `seed/0001_seed_reference.sql:41-55`), mỗi giai đoạn có `off_hours` (số giờ lệch so với mốc tham chiếu `rel`) dùng để tính `deadline` cho task tự sinh (`events.ts:78`: `hoursFromOffset()`).

| Phase ID | Nhãn | Mốc tham chiếu (`rel`) | Offset giờ |
|---|---|---|---|
| DAILY | Hằng ngày | DAILY | 0 |
| RP | Mưa – chuẩn bị | ACT | 3 |
| RD | Mưa – trong mưa | ACT | 12 |
| RA | Mưa – sau mưa | ACT | 24 |
| T72 | T-72h | T0 | -48 |
| T48 | T-48h | T0 | -24 |
| T24 | T-24h | T0 | -10 |
| T12 | T-12h | T0 | -6 |
| T6 | T-6h | T0 | -2 |
| DUR | Trong bão | T0 | 10 |
| R0 | Sau bão 0-3h | T0 | 15 |
| R24 | 3-24h | T0 | 36 |
| R72 | 1-3 ngày | T0 | 84 |
| R7 | 3-7 ngày | T0 | 180 |
| ADHOC | Giao bổ sung | ACT | 6 |

**Ma trận LEVEL_PHASES** (`level_phases` bảng, 43 dòng seed) — quy định giai đoạn nào được kích hoạt ở mỗi cấp độ:

| Level | Các Phase áp dụng |
|---|---|
| 0 (XANH) | DAILY (chỉ 1 phase — trực chuẩn bị thường nhật) |
| 1 (VÀNG) | DAILY, RP, RD, RA, T72 (5 phase — bắt đầu có kịch bản mưa + cảnh báo sớm 72h) |
| 2 (CAM) | DAILY, RP, RD, RA, T72, T48, T24, T12, T6 (9 phase — toàn bộ chuỗi trước-bão) |
| 3 (ĐỎ) | Tất cả 14 phase (DAILY→R7, trừ ADHOC) — vòng đời đầy đủ từ chuẩn bị đến khắc phục sau bão |
| 4 (ĐẶC BIỆT) | Giống Level 3 (14 phase) |

**Business Rule BR-03** 🟢: Task tự sinh khi `POST /events/activate` chỉ lọc theo `min_level <= level` của `task_templates` (`events.ts:71`: `WHERE active = 1 AND min_level <= ? ORDER BY min_level DESC LIMIT 28`), **không lọc theo phase phù hợp với level_phases matrix**. Nghĩa là bảng `level_phases` (ma trận 43 dòng) hiện **không được đọc/áp dụng bởi bất kỳ route nào** trong toàn bộ 9 file route (xác nhận qua grep: không tìm thấy `level_phases` trong `src/routes/*.ts`). Đây là dữ liệu nghiệp vụ có sẵn nhưng chưa được dùng — cần đưa vào SRS như một yêu cầu làm rõ TO-BE: có nên ràng buộc việc sinh task theo đúng phase hợp lệ của level đó?

**Business Rule BR-04** 🟢: Giới hạn cứng "tối đa 28 template mỗi lần activate" (`LIMIT 28` tại `events.ts:71`) — comment mã nguồn giải thích đây là để "cap at 28 for parity with the prototype's demo dataset density" — **đây là giới hạn kỹ thuật tùy ý (arbitrary), không phải business rule chính thức**, có nguy cơ bỏ sót task khi số lượng `task_templates` hợp lệ (`min_level <= level`) vượt 28 (hiện tại có 208 template trong seed, nhiều đơn vị — với cấp 3/4, khả năng cao có hơn 28 template hợp lệ, dẫn đến các task còn lại KHÔNG được sinh ra dù về nghiệp vụ chúng vẫn cần thực hiện).

---

## PHẦN 3 — STATE MACHINE: EVENT (Sự kiện ứng phó)

🟢 VERIFIED — bảng `events` (`migrations/0002_core_operations.sql:65-84`), cột `status TEXT NOT NULL DEFAULT 'active'` với comment liệt kê `active | deactivated | drill`.

```
                    POST /events/activate
                    (permission: activate)
                            │
                            ▼
                     ┌─────────────┐
                     │   active    │◄──── (không có state 'drill' được
                     └──────┬──────┘       set ở đâu qua route — chỉ có
                            │              trong comment schema, KHÔNG
      POST /events/:id/     │              được dùng thực tế 🟡 INFERRED)
      deactivate             │
      (permission: activate) │
                            ▼
                     ┌─────────────┐
                     │ deactivated │  (trạng thái cuối — không có
                     └─────────────┘   route nào chuyển ngược lại 'active')
```

**Business Rule BR-05** 🟢: Không có ràng buộc UNIQUE hoặc kiểm tra nghiệp vụ ngăn **nhiều event ở trạng thái `active` đồng thời**. Việc `GET /events?active=true` (dùng bởi `core-override.js`) chỉ lấy 1 event bất kỳ có `status='active'` — nếu có 2+ event active, hành vi chọn event nào để hiển thị lên dashboard **không được garantee thứ tự rõ ràng** (không có `ORDER BY` xác định trong route `events.ts:180` khi filter `active=true`, chỉ có `WHERE status='active'` — SQLite trả về theo thứ tự insert mặc định nếu không ORDER BY, không phải business rule tường minh).

**Business Rule BR-06** 🟢: `idempotencyKey` (`events.ts:44-50`) — nếu client gửi lại cùng key, hệ thống trả về event đã tạo trước đó **thay vì tạo mới**, tránh double-activate do double-click/network retry. Đây là business rule tốt, đã implement đúng.

---

## PHẦN 4 — STATE MACHINE: TASK (Nhiệm vụ)

🟢 VERIFIED — bảng `tasks` (`migrations/0002_core_operations.sql:90-110`), comment: `status TEXT NOT NULL DEFAULT 'issued' -- issued|ack|doing|done|overdue|blocked`.

```
        [Tự sinh khi Event activate]
                    │
                    ▼
              ┌───────────┐
              │  issued   │  (progress=0)
              └─────┬─────┘
                     │ POST /events/:id/tasks/:tid/ack
                     │ (chủ sở hữu task tự ack — không cần permission đặc biệt,
                     │  chỉ cần là owner_id — xem BR-07)
                     ▼
              ┌───────────┐
              │   doing   │  (qua PATCH /events/:id/tasks/:tid với status='doing')
              └─────┬─────┘
                     │ PATCH .../tasks/:tid (note) + POST .../done
                     ▼
              ┌───────────┐
              │   done    │  (progress=100, done_at set — TRẠNG THÁI CUỐI)
              └───────────┘

  Trạng thái 'overdue' và 'blocked': 🟡 INFERRED — có trong CHECK comment
  của schema nhưng KHÔNG tìm thấy route nào chủ động SET status này
  (không có cron/scheduled job kiểm tra deadline quá hạn để tự chuyển
  'overdue'; không có route PATCH nào set 'blocked' một cách tường minh
  ngoài PATCH chung cho phép set bất kỳ string vào status).
```

**Business Rule BR-07** 🟢: Kiểm tra quyền hoàn thành task (`events.ts:322-324`):
```ts
if (existing.owner_id !== user.id && !user.permissions.includes('*') && !user.permissions.includes('activate')) {
  return 403 'Chỉ người được giao mới hoàn thành được'
}
```
→ Chỉ **chính người được giao (owner_id)**, hoặc user có permission `*` (super) hoặc `activate` (bch), mới có quyền đánh dấu hoàn thành task. Đây là business rule rõ ràng, đã implement đúng.

**Business Rule BR-08** 🟡 INFERRED: **Không tìm thấy kiểm tra quyền tương tự cho hành động `ack`** (`events.ts:300-310` — route `POST /events/:id/tasks/:tid/ack` không có đoạn code kiểm tra `existing.owner_id !== user.id`) — nghĩa là **về mặt kỹ thuật, bất kỳ user đã đăng nhập (chỉ cần `requireAuth`) đều có thể ack task của người khác**, khác với quy tắc chặt chẽ hơn ở hành động `done`. Đây là điểm không đối xứng (asymmetry) trong business logic cần làm rõ với nghiệp vụ: có nên áp cùng ràng buộc owner-only cho `ack` như đã áp cho `done`?

**Business Rule BR-09** 🟢: Task có thể có `owner_id = NULL` (chưa gán) khi tạo tự động — logic gán owner tại `events.ts:87-89`: `SELECT id FROM users WHERE unit_code = ? AND active = 1 LIMIT 1` — **chỉ chọn 1 user đầu tiên tìm được trong đơn vị** (không có logic cân bằng tải/round-robin, không loại trừ user đang nghỉ/đang có nhiều task khác). Nếu đơn vị không có user active nào, task vẫn được tạo với `owner_id = NULL` (không có ai chịu trách nhiệm) — **không có cơ chế cảnh báo/theo dõi các task "mồ côi" (orphaned, không có owner) này**.

---

## PHẦN 5 — STATE MACHINE: INCIDENT (Sự cố)

🟢 VERIFIED — bảng `incidents` (`migrations/0002_core_operations.sql:137-148`): `status TEXT NOT NULL DEFAULT 'open' -- open | resolved`.

```
   POST /incidents { type, siteId, desc }
   (chỉ cần requireAuth — KHÔNG yêu cầu permission đặc biệt,
   xem Business Rule BR-10 dưới đây)
              │
              ▼
        ┌───────────┐        (tự động sinh kèm 1 Event level=3
        │   open    │         theo type — xem BR-11)
        └─────┬─────┘
              │ PATCH /incidents/:id { status:'resolved', resolution }
              │ (KHÔNG có middleware permission — bất kỳ user đã login
              │  đều PATCH được — xem BR-12)
              ▼
        ┌───────────┐
        │ resolved  │  (trạng thái cuối)
        └───────────┘
```

**Business Rule BR-10** 🟢 **[PHÁT HIỆN NGHIÊM TRỌNG]**: Route `POST /incidents` (`incidents.ts:17`) **chỉ có `incidents.use('*', requireAuth)` ở cấp toàn module** (`incidents.ts:13`), **không có `requirePermission` nào áp riêng cho route tạo sự cố**. Nghĩa là: **bất kỳ user đã đăng nhập với vai trò nào** (kể cả `viewer` — "Cư dân/khách, chỉ xem thông báo công khai" theo mô tả role) **đều có thể tự tạo sự cố khẩn cấp**, và theo BR-11 dưới đây, hành động này **tự động kích hoạt Event cấp 3 (ĐỎ)** — mức cấp mà theo văn bản QĐ.03 chỉ Chủ tịch mới có quyền quyết định. Đây là lỗ hổng phân quyền nghiêm trọng nhất phát hiện được trong toàn bộ audit: **một role thấp nhất trong hệ thống (`viewer`) có thể — về mặt kỹ thuật — tự mình kích hoạt phản ứng khẩn cấp cấp ĐỎ toàn Group**, hoàn toàn bỏ qua chuỗi phê duyệt theo cấp bậc quy định trong văn bản.

**Business Rule BR-11** 🟢: Mã nguồn `incidents.ts` (comment dòng 1-5) tự xác nhận: *"creating an incident auto-generates an Event (level 3 / ĐỎ by default for fire/flood) + tasks from the task library"* — xác nhận đúng như phân tích ở BR-10, hành động tạo incident luôn kèm kích hoạt event cấp 3, không phân biệt độ nghiêm trọng thực tế của incident.

**Business Rule BR-12** 🟢: Tương tự, `PATCH /incidents/:id` (`incidents.ts:104`) không có `requirePermission` riêng — chỉ cần `requireAuth`. Bất kỳ user đăng nhập đều có thể đổi trạng thái/đóng bất kỳ sự cố nào, không phân biệt ai là người báo cáo ban đầu hay đơn vị liên quan.

**Khuyến nghị BRD/SRS**: GAP-10 (mới, bổ sung vào Gap Analysis) — cần bổ sung `requirePermission` (ví dụ `activate` hoặc permission mới `incident.report`) cho `POST /incidents`, và giới hạn `PATCH /incidents/:id` theo `requireAnyPermission('activate', 'incident.manage')` — để khớp với nguyên tắc "Chỉ huy tập trung" (QĐ03_PRINCIPLES thứ 3: *"Chỉ huy tập trung, thông tin MỘT đầu mối"*).

---

## PHẦN 6 — STATE MACHINE: RELIEF PROJECT (Dự án cứu trợ)

🟢 VERIFIED — bảng `relief_projects` (`migrations/0003_relief_projects.sql:16`): `status TEXT NOT NULL DEFAULT 'drafting' -- drafting|planning|approved|in-progress|completed|closed`.

```
  POST /relief-projects (permission: relief.manage)
            │
            ▼
      ┌───────────┐
      │  drafting  │
      └─────┬──────┘
            │  PATCH /:id { status }  (permission: relief.manage —
            │  KHÔNG có validation transition — xem BR-13)
            ▼
      ┌───────────┐
      │  planning  │
      └─────┬──────┘
            ▼
      ┌───────────┐
      │  approved  │   (độc lập với relief_approvals — xem BR-14)
      └─────┬──────┘
            ▼
      ┌──────────────┐
      │ in-progress  │
      └─────┬────────┘
            ▼
      ┌───────────┐
      │ completed │
      └─────┬─────┘
            ▼
      ┌─────────┐
      │ closed  │  (trạng thái cuối)
      └─────────┘
```

**Business Rule BR-13** 🟢: `PATCH /relief-projects/:id` (`relief.ts:108`) cho phép cập nhật `status` thành **bất kỳ giá trị string nào** client gửi lên (không có validate enum, không có kiểm tra transition hợp lệ — ví dụ có thể set trực tiếp từ `drafting` → `closed`, bỏ qua toàn bộ chuỗi trung gian, không có lỗi/cảnh báo). Đây khác biệt so với module Approvals (relief_approvals) — nơi có validate enum rõ ràng cho `role` (`VALID_APPROVAL_ROLES`, xem Phần 7) nhưng KHÔNG có validate enum tương tự cho `relief_projects.status`.

**Business Rule BR-14** 🟢 **[PHÁT HIỆN QUAN TRỌNG]**: Cột `relief_projects.status` (workflow tổng thể của dự án) và bảng `relief_approvals` (4 phê duyệt riêng lẻ theo vai trò `ct`/`tgd`/`congdoan`/`phapche` — xem Phần 7) là **2 cơ chế hoàn toàn độc lập, không liên kết logic với nhau** trong mã nguồn. Nghĩa là: một dự án cứu trợ có thể có `status = 'approved'` dù **chưa có bất kỳ approval nào** trong `relief_approvals` (0/4 role đã quyết định), và ngược lại có thể có đủ 4/4 approval `decision='approved'` nhưng `relief_projects.status` vẫn ở `'drafting'`. **Không có route nào tự động đồng bộ 2 trạng thái này** (ví dụ: tự chuyển `status` sang `'approved'` khi đủ 4/4 phê duyệt). Đây là khoảng cách nghiệp vụ cần làm rõ trong SRS: dự kiến quy trình phê duyệt dự án cứu trợ có nên ràng buộc chặt giữa 2 cơ chế này?

---

## PHẦN 7 — STATE MACHINE: RELIEF APPROVAL (Phê duyệt dự án cứu trợ — 4 vai trò)

🟢 VERIFIED — bảng `relief_approvals` (PK kép `(project_id, role)`), route `relief.ts:416-432`.

```
  Với MỖI vai trò trong {ct, tgd, congdoan, phapche} — 4 phê duyệt độc lập:

     POST /:id/approvals/:role  { decision, note }
     (permission: approve.high HOẶC relief.manage)
              │
              ▼
      ┌──────────────────────────────────┐
      │  draft → reviewing → approved    │
      │              ↘         ↗          │  (KHÔNG có enum validate cho
      │               rejected            │   'decision' — client gửi string
      └──────────────────────────────────┘   tùy ý đều được ON CONFLICT UPSERT)
```

**Business Rule BR-15** 🟢: `VALID_APPROVAL_ROLES = ['ct', 'tgd', 'congdoan', 'phapche']` (`relief.ts:416`) — validate đúng 4 vai trò hợp lệ khi gọi API (400 nếu role không nằm trong danh sách này). **Tuy nhiên `decision` (giá trị trạng thái phê duyệt: draft/reviewing/approved/rejected theo seed data quan sát) KHÔNG có validate enum tương tự** — route chỉ kiểm tra `typeof body.decision === 'string'` (`relief.ts:424`), nghĩa là client có thể gửi bất kỳ chuỗi ký tự nào vào `decision` (ví dụ gõ nhầm `'aproved'` thay vì `'approved'`) và hệ thống chấp nhận lưu vào DB không báo lỗi — có nguy cơ dữ liệu rác không phát hiện được, ảnh hưởng tới UI hiển thị (ví dụ `mapReliefProject()` sau khi sửa GAP-01 đọc `a.decision` để hiển thị nhãn trạng thái, nếu giá trị rác sẽ hiển thị y nguyên chuỗi rác).

**Business Rule BR-16** 🟢: Cơ chế `ON CONFLICT(project_id, role) DO UPDATE` (`relief.ts:426-427`) — một vai trò **chỉ có 1 bản ghi phê duyệt duy nhất mỗi dự án**, mỗi lần POST mới sẽ **ghi đè quyết định cũ** (không giữ lịch sử các lần phê duyệt/từ chối trước đó). Nghĩa là nếu vai trò `phapche` (Pháp chế) đã từ chối (`rejected`) rồi sau đó phê duyệt lại (`approved`), **lịch sử từ chối ban đầu bị mất hoàn toàn** — không có audit trail riêng cho việc thay đổi quyết định phê duyệt (khác với `audit_log` chung của hệ thống — cần xác nhận liệu `audit_log` có ghi nhận hành động này hay không, chưa kiểm tra trong audit này).

---

## PHẦN 8 — MA TRẬN RBAC ĐẦY ĐỦ (8 Role × Permission × Route)

🟢 VERIFIED — 8 role (`seed/0001_seed_reference.sql:24-31`), permission string trích xuất từ toàn bộ `requirePermission`/`requireAnyPermission` trong 9 file route.

### 8.1 Danh sách Role và Permission gốc (theo seed)

| Role ID | Tên | Permissions (permission string, theo cột `perms_json`) |
|---|---|---|
| `super` | Super Admin | `["*"]` — wildcard, bỏ qua mọi kiểm tra permission |
| `bch` | Ban Chỉ huy | `view.all`, `activate`, `approve.high` |
| `unit_head` | Trưởng đơn vị | `view.unit`, `assign.tasks`, `report.unit` |
| `relief` | Trưởng đoàn cứu trợ | `relief.manage`, `budget.commit`, `team.lead` |
| `warehouse` | Thủ kho | `inventory.edit`, `export.stock` |
| `duty` | Cán bộ trực | `task.receive`, `log.write` |
| `audit` | Kiểm soát nội bộ | `view.all`, `audit.read` |
| `viewer` | Người xem | `view.public` |

**Business Rule BR-17** 🟢 **[PHÁT HIỆN — permission dùng trong code nhưng KHÔNG gán cho role nào]**: Đối chiếu toàn bộ permission string dùng trong `requirePermission()`/`requireAnyPermission()` (9 file route) với cột `perms_json` của 8 role (seed), phát hiện các permission **được kiểm tra trong code nhưng KHÔNG xuất hiện trong bất kỳ role nào ngoài `super` (wildcard)**:

| Permission dùng trong code | File:line | Role nào có permission này? |
|---|---|---|
| `admin.manage` | `bootstrap.ts` (12 route), `users.ts` (4 route) | 🔴 **KHÔNG role nào có** (ngoài `super` qua wildcard `*`) |
| `camera.view` | `cameras.ts` (4 route) | 🔴 **KHÔNG role nào có** |
| `camera.manage` | `cameras.ts` (4 route) | 🔴 **KHÔNG role nào có** |

→ **Hệ quả nghiệp vụ nghiêm trọng**: Toàn bộ chức năng Quản trị hệ thống (units/roles/sites/task-templates/norms/scenarios/users) và **toàn bộ module Camera an ninh** (xem GAP-05 trong Gap Analysis) **chỉ có thể được sử dụng bởi role `super`** — theo đúng mô tả role `super`: *"chỉ VP Chủ tịch & IT"*. Điều này có thể là **chủ đích thiết kế** (ASSUMED 🟠 — cần xác nhận với nghiệp vụ: có đúng là chỉ VP Chủ tịch/IT được quản trị camera và toàn hệ thống, không có role trung gian như "Quản trị camera" riêng?), nhưng nó khiến 6/8 role hoàn toàn không thể chạm vào 2 mảng chức năng lớn của hệ thống — nên được xác nhận rõ trong BRD.

### 8.2 Ma trận Quyền × Route (đầy đủ)

| Permission string | Role sở hữu (ngoài `super`) | Routes áp dụng |
|---|---|---|
| `activate` | `bch` | `POST /events/activate`, `/events/:id/deactivate`, `/events/:id/tasks` (OR `assign.tasks`), `/events/:id/tasks/:tid/reassign` (OR `assign.tasks`) |
| `approve.high` | `bch` | `POST /relief-projects/:id/approvals/:role` (OR `relief.manage`) |
| `assign.tasks` | `unit_head` | `POST /events/:id/tasks`, `/tasks/:tid/reassign` (OR `activate`) |
| `relief.manage` | `relief` | 15 route trong `relief.ts` (CRUD toàn bộ team/vehicles/cargo/itinerary/tasks/logs/beneficiaries/approvals/expenses/reports) |
| `budget.commit` | `relief` | `POST /relief-projects/:id/expenses` (OR `relief.manage`) |
| `team.lead` | `relief` | `POST/PATCH /relief-projects/:id/tasks`, `/logs`, `/beneficiaries/:bid` (OR `relief.manage`) |
| `audit.read` | `audit` | `GET /notifications/audit`, `/audit/export` |
| `admin.manage` | 🔴 **KHÔNG CÓ** | 16 route (`bootstrap.ts` × 12, `users.ts` × 4) |
| `camera.view` | 🔴 **KHÔNG CÓ** | `GET /cameras`, `/cameras/alerts/feed`, `/cameras/:id`, `POST /cameras/:id/alerts` |
| `camera.manage` | 🔴 **KHÔNG CÓ** | `POST/PATCH/DELETE /cameras`, `PATCH /cameras/:camId/alerts/:alertId` |
| *(không có permission riêng)* | mọi role đã login | `POST /incidents`, `PATCH /incidents/:id` — xem BR-10/BR-12 |

**Business Rule BR-18** 🟢: Permission `inventory.edit`, `export.stock` (role `warehouse`), `task.receive`, `log.write` (role `duty`), `view.unit`, `report.unit` (role `unit_head` — trừ `assign.tasks` đã dùng), `view.all` (role `bch`/`audit`), `view.public` (role `viewer`) **KHÔNG xuất hiện trong bất kỳ `requirePermission()` nào** ở toàn bộ 9 file route đã đọc. Điều này có nghĩa: các permission này được định nghĩa trong seed data (dự kiến khi thiết kế RBAC) nhưng **chưa có route backend nào thực thi kiểm tra chúng** — các chức năng liên quan (quản lý kho, nhận task, ghi log, xem báo cáo đơn vị) hiện tại chỉ được bảo vệ bởi `requireAuth` chung (mọi user đăng nhập đều gọi được, không phân biệt role) — đây là một khoảng cách permission enforcement quan trọng cần đưa vào backlog.

---

## PHẦN 9 — TRÁCH NHIỆM NGHIỆP VỤ THEO ĐƠN VỊ (RESP_MATRIX — 12 vai trò tổ chức)

🟢 VERIFIED — bảng `resp_matrix` (12 dòng, `seed/0001_seed_reference.sql:459-470`) — **đây là ma trận trách nhiệm THEO CHỨC DANH TỔ CHỨC (organizational role), khác với 8 role kỹ thuật (RBAC role) ở Phần 8** — cần phân biệt rõ 2 khái niệm "role" khác nhau trong hệ thống này:

| Chức danh tổ chức | Trách nhiệm chính | Đầu ra (Output) |
|---|---|---|
| Ban Chỉ huy (CT là Chỉ huy trưởng) | Quyết định cấp độ, điều phối, dừng/khôi phục | Phê duyệt ngân sách, cứu trợ lớn |
| Văn phòng Chủ tịch | **Cơ quan THƯỜNG TRỰC**: tiếp nhận tin, tham mưu cấp độ, phát lệnh, điều phối | Lệnh kích hoạt & báo cáo hợp nhất |
| Trung tâm HC-NS | Quản lý toàn bộ hệ thống kho (5 tầng — xem Phần 10), nhân sự, phương tiện | Sổ tổng nhập-xuất-tồn & quyền điều chuyển |
| Cty Xây lắp Cát Tường | PCLB tại CÔNG TRƯỜNG | Xác nhận điều kiện thi công lại |
| Cty QLN TNT | PCLB các DỰ ÁN vận hành, trực 24/24 | Bảo quản trực tiếp kho vệ tinh |
| Trung tâm Pháp chế | Soạn thảo/rà soát quy định, hồ sơ cứu trợ, tư vấn pháp lý | Hồ sơ sự cố nghiêm trọng |
| Tài chính-Kế toán | Nguồn tiền, hạn mức tạm ứng, mã chi phí riêng từng đợt (**không trộn nguồn đóng góp** — business rule tường minh) | Theo dõi riêng từng sự kiện/đợt |
| IT/Chuyển đổi số | Dữ liệu, UPS, cảm biến, cảnh báo, phát triển app/AI | Sao lưu & thứ tự khôi phục |
| Truyền thông | Thông tin chính thức (**chỉ người được phân công phát ngôn** — business rule) | Kiểm duyệt hình ảnh & dữ liệu |
| Kiểm soát nội bộ | Kiểm tra chéo số liệu, chứng từ, điểm bất thường | Báo cáo độc lập lên Ban Lãnh đạo |
| An toàn-Y tế & Bảo vệ | Sơ cứu, PPE, kiểm soát ra vào, camera, vùng cấm | Bàn giao ca & bảo vệ hiện trường |
| Nhà thầu & người lao động | Chấp hành lệnh, thu dọn/che chắn phạm vi mình | Ký xác nhận & chịu trách nhiệm |

**Business Rule BR-19** 🟠 ASSUMED — cần xác nhận nghiệp vụ: **12 chức danh tổ chức này KHÔNG có mapping 1-1 rõ ràng với 8 role RBAC kỹ thuật** (ví dụ "Văn phòng Chủ tịch" — cơ quan thường trực — nên map với role kỹ thuật nào? `bch`? `super`? Dữ liệu seed người dùng cho thấy user `vpct1` (Văn phòng Chủ tịch) được gán role kỹ thuật `super` — xem lại Gap Analysis phần login test — nhưng đây chỉ là 1 user mẫu, chưa rõ đây là quy tắc chính thức "mọi người ở VPCT đều là super" hay chỉ là dữ liệu seed test). Cần làm rõ trong BRD: bảng ánh xạ chính thức giữa 12 chức danh tổ chức và 8 role kỹthuật.

---

## PHẦN 10 — MÔ HÌNH KHO (KHO_MODEL — 5 tầng) VÀ QUY TẮC ĐỊNH MỨC

🟢 VERIFIED — bảng `kho_model` (5 dòng seed) mô tả cấu trúc phân cấp kho:
1. **Kho Tổng** — cấp cao nhất, do Trung tâm HC-NS quản lý.
2. **Kho Vệ tinh** — theo từng cơ sở/dự án, do Cty QLN TNT bảo quản trực tiếp.
3. **Tủ trực** — cấp đơn vị nhỏ, sẵn sàng dùng ngay.
4. **Cơ động** — thiết bị di động theo lệnh điều chuyển.
5. **Kho ảo** — 🟠 ASSUMED — tên gợi ý có thể là kho ghi nhận số liệu không có vị trí vật lý cố định (cần xác nhận nghiệp vụ chính xác ý nghĩa "kho ảo" này).

**Business Rule BR-20** 🟢 (trích từ `levels` seed, level 0 XANH `action_desc`): *"kho đủ định mức (**hàng hỏng/hết hạn KHÔNG tính vào định mức**)"* — quy tắc nghiệp vụ rõ ràng: khi kiểm tra tồn kho có đạt định mức (bảng `norms`, 15 dòng seed) hay không, **không được tính hàng đã hỏng/hết hạn vào số lượng tồn**. 🟡 INFERRED: chưa xác nhận route `GET/PATCH /norms` (`bootstrap.ts:248,253`) hoặc bảng `pccc_inventory` (27 dòng, có cột `alert`) có áp dụng logic loại trừ hàng hỏng/hết hạn này trong tính toán hay không — cần kiểm tra thêm khi đi sâu vào SRS module Kho/Vật tư.

**Business Rule BR-21** 🟢 (từ `pccc_inventory`/`inventory_gaps` seed): Có 12 dòng "gap" định sẵn với cột `priority` (P1/P2/P3) — đây là dữ liệu **audit thủ công có sẵn từ trước** (không phải do hệ thống này tính toán tự động) — ghi nhận các thiếu hụt vật tư PCCC đã biết tại thời điểm soạn seed. 🟠 ASSUMED: chưa rõ liệu có quy trình tự động nào (hoặc dự kiến TO-BE) để hệ thống tự tính "gap" này dựa trên so sánh tồn kho thực tế với định mức, hay đây vẫn là input thủ công từ đội kiểm tra.

---

## PHẦN 11 — NGUYÊN TẮC VÀ ĐIỀU CẤM (QĐ.03) — BUSINESS RULES CẤP CAO NHẤT

🟢 VERIFIED — 6 nguyên tắc (`qd03_principles`) + 6 điều cấm (`qd03_forbidden`), `seed/0001_seed_reference.sql:608-621`. Đây là các **business rule ở tầng quy định/pháp lý**, không phải rule kỹ thuật, nhưng ảnh hưởng trực tiếp đến thiết kế hệ thống:

| # | Nguyên tắc | Liên hệ đến thiết kế hệ thống |
|---|---|---|
| 1 | Bốn tại chỗ: chỉ huy, lực lượng, phương tiện-vật tư, hậu cần tại chỗ | Hỗ trợ bởi mô hình Kho 5 tầng (Phần 10) và phân công theo đơn vị (task_templates.unit_code) |
| 2 | Ưu tiên TUYỆT ĐỐI an toàn tính mạng, không đánh đổi để cứu tài sản | Chưa thấy ràng buộc kỹ thuật cụ thể nào implement nguyên tắc này (mang tính chỉ đạo hành vi con người, không phải business rule có thể code hóa trực tiếp) |
| 3 | **Chỉ huy tập trung, thông tin MỘT đầu mối**; xác nhận kết quả bằng hệ thống điện tử | **Mâu thuẫn trực tiếp với BR-10/BR-12** (bất kỳ role nào tạo/đóng incident) — đây là bằng chứng quy phạm cho khuyến nghị sửa GAP mới đã nêu ở Phần 5 |
| 4 | KHÔNG cứu nạn vượt năng lực — báo 112/114/115 | Không có ràng buộc kỹ thuật (đúng đắn — đây là nguyên tắc hành vi hiện trường) |
| 5 | Vật tư/hàng cứu trợ: minh bạch, đúng mục đích, có hồ sơ, kiểm tra sau sử dụng | Liên hệ `relief_beneficiaries` (status pending/delivered/declined) và `relief_expenses` — nhưng theo GAP-04 (Gap Analysis), phần lớn chưa được frontend sử dụng thật |
| 6 | Phương án từng cơ sở phải CỤ THỂ HƠN Quy định chung | Thể hiện qua `task_templates.unit_code` (208 template phân theo 14 đơn vị) — đã có cấu trúc hỗ trợ |

| # | Điều cấm | Liên hệ đến thiết kế hệ thống |
|---|---|---|
| 1 | Không chấp hành lệnh dừng thi công/sơ tán/cô lập điện | Hành vi con người, không code hóa được trực tiếp — có thể theo dõi qua task status `blocked` (nhưng theo BR-06 route không set status này tường minh) |
| 2 | Tự ý vào khu vực nguy hiểm chưa xác nhận an toàn | Hành vi hiện trường |
| 3 | Tự ý vận hành/tháo sửa thiết bị cứu hộ khi chưa phân công | Liên hệ `task.owner_id` — nhưng không có ràng buộc kỹ thuật ngăn user thao tác ngoài task được giao |
| 4 | Dùng vật tư/thiết bị/hàng cứu trợ cho mục đích cá nhân; sửa số liệu, ký khống | **Liên hệ trực tiếp BR-16** (approval history bị ghi đè, không giữ log riêng) và thiếu audit trail chi tiết cho thay đổi `relief_expenses`/`relief_beneficiaries` |
| 5 | Che giấu sự cố, chậm báo cáo, thông tin sai lệch | Liên hệ hệ thống `notifications`/`event_logs` — đã có cơ chế ghi log tự động khi activate event |
| 6 | Phân phối cứu trợ không danh sách, không xác nhận, trục lợi | **Liên hệ trực tiếp GAP-04** — tab "Đối tượng thụ hưởng" hiện dùng dữ liệu giả (`sampleHouseholds()`), chưa dùng bảng `relief_beneficiaries` thật có `signed_at`/`photo_url` để xác nhận đã trao đúng người |

**Kết luận Phần 11**: Nguyên tắc số 3 (Chỉ huy tập trung) và Điều cấm số 6 (phân phối minh bạch) là 2 quy định có **liên hệ trực tiếp và mâu thuẫn rõ ràng nhất** với các Gap đã phát hiện (BR-10/BR-12 và GAP-04) — cần được nêu bật trong BRD như các yêu cầu nghiệp vụ có mức độ ưu tiên cao nhất khi lập backlog.

---

## PHẦN 12 — TỔNG HỢP BUSINESS RULES CẦN ĐƯA VÀO BRD/SRS (bảng tổng hợp truy vết)

| Mã BR | Mô tả ngắn | Mức độ | Liên hệ GAP (Gap Analysis) |
|---|---|---|---|
| BR-01 | Không ép buộc thứ tự tăng dần cấp độ khi activate | Trung bình | Mới (chưa có mã GAP) |
| BR-02 | Quyền kích hoạt cấp 3-4 chỉ theo permission chung `activate`, không theo role Chủ tịch cụ thể | Cao | Mới |
| BR-03 | `level_phases` matrix (43 dòng) không được đọc/dùng bởi route nào | Trung bình | Mới |
| BR-04 | Giới hạn cứng 28 template/lần activate có thể bỏ sót task | Trung bình-Cao | Mới |
| BR-07/BR-08 | Bất đối xứng quyền ack (ai cũng được) vs done (chỉ owner) | Trung bình | Mới |
| BR-09 | Task có thể "mồ côi" (owner=NULL) không cảnh báo | Thấp-Trung bình | Mới |
| BR-10/BR-11/BR-12 | **Bất kỳ role nào tạo/đóng Incident, tự động kích hoạt Event cấp 3** | **Cao (nghiêm trọng nhất)** | Mới — khuyến nghị số hiệu GAP-10 |
| BR-13/BR-14 | relief_projects.status và relief_approvals độc lập, không đồng bộ | Trung bình-Cao | Liên hệ GAP-04 |
| BR-15 | `decision` field không validate enum (dữ liệu rác có thể lưu) | Thấp-Trung bình | Liên hệ GAP-01 |
| BR-16 | Approval ghi đè, không giữ lịch sử quyết định | Trung bình | Mới |
| BR-17 | `admin.manage`/`camera.view`/`camera.manage` không role nào có (trừ super) | Cao (cần xác nhận nghiệp vụ) | Liên hệ GAP-03/GAP-05 |
| BR-18 | 7 permission seed sẵn nhưng chưa route nào dùng | Trung bình | Mới |
| BR-19 | Thiếu bảng ánh xạ chính thức 12 chức danh tổ chức ↔ 8 role kỹ thuật | Trung bình (cần nghiệp vụ) | Mới |
| BR-20/BR-21 | Quy tắc loại trừ hàng hỏng khỏi định mức — chưa xác nhận có được áp dụng trong tính toán | Thấp (cần xác nhận) | Mới |

**Lưu ý về phạm vi**: Theo đúng chỉ đạo "chỉ triển khai mã nguồn khi phát hiện lỗi", các Business Rule ở Phần này **chủ yếu là phát hiện phục vụ BRD/SRS/backlog** — không tự ý sửa mã nguồn cho các mục này (khác với GAP-01 đã sửa vì đó là bug rõ ràng, không phải quyết định thiết kế cần thảo luận nghiệp vụ). Riêng **BR-10/BR-11/BR-12** (Incident có thể tạo/đóng bởi bất kỳ role) là ứng viên mạnh cho việc sửa sớm — nhưng **cần xác nhận với nghiệp vụ trước** vì đây là quyết định phân quyền có thể ảnh hưởng đến luồng vận hành thực tế (ví dụ: có thể đội ngũ hiện tại đang dựa vào việc "ai cũng báo được sự cố khẩn" là chủ đích thiết kế để không làm chậm phản ứng đầu tiên) — do đó **không tự sửa trong audit này**, chỉ ghi nhận và đưa vào BRD để quyết định cùng nghiệp vụ.
