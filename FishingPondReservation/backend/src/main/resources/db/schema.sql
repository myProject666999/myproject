CREATE DATABASE IF NOT EXISTS fishing_pond DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE fishing_pond;

CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'USER',
    balance DECIMAL(10, 2) DEFAULT 0,
    status TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pond (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pond_no VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL,
    price_per_day DECIMAL(10, 2) NOT NULL DEFAULT 200,
    capacity INT DEFAULT 1,
    description VARCHAR(500),
    image_url VARCHAR(255),
    status TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS equipment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    unit VARCHAR(20),
    description VARCHAR(500),
    image_url VARCHAR(255),
    status TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pond_reservation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    pond_id BIGINT NOT NULL,
    reservation_date DATE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    payment_type VARCHAR(20) NOT NULL,
    status TINYINT DEFAULT 0,
    qr_code VARCHAR(64) UNIQUE,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_pond_id (pond_id),
    INDEX idx_reservation_date (reservation_date),
    INDEX idx_status (status),
    UNIQUE KEY uk_pond_date (pond_id, reservation_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS equipment_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    order_no VARCHAR(32) NOT NULL UNIQUE,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_type VARCHAR(20) NOT NULL,
    status TINYINT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_order_no (order_no),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS equipment_order_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    equipment_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    INDEX idx_order_id (order_id),
    INDEX idx_equipment_id (equipment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS catch_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    reservation_id BIGINT,
    fish_type VARCHAR(50) NOT NULL,
    weight DECIMAL(10, 2) NOT NULL,
    price_per_kg DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status TINYINT DEFAULT 0,
    weigh_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_reservation_id (reservation_id),
    INDEX idx_weigh_time (weigh_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS leaderboard (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    total_weight DECIMAL(10, 2) DEFAULT 0,
    total_value DECIMAL(10, 2) DEFAULT 0,
    fish_count INT DEFAULT 0,
    ranking INT,
    period VARCHAR(20) NOT NULL,
    period_date DATE NOT NULL,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_period_date (period, period_date),
    INDEX idx_ranking (ranking)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS live_stream (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    stream_url VARCHAR(255),
    status TINYINT DEFAULT 0,
    view_count INT DEFAULT 0,
    start_time DATETIME,
    end_time DATETIME,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO sys_user (username, password, nickname, phone, role, balance, status) VALUES
('admin', '123456', '管理员', '13900139001', 'ADMIN', 0.00, 1),
('user1', '123456', '钓友张三', '13900139002', 'USER', 500.00, 1),
('user2', '123456', '钓友李四', '13900139003', 'USER', 800.00, 1),
('user3', '123456', '钓友王五', '13900139004', 'USER', 300.00, 1);

INSERT IGNORE INTO pond (pond_no, name, type, price_per_day, capacity, description, status) VALUES
('P1', '1号塘', '综合塘', 200.00, 5, '综合塘，适合各种鱼类垂钓', 1),
('P2', '2号塘', '鲫鱼塘', 150.00, 4, '专业鲫鱼塘，密度高', 1),
('P3', '3号塘', '鲤鱼塘', 180.00, 5, '鲤鱼塘，大物较多', 1),
('P4', '4号塘', '青鱼塘', 300.00, 3, '大物塘，青鱼为主', 1),
('P5', '5号塘', '竞技塘', 250.00, 8, '竞技专用塘', 1);

INSERT IGNORE INTO equipment (name, category, price, stock, unit, description, status) VALUES
('碳素鱼竿4.5米', '鱼竿', 299.00, 20, '支', '轻量碳素材质，手感好', 1),
('碳素鱼竿5.4米', '鱼竿', 399.00, 15, '支', '适合野钓和塘钓', 1),
('渔轮5000型', '渔轮', 159.00, 30, '个', '顺滑耐用', 1),
('主线组1.5号', '鱼线', 25.00, 50, '卷', '进口原丝', 1),
('主线组2.0号', '鱼线', 28.00, 50, '卷', '进口原丝', 1),
('伊势尼鱼钩5号', '鱼钩', 15.00, 100, '包', '锋利耐用', 1),
('野战蓝鲫', '饵料', 12.00, 80, '袋', '经典鲫鱼饵', 1),
('螺鲤2号', '饵料', 18.00, 60, '袋', '鲤鱼专用', 1),
('草鱼饵料', '饵料', 20.00, 40, '袋', '草鱼专用', 1),
('浮漂纳米', '浮漂', 35.00, 30, '支', '灵敏度高', 1),
('抄网套装', '配件', 89.00, 15, '套', '可伸缩抄网', 1),
('鱼护40cm', '配件', 69.00, 25, '个', '防挂速干', 1);

INSERT IGNORE INTO live_stream (title, description, stream_url, status, view_count) VALUES
('钓鱼场实况直播', '实时观看钓友垂钓精彩瞬间', 'rtmp://localhost/live/fishing', 1, 128);
