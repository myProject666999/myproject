CREATE DATABASE IF NOT EXISTS inspection_chatops DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE inspection_chatops;

CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `real_name` VARCHAR(50),
    `email` VARCHAR(100),
    `phone` VARCHAR(20),
    `role` TINYINT NOT NULL DEFAULT 2,
    `status` TINYINT NOT NULL DEFAULT 1,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (`username`),
    INDEX idx_status (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `inspection_tasks` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT,
    `type` TINYINT NOT NULL,
    `cron_expr` VARCHAR(50) NOT NULL,
    `timeout` INT NOT NULL DEFAULT 30,
    `retry_count` INT NOT NULL DEFAULT 0,
    `retry_interval` INT NOT NULL DEFAULT 5,
    `http_config` JSON,
    `script_config` JSON,
    `alert_threshold` INT NOT NULL DEFAULT 1,
    `notify_channels` JSON,
    `tags` VARCHAR(255),
    `status` TINYINT NOT NULL DEFAULT 1,
    `created_by` BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (`status`),
    INDEX idx_created_by (`created_by`),
    INDEX idx_tags (`tags`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `inspection_results` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `task_id` BIGINT UNSIGNED NOT NULL,
    `task_name` VARCHAR(100) NOT NULL,
    `execution_id` VARCHAR(64) NOT NULL,
    `status` TINYINT NOT NULL,
    `duration` INT,
    `result_data` JSON,
    `error_message` TEXT,
    `retry_times` INT NOT NULL DEFAULT 0,
    `notified` TINYINT NOT NULL DEFAULT 0,
    `started_at` DATETIME NOT NULL,
    `ended_at` DATETIME,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_task_id (`task_id`),
    INDEX idx_execution_id (`execution_id`),
    INDEX idx_status (`status`),
    INDEX idx_created_at (`created_at`),
    INDEX idx_notified (`notified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `robot_configs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL,
    `type` VARCHAR(20) NOT NULL,
    `webhook_url` VARCHAR(255) NOT NULL,
    `secret` VARCHAR(255),
    `token` VARCHAR(255),
    `at_mobiles` JSON,
    `at_all` TINYINT NOT NULL DEFAULT 0,
    `is_default` TINYINT NOT NULL DEFAULT 0,
    `status` TINYINT NOT NULL DEFAULT 1,
    `created_by` BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (`type`),
    INDEX idx_status (`status`),
    INDEX idx_is_default (`is_default`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `command_audit` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `command` VARCHAR(255) NOT NULL,
    `params` JSON,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `username` VARCHAR(50) NOT NULL,
    `channel` VARCHAR(50) NOT NULL,
    `channel_user_id` VARCHAR(100),
    `plan_id` BIGINT UNSIGNED,
    `plan_name` VARCHAR(100),
    `status` TINYINT NOT NULL,
    `result_data` JSON,
    `error_message` TEXT,
    `duration` INT,
    `ip_address` VARCHAR(50),
    `user_agent` VARCHAR(500),
    `started_at` DATETIME NOT NULL,
    `ended_at` DATETIME,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (`user_id`),
    INDEX idx_plan_id (`plan_id`),
    INDEX idx_status (`status`),
    INDEX idx_created_at (`created_at`),
    INDEX idx_channel (`channel`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `plans` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT,
    `command` VARCHAR(100) NOT NULL UNIQUE,
    `type` TINYINT NOT NULL,
    `config` JSON NOT NULL,
    `timeout` INT NOT NULL DEFAULT 60,
    `idempotent_key` VARCHAR(255),
    `allowed_roles` JSON,
    `allowed_users` JSON,
    `need_approval` TINYINT NOT NULL DEFAULT 0,
    `status` TINYINT NOT NULL DEFAULT 1,
    `created_by` BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_command (`command`),
    INDEX idx_status (`status`),
    INDEX idx_created_by (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `duty_rotations` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `type` TINYINT NOT NULL,
    `user_ids` JSON NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE,
    `current_index` INT NOT NULL DEFAULT 0,
    `notify_time` VARCHAR(20),
    `notify_channels` JSON,
    `status` TINYINT NOT NULL DEFAULT 1,
    `created_by` BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (`type`),
    INDEX idx_status (`status`),
    INDEX idx_start_date (`start_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `duty_records` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `rotation_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `username` VARCHAR(50) NOT NULL,
    `duty_date` DATE NOT NULL,
    `duty_type` TINYINT NOT NULL,
    `notified` TINYINT NOT NULL DEFAULT 0,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_rotation_id (`rotation_id`),
    INDEX idx_user_id (`user_id`),
    INDEX idx_duty_date (`duty_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `reports` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `type` TINYINT NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `task_ids` JSON,
    `summary` JSON NOT NULL,
    `details` JSON,
    `file_path` VARCHAR(255),
    `status` TINYINT NOT NULL DEFAULT 1,
    `created_by` BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type (`type`),
    INDEX idx_created_by (`created_by`),
    INDEX idx_start_date (`start_date`),
    INDEX idx_end_date (`end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`username`, `password`, `real_name`, `role`, `status`) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin', 1, 1);

INSERT INTO `robot_configs` (`name`, `type`, `webhook_url`, `is_default`, `status`, `created_by`) VALUES
('Default Robot', 'dingtalk', 'https://oapi.dingtalk.com/robot/send?access_token=your_token', 1, 1, 1);

INSERT INTO `plans` (`name`, `description`, `command`, `type`, `config`, `timeout`, `status`, `created_by`) VALUES
('Restart Service', 'Restart specified application service', 'restart_service', 2, '{"script_path": "/scripts/restart_service.sh", "args": ["{{service_name}}"]}', 60, 1, 1),
('Check Status', 'Check service running status', 'check_status', 1, '{"url": "http://localhost:8080/health", "method": "GET"}', 30, 1, 1),
('Clear Cache', 'Clear Redis cache', 'clear_cache', 2, '{"script_path": "/scripts/clear_cache.sh"}', 30, 1, 1);
