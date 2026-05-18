CREATE DATABASE IF NOT EXISTS diary_app DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE diary_app;

DROP TABLE IF EXISTS diary_tag;
DROP TABLE IF EXISTS mood_tag;
DROP TABLE IF EXISTS diary;
DROP TABLE IF EXISTS user;

CREATE TABLE user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    encryption_key VARCHAR(255) NOT NULL COMMENT '用于加密日记内容的密钥',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE diary (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL COMMENT '加密后的日记内容',
    mood_score INT NOT NULL COMMENT '情绪评分 1-10',
    mood_summary VARCHAR(500) COMMENT '情绪摘要，由AI或关键词生成',
    diary_date DATE NOT NULL COMMENT '日记日期',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_date (user_id, diary_date),
    INDEX idx_user_mood (user_id, mood_score),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='日记表';

CREATE TABLE mood_tag (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL COMMENT '情绪分类：积极/中性/消极',
    weight INT DEFAULT 0 COMMENT '情绪权重，用于计算情绪分数'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='情绪标签表';

CREATE TABLE diary_tag (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    diary_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    FOREIGN KEY (diary_id) REFERENCES diary(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES mood_tag(id) ON DELETE CASCADE,
    UNIQUE KEY uk_diary_tag (diary_id, tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='日记-标签关联表';

INSERT INTO mood_tag (name, category, weight) VALUES
('开心', '积极', 8),
('快乐', '积极', 9),
('兴奋', '积极', 9),
('满足', '积极', 7),
('幸福', '积极', 10),
('感恩', '积极', 8),
('期待', '积极', 7),
('平静', '中性', 5),
('放松', '中性', 6),
('无聊', '中性', 4),
('疲惫', '中性', 3),
('焦虑', '消极', 2),
('难过', '消极', 2),
('伤心', '消极', 1),
('愤怒', '消极', 1),
('沮丧', '消极', 1),
('压力', '消极', 2),
('失望', '消极', 2),
('孤独', '消极', 2),
('担忧', '消极', 3);

INSERT INTO user (username, password, encryption_key) VALUES
('test', '123456', 'diary-encryption-key-2024');
