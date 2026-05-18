-- 礼物心愿单数据库脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS gift_wishlist DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE gift_wishlist;

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  `nickname` VARCHAR(50) NOT NULL COMMENT '昵称',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  `birthday` DATE DEFAULT NULL COMMENT '生日',
  `password` VARCHAR(255) NOT NULL COMMENT '密码',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_username (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 好友关系表
CREATE TABLE IF NOT EXISTS `friendship` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `friend_id` BIGINT NOT NULL COMMENT '好友ID',
  `status` TINYINT DEFAULT 0 COMMENT '状态：0-待确认，1-已确认，2-已拒绝',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_user_id (`user_id`),
  INDEX idx_friend_id (`friend_id`),
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`friend_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='好友关系表';

-- 心愿单表
CREATE TABLE IF NOT EXISTS `wishlist` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '心愿单ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `title` VARCHAR(100) NOT NULL COMMENT '心愿单标题',
  `description` VARCHAR(500) DEFAULT NULL COMMENT '描述',
  `is_public` TINYINT DEFAULT 1 COMMENT '是否公开：0-私有，1-公开',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_user_id (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='心愿单表';

-- 商品表
CREATE TABLE IF NOT EXISTS `item` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '商品ID',
  `wishlist_id` BIGINT NOT NULL COMMENT '心愿单ID',
  `title` VARCHAR(200) NOT NULL COMMENT '商品标题',
  `description` VARCHAR(500) DEFAULT NULL COMMENT '商品描述',
  `url` VARCHAR(500) DEFAULT NULL COMMENT '商品链接',
  `image_url` VARCHAR(500) DEFAULT NULL COMMENT '商品图片URL',
  `price` DECIMAL(10,2) DEFAULT NULL COMMENT '价格',
  `priority` TINYINT DEFAULT 1 COMMENT '优先级：1-普通，2-重要，3-非常重要',
  `is_claimed` TINYINT DEFAULT 0 COMMENT '是否已被领取：0-未领取，1-已领取',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_wishlist_id (`wishlist_id`),
  INDEX idx_is_claimed (`is_claimed`),
  FOREIGN KEY (`wishlist_id`) REFERENCES `wishlist`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- 领取记录表
CREATE TABLE IF NOT EXISTS `claim_record` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
  `item_id` BIGINT NOT NULL COMMENT '商品ID',
  `user_id` BIGINT NOT NULL COMMENT '领取人ID',
  `owner_id` BIGINT NOT NULL COMMENT '心愿单所有者ID',
  `message` VARCHAR(500) DEFAULT NULL COMMENT '留言',
  `is_purchased` TINYINT DEFAULT 0 COMMENT '是否已购买：0-未购买，1-已购买',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '领取时间',
  INDEX idx_item_id (`item_id`),
  INDEX idx_user_id (`user_id`),
  INDEX idx_owner_id (`owner_id`),
  FOREIGN KEY (`item_id`) REFERENCES `item`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='领取记录表';

-- 插入测试数据
INSERT INTO `user` (`username`, `nickname`, `avatar`, `birthday`, `password`) VALUES
('alice', '爱丽丝', NULL, '1995-06-15', '123456'),
('bob', '鲍勃', NULL, '1994-08-20', '123456'),
('charlie', '查理', NULL, '1996-03-10', '123456');

INSERT INTO `friendship` (`user_id`, `friend_id`, `status`) VALUES
(1, 2, 1),
(2, 1, 1),
(1, 3, 1),
(3, 1, 1);

INSERT INTO `wishlist` (`user_id`, `title`, `description`, `is_public`) VALUES
(1, '生日礼物', '希望收到的生日礼物', 1),
(1, '圣诞礼物', '圣诞心愿清单', 1),
(2, '生日愿望', '今年的生日愿望', 1);

INSERT INTO `item` (`wishlist_id`, `title`, `description`, `url`, `image_url`, `price`, `priority`) VALUES
(1, 'AirPods Pro', '降噪耳机', 'https://www.apple.com/airpods-pro/', NULL, 1999.00, 2),
(1, '机械键盘', 'Cherry轴机械键盘', 'https://www.cherrymx.de/', NULL, 899.00, 1),
(2, '旅行背包', '大容量旅行背包', NULL, NULL, 599.00, 2),
(3, '游戏手柄', 'PS5游戏手柄', NULL, NULL, 499.00, 1);

INSERT INTO `claim_record` (`item_id`, `user_id`, `owner_id`, `message`, `is_purchased`) VALUES
(1, 2, 1, '我帮你买这个！', 0);

UPDATE `item` SET `is_claimed` = 1 WHERE `id` = 1;
