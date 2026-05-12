CREATE DATABASE IF NOT EXISTS `pet_grooming` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `pet_grooming`;

-- 服务套餐初始数据
INSERT INTO `services` (`id`, `name`, `category`, `price`, `duration`, `description`, `status`, `created_at`, `updated_at`) VALUES
('service-bath-001', '基础洗澡', 'bath', 80.00, 45, '包括洗澡、吹干、梳毛、指甲修剪', 1, NOW(), NOW()),
('service-bath-002', '深层清洁洗澡', 'bath', 120.00, 60, '高级洗护配方，适合敏感皮肤', 1, NOW(), NOW()),
('service-spa-001', '基础SPA', 'spa', 150.00, 60, '精油按摩、护毛护理', 1, NOW(), NOW()),
('service-spa-002', '豪华SPA', 'spa', 250.00, 90, '全身精油SPA、深层护理、造型设计', 1, NOW(), NOW()),
('service-trim-001', '基础剪毛', 'trimming', 100.00, 60, '基础造型修剪', 1, NOW(), NOW()),
('service-trim-002', '精修造型', 'trimming', 200.00, 90, '专业造型设计，根据品种特点修剪', 1, NOW(), NOW()),
('service-dye-001', '局部染色', 'dyeing', 150.00, 60, '耳朵、尾巴等局部染色', 1, NOW(), NOW()),
('service-dye-002', '全身创意染色', 'dyeing', 300.00, 120, '全身创意造型染色', 1, NOW(), NOW());
