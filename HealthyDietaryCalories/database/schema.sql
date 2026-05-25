-- 健康饮食热量记录系统 - SQLite 数据库脚本
-- 创建日期: 2026-05-24

-- 用户表（简化为单用户模式，可扩展）
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 食物库表
CREATE TABLE IF NOT EXISTS foods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT DEFAULT '其他',
    calories REAL NOT NULL DEFAULT 0,       -- 每100克/每份热量(kcal)
    protein REAL NOT NULL DEFAULT 0,        -- 蛋白质(g)
    carbs REAL NOT NULL DEFAULT 0,          -- 碳水化合物(g)
    fat REAL NOT NULL DEFAULT 0,            -- 脂肪(g)
    fiber REAL NOT NULL DEFAULT 0,          -- 膳食纤维(g)
    serving_size REAL NOT NULL DEFAULT 100, -- 份量单位(g/ml)
    serving_unit TEXT DEFAULT '克',         -- 单位(克/毫升/个)
    is_custom INTEGER DEFAULT 0,            -- 是否自定义食物 0否1是
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 餐记录表
CREATE TABLE IF NOT EXISTS meals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER DEFAULT 1,
    meal_type TEXT NOT NULL,                -- 早餐/午餐/晚餐/加餐
    meal_date DATE NOT NULL,                -- 日期
    total_calories REAL DEFAULT 0,          -- 总热量
    total_protein REAL DEFAULT 0,           -- 总蛋白质
    total_carbs REAL DEFAULT 0,             -- 总碳水
    total_fat REAL DEFAULT 0,               -- 总脂肪
    notes TEXT,                             -- 备注
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 餐内食物项表
CREATE TABLE IF NOT EXISTS meal_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meal_id INTEGER NOT NULL,
    food_id INTEGER NOT NULL,
    quantity REAL NOT NULL DEFAULT 100,     -- 实际食用量
    calories REAL NOT NULL DEFAULT 0,       -- 实际热量
    protein REAL DEFAULT 0,
    carbs REAL DEFAULT 0,
    fat REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES foods(id)
);

-- 每日目标表
CREATE TABLE IF NOT EXISTS daily_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER DEFAULT 1,
    target_date DATE NOT NULL,
    target_calories REAL NOT NULL DEFAULT 2000,
    target_protein REAL DEFAULT 60,
    target_carbs REAL DEFAULT 250,
    target_fat REAL DEFAULT 65,
    is_achieved INTEGER DEFAULT 0,          -- 是否达成目标
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, target_date)
);

-- 体重记录表
CREATE TABLE IF NOT EXISTS weight_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER DEFAULT 1,
    record_date DATE NOT NULL,
    weight REAL NOT NULL,                   -- 体重(kg)
    note TEXT,                              -- 备注
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, record_date)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_meals_date ON meals(meal_date);
CREATE INDEX IF NOT EXISTS idx_meals_user_date ON meals(user_id, meal_date);
CREATE INDEX IF NOT EXISTS idx_meal_items_meal ON meal_items(meal_id);
CREATE INDEX IF NOT EXISTS idx_foods_name ON foods(name);
CREATE INDEX IF NOT EXISTS idx_foods_category ON foods(category);
CREATE INDEX IF NOT EXISTS idx_weight_date ON weight_records(record_date);
CREATE INDEX IF NOT EXISTS idx_daily_goals_date ON daily_goals(target_date);

-- 插入默认用户
INSERT OR IGNORE INTO users (id, username, email) VALUES (1, 'default', 'default@example.com');

-- 插入常用食物数据
INSERT OR IGNORE INTO foods (name, category, calories, protein, carbs, fat, fiber, serving_size, serving_unit) VALUES
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

-- 插入默认每日目标（今天）
INSERT OR IGNORE INTO daily_goals (user_id, target_date, target_calories, target_protein, target_carbs, target_fat)
VALUES (1, DATE('now'), 2000, 75, 250, 65);
