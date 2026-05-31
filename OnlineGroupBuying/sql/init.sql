-- =====================================================
-- 在线团购拼单系统 - 数据库脚本
-- =====================================================

CREATE DATABASE IF NOT EXISTS group_buying DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE group_buying;

-- -----------------------------------------------------
-- 用户表
-- -----------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    `username`    VARCHAR(50)  NOT NULL COMMENT '用户名',
    `password`    VARCHAR(255) NOT NULL COMMENT '密码(加密)',
    `nickname`    VARCHAR(50)  NOT NULL DEFAULT '' COMMENT '昵称',
    `avatar`      VARCHAR(255) NOT NULL DEFAULT '' COMMENT '头像',
    `phone`       VARCHAR(20)  NOT NULL DEFAULT '' COMMENT '手机号',
    `balance`     DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '账户余额',
    `role`        TINYINT      NOT NULL DEFAULT 0 COMMENT '角色:0普通用户,1管理员',
    `status`      TINYINT      NOT NULL DEFAULT 1 COMMENT '状态:0禁用,1正常',
    `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- -----------------------------------------------------
-- 商品表
-- -----------------------------------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
    `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '商品ID',
    `name`         VARCHAR(200)  NOT NULL COMMENT '商品名称',
    `description`  TEXT          NOT NULL COMMENT '商品描述',
    `images`       VARCHAR(1024) NOT NULL DEFAULT '' COMMENT '商品图片(多张逗号分隔)',
    `original_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '原价',
    `stock`        INT           NOT NULL DEFAULT 0 COMMENT '库存',
    `status`       TINYINT       NOT NULL DEFAULT 1 COMMENT '状态:0下架,1上架',
    `created_at`   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- -----------------------------------------------------
-- 拼团活动表
-- -----------------------------------------------------
DROP TABLE IF EXISTS `group_buying`;
CREATE TABLE `group_buying` (
    `id`               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '拼团ID',
    `product_id`       BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
    `initiator_id`     BIGINT UNSIGNED NOT NULL COMMENT '发起人ID',
    `title`            VARCHAR(200)  NOT NULL COMMENT '拼团标题',
    `group_price`      DECIMAL(12,2) NOT NULL COMMENT '拼团单价',
    `group_size`       INT           NOT NULL COMMENT '成团所需人数',
    `current_size`     INT           NOT NULL DEFAULT 1 COMMENT '当前参团人数',
    `status`           TINYINT       NOT NULL DEFAULT 0 COMMENT '状态:0进行中,1已成团,2已成团失败,3已取消',
    `expire_time`      DATETIME      NOT NULL COMMENT '过期时间',
    `created_at`       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_product_id` (`product_id`),
    KEY `idx_initiator_id` (`initiator_id`),
    KEY `idx_status` (`status`),
    KEY `idx_expire_time` (`expire_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='拼团活动表';

-- -----------------------------------------------------
-- 参团记录表
-- -----------------------------------------------------
DROP TABLE IF EXISTS `group_participants`;
CREATE TABLE `group_participants` (
    `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '记录ID',
    `group_id`        BIGINT UNSIGNED NOT NULL COMMENT '拼团ID',
    `user_id`         BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `order_id`        BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '订单ID',
    `join_type`       TINYINT         NOT NULL DEFAULT 1 COMMENT '参与类型:1普通参与,2团长',
    `status`          TINYINT         NOT NULL DEFAULT 0 COMMENT '状态:0待支付,1已支付,2已退款',
    `joined_at`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '参与时间',
    PRIMARY KEY (`id`),
    KEY `idx_group_id` (`group_id`),
    KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='参团记录表';

-- -----------------------------------------------------
-- 订单表
-- -----------------------------------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
    `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '订单ID',
    `order_no`        VARCHAR(64)     NOT NULL COMMENT '订单号',
    `user_id`         BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `group_id`        BIGINT UNSIGNED NOT NULL COMMENT '拼团ID',
    `product_id`      BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
    `product_name`    VARCHAR(200)    NOT NULL COMMENT '商品名称快照',
    `product_image`   VARCHAR(255)    NOT NULL DEFAULT '' COMMENT '商品图片快照',
    `unit_price`      DECIMAL(12,2)   NOT NULL COMMENT '单价',
    `quantity`        INT             NOT NULL DEFAULT 1 COMMENT '数量',
    `total_amount`    DECIMAL(12,2)   NOT NULL COMMENT '总金额',
    `pay_amount`      DECIMAL(12,2)   NOT NULL DEFAULT 0.00 COMMENT '实付金额',
    `status`          TINYINT         NOT NULL DEFAULT 0 COMMENT '状态:0待支付,1已支付,2已退款,3已取消',
    `pay_time`        DATETIME        NULL     COMMENT '支付时间',
    `refund_time`     DATETIME        NULL     COMMENT '退款时间',
    `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_order_no` (`order_no`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_group_id` (`group_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- -----------------------------------------------------
-- 退款记录表
-- -----------------------------------------------------
DROP TABLE IF EXISTS `refunds`;
CREATE TABLE `refunds` (
    `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '退款ID',
    `order_id`        BIGINT UNSIGNED NOT NULL COMMENT '订单ID',
    `user_id`         BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `group_id`        BIGINT UNSIGNED NOT NULL COMMENT '拼团ID',
    `amount`          DECIMAL(12,2)   NOT NULL COMMENT '退款金额',
    `reason`          VARCHAR(255)    NOT NULL DEFAULT '' COMMENT '退款原因',
    `status`          TINYINT         NOT NULL DEFAULT 0 COMMENT '状态:0处理中,1成功,2失败',
    `processed_at`    DATETIME        NULL     COMMENT '处理时间',
    `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_order_id` (`order_id`),
    KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='退款记录表';

-- -----------------------------------------------------
-- 初始化数据
-- -----------------------------------------------------
INSERT INTO `users` (`username`, `password`, `nickname`, `role`, `balance`) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '系统管理员', 1, 10000.00),
('user1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '用户1', 0, 5000.00),
('user2', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '用户2', 0, 5000.00),
('user3', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '用户3', 0, 5000.00);

INSERT INTO `products` (`name`, `description`, `images`, `original_price`, `stock`) VALUES
('赣南脐橙10斤装', '江西赣州特产赣南脐橙，皮薄汁多，果肉饱满，香甜可口。现摘现发，新鲜直达。', 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=400', 68.00, 500),
('烟台红富士苹果5斤', '山东烟台红富士苹果，脆甜多汁，糖心丰富。精选大果，包装精美。', 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400', 58.00, 300),
('海南金煌芒果8斤', '海南三亚金煌芒果，果肉细腻，香甜无丝。树上熟采摘，顺丰速运。', 'https://images.unsplash.com/photo-1605027990121-cbaa0a6de935?w=400', 88.00, 200),
('新疆阿克苏冰糖心苹果', '新疆阿克苏冰糖心苹果，果核透明，甜度爆表。高原种植，阳光充足。', 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400', 78.00, 400);
