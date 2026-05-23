CREATE DATABASE IF NOT EXISTS recipe_sharing DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE recipe_sharing;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(255) DEFAULT NULL,
  bio TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS recipes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  cover_image VARCHAR(255) DEFAULT NULL,
  category VARCHAR(50) NOT NULL COMMENT '分类：家常菜/川菜/粤菜/甜品/汤羹/主食/其他',
  flavor VARCHAR(50) NOT NULL COMMENT '口味：清淡/微辣/中辣/麻辣/酸甜/咸鲜',
  difficulty VARCHAR(20) NOT NULL COMMENT '难度：简单/中等/困难',
  cook_time INT NOT NULL COMMENT '烹饪时间（分钟）',
  servings INT NOT NULL COMMENT '份量',
  user_id INT NOT NULL,
  likes_count INT DEFAULT 0,
  favorites_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_category (category),
  INDEX idx_flavor (flavor),
  INDEX idx_difficulty (difficulty),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipe_id INT NOT NULL,
  name VARCHAR(100) NOT NULL COMMENT '食材名称',
  amount VARCHAR(50) NOT NULL COMMENT '用量',
  unit VARCHAR(20) DEFAULT NULL COMMENT '单位',
  is_optional BOOLEAN DEFAULT FALSE COMMENT '是否可选',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  INDEX idx_recipe_id (recipe_id),
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS recipe_steps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipe_id INT NOT NULL,
  step_order INT NOT NULL COMMENT '步骤排序',
  content TEXT NOT NULL COMMENT '步骤内容',
  image VARCHAR(255) DEFAULT NULL COMMENT '步骤图片',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  INDEX idx_recipe_id (recipe_id),
  INDEX idx_step_order (recipe_id, step_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  recipe_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_recipe (user_id, recipe_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  recipe_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_recipe (user_id, recipe_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  recipe_id INT NOT NULL,
  content TEXT NOT NULL,
  parent_id INT DEFAULT NULL COMMENT '回复的评论ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
  INDEX idx_recipe_id (recipe_id),
  INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  recipe_id INT NOT NULL,
  week_day VARCHAR(20) NOT NULL COMMENT '星期几：星期一/星期二/.../星期日',
  meal_type VARCHAR(20) NOT NULL COMMENT '餐次：早餐/午餐/晚餐/加餐',
  week_start_date DATE NOT NULL COMMENT '本周开始日期',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  INDEX idx_user_week (user_id, week_start_date),
  INDEX idx_week_day (week_day)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS shopping_lists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  week_start_date DATE NOT NULL,
  ingredient_name VARCHAR(100) NOT NULL,
  total_amount VARCHAR(100) NOT NULL,
  is_checked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_week (user_id, week_start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO users (username, email, password, avatar, bio) VALUES
('demo_user', 'demo@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NULL, '这是一个演示账号');

INSERT INTO recipes (title, description, cover_image, category, flavor, difficulty, cook_time, servings, user_id) VALUES
('西红柿炒鸡蛋', '经典家常菜，简单美味，下饭必备', NULL, '家常菜', '咸鲜', '简单', 15, 2, 1),
('麻婆豆腐', '四川传统名菜，麻辣鲜香', NULL, '川菜', '麻辣', '中等', 30, 3, 1),
('清蒸鲈鱼', '清淡健康，保留鱼肉原汁原味', NULL, '粤菜', '清淡', '中等', 25, 2, 1),
('红烧肉', '肥而不腻，入口即化的经典红烧肉', NULL, '家常菜', '咸鲜', '中等', 60, 4, 1),
('糖醋排骨', '酸甜可口，外酥里嫩', NULL, '家常菜', '酸甜', '中等', 45, 3, 1),
('紫菜蛋花汤', '简单快手的营养汤品', NULL, '汤羹', '清淡', '简单', 10, 2, 1),
('蛋炒饭', '粒粒分明，蛋香浓郁', NULL, '主食', '咸鲜', '简单', 15, 1, 1),
('提拉米苏', '意式经典甜品，咖啡与奶酪的完美结合', NULL, '甜品', '甜香', '困难', 120, 6, 1);

INSERT INTO recipe_ingredients (recipe_id, name, amount, unit, is_optional) VALUES
(1, '西红柿', '2', '个', FALSE),
(1, '鸡蛋', '3', '个', FALSE),
(1, '葱花', '适量', NULL, TRUE),
(1, '盐', '适量', NULL, FALSE),
(1, '糖', '少许', NULL, TRUE),
(2, '豆腐', '1', '块', FALSE),
(2, '牛肉末', '100', '克', FALSE),
(2, '豆瓣酱', '2', '勺', FALSE),
(2, '花椒粉', '1', '勺', FALSE),
(2, '葱姜蒜', '适量', NULL, TRUE),
(3, '鲈鱼', '1', '条', FALSE),
(3, '葱姜', '适量', NULL, FALSE),
(3, '蒸鱼豉油', '3', '勺', FALSE),
(3, '料酒', '1', '勺', TRUE),
(4, '五花肉', '500', '克', FALSE),
(4, '冰糖', '30', '克', FALSE),
(4, '生抽', '2', '勺', FALSE),
(4, '老抽', '1', '勺', FALSE),
(4, '料酒', '2', '勺', FALSE),
(5, '排骨', '500', '克', FALSE),
(5, '冰糖', '50', '克', FALSE),
(5, '白醋', '3', '勺', FALSE),
(5, '生抽', '2', '勺', FALSE),
(5, '料酒', '1', '勺', TRUE);

INSERT INTO recipe_steps (recipe_id, step_order, content, image) VALUES
(1, 1, '西红柿洗净切块，鸡蛋打散加少许盐', NULL),
(1, 2, '热锅凉油，倒入蛋液炒至凝固盛出', NULL),
(1, 3, '锅中加油，放入西红柿翻炒出汁', NULL),
(1, 4, '加入炒好的鸡蛋，加盐和糖调味，翻炒均匀出锅', NULL),
(2, 1, '豆腐切成小块，用淡盐水浸泡10分钟', NULL),
(2, 2, '锅中热油，放入牛肉末炒至变色', NULL),
(2, 3, '加入豆瓣酱炒出红油', NULL),
(2, 4, '加入适量水烧开，放入豆腐轻轻推动', NULL),
(2, 5, '小火煮5分钟，勾芡撒花椒粉和葱花出锅', NULL),
(3, 1, '鲈鱼处理干净，两面划几刀', NULL),
(3, 2, '鱼身抹上料酒，放上葱姜', NULL),
(3, 3, '水开后蒸8分钟，关火虚蒸2分钟', NULL),
(3, 4, '取出倒掉汤汁，淋上蒸鱼豉油，泼上热油即可', NULL),
(4, 1, '五花肉切块，冷水下锅焯水去血沫', NULL),
(4, 2, '锅中放少许油，加入冰糖炒糖色', NULL),
(4, 3, '糖色变红后放入肉块翻炒上色', NULL),
(4, 4, '加入生抽、老抽、料酒和热水', NULL),
(4, 5, '小火炖煮40分钟，大火收汁即可', NULL),
(5, 1, '排骨冷水下锅焯水，捞出沥干', NULL),
(5, 2, '锅中放少许油，加入冰糖炒糖色', NULL),
(5, 3, '放入排骨翻炒上色', NULL),
(5, 4, '加入白醋、生抽、料酒和热水', NULL),
(5, 5, '小火煮30分钟，大火收汁即可', NULL),
(6, 1, '锅中加水烧开，放入紫菜', NULL),
(6, 2, '蛋液慢慢淋入锅中，形成蛋花', NULL),
(6, 3, '加盐和香油调味，撒上葱花出锅', NULL),
(7, 1, '鸡蛋打散，米饭打散备用', NULL),
(7, 2, '锅中多放些油，倒入蛋液快速翻炒', NULL),
(7, 3, '蛋液半凝固时倒入米饭', NULL),
(7, 4, '大火翻炒均匀，加盐调味出锅', NULL),
(8, 1, '手指饼干蘸取咖啡液，铺一层在容器底部', NULL),
(8, 2, '马斯卡彭奶酪加蛋黄和糖搅拌均匀', NULL),
(8, 3, '蛋白打发至硬性发泡，拌入奶酪糊', NULL),
(8, 4, '奶酪糊铺在饼干上，重复铺层', NULL),
(8, 5, '冷藏4小时以上，食用前筛可可粉', NULL);
