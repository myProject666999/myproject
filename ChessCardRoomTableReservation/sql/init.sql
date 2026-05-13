CREATE DATABASE IF NOT EXISTS chess_room DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE chess_room;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `order_item`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `member`;
DROP TABLE IF EXISTS `product`;
DROP TABLE IF EXISTS `table_info`;
DROP TABLE IF EXISTS `table_type`;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `table_type` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  `name` VARCHAR(50) NOT NULL COMMENT '桌台类型名称',
  `hourly_rate` DECIMAL(10, 2) NOT NULL COMMENT '每小时费用',
  `description` VARCHAR(255) COMMENT '描述',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='桌台类型表';

CREATE TABLE `table_info` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  `table_no` VARCHAR(20) NOT NULL UNIQUE COMMENT '桌台编号',
  `type_id` BIGINT NOT NULL COMMENT '桌台类型ID',
  `status` TINYINT DEFAULT 0 COMMENT '状态：0-空闲，1-使用中，2-已预订，3-维护中',
  `remark` VARCHAR(255) COMMENT '备注',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`type_id`) REFERENCES `table_type`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='桌台信息表';

CREATE TABLE `member` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  `member_no` VARCHAR(50) NOT NULL UNIQUE COMMENT '会员编号',
  `name` VARCHAR(50) NOT NULL COMMENT '姓名',
  `phone` VARCHAR(20) COMMENT '手机号',
  `discount_rate` DECIMAL(3, 2) DEFAULT 1.00 COMMENT '折扣率（1.0表示不打折）',
  `balance` DECIMAL(10, 2) DEFAULT 0.00 COMMENT '余额',
  `points` INT DEFAULT 0 COMMENT '积分',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会员表';

CREATE TABLE `product` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  `name` VARCHAR(100) NOT NULL COMMENT '商品名称',
  `category` VARCHAR(50) COMMENT '分类：tea-茶水，drink-酒水，snack-零食',
  `price` DECIMAL(10, 2) NOT NULL COMMENT '价格',
  `stock` INT DEFAULT 0 COMMENT '库存',
  `unit` VARCHAR(20) DEFAULT '份' COMMENT '单位',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-下架，1-上架',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

CREATE TABLE `orders` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  `order_no` VARCHAR(50) NOT NULL UNIQUE COMMENT '订单号',
  `table_id` BIGINT NOT NULL COMMENT '桌台ID',
  `member_id` BIGINT COMMENT '会员ID',
  `start_time` DATETIME NOT NULL COMMENT '开台时间',
  `end_time` DATETIME COMMENT '结账时间',
  `hours` DECIMAL(10, 2) COMMENT '使用时长（小时）',
  `table_fee` DECIMAL(10, 2) DEFAULT 0.00 COMMENT '桌台费用',
  `product_fee` DECIMAL(10, 2) DEFAULT 0.00 COMMENT '商品费用',
  `total_amount` DECIMAL(10, 2) DEFAULT 0.00 COMMENT '总金额',
  `discount_amount` DECIMAL(10, 2) DEFAULT 0.00 COMMENT '优惠金额',
  `pay_amount` DECIMAL(10, 2) DEFAULT 0.00 COMMENT '实付金额',
  `payment_method` VARCHAR(20) COMMENT '支付方式：cash-现金，wechat-微信，alipay-支付宝，card-刷卡',
  `status` TINYINT DEFAULT 0 COMMENT '状态：0-进行中，1-已结账，2-已取消',
  `remark` VARCHAR(255) COMMENT '备注',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`table_id`) REFERENCES `table_info`(`id`),
  FOREIGN KEY (`member_id`) REFERENCES `member`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

CREATE TABLE `order_item` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  `order_id` BIGINT NOT NULL COMMENT '订单ID',
  `product_id` BIGINT NOT NULL COMMENT '商品ID',
  `product_name` VARCHAR(100) NOT NULL COMMENT '商品名称',
  `price` DECIMAL(10, 2) NOT NULL COMMENT '单价',
  `quantity` INT NOT NULL COMMENT '数量',
  `total_price` DECIMAL(10, 2) NOT NULL COMMENT '小计',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`),
  FOREIGN KEY (`product_id`) REFERENCES `product`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单明细表';

INSERT INTO `table_type` (`name`, `hourly_rate`, `description`) VALUES
('普通麻将桌', 30.00, '标准麻将桌，适合4人'),
('豪华麻将桌', 50.00, '豪华麻将桌，带自动洗牌'),
('棋牌室', 25.00, '围棋、象棋等棋牌桌'),
('VIP包间', 80.00, '独立包间，私密性强');

INSERT INTO `table_info` (`table_no`, `type_id`, `status`) VALUES
('A001', 1, 0), ('A002', 1, 0), ('A003', 1, 0), ('A004', 1, 0),
('A005', 1, 0), ('A006', 1, 0), ('A007', 1, 0), ('A008', 1, 0),
('B001', 2, 0), ('B002', 2, 0), ('B003', 2, 0), ('B004', 2, 0),
('C001', 3, 0), ('C002', 3, 0), ('C003', 3, 0),
('V001', 4, 0), ('V002', 4, 0);

INSERT INTO `member` (`member_no`, `name`, `phone`, `discount_rate`, `balance`, `points`, `status`) VALUES
('M00001', '张三', '13800138001', 0.90, 500.00, 1200, 1),
('M00002', '李四', '13800138002', 0.85, 1200.00, 3500, 1),
('M00003', '王五', '13800138003', 0.95, 200.00, 300, 1),
('M00004', '赵六', '13800138004', 0.80, 3000.00, 8000, 1);

INSERT INTO `product` (`name`, `category`, `price`, `stock`, `unit`, `status`) VALUES
('龙井茶', 'tea', 28.00, 100, '杯', 1),
('铁观音', 'tea', 25.00, 100, '杯', 1),
('普洱茶', 'tea', 20.00, 100, '杯', 1),
('菊花茶', 'tea', 15.00, 100, '杯', 1),
('白开水', 'tea', 5.00, 999, '杯', 1),
('可口可乐', 'drink', 8.00, 200, '瓶', 1),
('百事可乐', 'drink', 8.00, 200, '瓶', 1),
('矿泉水', 'drink', 5.00, 300, '瓶', 1),
('红牛', 'drink', 12.00, 100, '罐', 1),
('青岛啤酒', 'drink', 10.00, 150, '瓶', 1),
('瓜子', 'snack', 15.00, 80, '盘', 1),
('花生', 'snack', 12.00, 80, '盘', 1),
('水果拼盘', 'snack', 38.00, 30, '份', 1),
('薯片', 'snack', 10.00, 100, '袋', 1);
