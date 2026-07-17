// ============================================================
// CTG DATA — extracted from original prototype (locked schema)
// ============================================================

// ---------- UNITS ----------
window.UNITS = {
  BCH:  {name:'Ban chỉ huy tập đoàn', short:'BCH tập đoàn', icon:'🏛'},
  CT:   {name:'Công trường xây dựng (HIJ-KL · OPQRT · S)', short:'Công trường', icon:'🏗'},
  TN:   {name:'BQL Nhà Thống Nhất', short:'BQL Thống Nhất', icon:'🏢'},
  ECO:  {name:'BQL Cát Tường ECO', short:'BQL ECO', icon:'🏢'},
  CTN:  {name:'BQL Cát Tường New', short:'BQL CTN', icon:'🏢'},
  NHAM: {name:'BQL Nhà M – Yên Phong', short:'BQL Nhà M', icon:'🏢'},
  CTSYP:{name:'BQL CTS – Yên Phong', short:'BQL CTS-YP', icon:'🏢'},
  TTDY: {name:'TT Đông y – Khách sạn', short:'TTĐY-KS', icon:'🏨'},
  QLN:  {name:'Khối QLN – lệnh chung mọi BQL (Cty TNT)', short:'Khối QLN chung', icon:'🏘'},
  VP:   {name:'Văn phòng: HC-NS · Mua hàng · Kế toán · Hậu cần', short:'Văn phòng HCNS', icon:'🗂'},
  MKT:  {name:'Phòng Marketing – Truyền thông', short:'MKT', icon:'📣'},
  VPCT: {name:'Văn phòng Chủ tịch – Cơ quan thường trực điều phối', short:'VP Chủ tịch', icon:'🎖'},
  IT:   {name:'Bộ phận Chuyển đổi số / IT', short:'IT/CĐS', icon:'💻'},
  PC:   {name:'Trung tâm Pháp chế', short:'Pháp chế', icon:'⚖️'},
};

// ---------- LEVELS ----------
window.LEVELS = [
  {k:0, code:'XANH', qd:'Cấp 0 – Sẵn sàng', name:'SẴN SÀNG MÙA MƯA BÃO', cls:'lv0',
   trigger:'Mùa mưa bão, chưa có cảnh báo cụ thể (Điều 20.1 QĐ.03).',
   act:'Kiểm tra định kỳ · kho đủ định mức (hàng hỏng/hết hạn KHÔNG tính vào định mức) · danh sách trực + đầu mối sẵn sàng · bản tin Zalo 06:30/16:30 · diễn tập, hợp đồng nguồn cung.',
   auth:'Đơn vị / cơ sở tự duy trì',
   phases:['DAILY'], eoc:'EOC Level 3 – Giám sát', hk:'≈ Tín hiệu T1 (HK)'},
  {k:1, code:'VÀNG', qd:'Cấp 1 – Cảnh giác', name:'CẢNH GIÁC (≈72 GIỜ)', cls:'lv1',
   trigger:'Dự báo bão/mưa lớn khả năng ảnh hưởng trong ~72 giờ hoặc dấu hiệu bất thường tại cơ sở · dông lốc · gió giật cấp 6–7 (39–61 km/h).',
   act:'Họp nhanh đầu mối cơ sở; kiểm kê + chạy thử bơm, máy phát, bộ đàm, đèn; vệ sinh thoát nước; chụp hiện trạng; kích hoạt kịch bản MƯA khi có mưa; dừng làm việc trên cao khi gió giật mạnh.',
   auth:'TGĐ/người ủy quyền · GĐ đơn vị/BQL/CHT được kích hoạt tại chỗ + báo cáo ngay',
   phases:['DAILY','RP','RD','RA','T72'], eoc:'EOC Level 3→2', hk:'≈ Tín hiệu T3 (HK)'},
  {k:2, code:'CAM', qd:'Cấp 2 – Chuẩn bị ứng phó', name:'CHUẨN BỊ ỨNG PHÓ (24–48H)', cls:'lv2',
   trigger:'Nguy cơ ảnh hưởng trong 24–48 giờ · TIN BÃO KHẨN CẤP · mưa lớn kéo dài, thoát nước quá tải · cảnh báo cao của cơ quan thẩm quyền · RRTT cấp 3.',
   act:'Đưa thiết bị ra vị trí + sạc đầy; gia cố – chằng buộc; bảo vệ tủ điện/phòng máy chủ + sao lưu dữ liệu; chốt trực 24/24; mua gối đầu nhóm 2; mở mã chi phí; chốt giờ dừng thi công; sẵn sàng mở kho ≤15 phút.',
   auth:'TGĐ/người được ủy quyền quyết định · báo cáo Chủ tịch',
   phases:['DAILY','RP','RD','RA','T72','T48','T24','T12','T6'], eoc:'EOC Level 2 – Một phần', hk:'≈ Tín hiệu T8 (HK)'},
  {k:3, code:'ĐỎ', qd:'Cấp 3 – Khẩn cấp', name:'KHẨN CẤP', cls:'lv3',
   trigger:'Bão/mưa ảnh hưởng TRỰC TIẾP · ngập, mất điện, hư hỏng kết cấu, sự cố kỹ thuật · nguy cơ đe dọa người và tài sản · gió ≥cấp 10.',
   act:'DỪNG hoạt động – sơ tán – lập vùng cấm; trực 24/24; điều chuyển kho theo lệnh BCH; phối hợp cơ quan chuyên trách 112/114/115; chỉ hoạt động lại khi xác nhận an toàn theo Điều 52.',
   auth:'CHỦ TỊCH quyết định · chỉ huy hiện trường được xử lý tức thời khi đe dọa tính mạng',
   phases:['DAILY','RP','RD','RA','T72','T48','T24','T12','T6','DUR','R0','R24','R72','R7'], eoc:'EOC Level 1 – Toàn phần', hk:'≈ Tín hiệu T10 (HK)'},
  {k:4, code:'ĐẶC BIỆT', qd:'Cấp 4 – Đặc biệt', name:'HUY ĐỘNG TOÀN GROUP', cls:'lv4',
   trigger:'Thiệt hại lớn · NHIỀU cơ sở cùng bị ảnh hưởng · khu vực bị chia cắt · cần huy động toàn Group hoặc phối hợp cơ quan nhà nước (Điều 20.5).',
   act:'Chủ tịch trực tiếp chỉ huy; phương án đặc biệt; điều chuyển lực lượng – kho giữa các cơ sở; kích hoạt CỨU TRỢ THIÊN TAI (Chương VII); báo cáo liên tục; phối hợp chính quyền/MTTQ/Chữ thập đỏ.',
   auth:'CHỦ TỊCH trực tiếp chỉ huy và phê duyệt phương án riêng',
   phases:['DAILY','RP','RD','RA','T72','T48','T24','T12','T6','DUR','R0','R24','R72','R7'], eoc:'EOC Level 1 + liên cơ quan', hk:'Vượt T10 – ứng phó thảm họa'},
];

// ---------- PHASES ----------
window.PHASES = [
  {id:'DAILY',label:'Hằng ngày',sub:'mùa mưa bão',rel:'DAILY',off:0},
  {id:'RP',label:'Mưa – chuẩn bị',sub:'khi phát tin mưa',rel:'ACT',off:3},
  {id:'RD',label:'Mưa – trong mưa',sub:'trực liên tục',rel:'ACT',off:12},
  {id:'RA',label:'Mưa – sau mưa',sub:'khắc phục',rel:'ACT',off:24},
  {id:'T72',label:'T-72h',sub:'tin bão khả năng ảnh hưởng',rel:'T0',off:-48},
  {id:'T48',label:'T-48h',sub:'chuẩn bị tăng cường',rel:'T0',off:-24},
  {id:'T24',label:'T-24h',sub:'gia cố – chằng chống',rel:'T0',off:-10},
  {id:'T12',label:'T-12h',sub:'khóa hiện trường',rel:'T0',off:-6},
  {id:'T6',label:'T-6h',sub:'lệnh dừng – sơ tán',rel:'T0',off:-2},
  {id:'DUR',label:'Trong bão',sub:'trực chiến',rel:'T0',off:10},
  {id:'R0',label:'Sau bão 0–3h',sub:'an toàn trước tiên',rel:'T0',off:15},
  {id:'R24',label:'3–24h',sub:'khắc phục nhanh',rel:'T0',off:36},
  {id:'R72',label:'1–3 ngày',sub:'sửa chữa – hỗ trợ',rel:'T0',off:84},
  {id:'R7',label:'3–7 ngày',sub:'khôi phục – AAR',rel:'T0',off:180},
  {id:'ADHOC',label:'Giao bổ sung',sub:'lệnh điều động trực tiếp',rel:'ACT',off:6},
];

// ---------- PHONES ----------
window.PHONES = {
  'Lê Thái Hoàng':'0967861551','Nguyễn Văn Mạnh':'0912633659','Nguyễn Thị Gấm':'0396426502',
  'Đỗ Khắc Duy Quang':'0352850866','Nguyễn Duy Mạnh':'0906199606','Nguyễn Thị Phương Hoa':'0963123544',
  'Nguyễn Thị Yến Quyên':'0986072466','Phạm Thị Lan Hương':'0936172082','Phạm Thị Quỳnh':'0378172446',
  'Nguyễn Thị Hợi':'0983195838','Nguyễn Sỹ Mạnh Hùng':'0971189120','Đặng Thị Hồng Phương':'0379026949',
  'Hà Việt Đại':'0905854926','Ngô Quốc Thái':'0975296567','Nguyễn Đức Thìn':'0328052517',
};


// Helper for TASK_LIB entries: u=unit, p=phase, l=level, t=task title, o=owner name, c=checker name, n=note
// Declared as a var so `window.T(...)` calls inside the TASK_LIB literal resolve without `window.` prefix.
var T = window.T = (u, p, l, t, o, c, n) => ({ u, p, l, t, o, c, n: n || '' });
// ---------- TASK_LIB ----------
window.TASK_LIB = (function(){ const T = window.T; return [

/* ---------- CÔNG TRƯỜNG – HẰNG NGÀY (PCLB-CT-01, Phần A) ---------- */
window.T('CT','DAILY',0,'Mở điện thi công 05:00 – cắt điện 18:30; giữ điện chiếu sáng đường & tuần tra an ninh','Mr Hải (Cơ điện)','Mr Hiển'),
window.T('CT','DAILY',0,'Kiểm tra điện, nước thi công + tầng hầm các tòa lúc 07:00 & 17:30 — bơm chạy tốt, đủ rọ chắn rác','Mr Phức','Mr Hải'),
window.T('CT','DAILY',0,'Vận thăng dừng tầng 1 cách đất 50cm – ngắt điện; cẩu tháp thả cần quay tự do không hãm','Mr Bằng','Mr Dân'),
window.T('CT','DAILY',0,'Đóng toàn bộ cửa mặt ngoài căn hộ cụm HIJ sau giờ làm việc','Mr Luyến · Mr Thơ','Mr Viên','Gửi ảnh xác nhận trước 19:00'),
window.T('CT','DAILY',0,'Đóng toàn bộ cửa mặt ngoài căn hộ cụm KL sau giờ làm việc','Mr Khánh · Mr Ngay','Mr Viên','Gửi ảnh xác nhận trước 19:00'),
window.T('CT','DAILY',0,'Kiểm tra miệng thu nước, hố ga, mương chính, hàng rào, cổng, biển báo, nhà tạm — không tắc, không nghiêng đổ','Mr Dân','Mr Lộc'),
window.T('CT','DAILY',0,'Kiểm kê vật tư PCLB trong kho — không thấp hơn định mức tối thiểu','Mr Tiến (Thủ kho)','Mr Hiển'),
window.T('CT','DAILY',0,'Giao xử lý tồn tại trong ngày — rõ người làm + thời hạn hoàn thành','Mr Hiển','Mr Thi'),
window.T('CT','DAILY',0,'19:00 – Chỉ huy phó nhận đủ báo cáo hoàn thành của tất cả cụm tòa','Mr Hiển','Mr Thi','Sau 18:30 bảo vệ không cho người không nhiệm vụ ở lại; không tăng ca trái lệnh'),

/* ---------- CÔNG TRƯỜNG – KỊCH BẢN MƯA (Phần B) ---------- */
window.T('CT','RP',1,'Phát thông báo kích hoạt phương án mưa lớn toàn công trường','Mr Thi (Chỉ huy trưởng)','Giám đốc dự án'),
window.T('CT','RP',1,'Bố trí người trực máy bơm theo ca','Mr Hải','Mr Hiển'),
window.T('CT','RP',1,'Kiểm tra máy phát, nhiên liệu, đèn chiếu sáng dự phòng','Đội lái máy','Đội điện nước'),
window.T('CT','RP',1,'Kiểm tra toàn bộ cửa đã đóng: cụm HIJ + cụm KL','HIJ: Luyến-Thơ · KL: Khánh-Ngay','HIJ: Mr Mão · KL: Mr Phú'),
window.T('CT','RP',1,'Kiểm tra che chắn vật tư trên sàn các cụm','Tổ đội thi công','OPQ: Mr Thảo · RTS: Mr Hùng'),
window.T('CT','RP',1,'Kiểm tra tổng thể toàn công trường trước mưa','Mr Hiển','Mr Thi'),
window.T('CT','RD',1,'Trực theo dõi máy bơm và mực nước liên tục; hỏng → chuyển máy dự phòng ngay','Mr Hải','Mr Hiển','CẤM sửa điện khi đứng trong nước'),
window.T('CT','RD',1,'HIJ–KL: kiểm soát cửa tum, giếng thang, hố PIT, trần thạch cao, vật tư hoàn thiện','KL: Mr Phú · HIJ: Mr Mão','Mr Thi'),
window.T('CT','RD',1,'OPQRT & S: hố PIT, điểm trũng, chân vận thăng, giàn giáo, lưới bao che, vật tư trên sàn','OPQ: Mr Thảo · RST: Mr Hùng','Mr Hiển'),
window.T('CT','RD',1,'Hạ tầng + cụm nhà Y tế, Văn hóa, THLC','Mr Tuấn Anh','Mr Lộc'),
window.T('CT','RD',1,'Ghi nhật ký, chụp ảnh sự cố theo thời gian thực','Người trực được phân công','Mr Hiển'),
window.T('CT','RD',1,'Giám sát an toàn: không lên mái/giàn giáo khi sét-gió; không xuống hố PIT khi chưa cô lập điện; nước dâng nhanh → báo CHT ngay','Mr Hiển','Mr Thi'),
window.T('CT','RA',1,'Kiểm tra an toàn điện trước khi vào khu vực ướt','Mr Hải','Cán bộ ATLĐ'),
window.T('CT','RA',1,'Bơm hết nước đọng các vị trí','Mr Hải','KS hiện trường cụm'),
window.T('CT','RA',1,'Thu gom bùn rác, thông hố ga','Mr Hải + công nhật','KS hiện trường cụm'),
window.T('CT','RA',1,'Kiểm tra cửa, mái, hố PIT, vật tư từng tòa','Người phụ trách tòa','KS hiện trường cụm'),
window.T('CT','RA',1,'Kiểm tra giàn giáo, vận thăng, cẩu tháp trước khi hoạt động lại','Mr Dân','Mr Hiển'),
window.T('CT','RA',1,'Kiểm tra vật tư thiết bị bị ướt, lập danh sách xử lý','Tổ đội liên quan','KS hiện trường cụm'),
window.T('CT','RA',1,'Chụp ảnh, lập DS tồn tại, khoanh vùng khu vực chưa an toàn','KS hiện trường cụm','Mr Hiển'),
window.T('CT','RA',1,'Phân công khắc phục tồn tại','Mr Hiển','Giám đốc dự án'),
window.T('CT','RA',1,'Lệnh cho phép thi công trở lại (chỉ khi đã xác nhận an toàn)','Giám đốc dự án','—'),

/* ---------- CÔNG TRƯỜNG – KHI CÓ TIN BÃO (T-72) ---------- */
window.T('CT','T72',2,'Họp Ban chỉ huy PCLB công trường – rà soát phương án','Mr Thi','—'),
window.T('CT','T72',2,'Phân công người phụ trách chính + thay thế từng tòa','Mr Hiển','Mr Thi'),
window.T('CT','T72',2,'Lập danh sách lực lượng trực + số điện thoại','Mr Hiển','Mr Thi'),
window.T('CT','T72',2,'Kiểm kê vật tư, CCDC, máy bơm, máy phát, nhiên liệu — sẵn sàng 100%','Mr Tiến + Mr Hải + Mr Viên','Mr Hiển'),
window.T('CT','T72',2,'Nạo vét toàn bộ hố ga, mương thoát nước','Mr Hải + NT Tuấn Giáo','Mr Hiển'),
window.T('CT','T72',2,'Kiểm tra hàng rào, biển báo, nhà tạm, container','Mr Dân','Mr Hiển'),
window.T('CT','T72',2,'Chụp ảnh hiện trạng các cụm tòa (hồ sơ trước bão)','KS hiện trường cụm','Mr Hiển'),
window.T('CT','T72',2,'Thông báo thời điểm dự kiến dừng thi công','Mr Thi','—'),

/* ---------- CÔNG TRƯỜNG – TRƯỚC BÃO (T-48 → T-6) ---------- */
window.T('CT','T48',2,'Theo dõi tin bão liên tục; chốt thời điểm dừng thi công, thông báo toàn công trường','Mr Hiển','Mr Thi'),
window.T('CT','T24',2,'Vận thăng lồng về tầng thấp nhất, ngắt điện','Mr Bằng','Mr Dân'),
window.T('CT','T24',2,'Cẩu tháp về trạng thái an toàn, thả phanh quay tự do','Mr Tuấn Anh','Mr Dân','Dự báo ≥cấp 13: tháo hẳn cần theo khuyến cáo Sở Xây dựng'),
window.T('CT','T24',2,'Đưa ô tô, máy xúc, thiết bị ngoài trời về vị trí an toàn','Mr Khánh · Mr Thơ','Mr Viên'),
window.T('CT','T24',2,'Thu dọn vật tư từ tầng hầm đến mái, sắp xếp vào trong công trình','Nhà thầu thi công','KS hiện trường cụm'),
window.T('CT','T24',2,'Thu dọn vật tư trên mái/tum – che đậy, chằng buộc, gia cố','Nhà thầu thi công','KS hiện trường cụm'),
window.T('CT','T24',2,'Kho vật tư: đóng cửa, kiểm tra mái kho chống dột ướt vật tư','Mr Vụ','Mr Hiển'),
window.T('CT','T24',2,'Gia cố hệ giàn giáo, vật tư có nguy cơ đổ vỡ','Nhà thầu thi công','KS hiện trường cụm'),
window.T('CT','T24',2,'Bơm đầy nước các téc mái + cố định chắc chắn chống lật','Mr Hải','Mr Tiến (TVGS)'),
window.T('CT','T24',2,'Vệ sinh lối thoát nước từ mái xuống','Nhà thầu nước','Mr Tiến (TVGS)'),
window.T('CT','T24',2,'Lắp đặt + chạy thử máy bơm chống úng tại hầm các cụm tòa','Mr Phức','Mr Hải'),
window.T('CT','T24',2,'Kiểm tra logia, ga thu, ống chờ thoát nước mái → hầm','Nhà thầu nước','Mr Tiến (TVGS)'),
window.T('CT','T24',2,'Khơi thông hố ga, miệng thu, cống rãnh hạ tầng — không để rác bùn bịt tắc','Mr Lộc','Mr Hiển'),
window.T('CT','T24',2,'Gia cố biển hiệu trên cao, hàng rào tôn, cổng, container, mái kho','Mr Lộc','Mr Hiển'),
window.T('CT','T24',2,'Gia cố cây xanh mới trồng + cọc chống','Mr Huyên','Mr Hiển'),
window.T('CT','T12',2,'Ngắt toàn bộ điện thi công — chỉ duy trì nguồn máy bơm chống ngập','Mr Hải','Mr Hiển'),
window.T('CT','T12',2,'Đóng toàn bộ cửa các tầng; kiểm tra kính siêu thị + dãy chia lô, không để gió lùa nước hắt','Luyến · Khánh · Thơ · Ngay','Mr Viên'),
window.T('CT','T12',2,'Chụp ảnh hiện trạng trước bão; chốt danh sách người trực + SĐT liên hệ','Mr Hiển','Mr Thi'),
window.T('CT','T6',2,'KIỂM TRA LẦN CUỐI: không còn người & vật tư tại khu vực nguy hiểm — báo cáo xác nhận','Mr Hiển','Mr Thi'),

/* ---------- CÔNG TRƯỜNG – TRONG BÃO ---------- */
window.T('CT','DUR',3,'Trực máy bơm hầm & khu trũng theo ca — vận hành ngay khi nước dâng','Mr Hải · Mr Phức','Mr Hiển'),
window.T('CT','DUR',3,'Kiểm soát nguồn điện cấp bơm; trục trặc → thay máy dự phòng','Mr Hải · Mr Phức','Mr Hiển'),
window.T('CT','DUR',3,'Bố trí cán bộ + tổ đội ứng trực suốt thời gian bão; điểm danh từng ca','Mr Hiển','Mr Thi'),
window.T('CT','DUR',3,'Báo cáo NGAY khi: ngập hầm · mất điện/bơm hỏng · cửa kính bung · giàn giáo/hàng rào nguy cơ đổ · nước vào khu hoàn thiện','Người phát hiện','Mr Hiển'),
window.T('CT','DUR',3,'CẤM đưa người ra xử lý cửa, mái, kính, giàn giáo, cẩu tháp khi điều kiện không an toàn','Mr Hiển','Mr Thi'),

/* ---------- CÔNG TRƯỜNG – SAU BÃO ---------- */
window.T('CT','R0',3,'Kiểm tra toàn hiện trường từ hầm đến mái — xác định hư hỏng, sự cố do bão','KS hiện trường cụm','Mr Hiển'),
window.T('CT','R0',3,'Kiểm tra an toàn hệ thống điện thi công trước khi cấp lại','Mr Hải','Mr Hiển'),
window.T('CT','R0',3,'Khoanh vùng, rào chắn khu vực nguy hiểm (kính vỡ, giàn giáo nghiêng, trần võng)','Mr Dân','Mr Hiển'),
window.T('CT','R24',3,'Bơm thoát nước tầng hầm & khu vực ngập','Mr Hải','Mr Hiển'),
window.T('CT','R24',3,'Kiểm tra cửa, kính, mái, kho, vật tư; đặc biệt trần thạch cao tầng 1 nguy cơ sập võng','Mr Viên · Mr Vụ','Mr Hiển'),
window.T('CT','R24',3,'Kiểm tra giàn giáo ngoài, vận thăng, cẩu tháp, máy móc TRƯỚC khi vận hành lại','Mr Dân + đội giàn giáo','Mr Hiển'),
window.T('CT','R24',3,'Thu dọn nước-bùn-rác; khơi thông lại hố ga, cống rãnh','NT Tuấn Giáo','Mr Lộc'),
window.T('CT','R72',3,'Sửa chữa hạng mục hư hỏng; xử lý cửa kính, cửa nhôm, cửa kho bung kẹt','NT liên quan + đội nhôm kính','KS hiện trường cụm'),
window.T('CT','R72',3,'Gia cố lại giàn giáo, hàng rào, cây xanh','Mr Huyên','Mr Hiển'),
window.T('CT','R72',3,'Xử lý vật tư ướt/đổ/hỏng; sắp xếp lại vật tư máy móc trước khi thi công','Mr Vụ + NT thi công','KS hiện trường cụm'),
window.T('CT','R72',3,'Kiểm kê thiệt hại, chụp ảnh hiện trạng sau bão, lập biên bản','Mr Vụ + KS cụm','Mr Hiển'),
window.T('CT','R7',3,'Tổng hợp thiệt hại báo cáo Ban lãnh đạo; biên bản xử lý hư hỏng','Mr Hiển','Mr Thi'),
window.T('CT','R7',3,'Lệnh thi công trở lại — chỉ sau khi điện, giàn giáo, vận thăng, cẩu, kính đã xác nhận an toàn','Giám đốc dự án','—'),

/* ---------- BQL THỐNG NHẤT – TRƯỚC BÃO (KHPCLB 7.2026) ---------- */
window.T('TN','T48',2,'Tầng 20: kiểm tra giằng kéo biển chữ trên mái','Tổ Bảo trì','Trưởng BQL Quang'),
window.T('TN','T48',2,'Tầng 20: giằng níu téc nước, mái bể nước','Tổ Bảo trì','Trưởng BQL Quang'),
window.T('TN','T48',2,'Tầng 20: vệ sinh rãnh thoát nước; chuyển vật tư còn sót xuống','Tổ Vệ sinh','Trưởng BQL Quang'),
window.T('TN','T48',2,'Tầng 20: khóa, chèn cửa phòng máy & lối lên mái téc nước','Tổ Bảo vệ','Trưởng BQL Quang'),
window.T('TN','T24',2,'Hành lang tầng 2–19: chốt cửa thang thoát hiểm + cửa sổ đầu hồi','Tổ Bảo vệ','Trưởng BQL Quang'),
window.T('TN','T24',2,'Vệ sinh ga thoát nước tầng 2, sảnh phụ lộ thiên, hố ga lõi tầng 2','Tổ Vệ sinh','Trưởng BQL Quang'),
window.T('TN','T24',2,'Sửa các cửa bung bật bản lề (nếu có)','Tổ Bảo trì','Trưởng BQL Quang'),
window.T('TN','T24',2,'Tầng 1: chuẩn bị bao cát tại cửa kính sảnh; nhắc kiot chèn khóa cửa nhôm kính','Tổ Bảo vệ','Trưởng BQL Quang'),
window.T('TN','T24',2,'Tầng 1: kiểm tra cửa kỹ thuật thoát hiểm; sửa cửa nhôm lỏng hỏng','Tổ Bảo trì','Trưởng BQL Quang'),
window.T('TN','T24',2,'Chạy thử máy phát điện + bơm nước; kiểm tra cấp điện khu công cộng','Tổ Bảo trì','Trưởng BQL Quang'),
window.T('TN','T24',2,'Tầng hầm: kiểm tra bơm chống ngập B1+B2; vệ sinh rãnh, hố ga; bao cát cửa hầm','Bảo trì + Vệ sinh + Bảo vệ','Trưởng BQL Quang'),
window.T('TN','T24',2,'Đường nội bộ: nhà xe điện, ổ điện, tủ điện ngoài trời — NGẮT ĐIỆN khi mưa bão','Tổ Bảo trì','Trưởng BQL Quang'),
window.T('TN','T24',2,'Kiểm tra bốt bảo vệ (chân bốt, mối hàn); chuẩn bị công cụ tháo rào chắn xuống hầm','Tổ Bảo vệ','Trưởng BQL Quang'),
window.T('TN','T24',2,'Vệ sinh rãnh thoát, hố ga thu nước; cắt tỉa cây xanh','Tổ Vệ sinh','Trưởng BQL Quang'),
window.T('TN','T24',2,'Mượn phòng SHCĐ (làm việc với BQT) cho nhân viên nghỉ trực tại dự án','BQL','Ban Giám đốc QLN'),
window.T('TN','T24',2,'Thông báo cư dân + kiot: loa 2 lần/ngày, dán bảng tin, Zalo cư dân','BQL','Ban Giám đốc QLN'),

/* ---------- BQL ECO – TRƯỚC BÃO ---------- */
window.T('ECO','T48',2,'Tầng 20: giằng kéo biển chữ; giằng níu téc nước, mái bể','Tổ Bảo trì','Trưởng ban Nguyễn Văn Mạnh'),
window.T('ECO','T48',2,'Tầng 20: vệ sinh rãnh thoát; chuyển vật tư sót xuống; khóa chèn cửa phòng máy','Vệ sinh + Bảo vệ','Trưởng ban Nguyễn Văn Mạnh'),
window.T('ECO','T24',2,'Hành lang 2–19: chốt cửa ban công phụ thang thoát hiểm giữa nhà + cửa sổ đầu hồi phía thang hàng','Tổ Bảo vệ','Trưởng ban Nguyễn Văn Mạnh'),
window.T('ECO','T24',2,'Vệ sinh ga thoát nước ban công phụ thang giữa nhà; sửa cửa bung bản lề','Vệ sinh + Bảo trì','Trưởng ban Nguyễn Văn Mạnh'),
window.T('ECO','T24',2,'Tầng 1: bao cát cửa kính sảnh; nhắc kiot chèn khóa; kiểm tra cửa kỹ thuật thoát hiểm','Bảo vệ + Bảo trì','Trưởng ban Nguyễn Văn Mạnh'),
window.T('ECO','T24',2,'Chạy thử máy phát + bơm nước; kiểm tra điện công cộng','Tổ Bảo trì','Trưởng ban Nguyễn Văn Mạnh'),
window.T('ECO','T24',2,'Hầm B1+B2: kiểm tra bơm chống ngập; vệ sinh rãnh hố ga; bao cát cửa hầm','Bảo trì + Vệ sinh + Bảo vệ','Trưởng ban Nguyễn Văn Mạnh','⚠ ECO chưa có bơm dự phòng — mượn/điều phối từ CTN hoặc thuê ngay khi kích hoạt CAM'),
window.T('ECO','T24',2,'Chèn bịt cửa trạm biến áp, phòng bơm','Tổ Bảo vệ','Trưởng ban Nguyễn Văn Mạnh'),
window.T('ECO','T24',2,'Đường nội bộ: nhà xe điện, tủ điện ngoài trời (ngắt khi mưa); bốt bảo vệ; rào chắn hầm; rãnh + hố ga; cắt tỉa cây','BV + BT + VS','Trưởng ban Nguyễn Văn Mạnh'),
window.T('ECO','T24',2,'Mượn phòng SHCĐ N1-N2 (BV), tầng 20 N2 (VS), dự phòng SHCĐ N3 cho lực lượng trực','BQL','Ban Giám đốc QLN'),
window.T('ECO','T24',2,'Thông báo cư dân + kiot: loa 2 lần/ngày, bảng tin, Zalo','BQL','Ban Giám đốc QLN'),

/* ---------- BQL CÁT TƯỜNG NEW – TRƯỚC BÃO ---------- */
window.T('CTN','T48',2,'Tầng 20+21: giằng téc nước, duy trì đầy nước các téc; vệ sinh rãnh thoát, lá cây','Bảo trì + Vệ sinh','Cô Gấm (Trưởng ban)'),
window.T('CTN','T48',2,'Hạ giàn cây lan, chậu cây xuống đất; gia cố cửa kính ra sân','Bảo vệ + Bảo trì','Cô Gấm (Trưởng ban)'),
window.T('CTN','T48',2,'Gia cố + chèn bịt cửa ra ban công sau phòng karaoke','Tổ Bảo trì','Cô Gấm (Trưởng ban)'),
window.T('CTN','T24',2,'Gia cố cửa kính 2 cầu thang; chốt chắc cửa sổ cầu thang bộ','Bảo trì + Bảo vệ','Cô Gấm (Trưởng ban)'),
window.T('CTN','T24',2,'Tầng 1: tháo bóng cao áp sân pickleball (tùy thời tiết); thu gom chậu cây quanh đường nội bộ','Bảo trì + Bảo vệ','Cô Gấm (Trưởng ban)'),
window.T('CTN','T24',2,'Chạy thử máy phát – bơm nước; dọn lối quanh máy phát để thao tác tiếp dầu','Bảo trì + Bảo vệ','Cô Gấm (Trưởng ban)'),
window.T('CTN','T24',2,'Hầm: kiểm tra 2 bơm chống ngập; lắp sẵn tấm chắn nước cửa phụ; chuẩn bị bao cát chặn cửa hầm (tồn 25 bao)','Bảo trì + Bảo vệ','Cô Gấm (Trưởng ban)'),
window.T('CTN','T24',2,'Di chuyển xe lãnh đạo gửi hầm xuống Yên Phong (tùy diễn biến)','Anh Tường','Cô Gấm (Trưởng ban)'),
window.T('CTN','T24',2,'Căn hộ: bổ sung chốt cửa ban công các căn chưa lắp đợt trước','Tổ Bảo trì','Cô Gấm (Trưởng ban)'),
window.T('CTN','T24',2,'Văn phòng tầng 3+4: đóng chốt cửa ban công; gia cố giữ vách kính','Tổ Bảo trì','Cô Gấm (Trưởng ban)'),
window.T('CTN','T24',2,'Thông báo cư dân + kiot: loa 2 lần/ngày, bảng tin, Zalo','BQL','Ban Giám đốc QLN'),

/* ---------- BQL CTS YÊN PHONG – TRƯỚC BÃO ---------- */
window.T('CTSYP','T48',2,'Tầng 10: giằng biển chữ; giằng níu téc nước mái bể; vệ sinh rãnh thoát','Bảo trì + Vệ sinh','Trưởng BQL CTS-YP'),
window.T('CTSYP','T48',2,'Tầng 10: chuyển vật tư sót xuống; khóa chèn cửa phòng máy, phòng thờ, lối lên mái','Vệ sinh + Bảo vệ','Trưởng BQL CTS-YP'),
window.T('CTSYP','T24',2,'Hành lang 2–9: chốt cửa ban công phụ + cửa sổ đầu hồi; vệ sinh ga thoát thang giữa nhà; sửa cửa bung bản lề','BV + VS + BT','Trưởng BQL CTS-YP'),
window.T('CTSYP','T24',2,'Sân tầng 2: thu dọn ghế, ô che, vật rời','Tổ Vệ sinh','Trưởng BQL CTS-YP'),
window.T('CTSYP','T24',2,'Tầng 1: bao cát cửa kính sảnh; kiểm tra kính tầng 1 + cửa kỹ thuật thoát hiểm','BV + BT','Trưởng BQL CTS-YP'),
window.T('CTSYP','T24',2,'Chạy thử máy phát – bơm nước; kiểm tra TRẠM BIẾN ÁP','Tổ Bảo trì','Trưởng BQL CTS-YP'),
window.T('CTSYP','T24',2,'Hầm: bơm chống ngập; vệ sinh rãnh hố ga; bao cát cửa hầm','BT + VS + BV','Trưởng BQL CTS-YP'),
window.T('CTSYP','T24',2,'Đường nội bộ: nhà xe điện + tủ điện ngoài trời (ngắt khi mưa); bốt bảo vệ; rào chắn; rãnh hố ga; cắt tỉa cây','BV + BT + VS','Trưởng BQL CTS-YP'),
window.T('CTSYP','T24',2,'Chuẩn bị phòng SHCĐ cho nhân viên ở lại trực (BV: SHCĐ M1 · VS: phòng điện M2 · dự phòng SHCĐ M2)','BQL','Ban Giám đốc QLN'),
window.T('CTSYP','T24',2,'Thông báo cư dân: loa 2 lần/ngày, bảng tin, Zalo','BQL','Ban Giám đốc QLN'),

/* ---------- NHÀ M – YÊN PHONG ---------- */
window.T('NHAM','T24',2,'Kiểm tra 2 máy bơm chìm chống úng; chạy thử không tải','Tổ Bảo trì','Nguyễn Sỹ Mạnh Hùng (hậu cần)'),
window.T('NHAM','T24',2,'Chốt cửa hành lang, cửa sổ đầu hồi 2 tòa; khóa chèn phòng kỹ thuật','Tổ Bảo vệ','Trưởng BQL Nhà M'),
window.T('NHAM','T24',2,'Vệ sinh rãnh thoát, hố ga; chuẩn bị dụng cụ xử lý cây đổ (dao rựa, rìu đã mài bén)','Vệ sinh + Bảo trì','Trưởng BQL Nhà M'),
window.T('NHAM','T24',2,'Thông báo cư dân 200 căn: loa + Zalo + bảng tin','BQL','Ban Giám đốc QLN'),

/* ---------- TT ĐÔNG Y – KHÁCH SẠN ---------- */
window.T('TTDY','T48',2,'Tầng 11-12: giằng biển chữ; giằng téc nước; vệ sinh rãnh; chuyển vật tư sót; khóa phòng máy/phòng thờ','Khách sạn + Bảo trì QLN','Ms Quỳnh (QLCL)'),
window.T('TTDY','T24',2,'Hành lang 2–10: chốt cửa ban công phụ + cửa sổ đầu hồi; sửa cửa bung bản lề','TTĐY-KS + Bảo trì QLN','Ms Quỳnh (QLCL)'),
window.T('TTDY','T24',2,'Tầng 1: bao cát cửa kính sảnh; kiểm tra kính T1 + cửa kỹ thuật; máy phát – bơm','TTĐY-KS + Bảo trì QLN','Ms Quỳnh (QLCL)'),
window.T('TTDY','T24',2,'Vệ sinh rãnh thoát, hố ga; cắt tỉa cây xanh','Khách sạn','Ms Quỳnh (QLCL)'),
window.T('TTDY','T24',2,'Chuẩn bị phòng tầng 2-3 cho nhân viên ở lại trực','TTĐY-KS','Ms Quỳnh (QLCL)'),
window.T('TTDY','T24',2,'Thông báo khách lưu trú: loa 2 lần/ngày + tại quầy; hạn chế ra ngoài khi bão','Khách sạn','Ms Quỳnh (QLCL)'),

/* ---------- KHỐI QLN – LỆNH CHUNG (QT-08) ---------- */
window.T('QLN','T24',2,'Chạy thử máy phát điện: đảm bảo cấp tải ưu tiên — bơm hầm, bơm PCCC, chiếu sáng hành lang, thang máy cứu hộ, an ninh','Tổ Kỹ thuật các BQL','Lê Thái Hoàng'),
window.T('QLN','T24',2,'Kiểm tra hệ PCCC: bơm, họng nước, bình chữa cháy, báo cháy liên động; phương án kết hợp PCLB-PCCC khi chập điện do ngập','Tổ Kỹ thuật các BQL','Lê Thái Hoàng'),
window.T('QLN','T24',2,'Kê cao/che chắn tủ điện hầm có nguy cơ ngập; dán biển «Cấm vào hầm khi mưa lớn, bão»','Tổ Kỹ thuật các BQL','Trưởng BQL'),
window.T('QLN','T12',2,'Chốt quân số trực 24/24 tại 5 dự án theo DS trực; kênh bộ đàm: TN-3 · CTN-5 · ECO-9','Trưởng ban các BQL','Lê Thái Hoàng'),
window.T('QLN','DUR',3,'Trực 4 tổ: Kỹ thuật (hầm-phòng KT-mái) · Bảo vệ (cổng-hầm-sảnh-camera) · Vệ sinh (thoát nước) · Thông tin (Zalo-loa-hotline)','Toàn bộ ca trực','Trưởng BQL từng dự án'),
window.T('QLN','DUR',3,'KHÔNG cho cư dân xuống hầm; hạ rào chắn hầm khi mưa lớn; theo dõi phao báo mức nước','Tổ Bảo vệ + Kỹ thuật','Trưởng BQL'),
window.T('QLN','DUR',3,'Vận hành bơm hầm (tự động + tay); mất điện → nổ máy phát trong 5 phút','Tổ Kỹ thuật','Trưởng BQL'),
window.T('QLN','R0',3,'0–3h: khoanh vùng căng dây khu nguy hiểm; KHÔNG cho cư dân xuống hầm; kiểm tra mái, tường, kính, ban công; không cấp điện khi còn ẩm','Kỹ thuật + Bảo vệ','Trưởng BQL'),
window.T('QLN','R24',3,'3–24h: bơm nước, vệ sinh, khử khuẩn hầm; kiểm tra bơm + phao báo mức; test thang máy; kiểm tra PCCC, máy phát','Tổ Kỹ thuật','Lê Thái Hoàng'),
window.T('QLN','R72',3,'1–3 ngày: cắt tỉa cây gãy, xử lý cây đổ; kiểm tra mái + phễu thu + chống thấm; thay kính vỡ, bơm keo','Kỹ thuật + Vệ sinh + NT','Trưởng BQL'),
window.T('QLN','R72',3,'1–3 ngày: hỗ trợ cư dân lập biên bản thiệt hại tài sản; thông báo khu vực sửa chữa; bổ sung chiếu sáng, nước tạm nếu mất điện','BQL + CSKH','Lê Thái Hoàng'),
window.T('QLN','R7',3,'3–7 ngày: chạy kiểm tra toàn hệ kỹ thuật; báo cáo thiệt hại chi tiết; họp rút kinh nghiệm; cập nhật phương án + tập huấn lại','Trưởng BQL các dự án','Lê Thái Hoàng'),

/* ---------- VĂN PHÒNG HC-NS · MUA HÀNG · KẾ TOÁN ---------- */
window.T('VP','T72',2,'Rà soát hợp đồng nguyên tắc siêu thị/đại lý nhu yếu phẩm; cập nhật báo giá pin, cồn khô, thuốc y tế','Ms Hoa (BN-CTN) · Ms Quyên (YP)','Trưởng HC-NS'),
window.T('VP','T48',2,'LỆNH MUA GỐI ĐẦU nhóm 2: pin, cồn khô, túi thuốc, nhu yếu phẩm — bốc hàng về kho trong 6–12 giờ','Ms Hoa + Ms Quyên','Lê Thái Hoàng'),
window.T('VP','T48',2,'Cấp đủ dầu máy phát 200 lít/dự án × 5 dự án (ECO, TN, CTN, Nhà M, CTS-YP)','Ms Hoa (Mua hàng)','Lê Thái Hoàng'),
window.T('VP','T48',2,'KẾ TOÁN: mở mã chi phí sự kiện trên Bravo/MISA + thông báo hạn mức phê duyệt phân cấp tới các đơn vị','Ms Đặng Thị Hồng Phương (KTT)','Tổng Giám đốc'),
window.T('VP','T24',2,'Cấp phát nhu yếu phẩm theo định mức 2 mì + 2 sữa + 2 bánh mì + 1 xúc xích/người/ngày; nước 20-20-15-10-20 bình theo dự án','Hợi (TN) · Hương (ECO) · Hoa (CTN) · Hùng (Nhà M) · Quyên (YP)','KTT Phương'),
window.T('VP','T24',2,'Mở kho cứu trợ tập trung: kiểm đếm, bàn giao có ký sổ từng món','Thủ kho + HC-NS','Lê Thái Hoàng'),
window.T('VP','DUR',3,'Xe cơ động + lái xe trực sẵn sàng điều phối chi viện giữa các dự án','Hà Việt Đại (Lái xe)','Trưởng HC-NS'),
window.T('VP','R24',3,'Tổng hợp chi phí phát sinh theo mã sự kiện; hoàn thiện chứng từ trong 48 giờ','Ms Đặng Thị Hồng Phương (KTT)','Tổng Giám đốc'),
window.T('VP','R72',3,'Mua bù vật tư đã sử dụng về đúng định mức tối thiểu; kiểm kê lại toàn bộ kho','Mua hàng + Thủ kho','Trưởng HC-NS'),

/* ---------- MARKETING – TRUYỀN THÔNG (Kế hoạch content PCLB) ---------- */
window.T('MKT','DAILY',0,'06:30 – Bản tin thời tiết đầu ngày trên Zalo toàn công ty: mức cảnh báo + 3 việc cần làm [MKT-ZL-01]','Content MKT + Admin Zalo','MKT Lead'),
window.T('MKT','DAILY',0,'16:30 – Bản tin chiều & nhắc bàn giao an toàn cuối ngày; phản hồi «ĐÃ BÀN GIAO» [MKT-ZL-02]','Content MKT + Admin Zalo','MKT Lead'),
window.T('MKT','T72',2,'Cảnh báo sớm 72 giờ toàn công ty — nâng cảnh giác, không gây hoang mang; cấm chia sẻ tin chưa kiểm chứng [MKT-ZL-03]','Content MKT','MKT Lead'),
window.T('MKT','T48',2,'Thông báo chuyển chế độ cập nhật tăng cường: ghim Zalo + loa; yêu cầu xác nhận «ĐÃ NHẬN» trong 10 phút [MKT-ZL-04]','Content MKT + Admin Zalo','MKT Lead'),
window.T('MKT','T24',2,'«5 việc bắt buộc trước bão» toàn công ty — carousel 5 ảnh + loa 2 lần/ngày [MKT-ZL-05]','Content MKT + Design','MKT Lead'),
window.T('MKT','T24',2,'Thông báo an toàn công trường tới nhà thầu + công nhân: giờ rời công trường, vùng cấm, số trực [MKT-ZL-06]','Content MKT + Admin Zalo','MKT Lead'),
window.T('MKT','T24',2,'Bàn giao an toàn cuối ngày khối văn phòng: đóng cửa, sao lưu dữ liệu, tắt thiết bị [MKT-ZL-07]','Content MKT','MKT Lead'),
window.T('MKT','T24',2,'Bản tin trực vận hành cho BQL từng tòa — mẫu gửi dữ liệu chuẩn để cập nhật cư dân [MKT-ZL-08]','Content MKT','MKT Lead'),
window.T('MKT','T24',2,'«5 việc cư dân cần làm trước bão» từng tòa/khu: Zalo + infographic + loa 2 sáng 2 chiều [MKT-ZL-09]','Content MKT + Media loa','MKT Lead'),
window.T('MKT','T24',2,'Điều chỉnh lịch giao dịch khách hàng/đối tác — hẹn lại, kênh hỗ trợ [MKT-ZL-10]','Content MKT','MKT Lead'),
window.T('MKT','T12',2,'Nhắc cư dân lần 2: không xuống hầm khi cảnh báo, không lên mái, hỗ trợ người cần trợ giúp [MKT-ZL-11]','Content MKT + Media loa','MKT Lead'),
window.T('MKT','T6',2,'Thông báo DỪNG hạng mục + vùng cấm công trường: loa khẩn 3 lần; xác nhận đủ quân số rời vùng cấm [MKT-ZL-12]','Content MKT + Media loa','MKT Lead'),
window.T('MKT','T6',2,'Thông báo kết thúc làm việc/tăng ca khối văn phòng; không quay lại lấy tài sản [MKT-ZL-13]','Content MKT','MKT Lead'),
window.T('MKT','T6',2,'Ghim quy tắc «chỉ dùng thông tin từ Zalo công ty + loa» — chống tin nhiễu [MKT-ZL-14]','Content MKT + Monitoring','MKT Lead'),
window.T('MKT','T6',2,'Thông báo tạm dừng thang máy/khu vực (nếu có) tới cư dân + hotline hỗ trợ [MKT-ZL-15]','Content MKT + Admin Zalo','MKT Lead'),
window.T('MKT','DUR',3,'Bản tin trong bão 2–3 giờ/lần: thời tiết thực tế, tình trạng cơ sở, vùng hạn chế, số trực [MKT-ZL-16]','Content MKT','MKT Lead'),
window.T('MKT','DUR',3,'Nhắc duy trì lệnh dừng công trường khi có thay đổi: cấm làm trên cao, cấm vào vùng ngập/rò điện [MKT-ZL-17]','Content MKT + Media loa','MKT Lead'),
window.T('MKT','DUR',3,'Cư dân: khuyến cáo ở trong căn hộ; cảnh báo ngập cục bộ + sơ đồ lối thay thế; cập nhật nguồn điện trong 10 phút [MKT-ZL-19/20/21]','Content MKT + Admin Zalo','MKT Lead'),
window.T('MKT','DUR',3,'Monitoring 60 phút/lần: câu hỏi lặp, tin gây hoang mang, yêu cầu khẩn → chốt mẫu trả lời [MKT-ZL-23]','Monitoring MKT','MKT Lead'),
window.T('MKT','R0',3,'«CHƯA ĐƯỢC QUAY LẠI» — mưa giảm không đồng nghĩa an toàn; danh sách hầm/thang máy/khu chưa mở [MKT-ZL-24/25]','Content MKT + Admin Zalo','MKT Lead'),
window.T('MKT','R24',3,'Mở lại có điều kiện từng cơ sở; tái thi công có điều kiện (phổ biến đầu ca); mở lại văn phòng; khôi phục dịch vụ từng khu [MKT-ZL-26/27/28/29]','Content MKT','MKT Lead'),
window.T('MKT','R24',3,'Bài ghi nhận nội bộ (không tô vẽ hành động mạo hiểm) + kênh tiếp nhận phản ánh sau bão có cấu trúc [MKT-ZL-31/32]','Content MKT + Media','MKT Lead'),
window.T('MKT','R72',3,'Bài học truyền thông sau đợt mưa bão: độ phủ, tốc độ nhận tin, đề xuất cải tiến [MKT-ZL-33]','MKT Lead + Monitoring','Ban TGĐ'),

/* ---------- BAN CHỈ HUY TẬP ĐOÀN ---------- */
window.T('BCH','T72',2,'Họp BCH PCTT-CNCH tập đoàn: đánh giá tin bão, chốt cấp độ theo thẩm quyền Điều 8, phân công trực chỉ huy','Tổng Giám đốc','Chủ tịch'),
window.T('BCH','T48',2,'Quyết định kích hoạt Cấp 2 (thẩm quyền TGĐ) + duyệt kinh phí gối đầu; chốt lịch giao ban 09:00 & 16:00','Tổng Giám đốc','Chủ tịch'),
window.T('BCH','T24',2,'Giao ban kiểm đếm: % hoàn thành nhiệm vụ trước bão của từng đơn vị (mục tiêu 100% trước T-6)','Trực ban BCH','Tổng Giám đốc'),
window.T('BCH','T6',2,'LỆNH DỪNG toàn bộ hoạt động + xác nhận sơ tán khỏi khu nguy hiểm (Cấp 3-4: Chủ tịch quyết; đe dọa tức thời: chỉ huy hiện trường ra lệnh trước, báo cáo sau)','Chủ tịch / TGĐ theo Điều 8','—'),
window.T('BCH','DUR',3,'Trực chỉ huy 24/24 tại phòng điều hành; tổng hợp báo cáo các đơn vị 2–3h/lần; điều phối chi viện','Trực ban BCH','Tổng Giám đốc'),
window.T('BCH','R0',3,'Ban hành lệnh «chưa quay lại»; chỉ cho hoạt động lại từng phần theo Điều 52 (BM-PCLB-10)','Chủ tịch / người được ủy quyền','—'),
window.T('BCH','R24',3,'Duyệt phương án + ngân sách khắc phục theo mã chi phí sự kiện (>20tr: Chủ tịch/TGĐ theo phân cấp)','Chủ tịch / Tổng Giám đốc','—'),
window.T('BCH','R7',3,'Chủ trì họp AAR (4 câu hỏi) trong 72h; giao hành động cải tiến có người + deadline; cập nhật phương án/định mức','Chủ tịch Cát Tường Group','—'),

/* ---------- VĂN PHÒNG CHỦ TỊCH – CƠ QUAN THƯỜNG TRỰC (Điều 9, QĐ.03) ---------- */
window.T('VPCT','T72',1,'Tiếp nhận – xác minh thông tin dự báo từ nguồn chính thống; tham mưu cấp độ kích hoạt cho người có thẩm quyền','Văn phòng Chủ tịch','Chủ tịch'),
window.T('VPCT','T72',2,'Phát hành thông báo kích hoạt: cấp độ, phạm vi, người chỉ huy, nhiệm vụ, kênh liên lạc, chế độ báo cáo (Điều 42.2)','Văn phòng Chủ tịch','Chủ tịch'),
window.T('VPCT','T48',2,'Theo dõi xác nhận lệnh 15 phút của các đơn vị; không phản hồi → gọi trực tiếp + kích hoạt người thay thế (Điều 42.3)','Văn phòng Chủ tịch','Chủ tịch'),
window.T('VPCT','DUR',3,'Điều phối liên đơn vị; tổng hợp báo cáo nhanh; đầu mối liên hệ chính quyền/cơ quan chuyên trách khi cần cứu nạn','Văn phòng Chủ tịch','Chủ tịch'),
window.T('VPCT','R24',3,'Báo cáo nhanh sau sự cố ≤4 giờ (BM-PCLB-09); báo cáo đầy đủ ≤3 ngày làm việc trình Ban Lãnh đạo (Điều 68)','Văn phòng Chủ tịch','Chủ tịch'),
window.T('VPCT','R7',3,'Tổ chức họp rút kinh nghiệm; theo dõi thực hiện kết luận; đề xuất cập nhật Quy định/phương án','Văn phòng Chủ tịch','Chủ tịch'),
window.T('VPCT','DUR',4,'CẤP 4: Vận hành trung tâm điều phối toàn Group, báo cáo Chủ tịch liên tục; đầu mối MTTQ/Chữ thập đỏ/chính quyền về cứu trợ','Văn phòng Chủ tịch','Chủ tịch'),
window.T('VPCT','R24',4,'CẤP 4: Đánh giá nhanh cứu trợ — ≤30′ kiểm nguồn tin, ≤60′ liên hệ địa phương, ≤2h báo cáo + đề xuất cấp độ cứu trợ (Điều 61)','Văn phòng Chủ tịch','Chủ tịch'),
window.T('VPCT','R72',4,'CẤP 4: Trình phương án cứu trợ (đối tượng, suất quà mẫu chuẩn, tuyến, đoàn 6 tổ, ngân sách, an toàn) — Chủ tịch phê duyệt (Điều 60-62)','Văn phòng Chủ tịch','Chủ tịch'),

/* ---------- IT / CHUYỂN ĐỔI SỐ (Điều 15, 24, 57) ---------- */
window.T('IT','T48',2,'Sao lưu toàn bộ dữ liệu trọng yếu; kiểm tra UPS, cảm biến rò nước, cảnh báo phòng máy chủ; chốt thứ tự tải ưu tiên','Bộ phận IT/CĐS','Trưởng IT'),
window.T('IT','T48',2,'Cấu hình – đánh số – kiểm tra bộ đàm, sạc dự phòng; phát danh sách kênh liên lạc + đầu mối hỗ trợ 24/7','Bộ phận IT/CĐS','Trưởng IT'),
window.T('IT','T24',2,'Kích hoạt phương án làm việc từ xa khối văn phòng; di dời/bảo vệ thiết bị lưu trữ khỏi vùng nguy cơ ngập','Bộ phận IT/CĐS','Trưởng IT'),
window.T('IT','DUR',3,'Trực hệ thống: mạng, camera, cảnh báo; nước vào phòng máy chủ → ưu tiên an toàn điện, ngắt có kiểm soát, bảo toàn dữ liệu; cấm người không chuyên can thiệp','Bộ phận IT/CĐS','Trưởng IT'),
window.T('IT','R24',3,'Khôi phục hệ thống theo thứ tự ưu tiên; kiểm tra toàn vẹn dữ liệu; báo cáo tình trạng hạ tầng số','Bộ phận IT/CĐS','Trưởng IT'),

/* ---------- TRUNG TÂM PHÁP CHẾ (Điều 11, 69, 70) ---------- */
window.T('PC','T48',2,'Rà soát pháp lý văn bản huy động, hợp đồng thuê ngoài khẩn cấp, nội dung thông báo cư dân trước khi phát hành','Trung tâm Pháp chế','GĐ Trung tâm Pháp chế'),
window.T('PC','R24',3,'Hướng dẫn biên bản thiệt hại tài sản cư dân/khách hàng — khách quan, KHÔNG tự nhận trách nhiệm/cam kết bồi thường khi chưa được duyệt (Điều 69.2)','Trung tâm Pháp chế','GĐ Trung tâm Pháp chế'),
window.T('PC','R72',3,'Tham gia xác minh vụ việc thiệt hại nghiêm trọng; hồ sơ bảo hiểm – tranh chấp; hướng dẫn lưu trữ hồ sơ (Điều 70, 73)','Trung tâm Pháp chế','GĐ Trung tâm Pháp chế'),

/* ---------- HC-NS – VẬN HÀNH KHO THEO QĐ.03 (Điều 29, 30, 34, 37) ---------- */
window.T('VP','T48',2,'Kiểm tra bộ cơ động kho tổng: niêm phong, danh mục, ngày kiểm tra, xe nhận — sẵn sàng xuất ≤30 phút từ lệnh','Trung tâm HC-NS + Thủ kho tổng','Trưởng HC-NS'),
window.T('VP','T24',2,'Xác nhận từng cơ sở: người mở kho vệ tinh + người thay thế có mặt/bàn giao chìa khóa ≤15 phút; chìa dự phòng niêm phong tại Bảo vệ','Trưởng BQL các cơ sở','Trung tâm HC-NS'),
window.T('VP','R24',3,'Sổ xuất khẩn cấp → hoàn thiện phiếu đầy đủ ≤24h; bù định mức: cứu sinh/chống ngập ≤24h, thiết yếu ≤48h, còn lại ≤5 ngày','Trung tâm HC-NS + Thủ kho','Trưởng HC-NS'),

/* ---------- CẤP 4 – ĐẶC BIỆT: HUY ĐỘNG TOÀN GROUP ---------- */
window.T('BCH','DUR',4,'CẤP 4: Chủ tịch trực tiếp chỉ huy; lệnh điều chuyển lực lượng – thiết bị giữa các cơ sở; ưu tiên nơi nguy cơ tính mạng, hạ tầng điện/IT, ngập nhanh (Điều 30.5)','Chủ tịch Cát Tường Group','—'),
window.T('VP','DUR',4,'CẤP 4: Điều phối luồng hàng liên cơ sở theo lệnh BCH; ghi nhận toàn bộ luồng; điểm tập kết tạm phải có người quản lý + sổ nhanh + che chắn (Điều 30.4)','Trung tâm HC-NS','Chủ tịch'),
window.T('MKT','DUR',4,'CẤP 4: Phát ngôn một đầu mối được phân công; kiểm duyệt hình ảnh nhạy cảm; không công bố dữ liệu cá nhân (Điều 66)','Truyền thông + MKT Lead','VP Chủ tịch'),
]; })();

// ---------- PHONEBOOK ----------
window.PHONEBOOK = [
/* Văn phòng */
['Lê Thái Hoàng','Giám đốc QLN','Trưởng team PCLB QLN','VP','','0967861551'],
['Phạm Thị Lan Hương','CSKH','Hậu cần ECO','VP','','0936172082'],
['Phạm Thị Quỳnh','QLCL','Hậu cần Khách sạn – TT Đông y','VP','','0378172446'],
['Đặng Thị Hồng Phương','Kế toán trưởng','Tài chính – mã chi phí sự kiện','VP','','0379026949'],
['Nguyễn Sỹ Mạnh Hùng','Kinh doanh','Hậu cần Nhà M – Yên Phong','VP','','0971189120'],
['Nguyễn Thị Phương Hoa','HCNS','Mua hàng – Hậu cần Bắc Ninh – CTN','VP','','0963123544'],
['Nguyễn Thị Yến Quyên','HCNS','Mua hàng – Hậu cần Yên Phong','VP','','0986072466'],
['Nguyễn Thị Hợi','Kinh doanh','Hậu cần Thống Nhất','VP','','0983195838'],
['Hà Việt Đại','Lái xe','Xe cơ động điều phối','VP','','0905854926'],
/* ECO */
['Nguyễn Văn Mạnh','Trưởng ban','Trưởng ban phụ trách ECO','ECO','9','0912633659'],
['Nguyễn Duy Mạnh','Tổ trưởng VH cơ điện BN','Trực kỹ thuật ECO','ECO','9','0906199606'],
['Nguyễn Bình Dương','Bảo trì','Trực dự án ECO','ECO','9','0988145666'],
['Nguyễn Đức Quân','Bảo trì','Trực dự án ECO','ECO','9','0799201089'],
['Hoàng Ngọc Tuấn','Thang máy','Trực ECO – Thống Nhất','ECO','','0862290768'],
['Nguyễn Văn Nguyên','Bảo vệ','Ca ngày ECO','ECO','','0369698162'],
['Bùi Văn Hải','Bảo vệ','Ca ngày ECO','ECO','','0972585479'],
['Trịnh Quang Đồng','Bảo vệ','Ca ngày ECO','ECO','','0868492682'],
['Đỗ Đức Cường','Bảo vệ','Ca ngày ECO','ECO','','0366466883'],
['Ngô Văn Duy','Bảo vệ','Ca ngày ECO','ECO','','0972679161'],
['Hoàng Văn Sơn','Bảo vệ','Ca ngày ECO','ECO','','0906043338'],
['Kiều Cao Thế','Bảo vệ','Ca đêm ECO','ECO','','0359670638'],
['Hoàng Thế Trình','Bảo vệ','Ca đêm ECO','ECO','','0366445190'],
['Ngô Văn Phúc','Bảo vệ','Ca đêm ECO','ECO','','0906599380'],
['Nguyễn Đình Thụ','Bảo vệ','Ca đêm ECO','ECO','','0854527957'],
['Nguyễn Văn Thịnh','Bảo vệ','Ca đêm ECO','ECO','','0332587540'],
['Nguyễn Thị Lựa','Vệ sinh','CT1 ECO','ECO','','0961590557'],
['Nguyễn Thị Lộc','Vệ sinh','CT1 ECO','ECO','','0963691408'],
['Vũ Thị Thúy','Vệ sinh','CT2 ECO','ECO','','0868133571'],
['Nguyễn Thị Hạt','Vệ sinh','CT2 ECO','ECO','','0918856001'],
['Hoàng Thị Thanh','Vệ sinh','CT3 ECO','ECO','','0329959682'],
['Phạm Thị Hà','Vệ sinh','CT3 ECO','ECO','','0847761077'],
['Nguyễn Thị Thêu','Vệ sinh','CT4 ECO','ECO','','0397862318'],
['Nguyễn Thị Giang','Vệ sinh','CT4 ECO','ECO','','0398319978'],
['Trần Thị Hoa','Vệ sinh','Cảnh quan ECO','ECO','','0398402323'],
/* CTN */
['Nguyễn Thị Gấm','Trưởng ban','Trưởng ban phụ trách CTN','CTN','5','0396426502'],
['Ngô Quốc Thái','Bảo trì','Trực dự án CTN','CTN','5','0975296567'],
['Nguyễn Đức Thìn','Bảo trì','Trực dự án CTN','CTN','5','0328052517'],
['Nguyễn Văn Hưng','Thang máy','Trực CTN','CTN','','0972763632'],
['Phạm Quốc Bình','Bảo vệ','Ca đêm CTN','CTN','5','0968540398'],
['Phạm Quang Hiếu','Bảo vệ','Ca ngày CTN','CTN','5','0353446255'],
['Nguyễn Thìn','Bảo vệ','Ca đêm CTN','CTN','5','0964196296'],
['Nguyễn Văn Tuấn','Bảo vệ','Ca đêm CTN','CTN','5','0389147465'],
['Phan Đình Chương','Bảo vệ','Ca ngày CTN','CTN','5','0365383648'],
['Nguyễn Thị Hà','Vệ sinh','Ca ngày CTN','CTN','','0336815520'],
['Nguyễn Thị Khánh','Vệ sinh','Ca ngày CTN','CTN','','0967892619'],
/* Thống Nhất */
['Đỗ Khắc Duy Quang','Trưởng ban','Trưởng ban phụ trách Thống Nhất','TN','3','0352850866'],
['Nguyễn Tiến Hợp','Bảo vệ','Ca đêm TN','TN','3','0965672315'],
['Nguyễn Xuân Cường','Bảo vệ','Ca đêm TN','TN','3','0396965523'],
['Nguyễn Đăng Khoa','Bảo vệ','Ca đêm TN','TN','3','0962976650'],
['Mạnh Trọng Hưng','Bảo vệ','Ca đêm TN','TN','3','0356935946'],
['Lại Đắc Doanh','Bảo vệ','Ca đêm TN','TN','3','0961176578'],
['Phạm Văn Thịnh','Bảo vệ','Ca đêm TN','TN','3','0985056597'],
['Nguyễn Văn Quang','Bảo vệ','Ca đêm TN','TN','','0968013585'],
['Nguyễn Trọng Thể','Bảo vệ','Ca ngày TN','TN','3','0386319845'],
['Nguyễn Mạnh Toản','Bảo vệ','Ca ngày TN','TN','3','0399595266'],
['Ngô Đắc Tặng','Bảo vệ','Ca ngày TN','TN','3','0971597288'],
['Ngô Quang Hà','Bảo vệ','Ca ngày TN','TN','3','0866760336'],
['Nguyễn Tuấn Bình','Bảo vệ','Ca ngày TN','TN','3','0384187231'],
['Ngô Đức Thịnh','Bảo vệ','Ca ngày TN','TN','3','0984056254'],
['Nguyễn Hoa Dung','Vệ sinh','Tòa N4 TN','TN','','0978185034'],
['Hoàng Thị Phương','Vệ sinh','Tòa N4 TN','TN','','0399756696'],
['Nguyễn Thị Luận','Vệ sinh','Tòa N3 TN','TN','','0368178376'],
['Nguyễn Thị Độ','Vệ sinh','Tòa N3 TN','TN','','0357460309'],
['Nguyễn Thị Tùng','Vệ sinh','Tòa N2 TN','TN','','0357094201'],
['Bùi Thị Dung','Vệ sinh','Tòa N2 TN','TN','','0388618728'],
['Nguyễn Thị Tuyết','Vệ sinh','Tòa N1 TN','TN','','0379499764'],
/* Công trường – ban chỉ huy (SĐT điền khi ban hành chính thức) */
['Mr Thi','Chỉ huy trưởng','BCH công trường – quyết định dừng/thi công lại','CT','',''],
['Mr Hiển','Chỉ huy phó','Điều phối tổ đội, tổng hợp báo cáo 19:00','CT','',''],
['Mr Hải','Đội trưởng cơ điện','Điện nước, máy bơm, máy phát','CT','',''],
['Mr Dân','Ban cơ giới / ATLĐ','Cẩu tháp, vận thăng, giàn giáo, hàng rào','CT','',''],
['Mr Viên','Ban cơ giới','Đóng cửa, máy móc, kiểm tra tòa','CT','',''],
['Mr Tiến (kho)','Thủ kho','Vật tư PCLB công trường','CT','',''],
['Mr Lộc','Hạ tầng','Hố ga, biển hiệu, hàng rào, thoát nước','CT','',''],
['Mr Phú / Mr Mão','KS cụm KL / HIJ','Phụ trách cụm hoàn thiện','CT','',''],
['Mr Thảo / Mr Hùng','KS cụm OPQ / RTS','Phụ trách cụm thi công thô','CT','',''],
['Mr Tuấn Anh · Mr Bằng · Mr Phức','Cẩu tháp · Vận thăng · Bơm','Thiết bị nâng & chống ngập','CT','',''],
['Mr Vụ · Mr Huyên','Kho vật tư · Cây xanh','Kho + cảnh quan công trường','CT','',''],
];

// ---------- SCENARIOS ----------
window.SCENARIOS = [
{id:'KB-B1',g:'B',lv:1,name:'Mưa lớn cục bộ 50–120mm / dông sét',
 trg:'Cảnh báo mưa dông của NCHMF; mây dông phát triển nhanh trong 3–6h.',
 asm:'Ngập cục bộ điểm trũng công trường 20–40cm; nước tràn hố PIT; sét đánh khu vực cẩu tháp; 1 máy bơm quá tải.',
 force:'Đội cơ điện CT + tổ Kỹ thuật các BQL; trực bơm 2 người/vị trí.',
 act:['Phát lệnh cấp VÀNG – kịch bản mưa (gói RP/RD/RA)','Dừng làm việc trên cao, hạ người khỏi giàn giáo khi có sét','Trực bơm liên tục, cô lập điện khu vực ngập','Rào chắn điểm ngập, cấm xuống hố PIT','Sau mưa: bơm cạn – kiểm tra điện – cho làm lại theo lệnh'],
 sla:'Bơm vận hành ≤10 phút từ khi nước dâng; báo cáo mực nước mỗi giờ; 0 tai nạn điện.',
 drill:'Mỗi tháng 1 lần đầu mùa (tháng 5–6).'},
{id:'KB-B2',g:'B',lv:2,name:'ATNĐ / Bão cấp 8–9 vào Bắc Bộ (RRTT cấp 3)',
 trg:'Tin bão KHẨN CẤP – dự kiến ảnh hưởng đất liền ≤48h; gió Bắc Ninh cấp 6–8, giật 9–10.',
 asm:'Tốc mái tôn nhà tạm, đổ 5–10% cây xanh, bung 1–2 cửa kính căn hộ chưa chèn chốt, mất điện lưới 2–6h từng khu.',
 force:'Toàn bộ gói TRƯỚC BÃO T-48→T-6; trực 24/24 tại 5 BQL + công trường; BCH họp 2 lần/ngày.',
 act:['Kích hoạt cấp CAM – phát toàn bộ nhiệm vụ trước bão','Hạ cần cẩu tháp, vận thăng về tầng 1, ngắt điện thiết bị nâng','Bao cát cửa hầm + sảnh; chạy thử toàn bộ bơm & máy phát','Mua gối đầu nhu yếu phẩm (lệnh T-48, hàng về ≤12h)','MKT phát chuỗi ZL-04→ZL-15 đúng mốc thời gian'],
 sla:'100% nhiệm vụ trước bão hoàn thành trước T-6; 100% nhân sự xác nhận nhận lệnh ≤30 phút.',
 drill:'Diễn tập bàn tròn (tabletop) tháng 5 hằng năm.'},
{id:'KB-B3',g:'B',lv:3,name:'Bão mạnh cấp 10–12 ảnh hưởng trực tiếp (kịch bản Yagi)',
 trg:'Tin bão khẩn cấp/trên đất liền; tâm bão qua đồng bằng Bắc Bộ; gió BN cấp 9–11 giật 12–14; RRTT cấp 3–4.',
 asm:'Theo bài học Yagi 9/2024: vỡ kính mặt dựng & căn hộ hàng loạt tại nhà cao tầng; nước tràn qua khe cửa; đổ >30% cây; tốc mái kho; mất điện diện rộng 12–48h; sập giàn giáo nếu chưa gia cố; nguy cơ ngập hầm do mưa hoàn lưu sau bão.',
 force:'Cấp ĐỎ toàn tập đoàn; chỉ lực lượng trực ở lại; BCH trực 24/24 tại phòng điều hành.',
 act:['Lệnh DỪNG toàn bộ thi công + sơ tán trước T-6','Cư dân: khuyến cáo ở trong căn hộ, chèn băng keo cửa kính lớn, không ra ban công','Cấm tuyệt đối ra ngoài xử lý khi gió mạnh (bài học tử vong Yagi)','Máy phát chỉ cấp tải ưu tiên; theo dõi hầm bằng phao báo mức','Sau bão: quy trình R0→R7, chưa ai quay lại khi chưa có lệnh'],
 sla:'0 thương vong; thời gian khôi phục vận hành tòa nhà ≤72h; công trường thi công lại ≤7 ngày.',
 drill:'Diễn tập thực binh 1 lần/năm trước mùa bão (tháng 6) — bắt buộc theo Luật PCCC&CNCH cho phần CNCH.'},
{id:'KB-B4',g:'B',lv:3,name:'Ngập hầm xe do mưa hoàn lưu (sự cố trọng điểm)',
 trg:'Mưa hoàn lưu sau bão >150mm/12h; nước đường đô thị dâng tràn ram dốc; bơm hầm quá công suất hoặc mất điện.',
 asm:'Nước vào hầm B1 200–500m³; nguy cơ ngập tủ điện, trạm bơm PCCC đặt tại hầm; ~50–200 xe máy + ô tô trong hầm; nguy cơ chập điện – cháy (liên động PCCC).',
 force:'Tổ kỹ thuật + bảo vệ dự án bị ảnh hưởng; chi viện bơm từ dự án lân cận + công trường (bơm 5HP); xe cơ động VP.',
 act:['Hạ tấm chắn + đắp bao cát 2 lớp cửa hầm; CẤM cư dân xuống hầm','Di dời xe (ưu tiên xe điện) lên mặt đất theo loa gọi từng tầng','CẮT ĐIỆN hầm trước khi nước chạm tủ; giữ nguồn riêng cho bơm','Chạy toàn bộ bơm + bơm chi viện; trực 2 người/máy','Sau rút nước: khử khuẩn, kiểm tra cách điện rồi mới cấp lại'],
 sla:'Phát hiện nước tràn ≤5 phút (tuần tra 30 phút/lần); di dời xe điện ≤60 phút; 0 sự cố điện giật.',
 drill:'Diễn tập kéo bơm chi viện liên dự án 2 lần/mùa.'},
{id:'KB-B5',g:'B',lv:2,name:'Bung – vỡ kính mặt ngoài khi gió giật',
 trg:'Gió giật ≥cấp 9 tại chỗ; phát hiện cửa kính rung mạnh/bung nẹp tại căn hộ, sảnh, siêu thị hoặc vách kính VP tầng 3-4 CTN.',
 asm:'1–5 ô kính vỡ rơi từ tầng cao; nước hắt vào căn hộ/khu hoàn thiện; nguy hiểm người bên dưới.',
 force:'Tổ bảo trì + bảo vệ tại chỗ; đội nhôm kính công trường chi viện sau gió.',
 act:['Rào chắn ngay khu vực bên dưới, sơ tán người khỏi vệt rơi','Đưa cư dân/căn hộ liên quan sang phòng SHCĐ tầng an toàn','KHÔNG cử người ra gia cố khi gió còn mạnh — chỉ xử lý từ phía trong','Chèn khăn/băng keo chữ X các ô kính lớn liền kề','Sau gió: đội nhôm kính vá tạm bằng bạt + ván, lập biên bản thiệt hại'],
 sla:'Rào chắn ≤10 phút từ khi phát hiện; 0 người bị thương do kính rơi.',
 drill:'Đưa vào diễn tập bàn tròn cùng KB-B2.'},
{id:'KB-B6',g:'B',lv:4,name:'Mất điện lưới toàn khu >24h · nhiều cơ sở cùng ảnh hưởng',
 trg:'Lưới điện khu vực sự cố diện rộng (kịch bản Yagi: nhiều nơi mất điện 2–5 ngày).',
 asm:'5 tòa nhà chạy máy phát; nhiên liệu tiêu hao ~40–60 lít/máy/ngày; thang máy dừng; nước sinh hoạt phụ thuộc bơm.',
 force:'Tổ kỹ thuật các BQL + Mua hàng (tiếp dầu) + MKT (thông báo cắt giảm tải).',
 act:['Máy phát chỉ cấp tải ưu tiên: bơm nước SH theo khung giờ, bơm PCCC, chiếu sáng hành lang, 1 thang máy cứu hộ','Lập lịch bơm nước + thông báo khung giờ cho cư dân','Điều phối tiếp dầu: định mức 200 lít/dự án, đặt thêm theo hợp đồng nguyên tắc','Điểm sạc điện thoại miễn phí tại sảnh (bài học Viettel sau Yagi)','Theo dõi nhiệt độ máy phát, nghỉ luân phiên theo khuyến cáo kỹ thuật'],
 sla:'Không gián đoạn bơm PCCC; cư dân có nước sinh hoạt ≥2 khung giờ/ngày; dầu dự trữ không xuống dưới 30%.',
 drill:'Chạy thử tải thật máy phát 1 lần/quý.'},
{id:'KB-C1',g:'C',lv:2,name:'Cháy căn hộ (sự cố mức 1–2)',
 trg:'Báo cháy tự động 1 điểm hoặc cư dân báo qua hotline; khói từ 1 căn hộ.',
 asm:'Cháy chập điện/bếp trong 1 căn; khói lan hành lang 1 tầng; 5–20 cư dân cần hướng dẫn thoát nạn tầng đó.',
 force:'Đội PCCC cơ sở BQL (ca trực 7–8 người); cảnh sát PCCC 114.',
 act:['Bấm chuông báo động tầng + GỌI 114 ngay (không chờ xác minh xong)','Cắt điện tầng cháy; thang máy về tầng 1 khóa','Đội cơ sở dùng bình + họng nước khống chế; cứu người trước','Hướng dẫn cư dân thoát theo thang bộ, khăn ướt che mũi, KHÔNG thang máy','Đón xe 114, bàn giao sơ đồ + chìa khóa kỹ thuật; bảo vệ hiện trường'],
 sla:'114 được gọi ≤2 phút; đội cơ sở tiếp cận ≤4 phút; sơ tán tầng ≤10 phút.',
 drill:'Diễn tập từng tòa ≥1 lần/năm cùng cư dân (mô hình Mori Building – có cả cư dân tham gia).'},
{id:'KB-C2',g:'C',lv:3,name:'Cháy hầm xe – xe điện (rủi ro cao nhất NƠXH)',
 trg:'Báo khói tầng hầm; camera phát hiện khói khu sạc xe điện.',
 asm:'1 xe máy điện cháy khi sạc, lan 3–10 xe liền kề; khói độc đặc hầm rất nhanh; nguy cơ nổ pin lithium tái phát nhiều giờ.',
 force:'Toàn đội PCCC cơ sở + 114 (báo rõ «cháy xe điện tầng hầm»); cắt điện toàn hầm.',
 act:['Báo động toàn tòa + gọi 114 nêu rõ cháy pin xe điện','Kích hoạt quạt hút khói hầm; cắt điện hầm & trạm sạc','TUYỆT ĐỐI không dùng nước trực tiếp vào pin đang cháy gần người — dùng bình chuyên dụng/cát, ưu tiên cô lập & sơ tán','Chặn cư dân xuống hầm lấy xe; sơ tán theo thang bộ','Sau dập: canh chừng tái cháy pin ≥24h, kiểm định trước khi mở hầm'],
 sla:'Phát hiện ≤3 phút (tuần tra + camera); báo động toàn tòa ≤5 phút; 0 người kẹt trong hầm.',
 drill:'Diễn tập chuyên đề hầm xe 1 lần/năm; kiểm tra khu sạc hằng tuần theo Luật 55/2024.'},
{id:'KB-C3',g:'C',lv:3,name:'Chập điện do ngập → cháy (liên động PCLB-PCCC)',
 trg:'Đang mưa bão/ngập hầm, phát hiện khét – khói tại tủ điện, phòng kỹ thuật.',
 asm:'Tủ điện tầng hầm ẩm nước phóng điện; hệ báo cháy có thể lỗi do ẩm; lực lượng đang phân tán chống ngập.',
 force:'Tổ kỹ thuật (ưu tiên số 1 quay về sự cố điện) + đội PCCC cơ sở; 114 nếu vượt khả năng.',
 act:['CẮT ĐIỆN tổng khu vực sự cố trước — người cắt phải đứng nơi khô, có ủng + găng cách điện','Dùng bình CO2/bột — TUYỆT ĐỐI không dùng nước khi chưa cắt điện','Sơ tán khu lân cận, mở thông gió','Duy trì nguồn riêng cho bơm PCLB còn lại (không cắt nhầm toàn hệ)','Lập biên bản, không tái cấp điện khi chưa đo cách điện'],
 sla:'Cắt điện đúng khu vực ≤3 phút; 0 điện giật; bơm chống ngập không gián đoạn >15 phút.',
 drill:'Ghép vào diễn tập PCLB thường niên (bắt buộc có tình huống này).'},
{id:'KB-C4',g:'C',lv:2,name:'Cháy tại công trường (hàn cắt / kho vật tư / lán trại)',
 trg:'Phát hiện khói-lửa tại tầng thi công, kho vật tư, khu lán trại nhà thầu.',
 asm:'Vảy hàn bén bạt/xốp/ván khuôn; đám cháy phát triển nhanh theo vật liệu; công nhân đông, lối thoát công trường phức tạp.',
 force:'Đội PCCC cơ sở công trường (≥25 người theo Luật 55/2024) + bảo vệ + 114.',
 act:['Còi báo động toàn công trường + gọi 114','Cắt điện khu vực; di chuyển bình khí, sơn, dung môi ra xa','Dập bằng bình bột + cát; nước chỉ khi không còn điện','Điểm danh toàn bộ công nhân theo tổ đội tại điểm tập kết','Điều tra nguyên nhân, siết phiếu công tác nóng (hot-work permit)'],
 sla:'Báo động ≤2 phút; điểm danh đủ quân số ≤15 phút; phiếu công tác nóng 100% khi hàn cắt.',
 drill:'Diễn tập công trường 1 lần/năm + huấn luyện ATLĐ đầu vào 100% công nhân.'},
];

// ---------- NORMS_V7 ----------
window.NORMS_V7 = [
['A. Bảo hộ cá nhân','Quần áo chữa cháy chuyên dụng','Bộ',5,7,8,5,'Bàn giao luân chuyển giữa 2 ca tại phòng an ninh — không cấp riêng cá nhân'],
['A. Bảo hộ cá nhân','Mũ bảo hộ cứu nạn có kính che','Cái',5,7,8,5,'Chống va đập vật rơi khi dọn cây, cứu nạn'],
['A. Bảo hộ cá nhân','Ủng cao su mũi thép','Đôi',5,7,8,5,'Chống chập điện nước ngập hầm, chống đinh'],
['A. Bảo hộ cá nhân','Găng tay PCCC & chống cắt','Đôi',5,7,8,5,'Chống trượt khi bốc bao cát'],
['A. Bảo hộ cá nhân','Mặt nạ lọc độc phòng khói','Cái',10,120,120,40,'GIỮ NGUYÊN số lượng — phục vụ cứu nạn thoát hiểm cư dân'],
['B. Phá dỡ cứu nạn','Rìu cứu hỏa chuyên dụng','Cái',1,4,4,2,'Gắn với tủ PCCC tòa nhà, không phụ thuộc ca trực'],
['B. Phá dỡ cứu nạn','Búa tạ 5kg','Cái',1,4,4,2,''],
['B. Phá dỡ cứu nạn','Xà beng / xà cầy','Cái',2,8,8,4,''],
['B. Phá dỡ cứu nạn','Kìm cộng lực cắt thép','Cái',1,4,4,2,''],
['C. Chống lụt – chống úng','Bơm tõm chìm chống úng','Cái',2,8,10,2,'Thống Nhất cao hơn do 2 hầm 4 dốc riêng biệt'],
['C. Chống lụt – chống úng','Bao cát chặn tràn dốc ram','Bao',30,160,160,40,'ECO: 80 bao/lối × 2 lối · TN: 40 bao/lối × 4 lối'],
['C. Chống lụt – chống úng','Xe rùa / xe cải tiến','Cái',1,4,4,2,'Bảo vệ + vệ sinh phối hợp chuyển cát'],
['D. Thông tin – chiếu sáng','Đèn LED tích điện di động','Cái',3,16,16,6,'Cố định tại chốt trực, soi đường khi mất điện'],
['D. Thông tin – chiếu sáng','Loa phát thanh cầm tay','Cái',1,4,4,2,'Ca trưởng điều phối hướng dẫn thoát nạn'],
['D. Thông tin – chiếu sáng','Máy bộ đàm + dock sạc','Bộ',5,7,8,8,'Đủ quân số 1 ca; hết ca ký bàn giao cho ca sau'],
];

// ---------- RELIEF ----------
window.RELIEF = [
['I. Bếp nấu – hậu cần','Xoong gang cỡ đại 50-60','Chiếc','02 (1/loại)','Lâu dài','Lau khô, bôi dầu ăn mỏng chống rỉ trước khi úp kho'],
['I. Bếp nấu – hậu cần','Xoong nhôm / chảo xào đại','Chiếc','05 (2 xoong 3 chảo)','Lâu dài','Khô ráo, kiểm tra quai tán đinh định kỳ'],
['I. Bếp nấu – hậu cần','Rổ nhựa to / chậu tôn đại','Chiếc','04 (2+2)','Lâu dài','Tránh nắng trực tiếp, úp ngược'],
['I. Bếp nấu – hậu cần','Bộ dụng cụ bếp (dao thớt thìa kéo đũa)','Bộ','02 bộ đầy đủ','Lâu dài','Dao bọc giấy nến dầu; đũa muôi sấy khô chống mốc'],
['I. Bếp nấu – hậu cần','Bếp cồn / bếp ga mini','Cái','05 mỗi loại','Lâu dài','Lau dầu mỡ, kiểm tra đánh lửa'],
['II. Khí tài – chắn nước','Bạt dứa 6×8m dập lỗ','Tấm','10','Lâu dài','Pallet gỗ cao ráo, chống chuột gián; làm lán dã chiến'],
['II. Khí tài – chắn nước','Kìm cắt cáp / búa tạ / búa đinh','Cái','02 mỗi loại','Lâu dài','Bôi dầu khoáng lưỡi cắt, nêm chêm cán chắc'],
['II. Khí tài – chắn nước','Thép ly buộc / dây dù thừng chịu lực','Cuộn·kg','5kg thép + 2 cuộn thừng','Lâu dài','Cuộn tròn treo cao tránh ẩm mục'],
['III. Quân trang bảo hộ','Mũ cối / ủng nhựa cao su','Cái·Đôi','15 + 15','Lâu dài','Phấn rôm lòng ủng; mũ xếp chồng'],
['III. Quân trang bảo hộ','Bộ quần áo mưa cánh dơi/liền thân','Bộ','20','Lâu dài','Phơi khô mới gấp — gấp ướt là mục dính hỏng cả lô'],
['III. Quân trang bảo hộ','Balo quân nhu / túi bọc chống nước','Chiếc','15 mỗi loại','Lâu dài','Bỏ túi hút ẩm silica gel vào lòng balo'],
['III. Quân trang bảo hộ','Chăn nỉ bộ đội / khăn mặt','Cái','10 + 20','Lâu dài','Giặt sạch, hút chân không niêm phong'],
['III. Quân trang bảo hộ','Quần áo rằn ri / đồ lót','Bộ','30 + 30','Lâu dài','Thùng nhựa kín + băng phiến'],
['III. Quân trang bảo hộ','Dép tổ ong / dép quai hậu','Đôi','15 mỗi loại','Lâu dài','Thùng nhựa kín'],
['III. Quân trang bảo hộ','ÁO PHAO cứu sinh xốp cứng','Cái','20 (BỔ SUNG)','Lâu dài','Treo cao tránh chuột gặm; đang thiếu 15 so định mức'],
['IV. Tiêu hao – hạn ngắn','Sạc dự phòng 10-20K mAh','Chiếc','15','1-2 năm','Xả–sạc chu kỳ 3 tháng, giữ 60-70% pin; hiện chỉ còn 1/15'],
['IV. Tiêu hao – hạn ngắn','Đèn pin tích điện','Chiếc','10','1-2 năm','Sạc kiểm tra hằng quý; hiện còn 0/10'],
['IV. Tiêu hao – hạn ngắn','Pin khô AA / đại D','Cặp','10 + 40','Ngắn','KHÔNG lắp sẵn vào thiết bị — chảy axit hỏng đồ; mua gối đầu khi có bão'],
['IV. Tiêu hao – hạn ngắn','Cồn khô hộp','Hộp','40','Ngắn','Thùng kín mát xa nguồn nhiệt; hiện còn 0/40'],
['IV. Tiêu hao – hạn ngắn','Nhu yếu phẩm (lương khô, mì, gạo, nước)','—','Cấp phát linh hoạt','Ngắn','KHÔNG lưu kho quanh năm — hợp đồng nguyên tắc siêu thị, bốc hàng ≤6-12h khi có lệnh'],
['IV. Tiêu hao – hạn ngắn','Túi thuốc y tế sơ cứu','Túi','05 túi đầy đủ','Ngắn','Rà HSD hằng tháng, thay cồn – nước muối hết hạn'],
];

// ---------- GAPS ----------
window.GAPS = [
['P1','TN','Mặt nạ phòng độc','80 cái','Toàn bộ HẾT HẠN sử dụng','Mua mới thay thế khẩn cấp — an toàn tính mạng cư dân/CBNV',1],
['P1','ECO','Máy bơm tõm chống úng dự phòng','0/1-2 cái','KHÔNG có bơm dự phòng','Mua khẩn 1-2 máy trước cao điểm mưa bão; tạm thời điều phối từ CTN/công trường',1],
['P1','Kho cứu trợ','Áo phao cứu sinh','5/20 cái','Thất thoát 12 cái','Dụng cụ cứu sinh cốt lõi — mua bù 15 cái ngay + truy trách nhiệm',1],
['P1','Kho cứu trợ','Đèn pin các loại','0/10','Mất toàn bộ 11 cái','Mua 10 đèn tích điện mới; quy trách nhiệm thủ kho theo Điều 3',1],
['P2','TN','Đèn pin cầm tay to','1/3 hoạt động','2 cái hỏng sạc/chân sạc','Sửa hoặc thay mới 2 cái phục vụ tuần tra đêm',2],
['P2','TN','Pin đại cho gậy cảnh báo + loa','Hết pin','Gậy 3 cái + loa 3 cái hết pin đại','Mua gối đầu pin đại (không lắp sẵn)',2],
['P2','Kho cứu trợ','Sạc dự phòng','1/15','Thất thoát 11 cái','Yêu cầu thủ kho xác định ai mượn chưa trả; mua bù theo định mức 15',2],
['P2','Kho cứu trợ','Bếp ga mini + bếp cồn + cồn khô','2+2+0','Mất 3+3 bếp, 40 hộp cồn','Mua bù trước mùa cao điểm; cồn khô mua gối đầu',2],
['P2','ECO','Mặt nạ phòng độc','30 cái','Cần đối chiếu HSD phin lọc','Kiểm tra HSD hằng tháng, thay phin hết hạn',2],
['P3','TN','Xe lăn','1/2','Anh Nam mượn chưa trả','Thu hồi về phòng trực y tế/PCCC',3],
['P3','TN','Dùi cui điện','0/1','Hỏng','Bảo hành/sửa hoặc thanh lý mua mới',3],
['P3','Kho cứu trợ','Kìm cắt, búa, dây thừng','Mất hết','Hụt 2 kìm + 1 búa to + 2 búa nhỏ + dây','Thủ kho giải trình; mua bổ sung 02 mỗi loại',3],
];

// ---------- PCCC_INV ----------
window.PCCC_INV = [
['Mặt nạ phòng độc','Cái',80,30,'—','—','TN: toàn bộ HẾT HSD → mua mới; ECO: rà HSD phin lọc hằng tháng',1],
['Bơm tõm/bơm chìm chống úng','Cái','—',0,2,2,'ECO KHÔNG có bơm dự phòng — mua khẩn; CTN & Nhà M chạy thử hằng tháng',1],
['Bộ đàm','Cái',14,13,5,6,'Ký bàn giao giữa 2 ca kèm dock sạc',0],
['Áo mưa','Bộ',19,8,5,5,'Phơi khô trước khi gấp',0],
['Ủng','Đôi',13,6,7,6,'',0],
['Mũ bảo hộ','Cái',8,'—',5,5,'',0],
['Quần áo bảo hộ/chữa cháy','Bộ',16,3,'—','—','ECO có 3 bộ quần áo chữa cháy riêng',0],
['Đèn pin cầm tay to','Cái',3,4,4,'—','TN: 2/3 hỏng (1 hỏng sạc, 1 hỏng chân sạc) → sửa/thay',1],
['Đèn LED tích điện','Cái',3,1,4,'—','Sạc kiểm tra hằng tuần',0],
['Đèn pin đeo đầu','Cái',3,2,'—','—','',0],
['Loa phát thanh cầm tay','Cái',3,1,1,'—','TN hết pin đại → mua gối đầu',1],
['Gậy cảnh báo','Cái',3,'—','—','—','Hết pin đại',1],
['Thang dây','Cái',2,'—',1,1,'',0],
['Thang chữ A / thang rút','Cái','2+1+1','1 (2m)','1 (rút)','3 (3m·6m·inox 2.5m)','',0],
['Cáng cứu thương','Cái',2,1,1,1,'',0],
['Xe lăn','Cái',2,1,'—','—','TN thiếu 1 (anh Nam mượn) → thu hồi',1],
['Xà beng / xà cầy','Cái','2+2','1+1','3+2','2+2','Bôi dầu chống rỉ định kỳ',0],
['Búa tạ / búa đinh','Cái','1','1','2+2','2+2','',0],
['Kìm cộng lực','Cái',1,1,2,2,'',0],
['Rìu / dao rựa','Cái','5+2','1 (dao)','—','2+4','Mài bén sẵn xử lý cây đổ',0],
['Xẻng / cuốc','Cái','—','1+2','4+4','4+4','',0],
['Bao cát','Bao','—','—',25,'—','CTN che đậy khô ráo tránh mục bao',0],
['Dây thép buộc','kg','1 cuộn 3mm','1.5+1','5 (1.5ly)','10 (3ly)','',0],
['Xe rùa / xe cải tiến','Cái','—',1,'—',1,'',0],
['Túi cứu thương','Cái','—','—','—',1,'Kiểm tra HSD bông băng thuốc',0],
['Dùi cui điện','Cái',1,'—','—','—','Hỏng → sửa/thanh lý',1],
['Mặt bằng trực','—','SHCĐ N1-2 · T20 N2','P.SHCD + T20 CT3','Tầng 3','SHCĐ M1 · P.điện M2','Khu nghỉ trực đã phân theo KHPCLB 7.2026',0],
];

// ---------- COST_STRUCT ----------
window.COST_STRUCT = [
['01','Nhân công trực & tăng cường','Lương trực bão theo ca 12h; làm thêm theo Bộ luật Lao động (150–300%); công nhật khắc phục','Bảng chấm công tách riêng giờ sự kiện + DS trực đã duyệt','Trưởng đơn vị chấm → KTT soát'],
['02','Nhu yếu phẩm & hậu cần trực','Định mức 4 bữa/người/ngày: 2 mì + 2 sữa + 2 bánh mì + 1 xúc xích + nước bình (phân bổ 20-20-15-10-20)','Máy tính hậu cần của hệ thống này; mua theo hợp đồng nguyên tắc','≤5tr: Trưởng BQL · >5tr: GĐ QLN'],
['03','Nhiên liệu máy phát – máy bơm','Dầu diesel 200 lít/dự án/đợt (định mức KHPCLB); xăng máy bơm 6.5HP','Nhật ký giờ chạy máy (máy nào, mục đích, số giờ) — chuẩn ICS','GĐ QLN duyệt vượt định mức'],
['04','Vật tư tiêu hao PCLB','Bao cát, bạt, dây thép, pin, cồn khô, thuốc y tế — theo định mức V7 & kho cứu trợ','Phiếu xuất kho + biên bản sử dụng; kiểm kê bù ngay sau sự kiện','Theo định mức: tự động · vượt: GĐ'],
['05','Thuê ngoài khẩn cấp','Bơm công suất lớn, cẩu kéo, nạo vét, xe tải — kích hoạt hợp đồng nguyên tắc ký trước mùa bão','CẤM cost-plus-%; đơn giá chốt trước hoặc theo giờ máy có nhật trình','GĐ ≤20tr · TGĐ >20tr'],
['06','Khắc phục – sửa chữa sau bão','Kính, mái, cửa, chống thấm, cây xanh, thiết bị hỏng','Biên bản thiệt hại + ảnh trước/sau + 3 báo giá (sau khi hết lệnh khẩn)','TGĐ duyệt theo tổng dự toán'],
['07','Cứu trợ & phúc lợi','Hỗ trợ CBNV/cư dân bị thiệt hại; xuất kho cứu trợ; điểm sạc miễn phí','Danh sách ký nhận + duyệt của BCH','TGĐ / Công đoàn'],
];

// ---------- BENCH ----------
window.BENCH = [
['EVN / EVNNPC','Kích hoạt theo chuỗi công điện; BCH PCTT&TKCN các cấp; 4 tại chỗ; ứng trực 24/24; khôi phục nhanh sau bão','Cấp độ XANH→ĐỎ của CTG vận hành như «công điện nội bộ»: 1 lệnh kích hoạt = cả bộ máy chạy'],
['Viettel (bão Yagi)','Cảnh báo 32 triệu thuê bao; 284 máy phát dự phòng; ~500 đội ứng cứu; 200 điểm sạc miễn phí; roaming chéo','Kịch bản KB-B6 mất điện >24h + điểm sạc sảnh cho cư dân'],
['Vinhomes / Ocean City (Yagi)','Kích hoạt toàn đội kỹ thuật-môi trường ngay khi bão tan; cam kết diễn tập định kỳ; truyền thông trấn an','Gói R0–R7 sau bão + chuỗi content MKT-ZL-24→33'],
['Tín hiệu bão Hồng Kông T1/T3/T8/T10','Mỗi nấc tín hiệu gắn sẵn checklist toàn xã hội; doanh nghiệp (cảng HIT) dừng/khôi phục theo trình tự ngược định sẵn','4 cấp XANH/VÀNG/CAM/ĐỎ ↔ gói nhiệm vụ gắn sẵn từng người trong file này'],
['FEMA ICS/EOC (Mỹ)','3 cấp kích hoạt EOC; 5 khối chức năng; Finance/Admin mở mã chi phí ngay giờ đầu; hạn mức ủy quyền; cấm cost-plus-%','Ma trận cấp độ + module Chi phí chuẩn + mã sự kiện PCLB-năm-tên bão'],
['Mitsubishi Estate (Nhật)','BCP điện dự phòng 72h; thỏa thuận trước với nhà thầu sửa chữa; đánh giá thiệt hại nhanh; PDCA sau diễn tập','Lộ trình GĐ3: chuẩn 72h + hợp đồng nguyên tắc NCC + AAR 4 câu hỏi'],
['Mori Building (Nhật)','Diễn tập có cả cư dân + tenant; tòa nhà là điểm trú an toàn cho người mắc kẹt','Diễn tập KB-C1 cùng cư dân; phòng SHCĐ là điểm trú tập trung'],
['Bài học Yagi 2024 (RRTT cấp 4, thiệt hại ~81,5 nghìn tỷ)','Vỡ kính mặt dựng hàng loạt; nước tràn khe cửa; ngập hầm sau bão; công trường phải hạ cẩu trước','KB-B3/B4/B5; quy tắc cẩu tháp cấp 8-12 hạ cần, ≥13 tháo cần; băng keo chữ X kính lớn'],
];

// ---------- FIRE_STEPS ----------
window.FIRE_STEPS = [
['1','BÁO ĐỘNG','Hô hoán + nhấn nút báo cháy gần nhất; ca trực xác nhận vị trí trên tủ báo cháy trung tâm.','≤1 phút'],
['2','GỌI 114','Gọi ngay Cảnh sát PCCC 114 (nêu rõ: địa chỉ, tầng, loại cháy — đặc biệt nếu là xe điện/tầng hầm); song song báo BCH.','≤2 phút'],
['3','CỨU NGƯỜI','Ưu tiên tuyệt đối: hướng dẫn thoát nạn theo thang bộ, khăn ướt che mũi; cứu người mắc kẹt; KHÔNG dùng thang máy.','Liên tục'],
['4','CẮT ĐIỆN','Cắt điện khu vực cháy (aptomat tầng/khu); thang máy đưa về tầng 1; giữ nguồn bơm chữa cháy.','≤3 phút'],
['5','CHỮA CHÁY','Đội PCCC cơ sở dùng bình + họng nước khống chế đám cháy trong khả năng; đón và bàn giao cho lực lượng 114 (sơ đồ, chìa khóa kỹ thuật).','≤4 phút tiếp cận'],
];

// ---------- FOOD_ITEMS ----------
window.FOOD_ITEMS = [
 {k:'mi',   name:'Mì tôm',        unit:'gói',  perDay:2, price:4000},
 {k:'sua',  name:'Sữa hộp',       unit:'hộp',  perDay:2, price:8000},
 {k:'banh', name:'Bánh mì',       unit:'cái',  perDay:2, price:7000},
 {k:'xx',   name:'Xúc xích',      unit:'gói',  perDay:1, price:6000},
 {k:'nuoc', name:'Nước uống bình',unit:'bình', perDay:0.5, price:15000},
];

// ---------- FOOD_UNITS ----------
window.FOOD_UNITS = [
 {u:'TN', n:'Thống Nhất', staff:27},
 {u:'ECO',n:'ECO', staff:24},
 {u:'CTN',n:'Cát Tường New', staff:8},
 {u:'PKT',n:'Đội kỹ thuật QLN', staff:11},
 {u:'CT', n:'Công trường', staff:40},
];

// ---------- QD03_PRINCIPLES ----------
window.QD03_PRINCIPLES = [
 'Phòng ngừa chủ động, từ sớm – từ xa; phương châm BỐN TẠI CHỖ: chỉ huy, lực lượng, phương tiện – vật tư, hậu cần tại chỗ.',
 'Ưu tiên tuyệt đối an toàn TÍNH MẠNG, sau đó an toàn điện, công trình, dữ liệu, tài sản — không đánh đổi an toàn con người để cứu tài sản.',
 'Chỉ huy tập trung, thông tin MỘT đầu mối; người nhận nhiệm vụ phải chấp hành lệnh và xác nhận kết quả bằng sổ/tin nhắn/ảnh/hệ thống điện tử.',
 'KHÔNG cứu nạn vượt quá năng lực – phương tiện – chuyên môn; người mắc kẹt, dòng chảy mạnh, sạt lở, điện nguy hiểm → báo cơ quan chuyên trách (112/114/115).',
 'Mọi vật tư, thiết bị, hàng cứu trợ: minh bạch, đúng mục đích, đúng đối tượng, có hồ sơ, kiểm tra sau sử dụng.',
 'Phương án từng cơ sở phải CỤ THỂ HƠN Quy định này — theo hiện trạng, quy mô, số người, hệ kỹ thuật, mức rủi ro.',
];

// ---------- QD03_FORBIDDEN ----------
window.QD03_FORBIDDEN = [
 'Không chấp hành lệnh dừng thi công, sơ tán, cô lập điện, đóng khu vực nguy hiểm hoặc điều động khẩn cấp.',
 'Tự ý vào khu vực ngập, hố sâu, mái, giàn giáo, cẩu tháp, vận thăng, phòng điện, nơi gió mạnh khi chưa xác nhận an toàn.',
 'Tự ý vận hành, tháo sửa máy bơm, máy phát, tủ điện, thiết bị cứu hộ/trọng yếu khi chưa được phân công.',
 'Dùng vật tư, thiết bị, hàng cứu trợ cho mục đích cá nhân; cho mượn, điều chuyển, thanh lý, tháo nhãn, sửa số liệu, ký bàn giao khống.',
 'Che giấu sự cố, chậm báo cáo, thông tin sai lệch; phát ngôn/đăng tải hình ảnh nhạy cảm khi chưa được phép.',
 'Phân phối cứu trợ không danh sách, không xác nhận, phân biệt đối xử, trục lợi, làm thất thoát nguồn lực.',
];

// ---------- RESP_MATRIX ----------
window.RESP_MATRIX = [
 ['Ban Chỉ huy (Chỉ huy trưởng: CHỦ TỊCH)','Quyết định cấp độ, điều phối, dừng/khôi phục hoạt động','Phê duyệt ngân sách, cứu trợ lớn'],
 ['Văn phòng Chủ tịch','Cơ quan THƯỜNG TRỰC: tiếp nhận tin, tham mưu cấp độ, phát lệnh, điều phối, liên hệ địa phương; phụ trách CNCH & thiện nguyện','Lệnh kích hoạt & báo cáo hợp nhất'],
 ['Trung tâm HC-NS','Quản lý TOÀN BỘ hệ thống kho (tổng, vệ tinh, tủ trực, cơ động, kho ảo), nhân sự, phương tiện, hậu cần, mua sắm; PCLB văn phòng','Sổ tổng nhập-xuất-tồn & quyền điều chuyển'],
 ['Cty TNHH Xây lắp Cát Tường','Phụ trách PCLB tại CÔNG TRƯỜNG: phương án theo cụm/tòa, thiết bị nâng, lực lượng trực kỹ thuật','Xác nhận điều kiện thi công lại'],
 ['Cty TNHH QLN TNT','Phụ trách PCLB các DỰ ÁN vận hành: trực 24/24, hầm, cư dân, kho vệ tinh','Bảo quản trực tiếp kho vệ tinh'],
 ['Trung tâm Pháp chế','Soạn thảo/rà soát Quy định, phương án, hợp đồng, hồ sơ cứu trợ; tư vấn trách nhiệm pháp lý, bồi thường','Hồ sơ sự cố nghiêm trọng'],
 ['Tài chính – Kế toán','Nguồn tiền, hạn mức tạm ứng, thanh toán khẩn; mã chi phí riêng từng đợt; không trộn nguồn đóng góp','Theo dõi riêng từng sự kiện/đợt cứu trợ'],
 ['IT / Chuyển đổi số','Dữ liệu, UPS, cảm biến rò nước, cảnh báo, bộ đàm, kết nối, làm việc từ xa; phát triển app/AI hỗ trợ','Sao lưu & thứ tự khôi phục'],
 ['Truyền thông','Thông tin chính thức, cảnh báo, hướng dẫn; chỉ người được phân công phát ngôn','Kiểm duyệt hình ảnh & dữ liệu'],
 ['Kiểm soát nội bộ','Kiểm tra chéo số liệu, chứng từ, báo cáo, điểm bất thường về tài sản – chi phí','Báo cáo độc lập lên Ban Lãnh đạo'],
 ['An toàn – Y tế & Bảo vệ','Nguy cơ, sơ cứu, thuốc, PPE, sức khỏe người tham gia; kiểm soát ra vào, chìa khóa dự phòng, tuần tra, camera, vùng cấm','Bàn giao ca & bảo vệ hiện trường'],
 ['Nhà thầu & người lao động','Chấp hành lệnh; thu dọn, che chắn, chằng buộc phạm vi của mình; báo nguy cơ ngay','Ký xác nhận & chịu trách nhiệm phạm vi'],
];

// ---------- KHO_MODEL ----------
window.KHO_MODEL = [
 ['1. Kho TỔNG (Group)','Trung tâm HC-NS quản lý trực tiếp','Thiết bị chiến lược, hàng giá trị cao, BỘ CƠ ĐỘNG (xuất ≤30 phút), hàng cứu trợ dùng chung, dự phòng điều chuyển'],
 ['2. Kho VỆ TINH','BQL/đơn vị sở tại bảo quản theo biên bản','Đủ xử lý giai đoạn ban đầu; gần khu rủi ro nhưng KHÔNG trong vùng ngập/cháy/sập; mở kho ≤15 phút'],
 ['3. TỦ/ĐIỂM TRỰC','Ca trực — bàn giao theo ca','Đồ lấy trong vài phút: bộ đàm, đèn, áo mưa, ủng, dây cứu hộ, túi sơ cứu'],
 ['4. Kho CƠ ĐỘNG','Theo lệnh ứng phó','Bộ hàng đóng gói sẵn/điểm tập kết tạm — phải có người quản lý, sổ nhanh, che chắn'],
 ['5. KHO ẢO (nguồn cung dự phòng)','HC-NS duy trì ≥2 NCC/nhóm trọng yếu','Hợp đồng nguyên tắc, đầu mối 24/7, giao 6h/12h/24h — là lớp bảo đảm, KHÔNG thay thế định mức tại hiện trường'],
];

// ---------- GROUP_STORE ----------
window.GROUP_STORE = [
 ['Áo phao','Chiếc',50,'Đánh số, kiểm tra đai khóa'],
 ['Áo mưa','Bộ',100,'Đủ cỡ, đóng túi kín'],
 ['Ủng cao su','Đôi',50,'Kiểm tra nứt/rò'],
 ['Găng tay bảo hộ','Đôi',200,'Tách riêng găng cách điện'],
 ['Đèn pin / đèn sạc','Chiếc',30,'Chống nước, có lịch sạc'],
 ['Bộ đàm','Bộ',10,'IT cấu hình, đánh số'],
 ['Túi sơ cứu','Bộ',10,'Theo dõi hạn dùng'],
 ['Dây cứu hộ','Mét',300,'Ghi tải trọng làm việc'],
 ['Bạt che','Tấm',20,'Đóng gói cơ động'],
 ['Nhu yếu phẩm','—','Theo phương án','Hợp đồng giao ≤24h · quản lý lô FEFO · không tích trữ quá mức'],
];

// ---------- RELIEF_LEVELS ----------
window.RELIEF_LEVELS = [
 ['Cấp 1 – Hỗ trợ nhanh','< 50 hộ · giao thông bình thường','Sẵn sàng trong 24 giờ','Tổng Giám đốc / người được ủy quyền'],
 ['Cấp 2 – Cứu trợ tập trung','50 – 300 hộ · có điểm tập kết','Sẵn sàng trong 18 giờ','Tổng Giám đốc / Chủ tịch'],
 ['Cấp 3 – Cứu trợ khẩn cấp','> 300 hộ hoặc thiệt hại lớn','Sẵn sàng trong 12 giờ','Chủ tịch phê duyệt'],
 ['Cấp 4 – Đặc biệt','Nhiều địa bàn · chia cắt · kéo dài nhiều ngày','Phương án riêng','CHỦ TỊCH trực tiếp chỉ huy'],
];

// ---------- QD03_FORMS ----------
window.QD03_FORMS = [
 ['BM-PCLB-01','Sổ danh mục & nhập – xuất – tồn kho','Thủ kho · cập nhật liên tục'],
 ['BM-PCLB-02','Phiếu nhập kho / nghiệm thu (chạy thử thiết bị điện)','Kho + HCNS + Kỹ thuật (+ Tài chính khi cần)'],
 ['BM-PCLB-03','Phiếu xuất dùng / điều chuyển / thu hồi','Người giao – nhận – thủ kho – phê duyệt'],
 ['BM-PCLB-04','Sổ xuất KHẨN CẤP','Hoàn thiện phiếu đầy đủ ≤24h'],
 ['BM-PCLB-05','Sổ bàn giao ca thiết bị & chìa khóa','Thử nhanh + ký 2 ca, ca trưởng xác nhận'],
 ['BM-PCLB-06','Phiếu kiểm tra, chạy thử, bảo dưỡng','HCNS + Kỹ thuật/IT + BQL/Thủ kho'],
 ['BM-PCLB-07','Biên bản sự cố / mất mát / hư hỏng','Lập ≤2h khi mất/hỏng thiết bị trọng yếu'],
 ['BM-PCLB-08','Checklist chuẩn bị trước bão (10 hạng mục)','Trước T-24h, kèm ảnh xác nhận lần cuối'],
 ['BM-PCLB-09','Báo cáo nhanh sự cố / bão lụt (8 mục)','≤4 giờ sau sự cố'],
 ['BM-PCLB-10','Biên bản kiểm tra sau bão & CHO PHÉP HOẠT ĐỘNG LẠI','Kỹ thuật/ATLĐ + BQL/CHT + Giám đốc phê duyệt'],
 ['BM-PCLB-11','Danh sách / biên bản bàn giao cứu trợ','Ký nhận từng hộ + đại diện địa phương'],
 ['BM-PCLB-12','Báo cáo tháng hệ thống kho (6 mục)','Trước 17:00 ngày 28 hằng tháng'],
 ['BM-PCLB-13','Checklist quyết toán & kết thúc cứu trợ (10 mục)','Quyết toán ≤7 ngày sau đợt'],
];

// ---------- FUEL ----------
window.FUEL = {litersPerSite:200, sites:5, pricePerLiter:22000};
