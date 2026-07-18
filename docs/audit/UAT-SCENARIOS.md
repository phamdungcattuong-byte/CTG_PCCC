# KỊCH BẢN UAT / NGHIỆM THU (USER ACCEPTANCE TEST)
## Hệ thống CTG Command Center — PCLB · PCCC · Cát Tường Group

**Ngày lập**: 2026-07-18
**Phiên bản**: 1.0
**Nguồn**: `USE-CASES.md` (UC-01..03, US-01..19, AC-xx.y) + `BRD.md` (BRQ-01..20) + `SRS.md` (FR-01..20) + `BACKLOG.md` (32 hạng mục) + `TRACEABILITY-MATRIX.md` (đặc biệt TG-06 — cột UAT còn trống, tài liệu này khép mắt xích đó).
**Quy ước nhãn**: 🟢 VERIFIED · 🟡 INFERRED · 🟠 ASSUMED.
**Trạng thái thực hiện**: Toàn bộ kịch bản dưới đây ở trạng thái 🔲 **CHƯA THỰC HIỆN** — vì các hạng mục P0 (ưu tiên tuyệt đối) vẫn đang chờ sign-off nghiệp vụ (xem `BACKLOG.md` P0-1/P0-4), và chưa có bất kỳ mã nguồn nào được sửa theo mandate "chỉ triển khai mã nguồn khi phát hiện lỗi thật". Tài liệu này đóng vai trò **kịch bản sẵn sàng chạy ngay khi từng hạng mục được triển khai xong**, không phải kết quả test đã chạy.

---

## PHẦN 0 — NGUYÊN TẮC & QUY ƯỚC KỊCH BẢN UAT

### 0.1. Hai loại kịch bản trong tài liệu này
Vì Backlog có 5 loại công việc khác nhau (`SIGN-OFF`/`BUG`/`FE-INTEGRATION`/`SCHEMA+LOGIC`/`SURVEY`), UAT cũng chia thành 2 loại tương ứng:

1. **UAT CHỨC NĂNG (Functional UAT)** — áp dụng cho các hạng mục `BUG`/`FE-INTEGRATION`/`SCHEMA+LOGIC`: kịch bản kiểm thử có bước thực hiện cụ thể, kết quả mong đợi rõ ràng, tiêu chí Pass/Fail đo được — chuyển thể trực tiếp từ Gherkin AC đã có ở `USE-CASES.md`.
2. **UAT XÁC NHẬN NGHIỆP VỤ (Sign-off Confirmation UAT)** — áp dụng cho các hạng mục `SIGN-OFF`: không phải kiểm thử phần mềm (chưa có gì để test), mà là **checklist xác nhận văn bản** — "đã có quyết định nghiệp vụ bằng văn bản, có người ký, có ngày ký" — vì đây là điều kiện *tiên quyết* trước khi bất kỳ mã nguồn nào được viết, đúng theo mandate.
3. Các hạng mục `SURVEY` có UAT riêng dạng "nghiệm thu báo cáo khảo sát" — xác nhận báo cáo khảo sát đã được đọc, đã đủ thông tin để ra quyết định tiếp theo (sign-off hoặc code).

### 0.2. Cấu trúc 1 kịch bản UAT chức năng
| Trường | Ý nghĩa |
|---|---|
| **Mã UAT** | `UAT-xx` — tham chiếu ngược `FR-xx`/`US-xx`/`AC-xx.y` |
| **Liên quan Backlog** | Mã hạng mục Backlog tương ứng (`P0-x`, `P1-x`...) |
| **Điều kiện tiên quyết** | Trạng thái dữ liệu/hệ thống cần có trước khi test |
| **Bước thực hiện** | Các bước người kiểm thử (hoặc script test) thực hiện |
| **Kết quả mong đợi** | Kết quả hệ thống phải trả về |
| **Tiêu chí Pass/Fail** | Điều kiện cụ thể để đánh giá đạt/không đạt |
| **Người nghiệm thu** | Vai trò/phòng ban chịu trách nhiệm ký xác nhận kết quả |
| **Trạng thái** | 🔲 Chưa thực hiện / ✅ Pass / ❌ Fail (cập nhật khi thực thi thật) |

### 0.3. Cấu trúc 1 checklist Sign-off Confirmation
| Trường | Ý nghĩa |
|---|---|
| **Mã** | `SOC-xx` (Sign-Off Confirmation) |
| **Nội dung cần xác nhận** | Câu hỏi nghiệp vụ cụ thể cần trả lời |
| **Phương án được chọn** | Để trống — điền khi có quyết định thật |
| **Người ký xác nhận** | Vai trò/chức danh có thẩm quyền quyết định |
| **Ngày ký** | Để trống — điền khi có |
| **Trạng thái** | 🔲 Chưa xin xác nhận |

---

## PHẦN 1 — UAT XÁC NHẬN NGHIỆP VỤ (SIGN-OFF CONFIRMATION) — 9 HẠNG MỤC

**🔴 Ưu tiên tuyệt đối**: 2 checklist đầu (SOC-01, SOC-04) tương ứng đúng 2 rủi ro P0 đã ghi nhận xuyên suốt toàn bộ chuỗi tài liệu (BR-10/11/12 và GAP-02) — nên xin xác nhận trước tất cả các checklist khác.

| Mã | Nội dung cần xác nhận | Backlog | Nguồn | Người ký xác nhận | Phương án được chọn | Ngày ký | Trạng thái |
|---|---|---|---|---|---|---|---|
| **SOC-01** | Chọn Phương án A (giữ tự động hóa, thêm permission `incident.report`/`activate` tại điểm vào) HAY Phương án B (tách báo cáo khỏi kích hoạt, route `escalate` riêng) cho việc tạo Sự cố khẩn cấp? | P0-1 | BRQ-01, BR-10/11, UC-01 | Ban Chỉ huy + IT | ☐ A ☐ B | — | 🔲 Chưa xin xác nhận |
| **SOC-02** | Ai được đóng Sự cố: chỉ `reported_by` ban đầu, HAY `reported_by` + role có permission `activate`/`incident.report`? | P0-3 (cùng buổi họp SOC-01) | BRQ-02, BR-12, UC-03 | Ban Chỉ huy | ☐ Chỉ reported_by ☐ reported_by + activate | — | 🔲 Chưa xin xác nhận |
| **SOC-03** | Có cần ép thứ tự tăng dần cấp độ khi kích hoạt Event (không cho nhảy thẳng từ cấp 0 lên cấp 4)? *(bổ sung theo TG-01 của Traceability Matrix)* | — *(gộp cùng SOC-01, chưa có mã Backlog riêng)* | BR-01 | Ban Chỉ huy | ☐ Có ☐ Không | — | 🔲 Chưa xin xác nhận |
| **SOC-04** | Giữ song song bảng `phonebook` D1 (87 dòng seed) HAY hợp nhất/thay thế hoàn toàn 172 số điện thoại cứng hiện có trong `ctg-data.js`? | P0-4 | BRQ-03, GAP-02 | IT/Chuyển đổi số + phụ trách bảo vệ dữ liệu cá nhân | ☐ Giữ song song, cần đồng bộ ☐ Hợp nhất 1 nguồn | — | 🔲 Chưa xin xác nhận |
| **SOC-05** | Có tự động đồng bộ `relief_projects.status` theo tiến độ 4/4 `relief_approvals`, hay giữ 2 trường độc lập như hiện tại? | P1-3 | BRQ-06, BR-13/14 | Trung tâm Pháp chế + Tài chính-Kế toán | ☐ Tự động đồng bộ ☐ Giữ độc lập | — | 🔲 Chưa xin xác nhận |
| **SOC-06** | Phạm vi permission `admin.manage`/`camera.view`/`camera.manage` chỉ dành `super` là chủ đích thiết kế, hay cần vai trò trung gian (VD: `it_admin`, `security_officer`)? | P1-5 | BRQ-09, BR-17 | Ban Chỉ huy + HC-NS | ☐ Giữ nguyên (chỉ super) ☐ Thêm vai trò trung gian | — | 🔲 Chưa xin xác nhận |
| **SOC-07** | Xác nhận bảng ánh xạ chính thức 12 chức danh tổ chức (`resp_matrix`) ↔ 8 role kỹ thuật hiện có — có cần thêm cột `default_role_id`? | P1-7 | BRQ-08, BR-19 | Trung tâm HC-NS + Ban Chỉ huy | ☐ Đồng ý bảng ánh xạ đề xuất ☐ Cần chỉnh sửa (ghi rõ) | — | 🔲 Chưa xin xác nhận |
| **SOC-08** | Có cần tách permission `activate.critical` riêng cho việc kích hoạt cấp độ 3-4 (thẩm quyền Chủ tịch theo Điều 20 QĐ.03), khác permission `activate` chung hiện tại? | P1-8 | BRQ-04, BR-02 | Ban Chỉ huy | ☐ Cần tách riêng ☐ Giữ chung `activate` | — | 🔲 Chưa xin xác nhận |
| **SOC-09** | Phạm vi dự kiến của tab "Cấu hình" trong Admin UI hiện chưa có backend — cần xây dựng đúng phạm vi gì (hoặc xác nhận không cần xây, chỉ là placeholder)? | P2-6 | BRQ-14, GAP-07 | Ban Chỉ huy + IT | ☐ Cần xây (ghi rõ phạm vi) ☐ Không cần, xóa khỏi UI | — | 🔲 Chưa xin xác nhận |
| **SOC-10** | Có nên áp owner-only cho hành động `ack` nhiệm vụ (đồng bộ với `done` đã owner-only), hay giữ `ack` mở cho mọi người đã đăng nhập như hiện tại? | P3-4 | BRQ-16, BR-08/09, US-15 | Trưởng đơn vị + Ban Chỉ huy | ☐ Áp owner-only ☐ Giữ mở | — | 🔲 Chưa xin xác nhận |
| **SOC-11** | Có nên ràng buộc sinh task tự động đúng theo ma trận `level_phases` (43 dòng hiện có nhưng chưa được dùng để lọc)? | P3-1 | BRQ-17, BR-03, US-13 | Ban Chỉ huy + IT | ☐ Áp dụng ràng buộc ☐ Giữ hành vi hiện tại | — | 🔲 Chưa xin xác nhận |
| **SOC-12** | Chính sách 1 Event active duy nhất toàn Group, HAY cho phép nhiều Event active độc lập theo site/đơn vị? | P3-8 | BRQ-20, BR-05, US-19 | Ban Chỉ huy | ☐ 1 Event active toàn Group ☐ Nhiều Event theo site | — | 🔲 Chưa xin xác nhận |

**Ghi chú quy trình 🟡**: SOC-01/02/03 nên gộp thành 1 buổi họp (cùng chủ đề Sự cố/Event); SOC-04 độc lập, có thể xin xác nhận song song (đã ghi trong `BACKLOG.md` phần "Ghi chú P0"); SOC-05 đến SOC-12 có thể gộp vào 1 buổi họp rà soát nghiệp vụ chung do mức độ khẩn cấp thấp hơn P0.

---

## PHẦN 2 — UAT CHỨC NĂNG THEO TỪNG FR (chạy sau khi mã nguồn được triển khai)

### Nhóm A — Kiểm soát phân quyền Sự cố (P0, phụ thuộc SOC-01/02/03)

**UAT-01** — *Từ chối tạo Sự cố khi thiếu quyền (nếu chọn Phương án A ở SOC-01)*
- **Liên quan**: P0-2 · FR-01 · US-01/AC-01.1
- **Điều kiện tiên quyết**: SOC-01 đã chọn Phương án A và đã triển khai; có user test vai trò `viewer` (chỉ permission `view.public`).
- **Bước thực hiện**: Đăng nhập vai trò `viewer` → gọi `POST /api/v1/incidents` với loại "fire" + mô tả hợp lệ.
- **Kết quả mong đợi**: HTTP 403, envelope `{ok:false,error:{code:'FORBIDDEN',...}}`; không có bản ghi `incidents`/`Event` mới nào trong D1.
- **Tiêu chí Pass/Fail**: Pass nếu đúng cả 403 và không có bản ghi rác; Fail nếu tạo được bản ghi hoặc trả sai mã lỗi.
- **Người nghiệm thu**: IT (kỹ thuật) + Ban Chỉ huy (xác nhận đúng ý định nghiệp vụ).
- **Trạng thái**: 🔲 Chưa thực hiện.

**UAT-02** — *Tạo Sự cố thành công khi đủ quyền (Phương án A)*
- **Liên quan**: P0-2 · FR-01 · US-01/AC-01.2
- **Điều kiện tiên quyết**: Như UAT-01, user vai trò `bch` (permission `activate`).
- **Bước thực hiện**: Đăng nhập `bch` → `POST /api/v1/incidents` loại "fire" hợp lệ.
- **Kết quả mong đợi**: HTTP 200; 1 `incidents` mới `status='open'`; 1 `Event` mới `level=3` liên kết đúng `incidents.event_id`.
- **Tiêu chí Pass/Fail**: Pass nếu cả 2 bản ghi tạo đúng và liên kết đúng ID.
- **Người nghiệm thu**: IT + Ban Chỉ huy.
- **Trạng thái**: 🔲 Chưa thực hiện.

**UAT-03** — *Báo cáo mở cho mọi người, kích hoạt riêng cần quyền (nếu chọn Phương án B ở SOC-01 — LOẠI TRỪ với UAT-01/02)*
- **Liên quan**: P0-2 · FR-02 · US-01/AC-01.3
- **Điều kiện tiên quyết**: SOC-01 chọn Phương án B; user vai trò bất kỳ (kể cả `viewer`).
- **Bước thực hiện**: (a) Đăng nhập bất kỳ vai trò → `POST /api/v1/incidents` → kỳ vọng 200, `event_id=null`. (b) Đăng nhập `unit_head` (không có `activate`) → `POST /incidents/:id/escalate {level:3}` → kỳ vọng 403. (c) Đăng nhập `bch` → cùng request escalate → kỳ vọng 200, `event_id` được gán.
- **Kết quả mong đợi**: Đúng cả 3 kết quả (a)/(b)/(c) như mô tả.
- **Tiêu chí Pass/Fail**: Pass nếu cả 3 bước đều đúng; Fail nếu 1 trong 3 sai.
- **Người nghiệm thu**: IT + Ban Chỉ huy.
- **Trạng thái**: 🔲 Chưa thực hiện.

**UAT-04** — *Kiểm soát ai được đóng Sự cố (theo SOC-02)*
- **Liên quan**: P0-3 · FR-03 · US-02/AC-02.1-02.3
- **Điều kiện tiên quyết**: Tồn tại `incidents` `status='open'`, `reported_by='user-A'`.
- **Bước thực hiện**: (a) `user-B` (không phải reported_by, không có permission) gửi `PATCH .../incidents/:id {status:'resolved'}` → kỳ vọng 403. (b) `user-A` (chính chủ) gửi cùng request → kỳ vọng 200. (c) Vai trò `bch` gửi cho sự cố của người khác → kỳ vọng 200 (theo quyết định SOC-02).
- **Kết quả mong đợi**: Đúng cả 3 kết quả tương ứng quyết định SOC-02 đã chọn.
- **Tiêu chí Pass/Fail**: Pass nếu khớp đúng quyết định nghiệp vụ đã ký ở SOC-02 (không phải khớp với 1 phương án cố định trước).
- **Người nghiệm thu**: IT + Ban Chỉ huy.
- **Trạng thái**: 🔲 Chưa thực hiện.

### Nhóm B — Bảo vệ PII danh bạ (P0, phụ thuộc SOC-04)

**UAT-05** — *Không còn PII trong file tĩnh công khai*
- **Liên quan**: P0-5 · FR-04 · US-03/AC-03.1
- **Điều kiện tiên quyết**: FR-04 đã triển khai theo quyết định SOC-04.
- **Bước thực hiện**: Trình duyệt KHÔNG có cookie `ctg_token` tải `GET /static/assets/ctg-data.js`, kiểm tra nội dung trả về.
- **Kết quả mong đợi**: Nội dung file KHÔNG chứa bất kỳ số điện thoại 10 số nào ở dạng `window.PHONEBOOK`.
- **Tiêu chí Pass/Fail**: Pass nếu quét toàn bộ nội dung file bằng regex số điện thoại không tìm thấy kết quả nào.
- **Người nghiệm thu**: IT/Chuyển đổi số (kỹ thuật) + phụ trách bảo vệ dữ liệu cá nhân (xác nhận tuân thủ).
- **Trạng thái**: 🔲 Chưa thực hiện.

**UAT-06** — *API danh bạ yêu cầu xác thực*
- **Liên quan**: P0-5 · FR-04 · US-03/AC-03.2
- **Bước thực hiện**: Gọi `GET /api/v1/phonebook` KHÔNG có cookie `ctg_token`.
- **Kết quả mong đợi**: HTTP 401 UNAUTHORIZED.
- **Tiêu chí Pass/Fail**: Pass nếu đúng 401, không trả bất kỳ dữ liệu danh bạ nào trong body lỗi.
- **Người nghiệm thu**: IT.
- **Trạng thái**: 🔲 Chưa thực hiện.

**UAT-07** — *API danh bạ trả dữ liệu đúng cho user đã đăng nhập*
- **Liên quan**: P0-5 · FR-04 · US-03/AC-03.3
- **Bước thực hiện**: Đăng nhập hợp lệ (bất kỳ vai trò) → `GET /api/v1/phonebook`.
- **Kết quả mong đợi**: HTTP 200; số lượng/nội dung liên hệ khớp đúng với nguồn dữ liệu đã xác nhận ở SOC-04 (87 dòng seed hoặc 172 dòng đã hợp nhất — theo quyết định thật).
- **Tiêu chí Pass/Fail**: Pass nếu số lượng và nội dung khớp 100% với nguồn đã xác nhận, không thiếu/thừa liên hệ nào.
- **Người nghiệm thu**: Văn phòng Chủ tịch (xác nhận danh bạ đủ/đúng thực tế vận hành) + IT.
- **Trạng thái**: 🔲 Chưa thực hiện.

### Nhóm C — Module Cứu trợ (P1)

**UAT-08** — *Danh sách hộ thụ hưởng hiển thị dữ liệu thật, không còn dữ liệu giả*
- **Liên quan**: P1-2 · FR-06 · US-05/AC-05.1
- **Điều kiện tiên quyết**: Dự án "CTR-2024-YAGI" có 5 hộ thụ hưởng thật trong `relief_beneficiaries`.
- **Bước thực hiện**: Trưởng đoàn cứu trợ mở tab "Đối tượng thụ hưởng" của dự án này.
- **Kết quả mong đợi**: Gọi đúng `GET /api/v1/relief-projects/:id/beneficiaries`; hiển thị đúng 5 hộ với dữ liệu thật; hàm `sampleHouseholds()` không còn tồn tại trong mã nguồn production (kiểm tra bằng grep code).
- **Tiêu chí Pass/Fail**: Pass nếu cả UI đúng dữ liệu thật VÀ grep xác nhận không còn `sampleHouseholds` trong `dist/`.
- **Người nghiệm thu**: Trưởng đoàn cứu trợ (nghiệp vụ) + IT (kỹ thuật, đảm bảo tuân thủ Điều cấm QĐ.03 #6).
- **Trạng thái**: 🔲 Chưa thực hiện.

**UAT-09** — *Xác nhận đã trao cứu trợ (ký/ảnh) cho 1 hộ*
- **Liên quan**: P1-2 · FR-06 · US-05/AC-05.2
- **Bước thực hiện**: Hộ "HGD-003" đang `pending` → Trưởng đoàn upload ảnh xác nhận, đánh dấu "Đã trao".
- **Kết quả mong đợi**: `PATCH .../beneficiaries/HGD-003 {status:'delivered', photo_url, signed_at}` trả 200; UI hiển thị "✓ Đã trao" kèm ảnh.
- **Tiêu chí Pass/Fail**: Pass nếu trạng thái + ảnh được lưu đúng và hiển thị đúng ngay không cần tải lại trang.
- **Người nghiệm thu**: Trưởng đoàn cứu trợ + Kiểm soát nội bộ (xác nhận có dấu vết xác nhận vật lý).
- **Trạng thái**: 🔲 Chưa thực hiện.

**UAT-10** — *Nối các hành động ghi còn lại của module Cứu trợ (team/vehicles/cargo/itinerary/logs)*
- **Liên quan**: P1-1 · FR-06 (phần chung) · US-05
- **Bước thực hiện**: Với mỗi sub-resource (team, vehicles, cargo, itinerary, logs), thực hiện 1 hành động ghi (thêm/sửa) trên UI, sau đó tải lại trang (F5).
- **Kết quả mong đợi**: Mỗi thay đổi gọi đúng route API tương ứng, trả 200, và dữ liệu vẫn còn sau khi tải lại trang (không bị mất do chỉ lưu state client-side).
- **Tiêu chí Pass/Fail**: Pass khi TẤT CẢ sub-resource đều persist qua reload; Fail nếu còn bất kỳ sub-resource nào chỉ lưu tạm ở client.
- **Người nghiệm thu**: Trưởng đoàn cứu trợ + IT.
- **Trạng thái**: 🔲 Chưa thực hiện.

**UAT-11** — *Validate enum trạng thái dự án cứu trợ và quyết định phê duyệt*
- **Liên quan**: P2-4, P2-5 · FR-07/FR-07b · US-06/AC-06.1-06.3
- **Bước thực hiện**: (a) `PATCH /relief-projects/:id {status:'khong_hop_le_123'}` → kỳ vọng 400 `INVALID_STATUS`. (b) `PATCH ... {status:'in-progress'}` → kỳ vọng 200. (c) `POST .../approvals/ct {decision:'aproved'}` (sai chính tả) → kỳ vọng 400 `INVALID_DECISION`.
- **Kết quả mong đợi**: Đúng cả 3 kết quả; không có giá trị rác nào được ghi vào D1 ở (a)/(c).
- **Tiêu chí Pass/Fail**: Pass nếu cả 3 đúng.
- **Người nghiệm thu**: IT.
- **Trạng thái**: 🔲 Chưa thực hiện.

**UAT-12** — *Giữ lịch sử đầy đủ khi thay đổi quyết định phê duyệt*
- **Liên quan**: P1-4 · FR-08 · US-07/AC-07.1-07.2
- **Bước thực hiện**: Vai trò `phapche` gửi `decision:'rejected'` rồi sau đó `decision:'approved'` cho cùng 1 dự án; sau đó gọi `GET .../approvals/phapche/history`.
- **Kết quả mong đợi**: `relief_approvals` hiện tại có `approved` (mới nhất); `history` trả đủ 2 dòng (rejected trước, approved sau), mỗi dòng có `changed_by`, `changed_at`, `decision`, `note`.
- **Tiêu chí Pass/Fail**: Pass nếu không mất dòng lịch sử nào và đủ 4 trường truy vết.
- **Người nghiệm thu**: Kiểm soát nội bộ (xác nhận tuân thủ Điều cấm QĐ.03 #4 — không sửa số liệu không dấu vết).
- **Trạng thái**: 🔲 Chưa thực hiện.

### Nhóm D — Admin, Camera, Sự cố UI (P2)

**UAT-13** — *Kết nối 4 tab Admin với API thật*
- **Liên quan**: P2-1 · FR-05 · US-04/AC-04.1-04.3
- **Bước thực hiện**: (a) Vai trò `super` thêm đơn vị mới ở tab "Đơn vị & Cơ sở", tải lại trang. (b) Sửa 1 nhiệm vụ mẫu, tải lại trang. (c) Vai trò `unit_head` (không có `admin.manage`) thử sửa Kịch bản.
- **Kết quả mong đợi**: (a)/(b) persist đúng qua reload; (c) trả 403.
- **Tiêu chí Pass/Fail**: Pass nếu cả 3 đúng cho cả 4 tab (Đơn vị/Nhiệm vụ mẫu/Kịch bản/Định mức).
- **Người nghiệm thu**: Ban Chỉ huy (super-admin) + IT.
- **Trạng thái**: 🔲 Chưa thực hiện.

**UAT-14** — *Đánh dấu cảnh báo camera đã xử lý từ UI*
- **Liên quan**: P2-2 · FR-09 · US-08/AC-08.1-08.2
- **Bước thực hiện**: (a) User có `camera.manage` nhấn "Đánh dấu đã xử lý" trên 1 cảnh báo `open`. (b) User vai trò `viewer` thử cùng hành động.
- **Kết quả mong đợi**: (a) status chuyển `resolved`, ghi `resolved_at`/`resolved_by`, UI cập nhật ngay không cần F5; (b) trả 403.
- **Tiêu chí Pass/Fail**: Pass nếu cả 2 đúng.
- **Người nghiệm thu**: Tổ An toàn-Bảo vệ + IT.
- **Trạng thái**: 🔲 Chưa thực hiện.

**UAT-15** — *Xem chi tiết/đóng chính thức Sự cố từ UI (phụ thuộc UAT-04 đã Pass)*
- **Liên quan**: P2-3 · FR-10 · US-09
- **Điều kiện tiên quyết**: UAT-04 (kiểm soát quyền đóng Sự cố) đã Pass.
- **Bước thực hiện**: Mở chi tiết Sự cố kèm timeline; nhập `resolution`, nhấn "Đóng sự cố".
- **Kết quả mong đợi**: Hiển thị đủ thông tin + timeline liên quan Event; sau khi đóng, UI hiển thị "Đã đóng" ngay.
- **Tiêu chí Pass/Fail**: Pass nếu UI phản ánh đúng trạng thái backend không cần F5.
- **Người nghiệm thu**: Ban Chỉ huy.
- **Trạng thái**: 🔲 Chưa thực hiện.

### Nhóm E — Mô hình hóa/RBAC sâu hơn (P1/P3, phụ thuộc các SOC tương ứng)

**UAT-16** — *Ánh xạ 12 chức danh tổ chức ↔ 8 role kỹ thuật có gợi ý mặc định (theo SOC-07)*
- **Liên quan**: P1-7 · FR-12 · US-11
- **Bước thực hiện**: Tạo user mới thuộc chức danh tổ chức "Văn phòng Chủ tịch".
- **Kết quả mong đợi**: Hệ thống gợi ý role kỹ thuật mặc định đã xác nhận trong `resp_matrix.default_role_id`; quản trị viên vẫn ghi đè được nếu cần.
- **Tiêu chí Pass/Fail**: Pass nếu gợi ý đúng theo bảng ánh xạ đã ký ở SOC-07.
- **Người nghiệm thu**: Trung tâm HC-NS.
- **Trạng thái**: 🔲 Chưa thực hiện.

**UAT-17** — *Kiểm soát quyền kích hoạt cấp độ 3-4 (theo SOC-08, nếu chọn tách riêng)*
- **Liên quan**: P1-9 · FR-13 · US-12
- **Bước thực hiện**: (a) Vai trò `bch` (không có `activate.critical`) gửi `POST /events/activate {level:4}`. (b) Vai trò có `activate.critical` gửi cùng request.
- **Kết quả mong đợi**: (a) 403 nếu SOC-08 chọn "cần tách riêng"; (b) 200, tạo Event cấp 4.
- **Tiêu chí Pass/Fail**: Pass nếu khớp đúng quyết định SOC-08 đã ký.
- **Người nghiệm thu**: Ban Chỉ huy.
- **Trạng thái**: 🔲 Chưa thực hiện.

**UAT-18** — *Áp dụng ma trận `level_phases` khi sinh task (theo SOC-11, nếu chọn áp dụng)*
- **Liên quan**: P3-2 · FR-14 · US-13
- **Bước thực hiện**: Kích hoạt Event cấp độ 1 với `task_template` có `phase_id` KHÔNG thuộc `level_phases[level=1]`.
- **Kết quả mong đợi**: Task từ template đó KHÔNG được sinh ra; chỉ template có phase hợp lệ được sinh.
- **Tiêu chí Pass/Fail**: Pass nếu đúng hành vi lọc theo SOC-11.
- **Người nghiệm thu**: Ban Chỉ huy + IT.
- **Trạng thái**: 🔲 Chưa thực hiện.

**UAT-19** — *Loại bỏ giới hạn cứng 28 template/lần kích hoạt*
- **Liên quan**: P3-3 · FR-15 · US-14
- **Bước thực hiện**: Thiết lập 45 `task_templates` thỏa điều kiện cho level=3; kích hoạt Event cấp 3.
- **Kết quả mong đợi**: Sinh đủ 45 task, không bị cắt ở 28.
- **Tiêu chí Pass/Fail**: Pass nếu đủ số lượng VÀ hiệu năng D1 vẫn trong giới hạn CPU time cho phép (10-30ms/request theo giới hạn Cloudflare Workers).
- **Người nghiệm thu**: IT (kỹ thuật, đặc biệt kiểm tra hiệu năng).
- **Trạng thái**: 🔲 Chưa thực hiện.

**UAT-20** — *Nhất quán quyền `ack` nhiệm vụ (theo SOC-10)*
- **Liên quan**: P3-5 · FR-16 · US-15
- **Bước thực hiện**: Theo đúng phương án đã chọn ở SOC-10 — (a) nếu owner-only: `user-Y` (không phải owner) gửi `ack` → kỳ vọng 403; (b) nếu giữ mở: cùng request → kỳ vọng 200.
- **Kết quả mong đợi**: Khớp đúng quyết định SOC-10.
- **Tiêu chí Pass/Fail**: Pass nếu khớp đúng quyết định đã ký.
- **Người nghiệm thu**: Trưởng đơn vị + Ban Chỉ huy.
- **Trạng thái**: 🔲 Chưa thực hiện.

**UAT-21** — *Cảnh báo nhiệm vụ "mồ côi" trên dashboard*
- **Liên quan**: P3-6 · FR-17 · US-16
- **Bước thực hiện**: Tạo 3 `tasks` với `owner_id=NULL`, `status != 'done'`; mở dashboard.
- **Kết quả mong đợi**: Hiển thị cảnh báo "3 nhiệm vụ chưa có người nhận" kèm danh sách.
- **Tiêu chí Pass/Fail**: Pass nếu số lượng và danh sách đúng, cập nhật real-time (hoặc mỗi lần tải dashboard).
- **Người nghiệm thu**: Trưởng đơn vị.
- **Trạng thái**: 🔲 Chưa thực hiện.

**UAT-22** — *Kiểm soát nhiều Event active đồng thời (theo SOC-12)*
- **Liên quan**: P3-9 · FR-20 · US-19
- **Bước thực hiện**: Theo phương án đã chọn ở SOC-12 — (a) nếu 1 Event toàn Group: kích hoạt Event thứ 2 khi đã có Event active → kỳ vọng 409; (b) nếu nhiều theo site: kích hoạt 2 Event ở 2 site khác nhau → kỳ vọng cả 2 cùng active, filter theo `site_id` đúng.
- **Kết quả mong đợi**: Khớp đúng quyết định SOC-12.
- **Tiêu chí Pass/Fail**: Pass nếu khớp đúng quyết định đã ký.
- **Người nghiệm thu**: Ban Chỉ huy.
- **Trạng thái**: 🔲 Chưa thực hiện.

---

## PHẦN 3 — UAT NGHIỆM THU BÁO CÁO KHẢO SÁT (SURVEY) — 3 HẠNG MỤC

*(Đây không phải test phần mềm — là nghiệm thu tài liệu khảo sát, xác nhận đủ thông tin để ra quyết định tiếp theo (sign-off hoặc code) mà KHÔNG suy diễn thêm khi thiếu bằng chứng, đúng mandate #7.)*

| Mã | Liên quan Backlog | Nội dung nghiệm thu | Tiêu chí Pass/Fail | Người nghiệm thu | Trạng thái |
|---|---|---|---|---|---|
| **SUV-01** | P2-8 · BR-20/21 · US-17 | Báo cáo rà soát route `norms`/`pccc_inventory` có/không áp dụng đúng quy tắc loại trừ hàng hỏng/hết hạn khỏi định mức kho | Pass nếu báo cáo có trích dẫn file:line cụ thể (không chỉ nhận định chung), và kết luận rõ "đã đúng" hoặc "cần sửa kèm đề xuất" | Trung tâm Pháp chế + Tài chính-Kế toán | 🔲 Chưa thực hiện |
| **SUV-02** | P3-7 · BR-18 · US-18 | Báo cáo rà soát 7 permission seed sẵn chưa route nào kiểm tra — kết luận từng permission "cần enforcement" hay "cố ý dự phòng, chưa cần" | Pass nếu có bảng kết luận riêng cho từng permission trong số 7 permission, không gộp chung 1 câu trả lời | IT | 🔲 Chưa thực hiện |
| **SUV-03** | *(ẩn trong P2-7, phụ thuộc SOC-09)* | Khảo sát route + schema cần thiết cho tab "Cấu hình" NẾU SOC-09 xác nhận cần xây | Pass nếu đề xuất route/schema cụ thể, có thể ước lượng effort sau khi đọc | IT | 🔲 Chưa thực hiện (phụ thuộc SOC-09) |

---

## PHẦN 4 — MA TRẬN UAT ↔ BACKLOG (khép mắt xích TG-06 của Traceability Matrix)

| Backlog | UAT/SOC/SUV tương ứng |
|---|---|
| S0-1 | *(đã Pass trước khi có UAT chính thức — xác nhận bằng build+test thủ công tại thời điểm sửa, commit `4018911`)* |
| P0-1 | SOC-01, SOC-03 |
| P0-2 | UAT-01, UAT-02 (Phương án A) HOẶC UAT-03 (Phương án B) |
| P0-3 | SOC-02 → UAT-04 |
| P0-4 | SOC-04 |
| P0-5 | UAT-05, UAT-06, UAT-07 |
| P1-1 | UAT-10 |
| P1-2 | UAT-08, UAT-09 |
| P1-3 | SOC-05 |
| P1-4 | UAT-12 |
| P1-5 | SOC-06 |
| P1-6 | *(chưa có UAT — chỉ tồn tại nếu SOC-06 xác nhận cần vai trò trung gian; sẽ bổ sung UAT khi đó)* |
| P1-7 | SOC-07 → UAT-16 |
| P1-8 | SOC-08 |
| P1-9 | UAT-17 |
| P2-1 | UAT-13 |
| P2-2 | UAT-14 |
| P2-3 | UAT-15 |
| P2-4, P2-5 | UAT-11 |
| P2-6 | SOC-09 |
| P2-7 | SUV-03 *(sau đó UAT riêng khi phạm vi được xác nhận — chưa tồn tại)* |
| P2-8 | SUV-01 |
| P3-1 | SOC-11 |
| P3-2 | UAT-18 |
| P3-3 | UAT-19 |
| P3-4 | SOC-10 |
| P3-5 | UAT-20 |
| P3-6 | UAT-21 |
| P3-7 | SUV-02 |
| P3-8 | SOC-12 |
| P3-9 | UAT-22 |

**Kết luận Phần 4**: 32/32 hạng mục Backlog đều có ít nhất 1 mã UAT/SOC/SUV tương ứng (kể cả các hạng mục có kết quả UAT "còn phụ thuộc quyết định trước" thì cũng đã được gắn mã, không bỏ trống hoàn toàn) — **trừ P1-6 và phần UAT chi tiết của P2-7**, hai mục này CHỦ ĐÍCH chưa có UAT chi tiết vì bản thân hạng mục code còn chưa xác định có tồn tại hay không (phụ thuộc SOC-06/SOC-09) — ghi nhận minh bạch, không suy diễn.

---

## PHẦN 5 — QUY TRÌNH THỰC THI UAT (đề xuất)

1. **Bước 1 — Sign-off**: Tổ chức họp/văn bản cho toàn bộ 12 checklist SOC (Phần 1) theo lộ trình Sprint đã đề xuất ở `BACKLOG.md`.
2. **Bước 2 — Triển khai mã nguồn**: Chỉ sau khi có SOC tương ứng đã ký (hoặc với các hạng mục không cần sign-off), lập trình viên triển khai theo đúng FR đã đặc tả.
3. **Bước 3 — Chạy UAT**: QA/IT chạy từng kịch bản UAT chức năng (Phần 2) tương ứng, cập nhật cột "Trạng thái" thành ✅ Pass / ❌ Fail.
4. **Bước 4 — Nghiệm thu nghiệp vụ**: Người nghiệm thu (cột "Người nghiệm thu" trong từng UAT) xác nhận kết quả Pass phản ánh đúng ý định nghiệp vụ (không chỉ đúng kỹ thuật) — ký xác nhận.
5. **Bước 5 — Cập nhật Traceability Matrix**: Điền cột "UAT" còn trống ở `TRACEABILITY-MATRIX.md` Phần 1 bằng mã UAT/SOC/SUV tương ứng (xem Phần 4 của tài liệu này) — khép mắt xích TG-06.
6. **Bước 6 — Go-live có kiểm soát**: Chỉ merge/deploy các thay đổi đã Pass UAT VÀ có sign-off đầy đủ (nếu thuộc loại cần sign-off) — không deploy hạng mục nào chưa qua đủ 2 điều kiện này.

---

## PHẦN 6 — GIỚI HẠN CỦA TÀI LIỆU NÀY

- **Chưa có kịch bản nào được thực thi thật** — toàn bộ Phần 2/3 ở trạng thái 🔲 vì chưa có sign-off (Phần 1) và chưa có mã nguồn nào được sửa theo các FR liên quan, đúng mandate "chỉ triển khai mã nguồn khi phát hiện lỗi thật" — các GAP/BR còn lại là phát hiện cần quyết định nghiệp vụ, KHÔNG phải bug hiển nhiên như GAP-01.
- Các kịch bản có ghi "(theo SOC-xx)" mô tả **UAT có điều kiện, phụ thuộc kết quả sign-off chưa xảy ra** — Pass/Fail sẽ được đánh giá dựa trên quyết định thật đã ký, KHÔNG theo 1 phương án cố định định trước trong tài liệu này.
- P1-6 và phần chi tiết của P2-7 CHƯA có UAT vì hạng mục code bản thân còn chưa được xác nhận có tồn tại — sẽ bổ sung UAT tương ứng ngay khi SOC-06/SOC-09 có kết quả.
- Tài liệu này KHÔNG thay thế cho kiểm thử tự động (unit/integration test) — là lớp nghiệm thu nghiệp vụ cuối cùng, thực hiện SAU KHI kiểm thử kỹ thuật đã Pass ở môi trường dev/staging.
