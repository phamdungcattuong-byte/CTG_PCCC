# BỘ TÀI LIỆU KHẢO SÁT NGHIỆP VỤ (BUSINESS ANALYSIS AUDIT)
## Hệ thống CTG Command Center — PCLB · PCCC · Cát Tường Group

**Ngày lập**: 2026-07-18
**Phiên bản tổng**: 1.1
**Vai trò tài liệu này**: Đây là **tài liệu tổng hợp/chỉ mục (master index)** cho toàn bộ 8 tài liệu khảo sát nghiệp vụ được lập trong đợt audit này — không lặp lại nội dung chi tiết (đã có ở từng file gốc), mà tổng hợp tóm tắt điều hành, sơ đồ liên kết, và nhắc lại xuyên suốt nguyên tắc **Verified/Inferred/Assumed** theo đúng mandate ban đầu.

---

## PHẦN 0 — MANDATE GỐC (nguyên văn, để đối chiếu mức độ hoàn thành)

> Khảo sát AS-IS và thiết kế TO-BE. Rà soát tài liệu, UI, API, schema và luồng thực tế. Phát hiện chức năng thiếu, làm dở hoặc sai nghiệp vụ. Mô hình hóa quy trình, trạng thái, phân quyền và business rules. Lập BRD/SRS, use case, user story, acceptance criteria và backlog. Xây dựng ma trận truy vết và kịch bản UAT/nghiệm thu. Phân biệt rõ nội dung đã kiểm chứng, suy luận và giả định. **Chỉ triển khai mã nguồn khi phát hiện lỗi thật.**

Mandate được chia thành 8 hạng mục — bảng đối chiếu hoàn thành ở Phần 5.

---

## PHẦN 1 — SƠ ĐỒ LIÊN KẾT 8 TÀI LIỆU (đọc theo thứ tự này)

```
1. GAP-ANALYSIS.md ────────┐
   (9 GAP: thiếu/dở/sai)   │
                            ├──► 3. BRD.md ──► 4. SRS.md ──► 5. USE-CASES.md ──► 6. BACKLOG.md
2. PROCESS-RBAC-MODEL.md ──┘     (20 BRQ)     (20 FR)       (3 UC + 19 US)      (32 hạng mục
   (21 BR: quy trình/                                        + Gherkin AC)       P0-P3)
   trạng thái/RBAC)                                                                  │
                                                                                      ▼
                                                              8. README.md (đây) ◄── 7. TRACEABILITY-MATRIX.md
                                                                 (tổng hợp)            (GAP/BR→BRQ→FR→UC/US→
                                                                    ▲                   Backlog→UAT, 2 chiều)
                                                                    │                        │
                                                                    └──────────────── UAT-SCENARIOS.md
                                                                                       (22 UAT + 12 SOC + 3 SUV)
```

| # | Tài liệu | Số dòng | Nội dung chính | Mã dùng |
|---|---|---|---|---|
| 1 | `GAP-ANALYSIS.md` | 198 | 9 phát hiện AS-IS (thiếu/dở/sai nghiệp vụ) từ rà soát UI/API/schema/luồng thực tế | GAP-01..09 |
| 2 | `PROCESS-RBAC-MODEL.md` | 366 | Mô hình quy trình (LEVELS/PHASES), 5 state machine, RBAC đầy đủ, ma trận trách nhiệm tổ chức, 21 business rule | BR-01..21 |
| 3 | `BRD.md` | 186 | Yêu cầu nghiệp vụ tổng hợp từ GAP+BR, mục tiêu/phạm vi/stakeholder, TO-BE vision | BRQ-01..20 |
| 4 | `SRS.md` | 267 | Đặc tả kỹ thuật (functional + non-functional), ánh xạ tới bảng D1 cụ thể | FR-01..20, NFR-01..06 |
| 5 | `USE-CASES.md` | 453 | Use case đầy đủ + user story + Gherkin acceptance criteria | UC-01..03, US-01..19, AC-xx.y |
| 6 | `BACKLOG.md` | 108 | 32 hạng mục ưu tiên hóa P0-P3, phân loại SIGN-OFF/BUG/FE-INTEGRATION/SCHEMA+LOGIC/SURVEY, đề xuất lộ trình Sprint | S0-1, P0-1..5, P1-1..9, P2-1..8, P3-1..9 |
| 7 | `TRACEABILITY-MATRIX.md` | 115 (v1.1) | Ma trận truy vết 2 chiều đầy đủ GAP/BR→BRQ→FR→UC/US→Backlog→UAT, 6 khoảng trống minh bạch (TG-01..06) | TG-01..06 |
| 8 | `UAT-SCENARIOS.md` | 333 | Kịch bản UAT chức năng + checklist xác nhận nghiệp vụ (sign-off) + nghiệm thu khảo sát | UAT-01..22, SOC-01..12, SUV-01..03 |

**Tổng cộng**: 2.026 dòng tài liệu, 8 file, không có mã nguồn nào bị sửa ngoài 1 bug rõ ràng (GAP-01, đã sửa trước khi bắt đầu chuỗi tài liệu này).

---

## PHẦN 2 — TÓM TẮT ĐIỀU HÀNH (EXECUTIVE SUMMARY)

### 2.1. Điểm tích cực đã xác nhận (🟢 VERIFIED) — không phải mọi thứ đều là vấn đề
- Hệ thống đã tồn tại đầy đủ auth JWT + PBKDF2 hashing + rate-limiting + 2FA + buộc đổi mật khẩu lần đầu — **không phải demo**, đã production-ready về bảo mật cơ bản (xem BR-06/BR-07, GAP-09 — đối chứng tích cực).
- RBAC middleware (`requireAuth`/`requirePermission`/`requireAnyPermission`) hoạt động đúng thiết kế cho hầu hết route — GAP-08 (1 lỗi tưởng là gap) đã được tự vá trước khi audit này bắt đầu.
- 1 bug rõ ràng (`mapReliefProject()` sai tên trường) đã được sửa ngay khi phát hiện, đúng nguyên tắc "chỉ sửa mã nguồn khi phát hiện lỗi thật" — không chờ quy trình BRD/SRS đầy đủ vì đây không phải quyết định nghiệp vụ.

### 2.2. Hai rủi ro P0 cần xử lý ưu tiên tuyệt đối (🔴 NEEDS BUSINESS SIGN-OFF)
1. **Kiểm soát phân quyền tạo/đóng Sự cố khẩn cấp** (BR-10/11/12 → BRQ-01/02 → FR-01/02/03) — hiện tại **bất kỳ ai đã đăng nhập** (chỉ cần `requireAuth`, không cần permission cụ thể) đều tạo/đóng được Sự cố khẩn cấp và tự động kích hoạt Event cấp 3 (ĐỎ), mâu thuẫn trực tiếp với Nguyên tắc #3 của QĐ.03 ("Chỉ huy tập trung, một đầu mối"). **Cần sign-off SOC-01/02/03 trước khi code** (xem `UAT-SCENARIOS.md` Phần 1).
2. **Lộ thông tin cá nhân (PII) qua file tĩnh không xác thực** (GAP-02 → BRQ-03 → FR-04) — 172 số điện thoại cá nhân nhân viên nằm cứng trong `ctg-data.js`, truy cập được qua `/static/*` mà **không cần đăng nhập**. **Cần sign-off SOC-04 trước khi code** (xem `UAT-SCENARIOS.md` Phần 1).

Hai rủi ro này **độc lập nhau**, có thể xin xác nhận song song, không cần chờ nhau (đã ghi trong `BACKLOG.md` phần "Ghi chú P0").

### 2.3. Thống kê tổng hợp toàn chuỗi
| Chỉ số | Số lượng | Nguồn |
|---|---|---|
| Phát hiện AS-IS gốc cần theo dõi | 28 (9 GAP - 2 tích cực + 21 BR - 2 tích cực) | GAP-ANALYSIS.md, PROCESS-RBAC-MODEL.md |
| Đã sửa mã nguồn hoàn toàn | 1 (GAP-01) | S0-1 |
| Business Requirements (BRQ) | 20 | BRD.md |
| Functional Requirements (FR) + Non-Functional (NFR) | 20 + 6 | SRS.md |
| Use Case đầy đủ | 3 | USE-CASES.md |
| User Story + Acceptance Criteria (Gherkin) | 19 US, ~45 scenario Gherkin | USE-CASES.md |
| Hạng mục Backlog ưu tiên hóa | 32 (P0:5, P1:9, P2:8, P3:9, S0:1) | BACKLOG.md |
| Cần SIGN-OFF nghiệp vụ trước khi code | 12 nhóm quyết định (12 checklist SOC) | BACKLOG.md, UAT-SCENARIOS.md |
| Sẵn sàng triển khai kỹ thuật ngay (không cần sign-off) | 12 | TRACEABILITY-MATRIX.md |
| Cần khảo sát bổ sung (SURVEY) trước khi ước lượng | 3 | BACKLOG.md, UAT-SCENARIOS.md |
| Kịch bản UAT chức năng đã soạn | 22 | UAT-SCENARIOS.md |
| Khoảng trống truy vết đang theo dõi minh bạch | 6 (TG-01..06 — TG-06 đã đóng, 5 còn mở) | TRACEABILITY-MATRIX.md |

---

## PHẦN 3 — NGUYÊN TẮC VERIFIED / INFERRED / ASSUMED (áp dụng xuyên suốt cả 8 tài liệu)

Đây là nguyên tắc kỷ luật quan trọng nhất được duy trì **nhất quán trong toàn bộ 2.026 dòng tài liệu**, đúng theo mandate "phân biệt rõ nội dung đã kiểm chứng, suy luận và giả định":

| Nhãn | Ý nghĩa | Ví dụ điển hình trong bộ tài liệu |
|---|---|---|
| 🟢 **VERIFIED** | Đã đọc trực tiếp code/schema/UI thật, có trích dẫn file:line hoặc route cụ thể, không suy diễn | GAP-02 (172 số điện thoại cứng — trích dẫn đúng file `ctg-data.js`); GAP-01 (bug `mapReliefProject` — đã tái hiện + sửa + test) |
| 🟡 **INFERRED** | Suy luận hợp lý từ bằng chứng gián tiếp (VD: tên biến, cấu trúc dữ liệu, comment code) nhưng chưa xác nhận 100% ý định thiết kế ban đầu | BR-17 (permission `admin.manage` chỉ role `super` — suy luận là chủ đích nhưng chưa có văn bản xác nhận) |
| 🟠 **ASSUMED** | Giả định dựa trên thông lệ ngành/best practice khi hoàn toàn không có bằng chứng trong hệ thống, luôn gắn kèm khuyến nghị xác minh lại | Lộ trình Sprint trong `BACKLOG.md` (chỉ là đề xuất tham khảo, không phải commitment) |

**Quy tắc bất biến đã tuân thủ trong toàn bộ đợt audit**: Khi thiếu bằng chứng để phân loại rõ, tài liệu **để trống và ghi nhận minh bạch** (xem 6 Traceability Gap TG-01..06) — **không tự ý suy diễn để "lấp đầy cho đẹp"**. Đây là lý do vì sao 2 BRQ (BRQ-06, BRQ-14) vẫn chưa có FR/UC tương ứng — không phải bỏ sót, mà là chủ đích chờ câu trả lời nghiệp vụ.

---

## PHẦN 4 — NGUYÊN TẮC "CHỈ SỬA MÃ NGUỒN KHI PHÁT HIỆN LỖI THẬT" (đã tuân thủ 100%)

Trong toàn bộ đợt khảo sát này:
- **Duy nhất 1 thay đổi mã nguồn** được thực hiện: sửa `mapReliefProject()` (GAP-01) — vì đây là **lỗi kỹ thuật hiển nhiên** (sai tên trường dữ liệu khiến hiển thị sai), không liên quan quyết định nghiệp vụ.
- **Tất cả các phát hiện còn lại** (27/28) được xử lý thuần bằng tài liệu (BRD → SRS → Use Case → Backlog → UAT) — **không một dòng code nào bị sửa** cho các vấn đề còn đang chờ quyết định nghiệp vụ, dù nhiều trong số đó (đặc biệt BR-10/11/12, GAP-02) là rủi ro nghiêm trọng.
- Điều này được duy trì xuyên suốt dù có "cám dỗ" tự sửa nhanh — mọi khuyến nghị kỹ thuật đều được gắn nhãn 🔴 "NEEDS BUSINESS SIGN-OFF" khi có yếu tố quyết định nghiệp vụ, và chỉ được đưa vào Backlog dưới dạng đề xuất chờ ký duyệt (12 checklist SOC trong `UAT-SCENARIOS.md`), không phải code đã triển khai.

---

## PHẦN 5 — ĐỐI CHIẾU HOÀN THÀNH 8 HẠNG MỤC MANDATE GỐC

| # | Hạng mục mandate | Trạng thái | Tài liệu chứng minh |
|---|---|---|---|
| 1 | Khảo sát AS-IS + thiết kế TO-BE | ✅ Hoàn thành | GAP-ANALYSIS.md (AS-IS) + BRD.md Phần 4 (TO-BE vision) |
| 2 | Rà soát tài liệu/UI/API/schema/luồng thực tế | ✅ Hoàn thành | GAP-ANALYSIS.md (trích dẫn file:line cụ thể) |
| 3 | Phát hiện chức năng thiếu/dở/sai nghiệp vụ | ✅ Hoàn thành | 9 GAP + 21 BR = 28 phát hiện |
| 4 | Mô hình hóa quy trình/trạng thái/phân quyền/business rules | ✅ Hoàn thành | PROCESS-RBAC-MODEL.md (5 state machine, RBAC đầy đủ, 21 BR) |
| 5 | BRD/SRS/use case/user story/AC/backlog | ✅ Hoàn thành | BRD.md, SRS.md, USE-CASES.md, BACKLOG.md |
| 6 | Ma trận truy vết + kịch bản UAT/nghiệm thu | ✅ Hoàn thành | TRACEABILITY-MATRIX.md (v1.1, đầy đủ 2 chiều) + UAT-SCENARIOS.md |
| 7 | Phân biệt Verified/Inferred/Assumed | ✅ Duy trì xuyên suốt | Nhãn 🟢/🟡/🟠 nhất quán trong cả 8 tài liệu (xem Phần 3) |
| 8 | Chỉ sửa mã nguồn khi phát hiện lỗi thật | ✅ Tuân thủ 100% | Duy nhất GAP-01 được sửa; 27/28 phát hiện còn lại chỉ ở dạng tài liệu chờ sign-off (xem Phần 4) |

**Kết luận**: Toàn bộ 8 hạng mục mandate đã hoàn thành ở mức tài liệu. **Bước tiếp theo không thuộc phạm vi mandate này** (vì mandate không yêu cầu code) là: tổ chức các buổi họp sign-off cho 12 checklist SOC (ưu tiên SOC-01/02/03/04), sau đó mới bắt đầu triển khai mã nguồn theo kết quả — đúng trình tự đã đề xuất ở `BACKLOG.md` Sprint 1.

---

## PHẦN 6 — HÀNH ĐỘNG TIẾP THEO ĐỀ XUẤT (🟠 ASSUMED — cần Ban Chỉ huy xác nhận)

1. **Ngay lập tức**: Tổ chức 1 buổi họp Ban Chỉ huy + IT để xin xác nhận SOC-01/02/03 (kiểm soát phân quyền Sự cố) và SOC-04 (PII danh bạ) — 2 rủi ro P0, effort code = 0 cho bước này, chỉ cần quyết định.
2. **Trong tuần**: Gộp 8 checklist SOC còn lại (SOC-05 đến SOC-12) vào 1-2 buổi họp rà soát nghiệp vụ tổng thể với các phòng ban liên quan (HC-NS, Pháp chế, Tài chính-Kế toán).
3. **Song song, không phụ thuộc sign-off**: Bắt đầu ngay các hạng mục FE-INTEGRATION không cần quyết định nghiệp vụ (P1-1/P1-2 — module Cứu trợ, P2-1 — 4 tab Admin).
4. **Sau khi có kết quả sign-off**: Triển khai mã nguồn theo đúng FR đã đặc tả, chạy UAT tương ứng (`UAT-SCENARIOS.md` Phần 2), cập nhật trạng thái Pass/Fail vào `TRACEABILITY-MATRIX.md`.
5. **Việc chưa được audit này bao gồm** (ghi nhận minh bạch, không giả vờ đã xong): các hạng mục SURVEY (SUV-01/02/03 — route `norms`/`pccc_inventory`, 7 permission chưa enforcement, tab Cấu hình) cần khảo sát kỹ thuật sâu hơn trước khi có thể ước lượng hoặc đặc tả đầy đủ.

---

## PHẦN 7 — GIỚI HẠN TỔNG THỂ CỦA TOÀN BỘ BỘ TÀI LIỆU

- Đây là **audit tài liệu**, không phải kiểm thử phần mềm tự động — mọi kết luận dựa trên đọc code/schema tĩnh (static review), chưa chạy test suite thật (không có test suite tự động trong dự án tại thời điểm audit).
- 6 khoảng trống truy vết (TG-01..06 trong `TRACEABILITY-MATRIX.md`) là **có chủ đích**, không phải sai sót — 5 khoảng trống còn mở (TG-01, TG-02, TG-03, TG-04, TG-05) sẽ chỉ được lấp đầy khi có thêm thông tin nghiệp vụ hoặc khảo sát kỹ thuật bổ sung, KHÔNG được tự ý suy diễn.
- Mọi ước lượng effort trong `BACKLOG.md` là **định tính** (Thấp/Trung bình/Cao), chưa quy đổi story point — cần Sprint Planning chính thức với team dev.
- Bộ tài liệu này phản ánh đúng trạng thái hệ thống tại ngày **2026-07-18** — mọi thay đổi mã nguồn sau này (đặc biệt sau sign-off) cần được đồng bộ lại vào `TRACEABILITY-MATRIX.md` và cập nhật trạng thái UAT tương ứng để không bị lệch.
- File `README.md` ở gốc dự án (`/home/user/webapp/README.md`) mô tả trạng thái **kỹ thuật/vận hành** hiện tại (deploy, tính năng đã build) — file `docs/audit/README.md` này (bạn đang đọc) mô tả kết quả **audit nghiệp vụ**, hai tài liệu bổ sung cho nhau, không mâu thuẫn.
