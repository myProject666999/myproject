CREATE DATABASE IF NOT EXISTS golf_reservation DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE golf_reservation;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码',
  `real_name` VARCHAR(50) DEFAULT NULL COMMENT '真实姓名',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `role` ENUM('admin', 'employee', 'member') NOT NULL DEFAULT 'member' COMMENT '角色',
  `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '状态：1-正常，0-禁用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE IF NOT EXISTS `members` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '会员ID',
  `user_id` INT(11) NOT NULL COMMENT '关联用户ID',
  `member_no` VARCHAR(50) NOT NULL COMMENT '会员编号',
  `balance` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT '储值余额',
  `remaining_hours` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT '剩余时长(小时)',
  `join_date` DATE NOT NULL COMMENT '入会日期',
  `expire_date` DATE DEFAULT NULL COMMENT '到期日期',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_member_no` (`member_no`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_members_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会员表';

CREATE TABLE IF NOT EXISTS `hitting_bays` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '打位ID',
  `bay_number` VARCHAR(20) NOT NULL COMMENT '打位编号',
  `bay_type` ENUM('single', 'double', 'vip') NOT NULL DEFAULT 'single' COMMENT '打位类型',
  `floor` INT(11) NOT NULL DEFAULT 1 COMMENT '楼层',
  `position_x` INT(11) DEFAULT 0 COMMENT 'X坐标(用于地图显示)',
  `position_y` INT(11) DEFAULT 0 COMMENT 'Y坐标(用于地图显示)',
  `has_sensor` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否有传感器',
  `status` ENUM('available', 'occupied', 'maintenance', 'disabled') NOT NULL DEFAULT 'available' COMMENT '状态',
  `price_per_hour` DECIMAL(10, 2) NOT NULL DEFAULT 50.00 COMMENT '每小时价格',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '描述',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_bay_number` (`bay_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='打位表';

CREATE TABLE IF NOT EXISTS `coaches` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '教练ID',
  `user_id` INT(11) DEFAULT NULL COMMENT '关联用户ID',
  `coach_name` VARCHAR(50) NOT NULL COMMENT '教练姓名',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '联系方式',
  `title` VARCHAR(100) DEFAULT NULL COMMENT '职称',
  `specialty` VARCHAR(255) DEFAULT NULL COMMENT '专长',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像',
  `price_per_hour` DECIMAL(10, 2) NOT NULL DEFAULT 200.00 COMMENT '每小时价格',
  `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '状态：1-在职，0-离职',
  `description` TEXT COMMENT '个人简介',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_coaches_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='教练表';

CREATE TABLE IF NOT EXISTS `coach_schedules` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '排班ID',
  `coach_id` INT(11) NOT NULL COMMENT '教练ID',
  `schedule_date` DATE NOT NULL COMMENT '日期',
  `start_time` TIME NOT NULL COMMENT '开始时间',
  `end_time` TIME NOT NULL COMMENT '结束时间',
  `is_booked` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已预约',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_coach_id` (`coach_id`),
  KEY `idx_schedule_date` (`schedule_date`),
  CONSTRAINT `fk_schedules_coach` FOREIGN KEY (`coach_id`) REFERENCES `coaches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='教练排班表';

CREATE TABLE IF NOT EXISTS `equipment_categories` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `category_name` VARCHAR(50) NOT NULL COMMENT '分类名称',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '描述',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='球具分类表';

CREATE TABLE IF NOT EXISTS `equipment` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '球具ID',
  `category_id` INT(11) NOT NULL COMMENT '分类ID',
  `equipment_name` VARCHAR(100) NOT NULL COMMENT '球具名称',
  `equipment_code` VARCHAR(50) DEFAULT NULL COMMENT '球具编号',
  `brand` VARCHAR(100) DEFAULT NULL COMMENT '品牌',
  `specs` VARCHAR(255) DEFAULT NULL COMMENT '规格',
  `rental_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT '租赁价格/次',
  `total_quantity` INT(11) NOT NULL DEFAULT 0 COMMENT '总数量',
  `available_quantity` INT(11) NOT NULL DEFAULT 0 COMMENT '可用数量',
  `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '状态',
  `description` TEXT COMMENT '描述',
  `image` VARCHAR(255) DEFAULT NULL COMMENT '图片',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_category_id` (`category_id`),
  CONSTRAINT `fk_equipment_category` FOREIGN KEY (`category_id`) REFERENCES `equipment_categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='球具表';

CREATE TABLE IF NOT EXISTS `card_types` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '卡类型ID',
  `card_name` VARCHAR(50) NOT NULL COMMENT '卡名称',
  `card_type` ENUM('monthly', 'duration', 'stored') NOT NULL COMMENT '卡类型：月卡、时长卡、储值卡',
  `duration_days` INT(11) DEFAULT NULL COMMENT '有效期(天)',
  `duration_hours` DECIMAL(10, 2) DEFAULT NULL COMMENT '时长(小时)',
  `price` DECIMAL(10, 2) NOT NULL COMMENT '售价',
  `discount` DECIMAL(5, 2) DEFAULT 100.00 COMMENT '折扣(%)',
  `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '状态',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '描述',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='卡类型表';

CREATE TABLE IF NOT EXISTS `member_cards` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '会员卡ID',
  `member_id` INT(11) NOT NULL COMMENT '会员ID',
  `card_type_id` INT(11) NOT NULL COMMENT '卡类型ID',
  `card_no` VARCHAR(50) NOT NULL COMMENT '卡号',
  `remaining_hours` DECIMAL(10, 2) DEFAULT 0.00 COMMENT '剩余时长',
  `remaining_amount` DECIMAL(10, 2) DEFAULT 0.00 COMMENT '剩余金额',
  `purchase_date` DATE NOT NULL COMMENT '购买日期',
  `expire_date` DATE DEFAULT NULL COMMENT '到期日期',
  `status` ENUM('active', 'used', 'expired', 'frozen') NOT NULL DEFAULT 'active' COMMENT '状态',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_card_no` (`card_no`),
  KEY `idx_member_id` (`member_id`),
  KEY `idx_card_type_id` (`card_type_id`),
  CONSTRAINT `fk_membercards_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_membercards_cardtype` FOREIGN KEY (`card_type_id`) REFERENCES `card_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会员卡表';

CREATE TABLE IF NOT EXISTS `reservations` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '预约ID',
  `reservation_no` VARCHAR(50) NOT NULL COMMENT '预约编号',
  `member_id` INT(11) DEFAULT NULL COMMENT '会员ID',
  `customer_name` VARCHAR(50) DEFAULT NULL COMMENT '客户姓名',
  `customer_phone` VARCHAR(20) DEFAULT NULL COMMENT '客户电话',
  `bay_id` INT(11) NOT NULL COMMENT '打位ID',
  `reservation_date` DATE NOT NULL COMMENT '预约日期',
  `start_time` TIME NOT NULL COMMENT '开始时间',
  `end_time` TIME NOT NULL COMMENT '结束时间',
  `coach_id` INT(11) DEFAULT NULL COMMENT '教练ID',
  `balls_count` INT(11) NOT NULL DEFAULT 0 COMMENT '球数',
  `status` ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show') NOT NULL DEFAULT 'pending' COMMENT '状态',
  `payment_method` ENUM('cash', 'card', 'balance', 'wechat', 'alipay') DEFAULT NULL COMMENT '支付方式',
  `total_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT '总金额',
  `paid_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT '已付金额',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `checkin_time` DATETIME DEFAULT NULL COMMENT '入场时间',
  `checkout_time` DATETIME DEFAULT NULL COMMENT '离场时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_reservation_no` (`reservation_no`),
  KEY `idx_bay_id` (`bay_id`),
  KEY `idx_member_id` (`member_id`),
  KEY `idx_coach_id` (`coach_id`),
  KEY `idx_reservation_date` (`reservation_date`),
  CONSTRAINT `fk_reservations_bay` FOREIGN KEY (`bay_id`) REFERENCES `hitting_bays` (`id`),
  CONSTRAINT `fk_reservations_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_reservations_coach` FOREIGN KEY (`coach_id`) REFERENCES `coaches` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预约表';

CREATE TABLE IF NOT EXISTS `equipment_rentals` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '租赁ID',
  `rental_no` VARCHAR(50) NOT NULL COMMENT '租赁编号',
  `reservation_id` INT(11) DEFAULT NULL COMMENT '关联预约ID',
  `member_id` INT(11) DEFAULT NULL COMMENT '会员ID',
  `equipment_id` INT(11) NOT NULL COMMENT '球具ID',
  `quantity` INT(11) NOT NULL DEFAULT 1 COMMENT '租赁数量',
  `rental_date` DATE NOT NULL COMMENT '租赁日期',
  `start_time` TIME NOT NULL COMMENT '开始时间',
  `expected_return_time` TIME DEFAULT NULL COMMENT '预计归还时间',
  `actual_return_time` TIME DEFAULT NULL COMMENT '实际归还时间',
  `status` ENUM('rented', 'returned', 'overdue') NOT NULL DEFAULT 'rented' COMMENT '状态',
  `total_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT '租赁费用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_rental_no` (`rental_no`),
  KEY `idx_reservation_id` (`reservation_id`),
  KEY `idx_member_id` (`member_id`),
  KEY `idx_equipment_id` (`equipment_id`),
  CONSTRAINT `fk_rentals_reservation` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_rentals_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_rentals_equipment` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='球具租赁表';

CREATE TABLE IF NOT EXISTS `swing_data` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '数据ID',
  `reservation_id` INT(11) DEFAULT NULL COMMENT '关联预约ID',
  `member_id` INT(11) DEFAULT NULL COMMENT '会员ID',
  `bay_id` INT(11) DEFAULT NULL COMMENT '打位ID',
  `swing_time` DATETIME NOT NULL COMMENT '击球时间',
  `club_type` VARCHAR(50) DEFAULT NULL COMMENT '球杆类型',
  `ball_speed` DECIMAL(10, 2) DEFAULT NULL COMMENT '球速(mph)',
  `club_speed` DECIMAL(10, 2) DEFAULT NULL COMMENT '杆速(mph)',
  `carry_distance` DECIMAL(10, 2) DEFAULT NULL COMMENT '飞行距离(码)',
  `total_distance` DECIMAL(10, 2) DEFAULT NULL COMMENT '总距离(码)',
  `launch_angle` DECIMAL(5, 2) DEFAULT NULL COMMENT '发射角度',
  `backspin` INT(11) DEFAULT NULL COMMENT '倒旋(rpm)',
  `sidespin` INT(11) DEFAULT NULL COMMENT '侧旋(rpm)',
  `fairway` VARCHAR(20) DEFAULT NULL COMMENT '球道偏置',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_reservation_id` (`reservation_id`),
  KEY `idx_member_id` (`member_id`),
  KEY `idx_bay_id` (`bay_id`),
  KEY `idx_swing_time` (`swing_time`),
  CONSTRAINT `fk_swingdata_reservation` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_swingdata_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_swingdata_bay` FOREIGN KEY (`bay_id`) REFERENCES `hitting_bays` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='击球数据表';

CREATE TABLE IF NOT EXISTS `payments` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '支付ID',
  `payment_no` VARCHAR(50) NOT NULL COMMENT '支付编号',
  `reservation_id` INT(11) DEFAULT NULL COMMENT '关联预约ID',
  `member_id` INT(11) DEFAULT NULL COMMENT '会员ID',
  `payment_type` ENUM('bay', 'coach', 'equipment', 'balls', 'card', 'deposit') NOT NULL COMMENT '支付类型',
  `payment_method` ENUM('cash', 'card', 'balance', 'wechat', 'alipay') NOT NULL COMMENT '支付方式',
  `amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT '支付金额',
  `status` ENUM('pending', 'success', 'failed', 'refunded') NOT NULL DEFAULT 'pending' COMMENT '状态',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_payment_no` (`payment_no`),
  KEY `idx_reservation_id` (`reservation_id`),
  KEY `idx_member_id` (`member_id`),
  CONSTRAINT `fk_payments_reservation` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_payments_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='支付记录表';

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO `users` (`username`, `password`, `real_name`, `phone`, `role`, `status`) VALUES
('admin', '$2b$10$EixZaYb1j9LbFQE8wH6t9eB7hN3vX5eP7Y9Q1R3T5U7V9W2X4Z6Y8', '管理员', '13800138000', 'admin', 1),
('employee1', '$2b$10$EixZaYb1j9LbFQE8wH6t9eB7hN3vX5eP7Y9Q1R3T5U7V9W2X4Z6Y8', '员工小张', '13800138001', 'employee', 1);

INSERT INTO `equipment_categories` (`category_name`, `description`) VALUES
('球杆', '各类高尔夫球杆'),
('球包', '高尔夫球包'),
('球', '高尔夫球'),
('手套', '高尔夫手套'),
('其他', '其他辅助用品');

INSERT INTO `equipment` (`category_id`, `equipment_name`, `equipment_code`, `brand`, `specs`, `rental_price`, `total_quantity`, `available_quantity`) VALUES
(1, '一号木杆', 'DRIVER-001', 'Titleist', '10.5度 R杆身', 50.00, 10, 10),
(1, '铁杆组', 'IRON-001', 'Callaway', '5-PW 钢杆身', 80.00, 8, 8),
(2, '标准球包', 'BAG-001', 'Ping', '标准尺寸', 30.00, 5, 5),
(3, '练习球', 'BALL-001', 'Titleist', '二层练习球', 0.50, 1000, 1000),
(4, '男士手套', 'GLOVE-M001', 'FootJoy', 'L码', 20.00, 20, 20);

INSERT INTO `hitting_bays` (`bay_number`, `bay_type`, `floor`, `position_x`, `position_y`, `has_sensor`, `status`, `price_per_hour`, `description`) VALUES
('101', 'single', 1, 1, 1, 0, 'available', 50.00, '一楼普通打位'),
('102', 'single', 1, 2, 1, 0, 'available', 50.00, '一楼普通打位'),
('103', 'single', 1, 3, 1, 1, 'available', 60.00, '一楼带传感器打位'),
('104', 'single', 1, 4, 1, 1, 'available', 60.00, '一楼带传感器打位'),
('105', 'double', 1, 1, 2, 0, 'available', 80.00, '一楼双打位'),
('201', 'single', 2, 1, 1, 1, 'available', 70.00, '二楼带传感器打位'),
('202', 'single', 2, 2, 1, 1, 'available', 70.00, '二楼带传感器打位'),
('203', 'vip', 2, 3, 1, 1, 'available', 150.00, '二楼VIP打位');

INSERT INTO `coaches` (`coach_name`, `phone`, `title`, `specialty`, `price_per_hour`, `status`, `description`) VALUES
('李教练', '13900139001', '资深教练', '挥杆动作纠正、短杆技术', 300.00, 1, 'PGA认证教练，10年教学经验'),
('王教练', '13900139002', '初级教练', '入门教学、基础动作', 200.00, 1, '5年教学经验，擅长新手教学'),
('张教练', '13900139003', '高级教练', '体能训练、球场策略', 400.00, 1, '职业球员背景，专业体能指导');

INSERT INTO `card_types` (`card_name`, `card_type`, `duration_days`, `duration_hours`, `price`, `discount`, `status`, `description`) VALUES
('月卡-无限畅打', 'monthly', 30, NULL, 1500.00, 100.00, 1, '一个月内无限畅打'),
('季度卡-无限畅打', 'monthly', 90, NULL, 4000.00, 95.00, 1, '三个月内无限畅打'),
('10小时时长卡', 'duration', 365, 10.00, 450.00, 90.00, 1, '10小时打球时长，有效期一年'),
('50小时时长卡', 'duration', 365, 50.00, 2000.00, 80.00, 1, '50小时打球时长，有效期一年'),
('储值卡1000元', 'stored', 365, NULL, 1000.00, 95.00, 1, '储值1000元，享95折'),
('储值卡5000元', 'stored', 365, NULL, 5000.00, 85.00, 1, '储值5000元，享85折');
