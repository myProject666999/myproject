-- Team Virtual Office Database Script
-- Created: 2026-05-28

CREATE DATABASE IF NOT EXISTS team_virtual_office DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE team_virtual_office;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    avatar_url VARCHAR(255) DEFAULT NULL,
    status TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type TINYINT DEFAULT 1,
    max_capacity INT DEFAULT 10,
    owner_id BIGINT UNSIGNED NOT NULL,
    is_public TINYINT DEFAULT 1,
    password VARCHAR(50) DEFAULT NULL,
    status TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_owner_id (owner_id),
    INDEX idx_type (type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seats table
CREATE TABLE IF NOT EXISTS seats (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    room_id BIGINT UNSIGNED NOT NULL,
    seat_number VARCHAR(20) NOT NULL,
    position_x INT DEFAULT 0,
    position_y INT DEFAULT 0,
    user_id BIGINT UNSIGNED DEFAULT NULL,
    is_occupied TINYINT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_room_seat (room_id, seat_number),
    INDEX idx_room_id (room_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User status table
CREATE TABLE IF NOT EXISTS user_status (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE,
    online_status TINYINT DEFAULT 0,
    busy_mode TINYINT DEFAULT 0,
    text_status VARCHAR(100) DEFAULT NULL,
    current_room_id BIGINT UNSIGNED DEFAULT NULL,
    current_seat_id BIGINT UNSIGNED DEFAULT NULL,
    last_heartbeat DATETIME DEFAULT NULL,
    last_active_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_online_status (online_status),
    INDEX idx_last_heartbeat (last_heartbeat),
    INDEX idx_current_room_id (current_room_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Room members table
CREATE TABLE IF NOT EXISTS room_members (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    room_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    role TINYINT DEFAULT 2,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_room_user (room_id, user_id),
    INDEX idx_room_id (room_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Call records table
CREATE TABLE IF NOT EXISTS call_records (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    caller_id BIGINT UNSIGNED NOT NULL,
    callee_id BIGINT UNSIGNED NOT NULL,
    room_id BIGINT UNSIGNED DEFAULT NULL,
    type TINYINT DEFAULT 1,
    status TINYINT DEFAULT 1,
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME DEFAULT NULL,
    duration INT DEFAULT 0,
    INDEX idx_caller_id (caller_id),
    INDEX idx_callee_id (callee_id),
    INDEX idx_status (status),
    INDEX idx_start_time (start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    room_id BIGINT UNSIGNED DEFAULT NULL,
    sender_id BIGINT UNSIGNED NOT NULL,
    receiver_id BIGINT UNSIGNED DEFAULT NULL,
    type TINYINT DEFAULT 1,
    content TEXT NOT NULL,
    is_read TINYINT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_room_id (room_id),
    INDEX idx_sender_id (sender_id),
    INDEX idx_receiver_id (receiver_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    type TINYINT NOT NULL,
    content VARCHAR(255) DEFAULT NULL,
    room_id BIGINT UNSIGNED DEFAULT NULL,
    target_user_id BIGINT UNSIGNED DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert initial data
-- Test users (password: 123456, bcrypt hash)
INSERT INTO users (username, email, password_hash, nickname) VALUES
('user1', 'user1@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Zhang San'),
('user2', 'user2@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Li Si'),
('user3', 'user3@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Wang Wu'),
('user4', 'user4@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Zhao Liu');

-- Initialize user status
INSERT INTO user_status (user_id, online_status, busy_mode) VALUES
(1, 0, 0),
(2, 0, 0),
(3, 0, 0),
(4, 0, 0);

-- Initial rooms
INSERT INTO rooms (name, description, type, max_capacity, owner_id, is_public) VALUES
('Open Office A', 'Main office area for daily work and collaboration', 1, 20, 1, 1),
('Open Office B', 'Secondary office area', 1, 20, 1, 1),
('Meeting Room 1', 'Small meeting room for 8 people', 2, 8, 1, 1),
('Meeting Room 2', 'Medium meeting room for 12 people', 2, 12, 1, 1),
('Lounge Area', 'Relaxation area', 3, 15, 1, 1);

-- Initial seats (Open Office A)
INSERT INTO seats (room_id, seat_number, position_x, position_y) VALUES
(1, 'A-01', 50, 50),
(1, 'A-02', 150, 50),
(1, 'A-03', 250, 50),
(1, 'A-04', 350, 50),
(1, 'A-05', 50, 150),
(1, 'A-06', 150, 150),
(1, 'A-07', 250, 150),
(1, 'A-08', 350, 150);

-- Initial seats (Open Office B)
INSERT INTO seats (room_id, seat_number, position_x, position_y) VALUES
(2, 'B-01', 50, 50),
(2, 'B-02', 150, 50),
(2, 'B-03', 250, 50),
(2, 'B-04', 350, 50),
(2, 'B-05', 50, 150),
(2, 'B-06', 150, 150),
(2, 'B-07', 250, 150),
(2, 'B-08', 350, 150);
