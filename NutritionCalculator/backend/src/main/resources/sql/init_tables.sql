-- 建表语句
DROP TABLE IF EXISTS meal_record;
DROP TABLE IF EXISTS food;
DROP TABLE IF EXISTS nutrition_goal;

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

CREATE TABLE nutrition_goal (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    target_calories INT NOT NULL DEFAULT 2000 COMMENT '每日目标热量(kcal)',
    target_protein INT NOT NULL DEFAULT 60 COMMENT '每日目标蛋白质(g)',
    target_fat INT NOT NULL DEFAULT 60 COMMENT '每日目标脂肪(g)',
    target_carbs INT NOT NULL DEFAULT 250 COMMENT '每日目标碳水化合物(g)',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='营养目标表';

INSERT INTO nutrition_goal (target_calories, target_protein, target_fat, target_carbs)
VALUES (2000, 60, 60, 250);
