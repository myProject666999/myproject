CREATE DATABASE IF NOT EXISTS script_management DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE script_management;

INSERT IGNORE INTO users (id, username, password, nickname, role, email, created_at, updated_at) VALUES
(1, 'admin', '$2a$14$placeholder_hashed_password_here', '管理员', 'admin', 'admin@example.com', NOW(), NOW());

INSERT IGNORE INTO script_types (id, name, `desc`, created_at, updated_at) VALUES
(1, '恐怖', '惊悚恐怖类剧本', NOW(), NOW()),
(2, '推理', '烧脑推理类剧本', NOW(), NOW()),
(3, '情感', '情感沉浸类剧本', NOW(), NOW()),
(4, '欢乐', '欢乐搞笑类剧本', NOW(), NOW()),
(5, '机制', '机制阵营类剧本', NOW(), NOW());
