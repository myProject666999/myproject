-- ============================================================
-- 智能客服工单系统数据库脚本
-- 数据库: smart_customer_service
-- 字符集: utf8mb4
-- ============================================================

CREATE DATABASE IF NOT EXISTS `smart_customer_service` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE `smart_customer_service`;

-- ============================================================
-- 1. 用户表 (客户 + 客服 + 管理员)
-- ============================================================
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    `username` VARCHAR(64) NOT NULL COMMENT '用户名',
    `password` VARCHAR(255) NOT NULL COMMENT '密码(加密)',
    `real_name` VARCHAR(64) DEFAULT NULL COMMENT '真实姓名',
    `email` VARCHAR(128) DEFAULT NULL COMMENT '邮箱',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
    `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
    `role` TINYINT NOT NULL DEFAULT 1 COMMENT '角色: 1-客户 2-客服 3-管理员',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用 1-正常',
    `department` VARCHAR(128) DEFAULT NULL COMMENT '所属部门(客服)',
    `skill_tags` VARCHAR(512) DEFAULT NULL COMMENT '技能标签(客服),逗号分隔',
    `online_status` TINYINT NOT NULL DEFAULT 0 COMMENT '在线状态: 0-离线 1-在线 2-忙碌 3-离开',
    `last_online_at` DATETIME DEFAULT NULL COMMENT '最后在线时间',
    `ticket_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '处理工单总数(客服)',
    `resolved_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '已解决工单数(客服)',
    `avg_response_time` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '平均响应时长(秒)(客服)',
    `avg_resolve_time` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '平均解决时长(秒)(客服)',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`),
    KEY `idx_role` (`role`),
    KEY `idx_online_status` (`online_status`),
    KEY `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ============================================================
-- 2. 工单分类表
-- ============================================================
DROP TABLE IF EXISTS `ticket_category`;
CREATE TABLE `ticket_category` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '分类ID',
    `name` VARCHAR(64) NOT NULL COMMENT '分类名称',
    `parent_id` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '父分类ID,0为顶级',
    `description` VARCHAR(255) DEFAULT NULL COMMENT '分类描述',
    `sort` INT NOT NULL DEFAULT 0 COMMENT '排序',
    `icon` VARCHAR(255) DEFAULT NULL COMMENT '图标',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用 1-正常',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单分类表';

-- ============================================================
-- 3. 工单优先级表
-- ============================================================
DROP TABLE IF EXISTS `ticket_priority`;
CREATE TABLE `ticket_priority` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '优先级ID',
    `name` VARCHAR(32) NOT NULL COMMENT '优先级名称',
    `level` INT NOT NULL COMMENT '优先级级别,数字越大优先级越高',
    `color` VARCHAR(16) DEFAULT NULL COMMENT '颜色标识',
    `response_timeout` INT NOT NULL DEFAULT 3600 COMMENT '响应超时时间(秒)',
    `resolve_timeout` INT NOT NULL DEFAULT 86400 COMMENT '解决超时时间(秒)',
    `sort` INT NOT NULL DEFAULT 0 COMMENT '排序',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用 1-正常',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_level` (`level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单优先级表';

-- ============================================================
-- 4. 工单状态表
-- ============================================================
DROP TABLE IF EXISTS `ticket_status`;
CREATE TABLE `ticket_status` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '状态ID',
    `code` VARCHAR(32) NOT NULL COMMENT '状态编码',
    `name` VARCHAR(64) NOT NULL COMMENT '状态名称',
    `color` VARCHAR(16) DEFAULT NULL COMMENT '颜色标识',
    `is_initial` TINYINT NOT NULL DEFAULT 0 COMMENT '是否初始状态: 0-否 1-是',
    `is_final` TINYINT NOT NULL DEFAULT 0 COMMENT '是否终态: 0-否 1-是',
    `sort` INT NOT NULL DEFAULT 0 COMMENT '排序',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用 1-正常',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单状态表';

-- ============================================================
-- 5. 工单状态流转规则表 (状态机配置)
-- ============================================================
DROP TABLE IF EXISTS `ticket_status_transition`;
CREATE TABLE `ticket_status_transition` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `from_status` VARCHAR(32) NOT NULL COMMENT '起始状态编码',
    `to_status` VARCHAR(32) NOT NULL COMMENT '目标状态编码',
    `action` VARCHAR(32) NOT NULL COMMENT '操作动作',
    `action_name` VARCHAR(64) NOT NULL COMMENT '操作名称',
    `allowed_roles` VARCHAR(64) NOT NULL DEFAULT '1,2,3' COMMENT '允许操作的角色,逗号分隔',
    `description` VARCHAR(255) DEFAULT NULL COMMENT '描述',
    `sort` INT NOT NULL DEFAULT 0 COMMENT '排序',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_from_status` (`from_status`),
    KEY `idx_to_status` (`to_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单状态流转规则表';

-- ============================================================
-- 6. 工单主表
-- ============================================================
DROP TABLE IF EXISTS `ticket`;
CREATE TABLE `ticket` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '工单ID',
    `ticket_no` VARCHAR(32) NOT NULL COMMENT '工单编号',
    `title` VARCHAR(255) NOT NULL COMMENT '工单标题',
    `content` TEXT NOT NULL COMMENT '工单内容',
    `category_id` BIGINT UNSIGNED NOT NULL COMMENT '分类ID',
    `priority_id` BIGINT UNSIGNED NOT NULL COMMENT '优先级ID',
    `status_code` VARCHAR(32) NOT NULL COMMENT '当前状态编码',
    `customer_id` BIGINT UNSIGNED NOT NULL COMMENT '客户用户ID',
    `assignee_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '分配客服ID',
    `source` VARCHAR(32) NOT NULL DEFAULT 'web' COMMENT '来源: web-网页 app-APP api-API email-邮件',
    `channel` VARCHAR(32) NOT NULL DEFAULT 'online' COMMENT '渠道: online-在线 phone-电话 email-邮件',
    `tags` VARCHAR(255) DEFAULT NULL COMMENT '标签,逗号分隔',
    `satisfaction_score` TINYINT DEFAULT NULL COMMENT '满意度评分: 1-5',
    `satisfaction_comment` VARCHAR(500) DEFAULT NULL COMMENT '满意度评价',
    `first_response_at` DATETIME DEFAULT NULL COMMENT '首次响应时间',
    `assigned_at` DATETIME DEFAULT NULL COMMENT '分配时间',
    `resolved_at` DATETIME DEFAULT NULL COMMENT '解决时间',
    `closed_at` DATETIME DEFAULT NULL COMMENT '关闭时间',
    `response_timeout_at` DATETIME DEFAULT NULL COMMENT '响应超时时间',
    `resolve_timeout_at` DATETIME DEFAULT NULL COMMENT '解决超时时间',
    `is_timeout_warned` TINYINT NOT NULL DEFAULT 0 COMMENT '是否已超时预警: 0-否 1-是',
    `escalated` TINYINT NOT NULL DEFAULT 0 COMMENT '是否已升级: 0-否 1-是',
    `view_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '查看次数',
    `message_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '消息总数',
    `last_message_at` DATETIME DEFAULT NULL COMMENT '最后消息时间',
    `extra_data` JSON DEFAULT NULL COMMENT '扩展数据',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ticket_no` (`ticket_no`),
    KEY `idx_customer_id` (`customer_id`),
    KEY `idx_assignee_id` (`assignee_id`),
    KEY `idx_category_id` (`category_id`),
    KEY `idx_priority_id` (`priority_id`),
    KEY `idx_status_code` (`status_code`),
    KEY `idx_created_at` (`created_at`),
    KEY `idx_deleted_at` (`deleted_at`),
    KEY `idx_last_message_at` (`last_message_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单主表';

-- ============================================================
-- 7. 工单操作日志表 (状态机流转追溯)
-- ============================================================
DROP TABLE IF EXISTS `ticket_operation_log`;
CREATE TABLE `ticket_operation_log` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
    `ticket_id` BIGINT UNSIGNED NOT NULL COMMENT '工单ID',
    `operation_type` VARCHAR(32) NOT NULL COMMENT '操作类型: create-创建 assign-分配 transition-状态流转 reply-回复 escalate-升级 close-关闭 reopen-重开',
    `from_status` VARCHAR(32) DEFAULT NULL COMMENT '原状态',
    `to_status` VARCHAR(32) DEFAULT NULL COMMENT '目标状态',
    `operator_id` BIGINT UNSIGNED NOT NULL COMMENT '操作人ID',
    `operator_role` TINYINT NOT NULL COMMENT '操作人角色',
    `operator_name` VARCHAR(64) NOT NULL COMMENT '操作人姓名',
    `content` VARCHAR(500) DEFAULT NULL COMMENT '操作内容/备注',
    `extra_data` JSON DEFAULT NULL COMMENT '扩展数据',
    `ip` VARCHAR(64) DEFAULT NULL COMMENT 'IP地址',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_ticket_id` (`ticket_id`),
    KEY `idx_operator_id` (`operator_id`),
    KEY `idx_operation_type` (`operation_type`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单操作日志表';

-- ============================================================
-- 8. 工单消息表 (对话记录)
-- ============================================================
DROP TABLE IF EXISTS `ticket_message`;
CREATE TABLE `ticket_message` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '消息ID',
    `ticket_id` BIGINT UNSIGNED NOT NULL COMMENT '工单ID',
    `sender_id` BIGINT UNSIGNED NOT NULL COMMENT '发送者ID',
    `sender_role` TINYINT NOT NULL COMMENT '发送者角色: 1-客户 2-客服 3-系统',
    `sender_name` VARCHAR(64) NOT NULL COMMENT '发送者姓名',
    `message_type` TINYINT NOT NULL DEFAULT 1 COMMENT '消息类型: 1-文本 2-图片 3-文件 4-系统消息',
    `content` TEXT NOT NULL COMMENT '消息内容',
    `is_read` TINYINT NOT NULL DEFAULT 0 COMMENT '是否已读: 0-未读 1-已读',
    `is_robot` TINYINT NOT NULL DEFAULT 0 COMMENT '是否机器人回复: 0-否 1-是',
    `kb_article_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联知识库文章ID(机器人回复)',
    `extra_data` JSON DEFAULT NULL COMMENT '扩展数据',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_ticket_id` (`ticket_id`),
    KEY `idx_sender_id` (`sender_id`),
    KEY `idx_is_read` (`is_read`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单消息表';

-- ============================================================
-- 9. 工单附件表
-- ============================================================
DROP TABLE IF EXISTS `ticket_attachment`;
CREATE TABLE `ticket_attachment` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '附件ID',
    `ticket_id` BIGINT UNSIGNED NOT NULL COMMENT '工单ID',
    `message_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联消息ID',
    `uploader_id` BIGINT UNSIGNED NOT NULL COMMENT '上传者ID',
    `file_name` VARCHAR(255) NOT NULL COMMENT '文件名',
    `file_path` VARCHAR(500) NOT NULL COMMENT '文件路径',
    `file_size` BIGINT UNSIGNED NOT NULL COMMENT '文件大小(字节)',
    `file_type` VARCHAR(64) NOT NULL COMMENT '文件类型',
    `mime_type` VARCHAR(128) DEFAULT NULL COMMENT 'MIME类型',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_ticket_id` (`ticket_id`),
    KEY `idx_message_id` (`message_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单附件表';

-- ============================================================
-- 10. 知识库分类表
-- ============================================================
DROP TABLE IF EXISTS `kb_category`;
CREATE TABLE `kb_category` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '分类ID',
    `name` VARCHAR(64) NOT NULL COMMENT '分类名称',
    `parent_id` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '父分类ID',
    `sort` INT NOT NULL DEFAULT 0 COMMENT '排序',
    `icon` VARCHAR(255) DEFAULT NULL COMMENT '图标',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用 1-正常',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识库分类表';

-- ============================================================
-- 11. 知识库文章表
-- ============================================================
DROP TABLE IF EXISTS `kb_article`;
CREATE TABLE `kb_article` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '文章ID',
    `category_id` BIGINT UNSIGNED NOT NULL COMMENT '分类ID',
    `title` VARCHAR(255) NOT NULL COMMENT '文章标题',
    `content` LONGTEXT NOT NULL COMMENT '文章内容',
    `keywords` VARCHAR(500) DEFAULT NULL COMMENT '关键词,逗号分隔',
    `summary` VARCHAR(500) DEFAULT NULL COMMENT '摘要',
    `author_id` BIGINT UNSIGNED NOT NULL COMMENT '作者ID',
    `view_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '查看次数',
    `helpful_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '有帮助次数',
    `not_helpful_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '无帮助次数',
    `sort` INT NOT NULL DEFAULT 0 COMMENT '排序',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0-草稿 1-已发布 2-已下架',
    `published_at` DATETIME DEFAULT NULL COMMENT '发布时间',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间',
    PRIMARY KEY (`id`),
    KEY `idx_category_id` (`category_id`),
    KEY `idx_status` (`status`),
    KEY `idx_title` (`title`),
    KEY `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识库文章表';

-- ============================================================
-- 12. 知识库文章标签表
-- ============================================================
DROP TABLE IF EXISTS `kb_tag`;
CREATE TABLE `kb_tag` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '标签ID',
    `name` VARCHAR(32) NOT NULL COMMENT '标签名称',
    `article_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '关联文章数',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识库标签表';

-- ============================================================
-- 13. 知识库文章-标签关联表
-- ============================================================
DROP TABLE IF EXISTS `kb_article_tag`;
CREATE TABLE `kb_article_tag` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `article_id` BIGINT UNSIGNED NOT NULL COMMENT '文章ID',
    `tag_id` BIGINT UNSIGNED NOT NULL COMMENT '标签ID',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_article_tag` (`article_id`, `tag_id`),
    KEY `idx_tag_id` (`tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识库文章-标签关联表';

-- ============================================================
-- 14. SLA策略表
-- ============================================================
DROP TABLE IF EXISTS `sla_policy`;
CREATE TABLE `sla_policy` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '策略ID',
    `name` VARCHAR(64) NOT NULL COMMENT '策略名称',
    `priority_id` BIGINT UNSIGNED NOT NULL COMMENT '优先级ID',
    `category_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '分类ID, NULL表示全部',
    `response_timeout` INT NOT NULL COMMENT '响应超时时间(秒)',
    `resolve_timeout` INT NOT NULL COMMENT '解决超时时间(秒)',
    `warn_before_timeout` INT NOT NULL DEFAULT 300 COMMENT '超时前预警时间(秒)',
    `escalate_after_timeout` INT NOT NULL DEFAULT 0 COMMENT '超时后自动升级时间(秒),0不自动升级',
    `escalate_to_role` TINYINT DEFAULT NULL COMMENT '升级到角色: 3-管理员',
    `description` VARCHAR(255) DEFAULT NULL COMMENT '描述',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用 1-正常',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_priority_id` (`priority_id`),
    KEY `idx_category_id` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='SLA策略表';

-- ============================================================
-- 15. SLA预警记录表
-- ============================================================
DROP TABLE IF EXISTS `sla_warning`;
CREATE TABLE `sla_warning` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '预警ID',
    `ticket_id` BIGINT UNSIGNED NOT NULL COMMENT '工单ID',
    `policy_id` BIGINT UNSIGNED NOT NULL COMMENT 'SLA策略ID',
    `warning_type` TINYINT NOT NULL COMMENT '预警类型: 1-响应超时预警 2-解决超时预警 3-已超时',
    `warned_at` DATETIME NOT NULL COMMENT '预警时间',
    `handled` TINYINT NOT NULL DEFAULT 0 COMMENT '是否已处理: 0-否 1-是',
    `handled_at` DATETIME DEFAULT NULL COMMENT '处理时间',
    `handler_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '处理人ID',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_ticket_id` (`ticket_id`),
    KEY `idx_warning_type` (`warning_type`),
    KEY `idx_handled` (`handled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='SLA预警记录表';

-- ============================================================
-- 16. 客服工作状态表
-- ============================================================
DROP TABLE IF EXISTS `agent_workload`;
CREATE TABLE `agent_workload` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `agent_id` BIGINT UNSIGNED NOT NULL COMMENT '客服ID',
    `date` DATE NOT NULL COMMENT '日期',
    `online_duration` INT NOT NULL DEFAULT 0 COMMENT '在线时长(秒)',
    `ticket_count` INT NOT NULL DEFAULT 0 COMMENT '处理工单数',
    `resolved_count` INT NOT NULL DEFAULT 0 COMMENT '已解决工单数',
    `avg_response_time` INT NOT NULL DEFAULT 0 COMMENT '平均响应时长(秒)',
    `avg_resolve_time` INT NOT NULL DEFAULT 0 COMMENT '平均解决时长(秒)',
    `satisfaction_avg` DECIMAL(3,2) DEFAULT NULL COMMENT '平均满意度',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_agent_date` (`agent_id`, `date`),
    KEY `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客服工作量表';

-- ============================================================
-- 17. 通知消息表
-- ============================================================
DROP TABLE IF EXISTS `notification`;
CREATE TABLE `notification` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '通知ID',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '接收用户ID',
    `type` VARCHAR(32) NOT NULL COMMENT '通知类型: ticket_new-新工单 ticket_reply-工单回复 ticket_assign-工单分配 ticket_timeout-工单超时 sla_warn-SLA预警 system-系统通知',
    `title` VARCHAR(255) NOT NULL COMMENT '通知标题',
    `content` TEXT COMMENT '通知内容',
    `related_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联业务ID',
    `extra_data` JSON DEFAULT NULL COMMENT '扩展数据',
    `is_read` TINYINT NOT NULL DEFAULT 0 COMMENT '是否已读: 0-未读 1-已读',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_type` (`type`),
    KEY `idx_is_read` (`is_read`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通知消息表';

-- ============================================================
-- 初始数据
-- ============================================================

-- 初始化用户 (密码: 123456, bcrypt hash)
INSERT INTO `user` (`username`, `password`, `real_name`, `email`, `role`, `status`, `department`, `skill_tags`) VALUES
('admin', '$2a$10$1Y97HJaZhzNdlJCWaSLycuNEnKHpj3dh3ClSyRsOwWk483Q4UoRKi', '系统管理员', 'admin@example.com', 3, 1, '技术部', '系统管理'),
('agent001', '$2a$10$1Y97HJaZhzNdlJCWaSLycuNEnKHpj3dh3ClSyRsOwWk483Q4UoRKi', '客服小王', 'agent001@example.com', 2, 1, '客服部', '技术咨询,产品问题'),
('agent002', '$2a$10$1Y97HJaZhzNdlJCWaSLycuNEnKHpj3dh3ClSyRsOwWk483Q4UoRKi', '客服小李', 'agent002@example.com', 2, 1, '客服部', '账户问题,计费问题'),
('customer001', '$2a$10$1Y97HJaZhzNdlJCWaSLycuNEnKHpj3dh3ClSyRsOwWk483Q4UoRKi', '客户张三', 'customer001@example.com', 1, 1, NULL, NULL);

-- 初始化工单分类
INSERT INTO `ticket_category` (`name`, `parent_id`, `description`, `sort`) VALUES
('技术咨询', 0, '技术相关问题咨询', 1),
('产品问题', 0, '产品使用问题反馈', 2),
('账户问题', 0, '账户相关问题', 3),
('计费问题', 0, '计费与充值问题', 4),
('功能建议', 0, '功能建议与反馈', 5),
('其他问题', 0, '其他未分类问题', 6),
('登录问题', 3, '登录相关问题', 1),
('密码找回', 3, '密码找回与重置', 2);

-- 初始化工单优先级
INSERT INTO `ticket_priority` (`name`, `level`, `color`, `response_timeout`, `resolve_timeout`, `sort`) VALUES
('紧急', 5, '#f56c6c', 1800, 14400, 1),
('高', 4, '#e6a23c', 3600, 86400, 2),
('中', 3, '#409eff', 7200, 172800, 3),
('低', 2, '#67c23a', 14400, 259200, 4),
('一般', 1, '#909399', 28800, 604800, 5);

-- 初始化工单状态
INSERT INTO `ticket_status` (`code`, `name`, `color`, `is_initial`, `is_final`, `sort`) VALUES
('pending', '待处理', '#909399', 1, 0, 1),
('assigned', '已分配', '#e6a23c', 0, 0, 2),
('processing', '处理中', '#409eff', 0, 0, 3),
('waiting_customer', '待客户回复', '#909399', 0, 0, 4),
('resolved', '已解决', '#67c23a', 0, 1, 5),
('closed', '已关闭', '#909399', 0, 1, 6),
('reopened', '重新打开', '#e6a23c', 0, 0, 7);

-- 初始化状态流转规则
INSERT INTO `ticket_status_transition` (`from_status`, `to_status`, `action`, `action_name`, `allowed_roles`, `description`) VALUES
('pending', 'assigned', 'assign', '分配', '3', '管理员分配工单给客服'),
('pending', 'processing', 'claim', '领取', '2', '客服领取工单'),
('assigned', 'processing', 'start', '开始处理', '2', '客服开始处理工单'),
('processing', 'waiting_customer', 'wait', '等待客户', '2', '等待客户提供更多信息'),
('waiting_customer', 'processing', 'resume', '继续处理', '2', '客户回复后继续处理'),
('processing', 'resolved', 'resolve', '解决', '2', '客服标记工单已解决'),
('resolved', 'closed', 'close', '关闭', '1,2,3', '客户或客服关闭工单'),
('resolved', 'reopened', 'reopen', '重新打开', '1', '客户对解决结果不满意重新打开'),
('reopened', 'processing', 'start', '开始处理', '2', '客服重新处理'),
('pending', 'closed', 'close', '关闭', '1,3', '客户或管理员关闭工单'),
('assigned', 'pending', 'unassign', '取消分配', '3', '管理员取消分配');

-- 初始化知识库分类
INSERT INTO `kb_category` (`name`, `parent_id`, `sort`) VALUES
('入门指南', 0, 1),
('常见问题', 0, 2),
('功能说明', 0, 3),
('账户管理', 2, 1),
('产品使用', 2, 2),
('计费相关', 2, 3);

-- 初始化知识库标签
INSERT INTO `kb_tag` (`name`) VALUES
('登录'), ('密码'), ('账户'), ('计费'), ('充值'), ('发票'), ('API'), ('Webhook'), ('数据导出'), ('安全设置');

-- 初始化知识库文章
INSERT INTO `kb_article` (`category_id`, `title`, `content`, `keywords`, `summary`, `author_id`, `status`, `published_at`) VALUES
(1, '快速入门指南', '<h1>快速入门</h1><p>欢迎使用我们的系统...</p>', '入门,快速开始,使用指南', '帮助您快速上手系统的基本功能', 2, 1, NOW()),
(4, '如何重置密码', '<h1>重置密码</h1><p>如果您忘记了密码...</p>', '密码,重置,忘记密码', '详细介绍重置密码的步骤', 2, 1, NOW()),
(4, '账户安全设置', '<h1>账户安全</h1><p>保护您的账户安全...</p>', '安全,账户,设置', '如何保护您的账户安全', 3, 1, NOW()),
(5, '产品使用常见问题', '<h1>常见问题</h1><p>以下是产品使用中的常见问题...</p>', '使用,问题,FAQ', '产品使用过程中常见问题解答', 2, 1, NOW()),
(6, '计费方式说明', '<h1>计费说明</h1><p>我们的计费方式...</p>', '计费,价格,收费', '详细说明系统的计费方式', 3, 1, NOW()),
(6, '如何申请发票', '<h1>发票申请</h1><p>申请发票步骤...</p>', '发票,申请,报销', '如何申请和开具发票', 2, 1, NOW());

-- 初始化SLA策略
INSERT INTO `sla_policy` (`name`, `priority_id`, `category_id`, `response_timeout`, `resolve_timeout`, `warn_before_timeout`, `escalate_after_timeout`, `escalate_to_role`, `description`) VALUES
('紧急工单SLA', 1, NULL, 1800, 14400, 600, 0, NULL, '紧急工单30分钟内响应'),
('高优先级SLA', 2, NULL, 3600, 86400, 1800, 0, NULL, '高优先级1小时内响应'),
('中优先级SLA', 3, NULL, 7200, 172800, 3600, 0, NULL, '中优先级2小时内响应'),
('低优先级SLA', 4, NULL, 14400, 259200, 7200, 0, NULL, '低优先级4小时内响应'),
('一般优先级SLA', 5, NULL, 28800, 604800, 14400, 0, NULL, '一般优先级8小时内响应');

-- ============================================================
-- 创建必要的索引(已在建表语句中包含)
-- ============================================================
