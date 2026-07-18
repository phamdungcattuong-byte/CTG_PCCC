# MA TRẬN TRUY VẾT (TRACEABILITY MATRIX)
## Hệ thống CTG Command Center — PCLB · PCCC · Cát Tường Group

**Ngày lập**: 2026-07-18
**Phiên bản**: 1.0
**Mục đích**: Bảo đảm mọi phát hiện AS-IS (GAP-xx/BR-xx) đều được truy vết xuyên suốt qua toàn bộ chuỗi tài liệu: Phát hiện → Yêu cầu nghiệp vụ (BRD) → Đặc tả kỹ thuật (SRS) → Use Case/User Story (UC/US) → Hạng mục Backlog → Kịch bản UAT/Sign-off. Không có mắt xích nào "rơi" giữa đường — nếu có khoảng trống, được ghi nhận rõ ràng thay vì bỏ sót.
**Quy ước nhãn**: 🟢 VERIFIED · 🟡 INFERRED · 🟠 ASSUMED — áp dụng cho cột "Trạng thái quyết định" (đã sửa/chưa sửa/cần sign-off).
**Nguồn**: `GAP-ANALYSIS.md`, `PROCESS-RBAC-MODEL.md`, `BRD.md`, `SRS.md`, `USE-CASES.md`, `BACKLOG.md`, `UAT-SCENARIOS.md`.
**Cập nhật v1.1 (2026-07-18)**: Đã bổ sung cột "UAT/SOC/SUV" vào Phần 1 sau khi `UAT-SCENARIOS.md` được soạn xong — khép mắt xích **TG-06** (trước đây để trống có chủ đích, nay đã lấp đầy, xem ghi chú cập nhật ở Phần 2).

---

## PHẦN 1 — MA TRẬN TRUY VẾT ĐẦY ĐỦ (GAP/BR → BRQ → FR → UC/US → Backlog)

| GAP/BR nguồn | BRQ (BRD) | FR (SRS) | UC/US (Use Case) | Backlog (mã) | UAT/SOC/SUV (UAT-SCENARIOS.md) | Trạng thái quyết định |
|---|---|---|---|---|---|---|
| GAP-01 | *(không qua BRD — đã sửa trực tiếp khi phát hiện, vì là bug rõ ràng)* | — | — | S0-1 | *(đã test thủ công tại thời điểm sửa, không qua UAT chính thức)* | ✅ **Đã sửa** (commit `4018911`) |
| GAP-02 | BRQ-03 | FR-04 | US-03 | P0-4, P0-5 | **SOC-04** → UAT-05, UAT-06, UAT-07 | 🔴 Cần SIGN-OFF (P0-4) trước khi code (P0-5) |
| GAP-03 | BRQ-10 | FR-05 | US-04 | P2-1 | UAT-13 | 🟢 Không cần sign-off — sẵn sàng triển khai |
| GAP-04 (chung) | BRQ-05 | FR-06 | US-05 | P1-1 | UAT-10 | 🟢 Không cần sign-off |
| GAP-04 (beneficiaries — ưu tiên trong nhóm) | BRQ-05 | FR-06 (phần beneficiaries) | US-05 (AC-05.1/05.2) | P1-2 | UAT-08, UAT-09 | 🟢 Không cần sign-off |
| GAP-05 | BRQ-11 | FR-09 | US-08 | P2-2 | UAT-14 | 🟢 Không cần sign-off |
| GAP-06 | BRQ-12 | FR-10 | US-09 | P2-3 | UAT-15 *(phụ thuộc UAT-04 Pass trước)* | 🟡 Phụ thuộc P0-2/P0-3 (kiểm soát phân quyền Incident) xong trước |
| GAP-07 | BRQ-14 | *(chưa có FR — thiếu câu trả lời nghiệp vụ)* | *(chưa có UC — xem USE-CASES.md Phần 3)* | P2-6, P2-7 | **SOC-09** → SUV-03 *(UAT chi tiết chưa tồn tại, phụ thuộc SOC-09)* | 🔴 Cần SIGN-OFF (P2-6) trước khi ước lượng P2-7 |
| GAP-08 | *(không phải phát hiện mới — tự vá trước audit)* | — | — | — | *(không áp dụng)* | ✅ Không cần hành động |
| GAP-09 | *(đối chứng tích cực — không phải gap)* | — | — | — | *(không áp dụng)* | ✅ Không cần hành động |
| BR-01 | *(không có BRQ riêng — ghi nhận trong BRD Phần 3.3, chưa nâng thành BRQ độc lập vì mức độ trung bình, gộp chung ngữ cảnh BRQ-04)* | — | — | *(chưa có backlog riêng)* | **SOC-03** (gộp cùng SOC-01) | 🟡 Cần rà soát thêm — chưa đưa vào backlog cụ thể |
| BR-02 | BRQ-04 | FR-13 | US-12 | P1-8, P1-9 | **SOC-08** → UAT-17 | 🔴 Cần SIGN-OFF (P1-8) trước khi code (P1-9) |
| BR-03 | BRQ-17 | FR-14 | US-13 | P3-1, P3-2 | **SOC-11** → UAT-18 | 🔴 Cần SIGN-OFF (P3-1) trước khi code (P3-2) |
| BR-04 | BRQ-18 | FR-15 | US-14 | P3-3 | UAT-19 | 🟢 Không cần sign-off (thuần kỹ thuật) |
| BR-05 | BRQ-20 | FR-20 | US-19 | P3-8, P3-9 | **SOC-12** → UAT-22 | 🔴 Cần SIGN-OFF (P3-8) trước khi code (P3-9) |
| BR-06 | *(điểm tích cực — không phải gap, ghi nhận đã implement đúng)* | — | — | — | *(không áp dụng)* | ✅ Không cần hành động |
| BR-07 | *(điểm tích cực — không phải gap, ghi nhận đã implement đúng)* | — | — | — | *(không áp dụng)* | ✅ Không cần hành động |
| BR-08 | BRQ-16 (chung với BR-09) | FR-16 | US-15 | P3-4, P3-5 | **SOC-10** → UAT-20 | 🔴 Cần SIGN-OFF (P3-4) trước khi code (P3-5) |
| BR-09 | BRQ-16 (chung với BR-08) | FR-17 | US-16 | P3-6 | UAT-21 | 🟢 Không cần sign-off (giải pháp dashboard client-side) |
| **BR-10** | **BRQ-01** | **FR-01, FR-02** | **US-01/UC-01, UC-02** | **P0-1, P0-2** | **SOC-01** → UAT-01/UAT-02 (Phương án A) hoặc UAT-03 (Phương án B) | 🔴 **Cần SIGN-OFF (P0-1) — ưu tiên tuyệt đối** |
| **BR-11** | **BRQ-01** | **FR-01, FR-02** | **US-01/UC-01** | **P0-1, P0-2** | **SOC-01** (cùng nhóm với BR-10) | 🔴 Cùng nhóm quyết định với BR-10 |
| **BR-12** | **BRQ-02** | **FR-03** | **US-02/UC-03** | **P0-3** | **SOC-02** → UAT-04 | 🔴 Cần SIGN-OFF (chung buổi họp P0-1) |
| BR-13 | BRQ-06 (đồng bộ status~approvals) + BRQ-13 (validate enum) | *(BRQ-06: chưa có FR)* + FR-07 | *(BRQ-06: chưa có UC)* + US-06 | P1-3 (sign-off BRQ-06), P2-4 (validate enum) | **SOC-05** (phần BRQ-06) + UAT-11 (phần BRQ-13/FR-07) | 🔴 P1-3 cần SIGN-OFF; P2-4 không cần |
| BR-14 | BRQ-06 | *(chưa có FR — thiếu câu trả lời nghiệp vụ)* | *(chưa có UC)* | P1-3 | **SOC-05** | 🔴 Cần SIGN-OFF trước khi đặc tả FR |
| BR-15 | BRQ-13 | FR-07b | US-06 | P2-5 | UAT-11 | 🟢 Không cần sign-off |
| BR-16 | BRQ-07 | FR-08 | US-07 | P1-4 | UAT-12 | 🟢 Không cần sign-off |
| BR-17 | BRQ-09 | FR-11 | US-10 | P1-5, P1-6 | **SOC-06** → *(P1-6 chưa có UAT — chỉ tồn tại nếu SOC-06 xác nhận cần vai trò trung gian)* | 🔴 Cần SIGN-OFF (P1-5) trước khi code (P1-6, nếu cần) |
| BR-18 | BRQ-19 | FR-19 | US-18 | P3-7 | **SUV-02** | 🟡 Cần SURVEY trước (chưa đủ để sign-off cụ thể từng permission) |
| BR-19 | BRQ-08 | FR-12 | US-11 | P1-7 | **SOC-07** → UAT-16 | 🔴 Cần SIGN-OFF (họp với HC-NS/Ban Chỉ huy) |
| BR-20 | BRQ-15 | FR-18 | US-17 | P2-8 | **SUV-01** | 🟡 Cần SURVEY trước (chưa đủ AS-IS về route `norms`) |
| BR-21 | *(không có BRQ riêng — gộp ngữ cảnh BR-20/BRQ-15, mức độ thấp hơn, chỉ ghi nhận trong BRD Phần 3.3)* | — | — | *(chưa có backlog riêng — sẽ xem xét cùng P2-8 nếu SURVEY phát hiện liên quan)* | **SUV-01** (chung với BR-20) | 🟡 Cần rà soát thêm |

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
| TG-06 | Tất cả FR/BRQ đánh dấu 🔴 NEEDS BUSINESS SIGN-OFF | ~~Chưa có Kịch bản UAT tương ứng~~ | ~~UAT sẽ soạn ở bước 10~~ | ✅ **ĐÃ GIẢI QUYẾT (2026-07-18)** — `UAT-SCENARIOS.md` đã được tạo (22 UAT chức năng + 12 SOC sign-off + 3 SUV survey); cột "UAT/SOC/SUV" ở Phần 1 phía trên đã được điền đầy đủ cho toàn bộ 28 phát hiện. Còn lại đúng 2 điểm chưa có UAT chi tiết (P1-6, phần chi tiết P2-7) — nhưng đây là khoảng trống **có chủ đích** (tương tự TG-02/TG-03), vì bản thân hạng mục code còn chưa được xác nhận có tồn tại (phụ thuộc SOC-06/SOC-09), không phải bỏ sót. |

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

## PHẦN 3B — MA TRẬN NGƯỢC BỔ SUNG: UAT/SOC/SUV → BACKLOG (xác nhận không có kịch bản UAT "vô căn cứ")

Tương tự Phần 3, xác nhận toàn bộ mã UAT/SOC/SUV trong `UAT-SCENARIOS.md` đều bắt nguồn từ 1 hạng mục Backlog cụ thể (không có kịch bản kiểm thử nào được soạn ngoài phạm vi audit):

| Loại | Số lượng | Tất cả có nguồn Backlog? |
|---|---|---|
| SOC (Sign-off Confirmation) | 12 | ✅ 100% — SOC-01..12 khớp đúng 9+ hạng mục SIGN-OFF của Backlog (một số SOC gộp chung 1 buổi họp cho nhiều hạng mục, VD SOC-01/03 cùng cho P0-1) |
| UAT chức năng | 22 | ✅ 100% — UAT-01..22 khớp đúng các hạng mục BUG/FE-INTEGRATION/SCHEMA+LOGIC |
| SUV (Survey nghiệm thu) | 3 | ✅ 100% — SUV-01/02/03 khớp đúng 3 hạng mục SURVEY (P2-8, P3-7, P2-7) |

**Kết luận Phần 3B**: 37/37 mã kịch bản trong `UAT-SCENARIOS.md` đều truy vết được về Backlog → GAP/BR gốc — không có kịch bản "phát sinh thêm" ngoài phạm vi audit đã xác lập.

---

## PHẦN 4 — THỐNG KÊ TỔNG HỢP TRUY VẾT

| Chỉ số | Số lượng |
|---|---|
| Tổng số phát hiện gốc (GAP + BR, trừ các mục "đối chứng tích cực"/"đã tự vá") | 9 GAP (trừ GAP-08/09) + 21 BR (trừ BR-06/07 là điểm tích cực) = **28 phát hiện cần theo dõi** |
| Đã sửa hoàn toàn | 1 (GAP-01) |
| Cần SIGN-OFF trước khi code | 12 (BRQ-01/02/03/04/06/08/09/14/16/17/18/20 — một số BRQ gộp nhiều BR) |
| Không cần sign-off, sẵn sàng triển khai kỹ thuật | 12 |
| Cần SURVEY bổ sung trước khi ước lượng | 3 (BR-18, BR-20/21, và ẩn trong GAP-07 sau sign-off) |
| Khoảng trống truy vết đang theo dõi (TG-01 đến TG-06) | 6 (trong đó TG-06 đã ĐÓNG — xem Phần 2; 5 khoảng trống còn mở: TG-01..05) |
| Kịch bản UAT/SOC/SUV đã soạn (chưa thực thi) | 37 (22 UAT + 12 SOC + 3 SUV, xem `UAT-SCENARIOS.md`) |

---

## PHẦN 5 — GIỚI HẠN CỦA MA TRẬN NÀY

- **(Cập nhật v1.1)** Cột "UAT/SOC/SUV" đã được điền đầy đủ trong Phần 1 — TG-06 đã đóng. Tuy nhiên, TOÀN BỘ các mã UAT/SOC/SUV này đang ở trạng thái 🔲 **CHƯA THỰC HIỆN** (xem `UAT-SCENARIOS.md` Phần 6) — việc điền mã vào bảng chỉ xác nhận **đã có kịch bản sẵn sàng**, KHÔNG có nghĩa là đã kiểm thử/nghiệm thu xong. Không nhầm lẫn 2 khái niệm này.
- Ma trận này phản ánh đúng trạng thái tài liệu tại ngày 2026-07-18 — mọi thay đổi sau này ở BRD/SRS/USE-CASES/BACKLOG/UAT-SCENARIOS (đặc biệt sau khi có kết quả sign-off thật hoặc UAT chạy thật) PHẢI đồng bộ cập nhật lại ma trận này để không bị lệch (bao gồm cập nhật trạng thái Pass/Fail thật khi có).
- 2 khoảng trống có chủ đích (TG-02, TG-03) không được "tự ý lấp đầy" bằng suy diễn — đúng theo chỉ đạo "phân biệt rõ nội dung đã kiểm chứng, suy luận và giả định", để trống là hành động đúng khi thực sự thiếu thông tin nghiệp vụ.
- TG-01, TG-04, TG-05 vẫn còn MỞ (chưa giải quyết) — không bị ảnh hưởng bởi việc đóng TG-06, vì lý do tồn tại của chúng khác nhau (thiếu BRQ độc lập / thiếu chi tiết Gherkin per-permission / thiếu AS-IS sâu về route `norms`), không phải do thiếu UAT.
