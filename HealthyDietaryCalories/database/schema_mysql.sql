-- 健康饮食热量记录系统 - MySQL 数据库脚本
-- 创建日期: 2026-05-24

CREATE DATABASE IF NOT EXISTS healthy_diet DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE healthy_diet;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 食物库表
CREATE TABLE IF NOT EXISTS foods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) DEFAULT '其他',
    calories DECIMAL(10,2) NOT NULL DEFAULT 0,
    protein DECIMAL(10,2) NOT NULL DEFAULT 0,
    carbs DECIMAL(10,2) NOT NULL DEFAULT 0,
    fat DECIMAL(10,2) NOT NULL DEFAULT 0,
    fiber DECIMAL(10,2) NOT NULL DEFAULT 0,
    serving_size DECIMAL(10,2) NOT NULL DEFAULT 100,
    serving_unit VARCHAR(20) DEFAULT '克',
    is_custom TINYINT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 餐记录表
CREATE TABLE IF NOT EXISTS meals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT 1,
    meal_type VARCHAR(20) NOT NULL,
    meal_date DATE NOT NULL,
    total_calories DECIMAL(10,2) DEFAULT 0,
    total_protein DECIMAL(10,2) DEFAULT 0,
    total_carbs DECIMAL(10,2) DEFAULT 0,
    total_fat DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 餐内食物项表
CREATE TABLE IF NOT EXISTS meal_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meal_id INT NOT NULL,
    food_id INT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 100,
    calories DECIMAL(10,2) NOT NULL DEFAULT 0,
    protein DECIMAL(10,2) DEFAULT 0,
    carbs DECIMAL(10,2) DEFAULT 0,
    fat DECIMAL(10,2) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES foods(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 每日目标表
CREATE TABLE IF NOT EXISTS daily_goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT 1,
    target_date DATE NOT NULL,
    target_calories DECIMAL(10,2) NOT NULL DEFAULT 2000,
    target_protein DECIMAL(10,2) DEFAULT 60,
    target_carbs DECIMAL(10,2) DEFAULT 250,
    target_fat DECIMAL(10,2) DEFAULT 65,
    is_achieved TINYINT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_date (user_id, target_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 体重记录表
CREATE TABLE IF NOT EXISTS weight_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT 1,
    record_date DATE NOT NULL,
    weight DECIMAL(10,2) NOT NULL,
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_date (user_id, record_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 索引
CREATE INDEX idx_meals_date ON meals(meal_date);
CREATE INDEX idx_meals_user_date ON meals(user_id, meal_date);
CREATE INDEX idx_meal_items_meal ON meal_items(meal_id);
CREATE INDEX idx_foods_name ON foods(name);
CREATE INDEX idx_foods_category ON foods(category);
CREATE INDEX idx_weight_date ON weight_records(record_date);
CREATE INDEX idx_daily_goals_date ON daily_goals(target_date);

-- 插入默认用户
INSERT IGNORE INTO users (id, username, email) VALUES (1, 'default', 'default@example.com');

-- 插入常用食物数据
INSERT IGNORE INTO foods (name, category, calories, protein, carbs, fat, fiber, serving_size, serving_unit) VALUES
('白米饭', '主食', 116, 2.6, 25.6, 0.3, 0.3, 100, '克'),
('馒头', '主食', 223, 7.0, 47.0, 1.1, 1.3, 100, '克'),
('面条', '主食', 109, 4.5, 22.0, 0.5, 0.6, 100, '克'),
('全麦面包', '主食', 246, 13.0, 41.0, 4.2, 7.0, 100, '克'),
('红薯', '主食', 99, 1.1, 24.7, 0.2, 2.7, 100, '克'),
('玉米', '主食', 112, 4.0, 22.8, 1.2, 2.9, 100, '克'),
('燕麦片', '主食', 377, 15.0, 66.9, 7.0, 10.6, 100, '克'),

('鸡胸肉', '肉类', 133, 19.4, 2.5, 5.0, 0, 100, '克'),
('牛肉', '肉类', 125, 19.9, 2.0, 4.2, 0, 100, '克'),
('猪肉', '肉类', 143, 20.3, 1.5, 6.2, 0, 100, '克'),
('鸡蛋', '肉类', 144, 13.3, 2.8, 8.8, 0, 50, '个'),
('三文鱼', '肉类', 139, 17.2, 0, 7.8, 0, 100, '克'),
('虾', '肉类', 87, 18.6, 2.6, 0.8, 0, 100, '克'),

('牛奶', '乳制品', 54, 3.0, 3.4, 3.2, 0, 250, '毫升'),
('酸奶', '乳制品', 72, 2.5, 9.3, 2.7, 0, 100, '克'),
('奶酪', '乳制品', 328, 25.7, 3.5, 23.5, 0, 30, '克'),

('苹果', '水果', 54, 0.2, 13.5, 0.2, 1.2, 150, '克'),
('香蕉', '水果', 93, 1.4, 22.0, 0.2, 1.2, 120, '克'),
('橙子', '水果', 48, 0.8, 11.1, 0.2, 0.6, 150, '克'),
('葡萄', '水果', 44, 0.5, 10.3, 0.2, 0.4, 100, '克'),
('西瓜', '水果', 25, 0.6, 5.8, 0.1, 0.3, 200, '克'),
('蓝莓', '水果', 57, 0.7, 14.5, 0.3, 2.4, 100, '克'),

('西兰花', '蔬菜', 34, 2.8, 6.6, 0.4, 1.6, 100, '克'),
('菠菜', '蔬菜', 24, 2.6, 4.5, 0.3, 1.7, 100, '克'),
('番茄', '蔬菜', 19, 0.9, 4.0, 0.2, 0.5, 100, '克'),
('黄瓜', '蔬菜', 16, 0.8, 2.9, 0.2, 0.5, 100, '克'),
('胡萝卜', '蔬菜', 37, 1.0, 8.8, 0.2, 1.1, 100, '克'),
('白菜', '蔬菜', 17, 1.5, 3.2, 0.1, 0.8, 100, '克'),

('豆腐', '豆类', 81, 8.1, 1.9, 4.8, 0.4, 100, '克'),
('豆浆', '豆类', 31, 1.8, 1.1, 1.6, 0.6, 250, '毫升'),

('花生', '坚果', 574, 24.8, 16.1, 44.3, 5.5, 30, '克'),
('核桃', '坚果', 646, 14.9, 9.6, 58.8, 9.5, 20, '克'),
('杏仁', '坚果', 578, 22.5, 23.0, 50.6, 8.0, 20, '克'),

('橄榄油', '油脂', 899, 0, 0, 99.9, 0, 10, '毫升'),
('花生油', '油脂', 899, 0, 0, 99.9, 0, 10, '毫升'),
('黄油', '油脂', 888, 1.4, 1.4, 98.0, 0, 10, '克');

-- 插入默认每日目标
INSERT IGNORE INTO daily_goals (user_id, target_date, target_calories, target_protein, target_carbs, target_fat)
VALUES (1, CURDATE(), 2000, 75, 250, 65);
