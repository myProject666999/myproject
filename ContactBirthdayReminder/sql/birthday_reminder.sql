CREATE DATABASE IF NOT EXISTS birthday_reminder DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE birthday_reminder;

DROP TABLE IF EXISTS greeting_card;
DROP TABLE IF EXISTS reminder_setting;
DROP TABLE IF EXISTS contact;
DROP TABLE IF EXISTS user;

CREATE TABLE user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    nickname VARCHAR(50),
    email VARCHAR(100),
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE contact (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    name VARCHAR(50) NOT NULL,
    gender TINYINT DEFAULT 0 COMMENT '0-未知 1-男 2-女',
    phone VARCHAR(20),
    email VARCHAR(100),
    birthday DATE NOT NULL,
    calendar_type TINYINT NOT NULL DEFAULT 1 COMMENT '1-公历 2-农历',
    lunar_month INT,
    lunar_day INT,
    is_leap TINYINT DEFAULT 0 COMMENT '0-否 1-是（农历闰月）',
    relation VARCHAR(20) COMMENT '关系：朋友、家人、同事等',
    remark VARCHAR(500),
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_birthday (birthday),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='联系人表';

CREATE TABLE reminder_setting (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    contact_id BIGINT,
    remind_days INT NOT NULL DEFAULT 7 COMMENT '提前N天提醒',
    remind_type TINYINT NOT NULL DEFAULT 1 COMMENT '1-系统通知 2-邮件 3-短信',
    is_enabled TINYINT DEFAULT 1 COMMENT '0-禁用 1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_contact_id (contact_id),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (contact_id) REFERENCES contact(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='提醒设置表';

CREATE TABLE greeting_card (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    template_content TEXT NOT NULL,
    cover_image VARCHAR(255),
    category VARCHAR(50) COMMENT '分类：生日、节日等',
    is_default TINYINT DEFAULT 0 COMMENT '0-否 1-是',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='贺卡模板表';

INSERT INTO user (username, password, nickname, email) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '管理员', 'admin@example.com');

INSERT INTO greeting_card (name, template_content, category, is_default) VALUES
('生日快乐-简约版', '<div class="card"><h1>生日快乐！</h1><p>愿你的每一天都充满阳光和快乐！</p><p>生日快乐，亲爱的{name}！</p></div>', '生日', 1),
('生日快乐-温馨版', '<div class="card warm"><h1>🎂 生日快乐 🎂</h1><p>在这个特别的日子里，</p><p>愿所有的快乐、所有的幸福、所有的温馨、所有的好运围绕在你身边。</p><p>祝你生日快乐，{name}！</p></div>', '生日', 1),
('生日快乐-活泼版', '<div class="card lively"><h1>🎉 Happy Birthday 🎉</h1><p>又长大了一岁啦！</p><p>希望{name}新的一岁：</p><p>开开心心🥰 顺顺利利✨ 暴富暴美💖</p></div>', '生日', 1);
