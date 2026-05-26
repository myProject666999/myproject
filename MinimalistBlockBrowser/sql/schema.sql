-- ============================================================
-- Minimalist Block Browser - Database Schema
-- 极简区块浏览器数据库脚本
-- ============================================================

CREATE DATABASE IF NOT EXISTS `block_browser` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `block_browser`;

-- -----------------------------------------------------------
-- 1. 缓存区块表: 缓存查询过的区块数据，减少 RPC 调用
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `cached_blocks`;
CREATE TABLE `cached_blocks` (
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `block_number`  BIGINT UNSIGNED NOT NULL COMMENT '区块高度',
    `block_hash`    VARCHAR(66)     NOT NULL COMMENT '区块哈希 (0x...)',
    `timestamp`     BIGINT UNSIGNED NOT NULL COMMENT '区块时间戳 (Unix)',
    `tx_count`      INT UNSIGNED    NOT NULL DEFAULT 0 COMMENT '交易数量',
    `miner`         VARCHAR(42)              DEFAULT NULL COMMENT '矿工地址',
    `gas_used`      VARCHAR(32)              DEFAULT NULL COMMENT '已用 Gas',
    `gas_limit`     VARCHAR(32)              DEFAULT NULL COMMENT 'Gas 上限',
    `base_fee`      VARCHAR(32)              DEFAULT NULL COMMENT '基础手续费',
    `raw_data`      JSON                     DEFAULT NULL COMMENT '完整区块 JSON 数据',
    `created_at`    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_block_number` (`block_number`),
    UNIQUE KEY `uk_block_hash` (`block_hash`),
    KEY `idx_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='缓存的区块数据';

-- -----------------------------------------------------------
-- 2. 缓存交易表: 缓存查询过的交易数据
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `cached_transactions`;
CREATE TABLE `cached_transactions` (
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `tx_hash`       VARCHAR(66)     NOT NULL COMMENT '交易哈希 (0x...)',
    `block_number`  BIGINT UNSIGNED NOT NULL COMMENT '所属区块高度',
    `from_address`  VARCHAR(42)              DEFAULT NULL COMMENT '发送方地址',
    `to_address`    VARCHAR(42)              DEFAULT NULL COMMENT '接收方地址',
    `value`         VARCHAR(32)              DEFAULT NULL COMMENT '转账金额 (wei)',
    `gas_price`     VARCHAR(32)              DEFAULT NULL COMMENT 'Gas 价格',
    `gas_used`      VARCHAR(32)              DEFAULT NULL COMMENT 'Gas 用量',
    `nonce`         VARCHAR(32)              DEFAULT NULL COMMENT '交易 nonce',
    `status`        TINYINT                  DEFAULT NULL COMMENT '交易状态 (1=成功, 0=失败)',
    `raw_data`      JSON                     DEFAULT NULL COMMENT '完整交易 JSON 数据',
    `created_at`    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_tx_hash` (`tx_hash`),
    KEY `idx_block_number` (`block_number`),
    KEY `idx_from_address` (`from_address`),
    KEY `idx_to_address` (`to_address`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='缓存的交易数据';

-- -----------------------------------------------------------
-- 3. 缓存地址表: 缓存查询过的地址信息
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `cached_addresses`;
CREATE TABLE `cached_addresses` (
    `id`                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `address`            VARCHAR(42)     NOT NULL COMMENT '以太坊地址 (0x...)',
    `balance`            VARCHAR(32)              DEFAULT NULL COMMENT 'ETH 余额 (wei)',
    `nonce`              VARCHAR(32)              DEFAULT NULL COMMENT '交易 nonce',
    `tx_count`           INT UNSIGNED             DEFAULT 0 COMMENT '交易总数',
    `is_contract`        TINYINT(1)               DEFAULT 0 COMMENT '是否为合约',
    `contract_name`      VARCHAR(128)             DEFAULT NULL COMMENT '合约名称',
    `raw_data`           JSON                     DEFAULT NULL COMMENT '完整地址 JSON 数据',
    `created_at`         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_address` (`address`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='缓存的地址信息';

-- -----------------------------------------------------------
-- 4. Gas 历史记录表: 记录 Gas 价格历史
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `gas_history`;
CREATE TABLE `gas_history` (
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `timestamp`     BIGINT UNSIGNED NOT NULL COMMENT '记录时间戳',
    `low`           VARCHAR(32)              DEFAULT NULL COMMENT '低 Gas 价格 (wei)',
    `average`       VARCHAR(32)              DEFAULT NULL COMMENT '平均 Gas 价格',
    `high`          VARCHAR(32)              DEFAULT NULL COMMENT '高 Gas 价格',
    `base_fee`      VARCHAR(32)              DEFAULT NULL COMMENT '基础手续费',
    `block_number`  BIGINT UNSIGNED          DEFAULT NULL COMMENT '对应区块高度',
    `created_at`    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Gas 价格历史记录';

-- -----------------------------------------------------------
-- 5. 查询日志表: 记录所有查询，用于统计分析
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `query_log`;
CREATE TABLE `query_log` (
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `query_type`    VARCHAR(32)     NOT NULL COMMENT '查询类型: block/transaction/address/gas/stats',
    `query_value`   VARCHAR(128)             DEFAULT NULL COMMENT '查询值 (区块号/哈希/地址)',
    `source`        VARCHAR(64)              DEFAULT NULL COMMENT '数据来源: cache/rpc',
    `response_time` INT UNSIGNED             DEFAULT NULL COMMENT '响应时间 (ms)',
    `ip_address`    VARCHAR(64)              DEFAULT NULL COMMENT '请求 IP',
    `user_agent`    VARCHAR(256)             DEFAULT NULL COMMENT 'User-Agent',
    `created_at`    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_query_type` (`query_type`),
    KEY `idx_created_at` (`created_at`),
    KEY `idx_source` (`source`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='查询日志';

-- -----------------------------------------------------------
-- 6. 系统配置表
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `sys_config`;
CREATE TABLE `sys_config` (
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `config_key`    VARCHAR(128)    NOT NULL COMMENT '配置键',
    `config_value`  TEXT                     DEFAULT NULL COMMENT '配置值',
    `description`   VARCHAR(256)             DEFAULT NULL COMMENT '描述',
    `created_at`    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置';

-- 插入默认配置
INSERT INTO `sys_config` (`config_key`, `config_value`, `description`) VALUES
('cache_ttl_block',      '300',   '区块缓存 TTL (秒)'),
('cache_ttl_transaction','3600',  '交易缓存 TTL (秒)'),
('cache_ttl_address',    '60',    '地址缓存 TTL (秒)'),
('cache_ttl_gas',        '10',    'Gas 缓存 TTL (秒)'),
('rpc_endpoint',         'https://mainnet.infura.io/v3/YOUR_PROJECT_ID', '以太坊 RPC 端点'),
('network_name',         'Ethereum Mainnet', '网络名称');

-- 数据库初始化完成
-- 默认数据库用户: root  密码: 123456