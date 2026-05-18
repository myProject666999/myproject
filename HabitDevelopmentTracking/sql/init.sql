-- 创建数据库
CREATE DATABASE IF NOT EXISTS habit_tracking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE habit_tracking;

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    `username` VARCHAR(50) NOT NULL COMMENT '用户名',
    `nickname` VARCHAR(100) DEFAULT NULL COMMENT '昵称',
    `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 习惯表
CREATE TABLE IF NOT EXISTS `habit` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '习惯ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `name` VARCHAR(100) NOT NULL COMMENT '习惯名称',
    `icon` VARCHAR(50) DEFAULT NULL COMMENT '图标',
    `color` VARCHAR(20) DEFAULT '#1890ff' COMMENT '颜色',
    `description` VARCHAR(500) DEFAULT NULL COMMENT '描述',
    `target_days` INT DEFAULT 21 COMMENT '目标天数',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `is_active` TINYINT DEFAULT 1 COMMENT '是否启用 1:启用 0:禁用',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='习惯表';

-- 打卡记录表
CREATE TABLE IF NOT EXISTS `checkin_record` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '记录ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `habit_id` BIGINT NOT NULL COMMENT '习惯ID',
    `checkin_date` DATE NOT NULL COMMENT '打卡日期',
    `checkin_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '打卡时间',
    `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_habit_date` (`user_id`, `habit_id`, `checkin_date`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_habit_id` (`habit_id`),
    KEY `idx_checkin_date` (`checkin_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='打卡记录表';

-- 插入默认用户
INSERT INTO `user` (`username`, `nickname`) VALUES ('admin', '管理员') ON DUPLICATE KEY UPDATE `nickname` = '管理员';

-- 插入默认习惯
INSERT INTO `habit` (`user_id`, `name`, `icon`, `color`, `description`, `target_days`, `sort_order`) VALUES 
(1, '喝水', '💧', '#1890ff', '每天喝8杯水', 30, 1),
(1, '阅读', '📚', '#52c41a', '每天阅读30分钟', 21, 2),
(1, '运动', '🏃', '#fa8c16', '每天运动30分钟', 30, 3),
(1, '早睡', '😴', '#722ed1', '每天23点前睡觉', 21, 4)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 插入示例打卡数据（最近30天）
INSERT INTO `checkin_record` (`user_id`, `habit_id`, `checkin_date`, `checkin_time`, `remark`)
SELECT 
    1, 
    h.id, 
    DATE_SUB(CURDATE(), INTERVAL (t.n + (t2.n * 10)) DAY),
    DATE_SUB(NOW(), INTERVAL (t.n + (t2.n * 10)) DAY),
    '坚持打卡'
FROM 
    habit h
CROSS JOIN 
    (SELECT 0 as n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) t
CROSS JOIN 
    (SELECT 0 as n UNION SELECT 1 UNION SELECT 2) t2
WHERE 
    h.user_id = 1
    AND DATE_SUB(CURDATE(), INTERVAL (t.n + (t2.n * 10)) DAY) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    AND RAND() > 0.3
ON DUPLICATE KEY UPDATE `checkin_time` = VALUES(`checkin_time`);
