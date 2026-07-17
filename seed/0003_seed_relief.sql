-- ============================================================================
-- Seed: relief_projects (4 sample projects) + sub-tables
-- ============================================================================

-- RELIEF_PROJECTS (4)
INSERT INTO relief_projects (id,code,name,disaster,disaster_label,region_province,region_commune,region_gps,status,status_label,priority,start_date,end_date,days,budget_total,budget_donation,budget_company,budget_sponsor,budget_spent,budget_committed,beneficiaries_households,beneficiaries_people,outcome_households,outcome_people,outcome_money_distributed,outcome_goods_value,outcome_lives_impacted,outcome_press_coverage) VALUES ('CTR-2026-BAVI','CTR-2026-01','Cứu trợ bão BAVI — Lào Cai · Yên Bái','storm','🌀 Bão số 3 BAVI','Lào Cai · Yên Bái','5 xã vùng cao','22.31°N, 104.14°E','planning','Đang lập kế hoạch','high','2026-07-28','2026-08-02',6,850000000,420000000,300000000,130000000,68000000,240000000,380,1520,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO relief_projects (id,code,name,disaster,disaster_label,region_province,region_commune,region_gps,status,status_label,priority,start_date,end_date,days,budget_total,budget_donation,budget_company,budget_sponsor,budget_spent,budget_committed,beneficiaries_households,beneficiaries_people,outcome_households,outcome_people,outcome_money_distributed,outcome_goods_value,outcome_lives_impacted,outcome_press_coverage) VALUES ('CTR-2025-QT','CTR-2025-08','Cứu trợ lũ Quảng Trị · Quảng Bình','flood','💧 Lũ miền Trung','Quảng Trị · Quảng Bình','7 xã ven sông Thạch Hãn','16.75°N, 107.10°E','in-progress','Đang triển khai','critical','2026-07-15','2026-07-22',8,1250000000,780000000,400000000,70000000,720000000,380000000,520,2180,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO relief_projects (id,code,name,disaster,disaster_label,region_province,region_commune,region_gps,status,status_label,priority,start_date,end_date,days,budget_total,budget_donation,budget_company,budget_sponsor,budget_spent,budget_committed,beneficiaries_households,beneficiaries_people,outcome_households,outcome_people,outcome_money_distributed,outcome_goods_value,outcome_lives_impacted,outcome_press_coverage) VALUES ('CTR-2024-YAGI','CTR-2024-11','Cứu trợ bão Yagi — Hà Giang · Cao Bằng','storm','🌀 Bão Yagi (số 3/2024)','Hà Giang · Cao Bằng','11 xã sạt lở nặng','22.82°N, 105.30°E','completed','Đã hoàn thành','high','2024-09-15','2024-09-22',8,1800000000,1200000000,500000000,100000000,1785000000,0,682,2870,682,2870,360000000,1265000000,'Hoàn thành 100% mục tiêu · Được UBND tỉnh HG tặng Bằng khen','18 báo đưa tin · 240k reach Facebook · 42k engagement');
INSERT INTO relief_projects (id,code,name,disaster,disaster_label,region_province,region_commune,region_gps,status,status_label,priority,start_date,end_date,days,budget_total,budget_donation,budget_company,budget_sponsor,budget_spent,budget_committed,beneficiaries_households,beneficiaries_people,outcome_households,outcome_people,outcome_money_distributed,outcome_goods_value,outcome_lives_impacted,outcome_press_coverage) VALUES ('CTR-2026-TRA','CTR-2026-02','Hỗ trợ hạn hán Trà Vinh · Sóc Trăng','drought','🌵 Hạn hán · xâm nhập mặn','Trà Vinh · Sóc Trăng','4 xã ven biển','9.83°N, 106.35°E','drafting','Đang phác thảo','medium','2026-09-10','2026-09-15',6,620000000,300000000,220000000,100000000,0,0,240,960,NULL,NULL,NULL,NULL,NULL,NULL);

-- RELIEF_BENEFICIARY_PRIORITIES (11)
INSERT INTO relief_beneficiary_priorities (project_id,label) VALUES ('CTR-2026-BAVI','Hộ có người khuyết tật/già yếu (42 hộ)');
INSERT INTO relief_beneficiary_priorities (project_id,label) VALUES ('CTR-2026-BAVI','Hộ mất nhà hoàn toàn (18 hộ)');
INSERT INTO relief_beneficiary_priorities (project_id,label) VALUES ('CTR-2026-BAVI','Hộ đơn thân/nghèo (95 hộ)');
INSERT INTO relief_beneficiary_priorities (project_id,label) VALUES ('CTR-2025-QT','Hộ bị lũ cuốn nhà (35 hộ)');
INSERT INTO relief_beneficiary_priorities (project_id,label) VALUES ('CTR-2025-QT','Hộ có người tử vong (7 hộ)');
INSERT INTO relief_beneficiary_priorities (project_id,label) VALUES ('CTR-2025-QT','Hộ già yếu + trẻ nhỏ (128 hộ)');
INSERT INTO relief_beneficiary_priorities (project_id,label) VALUES ('CTR-2024-YAGI','Hộ mất người thân (14 hộ)');
INSERT INTO relief_beneficiary_priorities (project_id,label) VALUES ('CTR-2024-YAGI','Hộ sập nhà (45 hộ)');
INSERT INTO relief_beneficiary_priorities (project_id,label) VALUES ('CTR-2024-YAGI','Trẻ mồ côi/khuyết tật (32 người)');
INSERT INTO relief_beneficiary_priorities (project_id,label) VALUES ('CTR-2026-TRA','Hộ nghèo · cận nghèo (85 hộ)');
INSERT INTO relief_beneficiary_priorities (project_id,label) VALUES ('CTR-2026-TRA','Hộ có trẻ nhỏ < 5 tuổi (48 hộ)');

-- RELIEF_TEAM_MEMBERS (22)
INSERT INTO relief_team_members (id,project_id,person_id,role_label,phone) VALUES ('7ef25cd2-d564-41f7-8ac7-1090b6474f31','CTR-2026-BAVI','pt2','Trưởng đoàn cứu trợ','0913.***.004');
INSERT INTO relief_team_members (id,project_id,person_id,role_label,phone) VALUES ('442f76f3-d665-415c-9a09-320fecf21ce8','CTR-2026-BAVI','vpct1','Điều phối trưởng · thư ký','0912.***.011');
INSERT INTO relief_team_members (id,project_id,person_id,role_label,phone) VALUES ('a9e4a589-bad1-4300-8865-4446fb04aca6','CTR-2026-BAVI','vp2','Hậu cần · mua hàng','0912.***.802');
INSERT INTO relief_team_members (id,project_id,person_id,role_label,phone) VALUES ('26da5402-72c2-48b9-9ed8-e23fe73facf2','CTR-2026-BAVI','vp3','Kế toán chi trả','0912.***.803');
INSERT INTO relief_team_members (id,project_id,person_id,role_label,phone) VALUES ('9cbc1667-a4c1-4dff-904d-54fe15010e03','CTR-2026-BAVI','vp4','Bếp dã chiến','0912.***.804');
INSERT INTO relief_team_members (id,project_id,person_id,role_label,phone) VALUES ('31b8b338-dbdf-47d7-bfeb-df6d4799091b','CTR-2026-BAVI','dy1','Y tế đoàn (khám bệnh miễn phí)','0912.***.701');
INSERT INTO relief_team_members (id,project_id,person_id,role_label,phone) VALUES ('d85a7477-164d-4b32-9bce-6b40b8064a6b','CTR-2026-BAVI','mkt1','Truyền thông · ghi hình','0912.***.901');
INSERT INTO relief_team_members (id,project_id,person_id,role_label,phone) VALUES ('7985ab81-8205-44b0-8aa0-65329d205299','CTR-2026-BAVI','pc1','Pháp chế · biên bản','0912.***.031');
INSERT INTO relief_team_members (id,project_id,person_id,role_label,phone) VALUES ('a3d3761c-6ece-4266-b7ae-b78ee12047cc','CTR-2025-QT','ct','Cố vấn cao cấp (thăm hiện trường 2 ngày)','0913.***.001');
INSERT INTO relief_team_members (id,project_id,person_id,role_label,phone) VALUES ('d27df6b4-e90b-48fc-abfa-23bbfd81db7a','CTR-2025-QT','tgd','Trưởng đoàn cứu trợ','0913.***.002');
INSERT INTO relief_team_members (id,project_id,person_id,role_label,phone) VALUES ('922703a9-ee60-453f-98fe-f1e2228bfd07','CTR-2025-QT','pt1','Phó đoàn · điều phối','0913.***.003');
INSERT INTO relief_team_members (id,project_id,person_id,role_label,phone) VALUES ('0b6328c4-f0b0-4e7c-a422-26bb697251eb','CTR-2025-QT','vpct1','Thư ký · liên lạc chính quyền','0912.***.011');
INSERT INTO relief_team_members (id,project_id,person_id,role_label,phone) VALUES ('d4048372-f9cd-43e5-8916-34df8d12112f','CTR-2025-QT','vp2','Hậu cần · mua hàng bổ sung tại chỗ','0912.***.802');
INSERT INTO relief_team_members (id,project_id,person_id,role_label,phone) VALUES ('61c37a88-45f9-453f-b83a-bf8aa314ee7e','CTR-2025-QT','dy1','Trưởng nhóm y tế (3 bác sĩ)','0912.***.701');
INSERT INTO relief_team_members (id,project_id,person_id,role_label,phone) VALUES ('2748ba22-7248-4dbf-9fb8-7be319d6103d','CTR-2025-QT','mkt1','Truyền thông · phát trực tiếp','0912.***.901');
INSERT INTO relief_team_members (id,project_id,person_id,role_label,phone) VALUES ('46c43790-d736-4620-9b45-94fb412286d9','CTR-2024-YAGI','ct','Chủ tịch trực tiếp dẫn đoàn','0913.***.001');
INSERT INTO relief_team_members (id,project_id,person_id,role_label,phone) VALUES ('e4df554b-7bae-4d2c-8541-e69938a81f45','CTR-2024-YAGI','tgd','Đồng trưởng đoàn','0913.***.002');
INSERT INTO relief_team_members (id,project_id,person_id,role_label,phone) VALUES ('2e57c9b5-7698-4c67-bfcd-407c30e9e3b0','CTR-2024-YAGI','vpct1','Thư ký','0912.***.011');
INSERT INTO relief_team_members (id,project_id,person_id,role_label,phone) VALUES ('b345ccb1-8ce7-4364-9339-3f61261a9a1d','CTR-2024-YAGI','vp2','Hậu cần','0912.***.802');
INSERT INTO relief_team_members (id,project_id,person_id,role_label,phone) VALUES ('98c5408f-16aa-41e4-adf8-758b8d0898a2','CTR-2024-YAGI','dy1','Y tế','0912.***.701');
INSERT INTO relief_team_members (id,project_id,person_id,role_label,phone) VALUES ('22494f3a-70d6-43de-bc7d-2253bba9b0fd','CTR-2024-YAGI','mkt1','Truyền thông','0912.***.901');
INSERT INTO relief_team_members (id,project_id,person_id,role_label,phone) VALUES ('99b20e72-4895-4e0c-87d7-0121cfc172cd','CTR-2026-TRA','pt2','Trưởng đoàn (dự kiến)','0913.***.004');

-- RELIEF_VEHICLES (11)
INSERT INTO relief_vehicles (id,project_id,type,plate,driver,capacity) VALUES ('b4522677-e59e-46be-aa30-646b446c342c','CTR-2026-BAVI','Xe tải 5 tấn','99C-125.45','Lái xe Bảng','5 tấn hàng');
INSERT INTO relief_vehicles (id,project_id,type,plate,driver,capacity) VALUES ('ea71c134-73d5-41f9-b75c-2e0916437d3a','CTR-2026-BAVI','Xe tải 3.5 tấn','99C-138.72','Lái xe Kiên','3.5 tấn hàng');
INSERT INTO relief_vehicles (id,project_id,type,plate,driver,capacity) VALUES ('39a48099-4a3b-4721-ac78-8626c1e5b28f','CTR-2026-BAVI','Xe 16 chỗ','99B-011.89','Lái xe Đức','14 người + hành lý');
INSERT INTO relief_vehicles (id,project_id,type,plate,driver,capacity) VALUES ('cc0b434c-df9c-4e70-a80c-f656f2cd5f9c','CTR-2026-BAVI','Xe cứu thương lưu động','99A-088.12','Bs Phong','Y tế + thuốc men');
INSERT INTO relief_vehicles (id,project_id,type,plate,driver,capacity) VALUES ('7ff8e940-1ca0-484f-b92f-45ae17157dd8','CTR-2025-QT','Xe tải 8 tấn (thuê)','75C-055.11','Nhà xe Miền Trung','8 tấn');
INSERT INTO relief_vehicles (id,project_id,type,plate,driver,capacity) VALUES ('30f3fbf5-121a-43d4-b230-642d6c0106ff','CTR-2025-QT','Xe tải 5 tấn (thuê)','75C-042.18','Nhà xe Miền Trung','5 tấn');
INSERT INTO relief_vehicles (id,project_id,type,plate,driver,capacity) VALUES ('36ff7601-12a0-4896-8bb1-b5afe89df70e','CTR-2025-QT','Xuồng cao tốc thuê','—','Đội cứu hộ Quảng Trị','10 người/lượt');
INSERT INTO relief_vehicles (id,project_id,type,plate,driver,capacity) VALUES ('c8ad61ec-804d-4f0f-a270-7ff6623690f8','CTR-2025-QT','Xe 29 chỗ đoàn','75B-125.67','Lái xe Hoàng','28 người');
INSERT INTO relief_vehicles (id,project_id,type,plate,driver,capacity) VALUES ('1d74278a-30bb-4516-b9d9-fbb99b79e394','CTR-2024-YAGI','Xe tải 10 tấn','99C-089.12','Nhà xe Bắc Ninh','10 tấn');
INSERT INTO relief_vehicles (id,project_id,type,plate,driver,capacity) VALUES ('83811c94-22ce-436b-ac78-dbf112d2e0d7','CTR-2024-YAGI','Xe tải 5 tấn','99C-102.45','Nhà xe Bắc Ninh','5 tấn');
INSERT INTO relief_vehicles (id,project_id,type,plate,driver,capacity) VALUES ('c6b0cdc7-b93a-40d3-af2a-fe57a5225045','CTR-2024-YAGI','Xe 45 chỗ','99B-088.90','Lái xe Hùng','42 người');

-- RELIEF_CARGO (31)
INSERT INTO relief_cargo (id,project_id,item,qty,unit,total_label,per_label,cost) VALUES ('cacd0117-7928-424c-8d09-66c6ba171731','CTR-2026-BAVI','Gạo 25kg',380,'bao','9.500 kg','1 bao/hộ',95000000);
INSERT INTO relief_cargo (id,project_id,item,qty,unit,total_label,per_label,cost) VALUES ('cd313615-79a1-4076-8168-5fde1db98394','CTR-2026-BAVI','Mì tôm',380,'thùng (30 gói)','11.400 gói','1 thùng/hộ',22800000);
INSERT INTO relief_cargo (id,project_id,item,qty,unit,total_label,per_label,cost) VALUES ('e0ffe8c7-71ce-41ba-91cc-44b089037aa0','CTR-2026-BAVI','Nước lọc bình 20L',400,'bình','8.000 lít','≈1 bình/hộ',16000000);
INSERT INTO relief_cargo (id,project_id,item,qty,unit,total_label,per_label,cost) VALUES ('80587cfe-1186-4ea3-9975-59815d4ca72c','CTR-2026-BAVI','Chăn ấm',500,'chiếc','500 chăn','≈1,3 chăn/hộ',75000000);
INSERT INTO relief_cargo (id,project_id,item,qty,unit,total_label,per_label,cost) VALUES ('a967be74-c9b3-4c42-855b-ae77670b589d','CTR-2026-BAVI','Bộ dụng cụ y tế gia đình',380,'bộ','380 bộ','1 bộ/hộ',45600000);
INSERT INTO relief_cargo (id,project_id,item,qty,unit,total_label,per_label,cost) VALUES ('670949f2-d41d-4a3f-bbf1-e93438fd0f52','CTR-2026-BAVI','Quần áo mới',1520,'bộ','1520 bộ','≈1 bộ/người',152000000);
INSERT INTO relief_cargo (id,project_id,item,qty,unit,total_label,per_label,cost) VALUES ('adefbbe4-6a47-4128-b199-a5f55645cac1','CTR-2026-BAVI','Dụng cụ dọn dẹp (chổi, xô, xẻng)',200,'combo','200 combo','1 combo/2 hộ',28000000);
INSERT INTO relief_cargo (id,project_id,item,qty,unit,total_label,per_label,cost) VALUES ('b52a2bd2-eed4-476c-bcfc-d6906e9a61e2','CTR-2026-BAVI','Đèn pin + pin dự phòng',380,'chiếc','380 đèn','1/hộ',15200000);
INSERT INTO relief_cargo (id,project_id,item,qty,unit,total_label,per_label,cost) VALUES ('066a6fc7-1c8e-43af-aaf3-b193f52c3e24','CTR-2026-BAVI','Máy phát 2.5kW (cho UBND xã)',5,'chiếc','5 máy','1/xã',45000000);
INSERT INTO relief_cargo (id,project_id,item,qty,unit,total_label,per_label,cost) VALUES ('c6bd4374-49be-4a20-8b9c-98e6e8e34f2b','CTR-2026-BAVI','Tiền mặt hỗ trợ hộ ưu tiên',60,'suất 2tr','120 triệu','2tr/hộ ưu tiên',120000000);
INSERT INTO relief_cargo (id,project_id,item,qty,unit,total_label,per_label,cost) VALUES ('8f31d12d-2283-4c6a-85a9-2a0bcfe82c49','CTR-2025-QT','Gạo 25kg',520,'bao','13.000 kg','1 bao/hộ',130000000);
INSERT INTO relief_cargo (id,project_id,item,qty,unit,total_label,per_label,cost) VALUES ('70a64c4e-5432-415e-ad76-147502512b87','CTR-2025-QT','Nước lọc chai 500ml (thùng 24 chai)',800,'thùng','19.200 chai','≈1,5 thùng/hộ',60000000);
INSERT INTO relief_cargo (id,project_id,item,qty,unit,total_label,per_label,cost) VALUES ('27f8cb48-18ff-4c85-a0c2-e233a0aaff2a','CTR-2025-QT','Mì tôm + lương khô',520,'combo','520 combo','1/hộ',41600000);
INSERT INTO relief_cargo (id,project_id,item,qty,unit,total_label,per_label,cost) VALUES ('e3c75b9f-36d6-496d-9de2-3e7be8d04436','CTR-2025-QT','Chăn màn + quần áo (đóng gói)',520,'túi','520 túi','1/hộ',156000000);
INSERT INTO relief_cargo (id,project_id,item,qty,unit,total_label,per_label,cost) VALUES ('acb51a0f-bada-4ee9-9c5a-e7c045eb859a','CTR-2025-QT','Máy phát 5kW',7,'chiếc','7 máy','1/xã',91000000);
INSERT INTO relief_cargo (id,project_id,item,qty,unit,total_label,per_label,cost) VALUES ('0efe0df8-8531-4585-b21d-4b5e7f4a0dfe','CTR-2025-QT','Vật liệu sửa nhà (tôn + xi măng)',35,'gói','35 gói','1/hộ bị lũ cuốn',245000000);
INSERT INTO relief_cargo (id,project_id,item,qty,unit,total_label,per_label,cost) VALUES ('230ca11f-32fb-4a7e-86e9-b5d387d7c768','CTR-2025-QT','Tiền mặt cứu trợ khẩn',170,'suất','340 triệu','2tr/hộ ưu tiên',340000000);
INSERT INTO relief_cargo (id,project_id,item,qty,unit,total_label,per_label,cost) VALUES ('3b7f8f60-1674-47c4-b2f9-b39fed5920d7','CTR-2025-QT','Thuốc + trang thiết bị y tế',1,'gói','1 gói','toàn chiến dịch',55000000);
INSERT INTO relief_cargo (id,project_id,item,qty,unit,total_label,per_label,cost) VALUES ('7fc174f4-db4c-416a-915e-670e8049c7e9','CTR-2024-YAGI','Gạo · lương thực',682,'gói','15.000 kg','1 gói/hộ',195000000);
INSERT INTO relief_cargo (id,project_id,item,qty,unit,total_label,per_label,cost) VALUES ('18bd2da6-5598-49e4-9a4e-e4314aba7950','CTR-2024-YAGI','Chăn màn · quần áo mùa lạnh',682,'túi','682 túi','1/hộ',205000000);
INSERT INTO relief_cargo (id,project_id,item,qty,unit,total_label,per_label,cost) VALUES ('6fad6520-983c-4a59-8069-792ff1d7755f','CTR-2024-YAGI','Vật liệu sửa nhà',45,'gói','45 gói','1/hộ sập nhà',405000000);
INSERT INTO relief_cargo (id,project_id,item,qty,unit,total_label,per_label,cost) VALUES ('752036be-63d0-4fa3-9263-28bc9988ebf1','CTR-2024-YAGI','Tiền mặt (hộ ưu tiên & mất người)',91,'suất','360 triệu','2-5tr/hộ',360000000);
INSERT INTO relief_cargo (id,project_id,item,qty,unit,total_label,per_label,cost) VALUES ('0621b1af-c2a8-4aa5-9ec0-4d225d1a9203','CTR-2024-YAGI','Sách vở học tập cho trẻ',400,'bộ','400 bộ','1/trẻ',60000000);
INSERT INTO relief_cargo (id,project_id,item,qty,unit,total_label,per_label,cost) VALUES ('0d551f8d-89b1-43d2-b266-8d5f8d26b9c3','CTR-2024-YAGI','Y tế · thuốc men',1,'gói','1 gói','toàn đoàn',80000000);
INSERT INTO relief_cargo (id,project_id,item,qty,unit,total_label,per_label,cost) VALUES ('0cbe29d4-5975-425e-a67b-13a44dadcb44','CTR-2024-YAGI','Chi phí đi lại · ăn ở đoàn',1,'gói','1 gói','toàn đoàn',195000000);
INSERT INTO relief_cargo (id,project_id,item,qty,unit,total_label,per_label,cost) VALUES ('c3bc0ea4-4da2-4caa-8b30-31a7112e9919','CTR-2024-YAGI','Học bổng cho trẻ mồ côi',32,'suất/năm','32 suất','10tr/em/năm',285000000);
INSERT INTO relief_cargo (id,project_id,item,qty,unit,total_label,per_label,cost) VALUES ('cc23b4fa-9e1f-4a17-960e-3519b2da5a07','CTR-2026-TRA','Bồn nước 500L (lắp tại nhà dân)',240,'bồn','240 bồn','1/hộ',240000000);
INSERT INTO relief_cargo (id,project_id,item,qty,unit,total_label,per_label,cost) VALUES ('a5267954-5269-4385-8173-d44d3fcf9f1c','CTR-2026-TRA','Máy lọc nước hộ gia đình',240,'máy','240 máy','1/hộ',180000000);
INSERT INTO relief_cargo (id,project_id,item,qty,unit,total_label,per_label,cost) VALUES ('3b32b147-4b81-4c18-a254-d533f8381875','CTR-2026-TRA','Cấp nước sạch (xe téc)',5,'chuyến','150 m³','luân phiên',30000000);
INSERT INTO relief_cargo (id,project_id,item,qty,unit,total_label,per_label,cost) VALUES ('12c2d70d-7f18-42e2-ba0c-318251b1fec8','CTR-2026-TRA','Thực phẩm bổ sung + sữa cho trẻ',48,'gói/tháng x 3','144 gói','1 gói/trẻ/tháng',86400000);
INSERT INTO relief_cargo (id,project_id,item,qty,unit,total_label,per_label,cost) VALUES ('b350c8f2-dde0-4d82-8057-9e00da64ba4f','CTR-2026-TRA','Chi phí đi lại + hậu cần',1,'gói','—','—',83600000);

-- RELIEF_ITINERARY (22)
INSERT INTO relief_itinerary (id,project_id,day,date_label,from_label,to_label,distance_label,activities,sleep_at) VALUES ('e9893f07-311e-43c7-9f67-8714580bec91','CTR-2026-BAVI',1,'28/07','TP Bắc Ninh','Lào Cai (TP)','280 km','Xuất phát 05:00 · Đón nhân sự sân bay 07:00 · Nghỉ trưa Yên Bái · Đến kho tạm Lào Cai 16:00 · Bàn giao với MTTQ tỉnh','Nhà khách UBND tỉnh Lào Cai');
INSERT INTO relief_itinerary (id,project_id,day,date_label,from_label,to_label,distance_label,activities,sleep_at) VALUES ('dfde8dab-8592-4333-9377-54b50b96aa18','CTR-2026-BAVI',2,'29/07','Lào Cai TP','Xã A Mú Sung, Bát Xát','85 km','Bốc hàng 05:30 · Đi vùng cao (đường sạt lở) · Trao 78 hộ (12:00-16:00) · Tổ y tế khám 42 người','Trường học xã');
INSERT INTO relief_itinerary (id,project_id,day,date_label,from_label,to_label,distance_label,activities,sleep_at) VALUES ('9e8cb6ff-4f1a-44c3-b510-b1fa1f2ac68d','CTR-2026-BAVI',3,'30/07','Bát Xát','Xã Cốc Ly, Bắc Hà','95 km','Trao 92 hộ · Cấp máy phát UBND xã · Truyền thông ghi hình · Họp giao ban tối','Nhà văn hoá xã');
INSERT INTO relief_itinerary (id,project_id,day,date_label,from_label,to_label,distance_label,activities,sleep_at) VALUES ('64cef00e-e85f-442e-a25f-e02bbc675234','CTR-2026-BAVI',4,'31/07','Bắc Hà','Xã Sín Chéng, Si Ma Cai','65 km','Trao 68 hộ vùng sạt · Ưu tiên hộ có người khuyết tật · Y tế khám 55 người','Trường tiểu học xã');
INSERT INTO relief_itinerary (id,project_id,day,date_label,from_label,to_label,distance_label,activities,sleep_at) VALUES ('b49e330e-0ff0-4227-806b-a9d7497af058','CTR-2026-BAVI',5,'01/08','Si Ma Cai','Xã Nậm Đét, Bắc Hà','78 km','Trao 82 hộ · Bàn giao 60 suất tiền mặt (kèm CCCD + ký nhận)','Homestay xã');
INSERT INTO relief_itinerary (id,project_id,day,date_label,from_label,to_label,distance_label,activities,sleep_at) VALUES ('fc48f002-b717-49c6-9392-0f0a527d7b49','CTR-2026-BAVI',6,'02/08','Nậm Đét','TP Bắc Ninh','365 km','Trao 60 hộ cuối · Ký biên bản với UBND huyện · Về Bắc Ninh 22:00','—');
INSERT INTO relief_itinerary (id,project_id,day,date_label,from_label,to_label,distance_label,activities,sleep_at) VALUES ('b83a01d5-79da-4f72-9574-92692ebe3101','CTR-2025-QT',1,'15/07','Bắc Ninh','Đông Hà · QT','620 km','Xuất phát 04:00 · Đến kho MTTQ tỉnh 20:00','KS Đông Hà');
INSERT INTO relief_itinerary (id,project_id,day,date_label,from_label,to_label,distance_label,activities,sleep_at) VALUES ('48e8f747-ad59-4b07-afa1-b6bf88102b0a','CTR-2025-QT',2,'16/07','Đông Hà','Xã Ba Lòng, Đakrông','75 km','Cứu trợ khẩn 120 hộ · Xuồng vào xã bị chia cắt','Trường học xã');
INSERT INTO relief_itinerary (id,project_id,day,date_label,from_label,to_label,distance_label,activities,sleep_at) VALUES ('cb7624e4-bae8-45db-8c1c-e3cd73f5dba1','CTR-2025-QT',3,'17/07','Ba Lòng','Hải Lăng · Triệu Phong','95 km','180 hộ · Y tế khám 145 người','Nhà khách huyện');
INSERT INTO relief_itinerary (id,project_id,day,date_label,from_label,to_label,distance_label,activities,sleep_at) VALUES ('c2a1e34a-c558-466c-9c86-aa97677e6221','CTR-2025-QT',4,'18/07','Triệu Phong','Vĩnh Linh · Gio Linh','85 km','160 hộ · Trao 35 gói vật liệu sửa nhà','Trường học');
INSERT INTO relief_itinerary (id,project_id,day,date_label,from_label,to_label,distance_label,activities,sleep_at) VALUES ('353de52e-2239-46e6-8b54-f66ebc474b82','CTR-2025-QT',5,'19/07','Gio Linh','Xã Trường Sơn, Quảng Ninh','110 km','60 hộ vùng sâu · Trao tiền mặt · Livestream','Nhà văn hoá');
INSERT INTO relief_itinerary (id,project_id,day,date_label,from_label,to_label,distance_label,activities,sleep_at) VALUES ('01a33864-7828-4ad2-a3a1-6d346411723e','CTR-2025-QT',6,'20/07','Quảng Ninh','Nghỉ · dự trữ','—','Y tế lưu động · Truyền thông tổng kết địa phương','Trường học');
INSERT INTO relief_itinerary (id,project_id,day,date_label,from_label,to_label,distance_label,activities,sleep_at) VALUES ('8296c461-5efb-4376-b631-1f5089e5459c','CTR-2025-QT',7,'21/07','','Ký biên bản','—','Ký biên bản với MTTQ 2 tỉnh · Bàn giao dư 60tr cho quỹ đồng bào','KS Đông Hà');
INSERT INTO relief_itinerary (id,project_id,day,date_label,from_label,to_label,distance_label,activities,sleep_at) VALUES ('5519a520-e536-4364-8185-422c5946fbba','CTR-2025-QT',8,'22/07','Đông Hà','Bắc Ninh','620 km','Về Bắc Ninh 22:00 · Tổng kết đoàn','—');
INSERT INTO relief_itinerary (id,project_id,day,date_label,from_label,to_label,distance_label,activities,sleep_at) VALUES ('468445da-431a-47c4-8f2e-912819902ff5','CTR-2024-YAGI',1,'15/09','Bắc Ninh','Hà Giang','350 km','Xuất phát · đến TP Hà Giang 20:00','Nhà khách UBND tỉnh');
INSERT INTO relief_itinerary (id,project_id,day,date_label,from_label,to_label,distance_label,activities,sleep_at) VALUES ('84666617-beb7-46ad-b767-73479a826030','CTR-2024-YAGI',2,'16/09','HG','Xã Yên Định, Bắc Mê','95 km','85 hộ · thăm 5 hộ mất người','Trường học');
INSERT INTO relief_itinerary (id,project_id,day,date_label,from_label,to_label,distance_label,activities,sleep_at) VALUES ('a4234475-1aac-413c-8f29-955c3ac18522','CTR-2024-YAGI',3,'17/09','Bắc Mê','Huyện Đồng Văn','160 km','130 hộ vùng sâu','Nhà khách huyện');
INSERT INTO relief_itinerary (id,project_id,day,date_label,from_label,to_label,distance_label,activities,sleep_at) VALUES ('991cfd09-d3a4-42a5-a895-af2b1475560d','CTR-2024-YAGI',4,'18/09','Đồng Văn','Mèo Vạc','75 km','110 hộ + vật liệu sửa nhà','Nhà khách');
INSERT INTO relief_itinerary (id,project_id,day,date_label,from_label,to_label,distance_label,activities,sleep_at) VALUES ('2e391c6f-e011-40ae-9b2b-f19f303acf9b','CTR-2024-YAGI',5,'19/09','Mèo Vạc','Bảo Lâm, Cao Bằng','145 km','138 hộ + học bổng 15 trẻ','Trường học');
INSERT INTO relief_itinerary (id,project_id,day,date_label,from_label,to_label,distance_label,activities,sleep_at) VALUES ('0b35269b-b3cd-4831-8b6b-f87b59676c9e','CTR-2024-YAGI',6,'20/09','Bảo Lâm','Nguyên Bình','95 km','119 hộ','Trường học');
INSERT INTO relief_itinerary (id,project_id,day,date_label,from_label,to_label,distance_label,activities,sleep_at) VALUES ('e8047cad-c5b8-4961-bedf-7f0c66dfe2fb','CTR-2024-YAGI',7,'21/09','Nguyên Bình','Ký biên bản','—','100 hộ cuối · ký bàn giao','KS Cao Bằng');
INSERT INTO relief_itinerary (id,project_id,day,date_label,from_label,to_label,distance_label,activities,sleep_at) VALUES ('7954d5da-2217-44a7-9fba-811cc5193dc8','CTR-2024-YAGI',8,'22/09','Cao Bằng','Bắc Ninh','285 km','Về Bắc Ninh · họp tổng kết đoàn','—');

-- RELIEF_TASKS (19)
INSERT INTO relief_tasks (id,project_id,title,owner_id,deadline,status) VALUES ('fbb2ff77-81c1-490d-bf2a-ebd73965da66','CTR-2026-BAVI','Ký hợp đồng thuê xe tải & xe khách','vp2','2026-07-25','done');
INSERT INTO relief_tasks (id,project_id,title,owner_id,deadline,status) VALUES ('eeb05641-a85b-4de4-a1f4-777242a58e19','CTR-2026-BAVI','Đặt gạo 9.500kg với NCC Cát Tường Food','vp2','2026-07-26','done');
INSERT INTO relief_tasks (id,project_id,title,owner_id,deadline,status) VALUES ('26b2e427-8f0d-494f-8536-3b10a024f138','CTR-2026-BAVI','Phối hợp MTTQ Lào Cai chốt danh sách 380 hộ','vpct1','2026-07-26','doing');
INSERT INTO relief_tasks (id,project_id,title,owner_id,deadline,status) VALUES ('92056cce-048f-43a1-b246-68a0a818e402','CTR-2026-BAVI','Duyệt ngân sách 850tr — Chủ tịch','ct','2026-07-25','done');
INSERT INTO relief_tasks (id,project_id,title,owner_id,deadline,status) VALUES ('688393c8-6cad-4d1d-a69f-95bc5fab884e','CTR-2026-BAVI','Đóng gói hàng cứu trợ tại kho tổng','vp1','2026-07-27','doing');
INSERT INTO relief_tasks (id,project_id,title,owner_id,deadline,status) VALUES ('8c93f864-0d90-424b-93e7-f7025dabf6cb','CTR-2026-BAVI','Chuẩn bị bộ dụng cụ y tế · thuốc men','dy1','2026-07-27','doing');
INSERT INTO relief_tasks (id,project_id,title,owner_id,deadline,status) VALUES ('78f7a350-0c2b-4e5c-8eec-b3512ab24bc3','CTR-2026-BAVI','Kịch bản truyền thông + album ảnh','mkt1','2026-07-27','ack');
INSERT INTO relief_tasks (id,project_id,title,owner_id,deadline,status) VALUES ('35532f2e-8d50-4afa-b60e-6577ef48fe99','CTR-2026-BAVI','Kiểm tra CCCD 60 hộ nhận tiền mặt','pc1','2026-07-27','issued');
INSERT INTO relief_tasks (id,project_id,title,owner_id,deadline,status) VALUES ('b5fd8a48-8877-4874-acc9-14eaa458181b','CTR-2026-BAVI','Họp toàn đoàn briefing an toàn','pt2','2026-07-27','issued');
INSERT INTO relief_tasks (id,project_id,title,owner_id,deadline,status) VALUES ('c9f6732f-be87-47fc-b299-9131947ea0bf','CTR-2025-QT','Cứu trợ khẩn Ba Lòng — 120 hộ','tgd','2026-07-16','done');
INSERT INTO relief_tasks (id,project_id,title,owner_id,deadline,status) VALUES ('2b2fde19-6467-4d58-a7f3-9c81603f2f1a','CTR-2025-QT','Cứu trợ Hải Lăng — 180 hộ','tgd','2026-07-17','done');
INSERT INTO relief_tasks (id,project_id,title,owner_id,deadline,status) VALUES ('20dcfb3e-5999-4c2c-9b82-ff2b08732d2c','CTR-2025-QT','Cứu trợ Vĩnh Linh — 160 hộ + 35 gói vật liệu','pt1','2026-07-18','done');
INSERT INTO relief_tasks (id,project_id,title,owner_id,deadline,status) VALUES ('4eef904c-f67d-439e-afb0-3d9b6f26cee0','CTR-2025-QT','Vào xã Trường Sơn bằng xuồng','pt1','2026-07-19','doing');
INSERT INTO relief_tasks (id,project_id,title,owner_id,deadline,status) VALUES ('ea58b05e-a1d3-4e84-a527-b25c397290a0','CTR-2025-QT','Y tế lưu động ngày 20/07','dy1','2026-07-20','ack');
INSERT INTO relief_tasks (id,project_id,title,owner_id,deadline,status) VALUES ('16b0cf83-2bbe-4994-8f62-5b90a0c1cb7a','CTR-2025-QT','Livestream tổng kết chiến dịch','mkt1','2026-07-21','ack');
INSERT INTO relief_tasks (id,project_id,title,owner_id,deadline,status) VALUES ('bff2275d-cd89-4557-9b01-a59111a64395','CTR-2025-QT','Ký biên bản bàn giao dư quỹ 60tr','vpct1','2026-07-21','issued');
INSERT INTO relief_tasks (id,project_id,title,owner_id,deadline,status) VALUES ('bd950597-115a-49a7-954d-b074df29847f','CTR-2026-TRA','Khảo sát thực địa 4 xã','pt2','2026-08-15','issued');
INSERT INTO relief_tasks (id,project_id,title,owner_id,deadline,status) VALUES ('2fac45ad-8192-4502-9328-39a2e09b6f61','CTR-2026-TRA','Chốt danh sách 240 hộ với UBND huyện','vpct1','2026-08-25','issued');
INSERT INTO relief_tasks (id,project_id,title,owner_id,deadline,status) VALUES ('d841acf6-0b4d-4f0f-bbe6-fb0869744dd1','CTR-2026-TRA','Đấu thầu 240 bồn nước + 240 máy lọc','vp2','2026-09-01','issued');

-- RELIEF_LOGS (11)
INSERT INTO relief_logs (id,project_id,author_id,message,logged_at) VALUES ('5d2303fd-11b1-40c5-b2b7-a7dd29c6d105','CTR-2026-BAVI','pt2','Ký duyệt kế hoạch tổng thể. Ngân sách 850tr được phê chuẩn.','2026-07-14 07:16:44.063');
INSERT INTO relief_logs (id,project_id,author_id,message,logged_at) VALUES ('877faff1-ddb2-4e1e-871a-f090065902b8','CTR-2026-BAVI','vp2','Đã ký hợp đồng 3 nhà xe. Giá hợp lý, đầy đủ bảo hiểm.','2026-07-15 07:16:44.063');
INSERT INTO relief_logs (id,project_id,author_id,message,logged_at) VALUES ('d18aac09-dcd5-4482-89d0-4ef18ebad49c','CTR-2026-BAVI','vpct1','Đã liên hệ MTTQ Lào Cai. Họ cung cấp danh sách sơ bộ 420 hộ để rà soát về 380.','2026-07-16 07:16:44.063');
INSERT INTO relief_logs (id,project_id,author_id,message,logged_at) VALUES ('1f112e27-ed61-47d2-b189-b507c0b268bb','CTR-2026-BAVI','vp1','Kho tổng đã tập kết 6/10 mặt hàng. Còn thiếu máy phát và bộ y tế đang về.','2026-07-16 19:16:44.063');
INSERT INTO relief_logs (id,project_id,author_id,message,logged_at) VALUES ('99ef5332-62ad-4bd8-8851-37c60c8a2650','CTR-2025-QT','tgd','Đến QT lúc 20:00. Đường vào Ba Lòng còn khó, phải chờ xuồng.','2026-07-13 07:16:44.063');
INSERT INTO relief_logs (id,project_id,author_id,message,logged_at) VALUES ('6e818957-e25d-4c85-8984-7c76efc79e5a','CTR-2025-QT','tgd','Hoàn thành 120 hộ Ba Lòng. Cảm động — 7 hộ có người đã mất trong lũ.','2026-07-14 07:16:44.063');
INSERT INTO relief_logs (id,project_id,author_id,message,logged_at) VALUES ('c55de09f-6ca9-4e03-a954-c8692a6dc4c1','CTR-2025-QT','pt1','Hải Lăng OK 180 hộ. Y tế khám cấp cứu 4 ca sốt vì lạnh.','2026-07-15 07:16:44.063');
INSERT INTO relief_logs (id,project_id,author_id,message,logged_at) VALUES ('fbf47cdc-a353-4e10-a405-345cc6e9fbb6','CTR-2025-QT','mkt1','Livestream Facebook chạm 42k người xem. Nhận thêm 180tr donation trong đêm.','2026-07-16 07:16:44.063');
INSERT INTO relief_logs (id,project_id,author_id,message,logged_at) VALUES ('2a4f1423-98d4-4d13-8e9f-8ae746e616ba','CTR-2024-YAGI','ct','Đến Hà Giang. Sạt lở khủng khiếp — có nơi mất cả bản.','2024-09-15 20:00:00.000');
INSERT INTO relief_logs (id,project_id,author_id,message,logged_at) VALUES ('db1f1f57-5119-49cb-b9aa-bf3c0e5d98ad','CTR-2024-YAGI','ct','Kết thúc chiến dịch. Cảm ơn 32 CBNV đã cùng tham gia. Chi 1785/1800tr, dư 15tr chuyển quỹ đồng bào.','2024-09-22 22:00:00.000');
INSERT INTO relief_logs (id,project_id,author_id,message,logged_at) VALUES ('454663eb-0918-48ca-89cc-165dde946931','CTR-2026-TRA','pt2','Đã có văn thư mời hỗ trợ từ Sở LĐ-TB-XH Trà Vinh. Bắt đầu lập dự án.','2026-07-12 07:16:44.063');

-- RELIEF_APPROVALS (16)
INSERT INTO relief_approvals (project_id,role,decision,note,decided_by,decided_at) VALUES ('CTR-2026-BAVI','ct','approved',NULL,NULL,NULL);
INSERT INTO relief_approvals (project_id,role,decision,note,decided_by,decided_at) VALUES ('CTR-2026-BAVI','tgd','approved',NULL,NULL,NULL);
INSERT INTO relief_approvals (project_id,role,decision,note,decided_by,decided_at) VALUES ('CTR-2026-BAVI','congdoan','approved',NULL,NULL,NULL);
INSERT INTO relief_approvals (project_id,role,decision,note,decided_by,decided_at) VALUES ('CTR-2026-BAVI','phapche','reviewing',NULL,NULL,NULL);
INSERT INTO relief_approvals (project_id,role,decision,note,decided_by,decided_at) VALUES ('CTR-2025-QT','ct','approved',NULL,NULL,NULL);
INSERT INTO relief_approvals (project_id,role,decision,note,decided_by,decided_at) VALUES ('CTR-2025-QT','tgd','approved',NULL,NULL,NULL);
INSERT INTO relief_approvals (project_id,role,decision,note,decided_by,decided_at) VALUES ('CTR-2025-QT','congdoan','approved',NULL,NULL,NULL);
INSERT INTO relief_approvals (project_id,role,decision,note,decided_by,decided_at) VALUES ('CTR-2025-QT','phapche','approved',NULL,NULL,NULL);
INSERT INTO relief_approvals (project_id,role,decision,note,decided_by,decided_at) VALUES ('CTR-2024-YAGI','ct','approved',NULL,NULL,NULL);
INSERT INTO relief_approvals (project_id,role,decision,note,decided_by,decided_at) VALUES ('CTR-2024-YAGI','tgd','approved',NULL,NULL,NULL);
INSERT INTO relief_approvals (project_id,role,decision,note,decided_by,decided_at) VALUES ('CTR-2024-YAGI','congdoan','approved',NULL,NULL,NULL);
INSERT INTO relief_approvals (project_id,role,decision,note,decided_by,decided_at) VALUES ('CTR-2024-YAGI','phapche','approved',NULL,NULL,NULL);
INSERT INTO relief_approvals (project_id,role,decision,note,decided_by,decided_at) VALUES ('CTR-2026-TRA','ct','reviewing',NULL,NULL,NULL);
INSERT INTO relief_approvals (project_id,role,decision,note,decided_by,decided_at) VALUES ('CTR-2026-TRA','tgd','draft',NULL,NULL,NULL);
INSERT INTO relief_approvals (project_id,role,decision,note,decided_by,decided_at) VALUES ('CTR-2026-TRA','congdoan','draft',NULL,NULL,NULL);
INSERT INTO relief_approvals (project_id,role,decision,note,decided_by,decided_at) VALUES ('CTR-2026-TRA','phapche','draft',NULL,NULL,NULL);

-- RELIEF_MEDIA (2)
INSERT INTO relief_media (id,project_id,r2_key,caption,media_date) VALUES ('0475e5ba-2fd7-4413-a928-333b4a61a1e6','CTR-2025-QT','photo1','Trao gạo cho bà con Ba Lòng — 16/07','2026-07-16');
INSERT INTO relief_media (id,project_id,r2_key,caption,media_date) VALUES ('ef7369a5-62d2-4333-b05b-0f3f1779eb05','CTR-2025-QT','photo2','Đội y tế khám cho cụ bà 82 tuổi tại Hải Lăng','2026-07-17');
