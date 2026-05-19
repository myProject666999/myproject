-- 创建数据库
CREATE DATABASE IF NOT EXISTS time_statistics DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE time_statistics;

-- 类别表
CREATE TABLE IF NOT EXISTS category (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL COMMENT '类别名称',
    type VARCHAR(20) NOT NULL COMMENT '类型：work/study/entertainment/other',
    color VARCHAR(20) DEFAULT '#1890ff' COMMENT '显示颜色',
    icon VARCHAR(50) DEFAULT 'clock' COMMENT '图标',
    sort_order INT DEFAULT 0 COMMENT '排序',
    is_deleted TINYINT DEFAULT 0 COMMENT '是否删除',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='时间类别表';

-- 时间记录表
CREATE TABLE IF NOT EXISTS time_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    category_id BIGINT NOT NULL COMMENT '类别ID',
    start_time DATETIME NOT NULL COMMENT '开始时间',
    end_time DATETIME NOT NULL COMMENT '结束时间',
    duration INT NOT NULL COMMENT '持续时长（分钟）',
    description VARCHAR(500) COMMENT '描述',
    record_date DATE NOT NULL COMMENT '记录日期（用于统计）',
    is_cross_day TINYINT DEFAULT 0 COMMENT '是否跨日',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_record_date (record_date),
    INDEX idx_category_id (category_id),
    INDEX idx_start_time (start_time),
    FOREIGN KEY (category_id) REFERENCES category(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='时间记录表';

-- 目标表
CREATE TABLE IF NOT EXISTS goal (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    category_id BIGINT COMMENT '类别ID，为空表示总目标',
    goal_type VARCHAR(20) NOT NULL COMMENT '目标类型：daily/weekly/monthly',
    target_minutes INT NOT NULL COMMENT '目标时长（分钟）',
    period VARCHAR(20) COMMENT '目标周期，如2024-01、2024-W01、2024-01-01',
    is_active TINYINT DEFAULT 1 COMMENT '是否启用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_goal_type (goal_type),
    INDEX idx_category_id (category_id),
    FOREIGN KEY (category_id) REFERENCES category(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='目标表';

-- 插入默认类别数据
INSERT INTO category (name, type, color, icon, sort_order) VALUES
('工作', 'work', '#f5222d', 'briefcase', 1),
('学习', 'study', '#1890ff', 'book', 2),
('娱乐', 'entertainment', '#52c41a', 'smile', 3),
('运动', 'other', '#fa8c16', 'fire', 4),
('休息', 'other', '#722ed1', 'coffee', 5),
('其他', 'other', '#8c8c8c', 'ellipsis', 6);

-- 插入示例目标
INSERT INTO goal (category_id, goal_type, target_minutes, is_active) VALUES
(NULL, 'daily', 480, 1),
(1, 'daily', 240, 1),
(2, 'daily', 120, 1);
