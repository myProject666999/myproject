CREATE DATABASE IF NOT EXISTS load_testing DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE load_testing;

CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    `username` VARCHAR(50) NOT NULL COMMENT '用户名',
    `password` VARCHAR(255) NOT NULL COMMENT '密码',
    `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    `role` TINYINT NOT NULL DEFAULT 1 COMMENT '角色：1-普通用户，2-管理员',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE IF NOT EXISTS `targets` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '目标ID',
    `name` VARCHAR(100) NOT NULL COMMENT '目标名称',
    `base_url` VARCHAR(255) NOT NULL COMMENT '目标地址',
    `description` TEXT DEFAULT NULL COMMENT '描述',
    `allowed_ips` TEXT DEFAULT NULL COMMENT '允许的压测源IP，逗号分隔',
    `auth_token` VARCHAR(255) DEFAULT NULL COMMENT '授权令牌',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    `created_by` BIGINT UNSIGNED NOT NULL COMMENT '创建人ID',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='压测目标表';

CREATE TABLE IF NOT EXISTS `tasks` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '任务ID',
    `name` VARCHAR(100) NOT NULL COMMENT '任务名称',
    `target_id` BIGINT UNSIGNED NOT NULL COMMENT '目标ID',
    `method` VARCHAR(10) NOT NULL DEFAULT 'GET' COMMENT '请求方法',
    `path` VARCHAR(255) NOT NULL COMMENT '请求路径',
    `headers` TEXT DEFAULT NULL COMMENT '请求头，JSON格式',
    `body` TEXT DEFAULT NULL COMMENT '请求体',
    `concurrency` INT NOT NULL DEFAULT 10 COMMENT '并发数',
    `duration` INT NOT NULL DEFAULT 60 COMMENT '压测时长（秒）',
    `ramp_up` INT NOT NULL DEFAULT 0 COMMENT '阶梯启动时间（秒）',
    `steps` INT DEFAULT NULL COMMENT '阶梯数',
    `qps_limit` INT DEFAULT NULL COMMENT 'QPS限制',
    `timeout` INT NOT NULL DEFAULT 30 COMMENT '超时时间（秒）',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-待执行，1-执行中，2-已完成，3-已中止，4-失败',
    `progress` INT NOT NULL DEFAULT 0 COMMENT '进度百分比',
    `started_at` DATETIME DEFAULT NULL COMMENT '开始时间',
    `ended_at` DATETIME DEFAULT NULL COMMENT '结束时间',
    `created_by` BIGINT UNSIGNED NOT NULL COMMENT '创建人ID',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_target_id` (`target_id`),
    KEY `idx_status` (`status`),
    KEY `idx_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='压测任务表';

CREATE TABLE IF NOT EXISTS `task_nodes` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '节点任务ID',
    `task_id` BIGINT UNSIGNED NOT NULL COMMENT '主任务ID',
    `node_id` VARCHAR(50) NOT NULL COMMENT '节点ID',
    `node_ip` VARCHAR(50) DEFAULT NULL COMMENT '节点IP',
    `concurrency` INT NOT NULL COMMENT '该节点并发数',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-待执行，1-执行中，2-已完成，3-已中止，4-失败',
    `started_at` DATETIME DEFAULT NULL COMMENT '开始时间',
    `ended_at` DATETIME DEFAULT NULL COMMENT '结束时间',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_task_node` (`task_id`, `node_id`),
    KEY `idx_task_id` (`task_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务节点表';

CREATE TABLE IF NOT EXISTS `metrics` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '指标ID',
    `task_id` BIGINT UNSIGNED NOT NULL COMMENT '任务ID',
    `timestamp` DATETIME NOT NULL COMMENT '时间戳',
    `qps` INT NOT NULL DEFAULT 0 COMMENT 'QPS',
    `avg_rt` INT NOT NULL DEFAULT 0 COMMENT '平均响应时间(ms)',
    `p50_rt` INT NOT NULL DEFAULT 0 COMMENT 'P50响应时间(ms)',
    `p95_rt` INT NOT NULL DEFAULT 0 COMMENT 'P95响应时间(ms)',
    `p99_rt` INT NOT NULL DEFAULT 0 COMMENT 'P99响应时间(ms)',
    `min_rt` INT NOT NULL DEFAULT 0 COMMENT '最小响应时间(ms)',
    `max_rt` INT NOT NULL DEFAULT 0 COMMENT '最大响应时间(ms)',
    `success_count` BIGINT NOT NULL DEFAULT 0 COMMENT '成功请求数',
    `error_count` BIGINT NOT NULL DEFAULT 0 COMMENT '失败请求数',
    `error_rate` DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT '错误率(%)',
    `bytes_received` BIGINT NOT NULL DEFAULT 0 COMMENT '接收字节数',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_task_time` (`task_id`, `timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='实时指标表';

CREATE TABLE IF NOT EXISTS `reports` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '报告ID',
    `task_id` BIGINT UNSIGNED NOT NULL COMMENT '任务ID',
    `name` VARCHAR(200) NOT NULL COMMENT '报告名称',
    `total_requests` BIGINT NOT NULL DEFAULT 0 COMMENT '总请求数',
    `success_requests` BIGINT NOT NULL DEFAULT 0 COMMENT '成功请求数',
    `failed_requests` BIGINT NOT NULL DEFAULT 0 COMMENT '失败请求数',
    `error_rate` DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT '错误率(%)',
    `avg_qps` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '平均QPS',
    `peak_qps` INT NOT NULL DEFAULT 0 COMMENT '峰值QPS',
    `avg_rt` INT NOT NULL DEFAULT 0 COMMENT '平均响应时间(ms)',
    `min_rt` INT NOT NULL DEFAULT 0 COMMENT '最小响应时间(ms)',
    `max_rt` INT NOT NULL DEFAULT 0 COMMENT '最大响应时间(ms)',
    `p50_rt` INT NOT NULL DEFAULT 0 COMMENT 'P50响应时间(ms)',
    `p95_rt` INT NOT NULL DEFAULT 0 COMMENT 'P95响应时间(ms)',
    `p99_rt` INT NOT NULL DEFAULT 0 COMMENT 'P99响应时间(ms)',
    `total_duration` INT NOT NULL DEFAULT 0 COMMENT '总时长(秒)',
    `bytes_total` BIGINT NOT NULL DEFAULT 0 COMMENT '总流量(字节)',
    `summary` TEXT DEFAULT NULL COMMENT '摘要信息',
    `detail_data` MEDIUMTEXT DEFAULT NULL COMMENT '详细数据，JSON格式',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-无效，1-有效',
    `created_by` BIGINT UNSIGNED NOT NULL COMMENT '创建人ID',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_task_id` (`task_id`),
    KEY `idx_created_by` (`created_by`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='压测报告表';

CREATE TABLE IF NOT EXISTS `baselines` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '基线ID',
    `name` VARCHAR(100) NOT NULL COMMENT '基线名称',
    `target_id` BIGINT UNSIGNED NOT NULL COMMENT '目标ID',
    `path` VARCHAR(255) NOT NULL COMMENT '接口路径',
    `method` VARCHAR(10) NOT NULL COMMENT '请求方法',
    `report_id` BIGINT UNSIGNED NOT NULL COMMENT '关联报告ID',
    `baseline_data` TEXT NOT NULL COMMENT '基线数据，JSON格式',
    `threshold_qps` DECIMAL(5,2) DEFAULT NULL COMMENT 'QPS阈值(%)，低于此值告警',
    `threshold_rt_p95` INT DEFAULT NULL COMMENT 'P95响应时间阈值(ms)，高于此值告警',
    `threshold_error_rate` DECIMAL(5,2) DEFAULT NULL COMMENT '错误率阈值(%)，高于此值告警',
    `is_default` TINYINT NOT NULL DEFAULT 0 COMMENT '是否默认基线：0-否，1-是',
    `description` TEXT DEFAULT NULL COMMENT '描述',
    `created_by` BIGINT UNSIGNED NOT NULL COMMENT '创建人ID',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_target_path` (`target_id`, `path`),
    KEY `idx_report_id` (`report_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='性能基线表';

CREATE TABLE IF NOT EXISTS `comparisons` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '对比ID',
    `name` VARCHAR(200) NOT NULL COMMENT '对比名称',
    `baseline_id` BIGINT UNSIGNED NOT NULL COMMENT '基线ID',
    `report_id` BIGINT UNSIGNED NOT NULL COMMENT '报告ID',
    `comparison_data` TEXT NOT NULL COMMENT '对比数据，JSON格式',
    `has_alarm` TINYINT NOT NULL DEFAULT 0 COMMENT '是否有告警：0-无，1-有',
    `alarm_details` TEXT DEFAULT NULL COMMENT '告警详情，JSON格式',
    `created_by` BIGINT UNSIGNED NOT NULL COMMENT '创建人ID',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_baseline_id` (`baseline_id`),
    KEY `idx_report_id` (`report_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='对比记录表';

CREATE TABLE IF NOT EXISTS `alarms` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '告警ID',
    `task_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '任务ID',
    `report_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '报告ID',
    `baseline_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '基线ID',
    `comparison_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '对比ID',
    `type` VARCHAR(50) NOT NULL COMMENT '告警类型：threshold-阈值告警，regression-性能回归',
    `level` TINYINT NOT NULL DEFAULT 1 COMMENT '告警级别：1-警告，2-严重',
    `metric` VARCHAR(50) NOT NULL COMMENT '告警指标：qps, rt_p95, rt_p99, error_rate',
    `baseline_value` DECIMAL(15,2) DEFAULT NULL COMMENT '基线值',
    `current_value` DECIMAL(15,2) NOT NULL COMMENT '当前值',
    `threshold` DECIMAL(10,2) DEFAULT NULL COMMENT '阈值',
    `message` VARCHAR(500) NOT NULL COMMENT '告警消息',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-未处理，1-已处理',
    `handled_by` BIGINT UNSIGNED DEFAULT NULL COMMENT '处理人ID',
    `handled_at` DATETIME DEFAULT NULL COMMENT '处理时间',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_task_id` (`task_id`),
    KEY `idx_report_id` (`report_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='告警表';

INSERT INTO `users` (`username`, `password`, `email`, `role`, `status`) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin@example.com', 2, 1);
