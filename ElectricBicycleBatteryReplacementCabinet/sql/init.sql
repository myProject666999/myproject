-- ========================================
-- 电动自行车换电柜运营管理系统 - 数据库脚本
-- 数据库: battery_cabinet
-- ========================================

CREATE DATABASE IF NOT EXISTS `battery_cabinet` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `battery_cabinet`;

SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------
-- 1. 换电柜表
-- ----------------------------------------
DROP TABLE IF EXISTS `cabinet`;
CREATE TABLE `cabinet` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `cabinet_no` VARCHAR(64) NOT NULL COMMENT '换电柜编号',
  `name` VARCHAR(128) NOT NULL COMMENT '换电柜名称',
  `address` VARCHAR(256) NOT NULL COMMENT '地址',
  `longitude` DECIMAL(10, 7) NOT NULL COMMENT '经度',
  `latitude` DECIMAL(10, 7) NOT NULL COMMENT '纬度',
  `total_slots` TINYINT UNSIGNED NOT NULL DEFAULT 10 COMMENT '总槽位数',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-正常 2-维护中 3-离线',
  `last_heartbeat_at` DATETIME DEFAULT NULL COMMENT '最后心跳时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_cabinet_no` (`cabinet_no`),
  KEY `idx_location` (`longitude`, `latitude`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='换电柜表';

-- ----------------------------------------
-- 2. 换电柜槽位表
-- ----------------------------------------
DROP TABLE IF EXISTS `cabinet_slot`;
CREATE TABLE `cabinet_slot` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `cabinet_id` BIGINT UNSIGNED NOT NULL COMMENT '换电柜ID',
  `slot_no` TINYINT UNSIGNED NOT NULL COMMENT '槽位号',
  `battery_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '当前电池ID',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-空 2-有电池 3-故障',
  `lock_status` TINYINT NOT NULL DEFAULT 1 COMMENT '锁状态: 1-锁定 2-解锁',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_cabinet_slot` (`cabinet_id`, `slot_no`),
  KEY `idx_battery_id` (`battery_id`),
  KEY `idx_cabinet_status` (`cabinet_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='换电柜槽位表';

-- ----------------------------------------
-- 3. 电池表
-- ----------------------------------------
DROP TABLE IF EXISTS `battery`;
CREATE TABLE `battery` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `battery_no` VARCHAR(64) NOT NULL COMMENT '电池编号',
  `model` VARCHAR(64) NOT NULL COMMENT '电池型号',
  `capacity` INT UNSIGNED NOT NULL COMMENT '额定容量(Ah)',
  `voltage` DECIMAL(5, 2) NOT NULL COMMENT '额定电压(V)',
  `current_soc` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '当前电量SOC(0-100)',
  `health_status` TINYINT UNSIGNED NOT NULL DEFAULT 100 COMMENT '健康状态SOH(0-100)',
  `temperature` DECIMAL(5, 2) DEFAULT NULL COMMENT '当前温度(℃)',
  `cycle_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '循环次数',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-可用 2-使用中 3-充电中 4-异常 5-下线',
  `cabinet_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '当前所在换电柜ID',
  `slot_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '当前所在槽位ID',
  `user_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '当前使用用户ID',
  `last_report_at` DATETIME DEFAULT NULL COMMENT '最后上报时间',
  `manufacture_date` DATE DEFAULT NULL COMMENT '生产日期',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_battery_no` (`battery_no`),
  KEY `idx_status` (`status`),
  KEY `idx_soc` (`current_soc`),
  KEY `idx_health` (`health_status`),
  KEY `idx_cabinet` (`cabinet_id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='电池表';

-- ----------------------------------------
-- 4. 电池状态历史表
-- ----------------------------------------
DROP TABLE IF EXISTS `battery_status_history`;
CREATE TABLE `battery_status_history` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `battery_id` BIGINT UNSIGNED NOT NULL COMMENT '电池ID',
  `current_soc` TINYINT UNSIGNED NOT NULL COMMENT '电量SOC',
  `health_status` TINYINT UNSIGNED NOT NULL COMMENT '健康状态SOH',
  `temperature` DECIMAL(5, 2) DEFAULT NULL COMMENT '温度',
  `status` TINYINT NOT NULL COMMENT '电池状态',
  `cabinet_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '所在换电柜',
  `report_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上报时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_battery_time` (`battery_id`, `report_at`),
  KEY `idx_report_time` (`report_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='电池状态历史表';

-- ----------------------------------------
-- 5. 用户表 (骑手)
-- ----------------------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `phone` VARCHAR(16) NOT NULL COMMENT '手机号',
  `nickname` VARCHAR(64) DEFAULT NULL COMMENT '昵称',
  `real_name` VARCHAR(64) DEFAULT NULL COMMENT '真实姓名',
  `id_card` VARCHAR(32) DEFAULT NULL COMMENT '身份证号',
  `avatar` VARCHAR(256) DEFAULT NULL COMMENT '头像',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-正常 2-禁用',
  `last_login_at` DATETIME DEFAULT NULL COMMENT '最后登录时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ----------------------------------------
-- 6. 换电订单表
-- ----------------------------------------
DROP TABLE IF EXISTS `order`;
CREATE TABLE `order` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `order_no` VARCHAR(64) NOT NULL COMMENT '订单号',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `cabinet_id` BIGINT UNSIGNED NOT NULL COMMENT '换电柜ID',
  `out_battery_id` BIGINT UNSIGNED NOT NULL COMMENT '取出电池ID',
  `in_battery_id` BIGINT UNSIGNED NOT NULL COMMENT '归还电池ID',
  `out_slot_id` BIGINT UNSIGNED NOT NULL COMMENT '取出槽位ID',
  `in_slot_id` BIGINT UNSIGNED NOT NULL COMMENT '归还槽位ID',
  `package_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '使用套餐ID',
  `amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT '订单金额',
  `discount_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT '优惠金额',
  `pay_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT '实付金额',
  `pay_type` TINYINT DEFAULT NULL COMMENT '支付方式: 1-钱包 2-套餐次数',
  `pay_status` TINYINT NOT NULL DEFAULT 1 COMMENT '支付状态: 1-待支付 2-已支付 3-已退款',
  `order_status` TINYINT NOT NULL DEFAULT 1 COMMENT '订单状态: 1-进行中 2-已完成 3-已取消',
  `out_battery_soc` TINYINT UNSIGNED DEFAULT NULL COMMENT '取出时电量',
  `in_battery_soc` TINYINT UNSIGNED DEFAULT NULL COMMENT '归还时电量',
  `start_time` DATETIME DEFAULT NULL COMMENT '开始时间(开柜)',
  `finish_time` DATETIME DEFAULT NULL COMMENT '完成时间(关柜)',
  `idempotent_key` VARCHAR(128) NOT NULL COMMENT '幂等键',
  `remark` VARCHAR(256) DEFAULT NULL COMMENT '备注',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  UNIQUE KEY `uk_idempotent_key` (`idempotent_key`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_cabinet_id` (`cabinet_id`),
  KEY `idx_status` (`order_status`, `pay_status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='换电订单表';

-- ----------------------------------------
-- 7. 套餐表
-- ----------------------------------------
DROP TABLE IF EXISTS `package`;
CREATE TABLE `package` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` VARCHAR(64) NOT NULL COMMENT '套餐名称',
  `type` TINYINT NOT NULL COMMENT '类型: 1-次数套餐 2-时长套餐',
  `total_times` INT UNSIGNED DEFAULT NULL COMMENT '总换电次数',
  `duration_days` INT UNSIGNED DEFAULT NULL COMMENT '有效天数',
  `price` DECIMAL(10, 2) NOT NULL COMMENT '套餐价格',
  `original_price` DECIMAL(10, 2) NOT NULL COMMENT '原价',
  `single_price` DECIMAL(10, 2) DEFAULT NULL COMMENT '单次换电价格(时长套餐)',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-上架 2-下架',
  `description` VARCHAR(512) DEFAULT NULL COMMENT '描述',
  `sort` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='套餐表';

-- ----------------------------------------
-- 8. 用户套餐表
-- ----------------------------------------
DROP TABLE IF EXISTS `user_package`;
CREATE TABLE `user_package` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `package_id` BIGINT UNSIGNED NOT NULL COMMENT '套餐ID',
  `package_name` VARCHAR(64) NOT NULL COMMENT '套餐名称快照',
  `package_type` TINYINT NOT NULL COMMENT '套餐类型',
  `total_times` INT UNSIGNED DEFAULT NULL COMMENT '总次数',
  `used_times` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '已用次数',
  `remaining_times` INT UNSIGNED DEFAULT NULL COMMENT '剩余次数',
  `start_time` DATETIME NOT NULL COMMENT '生效时间',
  `end_time` DATETIME NOT NULL COMMENT '到期时间',
  `order_no` VARCHAR(64) NOT NULL COMMENT '购买订单号',
  `pay_amount` DECIMAL(10, 2) NOT NULL COMMENT '购买金额',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-有效 2-已用完 3-已过期',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_status` (`user_id`, `status`),
  KEY `idx_end_time` (`end_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户套餐表';

-- ----------------------------------------
-- 9. 钱包表
-- ----------------------------------------
DROP TABLE IF EXISTS `wallet`;
CREATE TABLE `wallet` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `balance` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT '余额',
  `frozen_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT '冻结金额',
  `total_recharge` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT '累计充值',
  `total_consume` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT '累计消费',
  `version` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='钱包表';

-- ----------------------------------------
-- 10. 钱包流水表
-- ----------------------------------------
DROP TABLE IF EXISTS `wallet_transaction`;
CREATE TABLE `wallet_transaction` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `trans_no` VARCHAR(64) NOT NULL COMMENT '流水号',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `wallet_id` BIGINT UNSIGNED NOT NULL COMMENT '钱包ID',
  `type` TINYINT NOT NULL COMMENT '类型: 1-充值 2-消费 3-退款',
  `amount` DECIMAL(10, 2) NOT NULL COMMENT '变动金额',
  `balance_before` DECIMAL(10, 2) NOT NULL COMMENT '变动前余额',
  `balance_after` DECIMAL(10, 2) NOT NULL COMMENT '变动后余额',
  `related_order_no` VARCHAR(64) DEFAULT NULL COMMENT '关联订单号',
  `idempotent_key` VARCHAR(128) NOT NULL COMMENT '幂等键',
  `remark` VARCHAR(256) DEFAULT NULL COMMENT '备注',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_trans_no` (`trans_no`),
  UNIQUE KEY `uk_idempotent_key` (`idempotent_key`),
  KEY `idx_user_time` (`user_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='钱包流水表';

-- ----------------------------------------
-- 11. 调度任务表
-- ----------------------------------------
DROP TABLE IF EXISTS `dispatch_task`;
CREATE TABLE `dispatch_task` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `task_no` VARCHAR(64) NOT NULL COMMENT '任务编号',
  `type` TINYINT NOT NULL COMMENT '类型: 1-补电 2-换电 3-维修',
  `priority` TINYINT NOT NULL DEFAULT 2 COMMENT '优先级: 1-高 2-中 3-低',
  `from_cabinet_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '源换电柜',
  `to_cabinet_id` BIGINT UNSIGNED NOT NULL COMMENT '目标换电柜',
  `battery_count` TINYINT UNSIGNED NOT NULL COMMENT '需要电池数量',
  `battery_ids` VARCHAR(512) DEFAULT NULL COMMENT '具体电池ID列表(JSON)',
  `operator_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '运维人员ID',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-待分配 2-待执行 3-执行中 4-已完成 5-已取消',
  `gap_reason` VARCHAR(256) DEFAULT NULL COMMENT '缺口原因',
  `estimate_arrive_time` DATETIME DEFAULT NULL COMMENT '预计到达时间',
  `actual_start_time` DATETIME DEFAULT NULL COMMENT '实际开始时间',
  `actual_finish_time` DATETIME DEFAULT NULL COMMENT '实际完成时间',
  `remark` VARCHAR(256) DEFAULT NULL COMMENT '备注',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_task_no` (`task_no`),
  KEY `idx_to_cabinet` (`to_cabinet_id`),
  KEY `idx_status_priority` (`status`, `priority`),
  KEY `idx_operator` (`operator_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='调度任务表';

-- ----------------------------------------
-- 12. 告警表
-- ----------------------------------------
DROP TABLE IF EXISTS `alert`;
CREATE TABLE `alert` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `alert_no` VARCHAR(64) NOT NULL COMMENT '告警编号',
  `type` TINYINT NOT NULL COMMENT '告警类型: 1-电池异常 2-换电柜异常 3-电量不足 4-温度异常 5-其他',
  `level` TINYINT NOT NULL COMMENT '告警级别: 1-紧急 2-重要 3-一般',
  `cabinet_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联换电柜',
  `battery_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联电池',
  `slot_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联槽位',
  `title` VARCHAR(128) NOT NULL COMMENT '告警标题',
  `content` TEXT COMMENT '告警详情',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-未处理 2-处理中 3-已处理 4-已忽略',
  `handler_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '处理人ID',
  `handle_time` DATETIME DEFAULT NULL COMMENT '处理时间',
  `handle_result` VARCHAR(512) DEFAULT NULL COMMENT '处理结果',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_alert_no` (`alert_no`),
  KEY `idx_cabinet` (`cabinet_id`),
  KEY `idx_battery` (`battery_id`),
  KEY `idx_type_level` (`type`, `level`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='告警表';

-- ----------------------------------------
-- 13. 运维人员表
-- ----------------------------------------
DROP TABLE IF EXISTS `operator`;
CREATE TABLE `operator` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` VARCHAR(64) NOT NULL COMMENT '姓名',
  `phone` VARCHAR(16) NOT NULL COMMENT '手机号',
  `work_area` VARCHAR(128) DEFAULT NULL COMMENT '负责区域',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-在职 2-离职 3-休假',
  `current_longitude` DECIMAL(10, 7) DEFAULT NULL COMMENT '当前经度',
  `current_latitude` DECIMAL(10, 7) DEFAULT NULL COMMENT '当前纬度',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='运维人员表';

-- ----------------------------------------
-- 14. 幂等记录表 (用于分布式锁和幂等校验)
-- ----------------------------------------
DROP TABLE IF EXISTS `idempotent_record`;
CREATE TABLE `idempotent_record` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `idempotent_key` VARCHAR(128) NOT NULL COMMENT '幂等键',
  `biz_type` VARCHAR(32) NOT NULL COMMENT '业务类型',
  `biz_id` VARCHAR(64) DEFAULT NULL COMMENT '业务ID',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-处理中 2-成功 3-失败',
  `request_data` TEXT COMMENT '请求数据',
  `response_data` TEXT COMMENT '响应数据',
  `expire_at` DATETIME NOT NULL COMMENT '过期时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_idempotent_key` (`idempotent_key`),
  KEY `idx_expire_at` (`expire_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='幂等记录表';

-- ----------------------------------------
-- 15. 管理员表
-- ----------------------------------------
DROP TABLE IF EXISTS `admin`;
CREATE TABLE `admin` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `username` VARCHAR(64) NOT NULL COMMENT '用户名',
  `password` VARCHAR(128) NOT NULL COMMENT '密码(加密)',
  `real_name` VARCHAR(64) DEFAULT NULL COMMENT '真实姓名',
  `phone` VARCHAR(16) DEFAULT NULL COMMENT '手机号',
  `role` TINYINT NOT NULL DEFAULT 2 COMMENT '角色: 1-超级管理员 2-普通管理员',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-正常 2-禁用',
  `last_login_at` DATETIME DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip` VARCHAR(64) DEFAULT NULL COMMENT '最后登录IP',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员表';

SET FOREIGN_KEY_CHECKS = 1;

-- ========================================
-- 初始化数据
-- ========================================

-- 初始化管理员 (密码: 123456)
INSERT INTO `admin` (`username`, `password`, `real_name`, `role`) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '超级管理员', 1);

-- 初始化套餐
INSERT INTO `package` (`name`, `type`, `total_times`, `duration_days`, `price`, `original_price`, `single_price`, `description`, `sort`) VALUES
('月度无限套餐', 2, NULL, 30, 299.00, 399.00, 0.00, '30天内无限次换电，每天最多3次', 1),
('10次套餐', 1, 10, 90, 199.00, 249.00, 19.90, '10次换电，有效期90天', 2),
('30次套餐', 1, 30, 180, 499.00, 699.00, 16.63, '30次换电，有效期180天', 3),
('单次体验', 2, NULL, 1, 9.90, 15.00, 9.90, '单次换电，按次计费', 4);

-- 初始化换电柜数据
INSERT INTO `cabinet` (`cabinet_no`, `name`, `address`, `longitude`, `latitude`, `total_slots`, `status`) VALUES
('CAB001', '中关村科技园换电站', '北京市海淀区中关村大街1号', 116.306905, 39.989452, 12, 1),
('CAB002', '望京SOHO换电站', '北京市朝阳区望京街道望京SOHO', 116.461934, 39.991429, 10, 1),
('CAB003', '国贸中心换电站', '北京市朝阳区建国门外大街1号', 116.460887, 39.908823, 15, 1),
('CAB004', '西二旗地铁站换电站', '北京市海淀区西二旗地铁站B口', 116.297588, 40.050745, 10, 1),
('CAB005', '五道口换电站', '北京市海淀区成府路28号', 116.341065, 39.984687, 8, 1),
('CAB006', '上地信息产业园换电站', '北京市海淀区上地十街1号', 116.313792, 40.036999, 12, 1);

-- 初始化槽位数据
-- CAB001 (id=1) 12个槽位
INSERT INTO cabinet_slot (cabinet_id, slot_no, status) VALUES
(1,1,1),(1,2,1),(1,3,1),(1,4,1),(1,5,1),(1,6,1),(1,7,1),(1,8,1),(1,9,1),(1,10,1),(1,11,1),(1,12,1);
-- CAB002 (id=2) 10个槽位
INSERT INTO cabinet_slot (cabinet_id, slot_no, status) VALUES
(2,1,1),(2,2,1),(2,3,1),(2,4,1),(2,5,1),(2,6,1),(2,7,1),(2,8,1),(2,9,1),(2,10,1);
-- CAB003 (id=3) 15个槽位
INSERT INTO cabinet_slot (cabinet_id, slot_no, status) VALUES
(3,1,1),(3,2,1),(3,3,1),(3,4,1),(3,5,1),(3,6,1),(3,7,1),(3,8,1),(3,9,1),(3,10,1),(3,11,1),(3,12,1),(3,13,1),(3,14,1),(3,15,1);
-- CAB004 (id=4) 10个槽位
INSERT INTO cabinet_slot (cabinet_id, slot_no, status) VALUES
(4,1,1),(4,2,1),(4,3,1),(4,4,1),(4,5,1),(4,6,1),(4,7,1),(4,8,1),(4,9,1),(4,10,1);
-- CAB005 (id=5) 8个槽位
INSERT INTO cabinet_slot (cabinet_id, slot_no, status) VALUES
(5,1,1),(5,2,1),(5,3,1),(5,4,1),(5,5,1),(5,6,1),(5,7,1),(5,8,1);
-- CAB006 (id=6) 12个槽位
INSERT INTO cabinet_slot (cabinet_id, slot_no, status) VALUES
(6,1,1),(6,2,1),(6,3,1),(6,4,1),(6,5,1),(6,6,1),(6,7,1),(6,8,1),(6,9,1),(6,10,1),(6,11,1),(6,12,1);

-- 初始化电池数据
INSERT INTO `battery` (`battery_no`, `model`, `capacity`, `voltage`, `current_soc`, `health_status`, `cycle_count`, `status`) VALUES
('BAT001', 'LG-E60', 60, 48.00, 95, 98, 120, 1),
('BAT002', 'LG-E60', 60, 48.00, 88, 96, 156, 1),
('BAT003', 'LG-E60', 60, 48.00, 100, 99, 89, 1),
('BAT004', 'LG-E60', 60, 48.00, 76, 92, 210, 1),
('BAT005', 'LG-E60', 60, 48.00, 92, 97, 145, 1),
('BAT006', 'CATL-50', 50, 60.00, 98, 99, 78, 1),
('BAT007', 'CATL-50', 50, 60.00, 85, 94, 189, 1),
('BAT008', 'CATL-50', 50, 60.00, 100, 100, 45, 1),
('BAT009', 'CATL-50', 50, 60.00, 45, 88, 320, 1),
('BAT010', 'CATL-50', 50, 60.00, 91, 96, 167, 1),
('BAT011', 'LG-E60', 60, 48.00, 99, 98, 98, 1),
('BAT012', 'LG-E60', 60, 48.00, 87, 93, 201, 1),
('BAT013', 'LG-E60', 60, 48.00, 94, 97, 134, 1),
('BAT014', 'LG-E60', 60, 48.00, 96, 95, 178, 1),
('BAT015', 'CATL-50', 50, 60.00, 89, 91, 245, 1),
('BAT016', 'CATL-50', 50, 60.00, 97, 99, 67, 1),
('BAT017', 'CATL-50', 50, 60.00, 93, 96, 156, 1),
('BAT018', 'LG-E60', 60, 48.00, 90, 94, 189, 1),
('BAT019', 'LG-E60', 60, 48.00, 25, 85, 410, 4),
('BAT020', 'CATL-50', 50, 60.00, 15, 82, 489, 4);

-- 将电池分配到槽位
UPDATE battery b
JOIN (
  SELECT 
    @row := @row + 1 as rn,
    id as slot_id,
    cabinet_id
  FROM cabinet_slot, (SELECT @row := 0) r
  WHERE status = 1
  ORDER BY cabinet_id, slot_no
) s ON b.id = s.rn
SET b.cabinet_id = s.cabinet_id, b.slot_id = s.slot_id, b.status = 1
WHERE b.id <= 18;

-- 更新槽位状态
UPDATE cabinet_slot s
JOIN battery b ON s.id = b.slot_id
SET s.battery_id = b.id, s.status = 2;

-- 初始化用户
INSERT INTO `user` (`phone`, `nickname`, `real_name`, `id_card`) VALUES
('13800138001', '风骑士', '张三', '110101199001011234'),
('13800138002', '闪电侠', '李四', '110101199002022345'),
('13800138003', '骑行者', '王五', '110101199003033456'),
('13800138004', '外卖小哥', '赵六', '110101199004044567'),
('13800138005', '追风少年', '钱七', '110101199005055678');

-- 初始化钱包
INSERT INTO `wallet` (`user_id`, `balance`, `total_recharge`) VALUES
(1, 299.00, 299.00),
(2, 150.50, 150.50),
(3, 88.00, 88.00),
(4, 520.00, 520.00),
(5, 66.00, 66.00);

-- 初始化用户套餐
INSERT INTO `user_package` (`user_id`, `package_id`, `package_name`, `package_type`, `total_times`, `remaining_times`, `start_time`, `end_time`, `order_no`, `pay_amount`) VALUES
(1, 1, '月度无限套餐', 2, NULL, NULL, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'ORD202401010001', 299.00),
(2, 2, '10次套餐', 1, 10, 7, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_ADD(NOW(), INTERVAL 80 DAY), 'ORD202401020001', 199.00),
(4, 3, '30次套餐', 1, 30, 25, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 175 DAY), 'ORD202401040001', 499.00);

-- 初始化运维人员
INSERT INTO `operator` (`name`, `phone`, `work_area`, `status`, `current_longitude`, `current_latitude`) VALUES
('张运维', '13900139001', '海淀区', 1, 116.300000, 39.980000),
('李运维', '13900139002', '朝阳区', 1, 116.450000, 39.950000),
('王运维', '13900139003', '海淀区-朝阳区', 1, 116.400000, 39.970000);

-- 初始化告警
INSERT INTO `alert` (`alert_no`, `type`, `level`, `battery_id`, `title`, `content`, `status`) VALUES
('ALT001', 1, 2, 19, '电池健康度低', '电池BAT019健康度85%，循环次数410次，建议下线处理', 1),
('ALT002', 1, 2, 20, '电池健康度低', '电池BAT020健康度82%，循环次数489次，建议下线处理', 1),
('ALT003', 3, 1, NULL, '换电柜电量缺口', '换电柜CAB004满电电池不足3块，请及时调度', 2);

-- 初始化调度任务
INSERT INTO `dispatch_task` (`task_no`, `type`, `priority`, `to_cabinet_id`, `battery_count`, `status`, `gap_reason`) VALUES
('TASK001', 1, 1, 4, 4, 2, '满电电池不足，需补充4块满电电池'),
('TASK002', 1, 2, 5, 2, 1, '预计今日晚高峰电量不足');

-- 初始化模拟订单
INSERT INTO `order` (`order_no`, `user_id`, `cabinet_id`, `out_battery_id`, `in_battery_id`, `out_slot_id`, `in_slot_id`, `package_id`, `amount`, `discount_amount`, `pay_amount`, `pay_type`, `pay_status`, `order_status`, `out_battery_soc`, `in_battery_soc`, `start_time`, `finish_time`, `idempotent_key`) VALUES
('ORD202401200001', 1, 1, 1, 2, 1, 2, 1, 9.90, 9.90, 0.00, 2, 2, 2, 95, 35, DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 118 MINUTE), 'IDEM202401200001'),
('ORD202401200002', 2, 2, 6, 7, 13, 14, 2, 9.90, 0.00, 9.90, 2, 2, 2, 98, 42, DATE_SUB(NOW(), INTERVAL 4 HOUR), DATE_SUB(NOW(), INTERVAL 238 MINUTE), 'IDEM202401200002'),
('ORD202401200003', 4, 3, 8, 9, 23, 24, 3, 9.90, 0.00, 9.90, 2, 2, 2, 100, 28, DATE_SUB(NOW(), INTERVAL 6 HOUR), DATE_SUB(NOW(), INTERVAL 358 MINUTE), 'IDEM202401200003');
