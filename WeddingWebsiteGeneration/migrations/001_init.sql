-- 创建数据库
CREATE DATABASE IF NOT EXISTS wedding_website DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE wedding_website;

-- 婚礼主表
CREATE TABLE IF NOT EXISTS weddings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bride_name VARCHAR(100) NOT NULL,
    groom_name VARCHAR(100) NOT NULL,
    wedding_date DATETIME NOT NULL,
    venue VARCHAR(255),
    story TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- RSVP 表
CREATE TABLE IF NOT EXISTS rsvps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    wedding_id INT NOT NULL,
    guest_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    attend_count INT DEFAULT 1,
    dietary VARCHAR(255),
    message TEXT,
    is_attending BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wedding_id) REFERENCES weddings(id) ON DELETE CASCADE,
    INDEX idx_wedding_id (wedding_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 留言表
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    wedding_id INT NOT NULL,
    author_name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wedding_id) REFERENCES weddings(id) ON DELETE CASCADE,
    INDEX idx_wedding_id (wedding_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 时间轴事件表
CREATE TABLE IF NOT EXISTS timeline_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    wedding_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE,
    image VARCHAR(500),
    FOREIGN KEY (wedding_id) REFERENCES weddings(id) ON DELETE CASCADE,
    INDEX idx_wedding_id (wedding_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 婚礼日程表
CREATE TABLE IF NOT EXISTS schedule_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    wedding_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    start_time TIME,
    end_time TIME,
    location VARCHAR(255),
    description TEXT,
    FOREIGN KEY (wedding_id) REFERENCES weddings(id) ON DELETE CASCADE,
    INDEX idx_wedding_id (wedding_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 照片表
CREATE TABLE IF NOT EXISTS photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    wedding_id INT NOT NULL,
    url VARCHAR(500) NOT NULL,
    caption VARCHAR(255),
    sort_order INT DEFAULT 0,
    FOREIGN KEY (wedding_id) REFERENCES weddings(id) ON DELETE CASCADE,
    INDEX idx_wedding_id (wedding_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 初始化示例数据
INSERT INTO weddings (bride_name, groom_name, wedding_date, venue, story) VALUES
('张小雨', '李明阳', '2025-10-01 10:00:00', '上海外滩花园酒店', '我们在大学校园相识，从朋友到恋人，走过了美好的五年时光。');

SET @wedding_id = LAST_INSERT_ID();

INSERT INTO timeline_events (wedding_id, title, description, event_date) VALUES
(@wedding_id, '初次相遇', '在图书馆的一次偶然相遇', '2020-09-01'),
(@wedding_id, '确定关系', '在樱花树下表白成功', '2021-03-14'),
(@wedding_id, '求婚成功', '在山顶星空下求婚', '2025-02-14');

INSERT INTO schedule_items (wedding_id, title, start_time, end_time, location, description) VALUES
(@wedding_id, '迎宾签到', '09:30', '10:00', '酒店大堂', '宾客签到并领取伴手礼'),
(@wedding_id, '婚礼仪式', '10:00', '11:30', '主礼堂', '交换戒指、宣誓仪式'),
(@wedding_id, '婚宴午宴', '12:00', '14:00', '宴会厅', '喜宴及敬酒环节');

INSERT INTO photos (wedding_id, url, caption, sort_order) VALUES
(@wedding_id, 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800', '婚纱照', 1),
(@wedding_id, 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800', '求婚现场', 2),
(@wedding_id, 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800', '甜蜜时刻', 3),
(@wedding_id, 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800', '浪漫约会', 4);

-- RSVP 归档数据
INSERT INTO rsvps (wedding_id, guest_name, phone, attend_count, dietary, message, is_attending) VALUES
(@wedding_id, '王芳', '13800138001', 2, '无特殊要求', '祝你们幸福美满！', TRUE),
(@wedding_id, '张伟', '13900139002', 1, '素食', '恭喜恭喜！', TRUE),
(@wedding_id, '刘洋', '13700137003', 3, NULL, '期待你们的婚礼！', TRUE);
