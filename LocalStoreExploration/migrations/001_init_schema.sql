-- 创建数据库
CREATE DATABASE IF NOT EXISTS local_store_exploration DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE local_store_exploration;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    avatar VARCHAR(255),
    bio TEXT,
    followers_count INT DEFAULT 0,
    notes_count INT DEFAULT 0,
    is_verified TINYINT DEFAULT 0,
    status TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username(username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 店铺表
CREATE TABLE IF NOT EXISTS shops (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    category VARCHAR(50),
    cover_image VARCHAR(255),
    images JSON,
    rating DECIMAL(3,1) DEFAULT 0,
    lat DECIMAL(10,7) NOT NULL,
    lng DECIMAL(10,7) NOT NULL,
    business_hours VARCHAR(255),
    notes_count INT DEFAULT 0,
    average_cost DECIMAL(10,2) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category(category),
    INDEX idx_location(lat, lng)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 探店笔记表
CREATE TABLE IF NOT EXISTS notes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    shop_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    images JSON NOT NULL,
    rating_overall DECIMAL(3,1) NOT NULL,
    rating_taste DECIMAL(3,1),
    rating_env DECIMAL(3,1),
    rating_service DECIMAL(3,1),
    rating_cost DECIMAL(3,1),
    lat DECIMAL(10,7) NOT NULL,
    lng DECIMAL(10,7) NOT NULL,
    address VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    views_count INT DEFAULT 0,
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
    INDEX idx_user_id(user_id),
    INDEX idx_shop_id(shop_id),
    INDEX idx_category(category),
    INDEX idx_status(status),
    INDEX idx_location(lat, lng)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 收藏表
CREATE TABLE IF NOT EXISTS favorites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    target_id BIGINT NOT NULL,
    target_type ENUM('note', 'shop') NOT NULL,
    list_type ENUM('want', 'visited') DEFAULT 'want',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_target(user_id, target_id, target_type),
    INDEX idx_user_id(user_id),
    INDEX idx_list_type(list_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 评论表
CREATE TABLE IF NOT EXISTS comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    note_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    likes_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    INDEX idx_user_id(user_id),
    INDEX idx_note_id(note_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 关注表
CREATE TABLE IF NOT EXISTS follows (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    follower_id BIGINT NOT NULL,
    following_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_follow(follower_id, following_id),
    INDEX idx_follower_id(follower_id),
    INDEX idx_following_id(following_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 点赞表
CREATE TABLE IF NOT EXISTS likes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    target_id BIGINT NOT NULL,
    target_type ENUM('note', 'comment') NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_target(user_id, target_id, target_type),
    INDEX idx_user_id(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入测试数据
-- 测试用户
INSERT INTO users (username, password, nickname, avatar, bio, followers_count, notes_count, is_verified) VALUES
('daren1', '$2b$10$ixlPY3AAd4ty1l6E2IsQ9OFZi2ba9ZQE0bP7RFcGIWPnCQeQrP5/W', '美食达人小王', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop', '专注美食探店10年，吃遍全城好吃的！', 12580, 156, 1),
('daren2', '$2b$10$ixlPY3AAd4ty1l6E2IsQ9OFZi2ba9ZQE0bP7RFcGIWPnCQeQrP5/W', '探店达人小美', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', '颜值与美食并存，带你发现隐藏的美食', 8950, 89, 1),
('daren3', '$2b$10$ixlPY3AAd4ty1l6E2IsQ9OFZi2ba9ZQE0bP7RFcGIWPnCQeQrP5/W', '吃货老张', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', '不是在吃，就是在去吃的路上', 5680, 72, 1),
('user1', '$2b$10$ixlPY3AAd4ty1l6E2IsQ9OFZi2ba9ZQE0bP7RFcGIWPnCQeQrP5/W', '普通用户小李', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop', '爱吃爱玩', 120, 5, 0);

-- 测试店铺
INSERT INTO shops (name, address, phone, category, cover_image, images, rating, lat, lng, business_hours, notes_count, average_cost) VALUES
('老王火锅店', '北京市朝阳区建国路88号SOHO现代城底商', '010-88888888', '火锅', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop', 
JSON_ARRAY('https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop'),
4.8, 39.9087, 116.4474, '10:00-22:00', 36, 128.00),
('日式居酒屋', '北京市朝阳区三里屯路19号太古里南区', '010-66666666', '日料', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop',
JSON_ARRAY('https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=800&h=600&fit=crop'),
4.6, 39.9340, 116.4530, '11:30-23:00', 28, 188.00),
('咖啡时光', '北京市海淀区中关村大街1号', '010-55555555', '咖啡', 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
JSON_ARRAY('https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&h=600&fit=crop'),
4.5, 39.9842, 116.3160, '08:00-21:00', 45, 58.00),
('川菜馆', '北京市西城区西单北大街120号', '010-77777777', '川菜', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&h=300&fit=crop',
JSON_ARRAY('https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop'),
4.7, 39.9147, 116.3783, '10:00-21:30', 52, 88.00),
('甜品屋', '北京市东城区王府井大街88号', '010-99999999', '甜品', 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=300&fit=crop',
JSON_ARRAY('https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=800&h=600&fit=crop'),
4.9, 39.9143, 116.4104, '10:00-22:00', 67, 45.00);

-- 测试笔记
INSERT INTO notes (user_id, shop_id, title, content, images, rating_overall, rating_taste, rating_env, rating_service, rating_cost, lat, lng, address, category, status, views_count, likes_count, comments_count) VALUES
(1, 1, '超赞的火锅店！必点毛肚和肥牛', '今天来打卡这家网红火锅店，环境真的太棒了！毛肚特别新鲜，七上八下之后口感脆嫩。肥牛也是入口即化，麻辣锅底味道正宗。人均150左右，性价比很高！强烈推荐给各位火锅爱好者～',
JSON_ARRAY('https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1594983162858-89e53a1c5d50?w=800&h=600&fit=crop'),
4.8, 5.0, 4.5, 4.7, 4.2, 39.9087, 116.4474, '北京市朝阳区建国路88号SOHO现代城底商', '火锅', 'approved', 2345, 186, 45),
(1, 2, '隐秘的日式居酒屋，氛围感满分', '和朋友偶然发现的一家居酒屋，藏在三里屯的小巷子里。店内装修很有日本风情，烧鸟做得特别正宗，清酒种类也很多。晚上来这里小酌一杯真的太惬意了！',
JSON_ARRAY('https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=800&h=600&fit=crop'),
4.6, 4.5, 4.8, 4.5, 4.3, 39.9340, 116.4530, '北京市朝阳区三里屯路19号太古里南区', '日料', 'approved', 1876, 142, 32),
(2, 3, '中关村宝藏咖啡店，拿铁绝了', '在中关村发现的宝藏咖啡店！店面不大但装修很有格调，手冲咖啡香味浓郁，拉花也很漂亮。最惊喜的是他们家的提拉米苏，口感绵密不腻。适合下午来这里办公或者和朋友聊天～',
JSON_ARRAY('https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&h=600&fit=crop'),
4.5, 4.6, 4.7, 4.3, 4.2, 39.9842, 116.3160, '北京市海淀区中关村大街1号', '咖啡', 'approved', 1543, 98, 28),
(2, 5, '这家甜品店也太好拍了吧！', '被闺蜜种草的甜品店，果然名不虚传！草莓蛋糕颜值超高，拍照巨好看，味道也很赞，奶油一点都不腻。店里环境很少女心，周末和小姐妹来这里喝下午茶太合适了～',
JSON_ARRAY('https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=800&h=600&fit=crop'),
4.9, 5.0, 4.8, 4.9, 4.7, 39.9143, 116.4104, '北京市东城区王府井大街88号', '甜品', 'approved', 3256, 287, 65),
(3, 4, '正宗川菜！水煮鱼绝了', '作为一个四川人，在北京能吃到这么正宗的川菜太感动了！水煮鱼麻辣鲜香，鱼肉特别嫩。麻婆豆腐配米饭绝了，连吃三碗都不够。价格也很实惠，人均不到100块！',
JSON_ARRAY('https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop'),
4.7, 4.9, 4.3, 4.6, 4.8, 39.9147, 116.3783, '北京市西城区西单北大街120号', '川菜', 'approved', 2100, 156, 42),
(3, 1, '第二次来还是那么好吃！', '二刷老王火锅店，这次尝试了新出的番茄锅底，味道浓郁，涮蔬菜特别好吃。服务员态度依旧很好，会主动帮忙涮菜。周末人比较多，建议提前订位～',
JSON_ARRAY('https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop'),
4.7, 4.8, 4.6, 4.8, 4.3, 39.9087, 116.4474, '北京市朝阳区建国路88号SOHO现代城底商', '火锅', 'approved', 1678, 123, 35);

-- 测试评论
INSERT INTO comments (user_id, note_id, content, likes_count) VALUES
(2, 1, '这家我也去过！毛肚确实好吃', 23),
(3, 1, '收藏了，周末去打卡', 15),
(4, 1, '人均多少呀？', 5),
(1, 2, '这家我经常去，老板都认识我了哈哈', 18),
(4, 2, '看起来好有氛围感', 8),
(1, 4, '甜品控表示已经流口水了🤤', 35),
(3, 4, '这家我上周刚去过，真的超级好拍！', 22),
(2, 5, '作为四川人表示认同！', 12);

-- 测试收藏
INSERT INTO favorites (user_id, target_id, target_type, list_type) VALUES
(2, 1, 'note', 'want'),
(3, 1, 'note', 'want'),
(4, 1, 'note', 'visited'),
(2, 2, 'shop', 'want'),
(4, 3, 'shop', 'visited'),
(1, 5, 'shop', 'want'),
(3, 4, 'note', 'want');

-- 测试关注
INSERT INTO follows (follower_id, following_id) VALUES
(2, 1),
(3, 1),
(4, 1),
(3, 2),
(4, 2),
(1, 3),
(2, 3);

-- 测试点赞
INSERT INTO likes (user_id, target_id, target_type) VALUES
(2, 1, 'note'),
(3, 1, 'note'),
(4, 1, 'note'),
(1, 2, 'note'),
(3, 2, 'note'),
(1, 4, 'note'),
(2, 4, 'note'),
(3, 4, 'note'),
(1, 1, 'comment'),
(2, 1, 'comment');
