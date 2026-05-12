-- 同城速运配送平台 数据库初始化脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS samecity_express DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE samecity_express;

-- 管理员默认账号
-- 用户名: admin
-- 密码: admin123
-- 注意: 首次登录后请修改密码

-- 管理员账号 (使用 bcrypt 加密后的密码)
-- 您可以使用以下Go代码生成新密码:
-- hash, _ := utils.HashPassword("your_password")
-- fmt.Println(hash)

INSERT INTO admin (username, password, real_name, role, status) VALUES
('admin', '$2a$14$y0Xy1Xy2Xy3Xy4Xy5Xy6Xy7Xy8Xy9Xy0Xy1Xy2Xy3Xy4Xy5Xy6X', '超级管理员', 2, 1)
ON DUPLICATE KEY UPDATE username = username;

-- 计费规则
INSERT INTO pricing_rule (name, base_price, base_distance, distance_price, base_weight, weight_price, time_surcharge, start_time, end_time, is_enabled, priority) VALUES
('常规时段', 8.0, 3.0, 2.0, 5.0, 1.0, 0.0, NULL, NULL, true, 0),
('早高峰', 8.0, 3.0, 2.5, 5.0, 1.5, 3.0, '07:00', '09:00', true, 1),
('午间高峰', 8.0, 3.0, 2.5, 5.0, 1.5, 3.0, '11:00', '13:00', true, 1),
('晚高峰', 8.0, 3.0, 2.5, 5.0, 1.5, 3.0, '17:00', '19:00', true, 1),
('夜间时段', 10.0, 3.0, 3.0, 5.0, 2.0, 5.0, '22:00', '06:00', true, 2)
ON DUPLICATE KEY UPDATE name = name;
