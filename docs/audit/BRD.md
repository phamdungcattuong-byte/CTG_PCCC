# TÀI LIỆU YÊU CẦU NGHIỆP VỤ (BRD — BUSINESS REQUIREMENTS DOCUMENT)
## Hệ thống CTG Command Center — PCLB · PCCC · Cát Tường Group

**Ngày lập**: 2026-07-18
**Phiên bản**: 1.0
**Nguồn tổng hợp**: `docs/audit/GAP-ANALYSIS.md` (9 phát hiện GAP-01..09) + `docs/audit/PROCESS-RBAC-MODEL.md` (21 Business Rule BR-01..BR-21) — cả hai đều dựa trên đọc trực tiếp 100% mã nguồn (55 file) + kiểm thử thực nghiệm trên D1 local.
**Quy ước nhãn bằng chứng** (giữ xuyên suốt toàn bộ tài liệu này):
- 🟢 **VERIFIED** — có bằng chứng trực tiếp từ mã nguồn/schema/kiểm thử thực nghiệm, trích dẫn lại từ 2 tài liệu nguồn.
- 🟡 **INFERRED** — suy luận hợp lý từ cấu trúc đã đọc, chưa test runtime 100%.
- 🟠 **ASSUMED** — giả định cần xác nhận với đội nghiệp vụ Cát Tường Group trước khi đưa vào phạm vi triển khai chính thức.

**Nguyên tắc soạn tài liệu này**: BRD là tài liệu **yêu cầu nghiệp vụ ở mức mục tiêu** (business need, "cái gì" và "tại sao"), KHÔNG đi vào chi tiết kỹ thuật thực thi ("làm thế nào" — sẽ nằm ở SRS, bước tiếp theo). Mỗi Yêu cầu Nghiệp vụ (BRQ) dưới đây bắt buộc trích dẫn mã GAP-xx và/hoặc BR-xx làm nguồn gốc bằng chứng, đảm bảo truy vết được ngược (traceability) trong Ma trận truy vết ở bước sau.

---

## PHẦN 1 — TÓM TẮT ĐIỀU HÀNH (EXECUTIVE SUMMARY)

Hệ thống CTG Command Center là nền tảng số hóa quy trình ứng phó Phòng chống lụt bão (PCLB) và Phòng cháy chữa cháy (PCCC) của Cát Tường Group, xây dựng để thực thi văn bản nội bộ **QĐ.03** (5 cấp độ ứng phó, nguyên tắc "Bốn tại chỗ", cơ chế phân quyền theo chức danh tổ chức). Qua khảo sát AS-IS toàn diện (100% mã nguồn, schema, seed data), hệ thống được xác nhận có **kiến trúc kỹ thuật vững** (Hono/Cloudflare Workers + D1, JWT tự viết, RBAC permission-string, kiến trúc override JS tách bạch code gốc/code thật) và **đã triển khai đúng đắn nhiều luồng nghiệp vụ lõi** (đăng nhập, kích hoạt sự kiện, giao/nhận/hoàn thành nhiệm vụ, quản trị camera CRUD).

Tuy nhiên, khảo sát phát hiện **9 khoảng cách chức năng (GAP-01 đến GAP-09)** và **21 quy tắc nghiệp vụ cần làm rõ hoặc có rủi ro (BR-01 đến BR-21)**, trong đó nổi bật:
- **1 lỗi kỹ thuật đã xác nhận và SỬA** (GAP-01 — sai tên trường dữ liệu module Cứu trợ).
- **2 khoảng cách bảo mật/phân quyền mức Nghiêm trọng (Critical) CHƯA sửa**, cần quyết định nghiệp vụ trước khi triển khai code: (a) PII (số điện thoại nhân viên) bị lộ công khai không cần đăng nhập (GAP-02); (b) **bất kỳ người dùng đã đăng nhập — kể cả vai trò thấp nhất — có thể tự kích hoạt phản ứng khẩn cấp cấp ĐỎ toàn Group** thông qua tạo Sự cố (Incident), vi phạm trực tiếp nguyên tắc "Chỉ huy tập trung, một đầu mối" của QĐ.03 (BR-10/BR-11/BR-12).
- **4 khoảng cách tích hợp Frontend↔Backend** (GAP-03 đến GAP-06) — backend đã có đầy đủ API, chỉ thiếu kết nối giao diện — chi phí sửa thấp hơn nhiều so với xây mới.
- **1 khoảng cách cần làm rõ phạm vi với nghiệp vụ trước khi kết luận** (GAP-07 — tab Cấu hình không có backend).
- Các quy tắc nghiệp vụ về mô hình phân quyền 2 tầng (8 role kỹ thuật vs 12 chức danh tổ chức — BR-19), về đồng bộ trạng thái phê duyệt cứu trợ (BR-14), và về việc một số permission được seed sẵn nhưng chưa hề được route nào kiểm tra (BR-18) — đều cần quyết định nghiệp vụ minh bạch trước khi đưa vào backlog kỹ thuật.

Theo đúng chỉ đạo ban đầu, tài liệu này **không tự đề xuất tự động sửa** các phát hiện Nghiêm trọng còn tồn đọng — mỗi Yêu cầu Nghiệp vụ (BRQ) dưới đây được đưa ra ở dạng "câu hỏi/khuyến nghị nghiệp vụ cần Ban Chỉ huy/Chủ đầu tư xác nhận", làm tiền đề cho SRS và Backlog ở các bước tiếp theo.

---

## PHẦN 2 — MỤC TIÊU KINH DOANH & PHẠM VI

### 2.1 Mục tiêu kinh doanh (Business Objectives)
🟢 VERIFIED (suy ra trực tiếp từ QD03_PRINCIPLES + cấu trúc hệ thống hiện có):

| # | Mục tiêu | Thước đo liên quan |
|---|---|---|
| O1 | Số hóa toàn bộ vòng đời ứng phó QĐ.03 (5 cấp độ × 15 giai đoạn) thay thế quy trình giấy/điện thoại | % task tự sinh đúng hạn, % xác nhận qua hệ thống thay vì điện thoại |
| O2 | Bảo đảm nguyên tắc "Chỉ huy tập trung, một đầu mối" được thực thi bằng kỹ thuật, không chỉ bằng quy định giấy | Có/không kiểm soát phân quyền kỹ thuật khớp với thẩm quyền văn bản (liên hệ BR-02, BR-10/11/12) |
| O3 | Minh bạch hóa quy trình cứu trợ (đúng đối tượng, có hồ sơ, không trục lợi) — theo Điều cấm số 6 QĐ.03 | % hộ thụ hưởng có xác nhận ký/ảnh thật (liên hệ GAP-04, Điều cấm #6) |
| O4 | Bảo vệ dữ liệu cá nhân nhân viên (danh bạ liên lạc khẩn) đúng chuẩn bảo mật | Có/không PII truy cập được không cần xác thực (liên hệ GAP-02) |
| O5 | Vận hành ổn định trên nền tảng chi phí thấp, khả năng mở rộng (Cloudflare Edge) | Uptime, chi phí hạ tầng |

### 2.2 Phạm vi (Scope)
**Trong phạm vi (In-scope)** của đợt rà soát này và các bước BRD/SRS/Backlog tiếp theo:
- Toàn bộ 9 module backend đã khảo sát: Auth, Events (kích hoạt/hủy sự kiện + task), Incidents (sự cố), Relief (cứu trợ, 15 route con), Cameras (an ninh), Bootstrap (Admin: units/sites/task-templates/scenarios/norms), Users, Notifications/Audit, AI (chat — 🟠 chưa rà soát sâu).
- Toàn bộ luồng RBAC 2 tầng: 8 role kỹ thuật (Phần 8, PROCESS-RBAC-MODEL.md) và 12 chức danh tổ chức (Phần 9, cùng tài liệu).

**Ngoài phạm vi (Out-of-scope)** — 🟡 INFERRED/🟠 ASSUMED, cần xác nhận nghiệp vụ:
- Tính năng sinh PDF báo cáo cứu trợ (đã tự ghi nhận là "out of scope Phase 1" ngay trong mã nguồn `relief.ts` — GAP-04).
- Module AI chat (`ai.ts`) — GAP-ANALYSIS.md Phần D tự ghi nhận "chưa rà soát sâu" — 🟠 cần một vòng khảo sát riêng nếu nghiệp vụ coi đây là chức năng lõi.
- Phần audit log chi tiết và các tham số filter camera alerts — chưa rà soát sâu (GAP-ANALYSIS.md Phần D).

### 2.3 Đối tượng liên quan (Stakeholders)
🟠 ASSUMED (suy luận từ RESP_MATRIX 12 chức danh, cần xác nhận danh sách người liên hệ cụ thể):

| Nhóm | Vai trò trong dự án | Liên hệ tài liệu nguồn |
|---|---|---|
| Chủ tịch / Ban Chỉ huy | Phê duyệt quyết định nghiệp vụ cấp cao (đặc biệt BR-02, BR-10/11/12) | `levels` seed — cấp 3/4 |
| Văn phòng Chủ tịch | Cơ quan thường trực, đầu mối tiếp nhận/điều phối — cần xác nhận mapping role kỹ thuật (BR-19) | RESP_MATRIX dòng 2 |
| Trung tâm HC-NS | Quản lý kho 5 tầng, nhân sự — liên quan BR-20/21 | RESP_MATRIX dòng 3 |
| Trung tâm Pháp chế | Rà soát các quyết định phân quyền (BR-10/11/12 ảnh hưởng trực tiếp trách nhiệm pháp lý khi có sự cố) | RESP_MATRIX dòng 6 |
| IT/Chuyển đổi số | Đơn vị phát triển/vận hành hệ thống — thực thi các Yêu cầu Nghiệp vụ ở SRS/Backlog | RESP_MATRIX dòng 8 |
| Kiểm soát nội bộ | Xác nhận độc lập các phát hiện audit này, đặc biệt BR-16 (approval history bị ghi đè) | RESP_MATRIX dòng 10 |
| Tất cả 8 role kỹ thuật (super/bch/unit_head/relief/warehouse/duty/audit/viewer) | Người dùng cuối trực tiếp bị ảnh hưởng bởi các quyết định RBAC (BR-17/BR-18) | seed ROLES |

---

## PHẦN 3 — HIỆN TRẠNG (AS-IS) — TÓM TẮT THAM CHIẾU

*(Chi tiết đầy đủ xem `GAP-ANALYSIS.md` và `PROCESS-RBAC-MODEL.md` — phần này chỉ tóm tắt lại có cấu trúc cho BRD)*

### 3.1 Điểm mạnh đã xác nhận (đối chứng tích cực — GAP-09)
🟢 VERIFIED — các luồng đã kết nối đầy đủ Frontend↔Backend, không cần thay đổi:
Đăng nhập/đổi mật khẩu/đăng xuất · Thông báo & kích hoạt/hủy sự kiện · Xác nhận/hoàn thành nhiệm vụ (kèm ảnh minh chứng qua R2) · Tạo sự cố khẩn (tạo mới) · Quản trị camera (CRUD đầy đủ) · Xem luồng camera/tạo cảnh báo mới · Xem danh sách/chi tiết dự án cứu trợ.

### 3.2 Khoảng cách chức năng đã phát hiện (GAP-01 đến GAP-09)

| Mã | Tên ngắn | Mức độ | Trạng thái | Loại |
|---|---|---|---|---|
| GAP-01 | `mapReliefProject()` sai tên trường dữ liệu | Cao | ✅ Đã sửa (commit `4018911`) | Bug kỹ thuật thuần |
| GAP-02 | PII (172 SĐT nhân viên) lộ công khai qua `/static/*` không xác thực | Cao | Chưa sửa | Bảo mật/Kiến trúc |
| GAP-03 | 4 tab Admin (Đơn vị, Nhiệm vụ mẫu, Kịch bản, Định mức) chưa nối API thật | Trung bình | Chưa sửa | Thiếu tích hợp FE |
| GAP-04 | Toàn bộ hành động ghi module Cứu trợ chưa nối API (đặc biệt tab Đối tượng thụ hưởng dùng dữ liệu giả) | Cao | Chưa sửa | Thiếu tích hợp FE |
| GAP-05 | Không thể đánh dấu "đã xử lý" cảnh báo camera từ UI | Trung bình | Chưa sửa | Thiếu tích hợp FE |
| GAP-06 | Không xem lại/đóng chính thức được Sự cố (Incident) từ UI | Trung bình | Chưa sửa | Thiếu tích hợp FE |
| GAP-07 | Tab "Cấu hình" Admin — có thể hoàn toàn không có backend | Thấp-TB | Cần hỏi nghiệp vụ | Cần làm rõ phạm vi |
| GAP-08 | (Không phải phát hiện mới — backend tự vá lỗi FK 500 trước đó) | — | Đã xác nhận, không cần hành động | Ghi chú |
| GAP-09 | (Đối chứng tích cực — xem 3.1) | — | Không phải gap | Ghi chú |

### 3.3 Quy tắc nghiệp vụ cần làm rõ/có rủi ro (BR-01 đến BR-21)
Tóm tắt theo nhóm chủ đề (chi tiết đầy đủ + trích dẫn file:line ở `PROCESS-RBAC-MODEL.md` Phần 1-12):

- **Nhóm Cấp độ & Giai đoạn ứng phó** (BR-01 đến BR-04): không ép thứ tự tăng cấp độ; quyền kích hoạt cấp 3-4 chỉ theo permission chung, không phân biệt vai trò Chủ tịch cụ thể; ma trận LEVEL_PHASES (43 dòng) chưa được dùng; giới hạn cứng 28 template/lần có thể bỏ sót task.
- **Nhóm Sự kiện & Nhiệm vụ** (BR-05 đến BR-09): cho phép nhiều Event active đồng thời không kiểm soát; cơ chế idempotency tốt (điểm tích cực); bất đối xứng quyền ack (ai cũng ack được) vs done (chỉ chủ nhiệm vụ); task có thể "mồ côi" không người nhận không cảnh báo.
- **Nhóm Sự cố (Incident)** (BR-10, BR-11, BR-12) — **🔴 NGHIÊM TRỌNG NHẤT TOÀN BỘ AUDIT**: không có kiểm soát phân quyền tạo/đóng sự cố ngoài yêu cầu đăng nhập; tạo sự cố tự động kích hoạt Event cấp 3 (ĐỎ) bất kể vai trò người tạo — **mâu thuẫn trực tiếp với Nguyên tắc QĐ.03 số 3 ("Chỉ huy tập trung, một đầu mối")**.
- **Nhóm Dự án Cứu trợ** (BR-13, BR-14): trạng thái dự án (`status`) không có validate chuyển trạng thái hợp lệ; trạng thái dự án và 4 phê duyệt vai trò (relief_approvals) hoàn toàn độc lập, không tự đồng bộ.
- **Nhóm Phê duyệt Cứu trợ** (BR-15, BR-16): trường `decision` không validate enum (rủi ro dữ liệu rác); mỗi lần phê duyệt ghi đè quyết định cũ, mất lịch sử — liên hệ trực tiếp Điều cấm QĐ.03 số 4 (không được sửa số liệu, ký khống).
- **Nhóm RBAC** (BR-17, BR-18): 3 permission (`admin.manage`, `camera.view`, `camera.manage`) được kiểm tra trong 16+ route nhưng không role nào có ngoài `super`; 7 permission khác được seed sẵn nhưng chưa route nào kiểm tra (khoảng cách enforcement).
- **Nhóm ánh xạ tổ chức** (BR-19): 12 chức danh tổ chức (resp_matrix) và 8 role kỹ thuật (RBAC) không có bảng ánh xạ chính thức.
- **Nhóm Kho vật tư** (BR-20, BR-21): quy tắc loại trừ hàng hỏng/hết hạn khỏi định mức — chưa xác nhận có áp dụng trong tính toán; dữ liệu "gap" tồn kho hiện là input thủ công, chưa rõ có tự động hoá dự kiến.

---

## PHẦN 4 — TẦM NHÌN TƯƠNG LAI (TO-BE) — Ở MỨC MỤC TIÊU NGHIỆP VỤ

🟠 ASSUMED — đây là đề xuất định hướng dựa trên phân tích gap, **cần Ban Chỉ huy/Chủ đầu tư xác nhận trước khi đưa vào SRS chi tiết**:

1. **Phân quyền theo đúng thẩm quyền văn bản QĐ.03**: hành động kích hoạt/đóng sự kiện ở cấp 3-4, và hành động tạo/đóng sự cố khẩn — phải được kiểm soát bằng permission/role cụ thể, khớp với "người có quyền quyết định" nêu trong Điều 20 QĐ.03, không chỉ dựa vào việc "đã đăng nhập".
2. **Bảo vệ PII theo chuẩn tối thiểu**: danh bạ liên lạc khẩn phải được truy xuất qua API có xác thực, không nhúng cứng ở tầng tĩnh công khai.
3. **Hoàn thiện vòng đời số hóa module Cứu trợ**: mọi hành động ghi (thành viên đoàn, phương tiện, hàng hoá, lịch trình, phê duyệt, chi phí, đối tượng thụ hưởng thật) phải được thực hiện qua giao diện thật, không dữ liệu giả lập — đặc biệt đối tượng thụ hưởng phải có xác nhận ký/ảnh thật để đáp ứng Điều cấm số 6.
4. **Đồng bộ trạng thái dự án cứu trợ với quy trình phê duyệt**: cần quyết định nghiệp vụ có nên tự động hoá việc chuyển `status` dự án theo tiến độ 4/4 phê duyệt hay giữ độc lập có chủ đích.
5. **Minh bạch ánh xạ tổ chức ↔ kỹ thuật**: xuất bản bảng ánh xạ chính thức giữa 12 chức danh tổ chức và 8 role kỹ thuật, tránh tình trạng "ai cũng có thể là super" không kiểm soát.
6. **Khép lại các khoảng cách tích hợp Frontend↔Backend chi phí thấp** (GAP-03, GAP-05, GAP-06) — backend đã sẵn sàng, chỉ cần viết override JS theo pattern đã có.
7. **Làm rõ phạm vi tab Cấu hình** (GAP-07) trước khi thiết kế backend mới cho tab này.

---

## PHẦN 5 — YÊU CẦU NGHIỆP VỤ (BUSINESS REQUIREMENTS — BRQ)

Mỗi BRQ dưới đây được đánh mã để truy vết trong Ma trận truy vết (bước 9) và Backlog (bước 8). Mức ưu tiên (P0=khẩn cấp nhất) được đề xuất dựa trên mức độ nghiêm trọng đã ghi nhận ở GAP-ANALYSIS.md Phần C, nhưng **cần Ban Chỉ huy xác nhận lại**, đặc biệt BRQ-05/06 (ảnh hưởng trực tiếp thẩm quyền chỉ huy).

| Mã BRQ | Yêu cầu nghiệp vụ | Nguồn gốc (GAP/BR) | Ưu tiên đề xuất | Loại quyết định cần |
|---|---|---|---|---|
| **BRQ-01** | Bảo đảm việc tạo Sự cố (Incident) và các hành động kéo theo (tự động kích hoạt Event cấp ĐỎ) chỉ được thực hiện bởi vai trò có thẩm quyền theo QĐ.03, không phải bất kỳ ai đã đăng nhập | BR-10, BR-11 | **P0 (Khẩn cấp)** | 🔴 Cần Ban Chỉ huy xác nhận: có đúng ý định thiết kế "ai cũng báo được sự cố khẩn để không làm chậm phản ứng đầu tiên" hay là lỗ hổng cần vá ngay? |
| **BRQ-02** | Bảo đảm việc đóng/cập nhật trạng thái Sự cố chỉ do người có thẩm quyền/liên quan thực hiện | BR-12 | **P0** | Tương tự BRQ-01 — cùng nhóm quyết định |
| **BRQ-03** | Ngăn chặn truy cập công khai không xác thực tới dữ liệu số điện thoại cá nhân nhân viên | GAP-02 | **P0** | 🔴 Cần xác nhận: giữ song song bảng `phonebook` D1 hay hợp nhất với `users`/danh sách nhân sự hiện có? |
| **BRQ-04** | Bảo đảm quyền kích hoạt cấp độ ứng phó 3 (ĐỎ) và 4 (ĐẶC BIỆT) đúng thẩm quyền Chủ tịch theo văn bản, không chỉ dựa vào permission chung `activate` | BR-02 | **P1 (Cao)** | 🟡 Cần xác nhận: có nên thêm ràng buộc role cụ thể ngoài permission string hiện có? |
| **BRQ-05** | Hoàn thiện khả năng thao tác thật (không dữ liệu giả) cho toàn bộ vòng đời cứu trợ, đặc biệt xác nhận đối tượng thụ hưởng có ký/ảnh thật | GAP-04, Điều cấm QĐ.03 #6 | **P1** | Không cần quyết định nghiệp vụ đặc biệt — đây là hoàn thiện tính năng đã thiết kế, chỉ thiếu kết nối |
| **BRQ-06** | Quyết định rõ mối quan hệ giữa trạng thái tổng thể dự án cứu trợ và 4 phê duyệt vai trò riêng lẻ — có nên tự động đồng bộ? | BR-13, BR-14 | **P1** | 🔴 Cần xác nhận quy trình phê duyệt dự kiến |
| **BRQ-07** | Bảo đảm giữ lịch sử đầy đủ mọi lần thay đổi quyết định phê duyệt cứu trợ (không ghi đè mất vết) | BR-16, Điều cấm QĐ.03 #4 | **P1** | Không cần quyết định nghiệp vụ — đây là yêu cầu tuân thủ rõ ràng theo Điều cấm |
| **BRQ-08** | Xuất bản bảng ánh xạ chính thức giữa 12 chức danh trách nhiệm tổ chức và 8 role kỹ thuật hệ thống | BR-19 | **P1** | 🔴 Cần Ban Chỉ huy/HC-NS xác nhận ánh xạ chính thức |
| **BRQ-09** | Xác nhận phạm vi quản trị hệ thống và an ninh camera có đúng là chỉ dành riêng cho Văn phòng Chủ tịch & IT (role `super`), hay cần vai trò trung gian | BR-17 | **P1** | 🔴 Cần xác nhận — nếu đúng ý định, cần ghi nhận chính thức thay vì để ngầm định qua code |
| **BRQ-10** | Kết nối giao diện quản trị (Đơn vị/Nhiệm vụ mẫu/Kịch bản/Định mức) với API backend đã sẵn có | GAP-03 | **P2 (Trung bình)** | Không cần quyết định nghiệp vụ — thuần kỹ thuật |
| **BRQ-11** | Cho phép tổ an ninh đánh dấu cảnh báo camera đã xử lý xong ngay trên giao diện | GAP-05 | **P2** | Không cần quyết định nghiệp vụ |
| **BRQ-12** | Cho phép xem lại chi tiết và đóng chính thức Sự cố từ giao diện (sau khi đã giải quyết vấn đề phân quyền ở BRQ-01/02) | GAP-06 | **P2** | Phụ thuộc kết quả BRQ-01/02 |
| **BRQ-13** | Áp dụng ràng buộc kiểm tra dữ liệu hợp lệ (validate) cho các trường trạng thái tự do hiện tại chấp nhận chuỗi bất kỳ (`relief_projects.status`, `relief_approvals.decision`) | BR-13, BR-15 | **P2** | Không cần quyết định nghiệp vụ lớn — chỉ cần xác nhận danh sách giá trị hợp lệ chính thức |
| **BRQ-14** | Xác nhận và làm rõ mục đích/phạm vi dự kiến của tab "Cấu hình" trong màn hình Admin | GAP-07 | **P2** | 🔴 Cần nghiệp vụ trả lời trước khi ước lượng effort |
| **BRQ-15** | Xác nhận quy tắc loại trừ hàng hỏng/hết hạn khỏi tính định mức tồn kho có đang được áp dụng đúng trong tính toán hệ thống | BR-20 | **P2** | 🔴 Cần Trung tâm HC-NS xác nhận |
| **BRQ-16** | Rà soát và quyết định có cần cơ chế cảnh báo cho nhiệm vụ "mồ côi" (không có người nhận) và thống nhất quy tắc phân quyền `ack` nhiệm vụ (hiện ai cũng ack được, khác với `done` chỉ chủ nhiệm vụ) | BR-08, BR-09 | **P2** | 🟡 Cần xác nhận — có thể là chủ đích thiết kế để không chặn phản ứng nhanh |
| **BRQ-17** | Rà soát và quyết định việc sử dụng (hoặc bỏ) ma trận LEVEL_PHASES (43 dòng) hiện chưa được áp dụng khi sinh nhiệm vụ tự động | BR-03 | **P3 (Thấp)** | 🟡 Cần xác nhận có cần ràng buộc chặt việc sinh task theo đúng giai đoạn hợp lệ hay không |
| **BRQ-18** | Rà soát giới hạn cứng 28 mẫu nhiệm vụ/lần kích hoạt, đảm bảo không bỏ sót nhiệm vụ khi số lượng mẫu hợp lệ vượt ngưỡng | BR-04 | **P3** | Không cần quyết định nghiệp vụ lớn — thuần kỹ thuật (tăng/bỏ giới hạn) |
| **BRQ-19** | Rà soát 7 permission đã seed sẵn (`inventory.edit`, `export.stock`, `task.receive`, `log.write`, `view.unit`, `report.unit`, `view.all`, `view.public`) nhưng chưa route nào thực thi kiểm tra — quyết định có cần bổ sung enforcement hay các chức năng liên quan chưa tới lượt triển khai | BR-18 | **P3** | 🟡 Cần xác nhận mức độ ưu tiên triển khai enforcement cho từng permission |
| **BRQ-20** | Đảm bảo không có nhiều Sự kiện (Event) ở trạng thái "active" xung đột nhau cùng lúc mà không có cảnh báo/kiểm soát | BR-05 | **P3** | 🟡 Cần xác nhận — có tình huống nghiệp vụ hợp lệ cần nhiều event active song song (ví dụ nhiều cơ sở khác nhau) không? |

---

## PHẦN 6 — GIẢ ĐỊNH, RÀNG BUỘC VÀ RỦI RO

### 6.1 Giả định (Assumptions) 🟠
- A1: Người dùng thử nghiệm `vpct1` (role kỹ thuật `super`) trong seed data là dữ liệu demo, KHÔNG phải quy tắc chính thức "mọi nhân sự Văn phòng Chủ tịch đều có quyền super" (liên hệ BR-19) — cần xác nhận.
- A2: Việc "ai cũng tạo được Sự cố khẩn" (BR-10) hiện tại **có thể** là chủ đích thiết kế ban đầu để không làm chậm phản ứng đầu tiên trước một tình huống nguy hiểm — cần xác nhận đây là chủ đích hay là thiếu sót.
- A3: Tab "Cấu hình" Admin (GAP-07) được giả định là placeholder cho các cấu hình hệ thống chưa xác định rõ (ngưỡng cảnh báo? thông tin liên hệ khẩn? tham số hệ thống?) — cần nghiệp vụ xác nhận nội dung dự kiến.
- A4: Kho ảo (1 trong 5 tầng mô hình kho — BR-20/21 liên quan) được giả định là kho ghi nhận số liệu không có vị trí vật lý cố định — cần xác nhận ý nghĩa chính xác.

### 6.2 Ràng buộc (Constraints) 🟢
- C1: Hệ thống triển khai trên Cloudflare Pages/Workers — không có tiến trình chạy nền dài hạn, không cron job gốc (ảnh hưởng đến giải pháp cho BR-09 "task mồ côi" — cần cơ chế kiểm tra khi có request, không thể chạy job nền định kỳ trừ khi dùng Cloudflare Cron Triggers).
- C2: Theo chỉ đạo ban đầu của dự án, **không tự động sửa mã nguồn cho các phát hiện business-logic** (BR-01 đến BR-21) — mọi thay đổi liên quan đến các BRQ này phải qua xác nhận nghiệp vụ trước khi đưa vào SRS/Backlog thực thi.
- C3: Dữ liệu 172 số điện thoại (GAP-02) là dữ liệu cá nhân thật của nhân viên — bất kỳ giải pháp nào cho BRQ-03 phải tuân thủ quy định bảo vệ dữ liệu cá nhân hiện hành (chưa xác nhận Cát Tường Group có chính sách bảo vệ dữ liệu cá nhân nội bộ văn bản riêng hay không — 🟠 ASSUMED).

### 6.3 Rủi ro (Risks) 🟡
| # | Rủi ro | Liên hệ | Mức độ |
|---|---|---|---|
| R1 | Nếu BRQ-01/02 không được xử lý trước khi mở rộng số lượng người dùng hệ thống, rủi ro có người dùng (cố ý hoặc nhầm) kích hoạt sai mức phản ứng khẩn cấp, gây hoảng loạn/lãng phí nguồn lực ứng phó không cần thiết | BR-10/11/12 | **Cao** |
| R2 | Nếu BRQ-03 không được xử lý, rủi ro lộ thông tin cá nhân 172 nhân viên ra công khai internet, có thể vi phạm quy định bảo vệ dữ liệu cá nhân và ảnh hưởng uy tín tổ chức | GAP-02 | **Cao** |
| R3 | Nếu tiếp tục dùng dữ liệu giả cho tab Đối tượng thụ hưởng (GAP-04) trong khi vận hành thật, rủi ro không đáp ứng được yêu cầu minh bạch phân phối cứu trợ theo Điều cấm QĐ.03 #6 khi có kiểm tra/thanh tra | GAP-04 | **Trung bình-Cao** |
| R4 | Nếu không thống nhất ánh xạ 12 chức danh ↔ 8 role kỹ thuật (BRQ-08), rủi ro cấp sai quyền truy cập khi tuyển thêm nhân sự mới vào các chức danh tổ chức | BR-19 | **Trung bình** |

---

## PHẦN 7 — TIÊU CHÍ THÀNH CÔNG (BUSINESS SUCCESS CRITERIA)

🟠 ASSUMED — đề xuất, cần Ban Chỉ huy xác nhận thước đo cụ thể:
1. 100% các quyết định kích hoạt cấp độ 3-4 và tạo/đóng Sự cố khẩn được thực hiện bởi vai trò có thẩm quyền xác nhận theo văn bản (đo qua audit log — sau khi BRQ-01/02/04 được triển khai).
2. 0 khả năng truy cập PII (danh bạ) mà không qua xác thực (đo qua kiểm thử bảo mật — sau khi BRQ-03 triển khai).
3. 100% dự án cứu trợ có hồ sơ xác nhận thật (ký/ảnh) cho đối tượng thụ hưởng, 0% dữ liệu giả lập trong môi trường production (đo qua kiểm tra dữ liệu — sau khi BRQ-05 triển khai).
4. Có bảng ánh xạ chính thức 12↔8 role được nghiệp vụ ký xác nhận và áp dụng trong quy trình cấp quyền người dùng mới (sau khi BRQ-08 triển khai).

---

## PHẦN 8 — GIỚI HẠN CỦA TÀI LIỆU NÀY

- BRD này tổng hợp lại đầy đủ nhưng không lặp lại chi tiết file:line — mọi bằng chứng chi tiết kỹ thuật tham chiếu ngược về `GAP-ANALYSIS.md` và `PROCESS-RBAC-MODEL.md`.
- Các mức ưu tiên (P0-P3) ở Phần 5 là **đề xuất của audit dựa trên mức độ nghiêm trọng kỹ thuật/tuân thủ quy định**, không phải quyết định cuối cùng — Ban Chỉ huy/Chủ đầu tư có quyền điều chỉnh dựa trên ràng buộc nguồn lực thực tế.
- Tài liệu này **chưa bao gồm** đặc tả kỹ thuật chi tiết (API contract, schema thay đổi cụ thể) — sẽ nằm ở SRS (bước tiếp theo).
- Chưa rà soát sâu module AI chat (`ai.ts`) và một số route filter camera — nếu nghiệp vụ xác nhận đây là phạm vi ưu tiên, cần một vòng khảo sát AS-IS bổ sung trước khi đưa vào BRQ.
