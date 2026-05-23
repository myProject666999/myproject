-- 在线投票与抽奖系统 数据库脚本
DROP DATABASE IF EXISTS `online_voting`;
CREATE DATABASE `online_voting` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `online_voting`;

-- 用户表
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(64) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` TINYINT NOT NULL DEFAULT 1 COMMENT '1普通用户 9管理员',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 活动表
CREATE TABLE `activities` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(128) NOT NULL,
    `description` TEXT,
    `type` TINYINT NOT NULL DEFAULT 1 COMMENT '1投票 2抽奖',
    `start_time` DATETIME NOT NULL,
    `end_time` DATETIME NOT NULL,
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '1进行中 0已结束',
    `created_by` BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_type_status` (`type`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 选项表（投票选项/奖品）
CREATE TABLE `options` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `activity_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `image` VARCHAR(255),
    `vote_count` INT UNSIGNED NOT NULL DEFAULT 0,
    `sort_order` INT NOT NULL DEFAULT 0,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_activity_id` (`activity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 投票记录表
CREATE TABLE `vote_records` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `activity_id` BIGINT UNSIGNED NOT NULL,
    `option_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED DEFAULT NULL,
    `user_ip` VARCHAR(64),
    `user_agent` VARCHAR(255),
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_activity_user` (`activity_id`, `user_id`),
    KEY `idx_activity_ip` (`activity_id`, `user_ip`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 抽奖记录表
CREATE TABLE `lottery_records` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `activity_id` BIGINT UNSIGNED NOT NULL,
    `option_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED DEFAULT NULL,
    `user_ip` VARCHAR(64),
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_activity` (`activity_id`),
    KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 管理员账号 admin/123456
INSERT INTO `users` (`username`, `password`, `role`) VALUES
('admin', '$2a$10$OY1V2rR7xJ2Z1Qm9f2o7AeXkR7W3Q8z9Y6y4x3w2v1u0t9s8r7q6p5o', 9),
('user1', '$2a$10$OY1V2rR7xJ2Z1Qm9f2o7AeXkR7W3Q8z9Y6y4x3w2v1u0t9s8r7q6p5o', 1);

-- 示例投票活动
INSERT INTO `activities` (`title`, `description`, `type`, `start_time`, `end_time`, `status`, `created_by`) VALUES
('年度最佳人气选手评选', '请为你支持的选手投上宝贵的一票', 1, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY), 1, 1),
('幸运大抽奖', '参与抽奖，赢取精美礼品', 2, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 1, 1);

INSERT INTO `options` (`activity_id`, `name`, `sort_order`) VALUES
(1, '选手A - 李明', 1),
(1, '选手B - 王芳', 2),
(1, '选手C - 张伟', 3),
(1, '选手D - 刘洋', 4),
(2, '一等奖：iPhone 15 Pro', 1),
(2, '二等奖：iPad', 2),
(2, '三等奖：AirPods', 3),
(2, '感谢参与', 4);
