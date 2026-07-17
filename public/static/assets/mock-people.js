// ============================================================
// CTG PEOPLE — mock personnel with names, roles, avatars
// ============================================================

window.PEOPLE = [
  // BCH Tập đoàn
  { id:'ct',   name:'Nguyễn Đăng Cường',  role:'Chủ tịch HĐQT',                   unit:'BCH',  short:'CT',  gradient:'grad-a', phone:'0913.***.001', online:true },
  { id:'tgd',  name:'Phan Văn Tú',         role:'Tổng Giám đốc',                    unit:'BCH',  short:'TGĐ', gradient:'grad-e', phone:'0913.***.002', online:true },
  { id:'pt1',  name:'Trần Quốc Bảo',       role:'Phó TGĐ – Trực chỉ huy',           unit:'BCH',  short:'PT1', gradient:'grad-c', phone:'0913.***.003', online:true },
  { id:'pt2',  name:'Lê Minh Hà',          role:'Phó TGĐ – Hậu cần & Đối ngoại',    unit:'BCH',  short:'PT2', gradient:'grad-d', phone:'0913.***.004', online:false },

  // Công trường
  { id:'cht',  name:'Đỗ Xuân Thắng',       role:'Chỉ huy trưởng công trường',       unit:'CT',   short:'CHT', gradient:'grad-b', phone:'0968.***.101', online:true },
  { id:'chp1', name:'Vũ Văn Đông',         role:'Chỉ huy phó – An toàn',            unit:'CT',   short:'CHP1',gradient:'grad-f', phone:'0968.***.102', online:true },
  { id:'chp2', name:'Nguyễn Trọng Dũng',   role:'Chỉ huy phó – Kỹ thuật',           unit:'CT',   short:'CHP2',gradient:'grad-g', phone:'0968.***.103', online:true },
  { id:'atv',  name:'Ngô Thị Hằng',        role:'ATVSV công trường',                unit:'CT',   short:'ATV', gradient:'grad-d', phone:'0968.***.104', online:false },

  // BQL Nhà Thống Nhất
  { id:'tn1',  name:'Phạm Ngọc Sơn',       role:'Trưởng BQL Nhà Thống Nhất',        unit:'TN',   short:'TN1', gradient:'grad-a', phone:'0912.***.201', online:true },
  { id:'tn2',  name:'Bùi Anh Tuấn',        role:'Kỹ thuật cụm TN',                  unit:'TN',   short:'TN2', gradient:'grad-e', phone:'0912.***.202', online:true },

  // ECO
  { id:'eco1', name:'Hoàng Văn Nam',       role:'Trưởng BQL Cát Tường ECO',         unit:'ECO',  short:'ECO1',gradient:'grad-b', phone:'0912.***.301', online:true },
  { id:'eco2', name:'Lý Thu Trang',        role:'Trực toà A-ECO',                   unit:'ECO',  short:'ECO2',gradient:'grad-d', phone:'0912.***.302', online:false },

  // CTN
  { id:'ctn1', name:'Trần Đức Hải',        role:'Trưởng BQL Cát Tường New',         unit:'CTN',  short:'CTN1',gradient:'grad-c', phone:'0912.***.401', online:true },

  // Nhà M – Yên Phong
  { id:'nm1',  name:'Đinh Công Thọ',       role:'Trưởng BQL Nhà M',                 unit:'NHAM', short:'NM1', gradient:'grad-g', phone:'0912.***.501', online:true },

  // CTS-YP
  { id:'yp1',  name:'Nguyễn Văn Bình',     role:'Trưởng BQL CTS-YP',                unit:'CTSYP',short:'YP1', gradient:'grad-e', phone:'0912.***.601', online:false },

  // TT Đông y
  { id:'dy1',  name:'Bs. Lê Thị Mai',      role:'Giám đốc TT Đông y – Khách sạn',   unit:'TTDY', short:'DY1', gradient:'grad-d', phone:'0912.***.701', online:true },

  // Văn phòng
  { id:'vp1',  name:'Nguyễn Thị Lan',      role:'Trưởng HC-NS',                     unit:'VP',   short:'VP1', gradient:'grad-a', phone:'0912.***.801', online:true },
  { id:'vp2',  name:'Trịnh Văn Khôi',      role:'Trưởng Mua hàng',                  unit:'VP',   short:'VP2', gradient:'grad-b', phone:'0912.***.802', online:true },
  { id:'vp3',  name:'Đặng Minh Hoà',       role:'Kế toán trưởng',                   unit:'VP',   short:'VP3', gradient:'grad-c', phone:'0912.***.803', online:false },
  { id:'vp4',  name:'Phạm Văn Hậu',        role:'Hậu cần – Bếp',                    unit:'VP',   short:'VP4', gradient:'grad-g', phone:'0912.***.804', online:true },

  // MKT
  { id:'mkt1', name:'Vũ Hoàng Yến',        role:'Trưởng phòng Marketing',           unit:'MKT',  short:'MKT1',gradient:'grad-d', phone:'0912.***.901', online:true },

  // VPCT
  { id:'vpct1',name:'Đỗ Thị Hương',        role:'Chánh Văn phòng Chủ tịch',         unit:'VPCT', short:'VPC1',gradient:'grad-a', phone:'0912.***.011', online:true },

  // IT
  { id:'it1',  name:'Nguyễn Thanh Tùng',   role:'Trưởng IT / CĐS',                  unit:'IT',   short:'IT1', gradient:'grad-e', phone:'0912.***.021', online:true },

  // Pháp chế
  { id:'pc1',  name:'Ls. Trần Văn Đạt',    role:'Trưởng Pháp chế',                  unit:'PC',   short:'PC1', gradient:'grad-c', phone:'0912.***.031', online:false },
];

// Sites — dự án / cơ sở với vị trí trên bản đồ Bắc Ninh (%)
window.SITES = [
  { id:'HIJKL',  name:'Cụm CT HIJ-KL',      unit:'CT',    x:38, y:44, kind:'construction', staff:142, risk:'crit', desc:'Công trường xây dựng, cần trú ẩn khi bão đến' },
  { id:'OPQRT',  name:'Cụm CT OPQRT',       unit:'CT',    x:52, y:38, kind:'construction', staff:118, risk:'warn', desc:'Đã hoàn tất chằng buộc cẩu tháp' },
  { id:'S',      name:'Cụm CT S',           unit:'CT',    x:44, y:56, kind:'construction', staff:87,  risk:'warn', desc:'Bê tông giai đoạn hoàn thiện' },
  { id:'TN',     name:'BQL Thống Nhất',     unit:'TN',    x:32, y:60, kind:'residential',  staff:64,  risk:'ok',   desc:'Toà chung cư đã ổn định, kiểm tra tủ điện' },
  { id:'ECO',    name:'BQL ECO',            unit:'ECO',   x:56, y:64, kind:'residential',  staff:48,  risk:'ok',   desc:'Khu ECO – rà soát bơm chống úng' },
  { id:'CTN',    name:'BQL CT New',         unit:'CTN',   x:48, y:70, kind:'residential',  staff:39,  risk:'ok',   desc:'Sảnh mới bàn giao – bố trí trú ẩn dân cư' },
  { id:'NHAM',   name:'BQL Nhà M – Yên Phong', unit:'NHAM', x:66, y:26, kind:'residential', staff:52, risk:'warn', desc:'Xa TT điều hành, cần đội cơ động' },
  { id:'CTSYP',  name:'CTS – Yên Phong',    unit:'CTSYP', x:72, y:34, kind:'residential',  staff:41,  risk:'ok',   desc:'Rà soát mái tôn hội trường' },
  { id:'TTDY',   name:'TT Đông y – KS',     unit:'TTDY',  x:26, y:48, kind:'hospitality',  staff:37,  risk:'ok',   desc:'Sức chứa tiếp nhận sơ tán 80 người' },
  { id:'KHO_TT', name:'Kho TT Cát Tường',   unit:'VP',    x:42, y:50, kind:'warehouse',    staff:8,   risk:'ok',   desc:'Kho tổng: máy bơm, phao, đèn pin, thuốc y tế' },
  { id:'KHO_YP', name:'Kho vệ tinh Yên Phong', unit:'VP', x:70, y:30, kind:'warehouse',    staff:4,   risk:'ok',   desc:'Kho vệ tinh phục vụ khu vực Yên Phong' },
];

window.byId = function(list, id) { return list.find(x => x.id === id); };
window.peopleOfUnit = function(unit) { return PEOPLE.filter(p => p.unit === unit); };
