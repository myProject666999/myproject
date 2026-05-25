-- ============================================================
-- 车辆违章/停车管理系统 数据库脚本
-- Database: vehicle_parking
-- ============================================================

CREATE DATABASE IF NOT EXISTS `vehicle_parking` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `vehicle_parking`;

-- ============================================================
-- 1. 车辆表
-- ============================================================
DROP TABLE IF EXISTS `vehicles`;
CREATE TABLE `vehicles` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `plate_number` VARCHAR(20) NOT NULL COMMENT '车牌号',
    `vehicle_type` TINYINT NOT NULL DEFAULT 1 COMMENT '车辆类型: 1-小型车 2-中型车 3-大型车',
    `owner_name` VARCHAR(50) DEFAULT NULL COMMENT '车主姓名',
    `owner_phone` VARCHAR(20) DEFAULT NULL COMMENT '车主电话',
    `card_type` TINYINT NOT NULL DEFAULT 1 COMMENT '卡片类型: 1-临时车 2-月卡车',
    `card_expire_time` DATETIME DEFAULT NULL COMMENT '月卡到期时间',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-正常 2-禁用',
    `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_plate_number` (`plate_number`),
    KEY `idx_owner_name` (`owner_name`),
    KEY `idx_card_type` (`card_type`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='车辆表';

-- ============================================================
-- 2. 车位表
-- ============================================================
DROP TABLE IF EXISTS `parking_spots`;
CREATE TABLE `parking_spots` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `spot_number` VARCHAR(20) NOT NULL COMMENT '车位编号',
    `spot_type` TINYINT NOT NULL DEFAULT 1 COMMENT '车位类型: 1-小型车位 2-中型车位 3-大型车位',
    `spot_area` VARCHAR(50) DEFAULT NULL COMMENT '车位区域(如A区/B区)',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0-空闲 1-占用 2-预留 3-维修',
    `current_vehicle_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '当前占用车辆ID',
    `current_plate_number` VARCHAR(20) DEFAULT NULL COMMENT '当前占用车牌号',
    `reserved_by` BIGINT UNSIGNED DEFAULT NULL COMMENT '预约车辆ID',
    `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_spot_number` (`spot_number`),
    KEY `idx_status` (`status`),
    KEY `idx_spot_area` (`spot_area`),
    KEY `idx_current_vehicle` (`current_vehicle_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='车位表';

-- ============================================================
-- 3. 出入记录表
-- ============================================================
DROP TABLE IF EXISTS `access_records`;
CREATE TABLE `access_records` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `plate_number` VARCHAR(20) NOT NULL COMMENT '车牌号',
    `vehicle_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '车辆ID',
    `access_type` TINYINT NOT NULL COMMENT '出入类型: 1-入场 2-出场',
    `access_time` DATETIME NOT NULL COMMENT '出入时间',
    `spot_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '车位ID',
    `entry_record_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联的入场记录ID(出场时关联)',
    `entry_time` DATETIME DEFAULT NULL COMMENT '入场时间(冗余,方便计算)',
    `exit_time` DATETIME DEFAULT NULL COMMENT '出场时间',
    `parking_duration` INT DEFAULT NULL COMMENT '停车时长(分钟)',
    `parking_fee` DECIMAL(10,2) DEFAULT NULL COMMENT '停车费用',
    `pay_status` TINYINT NOT NULL DEFAULT 0 COMMENT '支付状态: 0-未支付 1-已支付 2-免费',
    `pay_time` DATETIME DEFAULT NULL COMMENT '支付时间',
    `pay_method` VARCHAR(20) DEFAULT NULL COMMENT '支付方式: 微信/支付宝/月卡',
    `operator_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '操作员ID',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_plate_number` (`plate_number`),
    KEY `idx_vehicle_id` (`vehicle_id`),
    KEY `idx_access_time` (`access_time`),
    KEY `idx_entry_record_id` (`entry_record_id`),
    KEY `idx_pay_status` (`pay_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='出入记录表';

-- ============================================================
-- 4. 计费规则表
-- ============================================================
DROP TABLE IF EXISTS `billing_rules`;
CREATE TABLE `billing_rules` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `rule_name` VARCHAR(50) NOT NULL COMMENT '规则名称',
    `vehicle_type` TINYINT NOT NULL DEFAULT 1 COMMENT '适用车辆类型: 1-小型车 2-中型车 3-大型车',
    `base_fee` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '基础费用(首段)',
    `base_duration` INT NOT NULL DEFAULT 30 COMMENT '基础时长(分钟)',
    `unit_fee` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '超出基础时长后的单位费用',
    `unit_duration` INT NOT NULL DEFAULT 30 COMMENT '单位时长(分钟)',
    `max_fee` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '单日封顶费用(0表示不封顶)',
    `free_duration` INT NOT NULL DEFAULT 15 COMMENT '免费时长(分钟)',
    `monthly_fee` DECIMAL(10,2) DEFAULT NULL COMMENT '月卡费用',
    `priority` INT NOT NULL DEFAULT 0 COMMENT '优先级(数字越大优先级越高)',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-启用 0-禁用',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_vehicle_type` (`vehicle_type`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='计费规则表';

-- ============================================================
-- 5. 月卡记录表
-- ============================================================
DROP TABLE IF EXISTS `monthly_cards`;
CREATE TABLE `monthly_cards` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `card_number` VARCHAR(30) NOT NULL COMMENT '月卡编号',
    `vehicle_id` BIGINT UNSIGNED NOT NULL COMMENT '车辆ID',
    `plate_number` VARCHAR(20) NOT NULL COMMENT '车牌号(冗余)',
    `owner_name` VARCHAR(50) DEFAULT NULL COMMENT '车主姓名(冗余)',
    `owner_phone` VARCHAR(20) DEFAULT NULL COMMENT '车主电话(冗余)',
    `start_date` DATE NOT NULL COMMENT '开始日期',
    `end_date` DATE NOT NULL COMMENT '结束日期',
    `months` INT NOT NULL COMMENT '购买月数',
    `total_fee` DECIMAL(10,2) NOT NULL COMMENT '总费用',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-有效 2-已过期 3-已退卡',
    `operator_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '操作员ID',
    `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_card_number` (`card_number`),
    KEY `idx_vehicle_id` (`vehicle_id`),
    KEY `idx_plate_number` (`plate_number`),
    KEY `idx_status` (`status`),
    KEY `idx_end_date` (`end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='月卡记录表';

-- ============================================================
-- 6. 支付记录表
-- ============================================================
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `payment_number` VARCHAR(30) NOT NULL COMMENT '支付单号',
    `record_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '出入记录ID',
    `card_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '月卡记录ID',
    `payment_type` TINYINT NOT NULL COMMENT '支付类型: 1-临时停车费 2-月卡续费',
    `amount` DECIMAL(10,2) NOT NULL COMMENT '支付金额',
    `pay_method` VARCHAR(20) NOT NULL COMMENT '支付方式: 微信/支付宝/现金',
    `pay_status` TINYINT NOT NULL DEFAULT 0 COMMENT '支付状态: 0-待支付 1-已支付 2-已退款',
    `pay_time` DATETIME DEFAULT NULL COMMENT '支付时间',
    `operator_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '操作员ID',
    `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_payment_number` (`payment_number`),
    KEY `idx_record_id` (`record_id`),
    KEY `idx_card_id` (`card_id`),
    KEY `idx_pay_status` (`pay_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支付记录表';

-- ============================================================
-- 7. 用户表(管理员/操作员)
-- ============================================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `username` VARCHAR(30) NOT NULL COMMENT '用户名',
    `password` VARCHAR(100) NOT NULL COMMENT '密码(加密)',
    `real_name` VARCHAR(50) DEFAULT NULL COMMENT '真实姓名',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
    `role` TINYINT NOT NULL DEFAULT 1 COMMENT '角色: 1-管理员 2-操作员',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-正常 2-禁用',
    `last_login_time` DATETIME DEFAULT NULL COMMENT '最后登录时间',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ============================================================
-- 初始化数据
-- ============================================================

-- 初始化管理员账号 (密码: 123456, bcrypt hash)
INSERT INTO `users` (`username`, `password`, `real_name`, `role`, `status`) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '系统管理员', 1, 1);

-- 初始化计费规则
INSERT INTO `billing_rules` (`rule_name`, `vehicle_type`, `base_fee`, `base_duration`, `unit_fee`, `unit_duration`, `max_fee`, `free_duration`, `monthly_fee`, `priority`, `status`) VALUES
('小型车标准计费', 1, 5.00, 30, 3.00, 30, 50.00, 15, 300.00, 100, 1),
('中型车标准计费', 2, 8.00, 30, 5.00, 30, 80.00, 15, 500.00, 90, 1),
('大型车标准计费', 3, 12.00, 30, 8.00, 30, 120.00, 15, 800.00, 80, 1);

-- 初始化车位数据 (示例60个车位)
INSERT INTO `parking_spots` (`spot_number`, `spot_type`, `spot_area`, `status`) VALUES
('A001', 1, 'A区', 0), ('A002', 1, 'A区', 0), ('A003', 1, 'A区', 0),
('A004', 1, 'A区', 0), ('A005', 1, 'A区', 0), ('A006', 1, 'A区', 0),
('A007', 1, 'A区', 0), ('A008', 1, 'A区', 0), ('A009', 1, 'A区', 0),
('A010', 1, 'A区', 0), ('A011', 1, 'A区', 0), ('A012', 1, 'A区', 0),
('A013', 1, 'A区', 0), ('A014', 1, 'A区', 0), ('A015', 1, 'A区', 0),
('A016', 1, 'A区', 0), ('A017', 1, 'A区', 0), ('A018', 1, 'A区', 0),
('A019', 1, 'A区', 0), ('A020', 1, 'A区', 0),
('B001', 1, 'B区', 0), ('B002', 1, 'B区', 0), ('B003', 1, 'B区', 0),
('B004', 1, 'B区', 0), ('B005', 1, 'B区', 0), ('B006', 1, 'B区', 0),
('B007', 1, 'B区', 0), ('B008', 1, 'B区', 0), ('B009', 1, 'B区', 0),
('B010', 1, 'B区', 0), ('B011', 1, 'B区', 0), ('B012', 1, 'B区', 0),
('B013', 1, 'B区', 0), ('B014', 1, 'B区', 0), ('B015', 1, 'B区', 0),
('B016', 1, 'B区', 0), ('B017', 1, 'B区', 0), ('B018', 1, 'B区', 0),
('B019', 1, 'B区', 0), ('B020', 1, 'B区', 0),
('C001', 2, 'C区', 0), ('C002', 2, 'C区', 0), ('C003', 2, 'C区', 0),
('C004', 2, 'C区', 0), ('C005', 2, 'C区', 0), ('C006', 2, 'C区', 0),
('C007', 2, 'C区', 0), ('C008', 2, 'C区', 0), ('C009', 2, 'C区', 0),
('C010', 2, 'C区', 0),
('D001', 3, 'D区', 0), ('D002', 3, 'D区', 0), ('D003', 3, 'D区', 0),
('D004', 3, 'D区', 0), ('D005', 3, 'D区', 0), ('D006', 3, 'D区', 0),
('D007', 3, 'D区', 0), ('D008', 3, 'D区', 0), ('D009', 3, 'D区', 0),
('D010', 3, 'D区', 0);
