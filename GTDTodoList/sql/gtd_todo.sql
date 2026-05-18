CREATE DATABASE IF NOT EXISTS gtd_todo DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE gtd_todo;

DROP TABLE IF EXISTS task_contexts;
DROP TABLE IF EXISTS weekly_reviews;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS contexts;
DROP TABLE IF EXISTS inbox_items;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE inbox_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    processed TINYINT(1) DEFAULT 0,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE projects (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(20) DEFAULT '#3B82F6',
    sort_order INT DEFAULT 0,
    is_archived TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE contexts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    name VARCHAR(50) NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(20) DEFAULT '#10B981',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    UNIQUE KEY uk_user_context (user_id, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE tasks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    project_id BIGINT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_urgent TINYINT(1) DEFAULT 0,
    is_important TINYINT(1) DEFAULT 0,
    due_date DATE,
    completed TINYINT(1) DEFAULT 0,
    completed_at TIMESTAMP NULL,
    sort_order INT DEFAULT 0,
    estimated_time INT,
    actual_time INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_project_id (project_id),
    INDEX idx_due_date (due_date),
    INDEX idx_completed (completed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE task_contexts (
    task_id BIGINT NOT NULL,
    context_id BIGINT NOT NULL,
    PRIMARY KEY (task_id, context_id),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (context_id) REFERENCES contexts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE weekly_reviews (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    review_date DATE NOT NULL,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    tasks_completed INT DEFAULT 0,
    tasks_created INT DEFAULT 0,
    inbox_processed INT DEFAULT 0,
    projects_active INT DEFAULT 0,
    summary TEXT,
    next_week_goals TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_review_date (review_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO users (username, password, email) VALUES 
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'admin@example.com');

INSERT INTO contexts (user_id, name, icon, color) VALUES 
(1, '办公室', '💼', '#3B82F6'),
(1, '家里', '🏠', '#10B981'),
(1, '外出', '🚗', '#F59E0B'),
(1, '电话', '📞', '#EF4444'),
(1, '电脑', '💻', '#8B5CF6');

INSERT INTO projects (user_id, name, description, color, sort_order) VALUES 
(1, '工作项目', '日常工作相关任务', '#3B82F6', 1),
(1, '个人成长', '学习和自我提升', '#10B981', 2),
(1, '家庭生活', '家庭相关事务', '#F59E0B', 3),
(1, '健康运动', '健身和健康管理', '#EF4444', 4);

INSERT INTO inbox_items (user_id, title, description, sort_order) VALUES 
(1, '整理桌面', '需要整理一下办公桌', 1),
(1, '学习Vue3', '学习Vue3的新特性', 2),
(1, '买生活用品', '牙膏、洗发水等', 3),
(1, '写周报', '本周工作总结', 4);

INSERT INTO tasks (user_id, project_id, title, description, is_urgent, is_important, due_date, sort_order, estimated_time) VALUES 
(1, 1, '完成项目文档', '编写项目需求文档', 1, 1, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 1, 120),
(1, 1, '代码审查', '审查团队成员的代码', 0, 1, DATE_ADD(CURDATE(), INTERVAL 3 DAY), 2, 60),
(1, 2, '阅读技术书籍', '每周阅读技术书籍至少2小时', 0, 1, DATE_ADD(CURDATE(), INTERVAL 7 DAY), 3, 120),
(1, 3, '周末大扫除', '每周六进行家庭大扫除', 0, 0, DATE_ADD(CURDATE(), INTERVAL 5 DAY), 4, 180),
(1, 4, '跑步3公里', '每周至少跑步3次', 0, 1, CURDATE(), 5, 30);

INSERT INTO task_contexts (task_id, context_id) VALUES 
(1, 1), (1, 5),
(2, 1), (2, 5),
(3, 2), (3, 5),
(4, 2),
(5, 3);
