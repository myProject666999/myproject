-- 创作者付费订阅会员平台数据库脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS creator_subscription_platform DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE creator_subscription_platform;

-- 1. 用户表
CREATE TABLE IF NOT EXISTS `user` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    `email` VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
    `password_hash` VARCHAR(255) NOT NULL COMMENT '密码哈希',
    `avatar_url` VARCHAR(500) COMMENT '头像URL',
    `nickname` VARCHAR(50) COMMENT '昵称',
    `bio` TEXT COMMENT '个人简介',
    `status` TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-禁用',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_email (`email`),
    INDEX idx_username (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 2. 创作者表（用户升级为创作者）
CREATE TABLE IF NOT EXISTS `creator` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '创作者ID',
    `user_id` BIGINT NOT NULL UNIQUE COMMENT '关联用户ID',
    `creator_name` VARCHAR(100) NOT NULL COMMENT '创作者名称',
    `cover_image` VARCHAR(500) COMMENT '封面图片',
    `description` TEXT COMMENT '创作者简介',
    `total_subscribers` INT DEFAULT 0 COMMENT '总订阅人数',
    `total_earnings` BIGINT DEFAULT 0 COMMENT '累计收益（分）',
    `pending_earnings` BIGINT DEFAULT 0 COMMENT '待结算收益（分）',
    `available_earnings` BIGINT DEFAULT 0 COMMENT '可提现收益（分）',
    `is_verified` TINYINT DEFAULT 0 COMMENT '是否认证：1-是，0-否',
    `status` TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-禁用',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
    INDEX idx_user_id (`user_id`),
    INDEX idx_creator_name (`creator_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='创作者表';

-- 3. 会员等级表
CREATE TABLE IF NOT EXISTS `membership_tier` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '等级ID',
    `creator_id` BIGINT NOT NULL COMMENT '创作者ID',
    `tier_name` VARCHAR(100) NOT NULL COMMENT '等级名称',
    `tier_level` INT NOT NULL COMMENT '等级层级（数字越大等级越高）',
    `price` BIGINT NOT NULL COMMENT '月费价格（分）',
    `description` TEXT COMMENT '等级描述',
    `benefits` JSON COMMENT '权益列表（JSON格式）',
    `discord_role` VARCHAR(100) COMMENT 'Discord角色',
    `is_active` TINYINT DEFAULT 1 COMMENT '是否启用：1-是，0-否',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (`creator_id`) REFERENCES `creator`(`id`),
    INDEX idx_creator_id (`creator_id`),
    INDEX idx_tier_level (`tier_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会员等级表';

-- 4. 订阅表（订阅状态机核心）
CREATE TABLE IF NOT EXISTS `subscription` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '订阅ID',
    `user_id` BIGINT NOT NULL COMMENT '订阅用户ID',
    `creator_id` BIGINT NOT NULL COMMENT '创作者ID',
    `tier_id` BIGINT NOT NULL COMMENT '会员等级ID',
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '订阅状态：PENDING-待激活, ACTIVE-活跃, PAUSED-暂停, CANCELLED-已取消, EXPIRED-已过期',
    `auto_renew` TINYINT DEFAULT 1 COMMENT '是否自动续费：1-是，0-否',
    `current_period_start` DATETIME NOT NULL COMMENT '当前周期开始时间',
    `current_period_end` DATETIME NOT NULL COMMENT '当前周期结束时间',
    `cancel_at_period_end` TINYINT DEFAULT 0 COMMENT '是否周期结束取消：1-是，0-否',
    `canceled_at` DATETIME COMMENT '取消时间',
    `last_payment_amount` BIGINT COMMENT '上次支付金额（分）',
    `last_payment_at` DATETIME COMMENT '上次支付时间',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
    FOREIGN KEY (`creator_id`) REFERENCES `creator`(`id`),
    FOREIGN KEY (`tier_id`) REFERENCES `membership_tier`(`id`),
    INDEX idx_user_creator (`user_id`, `creator_id`),
    INDEX idx_status (`status`),
    INDEX idx_current_period_end (`current_period_end`),
    INDEX idx_auto_renew (`auto_renew`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订阅表';

-- 5. 内容表
CREATE TABLE IF NOT EXISTS `content` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '内容ID',
    `creator_id` BIGINT NOT NULL COMMENT '创作者ID',
    `title` VARCHAR(200) NOT NULL COMMENT '标题',
    `content_type` VARCHAR(20) NOT NULL COMMENT '内容类型：TEXT-文字, IMAGE-图片, VIDEO-视频, AUDIO-音频, FILE-文件',
    `content` TEXT COMMENT '正文内容',
    `media_urls` JSON COMMENT '媒体文件URL列表（JSON数组）',
    `thumbnail_url` VARCHAR(500) COMMENT '缩略图URL',
    `min_tier_level` INT NOT NULL DEFAULT 0 COMMENT '最低会员等级要求（0表示公开）',
    `is_published` TINYINT DEFAULT 1 COMMENT '是否发布：1-是，0-草稿',
    `view_count` INT DEFAULT 0 COMMENT '浏览次数',
    `like_count` INT DEFAULT 0 COMMENT '点赞数',
    `comment_count` INT DEFAULT 0 COMMENT '评论数',
    `scheduled_at` DATETIME COMMENT '定时发布时间',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (`creator_id`) REFERENCES `creator`(`id`),
    INDEX idx_creator_id (`creator_id`),
    INDEX idx_min_tier_level (`min_tier_level`),
    INDEX idx_created_at (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='内容表';

-- 6. 支付记录表
CREATE TABLE IF NOT EXISTS `payment_record` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '支付记录ID',
    `order_no` VARCHAR(64) NOT NULL UNIQUE COMMENT '订单号',
    `user_id` BIGINT NOT NULL COMMENT '支付用户ID',
    `creator_id` BIGINT NOT NULL COMMENT '创作者ID',
    `subscription_id` BIGINT COMMENT '关联订阅ID',
    `tier_id` BIGINT NOT NULL COMMENT '会员等级ID',
    `amount` BIGINT NOT NULL COMMENT '支付金额（分）',
    `platform_fee` BIGINT NOT NULL COMMENT '平台抽成（分）',
    `creator_earning` BIGINT NOT NULL COMMENT '创作者实际收入（分）',
    `fee_rate` DECIMAL(5,2) NOT NULL COMMENT '抽成比例（%）',
    `payment_method` VARCHAR(20) COMMENT '支付方式：ALIPAY-支付宝, WECHAT-微信, CARD-信用卡',
    `payment_status` VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '支付状态：PENDING-待支付, SUCCESS-成功, FAILED-失败, REFUNDED-已退款',
    `transaction_id` VARCHAR(100) COMMENT '第三方交易号',
    `paid_at` DATETIME COMMENT '支付完成时间',
    `refunded_at` DATETIME COMMENT '退款时间',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
    FOREIGN KEY (`creator_id`) REFERENCES `creator`(`id`),
    FOREIGN KEY (`subscription_id`) REFERENCES `subscription`(`id`),
    FOREIGN KEY (`tier_id`) REFERENCES `membership_tier`(`id`),
    INDEX idx_order_no (`order_no`),
    INDEX idx_user_id (`user_id`),
    INDEX idx_creator_id (`creator_id`),
    INDEX idx_payment_status (`payment_status`),
    INDEX idx_created_at (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支付记录表';

-- 7. 收益明细表
CREATE TABLE IF NOT EXISTS `earning_detail` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '收益明细ID',
    `creator_id` BIGINT NOT NULL COMMENT '创作者ID',
    `user_id` BIGINT NOT NULL COMMENT '订阅用户ID',
    `subscription_id` BIGINT COMMENT '关联订阅ID',
    `payment_record_id` BIGINT COMMENT '关联支付记录ID',
    `type` VARCHAR(20) NOT NULL COMMENT '收益类型：SUBSCRIPTION-订阅, TIP-打赏, OTHER-其他',
    `amount` BIGINT NOT NULL COMMENT '收益金额（分）',
    `platform_fee` BIGINT NOT NULL COMMENT '平台抽成（分）',
    `settlement_status` VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '结算状态：PENDING-待结算, SETTLED-已结算, WITHDRAWN-已提现',
    `settled_at` DATETIME COMMENT '结算时间',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (`creator_id`) REFERENCES `creator`(`id`),
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
    FOREIGN KEY (`subscription_id`) REFERENCES `subscription`(`id`),
    FOREIGN KEY (`payment_record_id`) REFERENCES `payment_record`(`id`),
    INDEX idx_creator_id (`creator_id`),
    INDEX idx_settlement_status (`settlement_status`),
    INDEX idx_created_at (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收益明细表';

-- 8. 提现记录表
CREATE TABLE IF NOT EXISTS `withdrawal_record` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '提现记录ID',
    `withdrawal_no` VARCHAR(64) NOT NULL UNIQUE COMMENT '提现单号',
    `creator_id` BIGINT NOT NULL COMMENT '创作者ID',
    `amount` BIGINT NOT NULL COMMENT '提现金额（分）',
    `fee` BIGINT DEFAULT 0 COMMENT '提现手续费（分）',
    `actual_amount` BIGINT NOT NULL COMMENT '实际到账金额（分）',
    `withdrawal_method` VARCHAR(20) NOT NULL COMMENT '提现方式：ALIPAY-支付宝, WECHAT-微信, BANK-银行卡',
    `account_info` JSON NOT NULL COMMENT '账户信息（JSON格式）',
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '提现状态：PENDING-待审核, PROCESSING-处理中, SUCCESS-成功, FAILED-失败',
    `remark` VARCHAR(500) COMMENT '备注',
    `processed_at` DATETIME COMMENT '处理时间',
    `completed_at` DATETIME COMMENT '完成时间',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (`creator_id`) REFERENCES `creator`(`id`),
    INDEX idx_withdrawal_no (`withdrawal_no`),
    INDEX idx_creator_id (`creator_id`),
    INDEX idx_status (`status`),
    INDEX idx_created_at (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='提现记录表';

-- 9. 平台配置表
CREATE TABLE IF NOT EXISTS `platform_config` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '配置ID',
    `config_key` VARCHAR(100) NOT NULL UNIQUE COMMENT '配置键',
    `config_value` TEXT NOT NULL COMMENT '配置值',
    `description` VARCHAR(500) COMMENT '配置描述',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_config_key (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='平台配置表';

-- 10. 内容评论表
CREATE TABLE IF NOT EXISTS `content_comment` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '评论ID',
    `content_id` BIGINT NOT NULL COMMENT '内容ID',
    `user_id` BIGINT NOT NULL COMMENT '评论用户ID',
    `parent_id` BIGINT DEFAULT 0 COMMENT '父评论ID（0表示一级评论）',
    `comment_text` TEXT NOT NULL COMMENT '评论内容',
    `like_count` INT DEFAULT 0 COMMENT '点赞数',
    `is_deleted` TINYINT DEFAULT 0 COMMENT '是否删除：1-是，0-否',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (`content_id`) REFERENCES `content`(`id`),
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
    INDEX idx_content_id (`content_id`),
    INDEX idx_parent_id (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='内容评论表';

-- 11. 内容点赞表
CREATE TABLE IF NOT EXISTS `content_like` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '点赞ID',
    `content_id` BIGINT NOT NULL COMMENT '内容ID',
    `user_id` BIGINT NOT NULL COMMENT '点赞用户ID',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (`content_id`) REFERENCES `content`(`id`),
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
    UNIQUE KEY uk_content_user (`content_id`, `user_id`),
    INDEX idx_content_id (`content_id`),
    INDEX idx_user_id (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='内容点赞表';

-- 插入初始平台配置数据
INSERT INTO `platform_config` (`config_key`, `config_value`, `description`) VALUES
('platform.fee.rate', '10', '平台抽成比例（%）'),
('platform.min.withdrawal', '10000', '最低提现金额（分，即100元）'),
('platform.settlement.days', '7', '收益结算天数（天后可提现）'),
('platform.subscription.trial.days', '0', '免费试用天数');

-- 插入测试数据
-- 测试用户
INSERT INTO `user` (`username`, `email`, `password_hash`, `nickname`, `bio`) VALUES
('user1', 'user1@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '普通用户A', '热爱学习的用户'),
('creator1', 'creator1@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '科技博主', '专注科技领域的创作者');

-- 测试创作者
INSERT INTO `creator` (`user_id`, `creator_name`, `description`, `is_verified`) VALUES
(2, '科技博主官方', '分享最前沿的科技资讯和产品评测', 1);

-- 测试会员等级
INSERT INTO `membership_tier` (`creator_id`, `tier_name`, `tier_level`, `price`, `description`, `benefits`) VALUES
(1, '基础会员', 1, 990, '基础会员，解锁部分专属内容', '["每周1篇专属文章", "社区讨论权限"]'),
(1, '高级会员', 2, 2990, '高级会员，解锁大部分专属内容', '["所有专属文章", "每周视频内容", "Discord专属频道", "每月直播"]'),
(1, '至尊会员', 3, 9990, '至尊会员，解锁全部内容和专属服务', '["所有内容抢先看", "一对一咨询", "专属礼物", "线下活动优先"]');
