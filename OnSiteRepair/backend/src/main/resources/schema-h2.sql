-- 用户表
CREATE TABLE IF NOT EXISTS user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    avatar VARCHAR(255),
    real_name VARCHAR(50),
    gender TINYINT DEFAULT 0,
    status TINYINT DEFAULT 1,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
);

-- 师傅表
CREATE TABLE IF NOT EXISTS worker (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    avatar VARCHAR(255),
    real_name VARCHAR(50),
    id_card VARCHAR(18),
    id_card_front VARCHAR(255),
    id_card_back VARCHAR(255),
    skills VARCHAR(500),
    certificate VARCHAR(255),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    address VARCHAR(255),
    rating DECIMAL(3, 2) DEFAULT 5.00,
    order_count INT DEFAULT 0,
    status TINYINT DEFAULT 0,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
);

-- 订单表
CREATE TABLE IF NOT EXISTS repair_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(32) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    worker_id BIGINT,
    category VARCHAR(50) NOT NULL,
    fault_type VARCHAR(100) NOT NULL,
    fault_desc TEXT NOT NULL,
    images TEXT,
    video VARCHAR(255),
    contact_name VARCHAR(50) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    address VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    appointment_time TIMESTAMP,
    parts_list TEXT,
    parts_amount DECIMAL(10, 2) DEFAULT 0,
    labor_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) DEFAULT 0,
    negotiated_amount DECIMAL(10, 2),
    negotiated_note TEXT,
    negotiation_status TINYINT DEFAULT 0,
    before_images TEXT,
    after_images TEXT,
    recording_url VARCHAR(255),
    status TINYINT DEFAULT 0,
    grab_start_time TIMESTAMP,
    grab_end_time TIMESTAMP,
    accept_time TIMESTAMP,
    start_time TIMESTAMP,
    finish_time TIMESTAMP,
    cancel_time TIMESTAMP,
    cancel_reason TEXT,
    pay_time TIMESTAMP,
    pay_type VARCHAR(20),
    pay_trade_no VARCHAR(64),
    warranty_months INT DEFAULT 3,
    warranty_start_time TIMESTAMP,
    warranty_end_time TIMESTAMP,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
);

-- 抢单记录表
CREATE TABLE IF NOT EXISTS grab_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    worker_id BIGINT NOT NULL,
    distance DECIMAL(10, 2),
    grab_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_success TINYINT DEFAULT 0
);

-- 评价表
CREATE TABLE IF NOT EXISTS review (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    worker_id BIGINT NOT NULL,
    rating TINYINT NOT NULL,
    content TEXT,
    images TEXT,
    status TINYINT DEFAULT 1,
    reply_content TEXT,
    reply_time TIMESTAMP,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 通知表
CREATE TABLE IF NOT EXISTS notification (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_type TINYINT NOT NULL,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(100) NOT NULL,
    content TEXT,
    related_id BIGINT,
    is_read TINYINT DEFAULT 0,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 管理员表
CREATE TABLE IF NOT EXISTS admin (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    status TINYINT DEFAULT 1,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 初始化默认测试账号（密码均为 123456）
-- 密码是通过 BCrypt 加密的 123456
INSERT INTO user (phone, password, nickname, gender, status) VALUES ('13800138001', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '测试用户小明', 1, 1);
INSERT INTO user (phone, password, nickname, gender, status) VALUES ('13800138002', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '测试用户小红', 2, 1);

INSERT INTO worker (phone, password, nickname, real_name, skills, latitude, longitude, address, rating, order_count, status) VALUES ('13900139001', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '张师傅', '张三', '空调维修,洗衣机维修,冰箱维修', 39.904200, 116.407400, '北京市东城区', 4.85, 128, 1);
INSERT INTO worker (phone, password, nickname, real_name, skills, latitude, longitude, address, rating, order_count, status) VALUES ('13900139002', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '李师傅', '李四', '水电维修,灯具安装,卫浴维修', 39.914200, 116.417400, '北京市朝阳区', 4.92, 256, 1);
INSERT INTO worker (phone, password, nickname, real_name, skills, latitude, longitude, address, rating, order_count, status) VALUES ('13900139003', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '王师傅', '王五', '家电维修,水电维修', 39.894200, 116.397400, '北京市西城区', 4.78, 89, 1);

INSERT INTO admin (username, password, nickname, status) VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '超级管理员', 1);
