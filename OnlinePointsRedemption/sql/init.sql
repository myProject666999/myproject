-- ============================================================
-- 在线积分商城/兑换系统 数据库脚本
-- Database: online_points_mall
-- ============================================================

CREATE DATABASE IF NOT EXISTS `online_points_mall` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `online_points_mall`;

-- -----------------------------------------------------------
-- 用户表
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    `username`    VARCHAR(64)     NOT NULL COMMENT '用户名',
    `nickname`    VARCHAR(64)     NOT NULL DEFAULT '' COMMENT '昵称',
    `avatar`      VARCHAR(255)    NOT NULL DEFAULT '' COMMENT '头像URL',
    `mobile`      VARCHAR(20)     NOT NULL DEFAULT '' COMMENT '手机号',
    `email`       VARCHAR(128)    NOT NULL DEFAULT '' COMMENT '邮箱',
    `status`      TINYINT         NOT NULL DEFAULT 1 COMMENT '状态:1-正常,0-禁用',
    `created_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`),
    KEY `idx_mobile` (`mobile`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- -----------------------------------------------------------
-- 积分账户表（用户总积分）
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `points_account`;
CREATE TABLE `points_account` (
    `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '账户ID',
    `user_id`         BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `total_points`    INT             NOT NULL DEFAULT 0 COMMENT '总积分',
    `available_points` INT            NOT NULL DEFAULT 0 COMMENT '可用积分',
    `frozen_points`   INT             NOT NULL DEFAULT 0 COMMENT '冻结积分',
    `version`         INT             NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
    `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='积分账户表';

-- -----------------------------------------------------------
-- 积分获取规则表
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `points_rules`;
CREATE TABLE `points_rules` (
    `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '规则ID',
    `rule_code`   VARCHAR(64)     NOT NULL COMMENT '规则编码(如:SIGN_DAILY,CONSUME_BONUS)',
    `rule_name`   VARCHAR(128)    NOT NULL COMMENT '规则名称',
    `description` VARCHAR(255)    NOT NULL DEFAULT '' COMMENT '规则描述',
    `points`      INT             NOT NULL DEFAULT 0 COMMENT '积分值(正为获得,负为消耗)',
    `rule_type`   TINYINT         NOT NULL DEFAULT 1 COMMENT '类型:1-获取规则,2-消耗规则',
    `daily_limit` INT             NOT NULL DEFAULT 0 COMMENT '每日限额(0=不限)',
    `status`      TINYINT         NOT NULL DEFAULT 1 COMMENT '状态:1-启用,0-禁用',
    `created_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_rule_code` (`rule_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='积分获取规则表';

-- -----------------------------------------------------------
-- 积分明细表（积分流水）
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `points_detail`;
CREATE TABLE `points_detail` (
    `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '明细ID',
    `user_id`      BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `rule_code`    VARCHAR(64)     NOT NULL COMMENT '规则编码',
    `change_points` INT            NOT NULL COMMENT '变动积分(正为收入,负为支出)',
    `balance_before` INT           NOT NULL COMMENT '变动前积分余额',
    `balance_after`  INT           NOT NULL COMMENT '变动后积分余额',
    `order_no`     VARCHAR(64)     NOT NULL DEFAULT '' COMMENT '关联订单号(兑换时有值)',
    `remark`       VARCHAR(255)    NOT NULL DEFAULT '' COMMENT '备注',
    `created_at`   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_created_at` (`created_at`),
    KEY `idx_user_created` (`user_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='积分明细表';

-- -----------------------------------------------------------
-- 商品表
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '商品ID',
    `product_code`  VARCHAR(64)     NOT NULL COMMENT '商品编码',
    `product_name`  VARCHAR(128)    NOT NULL COMMENT '商品名称',
    `description`   TEXT            COMMENT '商品描述',
    `image_url`     VARCHAR(255)    NOT NULL DEFAULT '' COMMENT '商品图片',
    `category_id`   BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '分类ID',
    `points_price`  INT             NOT NULL COMMENT '积分价格',
    `original_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '原价',
    `status`        TINYINT         NOT NULL DEFAULT 1 COMMENT '状态:1-上架,0-下架',
    `sort_order`    INT             NOT NULL DEFAULT 0 COMMENT '排序(小在前)',
    `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_product_code` (`product_code`),
    KEY `idx_category_id` (`category_id`),
    KEY `idx_status_sort` (`status`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- -----------------------------------------------------------
-- 商品库存表（DB 持久化层，Redis 做原子扣减）
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `product_stock`;
CREATE TABLE `product_stock` (
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '库存ID',
    `product_id`    BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
    `total_stock`   INT             NOT NULL DEFAULT 0 COMMENT '总库存',
    `available_stock` INT           NOT NULL DEFAULT 0 COMMENT '可用库存',
    `frozen_stock`  INT             NOT NULL DEFAULT 0 COMMENT '冻结库存',
    `version`       INT             NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
    `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品库存表';

-- -----------------------------------------------------------
-- 兑换订单表
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `redemption_orders`;
CREATE TABLE `redemption_orders` (
    `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '订单ID',
    `order_no`        VARCHAR(64)     NOT NULL COMMENT '订单号',
    `user_id`         BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `product_id`      BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
    `product_name`    VARCHAR(128)    NOT NULL COMMENT '商品名称(快照)',
    `product_image`   VARCHAR(255)    NOT NULL DEFAULT '' COMMENT '商品图片(快照)',
    `points_price`    INT             NOT NULL COMMENT '积分价格(快照)',
    `quantity`        INT             NOT NULL DEFAULT 1 COMMENT '兑换数量',
    `total_points`    INT             NOT NULL COMMENT '消耗总积分',
    `status`          TINYINT         NOT NULL DEFAULT 0 COMMENT '订单状态:0-待处理,1-已发货,2-已完成,3-已取消,4-已退款',
    `consignee_name`  VARCHAR(64)     NOT NULL DEFAULT '' COMMENT '收货人姓名',
    `consignee_phone` VARCHAR(20)     NOT NULL DEFAULT '' COMMENT '收货人电话',
    `consignee_address` VARCHAR(255)  NOT NULL DEFAULT '' COMMENT '收货地址',
    `express_no`      VARCHAR(64)     NOT NULL DEFAULT '' COMMENT '快递单号',
    `express_company` VARCHAR(64)     NOT NULL DEFAULT '' COMMENT '快递公司',
    `cancel_reason`   VARCHAR(255)    NOT NULL DEFAULT '' COMMENT '取消原因',
    `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `shipped_at`      DATETIME        NULL COMMENT '发货时间',
    `completed_at`    DATETIME        NULL COMMENT '完成时间',
    `cancelled_at`    DATETIME        NULL COMMENT '取消时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_order_no` (`order_no`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_status` (`status`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='兑换订单表';

-- -----------------------------------------------------------
-- 商品分类表
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `product_categories`;
CREATE TABLE `product_categories` (
    `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '分类ID',
    `parent_id`   BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '父分类ID',
    `category_name` VARCHAR(64)   NOT NULL COMMENT '分类名称',
    `icon`        VARCHAR(255)    NOT NULL DEFAULT '' COMMENT '分类图标',
    `sort_order`  INT             NOT NULL DEFAULT 0 COMMENT '排序',
    `status`      TINYINT         NOT NULL DEFAULT 1 COMMENT '状态:1-正常,0-禁用',
    `created_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品分类表';

-- ============================================================
-- 初始化数据
-- ============================================================

-- 初始用户
INSERT INTO `users` (`id`, `username`, `nickname`, `mobile`, `status`) VALUES
(1, 'admin',    '超级管理员', '13800000000', 1),
(2, 'user001',  '张三',       '13800000001', 1),
(3, 'user002',  '李四',       '13800000002', 1),
(4, 'user003',  '王五',       '13800000003', 1),
(5, 'user004',  '赵六',       '13800000004', 1);

-- 初始积分账户
INSERT INTO `points_account` (`user_id`, `total_points`, `available_points`, `frozen_points`) VALUES
(1, 10000, 10000, 0),
(2, 5000,  5000,  0),
(3, 3000,  3000,  0),
(4, 8000,  8000,  0),
(5, 1500,  1500,  0);

-- 积分规则
INSERT INTO `points_rules` (`rule_code`, `rule_name`, `description`, `points`, `rule_type`, `daily_limit`, `status`) VALUES
('SIGN_DAILY',      '每日签到',        '每日签到获得积分',            10,   1, 1, 1),
('CONSUME_BONUS',   '消费奖励',        '消费金额转换积分',            5,    1, 0, 1),
('INVITE_FRIEND',   '邀请好友',        '邀请新用户注册获得积分',       50,   1, 0, 1),
('SHARE_ARTICLE',   '分享文章',        '分享内容到社交平台',           5,    1, 1, 1),
('COMPLETE_PROFILE','完善资料',        '完善个人资料获得积分',         30,   1, 1, 1),
('BIRTHDAY_GIFT',   '生日礼包',        '用户生日当天赠送积分',         100,  1, 1, 1),
('EXCHANGE_PRODUCT','积分兑换商品',    '使用积分兑换商品',             0,    2, 0, 1);

-- 商品分类
INSERT INTO `product_categories` (`id`, `parent_id`, `category_name`, `sort_order`, `status`) VALUES
(1, 0, '实物商品', 1, 1),
(2, 0, '虚拟权益', 2, 1),
(3, 1, '生活用品', 1, 1),
(4, 1, '数码配件', 2, 1),
(5, 2, '优惠券',   1, 1),
(6, 2, '会员卡',   2, 1);

-- 商品数据
INSERT INTO `products` (`product_code`, `product_name`, `description`, `category_id`, `points_price`, `original_price`, `status`, `sort_order`) VALUES
('P001', '精美马克杯',     '陶瓷马克杯，容量350ml',                    3, 500,   29.90,  1, 1),
('P002', '蓝牙耳机',       '真无线蓝牙耳机，降噪功能',                  4, 5000,  299.00, 1, 2),
('P003', '50元优惠券',     '全场通用优惠券，满200减50',                5, 2000,  50.00,  1, 3),
('P004', 'VIP月卡',        '平台VIP会员一个月',                        6, 3000,  30.00,  1, 4),
('P005', '笔记本',         'A5精装笔记本',                             3, 800,   39.90,  1, 5),
('P006', '保温杯',         '不锈钢保温杯，500ml',                      3, 1500,  89.00,  1, 6),
('P007', '数据线',         'Type-C 快充数据线 1米',                    4, 600,   19.90,  1, 7),
('P008', '10元优惠券',     '无门槛优惠券',                             5, 500,   10.00,  1, 8);

-- 商品库存
INSERT INTO `product_stock` (`product_id`, `total_stock`, `available_stock`, `frozen_stock`) VALUES
(1, 100, 100, 0),
(2, 50,  50,  0),
(3, 200, 200, 0),
(4, 300, 300, 0),
(5, 150, 150, 0),
(6, 80,  80,  0),
(7, 500, 500, 0),
(8, 1000,1000,0);

-- 初始积分明细
INSERT INTO `points_detail` (`user_id`, `rule_code`, `change_points`, `balance_before`, `balance_after`, `remark`) VALUES
(2, 'SIGN_DAILY', 10, 4990, 5000, '每日签到'),
(3, 'INVITE_FRIEND', 50, 2950, 3000, '邀请好友'),
(4, 'CONSUME_BONUS', 50, 7950, 8000, '消费奖励'),
(5, 'SIGN_DAILY', 10, 1490, 1500, '每日签到');
