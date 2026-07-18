# USE CASE · USER STORY · ACCEPTANCE CRITERIA (GHERKIN)
## Hệ thống CTG Command Center — PCLB · PCCC · Cát Tường Group

**Ngày lập**: 2026-07-18
**Phiên bản**: 1.0
**Nguồn**: `docs/audit/SRS.md` (FR-01..FR-20) + `docs/audit/BRD.md` (BRQ-01..BRQ-20) + `docs/audit/PROCESS-RBAC-MODEL.md` (BR-01..BR-21, 8 role kỹ thuật).
**Quy ước nhãn**: 🟢 VERIFIED · 🟡 INFERRED · 🟠 ASSUMED — áp dụng cho phần "Hiện trạng"/"Ghi chú" của mỗi mục; phần "Kịch bản Gherkin" mô tả **hành vi TO-BE mong muốn** (chưa lập trình, trừ khi ghi rõ "ĐÃ TRIỂN KHAI").
**Quy ước mã**: `UC-xx` = Use Case đầy đủ (actor, tiền/hậu điều kiện, luồng chính/luồng thay thế). `US-xx` = User Story ngắn. `AC-xx.y` = Acceptance Criteria (Gherkin) gắn theo từng US. Mỗi UC/US trích dẫn ngược **FR-xx** (SRS) để giữ truy vết.

---

## PHẦN 1 — USE CASE NHÓM A: KIỂM SOÁT PHÂN QUYỀN SỰ CỐ (P0 — FR-01/02/03)

### UC-01 — Báo cáo Sự cố khẩn cấp (Report Incident)
**Nguồn**: FR-01, FR-02 · BRQ-01 · BR-10, BR-11
**Actor chính**: 🔴 Cần xác nhận nghiệp vụ (xem 2 phương án dưới) — tạm ký hiệu "Người báo cáo được ủy quyền".
**Actor phụ**: Hệ thống (tự động sinh Event nếu chọn phương án giữ nguyên tự động hóa).
**Tiền điều kiện**: Người dùng đã đăng nhập hợp lệ (`ctg_token` còn hạn).
**Hậu điều kiện (thành công)**: Bản ghi `incidents` mới với `status='open'`; (nếu Phương án A) 1 `Event` mới cấp 3 được tạo kèm task tự sinh; (nếu Phương án B) không có Event nào được tạo, chờ bước UC-02 riêng.

**🔴 Quyết định nghiệp vụ cần chọn TRƯỚC khi đặc tả UC này ở mức chi tiết cuối cùng**:
- **Phương án A** (giữ hành vi tự động hiện tại, chỉ thêm kiểm soát ai được báo cáo): chỉ role có permission `incident.report` mới gọi được `POST /incidents`; hệ thống vẫn tự sinh Event cấp 3 như hiện tại.
- **Phương án B** (tách rời báo cáo và kích hoạt — theo FR-02): mọi user đã đăng nhập vẫn báo cáo được (giữ tốc độ phản ứng), nhưng việc kích hoạt Event cấp 3 chuyển sang UC-02 riêng, cần permission `activate`.

**Luồng chính (mô tả theo Phương án A — kiểm soát chặt tại điểm vào)**:
1. Người dùng có permission `incident.report` mở màn hình "Báo cáo sự cố", điền loại sự cố/địa điểm/mô tả.
2. Hệ thống kiểm tra permission `incident.report` (hoặc `activate`) — nếu không có, từ chối 403.
3. Hệ thống tạo `incidents` (status=open) và tự sinh `Event` cấp 3 (ĐỎ) kèm task từ `task_templates` phù hợp.
4. Hệ thống trả về thông tin sự cố + event vừa tạo, hiển thị xác nhận trên UI.

**Luồng thay thế A1 — Không đủ quyền**: Ở bước 2, nếu user không có permission cần thiết, hệ thống trả 403 `{ok:false,error:{code:'FORBIDDEN',message:'...'}}`, không tạo bản ghi nào.

**Ghi chú hiện trạng 🟢**: Hiện tại (trước khi FR-01 được triển khai), bước 2 KHÔNG tồn tại trong code — bất kỳ `requireAuth` là đủ, đây chính là GAP đã ghi nhận BR-10.

---

### UC-02 — Kích hoạt Event cấp cao từ Sự cố (Escalate Incident to Event) [chỉ áp dụng nếu chọn Phương án B ở UC-01]
**Nguồn**: FR-02 · BRQ-01
**Actor chính**: Role có permission `activate` (theo seed hiện tại: `bch`, `super`).
**Tiền điều kiện**: Đã có bản ghi `incidents` với `status='open'`, chưa có `event_id` liên kết.
**Hậu điều kiện**: `incidents.event_id` được gán, 1 `Event` mới được tạo với cấp độ do người có thẩm quyền lựa chọn (không mặc định cứng 3).

**Luồng chính**:
1. Người có permission `activate` xem danh sách sự cố đang mở chưa kích hoạt Event.
2. Chọn 1 sự cố, đánh giá mức độ nghiêm trọng thực tế, chọn cấp độ ứng phó (1-4).
3. Hệ thống gọi `POST /incidents/:id/escalate {level}` → tạo Event tương ứng, liên kết `incidents.event_id`.
4. Hệ thống sinh task tự động theo cấp độ đã chọn (dùng lại logic `POST /events/activate` hiện có).

---

### UC-03 — Đóng/Cập nhật Sự cố (Close Incident)
**Nguồn**: FR-03 · BRQ-02 · BR-12
**Actor chính**: 🔴 Cần xác nhận: `reported_by` ban đầu, HOẶC role `bch`/`super`.
**Tiền điều kiện**: `incidents.status = 'open'`.
**Hậu điều kiện**: `incidents.status = 'resolved'`, có `resolution` ghi rõ.

**Luồng chính**:
1. Actor mở chi tiết sự cố (`GET /incidents/:id`), xem timeline liên quan.
2. Actor nhập nội dung xử lý (`resolution`), nhấn "Đóng sự cố".
3. Hệ thống kiểm tra quyền (permission `activate`/`incident.report` HOẶC là người báo cáo ban đầu — theo quyết định FR-03).
4. Nếu hợp lệ: cập nhật `status='resolved'`, ghi `resolution`, ghi audit log.

**Luồng thay thế A1 — Không đủ quyền**: Nếu actor không phải người báo cáo và không có permission phù hợp, hệ thống trả 403, không cho đóng sự cố của người/đơn vị khác.

---

## PHẦN 2 — USER STORY & ACCEPTANCE CRITERIA (GHERKIN) — theo từng FR

*(Định dạng: mỗi US có 1+ AC viết bằng Gherkin `Given/When/Then`, ngôn ngữ tiếng Việt để khớp ngữ cảnh nghiệp vụ, dùng thuật ngữ hệ thống bằng tiếng Anh khi là tên trường/route kỹ thuật.)*

### US-01 (FR-01/FR-02) — Kiểm soát ai được báo cáo Sự cố khẩn cấp
> **Với vai trò** một quản trị hệ thống an toàn (Ban Chỉ huy/IT),
> **tôi muốn** chỉ những vai trò có thẩm quyền mới tạo được Sự cố khẩn cấp (và/hoặc kích hoạt Event cấp 3-4 kèm theo),
> **để** tuân thủ nguyên tắc "Chỉ huy tập trung, một đầu mối" của QĐ.03 và tránh kích hoạt phản ứng khẩn cấp sai/thừa không cần thiết.

```gherkin
# AC-01.1 — Từ chối tạo Sự cố khi thiếu quyền (Phương án A)
Scenario: Người dùng vai trò "viewer" không thể tạo Sự cố khẩn cấp
  Given người dùng đã đăng nhập với vai trò kỹ thuật "viewer" (permission chỉ có "view.public")
  When người dùng gửi request POST /api/v1/incidents với loại sự cố "fire" và mô tả hợp lệ
  Then hệ thống trả về mã lỗi 403 FORBIDDEN
  And không có bản ghi "incidents" mới nào được tạo trong D1
  And không có "Event" mới nào được tạo

# AC-01.2 — Cho phép tạo Sự cố khi đủ quyền (Phương án A)
Scenario: Người dùng vai trò "bch" tạo Sự cố khẩn cấp thành công
  Given người dùng đã đăng nhập với vai trò kỹ thuật "bch" (có permission "activate")
  When người dùng gửi request POST /api/v1/incidents với loại sự cố "fire" và mô tả hợp lệ
  Then hệ thống trả về 200 với envelope {ok:true,data:{...}}
  And có 1 bản ghi "incidents" mới với status="open"
  And có 1 "Event" mới được tạo với level=3, liên kết đúng incidents.event_id

# AC-01.3 — Báo cáo mở cho mọi người, kích hoạt riêng cần quyền (Phương án B — thay thế AC-01.1/01.2 nếu được chọn)
Scenario: Bất kỳ user đăng nhập báo cáo Sự cố, nhưng chưa tự động kích hoạt Event
  Given người dùng đã đăng nhập với vai trò kỹ thuật bất kỳ (kể cả "viewer")
  When người dùng gửi request POST /api/v1/incidents với loại sự cố "fire" và mô tả hợp lệ
  Then hệ thống trả về 200, tạo bản ghi "incidents" status="open"
  And KHÔNG có "Event" nào được tự động tạo (event_id = null)

Scenario: Chỉ role có quyền "activate" mới kích hoạt Event từ Sự cố đã báo cáo
  Given tồn tại 1 bản ghi "incidents" status="open", event_id=null
  And người dùng đăng nhập với vai trò "unit_head" (KHÔNG có permission "activate")
  When người dùng gửi request POST /api/v1/incidents/:id/escalate {level:3}
  Then hệ thống trả về 403 FORBIDDEN
  And incidents.event_id vẫn là null

Scenario: Role "bch" kích hoạt Event thành công từ Sự cố đã báo cáo
  Given tồn tại 1 bản ghi "incidents" status="open", event_id=null
  And người dùng đăng nhập với vai trò "bch" (có permission "activate")
  When người dùng gửi request POST /api/v1/incidents/:id/escalate {level:3}
  Then hệ thống trả về 200, tạo Event mới level=3
  And incidents.event_id được gán đúng id Event vừa tạo
```
**🔴 Lưu ý**: AC-01.1/01.2 và AC-01.3 là 2 tập kịch bản LOẠI TRỪ NHAU — chỉ 1 trong 2 phương án được triển khai tùy quyết định nghiệp vụ (xem UC-01).

---

### US-02 (FR-03) — Kiểm soát ai được đóng Sự cố
> **Với vai trò** người chịu trách nhiệm ứng phó,
> **tôi muốn** chỉ người báo cáo ban đầu hoặc người có thẩm quyền chỉ huy mới đóng được Sự cố,
> **để** tránh việc đóng sự cố sai/thiếu trách nhiệm bởi người không liên quan.

```gherkin
# AC-02.1
Scenario: Người không liên quan không thể đóng Sự cố của người khác
  Given tồn tại "incidents" id=INC-001, status="open", reported_by="user-A"
  And người dùng hiện tại là "user-B" vai trò "viewer" (không phải reported_by, không có permission activate/incident.report)
  When "user-B" gửi PATCH /api/v1/incidents/INC-001 {status:"resolved", resolution:"..."}
  Then hệ thống trả về 403 FORBIDDEN
  And incidents.status vẫn là "open"

# AC-02.2
Scenario: Người báo cáo ban đầu đóng được Sự cố của chính mình
  Given tồn tại "incidents" id=INC-001, status="open", reported_by="user-A"
  When "user-A" gửi PATCH /api/v1/incidents/INC-001 {status:"resolved", resolution:"Đã xử lý xong, không thiệt hại"}
  Then hệ thống trả về 200
  And incidents.status = "resolved", resolution được lưu đúng nội dung

# AC-02.3
Scenario: Role "bch" đóng được Sự cố của người khác báo cáo
  Given tồn tại "incidents" id=INC-002, status="open", reported_by="user-C" (vai trò "duty")
  And người dùng hiện tại vai trò "bch" (có permission "activate")
  When "bch" gửi PATCH /api/v1/incidents/INC-002 {status:"resolved", resolution:"..."}
  Then hệ thống trả về 200, incidents.status = "resolved"
```

---

### US-03 (FR-04) — Bảo vệ danh bạ liên lạc khẩn (PII)
> **Với vai trò** người phụ trách bảo mật dữ liệu (IT/Chuyển đổi số),
> **tôi muốn** số điện thoại cá nhân nhân viên không thể truy cập công khai mà không đăng nhập,
> **để** tuân thủ bảo vệ dữ liệu cá nhân và tránh lộ thông tin liên hệ nhạy cảm ra internet.

```gherkin
# AC-03.1 — Không còn PII trong file tĩnh công khai
Scenario: Truy cập trực tiếp file tĩnh không còn trả về số điện thoại thật
  Given hệ thống đã triển khai FR-04 (xóa window.PHONEBOOK khỏi ctg-data.js)
  When một trình duyệt KHÔNG đăng nhập (không có cookie ctg_token) tải file "/static/assets/ctg-data.js"
  Then nội dung file trả về KHÔNG chứa bất kỳ số điện thoại 10 số nào ở dạng window.PHONEBOOK

# AC-03.2 — API danh bạ yêu cầu xác thực
Scenario: Gọi API danh bạ không có token bị từ chối
  When một client gọi GET /api/v1/phonebook mà không có cookie ctg_token hợp lệ
  Then hệ thống trả về 401 UNAUTHORIZED

# AC-03.3 — API danh bạ trả dữ liệu đúng cho user đã đăng nhập
Scenario: Người dùng đã đăng nhập xem được danh bạ qua API
  Given người dùng đã đăng nhập hợp lệ (bất kỳ vai trò, do BRQ-03 chỉ yêu cầu requireAuth tối thiểu — 🔴 cần xác nhận nếu cần permission chặt hơn)
  When người dùng gọi GET /api/v1/phonebook
  Then hệ thống trả về 200 với danh sách liên hệ đọc từ bảng D1 "phonebook"
  And danh sách khớp số lượng và nội dung đã seed (87 dòng theo seed/0001_seed_reference.sql — 🔴 cần xác nhận thống nhất với 172 dòng cũ trước khi go-live)
```

---

### US-04 (FR-05) — Kết nối 4 tab Admin với API thật
> **Với vai trò** quản trị viên hệ thống (role `super`, permission `admin.manage`),
> **tôi muốn** các thay đổi tôi thực hiện trên tab Đơn vị/Nhiệm vụ mẫu/Kịch bản/Định mức được lưu thật vào D1,
> **để** dữ liệu không bị mất khi tải lại trang và phản ánh đúng cấu hình vận hành thực tế.

```gherkin
# AC-04.1 — Thêm đơn vị mới persist qua reload
Scenario: Thêm đơn vị mới trong tab "Đơn vị & Cơ sở" được lưu thật
  Given người dùng vai trò "super" đang ở tab "Đơn vị & Cơ sở" trong Admin
  When người dùng thêm đơn vị mới "Chi nhánh Đà Nẵng" và lưu
  Then hệ thống gọi POST /api/v1/units và trả về 200
  And khi tải lại trang (F5), đơn vị "Chi nhánh Đà Nẵng" vẫn xuất hiện trong danh sách

# AC-04.2 — Sửa nhiệm vụ mẫu persist qua reload
Scenario: Sửa nhiệm vụ mẫu trong tab "Nhiệm vụ mẫu" được lưu thật
  Given người dùng vai trò "super" mở 1 nhiệm vụ mẫu có sẵn
  When người dùng sửa nội dung mô tả nhiệm vụ và lưu
  Then hệ thống gọi PATCH /api/v1/task-templates/:id và trả về 200
  And khi tải lại trang, nội dung đã sửa vẫn hiển thị đúng

# AC-04.3 — Người không có quyền admin.manage không thấy được thay đổi thành công
Scenario: Vai trò "unit_head" không thể sửa Kịch bản (không có admin.manage)
  Given người dùng vai trò "unit_head" (không có permission "admin.manage")
  When người dùng gửi PATCH /api/v1/scenarios/:id
  Then hệ thống trả về 403 FORBIDDEN
```

---

### US-05 (FR-06) — Hoàn thiện quản lý Đối tượng thụ hưởng cứu trợ thật
> **Với vai trò** Trưởng đoàn cứu trợ (role `relief`),
> **tôi muốn** ghi nhận và xem đúng dữ liệu thật (có ký xác nhận/ảnh) của các hộ thụ hưởng,
> **để** đảm bảo minh bạch phân phối cứu trợ theo đúng Điều cấm QĐ.03 số 6 (không phân phối không danh sách/xác nhận).

```gherkin
# AC-05.1 — Xem danh sách hộ thụ hưởng thật, không còn dữ liệu giả
Scenario: Tab "Đối tượng thụ hưởng" hiển thị dữ liệu thật từ D1
  Given dự án cứu trợ "CTR-2024-YAGI" có 5 hộ thụ hưởng đã lưu trong relief_beneficiaries
  When Trưởng đoàn cứu trợ mở tab "Đối tượng thụ hưởng" của dự án này
  Then hệ thống gọi GET /api/v1/relief-projects/CTR-2024-YAGI/beneficiaries
  And danh sách hiển thị đúng 5 hộ với household_name/address/status thật
  And KHÔNG gọi hàm sampleHouseholds() nữa (không còn trong code production)

# AC-05.2 — Xác nhận đã trao cứu trợ (ký/ảnh) cho 1 hộ
Scenario: Đánh dấu hộ đã nhận cứu trợ với ảnh xác nhận
  Given hộ thụ hưởng "HGD-003" đang ở status="pending"
  When Trưởng đoàn cứu trợ upload ảnh xác nhận và đánh dấu "Đã trao" cho "HGD-003"
  Then hệ thống gọi PATCH /api/v1/relief-projects/:id/beneficiaries/HGD-003 {status:"delivered", photo_url:"...", signed_at:"..."}
  And trạng thái hiển thị chuyển thành "✓ Đã trao" kèm ảnh xác nhận trên UI
```

---

### US-06 (FR-07/FR-07b) — Validate enum trạng thái dự án cứu trợ và quyết định phê duyệt
> **Với vai trò** người phát triển hệ thống,
> **tôi muốn** hệ thống từ chối giá trị trạng thái không hợp lệ,
> **để** tránh dữ liệu rác làm hỏng hiển thị và báo cáo.

```gherkin
# AC-06.1 — Từ chối status không hợp lệ cho dự án cứu trợ
Scenario: Gửi giá trị status tùy ý bị từ chối
  When client gửi PATCH /api/v1/relief-projects/:id {status:"khong_hop_le_123"}
  Then hệ thống trả về 400 với error.code="INVALID_STATUS"
  And relief_projects.status KHÔNG bị thay đổi

# AC-06.2 — Chấp nhận status hợp lệ
Scenario: Gửi giá trị status hợp lệ được chấp nhận
  When client gửi PATCH /api/v1/relief-projects/:id {status:"in-progress"}
  Then hệ thống trả về 200, status được cập nhật

# AC-06.3 — Từ chối decision không hợp lệ cho phê duyệt
Scenario: Gửi decision sai chính tả bị từ chối
  When client gửi POST /api/v1/relief-projects/:id/approvals/ct {decision:"aproved"}
  Then hệ thống trả về 400 với error.code="INVALID_DECISION"
  And relief_approvals KHÔNG được ghi giá trị rác này
```

---

### US-07 (FR-08) — Giữ lịch sử thay đổi quyết định phê duyệt cứu trợ
> **Với vai trò** Kiểm soát nội bộ,
> **tôi muốn** xem được toàn bộ lịch sử thay đổi quyết định phê duyệt của từng vai trò trên mỗi dự án cứu trợ,
> **để** đảm bảo truy vết đầy đủ, tuân thủ Điều cấm QĐ.03 số 4 (không sửa số liệu không dấu vết).

```gherkin
# AC-07.1 — Lịch sử được ghi khi đổi quyết định
Scenario: Vai trò "phapche" từ chối rồi phê duyệt lại — lịch sử được giữ đủ 2 lần
  Given dự án "CTR-2024-YAGI" chưa có phê duyệt nào từ vai trò "phapche"
  When "phapche" gửi POST /:id/approvals/phapche {decision:"rejected", note:"Thiếu hồ sơ"}
  And sau đó "phapche" gửi POST /:id/approvals/phapche {decision:"approved", note:"Đã bổ sung đủ hồ sơ"}
  Then relief_approvals hiện tại có decision="approved" (bản ghi mới nhất)
  And GET /:id/approvals/phapche/history trả về đủ 2 dòng: rejected (trước) và approved (sau), không mất dòng nào

# AC-07.2 — Lịch sử ghi rõ người thay đổi và thời điểm
Scenario: Mỗi dòng lịch sử có đủ thông tin truy vết
  When xem GET /:id/approvals/ct/history
  Then mỗi dòng trả về có đủ trường changed_by, changed_at, decision, note
```

---

### US-08 (FR-09) — Đánh dấu cảnh báo camera đã xử lý từ UI
> **Với vai trò** Tổ an toàn-bảo vệ (permission `camera.manage`),
> **tôi muốn** đánh dấu 1 cảnh báo camera là đã xử lý ngay trên giao diện,
> **để** không phải sửa dữ liệu bằng công cụ ngoài hệ thống.

```gherkin
# AC-08.1
Scenario: Đánh dấu cảnh báo đã xử lý thành công
  Given tồn tại 1 "camera_alerts" id=ALERT-01, status="open"
  And người dùng có permission "camera.manage"
  When người dùng nhấn nút "Đánh dấu đã xử lý" trên cảnh báo ALERT-01
  Then hệ thống gọi PATCH /api/v1/cameras/:camId/alerts/ALERT-01 {status:"resolved"}
  And camera_alerts.status = "resolved", resolved_at và resolved_by được ghi
  And UI hiển thị nhãn "✓ Đã xử lý" ngay lập tức, không cần tải lại trang

# AC-08.2 — Không có quyền không thấy nút hoặc bị từ chối
Scenario: Người dùng không có camera.manage không thể xử lý cảnh báo
  Given người dùng vai trò "viewer" (không có permission "camera.manage" hoặc "camera.view")
  When người dùng cố gắng gọi PATCH /api/v1/cameras/:camId/alerts/ALERT-01
  Then hệ thống trả về 403 FORBIDDEN
```

---

### US-09 (FR-10) — Xem lại/đóng chính thức Sự cố từ UI
> **Với vai trò** Ban Chỉ huy,
> **tôi muốn** xem chi tiết đầy đủ 1 Sự cố (kèm timeline liên quan) và đóng chính thức từ giao diện,
> **để** không phải theo dõi qua Event gián tiếp.

```gherkin
Scenario: Xem chi tiết Sự cố kèm timeline
  Given tồn tại "incidents" id=INC-005 liên kết Event EVT-010
  When người dùng có quyền phù hợp mở màn hình chi tiết Sự cố INC-005
  Then hệ thống gọi GET /api/v1/incidents/INC-005
  And hiển thị đầy đủ thông tin sự cố + timeline các log liên quan tới EVT-010

Scenario: Đóng chính thức Sự cố từ UI (phụ thuộc US-02 đã triển khai)
  Given người dùng đủ quyền theo US-02 (là reported_by hoặc có permission activate)
  When người dùng nhập resolution và nhấn "Đóng sự cố" trên UI
  Then hệ thống gọi PATCH /api/v1/incidents/INC-005 {status:"resolved", resolution:"..."}
  And UI hiển thị trạng thái "Đã đóng" ngay lập tức
```

---

### US-10 (FR-11) — Xác nhận phạm vi permission quản trị & camera
> **Với vai trò** Ban Chỉ huy/HC-NS,
> **tôi muốn** có văn bản chính thức xác nhận việc quản trị hệ thống và camera an ninh chỉ dành cho Văn phòng Chủ tịch & IT,
> **để** tránh hiểu nhầm là "thiếu tính năng" cho các vai trò khác khi thực tế là chủ đích thiết kế.

*(Đây là US mang tính quy trình/xác nhận văn bản — không có Gherkin kỹ thuật; Acceptance Criteria là "có văn bản ký xác nhận", xem UAT tương ứng ở bước 10.)*

---

### US-11 (FR-12) — Ánh xạ chính thức 12 chức danh tổ chức ↔ 8 role kỹ thuật
> **Với vai trò** Trung tâm HC-NS,
> **tôi muốn** có bảng ánh xạ rõ ràng chức danh tổ chức nào tương ứng role kỹ thuật nào,
> **để** cấp quyền đúng cho nhân sự mới không cần suy đoán.

```gherkin
Scenario: Tạo user mới theo chức danh tổ chức có role mặc định gợi ý
  Given bảng resp_matrix đã có cột default_role_id được nghiệp vụ xác nhận (FR-12 đã triển khai)
  When quản trị viên tạo user mới thuộc chức danh tổ chức "Văn phòng Chủ tịch"
  Then hệ thống gợi ý role kỹ thuật mặc định tương ứng đã được xác nhận trong resp_matrix
  And quản trị viên vẫn có thể ghi đè role khác nếu thực tế yêu cầu khác gợi ý
```

---

### US-12 (FR-13) — Kiểm soát quyền kích hoạt cấp độ 3-4 theo thẩm quyền cụ thể
> **Với vai trò** Ban Chỉ huy,
> **tôi muốn** chỉ vai trò đại diện thẩm quyền Chủ tịch mới kích hoạt được cấp độ 3-4,
> **để** khớp đúng với Điều 20 QĐ.03 (Chủ tịch quyết định cấp ĐỎ/ĐẶC BIỆT).

```gherkin
Scenario: Role "bch" (không có activate.critical) không kích hoạt được cấp 4
  Given người dùng vai trò "bch" chỉ có permission "activate" (không có "activate.critical")
  When người dùng gửi POST /api/v1/events/activate {level:4}
  Then hệ thống trả về 403 FORBIDDEN (nếu FR-13 đã triển khai và chính sách yêu cầu permission riêng cho cấp cao)

Scenario: Role có permission activate.critical kích hoạt cấp 4 thành công
  Given người dùng có permission "activate.critical" (role được xác nhận đại diện thẩm quyền Chủ tịch)
  When người dùng gửi POST /api/v1/events/activate {level:4}
  Then hệ thống trả về 200, tạo Event cấp 4 thành công
```

---

### US-13 (FR-14) — Áp dụng ma trận LEVEL_PHASES khi sinh nhiệm vụ
```gherkin
Scenario: Task chỉ sinh theo phase hợp lệ của cấp độ kích hoạt
  Given task_template "TPL-099" có min_level=1 nhưng phase_id="R7" KHÔNG thuộc level_phases của level=1
  When hệ thống kích hoạt Event cấp độ 1
  Then task từ "TPL-099" KHÔNG được sinh ra (vì phase R7 không hợp lệ ở level 1)
  And chỉ các template có phase thuộc đúng level_phases[level=1] (DAILY, RP, RD, RA, T72) được sinh task
```

---

### US-14 (FR-15) — Loại bỏ giới hạn cứng 28 template/lần kích hoạt
```gherkin
Scenario: Kích hoạt cấp độ cao sinh đủ toàn bộ task hợp lệ, không bị cắt ở 28
  Given có 45 task_templates thỏa điều kiện min_level <= level (và phase hợp lệ nếu FR-14 đã áp dụng) cho level=3
  When hệ thống kích hoạt Event cấp độ 3
  Then có đủ 45 task được sinh ra, không bị giới hạn ở 28
```

---

### US-15 (FR-16) — Nhất quán quyền ack nhiệm vụ
```gherkin
# Phương án (a) — áp owner-only cho ack (nếu được chọn)
Scenario: Chỉ owner mới ack được nhiệm vụ của mình
  Given task TASK-01 có owner_id="user-X", status="issued"
  And người dùng hiện tại là "user-Y" (khác owner, không có permission activate)
  When "user-Y" gửi POST /events/:id/tasks/TASK-01/ack
  Then hệ thống trả về 403 FORBIDDEN (nếu phương án (a) được chọn)

# Phương án (b) — giữ ack mở cho mọi người (nếu được chọn thay thế)
Scenario: Bất kỳ user đã đăng nhập vẫn ack được thay người khác
  Given task TASK-01 có owner_id="user-X", status="issued"
  When "user-Y" (đã đăng nhập, không phải owner) gửi POST /events/:id/tasks/TASK-01/ack
  Then hệ thống trả về 200, task chuyển status="ack" (nếu phương án (b) được chọn — giữ nguyên hiện trạng)
```
**🔴 Lưu ý**: 2 scenario trên loại trừ nhau — chỉ 1 được triển khai theo quyết định nghiệp vụ (xem FR-16/BRQ-16).

---

### US-16 (FR-17) — Cảnh báo nhiệm vụ "mồ côi"
```gherkin
Scenario: Dashboard hiển thị số lượng task chưa có người nhận
  Given có 3 "tasks" với owner_id=NULL và status != "done"
  When Trưởng đơn vị mở dashboard
  Then hệ thống hiển thị cảnh báo "3 nhiệm vụ chưa có người nhận" kèm danh sách chi tiết
```

---

### US-17 (FR-18) — Rà soát quy tắc loại trừ hàng hỏng/hết hạn khỏi định mức kho
*(Chưa đủ AS-IS chi tiết để viết Gherkin cụ thể — cần khảo sát kỹ thuật bổ sung route `norms`/`pccc_inventory` trước, theo đúng giới hạn đã ghi ở SRS Phần 6. Acceptance Criteria tạm thời là "có báo cáo rà soát xác nhận có/không áp dụng đúng quy tắc".)*

---

### US-18 (FR-19) — Rà soát enforcement 7 permission chưa dùng
*(Tương tự US-17 — cần bảng rà soát riêng cho từng permission ở bước Backlog, chưa đủ cơ sở viết Gherkin chi tiết cho từng permission tại đây.)*

---

### US-19 (FR-20) — Kiểm soát nhiều Event active đồng thời
```gherkin
# Phương án (a) — chỉ 1 Event active toàn Group
Scenario: Từ chối kích hoạt Event mới khi đã có Event active khác
  Given đã tồn tại 1 "events" status="active"
  When người có quyền "activate" gửi POST /events/activate cho 1 sự kiện khác (không có flag "force")
  Then hệ thống trả về 409 CONFLICT (nếu phương án (a) được chọn)

# Phương án (b) — nhiều Event active theo site/unit độc lập
Scenario: Cho phép 2 Event active độc lập ở 2 site khác nhau
  Given "events" A đang active tại site "S1"
  When kích hoạt Event B tại site "S2" (khác S1)
  Then hệ thống cho phép tạo, cả 2 Event active đồng thời (nếu phương án (b) được chọn)
  And GET /events?active=true&site_id=S1 chỉ trả Event A, không lẫn Event B
```

---

## PHẦN 3 — GHI CHÚ VỀ CÁC BRQ CHƯA CÓ USE CASE (khoảng trống cần nghiệp vụ trả lời)

Theo đúng ghi nhận ở `SRS.md` Phần 5, **BRQ-06** (đồng bộ `relief_projects.status` ↔ `relief_approvals`) và **BRQ-14** (phạm vi tab "Cấu hình" Admin) chưa có FR tương ứng, do đó **cũng chưa thể viết Use Case/Gherkin cụ thể** — sẽ bổ sung Use Case cho 2 mục này ngay khi nghiệp vụ trả lời câu hỏi mở tương ứng đã nêu ở BRD Phần 5.

---

## PHẦN 4 — GIỚI HẠN CỦA TÀI LIỆU NÀY

- Các kịch bản Gherkin có ghi "(nếu phương án X được chọn)" mô tả **TO-BE có điều kiện** — chưa phải hành vi đã lập trình, phụ thuộc quyết định nghiệp vụ nêu tại BRD/SRS.
- US-17, US-18 chưa có Gherkin chi tiết do thiếu khảo sát AS-IS đủ sâu (đã ghi nhận là giới hạn từ GAP-ANALYSIS.md Phần D và SRS.md Phần 6) — không tự suy diễn thêm để tránh đưa thông tin không có bằng chứng.
- Danh sách 20 US ánh xạ đúng 1-1 với 20 FR của SRS (trừ FR-07/FR-07b được nhóm chung vào US-06) — bảo đảm truy vết FR↔US↔AC đầy đủ cho Ma trận truy vết ở bước tiếp theo.
