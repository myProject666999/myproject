-- =============================================
-- 健康饮食与卡路里追踪系统 数据库脚本
-- Database: healthy_eating_db
-- =============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS healthy_eating_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE healthy_eating_db;

-- =============================================
-- 1. 用户表
-- =============================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `email` VARCHAR(100),
    `gender` ENUM('male', 'female') DEFAULT 'male',
    `age` INT DEFAULT 25,
    `height` DECIMAL(5,1) DEFAULT 170.0 COMMENT '身高(cm)',
    `weight` DECIMAL(5,1) DEFAULT 65.0 COMMENT '体重(kg)',
    `activity_level` ENUM('sedentary', 'light', 'moderate', 'active', 'very_active') DEFAULT 'light',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- =============================================
-- 2. 食物库表
-- =============================================
DROP TABLE IF EXISTS `foods`;
CREATE TABLE `foods` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL COMMENT '食物名称',
    `category` VARCHAR(50) NOT NULL COMMENT '分类: 主食/肉类/蔬菜/水果/乳制品/零食/饮料',
    `calories_per_100g` DECIMAL(8,2) NOT NULL DEFAULT 0 COMMENT '每100克热量(kcal)',
    `protein` DECIMAL(8,2) DEFAULT 0 COMMENT '蛋白质(g)',
    `fat` DECIMAL(8,2) DEFAULT 0 COMMENT '脂肪(g)',
    `carbs` DECIMAL(8,2) DEFAULT 0 COMMENT '碳水化合物(g)',
    `fiber` DECIMAL(8,2) DEFAULT 0 COMMENT '膳食纤维(g)',
    `unit` VARCHAR(20) DEFAULT '100g' COMMENT '计量单位',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_name` (`name`),
    INDEX `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='食物营养库';

-- =============================================
-- 3. 饮食记录表
-- =============================================
DROP TABLE IF EXISTS `meal_records`;
CREATE TABLE `meal_records` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `food_id` INT NOT NULL,
    `meal_type` ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL COMMENT '早/午/晚/加餐',
    `quantity` DECIMAL(8,2) NOT NULL DEFAULT 100 COMMENT '摄入量(g)',
    `calories` DECIMAL(8,2) NOT NULL DEFAULT 0 COMMENT '实际摄入热量',
    `protein` DECIMAL(8,2) DEFAULT 0,
    `fat` DECIMAL(8,2) DEFAULT 0,
    `carbs` DECIMAL(8,2) DEFAULT 0,
    `record_date` DATE NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_user_date` (`user_id`, `record_date`),
    INDEX `idx_user_meal` (`user_id`, `meal_type`, `record_date`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`food_id`) REFERENCES `foods`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='饮食打卡记录';

-- =============================================
-- 4. 运动记录表
-- =============================================
DROP TABLE IF EXISTS `exercise_records`;
CREATE TABLE `exercise_records` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `exercise_type` VARCHAR(50) NOT NULL COMMENT '运动类型',
    `duration_minutes` INT NOT NULL DEFAULT 0 COMMENT '时长(分钟)',
    `calories_burned` DECIMAL(8,2) NOT NULL DEFAULT 0 COMMENT '消耗热量(kcal)',
    `record_date` DATE NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_user_date` (`user_id`, `record_date`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='运动消耗记录';

-- =============================================
-- 5. 体重记录表
-- =============================================
DROP TABLE IF EXISTS `weight_records`;
CREATE TABLE `weight_records` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `weight` DECIMAL(5,1) NOT NULL COMMENT '体重(kg)',
    `record_date` DATE NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_user_date` (`user_id`, `record_date`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='体重变化记录';

-- =============================================
-- 6. 用户目标设置表
-- =============================================
DROP TABLE IF EXISTS `user_goals`;
CREATE TABLE `user_goals` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `daily_calorie_goal` INT DEFAULT 2000 COMMENT '每日热量目标(kcal)',
    `target_weight` DECIMAL(5,1) COMMENT '目标体重(kg)',
    `bmr_formula` ENUM('mifflin_st_jeor', 'harris_benedict') DEFAULT 'mifflin_st_jeor' COMMENT 'BMR计算公式',
    `activity_multiplier` DECIMAL(4,2) DEFAULT 1.375 COMMENT '活动系数',
    `goal_type` ENUM('lose_weight', 'maintain', 'gain_weight') DEFAULT 'maintain' COMMENT '目标类型',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户健康目标';

-- =============================================
-- 7. 每日统计缓存表
-- =============================================
DROP TABLE IF EXISTS `daily_stats`;
CREATE TABLE `daily_stats` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `stat_date` DATE NOT NULL,
    `total_calories_intake` DECIMAL(10,2) DEFAULT 0 COMMENT '总摄入热量',
    `total_calories_burned` DECIMAL(10,2) DEFAULT 0 COMMENT '总消耗热量',
    `calorie_goal` INT DEFAULT 2000 COMMENT '当日热量目标',
    `net_calories` DECIMAL(10,2) DEFAULT 0 COMMENT '净热量=摄入-消耗',
    `protein` DECIMAL(8,2) DEFAULT 0,
    `fat` DECIMAL(8,2) DEFAULT 0,
    `carbs` DECIMAL(8,2) DEFAULT 0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_user_date` (`user_id`, `stat_date`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='每日统计缓存';

-- =============================================
-- 8. 运动类型基础数据表
-- =============================================
DROP TABLE IF EXISTS `exercise_types`;
CREATE TABLE `exercise_types` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL COMMENT '运动名称',
    `calories_per_minute` DECIMAL(6,2) NOT NULL COMMENT '每分钟消耗热量(参考)',
    `category` VARCHAR(30) COMMENT '分类: 有氧/力量/柔韧',
    `description` VARCHAR(255) COMMENT '描述'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='运动类型基础数据';

-- =============================================
-- 初始数据：食物库（常见食物营养数据，每100克）
-- =============================================
INSERT INTO `foods` (`name`, `category`, `calories_per_100g`, `protein`, `fat`, `carbs`, `fiber`) VALUES
-- 主食类
('白米饭', '主食', 116, 2.6, 0.3, 25.9, 0.3),
('糙米饭', '主食', 123, 2.6, 0.9, 25.6, 1.8),
('面条(煮)', '主食', 109, 3.6, 0.6, 22.0, 1.2),
('馒头', '主食', 223, 7.0, 1.1, 47.0, 1.3),
('全麦面包', '主食', 246, 13.0, 3.5, 41.0, 7.0),
('燕麦片', '主食', 389, 16.9, 6.9, 66.3, 10.6),
('红薯', '主食', 99, 1.1, 0.2, 24.7, 2.2),
('玉米', '主食', 112, 4.0, 1.2, 22.8, 2.9),
('土豆', '主食', 77, 2.0, 0.1, 17.0, 0.6),
('饺子(猪肉)', '主食', 253, 10.5, 15.0, 19.0, 1.0),

-- 肉类/蛋白质
('鸡胸肉', '肉类', 133, 19.4, 5.0, 2.5, 0),
('鸡腿(去皮)', '肉类', 167, 20.2, 7.0, 0, 0),
('牛肉(瘦)', '肉类', 125, 20.2, 3.2, 0, 0),
('猪里脊', '肉类', 155, 20.2, 7.9, 0, 0),
('三文鱼', '肉类', 208, 17.2, 13.0, 0, 0),
('虾', '肉类', 93, 18.6, 0.8, 2.6, 0),
('鸡蛋', '肉类', 144, 13.3, 8.8, 2.8, 0),
('鸭蛋', '肉类', 180, 12.6, 13.0, 3.1, 0),
(' tofu(豆腐)', '肉类', 81, 8.1, 4.8, 1.9, 0.4),
('牛奶', '乳制品', 54, 3.0, 3.2, 3.4, 0),
('酸奶', '乳制品', 72, 2.5, 2.7, 9.3, 0),
('豆浆', '乳制品', 54, 3.0, 1.8, 5.0, 0),

-- 蔬菜类
('西兰花', '蔬菜', 33, 4.1, 0.6, 4.3, 1.6),
('菠菜', '蔬菜', 24, 2.6, 0.3, 4.5, 2.4),
('生菜', '蔬菜', 13, 1.3, 0.3, 2.0, 0.7),
('西红柿', '蔬菜', 19, 0.9, 0.2, 4.0, 0.5),
('黄瓜', '蔬菜', 15, 0.8, 0.2, 2.9, 0.5),
('胡萝卜', '蔬菜', 37, 1.0, 0.2, 8.8, 2.7),
('白菜', '蔬菜', 17, 1.5, 0.1, 3.2, 0.8),
('青椒', '蔬菜', 22, 1.0, 0.3, 5.4, 1.4),
('茄子', '蔬菜', 23, 1.1, 0.2, 4.9, 1.3),
('土豆丝', '蔬菜', 77, 2.0, 0.1, 17.0, 0.6),

-- 水果类
('苹果', '水果', 52, 0.2, 0.2, 13.5, 1.2),
('香蕉', '水果', 89, 1.4, 0.2, 22.0, 2.6),
('橙子', '水果', 47, 0.8, 0.2, 11.1, 2.0),
('葡萄', '水果', 43, 0.5, 0.2, 10.3, 0.4),
('西瓜', '水果', 25, 0.6, 0.1, 5.8, 0.3),
('草莓', '水果', 32, 1.0, 0.2, 7.1, 1.1),
('蓝莓', '水果', 57, 0.7, 0.3, 14.5, 2.4),
('火龙果', '水果', 55, 1.1, 0.2, 13.3, 2.0),
('猕猴桃', '水果', 56, 0.8, 0.6, 11.9, 2.6),
('梨', '水果', 50, 0.4, 0.2, 12.0, 2.6),

-- 零食/其他
('花生', '零食', 574, 24.8, 44.3, 16.2, 5.5),
('杏仁', '零食', 578, 22.5, 50.6, 19.9, 8.0),
('核桃', '零食', 646, 14.9, 58.8, 19.1, 9.5),
('巧克力', '零食', 586, 4.9, 40.2, 53.4, 0),
('薯片', '零食', 547, 6.6, 34.6, 52.9, 4.7),
('饼干', '零食', 480, 7.5, 21.0, 65.0, 2.0),
('冰淇淋', '零食', 207, 3.5, 8.6, 17.3, 0.7),
('蛋糕', '零食', 347, 7.2, 5.1, 67.8, 0.6),
('蜂蜜', '零食', 321, 0.4, 0, 80.3, 0),
('红糖', '零食', 389, 0, 0, 96.6, 0),

-- 饮料类
('可乐', '饮料', 43, 0, 0, 10.6, 0),
('绿茶(无糖)', '饮料', 1, 0.2, 0, 0, 0),
('咖啡(黑)', '饮料', 2, 0.3, 0, 0, 0),
('咖啡(拿铁)', '饮料', 50, 2.5, 2.5, 5.0, 0),
('奶茶', '饮料', 200, 2.0, 8.0, 28.0, 0),
('橙汁', '饮料', 45, 0.7, 0.2, 10.4, 0.2),
('啤酒', '饮料', 43, 0.4, 0, 3.6, 0),
('红酒', '饮料', 85, 0.1, 0, 2.6, 0);

-- =============================================
-- 初始数据：运动类型基础数据
-- =============================================
INSERT INTO `exercise_types` (`name`, `calories_per_minute`, `category`, `description`) VALUES
('散步', 3.5, '有氧', '慢速散步，心率较低'),
('快走', 6.0, '有氧', '快步走，微微出汗'),
('跑步', 10.0, '有氧', '中等强度跑步'),
('慢跑', 8.0, '有氧', '轻松慢跑'),
('骑自行车', 7.0, '有氧', '中等速度骑行'),
('游泳', 10.0, '有氧', '自由泳中等强度'),
('跳绳', 12.0, '有氧', '中等速度跳绳'),
('瑜伽', 3.0, '柔韧', '普通瑜伽练习'),
('力量训练', 6.0, '力量', '健身房器械训练'),
('俯卧撑', 7.0, '力量', '俯卧撑训练'),
('深蹲', 8.0, '力量', '深蹲练习'),
('平板支撑', 4.0, '力量', '核心训练'),
('篮球', 8.0, '有氧', '休闲篮球'),
('羽毛球', 6.0, '有氧', '休闲羽毛球'),
('乒乓球', 5.0, '有氧', '休闲乒乓球'),
('足球', 9.0, '有氧', '休闲足球'),
('爬楼梯', 9.0, '有氧', '爬楼梯训练'),
('椭圆机', 8.0, '有氧', '椭圆机中等强度'),
('划船机', 7.0, '有氧', '划船机中等强度'),
('动感单车', 8.0, '有氧', '动感单车训练');

-- =============================================
-- 示例用户数据
-- =============================================
INSERT INTO `users` (`username`, `password`, `email`, `gender`, `age`, `height`, `weight`, `activity_level`) VALUES
('demo', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'demo@example.com', 'male', 28, 175.0, 70.0, 'moderate');

-- 为示例用户创建目标设置
INSERT INTO `user_goals` (`user_id`, `daily_calorie_goal`, `target_weight`, `bmr_formula`, `activity_multiplier`, `goal_type`) VALUES
(1, 2000, 68.0, 'mifflin_st_jeor', 1.55, 'lose_weight');

-- 示例体重记录
INSERT INTO `weight_records` (`user_id`, `weight`, `record_date`) VALUES
(1, 72.0, DATE_SUB(CURDATE(), INTERVAL 30 DAY)),
(1, 71.5, DATE_SUB(CURDATE(), INTERVAL 23 DAY)),
(1, 71.0, DATE_SUB(CURDATE(), INTERVAL 16 DAY)),
(1, 70.5, DATE_SUB(CURDATE(), INTERVAL 9 DAY)),
(1, 70.0, CURDATE());

-- 示例饮食记录
INSERT INTO `meal_records` (`user_id`, `food_id`, `meal_type`, `quantity`, `calories`, `protein`, `fat`, `carbs`, `record_date`) VALUES
(1, 1, 'breakfast', 150, 174.00, 3.90, 0.45, 38.85, CURDATE()),
(1, 15, 'breakfast', 50, 72.00, 6.65, 4.40, 1.40, CURDATE()),
(1, 17, 'breakfast', 60, 86.40, 7.98, 5.28, 1.68, CURDATE()),
(1, 7, 'lunch', 200, 198.00, 2.20, 0.40, 49.40, CURDATE()),
(1, 9, 'lunch', 150, 199.50, 30.00, 7.50, 0, CURDATE()),
(1, 23, 'lunch', 100, 33.00, 4.10, 0.60, 4.30, CURDATE()),
(1, 5, 'dinner', 100, 246.00, 13.00, 3.50, 41.00, CURDATE()),
(1, 10, 'dinner', 100, 93.00, 12.60, 2.40, 0.90, CURDATE()),
(1, 24, 'dinner', 150, 36.00, 3.90, 0.45, 6.75, CURDATE()),
(1, 32, 'snack', 100, 52.00, 0.20, 0.20, 13.50, CURDATE());

-- 示例运动记录
INSERT INTO `exercise_records` (`user_id`, `exercise_type`, `duration_minutes`, `calories_burned`, `record_date`) VALUES
(1, '跑步', 30, 300.00, CURDATE()),
(1, '力量训练', 45, 270.00, CURDATE());

-- 示例每日统计
INSERT INTO `daily_stats` (`user_id`, `stat_date`, `total_calories_intake`, `total_calories_burned`, `calorie_goal`, `net_calories`, `protein`, `fat`, `carbs`) VALUES
(1, CURDATE(), 1190.90, 570.00, 2000, 620.90, 67.23, 20.38, 151.38);

-- 生成过去7天的示例数据
INSERT INTO `meal_records` (`user_id`, `food_id`, `meal_type`, `quantity`, `calories`, `protein`, `fat`, `carbs`, `record_date`) VALUES
(1, 1, 'breakfast', 150, 174.00, 3.90, 0.45, 38.85, DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
(1, 15, 'breakfast', 50, 72.00, 6.65, 4.40, 1.40, DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
(1, 7, 'lunch', 200, 198.00, 2.20, 0.40, 49.40, DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
(1, 9, 'lunch', 150, 199.50, 30.00, 7.50, 0, DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
(1, 5, 'dinner', 100, 246.00, 13.00, 3.50, 41.00, DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
(1, 10, 'dinner', 100, 93.00, 12.60, 2.40, 0.90, DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
(1, 1, 'breakfast', 150, 174.00, 3.90, 0.45, 38.85, DATE_SUB(CURDATE(), INTERVAL 2 DAY)),
(1, 17, 'breakfast', 60, 86.40, 7.98, 5.28, 1.68, DATE_SUB(CURDATE(), INTERVAL 2 DAY)),
(1, 7, 'lunch', 200, 198.00, 2.20, 0.40, 49.40, DATE_SUB(CURDATE(), INTERVAL 2 DAY)),
(1, 9, 'lunch', 150, 199.50, 30.00, 7.50, 0, DATE_SUB(CURDATE(), INTERVAL 2 DAY)),
(1, 1, 'breakfast', 150, 174.00, 3.90, 0.45, 38.85, DATE_SUB(CURDATE(), INTERVAL 3 DAY)),
(1, 15, 'breakfast', 50, 72.00, 6.65, 4.40, 1.40, DATE_SUB(CURDATE(), INTERVAL 3 DAY)),
(1, 7, 'lunch', 200, 198.00, 2.20, 0.40, 49.40, DATE_SUB(CURDATE(), INTERVAL 3 DAY)),
(1, 9, 'lunch', 150, 199.50, 30.00, 7.50, 0, DATE_SUB(CURDATE(), INTERVAL 3 DAY)),
(1, 5, 'dinner', 100, 246.00, 13.00, 3.50, 41.00, DATE_SUB(CURDATE(), INTERVAL 3 DAY)),
(1, 1, 'breakfast', 150, 174.00, 3.90, 0.45, 38.85, DATE_SUB(CURDATE(), INTERVAL 4 DAY)),
(1, 17, 'breakfast', 60, 86.40, 7.98, 5.28, 1.68, DATE_SUB(CURDATE(), INTERVAL 4 DAY)),
(1, 7, 'lunch', 200, 198.00, 2.20, 0.40, 49.40, DATE_SUB(CURDATE(), INTERVAL 4 DAY)),
(1, 9, 'lunch', 150, 199.50, 30.00, 7.50, 0, DATE_SUB(CURDATE(), INTERVAL 4 DAY)),
(1, 5, 'dinner', 100, 246.00, 13.00, 3.50, 41.00, DATE_SUB(CURDATE(), INTERVAL 4 DAY)),
(1, 10, 'dinner', 100, 93.00, 12.60, 2.40, 0.90, DATE_SUB(CURDATE(), INTERVAL 4 DAY)),
(1, 1, 'breakfast', 150, 174.00, 3.90, 0.45, 38.85, DATE_SUB(CURDATE(), INTERVAL 5 DAY)),
(1, 15, 'breakfast', 50, 72.00, 6.65, 4.40, 1.40, DATE_SUB(CURDATE(), INTERVAL 5 DAY)),
(1, 7, 'lunch', 200, 198.00, 2.20, 0.40, 49.40, DATE_SUB(CURDATE(), INTERVAL 5 DAY)),
(1, 9, 'lunch', 150, 199.50, 30.00, 7.50, 0, DATE_SUB(CURDATE(), INTERVAL 5 DAY)),
(1, 1, 'breakfast', 150, 174.00, 3.90, 0.45, 38.85, DATE_SUB(CURDATE(), INTERVAL 6 DAY)),
(1, 17, 'breakfast', 60, 86.40, 7.98, 5.28, 1.68, DATE_SUB(CURDATE(), INTERVAL 6 DAY)),
(1, 7, 'lunch', 200, 198.00, 2.20, 0.40, 49.40, DATE_SUB(CURDATE(), INTERVAL 6 DAY)),
(1, 9, 'lunch', 150, 199.50, 30.00, 7.50, 0, DATE_SUB(CURDATE(), INTERVAL 6 DAY)),
(1, 5, 'dinner', 100, 246.00, 13.00, 3.50, 41.00, DATE_SUB(CURDATE(), INTERVAL 6 DAY));

-- 过去7天的运动记录
INSERT INTO `exercise_records` (`user_id`, `exercise_type`, `duration_minutes`, `calories_burned`, `record_date`) VALUES
(1, '快走', 30, 180.00, DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
(1, '跑步', 30, 300.00, DATE_SUB(CURDATE(), INTERVAL 2 DAY)),
(1, '力量训练', 45, 270.00, DATE_SUB(CURDATE(), INTERVAL 2 DAY)),
(1, '骑自行车', 40, 280.00, DATE_SUB(CURDATE(), INTERVAL 3 DAY)),
(1, '游泳', 30, 300.00, DATE_SUB(CURDATE(), INTERVAL 4 DAY)),
(1, '快走', 30, 180.00, DATE_SUB(CURDATE(), INTERVAL 5 DAY)),
(1, '跑步', 30, 300.00, DATE_SUB(CURDATE(), INTERVAL 5 DAY)),
(1, '力量训练', 45, 270.00, DATE_SUB(CURDATE(), INTERVAL 6 DAY));

-- 过去7天的每日统计
INSERT INTO `daily_stats` (`user_id`, `stat_date`, `total_calories_intake`, `total_calories_burned`, `calorie_goal`, `net_calories`, `protein`, `fat`, `carbs`) VALUES
(1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 1028.50, 180.00, 2000, 848.50, 68.35, 18.65, 136.95),
(1, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 833.90, 570.00, 2000, 263.90, 74.08, 13.63, 136.33),
(1, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 982.50, 280.00, 2000, 702.50, 64.70, 16.25, 129.65),
(1, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 1091.90, 300.00, 2000, 791.90, 71.28, 21.13, 142.43),
(1, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 833.90, 480.00, 2000, 353.90, 68.35, 18.65, 136.95),
(1, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 905.90, 270.00, 2000, 635.90, 68.35, 18.65, 136.95);
