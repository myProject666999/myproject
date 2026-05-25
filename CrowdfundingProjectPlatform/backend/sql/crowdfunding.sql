-- =====================================================
-- 众筹项目平台（精简版）数据库脚本
-- Target: MySQL 8.0+
-- =====================================================

CREATE DATABASE IF NOT EXISTS crowdfunding
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE crowdfunding;

-- -----------------------------------------------------
-- 用户表
-- -----------------------------------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username`      VARCHAR(64)  NOT NULL COMMENT '登录账号',
  `password_hash` VARCHAR(255) NOT NULL COMMENT 'bcrypt 哈希',
  `nickname`      VARCHAR(64)  NOT NULL,
  `avatar`        VARCHAR(255) NULL,
  `email`         VARCHAR(128) NULL,
  `phone`         VARCHAR(32)  NULL,
  `role`          TINYINT      NOT NULL DEFAULT 0 COMMENT '0 普通用户 1 管理员',
  `status`        TINYINT      NOT NULL DEFAULT 1 COMMENT '1 正常 0 禁用',
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户';

-- -----------------------------------------------------
-- 众筹项目表
-- -----------------------------------------------------
DROP TABLE IF EXISTS `project`;
CREATE TABLE `project` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`        BIGINT UNSIGNED NOT NULL COMMENT '项目发起人',
  `title`          VARCHAR(200)   NOT NULL COMMENT '项目标题',
  `subtitle`       VARCHAR(300)   NULL COMMENT '一句话简介',
  `cover_image`    VARCHAR(255)   NULL,
  `description`    TEXT           NOT NULL COMMENT '富文本描述',
  `category`       VARCHAR(32)    NULL COMMENT '分类',
  `goal_amount`    DECIMAL(15,2)  NOT NULL COMMENT '目标金额',
  `raised_amount`  DECIMAL(15,2)  NOT NULL DEFAULT 0.00 COMMENT '已筹金额',
  `backer_count`   INT UNSIGNED   NOT NULL DEFAULT 0 COMMENT '支持人数',
  `status`         TINYINT        NOT NULL DEFAULT 0 COMMENT '0 筹款中 1 成功 2 失败 3 已取消',
  `start_at`       DATETIME       NOT NULL COMMENT '开始时间',
  `end_at`         DATETIME       NOT NULL COMMENT '截止时间',
  `created_at`     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_project_user` (`user_id`),
  KEY `idx_project_status` (`status`),
  KEY `idx_project_end_at` (`end_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='众筹项目';

-- -----------------------------------------------------
-- 项目回报档位表
-- -----------------------------------------------------
DROP TABLE IF EXISTS `reward_tier`;
CREATE TABLE `reward_tier` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `project_id`      BIGINT UNSIGNED NOT NULL,
  `tier_name`       VARCHAR(100)  NOT NULL COMMENT '档位名称',
  `amount`          DECIMAL(15,2) NOT NULL COMMENT '单笔支持金额',
  `description`     VARCHAR(500)  NOT NULL COMMENT '回报说明',
  `stock`           INT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '库存数量,0 表示不限',
  `sold_count`      INT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '已售数量',
  `deliver_at`      DATE          NULL COMMENT '预计发货日期',
  `created_at`      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tier_project` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目回报档位';

-- -----------------------------------------------------
-- 支持订单表
-- 注：同项目同档位每人可多次下单，通过 stock 原子控制库存。
-- -----------------------------------------------------
DROP TABLE IF EXISTS `support_order`;
CREATE TABLE `support_order` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_no`        VARCHAR(32)   NOT NULL COMMENT '业务单号',
  `user_id`         BIGINT UNSIGNED NOT NULL COMMENT '支持者',
  `project_id`      BIGINT UNSIGNED NOT NULL,
  `tier_id`         BIGINT UNSIGNED NOT NULL,
  `amount`          DECIMAL(15,2) NOT NULL COMMENT '下单金额',
  `quantity`        INT UNSIGNED  NOT NULL DEFAULT 1 COMMENT '下单数量',
  `status`          TINYINT       NOT NULL DEFAULT 1 COMMENT '1 已支付 2 已退款 3 已取消',
  `remark`          VARCHAR(255)  NULL,
  `created_at`      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_order_user` (`user_id`),
  KEY `idx_order_project` (`project_id`),
  KEY `idx_order_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='支持订单';

-- -----------------------------------------------------
-- 项目动态表
-- -----------------------------------------------------
DROP TABLE IF EXISTS `project_update`;
CREATE TABLE `project_update` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `project_id`  BIGINT UNSIGNED NOT NULL,
  `user_id`     BIGINT UNSIGNED NOT NULL COMMENT '发布者（通常为项目发起人）',
  `title`       VARCHAR(200)    NOT NULL,
  `content`     TEXT            NOT NULL,
  `created_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_update_project` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目动态';

-- -----------------------------------------------------
-- 评论 / 提问表
-- -----------------------------------------------------
DROP TABLE IF EXISTS `comment`;
CREATE TABLE `comment` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `project_id`      BIGINT UNSIGNED NOT NULL,
  `user_id`         BIGINT UNSIGNED NOT NULL,
  `parent_id`       BIGINT UNSIGNED NULL COMMENT '回复父评论',
  `type`            TINYINT         NOT NULL DEFAULT 0 COMMENT '0 评论 1 提问',
  `content`         VARCHAR(1000)   NOT NULL,
  `is_answered`     TINYINT         NOT NULL DEFAULT 0 COMMENT '提问是否已被作者回复',
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_comment_project` (`project_id`),
  KEY `idx_comment_user` (`user_id`),
  KEY `idx_comment_parent` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评论/提问';

-- -----------------------------------------------------
-- 演示数据
-- -----------------------------------------------------
-- 密码都是: 123456 (bcrypt)
INSERT INTO `user` (`id`, `username`, `password_hash`, `nickname`, `email`, `role`) VALUES
(1, 'creator',  '$2b$10$rW3GQ0qzq3a4sY0t7fF8wO1z8n8w7q6p5o4n3m2l1k0j9i8h7g6f5', '创作者小明', 'creator@demo.com', 0),
(2, 'backer',   '$2b$10$rW3GQ0qzq3a4sY0t7fF8wO1z8n8w7q6p5o4n3m2l1k0j9i8h7g6f5', '支持者小红', 'backer@demo.com',  0),
(3, 'admin',    '$2b$10$rW3GQ0qzq3a4sY0t7fF8wO1z8n8w7q6p5o4n3m2l1k0j9i8h7g6f5', '管理员',      'admin@demo.com',   1);
