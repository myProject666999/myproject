CREATE DATABASE IF NOT EXISTS inspection_chatops DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE inspection_chatops;

CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    `password` VARCHAR(255) NOT NULL COMMENT '密码',
    `real_name` VARCHAR(50) COMMENT '真实姓名',
    `email` VARCHAR(100) COMMENT '邮箱',
    `phone` VARCHAR(20) COMMENT '手机号',
    `role` TINYINT NOT NULL DEFAULT 2 COMMENT '角色:1-管理员,2-普通用户',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:0-禁用,1-启用',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (`username`),
    INDEX idx_status (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

CREATE TABLE IF NOT EXISTS `inspection_tasks` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL COMMENT '任务名称',
    `description` TEXT COMMENT '任务描述',
    `type` TINYINT NOT NULL COMMENT '类型:1-HTTP检查,2-脚本检查',
    `cron_expr` VARCHAR(50) NOT NULL COMMENT 'cron表达式',
    `timeout` INT NOT NULL DEFAULT 30 COMMENT '超时时间(秒)',
    `retry_count` INT NOT NULL DEFAULT 0 COMMENT '重试次数',
    `retry_interval` INT NOT NULL DEFAULT 5 COMMENT '重试间隔(秒)',
    `http_config` JSON COMMENT 'HTTP检查配置',
    `script_config` JSON COMMENT '脚本检查配置',
    `alert_threshold` INT NOT NULL DEFAULT 1 COMMENT '告警阈值',
    `notify_channels` JSON COMMENT '通知渠道配置',
    `tags` VARCHAR(255) COMMENT '标签,逗号分隔',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:0-禁用,1-启用',
    `created_by` BIGINT UNSIGNED NOT NULL COMMENT '创建人',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (`status`),
    INDEX idx_created_by (`created_by`),
    INDEX idx_tags (`tags`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='巡检任务表';

CREATE TABLE IF NOT EXISTS `inspection_results` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `task_id` BIGINT UNSIGNED NOT NULL COMMENT '任务ID',
    `task_name` VARCHAR(100) NOT NULL COMMENT '任务名称快照',
    `execution_id` VARCHAR(64) NOT NULL COMMENT '执行ID',
    `status` TINYINT NOT NULL COMMENT '状态:0-失败,1-成功,2-超时,3-执行中',
    `duration` INT COMMENT '执行耗时(毫秒)',
    `result_data` JSON COMMENT '执行结果数据',
    `error_message` TEXT COMMENT '错误信息',
    `retry_times` INT NOT NULL DEFAULT 0 COMMENT '重试次数',
    `notified` TINYINT NOT NULL DEFAULT 0 COMMENT '是否已通知:0-否,1-是',
    `started_at` DATETIME NOT NULL COMMENT '开始时间',
    `ended_at` DATETIME COMMENT '结束时间',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_task_id (`task_id`),
    INDEX idx_execution_id (`execution_id`),
    INDEX idx_status (`status`),
    INDEX idx_created_at (`created_at`),
    INDEX idx_notified (`notified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='巡检结果表';

CREATE TABLE IF NOT EXISTS `robot_configs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL COMMENT '机器人名称',
    `type` VARCHAR(20) NOT NULL COMMENT '类型:dingtalk,wechat,feishu,custom',
    `webhook_url` VARCHAR(255) NOT NULL COMMENT 'Webhook地址',
    `secret` VARCHAR(255) COMMENT '签名密钥',
    `token` VARCHAR(255) COMMENT '访问令牌',
    `at_mobiles` JSON COMMENT '@手机号列表',
    `at_all` TINYINT NOT NULL DEFAULT 0 COMMENT '是否@所有人:0-否,1-是',
    `is_default` TINYINT NOT NULL DEFAULT 0 COMMENT '是否默认:0-否,1-是',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:0-禁用,1-启用',
    `created_by` BIGINT UNSIGNED NOT NULL COMMENT '创建人',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (`type`),
    INDEX idx_status (`status`),
    INDEX idx_is_default (`is_default`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='机器人配置表';

CREATE TABLE IF NOT EXISTS `command_audit` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `command` VARCHAR(255) NOT NULL COMMENT '指令内容',
    `params` JSON COMMENT '指令参数',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '执行用户ID',
    `username` VARCHAR(50) NOT NULL COMMENT '执行用户名快照',
    `channel` VARCHAR(50) NOT NULL COMMENT '来源渠道',
    `channel_user_id` VARCHAR(100) COMMENT '渠道用户ID',
    `plan_id` BIGINT UNSIGNED COMMENT '关联预案ID',
    `plan_name` VARCHAR(100) COMMENT '预案名称快照',
    `status` TINYINT NOT NULL COMMENT '状态:0-失败,1-成功,2-执行中,3-拒绝',
    `result_data` JSON COMMENT '执行结果',
    `error_message` TEXT COMMENT '错误信息',
    `duration` INT COMMENT '执行耗时(毫秒)',
    `ip_address` VARCHAR(50) COMMENT 'IP地址',
    `user_agent` VARCHAR(500) COMMENT 'User Agent',
    `started_at` DATETIME NOT NULL COMMENT '开始时间',
    `ended_at` DATETIME COMMENT '结束时间',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (`user_id`),
    INDEX idx_plan_id (`plan_id`),
    INDEX idx_status (`status`),
    INDEX idx_created_at (`created_at`),
    INDEX idx_channel (`channel`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='指令审计表';

CREATE TABLE IF NOT EXISTS `plans` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL COMMENT '预案名称',
    `description` TEXT COMMENT '预案描述',
    `command` VARCHAR(100) NOT NULL UNIQUE COMMENT '触发指令',
    `type` TINYINT NOT NULL COMMENT '类型:1-HTTP请求,2-脚本执行,3-SQL执行',
    `config` JSON NOT NULL COMMENT '执行配置',
    `timeout` INT NOT NULL DEFAULT 60 COMMENT '超时时间(秒)',
    `idempotent_key` VARCHAR(255) COMMENT '幂等key模板',
    `allowed_roles` JSON COMMENT '允许执行的角色',
    `allowed_users` JSON COMMENT '允许执行的用户',
    `need_approval` TINYINT NOT NULL DEFAULT 0 COMMENT '是否需要审批:0-否,1-是',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:0-禁用,1-启用',
    `created_by` BIGINT UNSIGNED NOT NULL COMMENT '创建人',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_command (`command`),
    INDEX idx_status (`status`),
    INDEX idx_created_by (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='预案表';

CREATE TABLE IF NOT EXISTS `duty_rotations` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL COMMENT '值班名称',
    `type` TINYINT NOT NULL COMMENT '类型:1-日值班,2-周值班,3-月值班',
    `user_ids` JSON NOT NULL COMMENT '值班用户ID列表',
    `start_date` DATE NOT NULL COMMENT '开始日期',
    `end_date` DATE COMMENT '结束日期',
    `current_index` INT NOT NULL DEFAULT 0 COMMENT '当前值班索引',
    `notify_time` VARCHAR(20) COMMENT '值班通知时间',
    `notify_channels` JSON COMMENT '通知渠道',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:0-禁用,1-启用',
    `created_by` BIGINT UNSIGNED NOT NULL COMMENT '创建人',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (`type`),
    INDEX idx_status (`status`),
    INDEX idx_start_date (`start_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='值班表';

CREATE TABLE IF NOT EXISTS `duty_records` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `rotation_id` BIGINT UNSIGNED NOT NULL COMMENT '值班轮换ID',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '值班用户ID',
    `username` VARCHAR(50) NOT NULL COMMENT '用户名快照',
    `duty_date` DATE NOT NULL COMMENT '值班日期',
    `duty_type` TINYINT NOT NULL COMMENT '值班类型',
    `notified` TINYINT NOT NULL DEFAULT 0 COMMENT '是否已通知',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_rotation_id (`rotation_id`),
    INDEX idx_user_id (`user_id`),
    INDEX idx_duty_date (`duty_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='值班记录表';

CREATE TABLE IF NOT EXISTS `reports` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL COMMENT '报告名称',
    `type` TINYINT NOT NULL COMMENT '类型:1-日报,2-周报,3-月报,4-自定义',
    `start_date` DATE NOT NULL COMMENT '开始日期',
    `end_date` DATE NOT NULL COMMENT '结束日期',
    `task_ids` JSON COMMENT '包含的任务ID',
    `summary` JSON NOT NULL COMMENT '统计摘要',
    `details` JSON COMMENT '详细数据',
    `file_path` VARCHAR(255) COMMENT '报告文件路径',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态',
    `created_by` BIGINT UNSIGNED NOT NULL COMMENT '创建人',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type (`type`),
    INDEX idx_created_by (`created_by`),
    INDEX idx_start_date (`start_date`),
    INDEX idx_end_date (`end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='报告表';

INSERT INTO `users` (`username`, `password`, `real_name`, `role`, `status`) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '系统管理员', 1, 1);

INSERT INTO `robot_configs` (`name`, `type`, `webhook_url`, `is_default`, `status`, `created_by`) VALUES
('默认机器人', 'dingtalk', 'https://oapi.dingtalk.com/robot/send?access_token=your_token', 1, 1, 1);

INSERT INTO `plans` (`name`, `description`, `command`, `type`, `config`, `timeout`, `status`, `created_by`) VALUES
('重启服务', '重启指定的应用服务', 'restart_service', 2, '{"script_path": "/scripts/restart_service.sh", "args": ["{{service_name}}"]}', 60, 1, 1),
('查询服务状态', '查询服务运行状态', 'check_status', 1, '{"url": "http://localhost:8080/health", "method": "GET"}', 30, 1, 1),
('清理缓存', '清理Redis缓存', 'clear_cache', 2, '{"script_path": "/scripts/clear_cache.sh"}', 30, 1, 1);
