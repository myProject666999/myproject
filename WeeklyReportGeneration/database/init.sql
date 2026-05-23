-- 周报生成系统数据库脚本
CREATE DATABASE IF NOT EXISTS weekly_report DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE weekly_report;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    email VARCHAR(100) COMMENT '邮箱',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    avatar VARCHAR(255) COMMENT '头像URL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 模板表
CREATE TABLE IF NOT EXISTS templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '模板名称',
    description TEXT COMMENT '模板描述',
    content TEXT NOT NULL COMMENT '模板内容（支持变量替换）',
    variables JSON COMMENT '模板变量定义',
    is_default TINYINT DEFAULT 0 COMMENT '是否默认模板',
    created_by INT COMMENT '创建者ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='周报模板表';

-- 周报表
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL COMMENT '周报标题',
    content TEXT NOT NULL COMMENT '周报内容',
    week_start DATE NOT NULL COMMENT '周开始日期',
    week_end DATE NOT NULL COMMENT '周结束日期',
    template_id INT COMMENT '使用的模板ID',
    user_id INT NOT NULL COMMENT '用户ID',
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft' COMMENT '状态',
    ai_polished TINYINT DEFAULT 0 COMMENT '是否经过AI润色',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_week (week_start, week_end),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='周报表';

-- 数据源表（待办事项/Git提交）
CREATE TABLE IF NOT EXISTS data_sources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    source_type ENUM('manual', 'git', 'todo') NOT NULL COMMENT '数据源类型',
    title VARCHAR(200) NOT NULL COMMENT '标题',
    description TEXT COMMENT '详细描述',
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending' COMMENT '状态',
    commit_hash VARCHAR(100) COMMENT 'Git提交哈希',
    commit_message VARCHAR(500) COMMENT 'Git提交消息',
    commit_author VARCHAR(100) COMMENT 'Git提交作者',
    commit_date DATETIME COMMENT 'Git提交日期',
    repository VARCHAR(200) COMMENT 'Git仓库',
    branch VARCHAR(100) COMMENT 'Git分支',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium' COMMENT '优先级',
    due_date DATE COMMENT '截止日期',
    user_id INT NOT NULL COMMENT '用户ID',
    report_id INT COMMENT '关联的周报ID',
    week_start DATE NOT NULL COMMENT '所属周开始日期',
    week_end DATE NOT NULL COMMENT '所属周结束日期',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE SET NULL,
    INDEX idx_week (week_start, week_end),
    INDEX idx_user (user_id),
    INDEX idx_source_type (source_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据源表';

-- 周报-数据源关联表
CREATE TABLE IF NOT EXISTS report_data_sources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL COMMENT '周报ID',
    data_source_id INT NOT NULL COMMENT '数据源ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (data_source_id) REFERENCES data_sources(id) ON DELETE CASCADE,
    UNIQUE KEY uk_report_source (report_id, data_source_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='周报数据源关联表';

-- 插入默认用户
INSERT INTO users (username, email, password) VALUES 
('admin', 'admin@example.com', 'admin123')
ON DUPLICATE KEY UPDATE username=username;

-- 插入默认模板
INSERT INTO templates (name, description, content, variables, is_default, created_by) VALUES
('标准周报模板', '适用于一般团队的标准周报模板', 
'# 周报（{{week_start}} ~ {{week_end}}）

## 本周工作内容

{{#each completed_items}}
- {{this}}
{{/each}}

## 进行中工作

{{#each in_progress_items}}
- {{this}}
{{/each}}

## 下周计划

{{#each next_week_plan}}
- {{this}}
{{/each}}

## 问题与建议

{{issues_and_suggestions}}

## Git 提交记录

{{#each git_commits}}
- [{{this.short_hash}}] {{this.message}} ({{this.author}} @ {{this.date}})
{{/each}}',
JSON_OBJECT(
    'week_start', '周开始日期',
    'week_end', '周结束日期',
    'completed_items', '已完成工作列表',
    'in_progress_items', '进行中工作列表',
    'next_week_plan', '下周计划列表',
    'issues_and_suggestions', '问题与建议',
    'git_commits', 'Git提交记录列表'
),
1, 1),
('简洁周报模板', '简洁明了的周报模板',
'# 周报 - {{week_start}} 至 {{week_end}}

## 工作总结
{{summary}}

## 关键成果
{{#each achievements}}
- {{this}}
{{/each}}

## 下周目标
{{#each goals}}
- {{this}}
{{/each}}',
JSON_OBJECT(
    'week_start', '周开始日期',
    'week_end', '周结束日期',
    'summary', '工作总结',
    'achievements', '关键成果列表',
    'goals', '下周目标列表'
),
0, 1)
ON DUPLICATE KEY UPDATE name=name;
