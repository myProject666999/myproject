-- 团队虚拟办公室数据库脚本
-- 创建日期: 2026-05-28

CREATE DATABASE IF NOT EXISTS team_virtual_office DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE team_virtual_office;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
    nickname VARCHAR(50) NOT NULL COMMENT '昵称',
    avatar_url VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
    status TINYINT DEFAULT 1 COMMENT '账号状态: 1-正常, 0-禁用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 房间表
CREATE TABLE IF NOT EXISTS rooms (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '房间名称',
    description TEXT COMMENT '房间描述',
    type TINYINT DEFAULT 1 COMMENT '房间类型: 1-开放工位区, 2-会议室, 3-休闲区, 4-私人房间',
    max_capacity INT DEFAULT 10 COMMENT '最大容纳人数',
    owner_id BIGINT UNSIGNED NOT NULL COMMENT '创建者ID',
    is_public TINYINT DEFAULT 1 COMMENT '是否公开: 1-公开, 0-私有',
    password VARCHAR(50) DEFAULT NULL COMMENT '房间密码(私有房间)',
    status TINYINT DEFAULT 1 COMMENT '状态: 1-正常, 0-关闭',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_owner_id (owner_id),
    INDEX idx_type (type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='房间表';

-- 工位表
CREATE TABLE IF NOT EXISTS seats (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    room_id BIGINT UNSIGNED NOT NULL COMMENT '房间ID',
    seat_number VARCHAR(20) NOT NULL COMMENT '工位编号',
    position_x INT DEFAULT 0 COMMENT 'X坐标(用于布局)',
    position_y INT DEFAULT 0 COMMENT 'Y坐标(用于布局)',
    user_id BIGINT UNSIGNED DEFAULT NULL COMMENT '当前使用者ID',
    is_occupied TINYINT DEFAULT 0 COMMENT '是否被占用: 1-是, 0-否',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_room_seat (room_id, seat_number),
    INDEX idx_room_id (room_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工位表';

-- 用户状态表
CREATE TABLE IF NOT EXISTS user_status (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE COMMENT '用户ID',
    online_status TINYINT DEFAULT 0 COMMENT '在线状态: 0-离线, 1-在线, 2-忙碌, 3-离开',
    busy_mode TINYINT DEFAULT 0 COMMENT '勿扰模式: 0-关闭, 1-开启',
    text_status VARCHAR(100) DEFAULT NULL COMMENT '文字状态',
    current_room_id BIGINT UNSIGNED DEFAULT NULL COMMENT '当前所在房间ID',
    current_seat_id BIGINT UNSIGNED DEFAULT NULL COMMENT '当前工位ID',
    last_heartbeat DATETIME DEFAULT NULL COMMENT '最后心跳时间',
    last_active_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '最后活跃时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_online_status (online_status),
    INDEX idx_last_heartbeat (last_heartbeat),
    INDEX idx_current_room_id (current_room_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户状态表';

-- 房间成员表
CREATE TABLE IF NOT EXISTS room_members (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    room_id BIGINT UNSIGNED NOT NULL COMMENT '房间ID',
    user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    role TINYINT DEFAULT 2 COMMENT '角色: 1-房主, 2-成员, 3-访客',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_room_user (room_id, user_id),
    INDEX idx_room_id (room_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='房间成员表';

-- 呼叫记录表
CREATE TABLE IF NOT EXISTS call_records (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    caller_id BIGINT UNSIGNED NOT NULL COMMENT '呼叫者ID',
    callee_id BIGINT UNSIGNED NOT NULL COMMENT '被呼叫者ID',
    room_id BIGINT UNSIGNED DEFAULT NULL COMMENT '呼叫所在房间ID',
    type TINYINT DEFAULT 1 COMMENT '呼叫类型: 1-语音呼叫, 2-视频呼叫, 3-屏幕共享',
    status TINYINT DEFAULT 1 COMMENT '状态: 1-呼叫中, 2-已接通, 3-已拒绝, 4-已取消, 5-勿扰拦截',
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME DEFAULT NULL COMMENT '结束时间',
    duration INT DEFAULT 0 COMMENT '通话时长(秒)',
    INDEX idx_caller_id (caller_id),
    INDEX idx_callee_id (callee_id),
    INDEX idx_status (status),
    INDEX idx_start_time (start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='呼叫记录表';

-- 消息表
CREATE TABLE IF NOT EXISTS messages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    room_id BIGINT UNSIGNED DEFAULT NULL COMMENT '房间ID(房间消息)',
    sender_id BIGINT UNSIGNED NOT NULL COMMENT '发送者ID',
    receiver_id BIGINT UNSIGNED DEFAULT NULL COMMENT '接收者ID(私聊消息)',
    type TINYINT DEFAULT 1 COMMENT '消息类型: 1-文本, 2-图片, 3-文件, 4-系统消息',
    content TEXT NOT NULL COMMENT '消息内容',
    is_read TINYINT DEFAULT 0 COMMENT '是否已读: 0-未读, 1-已读',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_room_id (room_id),
    INDEX idx_sender_id (sender_id),
    INDEX idx_receiver_id (receiver_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息表';

-- 活动动态表
CREATE TABLE IF NOT EXISTS activities (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    type TINYINT NOT NULL COMMENT '活动类型: 1-上线, 2-下线, 3-进入房间, 4-离开房间, 5-状态变更, 6-发起呼叫, 7-发送消息',
    content VARCHAR(255) DEFAULT NULL COMMENT '活动内容',
    room_id BIGINT UNSIGNED DEFAULT NULL COMMENT '相关房间ID',
    target_user_id BIGINT UNSIGNED DEFAULT NULL COMMENT '目标用户ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动动态表';

-- 插入初始数据
-- 测试用户 (密码: 123456, 使用 bcrypt 哈希)
INSERT INTO users (username, email, password_hash, nickname) VALUES
('user1', 'user1@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '张三'),
('user2', 'user2@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '李四'),
('user3', 'user3@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '王五'),
('user4', 'user4@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '赵六');

-- 初始化用户状态
INSERT INTO user_status (user_id, online_status, busy_mode) VALUES
(1, 0, 0),
(2, 0, 0),
(3, 0, 0),
(4, 0, 0);

-- 初始房间
INSERT INTO rooms (name, description, type, max_capacity, owner_id, is_public) VALUES
('开放办公区A', '主办公区域，适合日常工作交流', 1, 20, 1, 1),
('开放办公区B', '次办公区域', 1, 20, 1, 1),
('会议室1', '可容纳8人的小型会议室', 2, 8, 1, 1),
('会议室2', '可容纳12人的中型会议室', 2, 12, 1, 1),
('休闲区', '放松休息区域', 3, 15, 1, 1);

-- 初始工位 (开放办公区A)
INSERT INTO seats (room_id, seat_number, position_x, position_y) VALUES
(1, 'A-01', 50, 50),
(1, 'A-02', 150, 50),
(1, 'A-03', 250, 50),
(1, 'A-04', 350, 50),
(1, 'A-05', 50, 150),
(1, 'A-06', 150, 150),
(1, 'A-07', 250, 150),
(1, 'A-08', 350, 150);

-- 初始工位 (开放办公区B)
INSERT INTO seats (room_id, seat_number, position_x, position_y) VALUES
(2, 'B-01', 50, 50),
(2, 'B-02', 150, 50),
(2, 'B-03', 250, 50),
(2, 'B-04', 350, 50),
(2, 'B-05', 50, 150),
(2, 'B-06', 150, 150),
(2, 'B-07', 250, 150),
(2, 'B-08', 350, 150);
