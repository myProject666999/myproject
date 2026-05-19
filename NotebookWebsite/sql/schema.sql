CREATE DATABASE IF NOT EXISTS notebook_website DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE notebook_website;

DROP TABLE IF EXISTS recycle_bin;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS pages;
DROP TABLE IF EXISTS sections;
DROP TABLE IF EXISTS notebooks;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE notebooks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    sort_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sections (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    notebook_id BIGINT NOT NULL,
    parent_id BIGINT NULL,
    name VARCHAR(100) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (notebook_id) REFERENCES notebooks(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES sections(id) ON DELETE CASCADE,
    INDEX idx_notebook_id (notebook_id),
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE pages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    section_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content LONGTEXT,
    sort_order INT DEFAULT 0,
    is_favorite TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
    INDEX idx_section_id (section_id),
    INDEX idx_is_favorite (is_favorite),
    FULLTEXT KEY ft_title_content (title, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE favorites (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    page_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_page (user_id, page_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE recycle_bin (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    page_id BIGINT NOT NULL,
    section_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content LONGTEXT,
    deleted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO users (username, password, email) VALUES 
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin@example.com');

INSERT INTO notebooks (user_id, name, description, sort_order) VALUES 
(1, '工作笔记', '记录工作相关的内容', 1),
(1, '学习笔记', '记录学习相关的内容', 2);

INSERT INTO sections (notebook_id, parent_id, name, sort_order) VALUES 
(1, NULL, '项目文档', 1),
(1, NULL, '会议记录', 2),
(1, 1, '需求文档', 1),
(1, 1, '技术设计', 2),
(2, NULL, 'Java 学习', 1),
(2, NULL, 'Vue 学习', 2);

INSERT INTO pages (section_id, title, content, sort_order, is_favorite) VALUES 
(3, '项目需求说明书', '# 项目需求说明书\n\n## 功能概述\n\n这是一个笔记本网站项目，支持 Markdown 编辑。\n\n## 核心功能\n\n- 树形笔记本结构\n- Markdown 编辑器\n- 全文搜索\n- 回收站功能\n- 收藏夹功能', 1, 1),
(4, '系统架构设计', '# 系统架构设计\n\n## 技术栈\n\n- 后端：Spring Boot\n- 前端：Vue 3\n- 数据库：MySQL\n\n## 模块划分\n\n1. 用户模块\n2. 笔记本模块\n3. 分区模块\n4. 页面模块', 1, 0),
(2, '2024-01-15 项目会议', '# 项目会议记录\n\n**日期：** 2024-01-15\n\n## 议题\n\n1. 项目进度汇报\n2. 问题讨论\n3. 下周计划', 1, 0),
(5, 'Spring Boot 入门', '# Spring Boot 入门\n\n## 简介\n\nSpring Boot 简化了 Spring 应用的开发。\n\n```java\n@SpringBootApplication\npublic class Application {\n    public static void main(String[] args) {\n        SpringApplication.run(Application.class, args);\n    }\n}\n```', 1, 1),
(6, 'Vue 3 组合式 API', '# Vue 3 组合式 API\n\n## basic example\n\n```javascript\nimport { ref, reactive } from \'vue\'\n\nconst count = ref(0)\nconst state = reactive({ name: \'Vue\' })\n```', 1, 0);
