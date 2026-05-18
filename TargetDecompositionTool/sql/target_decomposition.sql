-- 目标分解工具数据库脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS target_decomposition DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE target_decomposition;

-- 目标表
CREATE TABLE IF NOT EXISTS `target` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `parent_id` BIGINT DEFAULT NULL COMMENT '父目标ID，顶级目标为NULL',
    `title` VARCHAR(200) NOT NULL COMMENT '目标标题',
    `description` TEXT COMMENT '目标描述',
    `progress` DECIMAL(5,2) DEFAULT 0.00 COMMENT '进度百分比0-100',
    `status` TINYINT DEFAULT 1 COMMENT '状态：1-进行中，2-已完成，3-已暂停，4-已归档',
    `priority` TINYINT DEFAULT 2 COMMENT '优先级：1-高，2-中，3-低',
    `start_date` DATE COMMENT '开始日期',
    `end_date` DATE COMMENT '结束日期',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `is_deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_parent_id` (`parent_id`),
    KEY `idx_status` (`status`),
    KEY `idx_is_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='目标表';

-- 目标闭包表（用于高效查询树形结构）
CREATE TABLE IF NOT EXISTS `target_closure` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `ancestor_id` BIGINT NOT NULL COMMENT '祖先节点ID',
    `descendant_id` BIGINT NOT NULL COMMENT '后代节点ID',
    `distance` INT NOT NULL COMMENT '距离（直接子节点为1）',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ancestor_descendant` (`ancestor_id`, `descendant_id`),
    KEY `idx_ancestor_id` (`ancestor_id`),
    KEY `idx_descendant_id` (`descendant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='目标闭包表';

-- 里程碑表
CREATE TABLE IF NOT EXISTS `milestone` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `target_id` BIGINT NOT NULL COMMENT '目标ID',
    `title` VARCHAR(200) NOT NULL COMMENT '里程碑标题',
    `description` TEXT COMMENT '里程碑描述',
    `due_date` DATE COMMENT '截止日期',
    `is_completed` TINYINT DEFAULT 0 COMMENT '是否完成：0-未完成，1-已完成',
    `completed_at` DATETIME COMMENT '完成时间',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `is_deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_target_id` (`target_id`),
    KEY `idx_is_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑表';

-- 复盘记录表
CREATE TABLE IF NOT EXISTS `review` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `target_id` BIGINT NOT NULL COMMENT '目标ID',
    `title` VARCHAR(200) NOT NULL COMMENT '复盘标题',
    `content` TEXT COMMENT '复盘内容',
    `review_date` DATE COMMENT '复盘日期',
    `progress_before` DECIMAL(5,2) DEFAULT 0.00 COMMENT '复盘前进度',
    `progress_after` DECIMAL(5,2) DEFAULT 0.00 COMMENT '复盘后进度',
    `problems` TEXT COMMENT '遇到的问题',
    `solutions` TEXT COMMENT '解决方案',
    `next_steps` TEXT COMMENT '下一步计划',
    `is_deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_target_id` (`target_id`),
    KEY `idx_review_date` (`review_date`),
    KEY `idx_is_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='复盘记录表';

-- 进度历史表（用于进度回溯）
CREATE TABLE IF NOT EXISTS `progress_history` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `target_id` BIGINT NOT NULL COMMENT '目标ID',
    `progress` DECIMAL(5,2) NOT NULL COMMENT '进度值',
    `change_reason` VARCHAR(500) COMMENT '变更原因',
    `record_date` DATE NOT NULL COMMENT '记录日期',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_target_id` (`target_id`),
    KEY `idx_record_date` (`record_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='进度历史表';

-- 插入测试数据
INSERT INTO `target` (`id`, `parent_id`, `title`, `description`, `progress`, `status`, `priority`, `start_date`, `end_date`, `sort_order`) VALUES
(1, NULL, '完成2026年度目标', '2026年个人发展总目标', 25.00, 1, 1, '2026-01-01', '2026-12-31', 1),
(2, 1, '提升技术能力', '学习新技术，提升专业水平', 30.00, 1, 1, '2026-01-01', '2026-06-30', 1),
(3, 1, '锻炼身体', '保持健康，增强体质', 20.00, 1, 2, '2026-01-01', '2026-12-31', 2),
(4, 2, '学习Spring Boot', '深入学习Spring Boot框架', 40.00, 1, 1, '2026-01-01', '2026-03-31', 1),
(5, 2, '学习Vue.js', '掌握Vue3前端框架', 20.00, 1, 1, '2026-02-01', '2026-04-30', 2),
(6, 4, '完成Spring Boot实战项目', '动手做一个实际项目', 10.00, 1, 1, '2026-02-15', '2026-03-31', 1);

-- 初始化闭包表数据
INSERT INTO `target_closure` (`ancestor_id`, `descendant_id`, `distance`) VALUES
(1, 1, 0),
(1, 2, 1),
(1, 3, 1),
(1, 4, 2),
(1, 5, 2),
(1, 6, 3),
(2, 2, 0),
(2, 4, 1),
(2, 5, 1),
(2, 6, 2),
(3, 3, 0),
(4, 4, 0),
(4, 6, 1),
(5, 5, 0),
(6, 6, 0);

-- 插入里程碑数据
INSERT INTO `milestone` (`target_id`, `title`, `description`, `due_date`, `is_completed`, `sort_order`) VALUES
(4, '完成Spring Boot基础学习', '掌握Spring Boot核心概念', '2026-02-15', 1, 1),
(4, '完成RESTful API开发', '独立开发一套完整的API', '2026-03-15', 0, 2),
(4, '完成项目部署上线', '将项目部署到服务器', '2026-03-31', 0, 3),
(5, '掌握Vue3组合式API', '熟练使用setup语法糖', '2026-03-15', 0, 1),
(5, '完成Vue实战项目', '开发一个前端项目', '2026-04-30', 0, 2);

-- 插入复盘记录
INSERT INTO `review` (`target_id`, `title`, `content`, `review_date`, `progress_before`, `progress_after`, `problems`, `solutions`, `next_steps`) VALUES
(4, '2月第一周复盘', '本周学习了Spring Boot基础，进度不错。', '2026-02-07', 0.00, 30.00, '对自动配置原理理解不够深入', '看源码和官方文档加深理解', '继续学习Spring Boot数据访问'),
(4, '2月第二周复盘', '学习了Spring Data JPA的使用。', '2026-02-14', 30.00, 40.00, '多表关联查询有些复杂', '多练习复杂查询案例', '开始做实战项目');

-- 插入进度历史
INSERT INTO `progress_history` (`target_id`, `progress`, `change_reason`, `record_date`) VALUES
(4, 0.00, '目标创建', '2026-01-01'),
(4, 30.00, '完成基础学习', '2026-02-07'),
(4, 40.00, '完成JPA学习', '2026-02-14');
