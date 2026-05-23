-- =============================================
-- 在线问卷调查与统计系统 数据库脚本
-- 数据库: MySQL 8.0+
-- =============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS questionnaire_survey DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE questionnaire_survey;

-- =============================================
-- 1. 用户表
-- =============================================
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    `username` VARCHAR(50) NOT NULL COMMENT '用户名',
    `password` VARCHAR(100) NOT NULL COMMENT '密码',
    `nickname` VARCHAR(50) NOT NULL COMMENT '昵称',
    `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
    `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 1-正常, 0-禁用',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`),
    KEY `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- =============================================
-- 2. 问卷表
-- =============================================
DROP TABLE IF EXISTS `survey`;
CREATE TABLE `survey` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '问卷ID',
    `title` VARCHAR(200) NOT NULL COMMENT '问卷标题',
    `description` TEXT DEFAULT NULL COMMENT '问卷描述',
    `cover_image` VARCHAR(255) DEFAULT NULL COMMENT '封面图片',
    `user_id` BIGINT NOT NULL COMMENT '创建用户ID',
    `status` TINYINT DEFAULT 0 COMMENT '状态: 0-草稿, 1-已发布, 2-已结束',
    `start_time` DATETIME DEFAULT NULL COMMENT '开始时间',
    `end_time` DATETIME DEFAULT NULL COMMENT '结束时间',
    `is_anonymous` TINYINT DEFAULT 1 COMMENT '是否匿名: 1-匿名, 0-需要登录',
    `max_responses` INT DEFAULT -1 COMMENT '最大填写数, -1表示无限制',
    `response_count` INT DEFAULT 0 COMMENT '已填写数',
    `view_count` INT DEFAULT 0 COMMENT '浏览数',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_status` (`status`),
    KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='问卷表';

-- =============================================
-- 3. 问卷题目表 (使用 JSON 存储题目配置)
-- =============================================
DROP TABLE IF EXISTS `survey_question`;
CREATE TABLE `survey_question` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '题目ID',
    `survey_id` BIGINT NOT NULL COMMENT '问卷ID',
    `question_type` VARCHAR(30) NOT NULL COMMENT '题目类型: single/multi/input/score/matrix/rating/date/file',
    `title` VARCHAR(500) NOT NULL COMMENT '题目标题',
    `description` VARCHAR(500) DEFAULT NULL COMMENT '题目描述/说明',
    `required` TINYINT DEFAULT 1 COMMENT '是否必填: 1-必填, 0-非必填',
    `sort_order` INT DEFAULT 0 COMMENT '排序号',
    `config` JSON DEFAULT NULL COMMENT '题目配置(JSON): 选项、评分范围、矩阵行列等',
    `logic_config` JSON DEFAULT NULL COMMENT '逻辑跳转配置(JSON)',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
    PRIMARY KEY (`id`),
    KEY `idx_survey_id` (`survey_id`),
    KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='问卷题目表';

-- =============================================
-- 4. 问卷答卷表
-- =============================================
DROP TABLE IF EXISTS `survey_response`;
CREATE TABLE `survey_response` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '答卷ID',
    `survey_id` BIGINT NOT NULL COMMENT '问卷ID',
    `user_id` BIGINT DEFAULT NULL COMMENT '填写用户ID(匿名时为空)',
    `ip_address` VARCHAR(50) DEFAULT NULL COMMENT 'IP地址',
    `user_agent` VARCHAR(500) DEFAULT NULL COMMENT '浏览器UA',
    `device_id` VARCHAR(100) DEFAULT NULL COMMENT '设备ID',
    `submit_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间',
    `duration` INT DEFAULT NULL COMMENT '填写时长(秒)',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 1-有效, 0-无效',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_survey_id` (`survey_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_submit_time` (`submit_time`),
    KEY `idx_ip_address` (`ip_address`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='问卷答卷表';

-- =============================================
-- 5. 问卷答案表
-- =============================================
DROP TABLE IF EXISTS `survey_answer`;
CREATE TABLE `survey_answer` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '答案ID',
    `response_id` BIGINT NOT NULL COMMENT '答卷ID',
    `survey_id` BIGINT NOT NULL COMMENT '问卷ID',
    `question_id` BIGINT NOT NULL COMMENT '题目ID',
    `question_type` VARCHAR(30) NOT NULL COMMENT '题目类型',
    `answer_content` JSON DEFAULT NULL COMMENT '答案内容(JSON)',
    `answer_text` TEXT DEFAULT NULL COMMENT '答案文本(用于搜索)',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_response_id` (`response_id`),
    KEY `idx_question_id` (`question_id`),
    KEY `idx_survey_id` (`survey_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='问卷答案表';

-- =============================================
-- 初始化数据: 默认管理员用户
-- =============================================
INSERT INTO `sys_user` (`username`, `password`, `nickname`, `email`) VALUES
('admin', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '系统管理员', 'admin@example.com');
-- 密码: admin123

-- =============================================
-- 示例问卷数据
-- =============================================
INSERT INTO `survey` (`title`, `description`, `user_id`, `status`, `start_time`, `is_anonymous`, `max_responses`) VALUES
('用户体验满意度调查', '感谢您参与本次调查，您的反馈对我们非常重要！', 1, 1, NOW(), 1, 1000);

INSERT INTO `survey_question` (`survey_id`, `question_type`, `title`, `required`, `sort_order`, `config`) VALUES
(1, 'single', '您的性别？', 1, 1, '{"options":[{"id":1,"text":"男"},{"id":2,"text":"女"},{"id":3,"text":"保密"}]}'),
(1, 'single', '您的年龄段？', 1, 2, '{"options":[{"id":1,"text":"18岁以下"},{"id":2,"text":"18-25岁"},{"id":3,"text":"26-35岁"},{"id":4,"text":"36-45岁"},{"id":5,"text":"46岁以上"}]}'),
(1, 'multi', '您通常使用我们产品的哪些功能？（多选）', 0, 3, '{"options":[{"id":1,"text":"数据查询"},{"id":2,"text":"报表生成"},{"id":3,"text":"系统设置"},{"id":4,"text":"消息通知"},{"id":5,"text":"其他"}]}'),
(1, 'input', '您对产品的整体满意度如何？请简述原因', 0, 4, '{"placeholder":"请输入您的意见...","maxLength":500}'),
(1, 'score', '请对以下各项进行评分（1-5分）', 1, 5, '{"min":1,"max":5,"items":[{"id":1,"text":"功能完整性"},{"id":2,"text":"界面友好度"},{"id":3,"text":"响应速度"},{"id":4,"text":"稳定性"}]}'),
(1, 'rating', '您愿意将我们的产品推荐给朋友吗？', 1, 6, '{"min":0,"max":10,"description":"0=完全不愿意，10=非常愿意"}'),
(1, 'date', '您开始使用我们产品的时间？', 0, 7, '{"format":"YYYY-MM-DD"}');
