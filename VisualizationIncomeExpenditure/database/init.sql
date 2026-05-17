-- 创建数据库
CREATE DATABASE IF NOT EXISTS income_expenditure CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE income_expenditure;

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `nickname` VARCHAR(50),
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 分类表
CREATE TABLE IF NOT EXISTS `category` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL,
    `type` TINYINT NOT NULL COMMENT '1:收入 2:支出',
    `icon` VARCHAR(100),
    `sort` INT DEFAULT 0,
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 收支记录表
CREATE TABLE IF NOT EXISTS `record` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `type` TINYINT NOT NULL COMMENT '1:收入 2:支出',
    `category_id` BIGINT NOT NULL,
    `amount` DECIMAL(10,2) NOT NULL,
    `date` DATE NOT NULL,
    `remark` VARCHAR(500),
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_date (`user_id`, `date`),
    INDEX idx_user_type (`user_id`, `type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 节假日表
CREATE TABLE IF NOT EXISTS `holiday` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `date` DATE NOT NULL UNIQUE,
    `name` VARCHAR(50) NOT NULL,
    `type` TINYINT DEFAULT 1 COMMENT '1:法定节假日 2:调休工作日',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 用户设置表
CREATE TABLE IF NOT EXISTS `user_setting` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL UNIQUE,
    `color_threshold1` DECIMAL(10,2) DEFAULT 100.00 COMMENT '颜色阈值1',
    `color_threshold2` DECIMAL(10,2) DEFAULT 300.00 COMMENT '颜色阈值2',
    `color_threshold3` DECIMAL(10,2) DEFAULT 500.00 COMMENT '颜色阈值3',
    `color1` VARCHAR(20) DEFAULT '#e8f5e9' COMMENT '颜色1',
    `color2` VARCHAR(20) DEFAULT '#c8e6c9' COMMENT '颜色2',
    `color3` VARCHAR(20) DEFAULT '#81c784' COMMENT '颜色3',
    `color4` VARCHAR(20) DEFAULT '#4caf50' COMMENT '颜色4',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入测试用户
INSERT INTO `user` (`username`, `password`, `nickname`) VALUES 
('demo', '123456', '演示用户');

-- 插入分类数据
INSERT INTO `category` (`name`, `type`, `icon`, `sort`) VALUES 
('餐饮', 2, 'restaurant', 1),
('交通', 2, 'car', 2),
('购物', 2, 'shopping', 3),
('娱乐', 2, 'game', 4),
('医疗', 2, 'medicine', 5),
('教育', 2, 'book', 6),
('居住', 2, 'home', 7),
('通讯', 2, 'phone', 8),
('其他支出', 2, 'more', 9),
('工资', 1, 'money', 1),
('奖金', 1, 'gift', 2),
('投资', 1, 'trending-up', 3),
('兼职', 1, 'user', 4),
('其他收入', 1, 'plus', 5);

-- 插入2024年节假日数据
INSERT INTO `holiday` (`date`, `name`, `type`) VALUES 
('2024-01-01', '元旦', 1),
('2024-02-10', '春节', 1),
('2024-02-11', '春节', 1),
('2024-02-12', '春节', 1),
('2024-02-13', '春节', 1),
('2024-02-14', '春节', 1),
('2024-02-15', '春节', 1),
('2024-02-16', '春节', 1),
('2024-02-17', '春节', 1),
('2024-02-04', '春节调休', 2),
('2024-02-18', '春节调休', 2),
('2024-04-04', '清明节', 1),
('2024-04-05', '清明节', 1),
('2024-04-06', '清明节', 1),
('2024-04-07', '清明节调休', 2),
('2024-05-01', '劳动节', 1),
('2024-05-02', '劳动节', 1),
('2024-05-03', '劳动节', 1),
('2024-05-04', '劳动节', 1),
('2024-05-05', '劳动节', 1),
('2024-04-28', '劳动节调休', 2),
('2024-05-11', '劳动节调休', 2),
('2024-06-10', '端午节', 1),
('2024-09-15', '中秋节', 1),
('2024-09-16', '中秋节', 1),
('2024-09-17', '中秋节', 1),
('2024-09-14', '中秋节调休', 2),
('2024-10-01', '国庆节', 1),
('2024-10-02', '国庆节', 1),
('2024-10-03', '国庆节', 1),
('2024-10-04', '国庆节', 1),
('2024-10-05', '国庆节', 1),
('2024-10-06', '国庆节', 1),
('2024-10-07', '国庆节', 1),
('2024-09-29', '国庆节调休', 2),
('2024-10-12', '国庆节调休', 2);

-- 插入2025年节假日数据
INSERT INTO `holiday` (`date`, `name`, `type`) VALUES 
('2025-01-01', '元旦', 1),
('2025-01-28', '春节', 1),
('2025-01-29', '春节', 1),
('2025-01-30', '春节', 1),
('2025-01-31', '春节', 1),
('2025-02-01', '春节', 1),
('2025-02-02', '春节', 1),
('2025-02-03', '春节', 1),
('2025-02-04', '春节', 1),
('2025-01-26', '春节调休', 2),
('2025-02-08', '春节调休', 2),
('2025-04-04', '清明节', 1),
('2025-04-05', '清明节', 1),
('2025-04-06', '清明节', 1),
('2025-05-01', '劳动节', 1),
('2025-05-02', '劳动节', 1),
('2025-05-03', '劳动节', 1),
('2025-05-04', '劳动节', 1),
('2025-05-05', '劳动节', 1),
('2025-04-27', '劳动节调休', 2),
('2025-05-10', '劳动节调休', 2),
('2025-05-31', '端午节', 1),
('2025-06-01', '端午节', 1),
('2025-06-02', '端午节', 1),
('2025-10-01', '国庆节', 1),
('2025-10-02', '国庆节', 1),
('2025-10-03', '国庆节', 1),
('2025-10-04', '国庆节', 1),
('2025-10-05', '国庆节', 1),
('2025-10-06', '国庆节', 1),
('2025-10-07', '国庆节', 1),
('2025-09-28', '国庆节调休', 2),
('2025-10-11', '国庆节调休', 2);

-- 插入用户默认设置
INSERT INTO `user_setting` (`user_id`) VALUES (1);

-- 插入测试收支记录（最近3个月数据）
INSERT INTO `record` (`user_id`, `type`, `category_id`, `amount`, `date`, `remark`) VALUES 
(1, 2, 1, 35.50, DATE_SUB(CURDATE(), INTERVAL 90 DAY), '早餐+午餐'),
(1, 2, 2, 12.00, DATE_SUB(CURDATE(), INTERVAL 90 DAY), '地铁'),
(1, 2, 1, 28.00, DATE_SUB(CURDATE(), INTERVAL 89 DAY), '午餐'),
(1, 2, 3, 199.00, DATE_SUB(CURDATE(), INTERVAL 89 DAY), '买衣服'),
(1, 2, 1, 45.00, DATE_SUB(CURDATE(), INTERVAL 88 DAY), '三餐'),
(1, 2, 7, 2500.00, DATE_SUB(CURDATE(), INTERVAL 87 DAY), '房租'),
(1, 1, 10, 15000.00, DATE_SUB(CURDATE(), INTERVAL 85 DAY), '1月工资'),
(1, 2, 1, 32.00, DATE_SUB(CURDATE(), INTERVAL 85 DAY), '午餐+晚餐'),
(1, 2, 4, 88.00, DATE_SUB(CURDATE(), INTERVAL 84 DAY), '看电影'),
(1, 2, 1, 55.00, DATE_SUB(CURDATE(), INTERVAL 83 DAY), '聚餐'),
(1, 2, 1, 28.00, DATE_SUB(CURDATE(), INTERVAL 82 DAY), '午餐'),
(1, 2, 2, 15.00, DATE_SUB(CURDATE(), INTERVAL 82 DAY), '打车'),
(1, 2, 1, 42.00, DATE_SUB(CURDATE(), INTERVAL 81 DAY), '三餐'),
(1, 2, 3, 356.00, DATE_SUB(CURDATE(), INTERVAL 80 DAY), '日用品'),
(1, 2, 1, 38.00, DATE_SUB(CURDATE(), INTERVAL 79 DAY), '午餐'),
(1, 2, 8, 129.00, DATE_SUB(CURDATE(), INTERVAL 78 DAY), '话费'),
(1, 2, 1, 45.00, DATE_SUB(CURDATE(), INTERVAL 77 DAY), '三餐'),
(1, 2, 5, 85.00, DATE_SUB(CURDATE(), INTERVAL 76 DAY), '买药'),
(1, 2, 1, 32.00, DATE_SUB(CURDATE(), INTERVAL 75 DAY), '午餐'),
(1, 2, 1, 58.00, DATE_SUB(CURDATE(), INTERVAL 74 DAY), '聚餐'),
(1, 2, 1, 28.00, DATE_SUB(CURDATE(), INTERVAL 73 DAY), '午餐'),
(1, 2, 3, 450.00, DATE_SUB(CURDATE(), INTERVAL 72 DAY), '购物'),
(1, 2, 1, 42.00, DATE_SUB(CURDATE(), INTERVAL 71 DAY), '三餐'),
(1, 1, 11, 2000.00, DATE_SUB(CURDATE(), INTERVAL 70 DAY), '年终奖'),
(1, 2, 1, 35.00, DATE_SUB(CURDATE(), INTERVAL 70 DAY), '午餐'),
(1, 2, 4, 156.00, DATE_SUB(CURDATE(), INTERVAL 69 DAY), 'KTV'),
(1, 2, 1, 28.00, DATE_SUB(CURDATE(), INTERVAL 68 DAY), '午餐'),
(1, 2, 2, 8.00, DATE_SUB(CURDATE(), INTERVAL 68 DAY), '地铁'),
(1, 2, 1, 65.00, DATE_SUB(CURDATE(), INTERVAL 67 DAY), '聚餐'),
(1, 2, 1, 32.00, DATE_SUB(CURDATE(), INTERVAL 66 DAY), '午餐'),
(1, 2, 7, 200.00, DATE_SUB(CURDATE(), INTERVAL 65 DAY), '水电费'),
(1, 2, 1, 28.00, DATE_SUB(CURDATE(), INTERVAL 65 DAY), '午餐'),
(1, 2, 6, 399.00, DATE_SUB(CURDATE(), INTERVAL 64 DAY), '网课'),
(1, 2, 1, 45.00, DATE_SUB(CURDATE(), INTERVAL 63 DAY), '三餐'),
(1, 2, 1, 38.00, DATE_SUB(CURDATE(), INTERVAL 62 DAY), '午餐+晚餐'),
(1, 2, 1, 28.00, DATE_SUB(CURDATE(), INTERVAL 61 DAY), '午餐'),
(1, 2, 3, 268.00, DATE_SUB(CURDATE(), INTERVAL 60 DAY), '买鞋'),
(1, 1, 10, 15000.00, DATE_SUB(CURDATE(), INTERVAL 55 DAY), '2月工资'),
(1, 2, 1, 42.00, DATE_SUB(CURDATE(), INTERVAL 55 DAY), '三餐'),
(1, 2, 1, 35.00, DATE_SUB(CURDATE(), INTERVAL 54 DAY), '午餐'),
(1, 2, 4, 120.00, DATE_SUB(CURDATE(), INTERVAL 53 DAY), '游戏充值'),
(1, 2, 1, 58.00, DATE_SUB(CURDATE(), INTERVAL 52 DAY), '聚餐'),
(1, 2, 1, 28.00, DATE_SUB(CURDATE(), INTERVAL 51 DAY), '午餐'),
(1, 2, 2, 45.00, DATE_SUB(CURDATE(), INTERVAL 50 DAY), '打车'),
(1, 2, 1, 45.00, DATE_SUB(CURDATE(), INTERVAL 49 DAY), '三餐'),
(1, 2, 3, 188.00, DATE_SUB(CURDATE(), INTERVAL 48 DAY), '护肤品'),
(1, 2, 1, 32.00, DATE_SUB(CURDATE(), INTERVAL 47 DAY), '午餐'),
(1, 2, 8, 99.00, DATE_SUB(CURDATE(), INTERVAL 46 DAY), '宽带费'),
(1, 2, 1, 52.00, DATE_SUB(CURDATE(), INTERVAL 45 DAY), '三餐'),
(1, 2, 1, 38.00, DATE_SUB(CURDATE(), INTERVAL 44 DAY), '午餐+晚餐'),
(1, 2, 1, 28.00, DATE_SUB(CURDATE(), INTERVAL 43 DAY), '午餐'),
(1, 2, 5, 120.00, DATE_SUB(CURDATE(), INTERVAL 42 DAY), '体检'),
(1, 2, 1, 45.00, DATE_SUB(CURDATE(), INTERVAL 41 DAY), '三餐'),
(1, 2, 4, 200.00, DATE_SUB(CURDATE(), INTERVAL 40 DAY), '聚会'),
(1, 2, 1, 28.00, DATE_SUB(CURDATE(), INTERVAL 39 DAY), '午餐'),
(1, 2, 3, 520.00, DATE_SUB(CURDATE(), INTERVAL 38 DAY), '买衣服'),
(1, 2, 1, 35.00, DATE_SUB(CURDATE(), INTERVAL 37 DAY), '午餐'),
(1, 2, 1, 68.00, DATE_SUB(CURDATE(), INTERVAL 36 DAY), '聚餐'),
(1, 2, 1, 28.00, DATE_SUB(CURDATE(), INTERVAL 35 DAY), '午餐'),
(1, 2, 7, 2500.00, DATE_SUB(CURDATE(), INTERVAL 30 DAY), '房租'),
(1, 1, 10, 15000.00, DATE_SUB(CURDATE(), INTERVAL 25 DAY), '3月工资'),
(1, 2, 1, 42.00, DATE_SUB(CURDATE(), INTERVAL 25 DAY), '三餐'),
(1, 2, 1, 35.00, DATE_SUB(CURDATE(), INTERVAL 24 DAY), '午餐'),
(1, 2, 2, 15.00, DATE_SUB(CURDATE(), INTERVAL 24 DAY), '地铁'),
(1, 2, 1, 28.00, DATE_SUB(CURDATE(), INTERVAL 23 DAY), '午餐'),
(1, 2, 3, 156.00, DATE_SUB(CURDATE(), INTERVAL 22 DAY), '买书'),
(1, 2, 1, 55.00, DATE_SUB(CURDATE(), INTERVAL 21 DAY), '聚餐'),
(1, 2, 1, 32.00, DATE_SUB(CURDATE(), INTERVAL 20 DAY), '午餐'),
(1, 2, 4, 180.00, DATE_SUB(CURDATE(), INTERVAL 19 DAY), '电影'),
(1, 2, 1, 45.00, DATE_SUB(CURDATE(), INTERVAL 18 DAY), '三餐'),
(1, 2, 1, 28.00, DATE_SUB(CURDATE(), INTERVAL 17 DAY), '午餐'),
(1, 2, 6, 299.00, DATE_SUB(CURDATE(), INTERVAL 16 DAY), '课程'),
(1, 2, 1, 38.00, DATE_SUB(CURDATE(), INTERVAL 15 DAY), '午餐+晚餐'),
(1, 2, 1, 28.00, DATE_SUB(CURDATE(), INTERVAL 14 DAY), '午餐'),
(1, 2, 3, 420.00, DATE_SUB(CURDATE(), INTERVAL 13 DAY), '电子产品'),
(1, 2, 1, 52.00, DATE_SUB(CURDATE(), INTERVAL 12 DAY), '聚餐'),
(1, 2, 1, 35.00, DATE_SUB(CURDATE(), INTERVAL 11 DAY), '午餐'),
(1, 2, 2, 25.00, DATE_SUB(CURDATE(), INTERVAL 10 DAY), '打车'),
(1, 2, 1, 45.00, DATE_SUB(CURDATE(), INTERVAL 9 DAY), '三餐'),
(1, 2, 8, 58.00, DATE_SUB(CURDATE(), INTERVAL 8 DAY), '话费'),
(1, 2, 1, 28.00, DATE_SUB(CURDATE(), INTERVAL 7 DAY), '午餐'),
(1, 2, 1, 65.00, DATE_SUB(CURDATE(), INTERVAL 6 DAY), '聚餐'),
(1, 2, 1, 32.00, DATE_SUB(CURDATE(), INTERVAL 5 DAY), '午餐'),
(1, 2, 5, 75.00, DATE_SUB(CURDATE(), INTERVAL 4 DAY), '买药'),
(1, 2, 1, 48.00, DATE_SUB(CURDATE(), INTERVAL 3 DAY), '三餐'),
(1, 2, 3, 299.00, DATE_SUB(CURDATE(), INTERVAL 2 DAY), '购物'),
(1, 2, 1, 35.00, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '午餐'),
(1, 2, 1, 42.00, CURDATE(), '今天的餐费');
