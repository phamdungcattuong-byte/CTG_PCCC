# MA TRẬN TRUY VẾT (TRACEABILITY MATRIX)
## Hệ thống CTG Command Center — PCLB · PCCC · Cát Tường Group

**Ngày lập**: 2026-07-18
**Phiên bản**: 1.0
**Mục đích**: Bảo đảm mọi phát hiện AS-IS (GAP-xx/BR-xx) đều được truy vết xuyên suốt qua toàn bộ chuỗi tài liệu: Phát hiện → Yêu cầu nghiệp vụ (BRD) → Đặc tả kỹ thuật (SRS) → Use Case/User Story (UC/US) → Hạng mục Backlog → (sẽ hoàn thiện ở bước 10) Kịch bản UAT. Không có mắt xích nào "rơi" giữa đường — nếu có khoảng trống, được ghi nhận rõ ràng thay vì bỏ sót.
**Quy ước nhãn**: 🟢 VERIFIED · 🟡 INFERRED · 🟠 ASSUMED — áp dụng cho cột "Trạng thái quyết định" (đã sửa/chưa sửa/cần sign-off).
**Nguồn**: `GAP-ANALYSIS.md`, `PROCESS-RBAC-MODEL.md`, `BRD.md`, `SRS.md`, `USE-CASES.md`, `BACKLOG.md`.

---

## PHẦN 1 — MA TRẬN TRUY VẾT ĐẦY ĐỦ (GAP/BR → BRQ → FR → UC/US → Backlog)

| GAP/BR nguồn | BRQ (BRD) | FR (SRS) | UC/US (Use Case) | Backlog (mã) | Trạng thái quyết định |
|---|---|---|---|---|---|
| GAP-01 | *(không qua BRD — đã sửa trực tiếp khi phát hiện, vì là bug rõ ràng)* | — | — | S0-1 | ✅ **Đã sửa** (commit `4018911`) |
| GAP-02 | BRQ-03 | FR-04 | US-03 | P0-4, P0-5 | 🔴 Cần SIGN-OFF (P0-4) trước khi code (P0-5) |
| GAP-03 | BRQ-10 | FR-05 | US-04 | P2-1 | 🟢 Không cần sign-off — sẵn sàng triển khai |
| GAP-04 (chung) | BRQ-05 | FR-06 | US-05 | P1-1 | 🟢 Không cần sign-off |
| GAP-04 (beneficiaries — ưu tiên trong nhóm) | BRQ-05 | FR-06 (phần beneficiaries) | US-05 (AC-05.1/05.2) | P1-2 | 🟢 Không cần sign-off |
| GAP-05 | BRQ-11 | FR-09 | US-08 | P2-2 | 🟢 Không cần sign-off |
| GAP-06 | BRQ-12 | FR-10 | US-09 | P2-3 | 🟡 Phụ thuộc P0-2/P0-3 (kiểm soát phân quyền Incident) xong trước |
| GAP-07 | BRQ-14 | *(chưa có FR — thiếu câu trả lời nghiệp vụ)* | *(chưa có UC — xem USE-CASES.md Phần 3)* | P2-6, P2-7 | 🔴 Cần SIGN-OFF (P2-6) trước khi ước lượng P2-7 |
| GAP-08 | *(không phải phát hiện mới — tự vá trước audit)* | — | — | — | ✅ Không cần hành động |
| GAP-09 | *(đối chứng tích cực — không phải gap)* | — | — | — | ✅ Không cần hành động |
| BR-01 | *(không có BRQ riêng — ghi nhận trong BRD Phần 3.3, chưa nâng thành BRQ độc lập vì mức độ trung bình, gộp chung ngữ cảnh BRQ-04)* | — | — | *(chưa có backlog riêng)* | 🟡 Cần rà soát thêm — chưa đưa vào backlog cụ thể |
| BR-02 | BRQ-04 | FR-13 | US-12 | P1-8, P1-9 | 🔴 Cần SIGN-OFF (P1-8) trước khi code (P1-9) |
| BR-03 | BRQ-17 | FR-14 | US-13 | P3-1, P3-2 | 🔴 Cần SIGN-OFF (P3-1) trước khi code (P3-2) |
| BR-04 | BRQ-18 | FR-15 | US-14 | P3-3 | 🟢 Không cần sign-off (thuần kỹ thuật) |
| BR-05 | BRQ-20 | FR-20 | US-19 | P3-8, P3-9 | 🔴 Cần SIGN-OFF (P3-8) trước khi code (P3-9) |
| BR-06 | *(điểm tích cực — không phải gap, ghi nhận đã implement đúng)* | — | — | — | ✅ Không cần hành động |
| BR-07 | *(điểm tích cực — không phải gap, ghi nhận đã implement đúng)* | — | — | — | ✅ Không cần hành động |
| BR-08 | BRQ-16 (chung với BR-09) | FR-16 | US-15 | P3-4, P3-5 | 🔴 Cần SIGN-OFF (P3-4) trước khi code (P3-5) |
| BR-09 | BRQ-16 (chung với BR-08) | FR-17 | US-16 | P3-6 | 🟢 Không cần sign-off (giải pháp dashboard client-side) |
| **BR-10** | **BRQ-01** | **FR-01, FR-02** | **US-01/UC-01, UC-02** | **P0-1, P0-2** | 🔴 **Cần SIGN-OFF (P0-1) — ưu tiên tuyệt đối** |
| **BR-11** | **BRQ-01** | **FR-01, FR-02** | **US-01/UC-01** | **P0-1, P0-2** | 🔴 Cùng nhóm quyết định với BR-10 |
| **BR-12** | **BRQ-02** | **FR-03** | **US-02/UC-03** | **P0-3** | 🔴 Cần SIGN-OFF (chung buổi họp P0-1) |
| BR-13 | BRQ-06 (đồng bộ status~approvals) + BRQ-13 (validate enum) | *(BRQ-06: chưa có FR)* + FR-07 | *(BRQ-06: chưa có UC)* + US-06 | P1-3 (sign-off BRQ-06), P2-4 (validate enum) | 🔴 P1-3 cần SIGN-OFF; P2-4 không cần |
| BR-14 | BRQ-06 | *(chưa có FR — thiếu câu trả lời nghiệp vụ)* | *(chưa có UC)* | P1-3 | 🔴 Cần SIGN-OFF trước khi đặc tả FR |
| BR-15 | BRQ-13 | FR-07b | US-06 | P2-5 | 🟢 Không cần sign-off |
| BR-16 | BRQ-07 | FR-08 | US-07 | P1-4 | 🟢 Không cần sign-off |
| BR-17 | BRQ-09 | FR-11 | US-10 | P1-5, P1-6 | 🔴 Cần SIGN-OFF (P1-5) trước khi code (P1-6, nếu cần) |
| BR-18 | BRQ-19 | FR-19 | US-18 | P3-7 | 🟡 Cần SURVEY trước (chưa đủ để sign-off cụ thể từng permission) |
| BR-19 | BRQ-08 | FR-12 | US-11 | P1-7 | 🔴 Cần SIGN-OFF (họp với HC-NS/Ban Chỉ huy) |
| BR-20 | BRQ-15 | FR-18 | US-17 | P2-8 | 🟡 Cần SURVEY trước (chưa đủ AS-IS về route `norms`) |
| BR-21 | *(không có BRQ riêng — gộp ngữ cảnh BR-20/BRQ-15, mức độ thấp hơn, chỉ ghi nhận trong BRD Phần 3.3)* | — | — | *(chưa có backlog riêng — sẽ xem xét cùng P2-8 nếu SURVEY phát hiện liên quan)* | 🟡 Cần rà soát thêm |

---

## PHẦN 2 — DANH SÁCH KHOẢNG TRỐNG TRUY VẾT (Traceability Gaps) — CẦN THEO DÕI RIÊNG

Đây là các mắt xích **chưa đầy đủ** trong chuỗi truy vết, được ghi nhận minh bạch (không che giấu) để không bị "mất dấu" khi triển khai:

| # | Mã liên quan | Vấn đề | Lý do | Hành động cần |
|---|---|---|---|---|
| TG-01 | BR-01 | Chưa có BRQ độc lập trong BRD | Mức độ trung bình, được gộp ngữ cảnh chung với BRQ-04 (thẩm quyền kích hoạt cấp độ) nhưng bản thân "không ép thứ tự tăng cấp" là 1 rule riêng biệt chưa có yêu cầu nghiệp vụ minh bạch | Khi họp sign-off cho BRQ-04 (P1-8), bổ sung câu hỏi riêng cho BR-01: "Có cần ép thứ tự tăng dần cấp độ khi kích hoạt (không cho nhảy thẳng từ cấp 0 lên cấp 4) hay không?" |
| TG-02 | GAP-07, BRQ-14 | Chưa có FR/UC vì thiếu câu trả lời nghiệp vụ về phạm vi tab Cấu hình | Đây là khoảng trống **có chủ đích** — không thể đặc tả kỹ thuật khi chưa biết phạm vi dự kiến | Chờ kết quả P2-6 (sign-off), sau đó bổ sung FR/UC tương ứng vào phiên bản sau của SRS/USE-CASES |
| TG-03 | BR-14, BRQ-06 | Chưa có FR/UC vì thiếu quyết định đồng bộ status~approvals | Tương tự TG-02 — khoảng trống có chủ đích | Chờ kết quả P1-3 (sign-off), bổ sung FR/UC vào phiên bản sau |
| TG-04 | BR-18, BRQ-19 | FR-19/US-18 có nhưng KHÔNG đủ chi tiết Gherkin cho từng permission cụ thể (7 permission gộp chung 1 FR) | Cần SURVEY riêng cho mỗi permission trước khi có thể viết AC cụ thể | Sau P3-7 (SURVEY) hoàn thành, tách FR-19 thành các FR con cụ thể hơn nếu cần |
| TG-05 | BR-20/BR-21, BRQ-15 | FR-18/US-17 chưa có Gherkin cụ thể (chỉ có mô tả "cần rà soát") | Chưa đủ AS-IS về route `norms`/`pccc_inventory` (tự ghi nhận giới hạn từ GAP-ANALYSIS.md Phần D) | Sau P2-8 (SURVEY) hoàn thành, bổ sung Gherkin cụ thể nếu phát hiện cần sửa |
| TG-06 | Tất cả FR/BRQ đánh dấu 🔴 NEEDS BUSINESS SIGN-OFF | Chưa có Kịch bản UAT tương ứng (UAT sẽ soạn ở bước 10 — cột "UAT" trong Phần 1 hiện chưa điền, đúng vì UAT chưa được soạn tại thời điểm lập ma trận này) | Đây là khoảng trống **tạm thời**, sẽ được lấp đầy ngay khi hoàn thành bước 10 (UAT) — không phải thiếu sót vĩnh viễn | Cập nhật ma trận này (thêm cột UAT) sau khi `UAT-SCENARIOS.md` được tạo |

---

## PHẦN 3 — MA TRẬN NGƯỢC: BACKLOG → NGUỒN GỐC (kiểm tra không có hạng mục Backlog "vô căn cứ")

Để đảm bảo tính "hai chiều" của truy vết — không chỉ AS-IS→Backlog mà còn Backlog→AS-IS — dưới đây xác nhận **mọi mục trong `BACKLOG.md`** đều có nguồn gốc từ phát hiện AS-IS, không có hạng mục nào được "thêm mới" ngoài phạm vi audit:

| Nhóm Backlog | Số hạng mục | Tất cả có nguồn GAP/BR? |
|---|---|---|
| P0 (5 mục) | 5 | ✅ 100% — P0-1..3 từ BR-10/11/12; P0-4/5 từ GAP-02 |
| P1 (9 mục) | 9 | ✅ 100% — truy vết đầy đủ ở Phần 1 |
| P2 (8 mục) | 8 | ✅ 100% — bao gồm cả P2-6/2-7 (GAP-07, dù chưa có FR) |
| P3 (9 mục) | 9 | ✅ 100% — bao gồm cả các mục cần SURVEY trước |
| S0 (1 mục) | 1 | ✅ GAP-01 |

**Kết luận Phần 3**: Không phát hiện hạng mục Backlog nào thiếu nguồn gốc từ AS-IS — toàn bộ 32 hạng mục Backlog đều truy vết được về ít nhất 1 mã GAP-xx hoặc BR-xx.

---

## PHẦN 4 — THỐNG KÊ TỔNG HỢP TRUY VẾT

| Chỉ số | Số lượng |
|---|---|
| Tổng số phát hiện gốc (GAP + BR, trừ các mục "đối chứng tích cực"/"đã tự vá") | 9 GAP (trừ GAP-08/09) + 21 BR (trừ BR-06/07 là điểm tích cực) = **28 phát hiện cần theo dõi** |
| Đã sửa hoàn toàn | 1 (GAP-01) |
| Cần SIGN-OFF trước khi code | 12 (BRQ-01/02/03/04/06/08/09/14/16/17/18/20 — một số BRQ gộp nhiều BR) |
| Không cần sign-off, sẵn sàng triển khai kỹ thuật | 12 |
| Cần SURVEY bổ sung trước khi ước lượng | 3 (BR-18, BR-20/21, và ẩn trong GAP-07 sau sign-off) |
| Khoảng trống truy vết đang theo dõi (TG-01 đến TG-06) | 6 |

---

## PHẦN 5 — GIỚI HẠN CỦA MA TRẬN NÀY

- Cột "UAT" chưa được điền trong Phần 1 vì tài liệu Kịch bản UAT (`UAT-SCENARIOS.md`) chưa được soạn tại thời điểm lập ma trận này — sẽ cập nhật ngay sau khi hoàn thành bước tiếp theo (đã ghi nhận minh bạch tại TG-06, không che giấu).
- Ma trận này phản ánh đúng trạng thái tài liệu tại ngày 2026-07-18 — mọi thay đổi sau này ở BRD/SRS/USE-CASES/BACKLOG (đặc biệt sau khi có kết quả sign-off) PHẢI đồng bộ cập nhật lại ma trận này để không bị lệch.
- 2 khoảng trống có chủ đích (TG-02, TG-03) không được "tự ý lấp đầy" bằng suy diễn — đúng theo chỉ đạo "phân biệt rõ nội dung đã kiểm chứng, suy luận và giả định", để trống là hành động đúng khi thực sự thiếu thông tin nghiệp vụ.
