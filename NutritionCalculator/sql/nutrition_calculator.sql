-- 创建数据库
CREATE DATABASE IF NOT EXISTS nutrition_calculator CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE nutrition_calculator;

-- 食物表
DROP TABLE IF EXISTS food;
CREATE TABLE food (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    name VARCHAR(100) NOT NULL COMMENT '食物名称',
    category VARCHAR(50) NOT NULL COMMENT '食物分类',
    calories INT NOT NULL DEFAULT 0 COMMENT '每100克热量(kcal)',
    protein INT NOT NULL DEFAULT 0 COMMENT '每100克蛋白质(g)',
    fat INT NOT NULL DEFAULT 0 COMMENT '每100克脂肪(g)',
    carbs INT NOT NULL DEFAULT 0 COMMENT '每100克碳水化合物(g)',
    unit_gram INT NOT NULL DEFAULT 100 COMMENT '计量单位(g)',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_name(name),
    INDEX idx_category(category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='食物库表';

-- 餐次记录表
DROP TABLE IF EXISTS meal_record;
CREATE TABLE meal_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    meal_date DATE NOT NULL COMMENT '用餐日期',
    meal_type VARCHAR(20) NOT NULL COMMENT '餐次类型：breakfast早餐, lunch午餐, dinner晚餐, snack加餐',
    food_id BIGINT NOT NULL COMMENT '食物ID',
    amount INT NOT NULL DEFAULT 0 COMMENT '食用份量(g)',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_meal_date(meal_date),
    INDEX idx_meal_type(meal_type),
    INDEX idx_food_id(food_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='餐次记录表';

-- 营养目标表
DROP TABLE IF EXISTS nutrition_goal;
CREATE TABLE nutrition_goal (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    target_calories INT NOT NULL DEFAULT 2000 COMMENT '每日目标热量(kcal)',
    target_protein INT NOT NULL DEFAULT 60 COMMENT '每日目标蛋白质(g)',
    target_fat INT NOT NULL DEFAULT 60 COMMENT '每日目标脂肪(g)',
    target_carbs INT NOT NULL DEFAULT 250 COMMENT '每日目标碳水化合物(g)',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='营养目标表';

-- 插入默认营养目标
INSERT INTO nutrition_goal (target_calories, target_protein, target_fat, target_carbs)
VALUES (2000, 60, 60, 250);

-- 插入食物库数据（常见食物营养数据，每100克可食部）
INSERT INTO food (name, category, calories, protein, fat, carbs, unit_gram) VALUES
-- 主食类
('米饭', '主食', 116, 2, 0, 26, 100),
('面条', '主食', 284, 8, 2, 57, 100),
('馒头', '主食', 221, 7, 1, 47, 100),
('面包', '主食', 312, 8, 5, 58, 100),
('全麦面包', '主食', 250, 13, 4, 41, 100),
('燕麦片', '主食', 377, 15, 7, 61, 100),
('玉米', '主食', 112, 4, 1, 23, 100),
('红薯', '主食', 86, 1, 0, 20, 100),
('土豆', '主食', 77, 2, 0, 17, 100),
('小米粥', '主食', 46, 1, 0, 9, 100),
('糙米', '主食', 348, 7, 2, 76, 100),
('饺子', '主食', 253, 8, 10, 32, 100),
('包子', '主食', 227, 7, 3, 41, 100),

-- 肉类
('猪肉(瘦)', '肉类', 143, 20, 7, 0, 100),
('猪肉(五花)', '肉类', 395, 13, 37, 0, 100),
('牛肉(瘦)', '肉类', 125, 20, 4, 0, 100),
('羊肉(瘦)', '肉类', 118, 20, 4, 0, 100),
('鸡胸肉', '肉类', 165, 31, 4, 0, 100),
('鸡腿', '肉类', 181, 20, 11, 0, 100),
('鸭肉', '肉类', 240, 15, 19, 0, 100),
('猪肝', '肉类', 129, 19, 4, 5, 100),
('猪里脊', '肉类', 155, 20, 8, 0, 100),
('牛排', '肉类', 250, 26, 15, 0, 100),

-- 水产类
('草鱼', '水产', 112, 18, 4, 0, 100),
('鲫鱼', '水产', 108, 17, 4, 0, 100),
('鲈鱼', '水产', 105, 18, 3, 0, 100),
('三文鱼', '水产', 139, 17, 8, 0, 100),
('虾', '水产', 93, 18, 2, 0, 100),
('螃蟹', '水产', 103, 18, 3, 0, 100),
('海带', '水产', 17, 1, 0, 3, 100),
('紫菜', '水产', 207, 27, 4, 22, 100),

-- 蛋类
('鸡蛋', '蛋类', 144, 13, 9, 1, 100),
('鸭蛋', '蛋类', 185, 12, 14, 1, 100),
('鹌鹑蛋', '蛋类', 160, 12, 11, 2, 100),
('蛋白', '蛋类', 52, 11, 0, 1, 100),
('蛋黄', '蛋类', 328, 15, 28, 3, 100),

-- 奶制品
('牛奶', '奶制品', 54, 3, 3, 5, 100),
('酸奶', '奶制品', 72, 2, 2, 10, 100),
('奶酪', '奶制品', 328, 25, 23, 4, 100),
('脱脂牛奶', '奶制品', 34, 3, 0, 5, 100),

-- 豆类
('豆腐', '豆类', 81, 8, 4, 2, 100),
('豆浆', '豆类', 31, 3, 1, 2, 100),
('黄豆', '豆类', 359, 35, 16, 19, 100),
('绿豆', '豆类', 316, 21, 1, 56, 100),
('红豆', '豆类', 324, 20, 1, 55, 100),

-- 蔬菜类
('白菜', '蔬菜', 17, 1, 0, 3, 100),
('青菜', '蔬菜', 15, 1, 0, 2, 100),
('菠菜', '蔬菜', 28, 2, 0, 4, 100),
('生菜', '蔬菜', 15, 1, 0, 2, 100),
('西兰花', '蔬菜', 36, 4, 0, 4, 100),
('花菜', '蔬菜', 24, 2, 0, 3, 100),
('黄瓜', '蔬菜', 16, 1, 0, 3, 100),
('番茄', '蔬菜', 20, 1, 0, 3, 100),
('茄子', '蔬菜', 24, 1, 0, 5, 100),
('胡萝卜', '蔬菜', 39, 1, 0, 8, 100),
('白萝卜', '蔬菜', 23, 1, 0, 5, 100),
('土豆丝', '蔬菜', 77, 2, 0, 17, 100),
('莲藕', '蔬菜', 74, 2, 0, 16, 100),
('苦瓜', '蔬菜', 22, 1, 0, 4, 100),
('南瓜', '蔬菜', 23, 1, 0, 5, 100),
('冬瓜', '蔬菜', 11, 0, 0, 2, 100),
('洋葱', '蔬菜', 40, 1, 0, 9, 100),
('大蒜', '蔬菜', 126, 5, 0, 27, 100),
('韭菜', '蔬菜', 26, 2, 0, 3, 100),
('芹菜', '蔬菜', 16, 1, 0, 3, 100),

-- 水果类
('苹果', '水果', 54, 0, 0, 13, 100),
('香蕉', '水果', 93, 1, 0, 22, 100),
('橙子', '水果', 48, 1, 0, 11, 100),
('梨', '水果', 42, 0, 0, 11, 100),
('葡萄', '水果', 44, 0, 0, 10, 100),
('西瓜', '水果', 26, 1, 0, 6, 100),
('草莓', '水果', 32, 1, 0, 7, 100),
('蓝莓', '水果', 57, 1, 0, 14, 100),
('猕猴桃', '水果', 61, 1, 0, 14, 100),
('芒果', '水果', 32, 1, 0, 7, 100),
('火龙果', '水果', 55, 1, 0, 13, 100),
('桃子', '水果', 42, 1, 0, 10, 100),
('樱桃', '水果', 46, 1, 0, 10, 100),

-- 坚果类
('花生', '坚果', 574, 24, 44, 16, 100),
('核桃', '坚果', 654, 15, 65, 10, 100),
('杏仁', '坚果', 578, 22, 51, 19, 100),
('腰果', '坚果', 552, 17, 44, 24, 100),
('瓜子', '坚果', 606, 20, 53, 12, 100),

-- 油脂类
('花生油', '油脂', 899, 0, 100, 0, 100),
('橄榄油', '油脂', 899, 0, 100, 0, 100),
('黄油', '油脂', 888, 1, 98, 0, 100),
('芝麻', '油脂', 517, 19, 46, 15, 100),

-- 饮料类
('可乐', '饮料', 43, 0, 0, 11, 100),
('果汁', '饮料', 46, 0, 0, 11, 100),
('咖啡(无糖)', '饮料', 2, 0, 0, 0, 100),
('茶', '饮料', 1, 0, 0, 0, 100),
('蜂蜜', '饮料', 321, 0, 0, 82, 100),

-- 其他
('巧克力', '零食', 589, 8, 40, 53, 100),
('薯片', '零食', 548, 6, 34, 53, 100),
('饼干', '零食', 493, 8, 23, 64, 100),
('蛋糕', '零食', 347, 7, 14, 51, 100),
('冰淇淋', '零食', 207, 4, 11, 24, 100),
('方便面', '零食', 473, 9, 22, 58, 100);
