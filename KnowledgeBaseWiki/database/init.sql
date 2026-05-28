CREATE DATABASE IF NOT EXISTS knowledge_base_wiki DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE knowledge_base_wiki;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    avatar VARCHAR(255),
    status TINYINT DEFAULT 1 COMMENT '1:正常 0:禁用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS spaces (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    color VARCHAR(20),
    owner_id BIGINT NOT NULL,
    is_public TINYINT DEFAULT 0 COMMENT '1:公开 0:私有',
    status TINYINT DEFAULT 1 COMMENT '1:正常 0:已删除',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id),
    INDEX idx_owner (owner_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS space_members (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    space_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(20) NOT NULL COMMENT 'owner:所有者 admin:管理员 editor:编辑者 viewer:查看者',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (space_id) REFERENCES spaces(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY uk_space_user (space_id, user_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS documents (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    space_id BIGINT NOT NULL,
    parent_id BIGINT DEFAULT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    content_html TEXT,
    path VARCHAR(500),
    depth INT DEFAULT 0,
    sort_order INT DEFAULT 0,
    creator_id BIGINT NOT NULL,
    last_editor_id BIGINT,
    version INT DEFAULT 1,
    is_folder TINYINT DEFAULT 0 COMMENT '1:文件夹 0:文档',
    status TINYINT DEFAULT 1 COMMENT '1:正常 0:已删除',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    FOREIGN KEY (space_id) REFERENCES spaces(id),
    FOREIGN KEY (parent_id) REFERENCES documents(id),
    FOREIGN KEY (creator_id) REFERENCES users(id),
    FOREIGN KEY (last_editor_id) REFERENCES users(id),
    INDEX idx_space (space_id),
    INDEX idx_parent (parent_id),
    INDEX idx_creator (creator_id),
    INDEX idx_status (status),
    INDEX idx_path (path),
    FULLTEXT INDEX ft_title_content (title, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS document_versions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    document_id BIGINT NOT NULL,
    version INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    content_html TEXT,
    editor_id BIGINT NOT NULL,
    edit_summary VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id),
    FOREIGN KEY (editor_id) REFERENCES users(id),
    UNIQUE KEY uk_doc_version (document_id, version),
    INDEX idx_document (document_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS comments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    document_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    parent_id BIGINT DEFAULT NULL,
    content TEXT NOT NULL,
    status TINYINT DEFAULT 1 COMMENT '1:正常 0:已删除',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (parent_id) REFERENCES comments(id),
    INDEX idx_document (document_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS document_permissions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    document_id BIGINT NOT NULL,
    user_id BIGINT,
    role VARCHAR(20) COMMENT 'editor:编辑者 viewer:查看者',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY uk_doc_user (document_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS search_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    keyword VARCHAR(255) NOT NULL,
    search_count INT DEFAULT 1,
    last_search_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_keyword (user_id, keyword)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO users (username, email, password_hash, nickname, status) VALUES
('admin', 'admin@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '系统管理员', 1),
('demo', 'demo@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '演示用户', 1);

INSERT INTO spaces (name, description, owner_id, is_public, status) VALUES
('团队知识库', '团队公共文档和知识库', 1, 1, 1),
('产品文档', '产品需求和设计文档', 1, 0, 1);

INSERT INTO space_members (space_id, user_id, role) VALUES
(1, 1, 'owner'),
(1, 2, 'editor'),
(2, 1, 'owner'),
(2, 2, 'viewer');

INSERT INTO documents (space_id, parent_id, title, content, path, depth, sort_order, creator_id, last_editor_id, is_folder, status) VALUES
(1, NULL, '快速开始', '## 欢迎使用知识库\n\n这是一个功能强大的团队知识库系统。', '/快速开始', 0, 1, 1, 1, 0, 1),
(1, NULL, '团队规范', '## 团队规范目录', '/团队规范', 0, 2, 1, 1, 1, 1),
(1, 2, '代码规范', '## Java代码规范\n\n1. 使用驼峰命名法\n2. 类名首字母大写', '/团队规范/代码规范', 1, 1, 1, 1, 0, 1),
(1, 2, '文档规范', '## 文档编写规范\n\n1. 使用Markdown格式\n2. 标题层级清晰', '/团队规范/文档规范', 1, 2, 1, 1, 0, 1);

INSERT INTO document_versions (document_id, version, title, content, content_html, editor_id, edit_summary) VALUES
(1, 1, '快速开始', '## 欢迎使用知识库\n\n这是一个功能强大的团队知识库系统。', '<h2>欢迎使用知识库</h2><p>这是一个功能强大的团队知识库系统。</p>', 1, '初始版本'),
(3, 1, '代码规范', '## Java代码规范\n\n1. 使用驼峰命名法\n2. 类名首字母大写', '<h2>Java代码规范</h2><ol><li>使用驼峰命名法</li><li>类名首字母大写</li></ol>', 1, '初始版本'),
(4, 1, '文档规范', '## 文档编写规范\n\n1. 使用Markdown格式\n2. 标题层级清晰', '<h2>文档编写规范</h2><ol><li>使用Markdown格式</li><li>标题层级清晰</li></ol>', 1, '初始版本');

INSERT INTO comments (document_id, user_id, parent_id, content, status) VALUES
(1, 2, NULL, '文档写得很清晰，赞！', 1),
(3, 2, NULL, '建议补充一些代码示例', 1);
