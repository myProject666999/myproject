-- =============================================
-- 商品比价/价格监控系统 数据库脚本
-- Database: price_monitor
-- Charset: utf8mb4
-- =============================================

CREATE DATABASE IF NOT EXISTS `price_monitor` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `price_monitor`;

-- =============================================
-- 用户表
-- =============================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    `username` VARCHAR(50) NOT NULL COMMENT '用户名',
    `password` VARCHAR(255) NOT NULL COMMENT '密码(加密)',
    `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
    `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1正常 0禁用',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`),
    KEY `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- =============================================
-- 商品分组表
-- =============================================
DROP TABLE IF EXISTS `product_groups`;
CREATE TABLE `product_groups` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '分组ID',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `name` VARCHAR(50) NOT NULL COMMENT '分组名称',
    `description` VARCHAR(255) DEFAULT NULL COMMENT '分组描述',
    `icon` VARCHAR(50) DEFAULT NULL COMMENT '分组图标',
    `sort` INT NOT NULL DEFAULT 0 COMMENT '排序',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品分组表';

-- =============================================
-- 商品监控表
-- =============================================
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '商品ID',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `group_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '分组ID',
    `title` VARCHAR(255) NOT NULL COMMENT '商品标题',
    `product_url` VARCHAR(500) NOT NULL COMMENT '商品URL',
    `platform` VARCHAR(50) DEFAULT NULL COMMENT '平台:taobao/jd/pdd等',
    `image_url` VARCHAR(500) DEFAULT NULL COMMENT '商品图片URL',
    `current_price` DECIMAL(10,2) DEFAULT NULL COMMENT '当前价格',
    `original_price` DECIMAL(10,2) DEFAULT NULL COMMENT '原价',
    `lowest_price` DECIMAL(10,2) DEFAULT NULL COMMENT '历史最低价',
    `highest_price` DECIMAL(10,2) DEFAULT NULL COMMENT '历史最高价',
    `currency` VARCHAR(10) NOT NULL DEFAULT 'CNY' COMMENT '货币',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1监控中 0已停止',
    `is_favorite` TINYINT NOT NULL DEFAULT 0 COMMENT '是否收藏:1是 0否',
    `crawl_interval` INT NOT NULL DEFAULT 3600 COMMENT '抓取间隔(秒)',
    `last_crawl_at` DATETIME DEFAULT NULL COMMENT '最后抓取时间',
    `next_crawl_at` DATETIME DEFAULT NULL COMMENT '下次抓取时间',
    `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_group_id` (`group_id`),
    KEY `idx_next_crawl_at` (`next_crawl_at`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品监控表';

-- =============================================
-- 价格历史表
-- =============================================
DROP TABLE IF EXISTS `price_history`;
CREATE TABLE `price_history` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '历史ID',
    `product_id` BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
    `price` DECIMAL(10,2) NOT NULL COMMENT '价格',
    `original_price` DECIMAL(10,2) DEFAULT NULL COMMENT '原价',
    `discount` DECIMAL(5,2) DEFAULT NULL COMMENT '折扣率',
    `stock_status` VARCHAR(20) DEFAULT NULL COMMENT '库存状态:in_stock/out_of_stock',
    `crawled_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '抓取时间',
    `source` VARCHAR(20) DEFAULT 'auto' COMMENT '来源:auto/manual',
    PRIMARY KEY (`id`),
    KEY `idx_product_id` (`product_id`),
    KEY `idx_crawled_at` (`crawled_at`),
    KEY `idx_product_crawled` (`product_id`, `crawled_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='价格历史表';

-- =============================================
-- 提醒设置表
-- =============================================
DROP TABLE IF EXISTS `alert_settings`;
CREATE TABLE `alert_settings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '提醒ID',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `product_id` BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
    `alert_type` VARCHAR(20) NOT NULL COMMENT '提醒类型:price_drop/below_threshold/daily/weekly',
    `threshold_price` DECIMAL(10,2) DEFAULT NULL COMMENT '价格阈值',
    `threshold_percent` DECIMAL(5,2) DEFAULT NULL COMMENT '降价百分比阈值',
    `notify_email` TINYINT NOT NULL DEFAULT 1 COMMENT '邮件通知:1是 0否',
    `notify_sms` TINYINT NOT NULL DEFAULT 0 COMMENT '短信通知:1是 0否',
    `notify_wechat` TINYINT NOT NULL DEFAULT 0 COMMENT '微信通知:1是 0否',
    `notify_webpush` TINYINT NOT NULL DEFAULT 1 COMMENT '网页推送:1是 0否',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1启用 0禁用',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_product_id` (`product_id`),
    UNIQUE KEY `uk_user_product_type` (`user_id`, `product_id`, `alert_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='提醒设置表';

-- =============================================
-- 提醒记录表
-- =============================================
DROP TABLE IF EXISTS `alert_logs`;
CREATE TABLE `alert_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '记录ID',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `product_id` BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
    `alert_type` VARCHAR(20) NOT NULL COMMENT '提醒类型',
    `old_price` DECIMAL(10,2) DEFAULT NULL COMMENT '原价格',
    `new_price` DECIMAL(10,2) DEFAULT NULL COMMENT '新价格',
    `change_amount` DECIMAL(10,2) DEFAULT NULL COMMENT '变化金额',
    `change_percent` DECIMAL(5,2) DEFAULT NULL COMMENT '变化百分比',
    `message` VARCHAR(500) DEFAULT NULL COMMENT '提醒消息',
    `notify_channels` VARCHAR(100) DEFAULT NULL COMMENT '通知渠道:email,sms,wechat',
    `is_read` TINYINT NOT NULL DEFAULT 0 COMMENT '是否已读:1是 0否',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_product_id` (`product_id`),
    KEY `idx_is_read` (`is_read`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='提醒记录表';

-- =============================================
-- 抓取任务日志表
-- =============================================
DROP TABLE IF EXISTS `crawl_logs`;
CREATE TABLE `crawl_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
    `product_id` BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
    `status` VARCHAR(20) NOT NULL COMMENT '状态:success/failed/timeout',
    `response_code` INT DEFAULT NULL COMMENT 'HTTP响应码',
    `response_time` INT DEFAULT NULL COMMENT '响应时间(ms)',
    `error_message` VARCHAR(500) DEFAULT NULL COMMENT '错误信息',
    `user_agent` VARCHAR(255) DEFAULT NULL COMMENT 'User-Agent',
    `proxy_used` VARCHAR(100) DEFAULT NULL COMMENT '使用的代理',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_product_id` (`product_id`),
    KEY `idx_status` (`status`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='抓取任务日志表';

-- =============================================
-- 反爬配置表
-- =============================================
DROP TABLE IF EXISTS `anti_crawl_config`;
CREATE TABLE `anti_crawl_config` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '配置ID',
    `platform` VARCHAR(50) NOT NULL COMMENT '平台标识',
    `base_url` VARCHAR(255) NOT NULL COMMENT '基础URL',
    `min_interval` INT NOT NULL DEFAULT 5 COMMENT '最小间隔(秒)',
    `max_interval` INT NOT NULL DEFAULT 60 COMMENT '最大间隔(秒)',
    `retry_count` INT NOT NULL DEFAULT 3 COMMENT '重试次数',
    `retry_delay` INT NOT NULL DEFAULT 10 COMMENT '重试延迟(秒)',
    `timeout` INT NOT NULL DEFAULT 30 COMMENT '超时时间(秒)',
    `user_agents` TEXT COMMENT 'User-Agent池(JSON数组)',
    `proxies` TEXT COMMENT '代理池(JSON数组)',
    `cookie_strategy` VARCHAR(20) DEFAULT 'random' COMMENT 'Cookie策略:random/fixed',
    `cookies` TEXT COMMENT 'Cookie(JSON)',
    `headers` TEXT COMMENT '自定义请求头(JSON)',
    `js_render` TINYINT NOT NULL DEFAULT 0 COMMENT '是否需要JS渲染:1是 0否',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1启用 0禁用',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_platform` (`platform`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='反爬配置表';

-- =============================================
-- 初始化数据
-- =============================================

-- 默认用户 (密码: 123456)
INSERT INTO `users` (`username`, `password`, `email`, `status`) VALUES
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@example.com', 1);

-- 默认分组
INSERT INTO `product_groups` (`user_id`, `name`, `description`, `icon`) VALUES
(1, '电子产品', '手机、电脑等电子产品', '💻'),
(1, '服装配饰', '衣服、鞋子、配饰', '👔'),
(1, '图书音像', '书籍、音乐、视频', '📚'),
(1, '食品饮料', '零食、饮料、生鲜', '🍔');

-- 默认反爬配置
INSERT INTO `anti_crawl_config` (`platform`, `base_url`, `min_interval`, `max_interval`, `retry_count`, `retry_delay`, `timeout`, `user_agents`, `js_render`, `status`) VALUES
('generic', 'https://example.com', 3, 30, 3, 5, 30, '[
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0"
]', 0, 1);
