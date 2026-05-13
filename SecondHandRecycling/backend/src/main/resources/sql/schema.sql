-- 创建数据库
CREATE DATABASE IF NOT EXISTS recycling_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE recycling_db;

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  `password` VARCHAR(100) NOT NULL COMMENT '密码',
  `phone` VARCHAR(20) NOT NULL UNIQUE COMMENT '手机号',
  `nickname` VARCHAR(50) COMMENT '昵称',
  `avatar` VARCHAR(255) COMMENT '头像URL',
  `role` VARCHAR(20) NOT NULL DEFAULT 'USER' COMMENT '角色：USER/COLLECTOR/ADMIN',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0禁用 1启用',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_phone` (`phone`),
  INDEX `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 回收员信息表
CREATE TABLE IF NOT EXISTS `collector` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL COMMENT '关联用户ID',
  `real_name` VARCHAR(50) NOT NULL COMMENT '真实姓名',
  `id_card` VARCHAR(18) NOT NULL COMMENT '身份证号',
  `work_area` VARCHAR(200) COMMENT '工作区域',
  `vehicle` VARCHAR(50) COMMENT '交通工具',
  `rating` DECIMAL(3,2) DEFAULT 5.00 COMMENT '评分',
  `order_count` INT DEFAULT 0 COMMENT '完成订单数',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0休息 1接单中',
  `deleted` TINYINT NOT NULL DEFAULT 0,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_id` (`user_id`),
  INDEX `idx_work_area` (`work_area`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='回收员信息表';

-- 用户地址表
CREATE TABLE IF NOT EXISTS `user_address` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `name` VARCHAR(50) NOT NULL COMMENT '联系人姓名',
  `phone` VARCHAR(20) NOT NULL COMMENT '联系人电话',
  `province` VARCHAR(50) COMMENT '省',
  `city` VARCHAR(50) COMMENT '市',
  `district` VARCHAR(50) COMMENT '区',
  `detail_address` VARCHAR(200) NOT NULL COMMENT '详细地址',
  `latitude` DECIMAL(10,7) COMMENT '纬度',
  `longitude` DECIMAL(10,7) COMMENT '经度',
  `is_default` TINYINT DEFAULT 0 COMMENT '是否默认地址',
  `deleted` TINYINT NOT NULL DEFAULT 0,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户地址表';

-- 品类别表
CREATE TABLE IF NOT EXISTS `category` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL COMMENT '品类名称',
  `parent_id` BIGINT DEFAULT 0 COMMENT '父级ID，0为顶级',
  `icon` VARCHAR(255) COMMENT '图标URL',
  `description` VARCHAR(500) COMMENT '品类描述',
  `base_price` DECIMAL(10,2) COMMENT '基础参考价格（元/单位）',
  `unit` VARCHAR(20) COMMENT '计价单位',
  `sort` INT DEFAULT 0 COMMENT '排序',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0禁用 1启用',
  `deleted` TINYINT NOT NULL DEFAULT 0,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='品类别表';

-- 估价模型表
CREATE TABLE IF NOT EXISTS `estimate_model` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `category_id` BIGINT NOT NULL COMMENT '关联品类ID',
  `factor_name` VARCHAR(50) NOT NULL COMMENT '影响因素名称',
  `factor_type` VARCHAR(20) NOT NULL COMMENT '类型：SELECT/RANGE/NUMBER',
  `options` TEXT COMMENT '选项值JSON数组',
  `min_value` DECIMAL(10,2) COMMENT '最小值',
  `max_value` DECIMAL(10,2) COMMENT '最大值',
  `price_impact` DECIMAL(5,2) NOT NULL DEFAULT 0 COMMENT '价格影响系数%',
  `sort` INT DEFAULT 0,
  `deleted` TINYINT NOT NULL DEFAULT 0,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_category_id` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='估价模型表';

-- 预约订单表
CREATE TABLE IF NOT EXISTS `appointment_order` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `order_no` VARCHAR(32) NOT NULL UNIQUE COMMENT '订单号',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `address_id` BIGINT NOT NULL COMMENT '地址ID',
  `category_id` BIGINT NOT NULL COMMENT '品类ID',
  `collector_id` BIGINT COMMENT '回收员ID',
  `quantity` DECIMAL(10,2) COMMENT '预估数量',
  `estimated_price` DECIMAL(10,2) COMMENT '预估价格',
  `final_price` DECIMAL(10,2) COMMENT '最终成交价',
  `description` VARCHAR(500) COMMENT '描述',
  `images` TEXT COMMENT '图片URLs，JSON数组',
  `appointment_time` DATETIME NOT NULL COMMENT '预约时间',
  `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '状态：PENDING/ACCEPTED/ONWAY/ARRIVED/NEGOTIATING/COMPLETED/CANCELLED',
  `cancel_reason` VARCHAR(255) COMMENT '取消原因',
  `deleted` TINYINT NOT NULL DEFAULT 0,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_collector_id` (`collector_id`),
  INDEX `idx_order_no` (`order_no`),
  INDEX `idx_status` (`status`),
  INDEX `idx_appointment_time` (`appointment_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预约订单表';

-- 电子单据表
CREATE TABLE IF NOT EXISTS `electronic_receipt` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `receipt_no` VARCHAR(32) NOT NULL UNIQUE COMMENT '单据号',
  `order_id` BIGINT NOT NULL COMMENT '关联订单ID',
  `user_id` BIGINT NOT NULL,
  `collector_id` BIGINT NOT NULL,
  `items` TEXT NOT NULL COMMENT '回收物品明细JSON',
  `total_amount` DECIMAL(10,2) NOT NULL COMMENT '总金额',
  `user_signature` VARCHAR(255) COMMENT '用户签名URL',
  `collector_signature` VARCHAR(255) COMMENT '回收员签名URL',
  `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '状态：PENDING/SIGNED',
  `signed_time` DATETIME COMMENT '签署时间',
  `deleted` TINYINT NOT NULL DEFAULT 0,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_order_id` (`order_id`),
  INDEX `idx_receipt_no` (`receipt_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='电子单据表';

-- 回收员行程表
CREATE TABLE IF NOT EXISTS `collector_route` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `collector_id` BIGINT NOT NULL,
  `order_id` BIGINT NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING/IN_PROGRESS/COMPLETED',
  `start_time` DATETIME COMMENT '出发时间',
  `arrive_time` DATETIME COMMENT '到达时间',
  `complete_time` DATETIME COMMENT '完成时间',
  `start_location` VARCHAR(255) COMMENT '出发位置',
  `route_points` TEXT COMMENT '路线点JSON',
  `distance` DECIMAL(10,2) COMMENT '距离（公里）',
  `duration` INT COMMENT '预计时长（分钟）',
  `deleted` TINYINT NOT NULL DEFAULT 0,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_collector_id` (`collector_id`),
  INDEX `idx_order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='回收员行程表';

-- 库存与售卖表
CREATE TABLE IF NOT EXISTS `inventory` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `order_id` BIGINT NOT NULL COMMENT '来源订单ID',
  `category_id` BIGINT NOT NULL,
  `name` VARCHAR(100) NOT NULL COMMENT '物品名称',
  `quantity` DECIMAL(10,2) NOT NULL COMMENT '数量',
  `unit` VARCHAR(20) COMMENT '单位',
  `cost_price` DECIMAL(10,2) NOT NULL COMMENT '收购成本',
  `sell_price` DECIMAL(10,2) COMMENT '售卖价格',
  `status` VARCHAR(20) NOT NULL DEFAULT 'IN_STOCK' COMMENT 'IN_STOCK/SOLD',
  `buyer_name` VARCHAR(50) COMMENT '买家名称',
  `buyer_phone` VARCHAR(20) COMMENT '买家电话',
  `sold_time` DATETIME COMMENT '售卖时间',
  `profit` DECIMAL(10,2) COMMENT '利润',
  `deleted` TINYINT NOT NULL DEFAULT 0,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存与售卖表';

-- 用户钱包表
CREATE TABLE IF NOT EXISTS `user_wallet` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL UNIQUE,
  `balance` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '余额',
  `frozen_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '冻结金额',
  `total_income` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '累计收入',
  `total_withdraw` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '累计提现',
  `deleted` TINYINT NOT NULL DEFAULT 0,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户钱包表';

-- 钱包流水表
CREATE TABLE IF NOT EXISTS `wallet_transaction` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `transaction_no` VARCHAR(32) NOT NULL UNIQUE COMMENT '交易流水号',
  `user_id` BIGINT NOT NULL,
  `type` VARCHAR(20) NOT NULL COMMENT '类型：INCOME/WITHDRAW/FREEZE/UNFREEZE',
  `amount` DECIMAL(12,2) NOT NULL COMMENT '金额',
  `balance_before` DECIMAL(12,2) NOT NULL COMMENT '变动前余额',
  `balance_after` DECIMAL(12,2) NOT NULL COMMENT '变动后余额',
  `related_order_id` BIGINT COMMENT '关联订单ID',
  `remark` VARCHAR(255) COMMENT '备注',
  `deleted` TINYINT NOT NULL DEFAULT 0,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_transaction_no` (`transaction_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='钱包流水表';

-- 提现申请表
CREATE TABLE IF NOT EXISTS `withdraw_request` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `request_no` VARCHAR(32) NOT NULL UNIQUE COMMENT '申请单号',
  `user_id` BIGINT NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL COMMENT '提现金额',
  `bank_name` VARCHAR(50) COMMENT '银行名称',
  `bank_account` VARCHAR(50) COMMENT '银行账号',
  `account_name` VARCHAR(50) COMMENT '账户名称',
  `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING/APPROVED/REJECTED',
  `reject_reason` VARCHAR(255) COMMENT '拒绝原因',
  `operator_id` BIGINT COMMENT '操作人ID',
  `deleted` TINYINT NOT NULL DEFAULT 0,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='提现申请表';
