# BACKLOG ƯU TIÊN HÓA
## Hệ thống CTG Command Center — PCLB · PCCC · Cát Tường Group

**Ngày lập**: 2026-07-18
**Phiên bản**: 1.0
**Nguồn**: `BRD.md` (20 BRQ) → `SRS.md` (20 FR) → `USE-CASES.md` (19 US, Gherkin AC).
**Quy ước nhãn**: 🟢 VERIFIED · 🟡 INFERRED · 🟠 ASSUMED.
**Nguyên tắc sắp xếp**: Ưu tiên theo **mức độ nghiêm trọng nghiệp vụ/tuân thủ** (không chỉ độ khó kỹ thuật) — một hạng mục "dễ sửa về code" nhưng "cần quyết định nghiệp vụ trước" vẫn được xếp priority cao nếu rủi ro bỏ mặc là lớn, vì bước kế tiếp (xin xác nhận) có thể bắt đầu ngay dù chưa code.

**Cột "Loại"**: `BUG` (lỗi kỹ thuật thuần, không cần quyết định nghiệp vụ) · `SIGN-OFF` (cần văn bản xác nhận nghiệp vụ TRƯỚC KHI code) · `FE-INTEGRATION` (backend đã có, chỉ cần nối frontend) · `SCHEMA+LOGIC` (cần thêm bảng/cột + logic, không cần quyết định nghiệp vụ lớn) · `SURVEY` (cần khảo sát AS-IS bổ sung trước khi ước lượng).

---

## SPRINT 0 (ĐÃ HOÀN THÀNH TRƯỚC BACKLOG NÀY)

| # | Hạng mục | Nguồn | Trạng thái |
|---|---|---|---|
| S0-1 | Sửa `mapReliefProject()` sai tên trường dữ liệu | GAP-01 | ✅ Đã sửa, build, test, commit `4018911`, đã push |

---

## P0 — KHẨN CẤP (rủi ro an ninh/tuân thủ cao nhất — xử lý ngay, bắt đầu bằng xin xác nhận nghiệp vụ)

| # | Hạng mục | Nguồn (BRQ/FR/US) | Loại | Effort ước tính | Điều kiện bắt đầu |
|---|---|---|---|---|---|
| **P0-1** | **Xin xác nhận văn bản: phương án kiểm soát quyền tạo/kích hoạt Sự cố khẩn cấp** (giữ nguyên tự động hóa + thêm permission, HAY tách rời báo cáo/kích hoạt) | BRQ-01, FR-01/FR-02, US-01/UC-01 | SIGN-OFF | 0 (chỉ là 1 cuộc họp/văn bản — có thể bắt đầu ngay hôm nay) | Không có — bắt đầu ngay |
| **P0-2** | Triển khai kiểm soát quyền `POST /incidents` theo phương án đã chọn ở P0-1 | FR-01/FR-02 | BUG (sau khi có sign-off) | Thấp (1 middleware + có thể 1 route mới `escalate`) | Phải có kết quả P0-1 |
| **P0-3** | Triển khai kiểm soát quyền `PATCH /incidents/:id` (đóng sự cố) | BRQ-02, FR-03, US-02/UC-03 | BUG (sau sign-off) | Thấp | Phải có kết quả P0-1 (thường cùng 1 quyết định) |
| **P0-4** | Xin xác nhận: giữ song song bảng `phonebook` D1 hay hợp nhất nguồn dữ liệu 172 dòng cứng hiện có | BRQ-03 | SIGN-OFF | 0 | Không có — bắt đầu ngay |
| **P0-5** | Xóa `window.PHONEBOOK` khỏi `ctg-data.js`; thêm route `GET /api/v1/phonebook` (requireAuth); override `renderForce()` gọi API thật | FR-04, US-03 | BUG (sau khi có kết quả P0-4 về nguồn dữ liệu) | Trung bình | Phải có kết quả P0-4 |

**Ghi chú P0**: 2 nhóm hạng mục (Incident, PII) có thể xin xác nhận **song song, không phụ thuộc lẫn nhau** — không cần chờ nhóm này xong mới hỏi nhóm kia. Đây là 2 rủi ro độc lập.

---

## P1 — CAO (ảnh hưởng nghiệp vụ lõi, cần xác nhận nghiệp vụ hoặc là tính năng lõi còn thiếu)

| # | Hạng mục | Nguồn | Loại | Effort ước tính | Điều kiện bắt đầu |
|---|---|---|---|---|---|
| **P1-1** | Hoàn thiện module Cứu trợ: nối toàn bộ hành động ghi (team/vehicles/cargo/itinerary/logs) vào API thật | BRQ-05, FR-06 (phần chung), US-05 | FE-INTEGRATION | Cao (nhiều sub-resource, ~7-10 override function) | Không có — có thể bắt đầu ngay, backend đã sẵn |
| **P1-2** | **Ưu tiên trong P1-1**: thay `sampleHouseholds()` giả bằng dữ liệu thật `relief_beneficiaries` (bao gồm ký/ảnh xác nhận) | BRQ-05, FR-06 (phần beneficiaries), US-05, Điều cấm QĐ.03 #6 | FE-INTEGRATION | Trung bình | Không có — nên làm TRƯỚC các sub-resource khác trong P1-1 vì liên quan trực tiếp tuân thủ |
| **P1-3** | Xin xác nhận: có nên tự động đồng bộ `relief_projects.status` với tiến độ 4/4 `relief_approvals`? (BRQ-06 — hiện chưa có FR vì thiếu câu trả lời) | BRQ-06, BR-13/BR-14 | SIGN-OFF | 0 | Không có — bắt đầu ngay |
| **P1-4** | Giữ lịch sử đầy đủ mọi lần thay đổi quyết định phê duyệt cứu trợ (bảng `relief_approval_history` mới) | BRQ-07, FR-08, US-07 | SCHEMA+LOGIC | Trung bình | Không có — độc lập, có thể làm ngay |
| **P1-5** | Xin xác nhận: phạm vi permission `admin.manage`/`camera.view`/`camera.manage` chỉ dành `super` là đúng chủ đích, hay cần vai trò trung gian? | BRQ-09, FR-11, US-10 | SIGN-OFF | 0 | Không có — bắt đầu ngay |
| **P1-6** | (Nếu P1-5 xác nhận cần vai trò trung gian) Thêm permission/role mới cho quản trị camera độc lập | BRQ-09, FR-11 | BUG | Thấp (chỉ sửa seed ROLES) | Phải có kết quả P1-5 |
| **P1-7** | Xin xác nhận & xây bảng ánh xạ chính thức 12 chức danh tổ chức ↔ 8 role kỹ thuật | BRQ-08, FR-12, US-11 | SIGN-OFF + SCHEMA | Thấp (schema) nhưng phụ thuộc quyết định nghiệp vụ | Cần cuộc họp với HC-NS/Ban Chỉ huy |
| **P1-8** | Xin xác nhận: có nên tách permission riêng cho việc kích hoạt cấp độ 3-4 (thẩm quyền Chủ tịch), khác permission `activate` chung? | BRQ-04, FR-13, US-12 | SIGN-OFF | 0 | Không có — bắt đầu ngay (có thể gộp cùng buổi họp P0-1) |
| **P1-9** | (Nếu P1-8 xác nhận cần) Triển khai permission `activate.critical` riêng cho cấp 3-4 | BRQ-04, FR-13 | BUG | Thấp | Phải có kết quả P1-8 |

---

## P2 — TRUNG BÌNH (hoàn thiện tích hợp/chất lượng, không ảnh hưởng an ninh/tuân thủ cấp bách)

| # | Hạng mục | Nguồn | Loại | Effort ước tính |
|---|---|---|---|---|
| **P2-1** | Kết nối 4 tab Admin (Đơn vị, Nhiệm vụ mẫu, Kịch bản, Định mức) với API đã có | BRQ-10, FR-05, US-04 | FE-INTEGRATION | Trung bình (4 override riêng) |
| **P2-2** | Thêm nút "Đánh dấu đã xử lý" cho cảnh báo camera | BRQ-11, FR-09, US-08 | FE-INTEGRATION | Thấp |
| **P2-3** | Thêm màn hình xem chi tiết/đóng Sự cố từ UI | BRQ-12, FR-10, US-09 | FE-INTEGRATION | Thấp-Trung bình | *(Phụ thuộc P0-2/P0-3 xong trước)* |
| **P2-4** | Validate enum cho `relief_projects.status` | BRQ-13, FR-07, US-06 | BUG | Thấp |
| **P2-5** | Validate enum cho `relief_approvals.decision` | BRQ-13, FR-07b, US-06 | BUG | Thấp |
| **P2-6** | Xin xác nhận phạm vi dự kiến tab "Cấu hình" Admin (GAP-07, BRQ-14 — chưa có FR) | BRQ-14 | SIGN-OFF | 0 |
| **P2-7** | (Sau P2-6, nếu xác nhận cần xây) Thiết kế route + schema mới cho tab Cấu hình | BRQ-14 | SURVEY + SCHEMA+LOGIC | Chưa xác định — phụ thuộc phạm vi được xác nhận |
| **P2-8** | Rà soát route `norms`/`pccc_inventory` có áp dụng đúng quy tắc loại trừ hàng hỏng/hết hạn khỏi định mức | BRQ-15, FR-18, US-17 | SURVEY | Trung bình (cần đọc sâu thêm code chưa rà soát) |

---

## P3 — THẤP (cải tiến kỹ thuật/mô hình hóa sâu hơn, không cấp bách)

| # | Hạng mục | Nguồn | Loại | Effort ước tính |
|---|---|---|---|---|
| **P3-1** | Xin xác nhận: có nên ràng buộc sinh task theo đúng `level_phases` matrix (43 dòng hiện chưa dùng)? | BRQ-17, FR-14, US-13 | SIGN-OFF | 0 |
| **P3-2** | (Nếu P3-1 xác nhận cần) Thêm điều kiện lọc phase khi sinh task tự động | BRQ-17, FR-14 | BUG | Thấp-Trung bình |
| **P3-3** | Loại bỏ/nâng giới hạn cứng `LIMIT 28` khi sinh task | BRQ-18, FR-15, US-14 | BUG | Thấp (cần kiểm tra hiệu năng D1 sau khi nâng) |
| **P3-4** | Xin xác nhận: có nên áp owner-only cho hành động `ack` nhiệm vụ (đồng bộ với `done`)? | BRQ-16, FR-16, US-15 | SIGN-OFF | 0 |
| **P3-5** | (Theo kết quả P3-4) Triển khai thay đổi quyền `ack` | BRQ-16, FR-16 | BUG | Thấp |
| **P3-6** | Thêm cảnh báo dashboard cho nhiệm vụ "mồ côi" (owner_id NULL) | BRQ-16, FR-17, US-16 | SCHEMA+LOGIC (client-side, không cần cron) | Thấp-Trung bình |
| **P3-7** | Rà soát 7 permission seed sẵn chưa được route nào kiểm tra — kết luận enforcement hay chưa cần | BRQ-19, FR-19, US-18 | SURVEY | Trung bình |
| **P3-8** | Xin xác nhận: chính sách 1 Event active toàn Group hay nhiều Event active theo site độc lập | BRQ-20, FR-20, US-19 | SIGN-OFF | 0 |
| **P3-9** | (Theo kết quả P3-8) Triển khai ràng buộc tương ứng | BRQ-20, FR-20 | BUG hoặc SCHEMA+LOGIC | Thấp-Trung bình |

---

## TỔNG HỢP THEO LOẠI CÔNG VIỆC (giúp lập kế hoạch nguồn lực)

| Loại | Số lượng hạng mục | Ghi chú lập kế hoạch |
|---|---|---|
| **SIGN-OFF** (chỉ cần họp/văn bản, effort=0 về code) | 8 (P0-1, P0-4, P1-3, P1-5, P1-8, P2-6, P3-1, P3-4, P3-8 — thực tế 9) | **Nên dồn vào 1-2 buổi họp với Ban Chỉ huy/HC-NS/Pháp chế** — không tốn effort kỹ thuật, chỉ cần lên lịch sớm vì các hạng mục BUG/SCHEMA phía sau đều phụ thuộc kết quả này |
| **BUG** (sửa code sau khi có/không cần sign-off) | 9 | Effort thấp từng cái, có thể làm nhanh trong 1-2 sprint sau khi sign-off xong |
| **FE-INTEGRATION** (nối frontend, backend có sẵn) | 5 | Chi phí thấp hơn cảm nhận ban đầu — không phải "thiếu backend" |
| **SCHEMA+LOGIC** (cần bảng/cột mới + logic) | 3 | Cần migration mới, review kỹ trước khi áp production |
| **SURVEY** (cần khảo sát AS-IS bổ sung) | 3 | Nên làm sớm để không bị "treo" các hạng mục phụ thuộc |

---

## ĐỀ XUẤT LỘ TRÌNH SPRINT (🟠 ASSUMED — chỉ là đề xuất, cần Ban Chỉ huy/PM xác nhận theo nguồn lực thực tế)

- **Sprint 1 (tuần 1)**: Tổ chức họp sign-off cho TOÀN BỘ 9 hạng mục SIGN-OFF cùng lúc (P0-1, P0-4, P1-3, P1-5, P1-8, P2-6, P3-1, P3-4, P3-8) — không tốn effort dev, chỉ cần lịch họp; song song bắt đầu P1-1/P1-2 (Cứu trợ FE-integration, không phụ thuộc sign-off).
- **Sprint 2 (tuần 2-3)**: Triển khai các BUG/SCHEMA đã có kết quả sign-off từ Sprint 1 (P0-2/3/5, P1-4/6/7/9 nếu đã rõ); tiếp tục P1-1/P1-2; bắt đầu P2-1 (4 tab Admin).
- **Sprint 3 (tuần 4)**: P2-2/2-3/2-4/2-5 (các FE-integration/BUG còn lại của P2); bắt đầu P2-8/P3-7 (SURVEY).
- **Sprint 4+**: P3 còn lại theo kết quả sign-off Sprint 1, ưu tiên theo nguồn lực còn dư.

---

## GIỚI HẠN CỦA BACKLOG NÀY

- Effort ước tính là **định tính** (Thấp/Trung bình/Cao), chưa quy đổi story point/giờ công cụ thể — cần team dev review lại khi lên Sprint Planning chính thức.
- Lộ trình Sprint ở trên là đề xuất tham khảo duy nhất dựa trên phụ thuộc logic giữa các hạng mục (sign-off trước, code sau) — không phải commitment thời gian thực tế.
- 3 hạng mục SURVEY (P2-8, P3-7, và ẩn trong P2-7) cần thời gian khảo sát bổ sung trước khi có thể ước lượng effort chính xác hơn — hiện tại backlog chỉ đặt chỗ (placeholder), chưa có SRS/FR chi tiết.
