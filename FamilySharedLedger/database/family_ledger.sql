-- ========================================
-- 家庭共享账本数据库脚本
-- Database: family_ledger
-- ========================================

CREATE DATABASE IF NOT EXISTS family_ledger DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE family_ledger;

-- ========================================
-- 1. 用户表
-- ========================================
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password` VARCHAR(100) NOT NULL COMMENT '密码',
  `nickname` VARCHAR(50) NOT NULL COMMENT '昵称',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态 1:正常 0:禁用',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_email` (`email`),
  UNIQUE KEY `uk_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ========================================
-- 2. 家庭组表
-- ========================================
DROP TABLE IF EXISTS `family_group`;
CREATE TABLE `family_group` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` VARCHAR(100) NOT NULL COMMENT '家庭组名称',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '描述',
  `owner_id` BIGINT NOT NULL COMMENT '创建者ID',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态 1:正常 0:解散',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_owner_id` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='家庭组表';

-- ========================================
-- 3. 家庭成员表
-- ========================================
DROP TABLE IF EXISTS `family_member`;
CREATE TABLE `family_member` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `family_id` BIGINT NOT NULL COMMENT '家庭组ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `role` TINYINT NOT NULL DEFAULT 2 COMMENT '角色 1:管理员 2:普通成员',
  `join_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态 1:正常 0:已退出',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_family_user` (`family_id`, `user_id`),
  KEY `idx_family_id` (`family_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='家庭成员表';

-- ========================================
-- 4. 邀请表
-- ========================================
DROP TABLE IF EXISTS `family_invite`;
CREATE TABLE `family_invite` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `family_id` BIGINT NOT NULL COMMENT '家庭组ID',
  `inviter_id` BIGINT NOT NULL COMMENT '邀请人ID',
  `invitee_email` VARCHAR(100) NOT NULL COMMENT '被邀请人邮箱',
  `invitee_name` VARCHAR(50) DEFAULT NULL COMMENT '被邀请人姓名',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态 0:待接受 1:已接受 2:已拒绝 3:已过期',
  `expire_time` DATETIME NOT NULL COMMENT '过期时间',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_family_id` (`family_id`),
  KEY `idx_inviter_id` (`inviter_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='家庭邀请表';

-- ========================================
-- 5. 账单表
-- ========================================
DROP TABLE IF EXISTS `bill`;
CREATE TABLE `bill` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `family_id` BIGINT NOT NULL COMMENT '家庭组ID',
  `title` VARCHAR(200) NOT NULL COMMENT '账单标题',
  `amount` DECIMAL(12,2) NOT NULL COMMENT '金额',
  `category` VARCHAR(50) NOT NULL COMMENT '分类：餐饮、交通、购物、住房、娱乐、其他',
  `bill_type` TINYINT NOT NULL DEFAULT 1 COMMENT '账单类型 1:支出 2:收入',
  `payer_id` BIGINT NOT NULL COMMENT '支付人ID',
  `split_type` TINYINT NOT NULL DEFAULT 1 COMMENT '分摊类型 1:AA制 2:比例分摊 3:自定义',
  `bill_date` DATE NOT NULL COMMENT '账单日期',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `creator_id` BIGINT NOT NULL COMMENT '创建人ID',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_family_id` (`family_id`),
  KEY `idx_payer_id` (`payer_id`),
  KEY `idx_bill_date` (`bill_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='账单表';

-- ========================================
-- 6. 账单分摊明细表
-- ========================================
DROP TABLE IF EXISTS `bill_split`;
CREATE TABLE `bill_split` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `bill_id` BIGINT NOT NULL COMMENT '账单ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `amount` DECIMAL(12,2) NOT NULL COMMENT '分摊金额',
  `ratio` DECIMAL(5,4) DEFAULT NULL COMMENT '分摊比例',
  `is_settled` TINYINT NOT NULL DEFAULT 0 COMMENT '是否已结算 0:未结算 1:已结算',
  `settle_id` BIGINT DEFAULT NULL COMMENT '结算记录ID',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_bill_id` (`bill_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_settle_id` (`settle_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='账单分摊明细表';

-- ========================================
-- 7. 结算记录表
-- ========================================
DROP TABLE IF EXISTS `settlement`;
CREATE TABLE `settlement` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `family_id` BIGINT NOT NULL COMMENT '家庭组ID',
  `title` VARCHAR(200) NOT NULL COMMENT '结算标题',
  `start_date` DATE NOT NULL COMMENT '结算开始日期',
  `end_date` DATE NOT NULL COMMENT '结算结束日期',
  `total_amount` DECIMAL(12,2) NOT NULL COMMENT '总金额',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态 0:待确认 1:已确认 2:已完成',
  `creator_id` BIGINT NOT NULL COMMENT '创建人ID',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_family_id` (`family_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='结算记录表';

-- ========================================
-- 8. 转账记录表（最少转账次数算法结果）
-- ========================================
DROP TABLE IF EXISTS `transfer`;
CREATE TABLE `transfer` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `settle_id` BIGINT NOT NULL COMMENT '结算ID',
  `from_user_id` BIGINT NOT NULL COMMENT '转出人ID',
  `to_user_id` BIGINT NOT NULL COMMENT '转入人ID',
  `amount` DECIMAL(12,2) NOT NULL COMMENT '转账金额',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态 0:待转账 1:已转账 2:已确认',
  `transfer_time` DATETIME DEFAULT NULL COMMENT '转账时间',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_settle_id` (`settle_id`),
  KEY `idx_from_user` (`from_user_id`),
  KEY `idx_to_user` (`to_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='转账记录表';

-- ========================================
-- 9. 用户余额表（实时欠款统计）
-- ========================================
DROP TABLE IF EXISTS `user_balance`;
CREATE TABLE `user_balance` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `family_id` BIGINT NOT NULL COMMENT '家庭组ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `total_paid` DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '总支付金额',
  `total_share` DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '总分摊金额',
  `balance` DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '余额（正数为应收，负数为应付）',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_family_user` (`family_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户余额表';

-- ========================================
-- 初始化测试数据
-- ========================================

-- 测试用户
INSERT INTO `sys_user` (`username`, `password`, `nickname`, `email`, `phone`) VALUES
('zhangsan', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7i', '张三', 'zhangsan@example.com', '13800138001'),
('lisi', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7i', '李四', 'lisi@example.com', '13800138002'),
('wangwu', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7i', '王五', 'wangwu@example.com', '13800138003'),
('zhaoliu', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7i', '赵六', 'zhaoliu@example.com', '13800138004');

-- 测试家庭组
INSERT INTO `family_group` (`name`, `description`, `owner_id`) VALUES
('幸福小家庭', '张三和李四的小家庭', 1),
('合租大家庭', '四个室友的合租账本', 1);

-- 测试家庭成员
INSERT INTO `family_member` (`family_id`, `user_id`, `role`) VALUES
(1, 1, 1),
(1, 2, 2),
(2, 1, 1),
(2, 2, 2),
(2, 3, 2),
(2, 4, 2);

-- 测试账单
INSERT INTO `bill` (`family_id`, `title`, `amount`, `category`, `bill_type`, `payer_id`, `split_type`, `bill_date`, `creator_id`) VALUES
(1, '超市购物', 256.50, '购物', 1, 1, 1, '2024-01-15', 1),
(1, '房租', 3000.00, '住房', 1, 2, 2, '2024-01-01', 2),
(1, '外卖晚餐', 68.00, '餐饮', 1, 1, 1, '2024-01-16', 1),
(2, '水电费', 420.00, '住房', 1, 1, 1, '2024-01-10', 1),
(2, '网络费', 120.00, '住房', 1, 2, 1, '2024-01-05', 2);

-- 测试账单分摊
INSERT INTO `bill_split` (`bill_id`, `user_id`, `amount`, `ratio`) VALUES
-- 账单1: 超市购物 256.50 AA制
(1, 1, 128.25, 0.5000),
(1, 2, 128.25, 0.5000),
-- 账单2: 房租 3000 比例分摊 张三40% 李四60%
(2, 1, 1200.00, 0.4000),
(2, 2, 1800.00, 0.6000),
-- 账单3: 外卖 68 AA制
(3, 1, 34.00, 0.5000),
(3, 2, 34.00, 0.5000),
-- 账单4: 水电费 420 四人AA
(4, 1, 105.00, 0.2500),
(4, 2, 105.00, 0.2500),
(4, 3, 105.00, 0.2500),
(4, 4, 105.00, 0.2500),
-- 账单5: 网络费 120 四人AA
(5, 1, 30.00, 0.2500),
(5, 2, 30.00, 0.2500),
(5, 3, 30.00, 0.2500),
(5, 4, 30.00, 0.2500);

-- 初始化用户余额
INSERT INTO `user_balance` (`family_id`, `user_id`, `total_paid`, `total_share`, `balance`) VALUES
-- 家庭1
(1, 1, 324.50, 1362.25, -1037.75),
(1, 2, 3000.00, 1962.25, 1037.75),
-- 家庭2
(2, 1, 420.00, 135.00, 285.00),
(2, 2, 120.00, 135.00, -15.00),
(2, 3, 0.00, 135.00, -135.00),
(2, 4, 0.00, 135.00, -135.00);
