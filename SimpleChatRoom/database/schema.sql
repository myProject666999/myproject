CREATE DATABASE IF NOT EXISTS simple_chat_room DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE simple_chat_room;

CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR(36) PRIMARY KEY COMMENT '房间ID (UUID)',
    name VARCHAR(100) NOT NULL COMMENT '房间名称',
    creator_nickname VARCHAR(50) NOT NULL COMMENT '创建者昵称',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    expires_at DATETIME COMMENT '过期时间',
    is_destroyed TINYINT(1) DEFAULT 0 COMMENT '是否已销毁 0-否 1-是'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='聊天室房间表';

CREATE TABLE IF NOT EXISTS messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '消息ID',
    room_id VARCHAR(36) NOT NULL COMMENT '房间ID',
    nickname VARCHAR(50) NOT NULL COMMENT '发送者昵称',
    content TEXT COMMENT '文字内容',
    image_url VARCHAR(500) COMMENT '图片URL',
    message_type TINYINT(1) NOT NULL DEFAULT 1 COMMENT '消息类型 1-文字 2-图片',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '发送时间',
    INDEX idx_room_id (room_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='聊天消息表';
