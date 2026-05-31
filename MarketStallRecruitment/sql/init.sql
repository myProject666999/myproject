CREATE DATABASE IF NOT EXISTS market_stall_recruitment DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE market_stall_recruitment;

DROP TABLE IF EXISTS `sys_user`;
DROP TABLE IF EXISTS `event`;
DROP TABLE IF EXISTS `stall`;
DROP TABLE IF EXISTS `registration`;
DROP TABLE IF EXISTS `payment`;
DROP TABLE IF EXISTS `check_in`;
DROP TABLE IF EXISTS `announcement`;
DROP TABLE IF EXISTS `stall_lock`;

CREATE TABLE `sys_user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password` VARCHAR(128) NOT NULL COMMENT '密码',
  `real_name` VARCHAR(50) DEFAULT NULL COMMENT '真实姓名',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  `role` TINYINT NOT NULL DEFAULT 2 COMMENT '角色: 0-超级管理员 1-活动管理员 2-摊主',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用 1-启用',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除: 0-未删除 1-已删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统用户表';

CREATE TABLE `event` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(100) NOT NULL COMMENT '活动名称',
  `description` TEXT COMMENT '活动描述',
  `cover_image` VARCHAR(255) DEFAULT NULL COMMENT '封面图URL',
  `address` VARCHAR(255) DEFAULT NULL COMMENT '活动地址',
  `start_time` DATETIME NOT NULL COMMENT '活动开始时间',
  `end_time` DATETIME NOT NULL COMMENT '活动结束时间',
  `registration_start` DATETIME NOT NULL COMMENT '报名开始时间',
  `registration_end` DATETIME NOT NULL COMMENT '报名截止时间',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0-草稿 1-报名中 2-进行中 3-已结束',
  `map_config` JSON DEFAULT NULL COMMENT '摊位地图配置(行列数、区域等)',
  `contact_phone` VARCHAR(20) DEFAULT NULL COMMENT '联系电话',
  `organizer` VARCHAR(100) DEFAULT NULL COMMENT '主办方',
  `create_by` BIGINT NOT NULL COMMENT '创建人ID',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_create_by` (`create_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动表';

CREATE TABLE `stall` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `event_id` BIGINT NOT NULL COMMENT '所属活动ID',
  `stall_code` VARCHAR(30) NOT NULL COMMENT '摊位编号',
  `stall_name` VARCHAR(50) DEFAULT NULL COMMENT '摊位名称',
  `zone` VARCHAR(50) DEFAULT NULL COMMENT '区域(如A区、B区)',
  `row_num` INT DEFAULT NULL COMMENT '行号(地图定位)',
  `col_num` INT DEFAULT NULL COMMENT '列号(地图定位)',
  `stall_type` TINYINT NOT NULL DEFAULT 0 COMMENT '摊位类型: 0-标准摊位 1-精品摊位 2-美食摊位',
  `area_size` DECIMAL(6,2) DEFAULT NULL COMMENT '面积(平方米)',
  `price` DECIMAL(10,2) NOT NULL COMMENT '摊位费用',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0-空闲 1-已锁定 2-已分配 3-已占用',
  `facilities` VARCHAR(255) DEFAULT NULL COMMENT '配套设施(逗号分隔)',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_event_stall_code` (`event_id`, `stall_code`),
  KEY `idx_event_id` (`event_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='摊位表';

CREATE TABLE `registration` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `event_id` BIGINT NOT NULL COMMENT '活动ID',
  `user_id` BIGINT NOT NULL COMMENT '摊主用户ID',
  `stall_id` BIGINT DEFAULT NULL COMMENT '分配的摊位ID',
  `business_name` VARCHAR(100) NOT NULL COMMENT '经营名称/品牌名',
  `business_type` TINYINT NOT NULL COMMENT '经营类型: 0-文创 1-手工 2-美食 3-服饰 4-其他',
  `business_desc` VARCHAR(500) DEFAULT NULL COMMENT '经营描述',
  `business_images` VARCHAR(1000) DEFAULT NULL COMMENT '经营图片(逗号分隔URL)',
  `id_card_number` VARCHAR(20) DEFAULT NULL COMMENT '身份证号(签到核验)',
  `contact_phone` VARCHAR(20) NOT NULL COMMENT '联系电话',
  `audit_status` TINYINT NOT NULL DEFAULT 0 COMMENT '审核状态: 0-待审核 1-审核通过 2-审核拒绝',
  `audit_remark` VARCHAR(255) DEFAULT NULL COMMENT '审核备注',
  `audit_by` BIGINT DEFAULT NULL COMMENT '审核人ID',
  `audit_time` DATETIME DEFAULT NULL COMMENT '审核时间',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '报名状态: 0-已报名 1-已选位 2-已缴费 3-已签到 4-已取消',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_event_user` (`event_id`, `user_id`),
  KEY `idx_audit_status` (`audit_status`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='报名表';

CREATE TABLE `payment` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `payment_no` VARCHAR(64) NOT NULL COMMENT '支付流水号',
  `registration_id` BIGINT NOT NULL COMMENT '报名ID',
  `user_id` BIGINT NOT NULL COMMENT '支付用户ID',
  `event_id` BIGINT NOT NULL COMMENT '活动ID',
  `stall_id` BIGINT NOT NULL COMMENT '摊位ID',
  `amount` DECIMAL(10,2) NOT NULL COMMENT '支付金额',
  `payment_type` TINYINT NOT NULL DEFAULT 0 COMMENT '类型: 0-缴费 1-退款',
  `payment_method` TINYINT DEFAULT NULL COMMENT '支付方式: 0-微信 1-支付宝 2-银行转账 3-现金',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0-待支付 1-支付成功 2-支付失败 3-退款中 4-已退款 5-退款拒绝',
  `pay_time` DATETIME DEFAULT NULL COMMENT '支付时间',
  `refund_reason` VARCHAR(255) DEFAULT NULL COMMENT '退款原因',
  `refund_time` DATETIME DEFAULT NULL COMMENT '退款时间',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_payment_no` (`payment_no`),
  KEY `idx_registration_id` (`registration_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_event_id` (`event_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支付表';

CREATE TABLE `check_in` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `event_id` BIGINT NOT NULL COMMENT '活动ID',
  `registration_id` BIGINT NOT NULL COMMENT '报名ID',
  `user_id` BIGINT NOT NULL COMMENT '摊主用户ID',
  `stall_id` BIGINT NOT NULL COMMENT '摊位ID',
  `check_in_time` DATETIME NOT NULL COMMENT '签到时间',
  `check_in_type` TINYINT NOT NULL DEFAULT 0 COMMENT '签到方式: 0-二维码 1-人工',
  `check_in_code` VARCHAR(64) DEFAULT NULL COMMENT '签到码(防代签)',
  `device_info` VARCHAR(255) DEFAULT NULL COMMENT '设备信息',
  `location` VARCHAR(100) DEFAULT NULL COMMENT '签到位置(GPS)',
  `verified_by` BIGINT DEFAULT NULL COMMENT '核验人ID',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0-无效 1-有效',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_event_user` (`event_id`, `user_id`),
  KEY `idx_check_in_code` (`check_in_code`),
  KEY `idx_registration_id` (`registration_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='签到表';

CREATE TABLE `announcement` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `event_id` BIGINT NOT NULL COMMENT '活动ID',
  `title` VARCHAR(100) NOT NULL COMMENT '公告标题',
  `content` TEXT NOT NULL COMMENT '公告内容',
  `type` TINYINT NOT NULL DEFAULT 0 COMMENT '类型: 0-普通公告 1-紧急公告 2-活动通知',
  `is_top` TINYINT NOT NULL DEFAULT 0 COMMENT '是否置顶: 0-否 1-是',
  `publish_time` DATETIME DEFAULT NULL COMMENT '发布时间',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0-草稿 1-已发布 2-已撤回',
  `create_by` BIGINT NOT NULL COMMENT '创建人ID',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_event_id` (`event_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='公告表';

CREATE TABLE `stall_lock` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `stall_id` BIGINT NOT NULL COMMENT '摊位ID',
  `event_id` BIGINT NOT NULL COMMENT '活动ID',
  `user_id` BIGINT NOT NULL COMMENT '锁定用户ID',
  `lock_time` DATETIME NOT NULL COMMENT '锁定时间',
  `expire_time` DATETIME NOT NULL COMMENT '过期时间',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0-已释放 1-锁定中',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_stall_event` (`stall_id`, `event_id`),
  KEY `idx_expire_time` (`expire_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='摊位锁定表(并发选位控制)';

INSERT INTO `sys_user` (`username`, `password`, `real_name`, `phone`, `role`, `status`) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '系统管理员', '13800000000', 0, 1);
