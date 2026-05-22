-- =============================================
-- 用药提醒系统数据库脚本
-- 技术栈: MySQL 5.7+
-- 字符集: utf8mb4
-- =============================================

CREATE DATABASE IF NOT EXISTS medication_reminder
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE medication_reminder;

-- =============================================
-- 1. 用户表（病人/老人）
-- =============================================
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id`          BIGINT        NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `name`        VARCHAR(50)   NOT NULL COMMENT '姓名',
  `gender`      TINYINT       DEFAULT 0 COMMENT '性别 0-未知 1-男 2-女',
  `age`         INT           DEFAULT 0 COMMENT '年龄',
  `phone`       VARCHAR(20)   DEFAULT NULL COMMENT '联系电话',
  `avatar`      VARCHAR(255)  DEFAULT NULL COMMENT '头像URL',
  `create_time` DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted`     TINYINT       DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- =============================================
-- 2. 药品表
-- =============================================
DROP TABLE IF EXISTS `medicine`;
CREATE TABLE `medicine` (
  `id`            BIGINT        NOT NULL AUTO_INCREMENT COMMENT '药品ID',
  `name`          VARCHAR(100)  NOT NULL COMMENT '药品名称',
  `generic_name`  VARCHAR(100)  DEFAULT NULL COMMENT '通用名',
  `specification` VARCHAR(100)  DEFAULT NULL COMMENT '规格 如: 500mg/片',
  `manufacturer`  VARCHAR(100)  DEFAULT NULL COMMENT '生产厂家',
  `category`      VARCHAR(50)   DEFAULT NULL COMMENT '药品分类 如: 降压药、降糖药',
  `description`   TEXT          DEFAULT NULL COMMENT '药品说明',
  `image`         VARCHAR(255)  DEFAULT NULL COMMENT '药品图片URL',
  `create_time`   DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time`   DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted`       TINYINT       DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='药品表';

-- =============================================
-- 3. 用药计划表
-- 频率类型: daily(每日), alternate_day(隔日), weekly(每周)
-- 对于 weekly 类型，week_days 存储具体星期几，如 1,3,5 表示周一三五
-- =============================================
DROP TABLE IF EXISTS `medication_schedule`;
CREATE TABLE `medication_schedule` (
  `id`             BIGINT        NOT NULL AUTO_INCREMENT COMMENT '计划ID',
  `user_id`        BIGINT        NOT NULL COMMENT '用户ID',
  `medicine_id`    BIGINT        NOT NULL COMMENT '药品ID',
  `dosage`         VARCHAR(50)   NOT NULL COMMENT '每次剂量 如: 1片、2粒',
  `frequency_type` VARCHAR(20)   NOT NULL COMMENT '频率类型: daily/alternate_day/weekly',
  `week_days`      VARCHAR(20)   DEFAULT NULL COMMENT '周频率时的具体日期 如: 1,3,5 (1=周一)',
  `time_slots`     VARCHAR(200)  NOT NULL COMMENT '用药时间点 多个用逗号分隔 如: 08:00,12:00,18:00',
  `start_date`     DATE          NOT NULL COMMENT '开始日期',
  `end_date`       DATE          DEFAULT NULL COMMENT '结束日期 NULL表示长期',
  `status`         TINYINT       DEFAULT 1 COMMENT '状态 0-停用 1-启用',
  `remark`         VARCHAR(500)  DEFAULT NULL COMMENT '备注',
  `create_time`    DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time`    DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted`        TINYINT       DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_medicine_id` (`medicine_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用药计划表';

-- =============================================
-- 4. 库存表
-- =============================================
DROP TABLE IF EXISTS `inventory`;
CREATE TABLE `inventory` (
  `id`              BIGINT        NOT NULL AUTO_INCREMENT COMMENT '库存ID',
  `user_id`         BIGINT        NOT NULL COMMENT '用户ID',
  `medicine_id`     BIGINT        NOT NULL COMMENT '药品ID',
  `quantity`        INT           NOT NULL DEFAULT 0 COMMENT '当前库存数量',
  `unit`            VARCHAR(20)   DEFAULT '片' COMMENT '单位 如: 片、粒、瓶',
  `warning_quantity` INT          NOT NULL DEFAULT 10 COMMENT '低库存预警值',
  `expiry_date`     DATE          DEFAULT NULL COMMENT '有效期',
  `batch_no`        VARCHAR(50)   DEFAULT NULL COMMENT '批号',
  `create_time`     DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time`     DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted`         TINYINT       DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_medicine_id` (`medicine_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存表';

-- =============================================
-- 5. 家属表
-- =============================================
DROP TABLE IF EXISTS `family_member`;
CREATE TABLE `family_member` (
  `id`          BIGINT        NOT NULL AUTO_INCREMENT COMMENT '家属ID',
  `name`        VARCHAR(50)   NOT NULL COMMENT '家属姓名',
  `phone`       VARCHAR(20)   NOT NULL COMMENT '联系电话',
  `relation`    VARCHAR(20)   DEFAULT NULL COMMENT '与用户关系 如: 儿子、女儿',
  `email`       VARCHAR(100)  DEFAULT NULL COMMENT '邮箱',
  `create_time` DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted`     TINYINT       DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='家属表';

-- =============================================
-- 6. 家属-用户关联表（家属共享）
-- =============================================
DROP TABLE IF EXISTS `family_user_relation`;
CREATE TABLE `family_user_relation` (
  `id`               BIGINT   NOT NULL AUTO_INCREMENT COMMENT '关联ID',
  `family_member_id` BIGINT   NOT NULL COMMENT '家属ID',
  `user_id`          BIGINT   NOT NULL COMMENT '用户ID',
  `can_edit`         TINYINT  DEFAULT 0 COMMENT '是否可编辑 0-否 1-是',
  `create_time`      DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_family_user` (`family_member_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='家属-用户关联表';

-- =============================================
-- 7. 用药记录表
-- =============================================
DROP TABLE IF EXISTS `medication_log`;
CREATE TABLE `medication_log` (
  `id`           BIGINT        NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `schedule_id`  BIGINT        NOT NULL COMMENT '用药计划ID',
  `user_id`      BIGINT        NOT NULL COMMENT '用户ID',
  `medicine_id`  BIGINT        NOT NULL COMMENT '药品ID',
  `planned_time` DATETIME      NOT NULL COMMENT '计划用药时间',
  `actual_time`  DATETIME      DEFAULT NULL COMMENT '实际用药时间',
  `status`       TINYINT       DEFAULT 0 COMMENT '状态 0-待服药 1-已服药 2-已错过 3-已跳过',
  `remark`       VARCHAR(500)  DEFAULT NULL COMMENT '备注',
  `create_time`  DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_schedule_id` (`schedule_id`),
  KEY `idx_user_date` (`user_id`, `planned_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用药记录表';

-- =============================================
-- 8. 低库存预警表
-- =============================================
DROP TABLE IF EXISTS `low_stock_alert`;
CREATE TABLE `low_stock_alert` (
  `id`            BIGINT        NOT NULL AUTO_INCREMENT COMMENT '预警ID',
  `inventory_id`  BIGINT        NOT NULL COMMENT '库存ID',
  `user_id`       BIGINT        NOT NULL COMMENT '用户ID',
  `medicine_id`   BIGINT        NOT NULL COMMENT '药品ID',
  `alert_type`    VARCHAR(20)   NOT NULL COMMENT '预警类型: low_stock(低库存) expiry(即将过期)',
  `current_value` VARCHAR(50)   NOT NULL COMMENT '当前值 如: 剩余5片',
  `threshold`     VARCHAR(50)   NOT NULL COMMENT '阈值 如: 10片',
  `status`        TINYINT       DEFAULT 0 COMMENT '状态 0-未处理 1-已处理',
  `alert_time`    DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '预警时间',
  `handle_time`   DATETIME      DEFAULT NULL COMMENT '处理时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_inventory_id` (`inventory_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='低库存预警表';

-- =============================================
-- 初始化测试数据
-- =============================================

-- 测试用户
INSERT INTO `user` (`name`, `gender`, `age`, `phone`) VALUES
('张大爷', 1, 72, '13800138001'),
('李奶奶', 2, 68, '13800138002');

-- 测试药品
INSERT INTO `medicine` (`name`, `generic_name`, `specification`, `manufacturer`, `category`, `description`) VALUES
('硝苯地平缓释片', '硝苯地平', '30mg/片', '拜耳制药', '降压药', '用于治疗高血压、冠心病'),
('二甲双胍片', '盐酸二甲双胍', '500mg/片', '中美上海施贵宝', '降糖药', '用于治疗2型糖尿病'),
('阿司匹林肠溶片', '阿司匹林', '100mg/片', '拜耳制药', '抗血小板', '用于预防心脑血管疾病'),
('阿托伐他汀钙片', '阿托伐他汀钙', '20mg/片', '辉瑞制药', '调脂药', '用于治疗高胆固醇血症');

-- 测试库存
INSERT INTO `inventory` (`user_id`, `medicine_id`, `quantity`, `unit`, `warning_quantity`, `expiry_date`) VALUES
(1, 1, 5, '片', 10, '2026-12-31'),
(1, 2, 30, '片', 10, '2026-06-30'),
(1, 3, 15, '片', 10, '2027-03-31'),
(2, 1, 20, '片', 10, '2026-08-31'),
(2, 4, 8, '片', 10, '2026-05-31');

-- 测试用药计划（多频率组合示例）
INSERT INTO `medication_schedule` (`user_id`, `medicine_id`, `dosage`, `frequency_type`, `week_days`, `time_slots`, `start_date`, `remark`) VALUES
(1, 1, '1片', 'daily', NULL, '08:00,20:00', '2026-01-01', '每日早晚各一次'),
(1, 2, '1片', 'daily', NULL, '07:30,12:00,18:00', '2026-01-01', '每日三次，饭后服用'),
(1, 3, '1片', 'alternate_day', NULL, '09:00', '2026-01-01', '隔日一次'),
(2, 1, '1片', 'weekly', '1,3,5', '08:00', '2026-01-01', '每周一三五早8点'),
(2, 4, '1片', 'weekly', '2,4,6', '21:00', '2026-01-01', '每周二四六晚9点');

-- 测试家属
INSERT INTO `family_member` (`name`, `phone`, `relation`, `email`) VALUES
('张小明', '13900139001', '儿子', 'zhangxiaoming@example.com'),
('李小芳', '13900139002', '女儿', 'lixiaofang@example.com');

-- 家属-用户关联
INSERT INTO `family_user_relation` (`family_member_id`, `user_id`, `can_edit`) VALUES
(1, 1, 1),
(2, 2, 1),
(1, 2, 0);

-- 测试低库存预警
INSERT INTO `low_stock_alert` (`inventory_id`, `user_id`, `medicine_id`, `alert_type`, `current_value`, `threshold`, `status`) VALUES
(1, 1, 1, 'low_stock', '剩余5片', '10片', 0),
(5, 2, 4, 'low_stock', '剩余8片', '10片', 0),
(5, 2, 4, 'expiry', '2026-05-31到期', '30天内', 0);
