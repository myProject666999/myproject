-- =============================================
-- 在线知识付费专栏 数据库脚本
-- 数据库: MySQL 8.0+
-- =============================================

CREATE DATABASE IF NOT EXISTS knowledge_paid DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE knowledge_paid;

-- =============================================
-- 用户表
-- =============================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    `username` VARCHAR(64) NOT NULL COMMENT '用户名',
    `email` VARCHAR(128) NOT NULL COMMENT '邮箱',
    `password_hash` VARCHAR(255) NOT NULL COMMENT '密码哈希',
    `role` TINYINT NOT NULL DEFAULT 1 COMMENT '角色: 1-读者, 2-作者',
    `avatar` VARCHAR(512) DEFAULT NULL COMMENT '头像URL',
    `bio` VARCHAR(512) DEFAULT NULL COMMENT '个人简介',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-正常, 0-禁用',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`),
    UNIQUE KEY `uk_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- =============================================
-- 专栏表
-- =============================================
DROP TABLE IF EXISTS `columns`;
CREATE TABLE `columns` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '专栏ID',
    `title` VARCHAR(255) NOT NULL COMMENT '专栏标题',
    `description` TEXT COMMENT '专栏描述',
    `cover_image` VARCHAR(512) DEFAULT NULL COMMENT '封面图片URL',
    `author_id` BIGINT UNSIGNED NOT NULL COMMENT '作者ID',
    `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '订阅价格',
    `is_free` TINYINT NOT NULL DEFAULT 0 COMMENT '是否免费: 1-免费, 0-付费',
    `article_count` INT NOT NULL DEFAULT 0 COMMENT '文章数量',
    `subscriber_count` INT NOT NULL DEFAULT 0 COMMENT '订阅者数量',
    `view_count` INT NOT NULL DEFAULT 0 COMMENT '浏览次数',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-正常, 0-下架',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_author_id` (`author_id`),
    KEY `idx_status` (`status`),
    CONSTRAINT `fk_columns_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='专栏表';

-- =============================================
-- 文章表
-- =============================================
DROP TABLE IF EXISTS `articles`;
CREATE TABLE `articles` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '文章ID',
    `column_id` BIGINT UNSIGNED NOT NULL COMMENT '所属专栏ID',
    `title` VARCHAR(255) NOT NULL COMMENT '文章标题',
    `summary` VARCHAR(512) DEFAULT NULL COMMENT '文章摘要',
    `content` LONGTEXT NOT NULL COMMENT '文章完整内容',
    `trial_content` TEXT COMMENT '试读内容',
    `is_free` TINYINT NOT NULL DEFAULT 0 COMMENT '是否免费: 1-免费, 0-付费',
    `author_id` BIGINT UNSIGNED NOT NULL COMMENT '作者ID',
    `view_count` INT NOT NULL DEFAULT 0 COMMENT '浏览次数',
    `like_count` INT NOT NULL DEFAULT 0 COMMENT '点赞数',
    `comment_count` INT NOT NULL DEFAULT 0 COMMENT '评论数',
    `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序顺序',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-已发布, 0-草稿',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_column_id` (`column_id`),
    KEY `idx_author_id` (`author_id`),
    KEY `idx_status` (`status`),
    CONSTRAINT `fk_articles_column` FOREIGN KEY (`column_id`) REFERENCES `columns` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_articles_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章表';

-- =============================================
-- 订单表
-- =============================================
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '订单ID',
    `order_no` VARCHAR(64) NOT NULL COMMENT '订单编号',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `column_id` BIGINT UNSIGNED NOT NULL COMMENT '专栏ID',
    `amount` DECIMAL(10,2) NOT NULL COMMENT '订单金额',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '订单状态: 0-待支付, 1-已支付, 2-已取消, 3-已退款',
    `pay_method` VARCHAR(32) DEFAULT NULL COMMENT '支付方式: alipay/wechat',
    `paid_at` DATETIME DEFAULT NULL COMMENT '支付时间',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_order_no` (`order_no`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_column_id` (`column_id`),
    KEY `idx_status` (`status`),
    CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_orders_column` FOREIGN KEY (`column_id`) REFERENCES `columns` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- =============================================
-- 订阅表
-- =============================================
DROP TABLE IF EXISTS `subscriptions`;
CREATE TABLE `subscriptions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '订阅ID',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `column_id` BIGINT UNSIGNED NOT NULL COMMENT '专栏ID',
    `order_id` BIGINT UNSIGNED NOT NULL COMMENT '关联订单ID',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-有效, 0-已失效',
    `start_date` DATE NOT NULL COMMENT '开始日期',
    `end_date` DATE NOT NULL COMMENT '结束日期',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_column` (`user_id`, `column_id`),
    KEY `idx_order_id` (`order_id`),
    KEY `idx_status` (`status`),
    CONSTRAINT `fk_subscriptions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_subscriptions_column` FOREIGN KEY (`column_id`) REFERENCES `columns` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_subscriptions_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订阅表';

-- =============================================
-- 评论表
-- =============================================
DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '评论ID',
    `article_id` BIGINT UNSIGNED NOT NULL COMMENT '文章ID',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `content` TEXT NOT NULL COMMENT '评论内容',
    `parent_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '父评论ID(回复)',
    `like_count` INT NOT NULL DEFAULT 0 COMMENT '点赞数',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-正常, 0-删除',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_article_id` (`article_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_parent_id` (`parent_id`),
    CONSTRAINT `fk_comments_article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_comments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';

-- =============================================
-- 点赞表
-- =============================================
DROP TABLE IF EXISTS `likes`;
CREATE TABLE `likes` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '点赞ID',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `article_id` BIGINT UNSIGNED NOT NULL COMMENT '文章ID',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_article` (`user_id`, `article_id`),
    KEY `idx_article_id` (`article_id`),
    CONSTRAINT `fk_likes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_likes_article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='点赞表';

-- =============================================
-- 收入统计表
-- =============================================
DROP TABLE IF EXISTS `revenue_stats`;
CREATE TABLE `revenue_stats` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '统计ID',
    `author_id` BIGINT UNSIGNED NOT NULL COMMENT '作者ID',
    `column_id` BIGINT UNSIGNED NOT NULL COMMENT '专栏ID',
    `total_revenue` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '总收入',
    `subscriber_count` INT NOT NULL DEFAULT 0 COMMENT '订阅人数',
    `today_revenue` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '今日收入',
    `today_new_subscribers` INT NOT NULL DEFAULT 0 COMMENT '今日新增订阅',
    `stats_date` DATE NOT NULL COMMENT '统计日期',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_author_date` (`author_id`, `stats_date`),
    KEY `idx_column_date` (`column_id`, `stats_date`),
    UNIQUE KEY `uk_author_column_date` (`author_id`, `column_id`, `stats_date`),
    CONSTRAINT `fk_revenue_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_revenue_column` FOREIGN KEY (`column_id`) REFERENCES `columns` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收入统计表';

-- =============================================
-- 初始数据
-- =============================================

-- 测试用户 (密码: 123456)
INSERT INTO `users` (`username`, `email`, `password_hash`, `role`, `bio`) VALUES
('author01', 'author01@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 2, '专栏作者，专注技术分享'),
('reader01', 'reader01@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 1, '爱学习的读者');

-- 测试专栏
INSERT INTO `columns` (`title`, `description`, `cover_image`, `author_id`, `price`, `is_free`) VALUES
('Go语言深度解析', '从零开始学习Go语言，涵盖基础语法、并发编程、网络编程、微服务架构等核心内容。', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400', 1, 99.00, 0),
('Vue3实战指南', '深入Vue3核心原理，手把手教你构建现代化Web应用。', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400', 1, 0.00, 1),
('数据库设计与优化', 'MySQL从入门到精通，讲解SQL优化、索引设计、分库分表等实战技巧。', 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400', 1, 149.00, 0);

-- 测试文章
INSERT INTO `articles` (`column_id`, `title`, `summary`, `content`, `trial_content`, `is_free`, `author_id`) VALUES
(1, 'Go语言入门：环境搭建与Hello World', '带你从零搭建Go开发环境，编写第一个Go程序。', '<h2>Go语言入门</h2><p>Go语言是Google开发的一门开源编程语言...</p><h3>环境搭建</h3><p>首先下载Go安装包...</p><h3>Hello World</h3><p>编写你的第一个Go程序...</p>', '<h2>Go语言入门</h2><p>Go语言是Google开发的一门开源编程语言，以简洁、高效、并发著称。本文将带你从零开始...</p><p>（以下为付费内容，请订阅专栏后阅读）</p>', 0, 1),
(1, 'Go并发编程：Goroutine与Channel', '深入理解Go语言的并发模型，掌握Goroutine和Channel的使用。', '<h2>Go并发编程</h2><p>Go语言最强大的特性之一就是其原生支持的并发编程...</p>', '<h2>Go并发编程</h2><p>并发编程是现代编程中不可或缺的技能...</p><p>（以下为付费内容）</p>', 0, 1),
(2, 'Vue3组合式API详解', '全面解析Vue3的Composition API，对比Options API的优势。', '<h2>Vue3组合式API</h2><p>Vue3引入了全新的组合式API...</p>', '<h2>Vue3组合式API</h2><p>Vue3引入了全新的组合式API，让我们一起探索它的强大之处...</p>', 1, 1),
(3, 'MySQL索引优化实战', '详解MySQL索引原理，教你如何设计高效的索引。', '<h2>MySQL索引优化</h2><p>索引是MySQL性能优化的关键...</p>', '<h2>MySQL索引优化</h2><p>索引是MySQL性能优化的关键...</p><p>（付费内容）</p>', 0, 1);

-- 测试订单
INSERT INTO `orders` (`order_no`, `user_id`, `column_id`, `amount`, `status`, `pay_method`, `paid_at`) VALUES
('ORD20260525000001', 2, 1, 99.00, 1, 'alipay', '2026-05-25 10:30:00');

-- 测试订阅
INSERT INTO `subscriptions` (`user_id`, `column_id`, `order_id`, `status`, `start_date`, `end_date`) VALUES
(2, 1, 1, 1, '2026-05-25', '2027-05-25');

-- 测试评论
INSERT INTO `comments` (`article_id`, `user_id`, `content`) VALUES
(1, 2, '写得很棒，学到了很多！'),
(3, 2, 'Vue3的组合式API真的很强大。');

-- 测试点赞
INSERT INTO `likes` (`user_id`, `article_id`) VALUES
(2, 1),
(2, 3);

-- 测试收入统计
INSERT INTO `revenue_stats` (`author_id`, `column_id`, `total_revenue`, `subscriber_count`, `today_revenue`, `today_new_subscribers`, `stats_date`) VALUES
(1, 1, 99.00, 1, 99.00, 1, '2026-05-25');
