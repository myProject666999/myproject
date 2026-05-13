CREATE DATABASE IF NOT EXISTS court_reservation DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE court_reservation;

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

CREATE TABLE IF NOT EXISTS court (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    court_no VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 60,
    status TINYINT DEFAULT 1,
    description VARCHAR(255),
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS card (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    card_type VARCHAR(20) NOT NULL,
    card_no VARCHAR(32) NOT NULL UNIQUE,
    balance DECIMAL(10, 2) DEFAULT 0,
    remaining_times INT DEFAULT 0,
    expire_date DATE,
    status TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_card_no (card_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS reservation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    court_id BIGINT NOT NULL,
    date DATE NOT NULL,
    time_slot VARCHAR(20) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    payment_type VARCHAR(20) NOT NULL,
    card_id BIGINT,
    status TINYINT DEFAULT 0,
    qr_code VARCHAR(64) UNIQUE,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_court_id (court_id),
    INDEX idx_date (date),
    INDEX idx_status (status),
    UNIQUE KEY uk_court_date_slot (court_id, date, time_slot)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS coach (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    sport_type VARCHAR(20) NOT NULL,
    level VARCHAR(20),
    price_per_hour DECIMAL(10, 2) NOT NULL,
    phone VARCHAR(20),
    description VARCHAR(500),
    status TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sport_type (sport_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS coach_course (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    coach_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    court_id BIGINT,
    date DATE NOT NULL,
    time_slot VARCHAR(20) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    status TINYINT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_coach_id (coach_id),
    INDEX idx_user_id (user_id),
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS match_info (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    initiator_id BIGINT NOT NULL,
    court_id BIGINT,
    date DATE NOT NULL,
    time_slot VARCHAR(20) NOT NULL,
    sport_type VARCHAR(20) NOT NULL,
    max_players INT DEFAULT 4,
    current_players INT DEFAULT 1,
    description VARCHAR(500),
    status TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sport_type (sport_type),
    INDEX idx_date (date),
    INDEX idx_initiator (initiator_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS match_player (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    match_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    status TINYINT DEFAULT 1,
    join_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_match_id (match_id),
    INDEX idx_user_id (user_id),
    UNIQUE KEY uk_match_user (match_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS gate_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reservation_id BIGINT,
    user_id BIGINT,
    qr_code VARCHAR(64),
    action VARCHAR(20) NOT NULL,
    gate_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_reservation_id (reservation_id),
    INDEX idx_user_id (user_id),
    INDEX idx_qr_code (qr_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO court (court_no, name, type, price, status, description) VALUES
('B1', '羽毛球1号场', 'BADMINTON', 60.00, 1, '标准羽毛球场地'),
('B2', '羽毛球2号场', 'BADMINTON', 60.00, 1, '标准羽毛球场地'),
('B3', '羽毛球3号场', 'BADMINTON', 60.00, 1, '标准羽毛球场地'),
('B4', '羽毛球4号场', 'BADMINTON', 60.00, 1, '标准羽毛球场地'),
('T1', '网球1号场', 'TENNIS', 120.00, 1, '标准网球场地'),
('T2', '网球2号场', 'TENNIS', 120.00, 1, '标准网球场地');

INSERT IGNORE INTO coach (name, sport_type, level, price_per_hour, phone, description, status) VALUES
('张教练', 'BADMINTON', '高级', 200.00, '13800138001', '省队退役，10年教学经验', 1),
('李教练', 'BADMINTON', '中级', 150.00, '13800138002', '5年教学经验，擅长少儿培训', 1),
('王教练', 'TENNIS', '高级', 300.00, '13800138003', 'ITF认证教练，15年教学经验', 1);

INSERT IGNORE INTO sys_user (username, password, nickname, phone, role, balance, status) VALUES
('admin', '123456', '管理员', '13900139001', 'ADMIN', 0.00, 1),
('user1', '123456', '测试用户', '13900139002', 'USER', 500.00, 1);