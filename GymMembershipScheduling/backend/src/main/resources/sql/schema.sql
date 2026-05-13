-- 健身房会员与排课管理系统数据库
CREATE DATABASE IF NOT EXISTS gym_membership DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE gym_membership;

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    `username` VARCHAR(50) NOT NULL COMMENT '用户名',
    `password` VARCHAR(255) NOT NULL COMMENT '密码',
    `real_name` VARCHAR(50) NOT NULL COMMENT '真实姓名',
    `phone` VARCHAR(20) COMMENT '手机号',
    `email` VARCHAR(100) COMMENT '邮箱',
    `avatar` VARCHAR(255) COMMENT '头像',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 1-正常, 0-禁用',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`),
    UNIQUE KEY `uk_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 角色表
CREATE TABLE IF NOT EXISTS `role` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '角色ID',
    `role_name` VARCHAR(50) NOT NULL COMMENT '角色名称',
    `role_code` VARCHAR(50) NOT NULL COMMENT '角色编码',
    `description` VARCHAR(255) COMMENT '描述',
    `status` TINYINT DEFAULT 1 COMMENT '状态',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted` TINYINT DEFAULT 0,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_role_code` (`role_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

-- 用户角色关联表
CREATE TABLE IF NOT EXISTS `user_role` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `role_id` BIGINT NOT NULL,
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_role` (`user_id`, `role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联表';

-- 会员卡类型表
CREATE TABLE IF NOT EXISTS `membership_card_type` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '卡类型ID',
    `type_name` VARCHAR(50) NOT NULL COMMENT '卡类型名称: 年卡/季卡/次卡',
    `type_code` VARCHAR(50) NOT NULL COMMENT '卡类型编码',
    `duration_days` INT COMMENT '有效期天数(年卡/季卡)',
    `total_times` INT COMMENT '总次数(次卡)',
    `price` DECIMAL(10,2) NOT NULL COMMENT '价格',
    `description` VARCHAR(255) COMMENT '描述',
    `status` TINYINT DEFAULT 1 COMMENT '状态',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted` TINYINT DEFAULT 0,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会员卡类型表';

-- 会员卡表
CREATE TABLE IF NOT EXISTS `membership_card` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '会员卡ID',
    `card_no` VARCHAR(50) NOT NULL COMMENT '会员卡号',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `card_type_id` BIGINT NOT NULL COMMENT '卡类型ID',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 1-正常, 2-已过期, 3-已冻结',
    `start_date` DATE COMMENT '开始日期',
    `end_date` DATE COMMENT '结束日期',
    `remaining_times` INT COMMENT '剩余次数(次卡)',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted` TINYINT DEFAULT 0,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_card_no` (`card_no`),
    KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会员卡表';

-- 购卡记录表
CREATE TABLE IF NOT EXISTS `membership_card_order` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_no` VARCHAR(50) NOT NULL COMMENT '订单号',
    `user_id` BIGINT NOT NULL,
    `card_id` BIGINT COMMENT '会员卡ID',
    `card_type_id` BIGINT NOT NULL,
    `amount` DECIMAL(10,2) NOT NULL COMMENT '金额',
    `pay_type` VARCHAR(20) COMMENT '支付方式',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 1-已支付, 0-待支付',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_order_no` (`order_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='购卡记录表';

-- 课程类型表
CREATE TABLE IF NOT EXISTS `course_type` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `type_name` VARCHAR(50) NOT NULL COMMENT '课程类型: 瑜伽/动感单车等',
    `description` VARCHAR(255),
    `status` TINYINT DEFAULT 1,
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted` TINYINT DEFAULT 0,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='课程类型表';

-- 团体课排课表
CREATE TABLE IF NOT EXISTS `group_class_schedule` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `course_type_id` BIGINT NOT NULL,
    `coach_id` BIGINT NOT NULL COMMENT '教练ID',
    `class_date` DATE NOT NULL COMMENT '上课日期',
    `start_time` TIME NOT NULL COMMENT '开始时间',
    `end_time` TIME NOT NULL COMMENT '结束时间',
    `classroom` VARCHAR(50) COMMENT '教室',
    `max_participants` INT DEFAULT 20 COMMENT '最大人数',
    `current_participants` INT DEFAULT 0 COMMENT '当前人数',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 1-可预约, 2-已取消',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted` TINYINT DEFAULT 0,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='团体课排课表';

-- 团体课预约表
CREATE TABLE IF NOT EXISTS `group_class_booking` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `schedule_id` BIGINT NOT NULL,
    `status` TINYINT DEFAULT 1 COMMENT '状态: 1-已预约, 2-已取消, 3-已完成',
    `booking_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `check_in_time` DATETIME COMMENT '签到时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_schedule` (`user_id`, `schedule_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='团体课预约表';

-- 私教课程表
CREATE TABLE IF NOT EXISTS `private_course` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL COMMENT '会员ID',
    `coach_id` BIGINT NOT NULL COMMENT '教练ID',
    `total_hours` INT NOT NULL COMMENT '总课时',
    `remaining_hours` INT NOT NULL COMMENT '剩余课时',
    `price` DECIMAL(10,2) NOT NULL COMMENT '总价',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 1-进行中, 2-已完成',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted` TINYINT DEFAULT 0,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_coach_id` (`coach_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='私教课程表';

-- 私教排课表
CREATE TABLE IF NOT EXISTS `private_schedule` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `course_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `coach_id` BIGINT NOT NULL,
    `schedule_date` DATE NOT NULL COMMENT '排课日期',
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL,
    `status` TINYINT DEFAULT 1 COMMENT '状态: 1-待上课, 2-已完成, 3-已取消',
    `check_in_time` DATETIME COMMENT '签到时间',
    `consume_hours` DECIMAL(3,1) DEFAULT 1.0 COMMENT '消耗课时',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='私教排课表';

-- 教练业绩表
CREATE TABLE IF NOT EXISTS `coach_performance` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `coach_id` BIGINT NOT NULL,
    `performance_date` DATE NOT NULL COMMENT '业绩日期',
    `private_classes` INT DEFAULT 0 COMMENT '私教课时数',
    `group_classes` INT DEFAULT 0 COMMENT '团体课节数',
    `sales_amount` DECIMAL(10,2) DEFAULT 0 COMMENT '销售额',
    `commission` DECIMAL(10,2) DEFAULT 0 COMMENT '提成',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_coach_date` (`coach_id`, `performance_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='教练业绩表';

-- 提成规则表
CREATE TABLE IF NOT EXISTS `commission_rule` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `rule_name` VARCHAR(50) NOT NULL,
    `rule_type` VARCHAR(20) NOT NULL COMMENT '规则类型: 私教/团体课/销售',
    `commission_rate` DECIMAL(5,2) NOT NULL COMMENT '提成比例',
    `fixed_amount` DECIMAL(10,2) DEFAULT 0 COMMENT '固定金额',
    `status` TINYINT DEFAULT 1,
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='提成规则表';

-- 入场闸机记录表
CREATE TABLE IF NOT EXISTS `gate_record` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `card_id` BIGINT COMMENT '会员卡ID',
    `gate_no` VARCHAR(50) COMMENT '闸机编号',
    `in_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '入场时间',
    `out_time` DATETIME COMMENT '出场时间',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 1-在场, 2-已离场',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_in_time` (`in_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='入场闸机记录表';

-- 续卡提醒表
CREATE TABLE IF NOT EXISTS `renewal_reminder` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `card_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `reminder_type` VARCHAR(20) NOT NULL COMMENT '提醒类型: 即将过期/次数不足',
    `reminder_date` DATE NOT NULL COMMENT '提醒日期',
    `status` TINYINT DEFAULT 0 COMMENT '状态: 0-未发送, 1-已发送',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='续卡提醒表';

-- 初始化数据
INSERT INTO `role` (`role_name`, `role_code`, `description`) VALUES
('超级管理员', 'ADMIN', '系统最高权限'),
('前台', 'RECEPTION', '前台工作人员'),
('教练', 'COACH', '健身教练'),
('会员', 'MEMBER', '普通会员');

INSERT INTO `membership_card_type` (`type_name`, `type_code`, `duration_days`, `total_times`, `price`, `description`) VALUES
('年卡', 'YEAR_CARD', 365, NULL, 3600.00, '年度会员卡，有效期一年'),
('季卡', 'QUARTER_CARD', 90, NULL, 1200.00, '季度会员卡，有效期三个月'),
('月卡', 'MONTH_CARD', 30, NULL, 500.00, '月度会员卡，有效期一个月'),
('次卡-20次', 'TIMES_CARD_20', NULL, 20, 1000.00, '20次卡，有效期6个月'),
('次卡-50次', 'TIMES_CARD_50', NULL, 50, 2000.00, '50次卡，有效期12个月');

INSERT INTO `course_type` (`type_name`, `description`) VALUES
('瑜伽', '瑜伽课程，包括哈他瑜伽、流瑜伽等'),
('动感单车', '动感单车有氧运动'),
('普拉提', '普拉提塑形课程'),
('搏击操', '搏击操有氧课程'),
('拉丁舞', '拉丁舞健身课程'),
('杠铃操', '杠铃操力量训练');

INSERT INTO `commission_rule` (`rule_name`, `rule_type`, `commission_rate`, `fixed_amount`, `status`) VALUES
('私教课程提成', 'PRIVATE', 20.00, 0.00, 1),
('团体课提成', 'GROUP', 0.00, 50.00, 1),
('销售提成', 'SALES', 5.00, 0.00, 1);

-- 初始管理员账号: admin / 123456
-- BCrypt 密码 (使用 PasswordHashGenerator 生成):
INSERT INTO `user` (`username`, `password`, `real_name`, `phone`, `status`) VALUES
('admin', '$2a$10$WVD74MfGtTmqcIqc4.nPTunaPFKYMkPKlNWJCo70GaqEP1Wq/GUbW', '系统管理员', '13800000000', 1);

INSERT INTO `user_role` (`user_id`, `role_id`) VALUES (1, 1);
