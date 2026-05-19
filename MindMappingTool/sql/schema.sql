CREATE DATABASE IF NOT EXISTS mindmap DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE mindmap;

DROP TABLE IF EXISTS share;
DROP TABLE IF EXISTS mindmap;
DROP TABLE IF EXISTS user;

CREATE TABLE user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE mindmap (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(500),
    mindmap_data JSON NOT NULL,
    theme VARCHAR(50) DEFAULT 'primary',
    is_deleted TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE share (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    mindmap_id BIGINT NOT NULL,
    share_code VARCHAR(32) NOT NULL UNIQUE,
    view_count INT DEFAULT 0,
    expire_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_share_code (share_code),
    INDEX idx_mindmap_id (mindmap_id),
    FOREIGN KEY (mindmap_id) REFERENCES mindmap(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO user (username, password, nickname) VALUES 
('demo', '123456', '演示用户');

INSERT INTO mindmap (user_id, title, description, mindmap_data, theme) VALUES 
(1, '欢迎使用思维导图', '这是一个示例思维导图', 
'{"meta":{"name":"jsmind","version":"0.4.7"},"data":{"id":"root","topic":"思维导图中心","children":[{"id":"node1","topic":"节点一","children":[{"id":"node1-1","topic":"子节点A"},{"id":"node1-2","topic":"子节点B"}]},{"id":"node2","topic":"节点二"},{"id":"node3","topic":"节点三"}]}}', 
'primary');

INSERT INTO share (mindmap_id, share_code) VALUES 
(1, 'demo123');
