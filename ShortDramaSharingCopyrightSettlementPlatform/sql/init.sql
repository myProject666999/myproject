-- 创建数据库
CREATE DATABASE IF NOT EXISTS `short_drama_platform` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `short_drama_platform`;

-- 用户表
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `username` VARCHAR(50) NOT NULL COMMENT '用户名',
    `password` VARCHAR(255) NOT NULL COMMENT '密码',
    `real_name` VARCHAR(50) DEFAULT NULL COMMENT '真实姓名',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
    `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    `role` TINYINT NOT NULL DEFAULT 1 COMMENT '角色：1-普通用户 2-管理员 3-超级管理员',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用 1-启用',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`),
    KEY `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 剧集表
CREATE TABLE IF NOT EXISTS `dramas` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `drama_no` VARCHAR(64) NOT NULL COMMENT '剧集编号',
    `title` VARCHAR(200) NOT NULL COMMENT '剧集名称',
    `description` TEXT COMMENT '剧集描述',
    `cover_url` VARCHAR(500) DEFAULT NULL COMMENT '封面图片',
    `total_episodes` INT NOT NULL DEFAULT 0 COMMENT '总集数',
    `duration` INT DEFAULT NULL COMMENT '单集时长(秒)',
    `release_date` DATE DEFAULT NULL COMMENT '上线日期',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-待上线 1-已上线 2-已下线',
    `created_by` BIGINT UNSIGNED NOT NULL COMMENT '创建人',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_drama_no` (`drama_no`),
    KEY `idx_status` (`status`),
    KEY `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='剧集表';

-- 权益方类型字典
CREATE TABLE IF NOT EXISTS `stakeholder_types` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `type_code` VARCHAR(32) NOT NULL COMMENT '类型编码',
    `type_name` VARCHAR(50) NOT NULL COMMENT '类型名称',
    `description` VARCHAR(200) DEFAULT NULL COMMENT '描述',
    `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_type_code` (`type_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权益方类型表';

INSERT INTO `stakeholder_types` (`type_code`, `type_name`, `description`, `sort_order`) VALUES
('PLATFORM', '平台方', '短剧播放平台', 1),
('PRODUCER', '出品方', '剧集出品公司', 2),
('SCREENWRITER', '编剧', '剧集编剧', 3),
('DIRECTOR', '导演', '剧集导演', 4),
('ACTOR', '演员', '参演演员', 5),
('OTHER', '其他', '其他权益方', 99);

-- 权益方表
CREATE TABLE IF NOT EXISTS `stakeholders` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `stakeholder_no` VARCHAR(64) NOT NULL COMMENT '权益方编号',
    `type_code` VARCHAR(32) NOT NULL COMMENT '权益方类型',
    `name` VARCHAR(100) NOT NULL COMMENT '权益方名称',
    `contact_person` VARCHAR(50) DEFAULT NULL COMMENT '联系人',
    `contact_phone` VARCHAR(20) DEFAULT NULL COMMENT '联系电话',
    `bank_account` VARCHAR(100) DEFAULT NULL COMMENT '银行账号',
    `bank_name` VARCHAR(100) DEFAULT NULL COMMENT '开户银行',
    `id_card` VARCHAR(32) DEFAULT NULL COMMENT '身份证号/统一社会信用代码',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用 1-启用',
    `created_by` BIGINT UNSIGNED NOT NULL COMMENT '创建人',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_stakeholder_no` (`stakeholder_no`),
    KEY `idx_type_code` (`type_code`),
    KEY `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权益方表';

-- 剧集权益分配表
CREATE TABLE IF NOT EXISTS `drama_rights` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `drama_id` BIGINT UNSIGNED NOT NULL COMMENT '剧集ID',
    `stakeholder_id` BIGINT UNSIGNED NOT NULL COMMENT '权益方ID',
    `role_name` VARCHAR(100) DEFAULT NULL COMMENT '角色名称(演员角色等)',
    `base_ratio` DECIMAL(8,4) NOT NULL DEFAULT 0.0000 COMMENT '基础分账比例',
    `is_active` TINYINT NOT NULL DEFAULT 1 COMMENT '是否有效',
    `effective_date` DATE DEFAULT NULL COMMENT '生效日期',
    `expire_date` DATE DEFAULT NULL COMMENT '失效日期',
    `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
    `created_by` BIGINT UNSIGNED NOT NULL COMMENT '创建人',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_drama_stakeholder` (`drama_id`, `stakeholder_id`),
    KEY `idx_drama_id` (`drama_id`),
    KEY `idx_stakeholder_id` (`stakeholder_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='剧集权益分配表';

-- 分账规则表
CREATE TABLE IF NOT EXISTS `profit_share_rules` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `rule_no` VARCHAR(64) NOT NULL COMMENT '规则编号',
    `rule_name` VARCHAR(100) NOT NULL COMMENT '规则名称',
    `rule_type` TINYINT NOT NULL DEFAULT 1 COMMENT '规则类型：1-固定比例 2-阶梯比例',
    `dsl_content` TEXT NOT NULL COMMENT 'DSL规则内容(JSON)',
    `description` VARCHAR(500) DEFAULT NULL COMMENT '规则描述',
    `priority` INT NOT NULL DEFAULT 0 COMMENT '优先级，数字越大优先级越高',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-草稿 1-已发布 2-已停用',
    `effective_date` DATE DEFAULT NULL COMMENT '生效日期',
    `expire_date` DATE DEFAULT NULL COMMENT '失效日期',
    `created_by` BIGINT UNSIGNED NOT NULL COMMENT '创建人',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_rule_no` (`rule_no`),
    KEY `idx_status` (`status`),
    KEY `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分账规则表';

-- 剧集与分账规则关联表
CREATE TABLE IF NOT EXISTS `drama_rule_relations` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `drama_id` BIGINT UNSIGNED NOT NULL COMMENT '剧集ID',
    `rule_id` BIGINT UNSIGNED NOT NULL COMMENT '规则ID',
    `created_by` BIGINT UNSIGNED NOT NULL COMMENT '创建人',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_drama_rule` (`drama_id`, `rule_id`),
    KEY `idx_drama_id` (`drama_id`),
    KEY `idx_rule_id` (`rule_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='剧集与分账规则关联表';

-- 播放数据表
CREATE TABLE IF NOT EXISTS `play_data` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `data_no` VARCHAR(64) NOT NULL COMMENT '数据编号',
    `drama_id` BIGINT UNSIGNED NOT NULL COMMENT '剧集ID',
    `episode_no` INT NOT NULL DEFAULT 0 COMMENT '集数(0表示全集)',
    `play_count` BIGINT NOT NULL DEFAULT 0 COMMENT '播放次数',
    `play_duration` BIGINT NOT NULL DEFAULT 0 COMMENT '播放总时长(秒)',
    `unique_viewers` BIGINT NOT NULL DEFAULT 0 COMMENT '独立观众数',
    `data_date` DATE NOT NULL COMMENT '数据日期',
    `data_source` VARCHAR(50) NOT NULL COMMENT '数据来源',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-无效 1-有效',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_drama_date_episode` (`drama_id`, `data_date`, `episode_no`),
    KEY `idx_data_no` (`data_no`),
    KEY `idx_drama_id` (`drama_id`),
    KEY `idx_data_date` (`data_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='播放数据表';

-- 付费数据表
CREATE TABLE IF NOT EXISTS `payment_data` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `data_no` VARCHAR(64) NOT NULL COMMENT '数据编号',
    `drama_id` BIGINT UNSIGNED NOT NULL COMMENT '剧集ID',
    `episode_no` INT NOT NULL DEFAULT 0 COMMENT '集数(0表示全集)',
    `payment_amount` DECIMAL(18,2) NOT NULL DEFAULT 0.00 COMMENT '付费金额',
    `payment_count` INT NOT NULL DEFAULT 0 COMMENT '付费次数',
    `unique_payers` INT NOT NULL DEFAULT 0 COMMENT '独立付费用户数',
    `data_date` DATE NOT NULL COMMENT '数据日期',
    `data_source` VARCHAR(50) NOT NULL COMMENT '数据来源',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-无效 1-有效',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_drama_date_episode` (`drama_id`, `data_date`, `episode_no`),
    KEY `idx_data_no` (`data_no`),
    KEY `idx_drama_id` (`drama_id`),
    KEY `idx_data_date` (`data_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='付费数据表';

-- 分账计算任务表(幂等控制)
CREATE TABLE IF NOT EXISTS `share_calculation_tasks` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `task_no` VARCHAR(64) NOT NULL COMMENT '任务编号',
    `drama_id` BIGINT UNSIGNED NOT NULL COMMENT '剧集ID',
    `settlement_period` VARCHAR(20) NOT NULL COMMENT '结算周期(YYYYMM)',
    `task_type` TINYINT NOT NULL DEFAULT 1 COMMENT '任务类型：1-播放分账 2-付费分账 3-综合分账',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-待处理 1-处理中 2-已完成 3-失败',
    `retry_count` INT NOT NULL DEFAULT 0 COMMENT '重试次数',
    `last_retry_at` DATETIME DEFAULT NULL COMMENT '最后重试时间',
    `idempotent_key` VARCHAR(128) NOT NULL COMMENT '幂等键',
    `error_message` TEXT COMMENT '错误信息',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `finished_at` DATETIME DEFAULT NULL COMMENT '完成时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_idempotent_key` (`idempotent_key`),
    UNIQUE KEY `uk_task_no` (`task_no`),
    KEY `idx_drama_period` (`drama_id`, `settlement_period`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分账计算任务表';

-- 分账明细表
CREATE TABLE IF NOT EXISTS `share_details` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `detail_no` VARCHAR(64) NOT NULL COMMENT '明细编号',
    `task_id` BIGINT UNSIGNED NOT NULL COMMENT '计算任务ID',
    `drama_id` BIGINT UNSIGNED NOT NULL COMMENT '剧集ID',
    `stakeholder_id` BIGINT UNSIGNED NOT NULL COMMENT '权益方ID',
    `settlement_period` VARCHAR(20) NOT NULL COMMENT '结算周期(YYYYMM)',
    `revenue_type` TINYINT NOT NULL DEFAULT 1 COMMENT '收入类型：1-播放收入 2-付费收入',
    `total_revenue` DECIMAL(18,2) NOT NULL DEFAULT 0.00 COMMENT '总收入',
    `share_ratio` DECIMAL(8,4) NOT NULL DEFAULT 0.0000 COMMENT '分账比例',
    `share_amount` DECIMAL(18,2) NOT NULL DEFAULT 0.00 COMMENT '分账金额',
    `rule_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '应用的分账规则ID',
    `calculation_log` TEXT COMMENT '计算过程日志',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_detail_no` (`detail_no`),
    KEY `idx_task_id` (`task_id`),
    KEY `idx_drama_stakeholder_period` (`drama_id`, `stakeholder_id`, `settlement_period`),
    KEY `idx_settlement_period` (`settlement_period`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分账明细表';

-- 结算单表(不可篡改)
CREATE TABLE IF NOT EXISTS `settlement_orders` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `settlement_no` VARCHAR(64) NOT NULL COMMENT '结算单号',
    `stakeholder_id` BIGINT UNSIGNED NOT NULL COMMENT '权益方ID',
    `settlement_period` VARCHAR(20) NOT NULL COMMENT '结算周期(YYYYMM)',
    `total_share_amount` DECIMAL(18,2) NOT NULL DEFAULT 0.00 COMMENT '分账总金额',
    `deduction_amount` DECIMAL(18,2) NOT NULL DEFAULT 0.00 COMMENT '扣款金额',
    `actual_settlement_amount` DECIMAL(18,2) NOT NULL DEFAULT 0.00 COMMENT '实际结算金额',
    `tail_diff_amount` DECIMAL(18,2) NOT NULL DEFAULT 0.00 COMMENT '尾差金额',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-待确认 1-已确认 2-已付款 3-已驳回',
    `hash_signature` VARCHAR(512) NOT NULL COMMENT '数据哈希签名(防篡改)',
    `confirmed_by` BIGINT UNSIGNED DEFAULT NULL COMMENT '确认人',
    `confirmed_at` DATETIME DEFAULT NULL COMMENT '确认时间',
    `paid_at` DATETIME DEFAULT NULL COMMENT '付款时间',
    `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
    `created_by` BIGINT UNSIGNED NOT NULL COMMENT '创建人',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_settlement_no` (`settlement_no`),
    UNIQUE KEY `uk_stakeholder_period` (`stakeholder_id`, `settlement_period`),
    KEY `idx_stakeholder_id` (`stakeholder_id`),
    KEY `idx_settlement_period` (`settlement_period`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='结算单表';

-- 结算单明细表
CREATE TABLE IF NOT EXISTS `settlement_order_details` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `settlement_order_id` BIGINT UNSIGNED NOT NULL COMMENT '结算单ID',
    `share_detail_id` BIGINT UNSIGNED NOT NULL COMMENT '分账明细ID',
    `drama_id` BIGINT UNSIGNED NOT NULL COMMENT '剧集ID',
    `revenue_type` TINYINT NOT NULL COMMENT '收入类型',
    `share_amount` DECIMAL(18,2) NOT NULL DEFAULT 0.00 COMMENT '分账金额',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_settlement_order_id` (`settlement_order_id`),
    KEY `idx_share_detail_id` (`share_detail_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='结算单明细表';

-- 对账记录表
CREATE TABLE IF NOT EXISTS `reconciliation_records` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `reconciliation_no` VARCHAR(64) NOT NULL COMMENT '对账编号',
    `drama_id` BIGINT UNSIGNED NOT NULL COMMENT '剧集ID',
    `settlement_period` VARCHAR(20) NOT NULL COMMENT '结算周期(YYYYMM)',
    `system_play_count` BIGINT NOT NULL DEFAULT 0 COMMENT '系统播放量',
    `third_party_play_count` BIGINT NOT NULL DEFAULT 0 COMMENT '第三方播放量',
    `play_count_diff` BIGINT NOT NULL DEFAULT 0 COMMENT '播放量差异',
    `system_payment_amount` DECIMAL(18,2) NOT NULL DEFAULT 0.00 COMMENT '系统付费金额',
    `third_party_payment_amount` DECIMAL(18,2) NOT NULL DEFAULT 0.00 COMMENT '第三方付费金额',
    `payment_amount_diff` DECIMAL(18,2) NOT NULL DEFAULT 0.00 COMMENT '付费金额差异',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-待对账 1-对账一致 2-对账差异 3-已调整',
    `adjustment_remark` VARCHAR(500) DEFAULT NULL COMMENT '调整说明',
    `created_by` BIGINT UNSIGNED NOT NULL COMMENT '创建人',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `reconciled_at` DATETIME DEFAULT NULL COMMENT '对账时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_reconciliation_no` (`reconciliation_no`),
    UNIQUE KEY `uk_drama_period` (`drama_id`, `settlement_period`),
    KEY `idx_settlement_period` (`settlement_period`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='对账记录表';

-- 对账差异明细表
CREATE TABLE IF NOT EXISTS `reconciliation_details` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `reconciliation_id` BIGINT UNSIGNED NOT NULL COMMENT '对账记录ID',
    `data_type` TINYINT NOT NULL COMMENT '数据类型：1-播放数据 2-付费数据',
    `data_date` DATE NOT NULL COMMENT '数据日期',
    `system_value` DECIMAL(18,2) NOT NULL DEFAULT 0.00 COMMENT '系统值',
    `third_party_value` DECIMAL(18,2) NOT NULL DEFAULT 0.00 COMMENT '第三方值',
    `diff_value` DECIMAL(18,2) NOT NULL DEFAULT 0.00 COMMENT '差异值',
    `diff_ratio` DECIMAL(8,4) NOT NULL DEFAULT 0.0000 COMMENT '差异比例',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_reconciliation_id` (`reconciliation_id`),
    KEY `idx_data_date` (`data_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='对账差异明细表';

-- 版权授权表
CREATE TABLE IF NOT EXISTS `copyright_authorizations` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `authorization_no` VARCHAR(64) NOT NULL COMMENT '授权编号',
    `drama_id` BIGINT UNSIGNED NOT NULL COMMENT '剧集ID',
    `authorizer_id` BIGINT UNSIGNED NOT NULL COMMENT '授权方ID',
    `licensee_id` BIGINT UNSIGNED NOT NULL COMMENT '被授权方ID',
    `authorization_type` TINYINT NOT NULL DEFAULT 1 COMMENT '授权类型：1-独家授权 2-非独家授权 3-转授权',
    `authorization_scope` VARCHAR(200) NOT NULL COMMENT '授权范围(地区/平台等)',
    `rights_type` VARCHAR(100) NOT NULL COMMENT '授权权利类型(播放权、改编权等)',
    `effective_date` DATE NOT NULL COMMENT '生效日期',
    `expire_date` DATE NOT NULL COMMENT '失效日期',
    `authorization_fee` DECIMAL(18,2) DEFAULT NULL COMMENT '授权费用',
    `contract_no` VARCHAR(100) DEFAULT NULL COMMENT '合同编号',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-待生效 1-已生效 2-已过期 3-已撤销',
    `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
    `created_by` BIGINT UNSIGNED NOT NULL COMMENT '创建人',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `revoked_at` DATETIME DEFAULT NULL COMMENT '撤销时间',
    `revoked_by` BIGINT UNSIGNED DEFAULT NULL COMMENT '撤销人',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_authorization_no` (`authorization_no`),
    KEY `idx_drama_id` (`drama_id`),
    KEY `idx_authorizer_id` (`authorizer_id`),
    KEY `idx_licensee_id` (`licensee_id`),
    KEY `idx_effective_date` (`effective_date`),
    KEY `idx_expire_date` (`expire_date`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='版权授权表';

-- 操作日志表
CREATE TABLE IF NOT EXISTS `operation_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '操作人ID',
    `username` VARCHAR(50) NOT NULL COMMENT '操作人用户名',
    `module` VARCHAR(50) NOT NULL COMMENT '操作模块',
    `operation` VARCHAR(100) NOT NULL COMMENT '操作类型',
    `method` VARCHAR(20) DEFAULT NULL COMMENT '请求方法',
    `path` VARCHAR(200) DEFAULT NULL COMMENT '请求路径',
    `params` TEXT COMMENT '请求参数',
    `result` TINYINT DEFAULT NULL COMMENT '操作结果：0-失败 1-成功',
    `error_msg` VARCHAR(500) DEFAULT NULL COMMENT '错误信息',
    `ip` VARCHAR(50) DEFAULT NULL COMMENT 'IP地址',
    `user_agent` VARCHAR(500) DEFAULT NULL COMMENT '用户代理',
    `execution_time` INT DEFAULT NULL COMMENT '执行时长(毫秒)',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_module` (`module`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- 初始化管理员用户 (密码: admin123)
INSERT INTO `users` (`username`, `password`, `real_name`, `role`, `status`) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '系统管理员', 3, 1);
