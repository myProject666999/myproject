-- 插入管理员用户 (密码: 123456)
INSERT INTO `user` (`username`, `password`, `phone`, `nickname`, `role`, `status`)
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '13800000000', '系统管理员', 'ADMIN', 1);

-- 插入测试用户 (密码: 123456)
INSERT INTO `user` (`username`, `password`, `phone`, `nickname`, `role`, `status`)
VALUES 
('user1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '13800000001', '用户张三', 'USER', 1),
('collector1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '13800000002', '回收员李四', 'COLLECTOR', 1);

-- 插入回收员信息
INSERT INTO `collector` (`user_id`, `real_name`, `id_card`, `work_area`, `vehicle`, `rating`, `order_count`, `status`)
VALUES (3, '李四', '110101199003078888', '北京市朝阳区', '电动三轮车', 4.85, 128, 1);

-- 插入用户地址
INSERT INTO `user_address` (`user_id`, `name`, `phone`, `province`, `city`, `district`, `detail_address`, `latitude`, `longitude`, `is_default`)
VALUES 
(2, '张三', '13800000001', '北京市', '北京市', '朝阳区', '建国路88号现代城A座1001室', 39.9087, 116.4123, 1),
(2, '张三', '13800000001', '北京市', '北京市', '海淀区', '中关村大街1号海龙大厦5层', 39.9842, 116.3160, 0);

-- 插入品类数据
INSERT INTO `category` (`name`, `parent_id`, `icon`, `description`, `base_price`, `unit`, `sort`, `status`)
VALUES 
('家电回收', 0, '📺', '各类家电回收', NULL, NULL, 1, 1),
('衣物回收', 0, '👕', '各类衣物回收', NULL, NULL, 2, 1),
('书籍回收', 0, '📚', '各类书籍回收', NULL, NULL, 3, 1),
('数码产品', 0, '📱', '数码产品回收', NULL, NULL, 4, 1),
('冰箱', 1, '❄️', '冰箱回收', 200.00, '台', 1, 1),
('洗衣机', 1, '🌀', '洗衣机回收', 150.00, '台', 2, 1),
('空调', 1, '❄️', '空调回收', 300.00, '台', 3, 1),
('电视机', 1, '📺', '电视机回收', 100.00, '台', 4, 1),
('旧衣物', 2, '👚', '旧衣物回收', 2.00, '公斤', 1, 1),
('旧鞋', 2, '👟', '旧鞋回收', 3.00, '公斤', 2, 1),
('旧书', 3, '📘', '旧书回收', 1.50, '公斤', 1, 1),
('教材教辅', 3, '📖', '教材教辅回收', 1.00, '公斤', 2, 1),
('手机', 4, '📱', '手机回收', NULL, '台', 1, 1),
('笔记本电脑', 4, '💻', '笔记本电脑回收', NULL, '台', 2, 1);

-- 插入估价模型数据
INSERT INTO `estimate_model` (`category_id`, `factor_name`, `factor_type`, `options`, `min_value`, `max_value`, `price_impact`, `sort`)
VALUES 
(5, '使用年限', 'SELECT', '["全新未拆封(+20%)","1年以内(+10%)","1-3年(0%)","3-5年(-20%)","5年以上(-40%)"]', NULL, NULL, 10.00, 1),
(5, '外观状况', 'SELECT', '["完好无损(+20%)","轻微划痕(0%)","明显磨损(-20%)","外观损坏(-40%)"]', NULL, NULL, 10.00, 2),
(5, '功能状态', 'SELECT', '["正常使用(+10%)","小故障不影响使用(0%)","需要维修(-30%)","无法使用(-60%)"]', NULL, NULL, 10.00, 3),
(9, '衣物重量', 'NUMBER', NULL, 1.00, 100.00, 2.00, 1),
(9, '衣物新旧', 'SELECT', '["九成新以上(+20%)","七八成新(0%)","五成新以下(-30%)"]', NULL, NULL, 5.00, 2),
(11, '书籍重量', 'NUMBER', NULL, 1.00, 200.00, 1.50, 1),
(11, '书籍类型', 'SELECT', '["名著/畅销书(+30%)","普通书籍(0%)","杂志报刊(-20%)"]', NULL, NULL, 10.00, 2);
