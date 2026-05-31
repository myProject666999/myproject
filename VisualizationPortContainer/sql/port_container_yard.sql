-- 港口集装箱堆场调度可视化系统数据库脚本
-- 数据库：port_container_yard
-- 说明：支持堆场建模、箱位管理、集装箱进出、堆位分配、吊机调度、翻箱率分析

-- 创建数据库
CREATE DATABASE IF NOT EXISTS port_container_yard DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE port_container_yard;

-- ========================================
-- 1. 堆场表 (yard) - 堆场基础信息
-- ========================================
DROP TABLE IF EXISTS `yard`;
CREATE TABLE `yard` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '堆场ID',
  `yard_code` VARCHAR(32) NOT NULL COMMENT '堆场编号',
  `yard_name` VARCHAR(64) NOT NULL COMMENT '堆场名称',
  `area` DECIMAL(10,2) DEFAULT NULL COMMENT '堆场面积(平方米)',
  `total_slots` INT NOT NULL DEFAULT 0 COMMENT '总箱位数',
  `occupied_slots` INT NOT NULL DEFAULT 0 COMMENT '已占用箱位数',
  `max_tiers` INT NOT NULL DEFAULT 5 COMMENT '最大堆垛层数',
  `rows` INT NOT NULL DEFAULT 10 COMMENT '行数',
  `bays` INT NOT NULL DEFAULT 20 COMMENT '列数(贝位)',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1-正常 0-停用',
  `longitude` DECIMAL(12,8) DEFAULT NULL COMMENT '经度',
  `latitude` DECIMAL(12,8) DEFAULT NULL COMMENT '纬度',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_yard_code` (`yard_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='堆场基础信息表';

-- ========================================
-- 2. 箱位表 (yard_slot) - 每个具体箱位
-- ========================================
DROP TABLE IF EXISTS `yard_slot`;
CREATE TABLE `yard_slot` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '箱位ID',
  `yard_id` BIGINT NOT NULL COMMENT '堆场ID',
  `slot_code` VARCHAR(64) NOT NULL COMMENT '箱位编码(如：Y1-A-01-03-02)',
  `row_no` INT NOT NULL COMMENT '行号',
  `bay_no` INT NOT NULL COMMENT '贝号(列号)',
  `tier_no` INT NOT NULL COMMENT '层号',
  `area_code` VARCHAR(32) DEFAULT NULL COMMENT '区域编码',
  `size_type` VARCHAR(8) NOT NULL DEFAULT '20GP' COMMENT '适用箱型：20GP/40GP/40HQ',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-空闲 1-已占用 2-锁定 3-预排',
  `container_id` BIGINT DEFAULT NULL COMMENT '当前集装箱ID',
  `weight_level` TINYINT DEFAULT 0 COMMENT '承重等级：1-轻 2-中 3-重',
  `is_dangerous` TINYINT NOT NULL DEFAULT 0 COMMENT '是否危险品箱位：0-否 1-是',
  `is_refrigerated` TINYINT NOT NULL DEFAULT 0 COMMENT '是否冷藏箱位：0-否 1-是',
  `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_slot_code` (`slot_code`),
  KEY `idx_yard_id` (`yard_id`),
  KEY `idx_status` (`status`),
  KEY `idx_container_id` (`container_id`),
  KEY `idx_position` (`yard_id`,`row_no`,`bay_no`,`tier_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='箱位表';

-- ========================================
-- 3. 集装箱表 (container)
-- ========================================
DROP TABLE IF EXISTS `container`;
CREATE TABLE `container` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `container_no` VARCHAR(32) NOT NULL COMMENT '箱号',
  `iso_code` VARCHAR(16) NOT NULL DEFAULT '20GP' COMMENT 'ISO箱型代码：20GP/40GP/40HQ/20RF',
  `size_type` VARCHAR(8) NOT NULL DEFAULT '20GP' COMMENT '尺寸类型：20/40/45',
  `operator` VARCHAR(32) DEFAULT NULL COMMENT '箱属公司',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1-在场 2-出场 3-中转',
  `gross_weight` DECIMAL(8,2) DEFAULT NULL COMMENT '总重量(吨)',
  `cargo_type` VARCHAR(32) DEFAULT NULL COMMENT '货物类型',
  `is_dangerous` TINYINT NOT NULL DEFAULT 0 COMMENT '是否危险品：0-否 1-是',
  `is_refrigerated` TINYINT NOT NULL DEFAULT 0 COMMENT '是否冷藏：0-否 1-是',
  `temperature` DECIMAL(5,1) DEFAULT NULL COMMENT '冷藏温度要求',
  `dangerous_class` VARCHAR(16) DEFAULT NULL COMMENT '危险品等级',
  `un_code` VARCHAR(16) DEFAULT NULL COMMENT 'UN编号',
  `current_slot_id` BIGINT DEFAULT NULL COMMENT '当前箱位ID',
  `in_time` DATETIME DEFAULT NULL COMMENT '进场时间',
  `out_time` DATETIME DEFAULT NULL COMMENT '预计出场时间',
  `actual_out_time` DATETIME DEFAULT NULL COMMENT '实际出场时间',
  `truck_no` VARCHAR(16) DEFAULT NULL COMMENT '进出场车牌号',
  `voyage_in` VARCHAR(32) DEFAULT NULL COMMENT '进口航次',
  `voyage_out` VARCHAR(32) DEFAULT NULL COMMENT '出口航次',
  `bl_no` VARCHAR(64) DEFAULT NULL COMMENT '提单号',
  `shipper` VARCHAR(64) DEFAULT NULL COMMENT '发货人',
  `consignee` VARCHAR(64) DEFAULT NULL COMMENT '收货人',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `stack_count` INT NOT NULL DEFAULT 0 COMMENT '翻箱次数',
  `stack_score` INT DEFAULT 0 COMMENT '堆放评分(越高越好)',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_container_no` (`container_no`),
  KEY `idx_status` (`status`),
  KEY `idx_current_slot_id` (`current_slot_id`),
  KEY `idx_in_time` (`in_time`),
  KEY `idx_out_time` (`out_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='集装箱信息表';

-- ========================================
-- 4. 吊机设备表 (crane)
-- ========================================
DROP TABLE IF EXISTS `crane`;
CREATE TABLE `crane` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '吊机ID',
  `crane_code` VARCHAR(32) NOT NULL COMMENT '吊机编号',
  `crane_name` VARCHAR(64) DEFAULT NULL COMMENT '吊机名称',
  `crane_type` TINYINT NOT NULL COMMENT '类型：1-龙门吊 2-桥吊 3-正面吊 4-堆高机',
  `yard_id` BIGINT DEFAULT NULL COMMENT '所属堆场ID',
  `max_load` DECIMAL(6,2) NOT NULL DEFAULT 45.00 COMMENT '最大载重(吨)',
  `current_load` DECIMAL(6,2) DEFAULT 0 COMMENT '当前载重',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-空闲 1-作业中 2-故障 3-维护',
  `work_efficiency` INT DEFAULT 30 COMMENT '作业效率(箱/小时)',
  `current_row` INT DEFAULT NULL COMMENT '当前所在行',
  `current_bay` INT DEFAULT NULL COMMENT '当前所在贝',
  `operator_id` BIGINT DEFAULT NULL COMMENT '当前操作员ID',
  `operator_name` VARCHAR(32) DEFAULT NULL COMMENT '当前操作员姓名',
  `total_operations` INT NOT NULL DEFAULT 0 COMMENT '累计作业量',
  `today_operations` INT NOT NULL DEFAULT 0 COMMENT '今日作业量',
  `last_maintenance_time` DATETIME DEFAULT NULL COMMENT '上次维护时间',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_crane_code` (`crane_code`),
  KEY `idx_yard_id` (`yard_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='吊机设备表';

-- ========================================
-- 5. 作业任务表 (task) - 吊机作业任务
-- ========================================
DROP TABLE IF EXISTS `task`;
CREATE TABLE `task` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '任务ID',
  `task_no` VARCHAR(32) NOT NULL COMMENT '任务编号',
  `task_type` TINYINT NOT NULL COMMENT '任务类型：1-进场落箱 2-出场提箱 3-移箱 4-翻箱',
  `priority` TINYINT NOT NULL DEFAULT 2 COMMENT '优先级：1-高 2-中 3-低',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-待分配 1-待执行 2-执行中 3-已完成 4-已取消',
  `crane_id` BIGINT DEFAULT NULL COMMENT '分配的吊机ID',
  `container_id` BIGINT NOT NULL COMMENT '集装箱ID',
  `container_no` VARCHAR(32) NOT NULL COMMENT '箱号',
  `from_slot_id` BIGINT DEFAULT NULL COMMENT '起始箱位ID',
  `from_slot_code` VARCHAR(64) DEFAULT NULL COMMENT '起始箱位编码',
  `to_slot_id` BIGINT DEFAULT NULL COMMENT '目标箱位ID',
  `to_slot_code` VARCHAR(64) DEFAULT NULL COMMENT '目标箱位编码',
  `planned_start_time` DATETIME DEFAULT NULL COMMENT '计划开始时间',
  `planned_end_time` DATETIME DEFAULT NULL COMMENT '计划结束时间',
  `actual_start_time` DATETIME DEFAULT NULL COMMENT '实际开始时间',
  `actual_end_time` DATETIME DEFAULT NULL COMMENT '实际结束时间',
  `estimated_duration` INT DEFAULT 5 COMMENT '预计时长(分钟)',
  `waiting_time` INT DEFAULT 0 COMMENT '等待时间(分钟)',
  `is_rehandle` TINYINT NOT NULL DEFAULT 0 COMMENT '是否翻箱作业：0-否 1-是',
  `rehandle_reason` VARCHAR(255) DEFAULT NULL COMMENT '翻箱原因',
  `operator_id` BIGINT DEFAULT NULL COMMENT '操作员ID',
  `operator_name` VARCHAR(32) DEFAULT NULL COMMENT '操作员姓名',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_task_no` (`task_no`),
  KEY `idx_status` (`status`),
  KEY `idx_crane_id` (`crane_id`),
  KEY `idx_container_id` (`container_id`),
  KEY `idx_planned_start` (`planned_start_time`),
  KEY `idx_type_status` (`task_type`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='作业任务表';

-- ========================================
-- 6. 箱位分配记录表 (allocation_record)
-- ========================================
DROP TABLE IF EXISTS `allocation_record`;
CREATE TABLE `allocation_record` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `container_id` BIGINT NOT NULL COMMENT '集装箱ID',
  `container_no` VARCHAR(32) NOT NULL COMMENT '箱号',
  `slot_id` BIGINT NOT NULL COMMENT '分配的箱位ID',
  `slot_code` VARCHAR(64) NOT NULL COMMENT '箱位编码',
  `allocation_strategy` VARCHAR(32) NOT NULL COMMENT '分配策略：first_fit/nearest_exit/weight_based/score_based',
  `allocation_score` INT DEFAULT 0 COMMENT '分配评分',
  `estimated_rehandles` INT DEFAULT 0 COMMENT '预计翻箱次数',
  `operator_id` BIGINT DEFAULT NULL COMMENT '操作员ID',
  `operator_name` VARCHAR(32) DEFAULT NULL COMMENT '操作员姓名',
  `auto_allocated` TINYINT NOT NULL DEFAULT 1 COMMENT '是否自动分配：0-人工 1-自动',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_container_id` (`container_id`),
  KEY `idx_slot_id` (`slot_id`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='箱位分配记录表';

-- ========================================
-- 7. 操作日志表 (operation_log) - 操作留痕
-- ========================================
DROP TABLE IF EXISTS `operation_log`;
CREATE TABLE `operation_log` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `module` VARCHAR(32) NOT NULL COMMENT '模块：yard/container/task/crane/allocation',
  `operation_type` VARCHAR(32) NOT NULL COMMENT '操作类型：create/update/delete/assign/execute',
  `business_id` BIGINT NOT NULL COMMENT '业务主键ID',
  `business_no` VARCHAR(64) DEFAULT NULL COMMENT '业务编号',
  `before_content` TEXT COMMENT '变更前内容(JSON)',
  `after_content` TEXT COMMENT '变更后内容(JSON)',
  `operator_id` BIGINT DEFAULT NULL COMMENT '操作员ID',
  `operator_name` VARCHAR(32) DEFAULT NULL COMMENT '操作员姓名',
  `ip_address` VARCHAR(32) DEFAULT NULL COMMENT 'IP地址',
  `user_agent` VARCHAR(500) DEFAULT NULL COMMENT '客户端信息',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  PRIMARY KEY (`id`),
  KEY `idx_module` (`module`),
  KEY `idx_business_id` (`business_id`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_operator` (`operator_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- ========================================
-- 8. 统计分析表 (statistics_record) - 预统计表
-- ========================================
DROP TABLE IF EXISTS `statistics_record`;
CREATE TABLE `statistics_record` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `stat_date` DATE NOT NULL COMMENT '统计日期',
  `stat_type` VARCHAR(32) NOT NULL COMMENT '统计类型：daily/weekly/monthly',
  `yard_id` BIGINT DEFAULT NULL COMMENT '堆场ID',
  `total_containers_in` INT NOT NULL DEFAULT 0 COMMENT '进场箱量',
  `total_containers_out` INT NOT NULL DEFAULT 0 COMMENT '出场箱量',
  `total_rehandles` INT NOT NULL DEFAULT 0 COMMENT '翻箱次数',
  `rehandle_rate` DECIMAL(8,4) NOT NULL DEFAULT 0 COMMENT '翻箱率',
  `avg_allocation_score` DECIMAL(8,2) DEFAULT 0 COMMENT '平均分配评分',
  `crane_utilization_rate` DECIMAL(5,2) DEFAULT 0 COMMENT '吊机利用率',
  `avg_task_wait_time` DECIMAL(8,2) DEFAULT 0 COMMENT '平均任务等待时间',
  `peak_hour_in` INT DEFAULT 0 COMMENT '高峰小时进场量',
  `peak_hour_out` INT DEFAULT 0 COMMENT '高峰小时出场量',
  `slot_utilization_rate` DECIMAL(5,2) DEFAULT 0 COMMENT '箱位利用率',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_date_type_yard` (`stat_date`,`stat_type`,`yard_id`),
  KEY `idx_stat_date` (`stat_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='统计分析表';

-- ========================================
-- 9. 用户表 (sys_user)
-- ========================================
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(32) NOT NULL COMMENT '用户名',
  `password` VARCHAR(64) NOT NULL COMMENT '密码(加密)',
  `real_name` VARCHAR(32) DEFAULT NULL COMMENT '真实姓名',
  `role` TINYINT NOT NULL DEFAULT 3 COMMENT '角色：1-管理员 2-调度员 3-操作员 4-查看员',
  `phone` VARCHAR(16) DEFAULT NULL COMMENT '手机号',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1-正常 0-禁用',
  `last_login_time` DATETIME DEFAULT NULL COMMENT '最后登录时间',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';

-- ========================================
-- 初始化数据
-- ========================================

-- 初始化用户 (密码：123456，MD5加密后)
INSERT INTO `sys_user` (`username`, `password`, `real_name`, `role`, `status`) VALUES
('admin', 'e10adc3949ba59abbe56e057f20f883e', '系统管理员', 1, 1),
('dispatcher', 'e10adc3949ba59abbe56e057f20f883e', '调度员', 2, 1),
('operator1', 'e10adc3949ba59abbe56e057f20f883e', '操作员张三', 3, 1),
('operator2', 'e10adc3949ba59abbe56e057f20f883e', '操作员李四', 3, 1);

-- 初始化堆场数据
INSERT INTO `yard` (`yard_code`, `yard_name`, `area`, `total_slots`, `max_tiers`, `rows`, `bays`, `status`, `remark`) VALUES
('Y001', 'A区堆场', 5000.00, 0, 5, 8, 24, 1, '主要堆放普通干货箱'),
('Y002', 'B区堆场', 4000.00, 0, 5, 6, 20, 1, '主要堆放危险品和冷藏箱'),
('Y003', 'C区堆场', 6000.00, 0, 6, 10, 30, 1, '重箱堆放区');

-- 初始化箱位数据 (Y001堆场：8行 x 24贝 x 5层 = 960个箱位)
-- 动态生成箱位数据，使用存储过程
DROP PROCEDURE IF EXISTS `generate_slots`;
DELIMITER //
CREATE PROCEDURE `generate_slots`(IN p_yard_id BIGINT, IN p_yard_code VARCHAR(32), IN p_rows INT, IN p_bays INT, IN p_tiers INT)
BEGIN
  DECLARE r INT DEFAULT 1;
  DECLARE b INT DEFAULT 1;
  DECLARE t INT DEFAULT 1;
  DECLARE slot_code VARCHAR(64);
  DECLARE area_code VARCHAR(32);
  DECLARE size_type VARCHAR(8);
  DECLARE is_dangerous TINYINT DEFAULT 0;
  DECLARE is_refrigerated TINYINT DEFAULT 0;
  DECLARE weight_level TINYINT DEFAULT 2;
  
  WHILE r <= p_rows DO
    WHILE b <= p_bays DO
      WHILE t <= p_tiers DO
        SET slot_code = CONCAT(p_yard_code, '-', CHAR(64 + r), '-', LPAD(b, 2, '0'), '-', LPAD(t, 2, '0'));
        SET area_code = CONCAT(p_yard_code, '-', CHAR(64 + r));
        
        -- 根据堆场不同设置不同属性
        IF p_yard_code = 'Y002' THEN
          IF b <= 5 THEN
            SET is_dangerous = 1;
            SET is_refrigerated = 0;
          ELSEIF b >= 15 THEN
            SET is_dangerous = 0;
            SET is_refrigerated = 1;
          ELSE
            SET is_dangerous = 0;
            SET is_refrigerated = 0;
          END IF;
        END IF;
        
        -- 根据层数设置承重等级(底层承重高)
        IF t <= 2 THEN
          SET weight_level = 3;
        ELSEIF t <= 4 THEN
          SET weight_level = 2;
        ELSE
          SET weight_level = 1;
        END IF;
        
        -- 根据位置设置适用箱型
        IF b % 2 = 0 THEN
          SET size_type = '40GP';
        ELSE
          SET size_type = '20GP';
        END IF;
        
        INSERT INTO `yard_slot` (`yard_id`, `slot_code`, `row_no`, `bay_no`, `tier_no`, `area_code`, `size_type`, `status`, `weight_level`, `is_dangerous`, `is_refrigerated`)
        VALUES (p_yard_id, slot_code, r, b, t, area_code, size_type, 0, weight_level, is_dangerous, is_refrigerated);
        
        SET t = t + 1;
      END WHILE;
      SET t = 1;
      SET b = b + 1;
    END WHILE;
    SET b = 1;
    SET r = r + 1;
  END WHILE;
  
  -- 更新堆场总箱位数
  UPDATE `yard` SET `total_slots` = p_rows * p_bays * p_tiers WHERE `id` = p_yard_id;
END //
DELIMITER ;

-- 生成三个堆场的箱位数据
CALL generate_slots(1, 'Y001', 8, 24, 5);
CALL generate_slots(2, 'Y002', 6, 20, 5);
CALL generate_slots(3, 'Y003', 10, 30, 6);

DROP PROCEDURE IF EXISTS `generate_slots`;

-- 初始化吊机数据
INSERT INTO `crane` (`crane_code`, `crane_name`, `crane_type`, `yard_id`, `max_load`, `work_efficiency`, `status`, `current_row`, `current_bay`) VALUES
('CR001', '龙门吊1号', 1, 1, 45.00, 28, 0, 1, 1),
('CR002', '龙门吊2号', 1, 1, 45.00, 30, 0, 4, 12),
('CR003', '龙门吊3号', 1, 2, 45.00, 25, 0, 2, 8),
('CR004', '龙门吊4号', 1, 3, 50.00, 32, 0, 5, 15),
('CR005', '正面吊1号', 3, 1, 40.00, 20, 0, NULL, NULL),
('CR006', '堆高机1号', 4, 2, 10.00, 15, 0, NULL, NULL);

-- 初始化测试集装箱数据
INSERT INTO `container` (`container_no`, `iso_code`, `size_type`, `operator`, `status`, `gross_weight`, `cargo_type`, `is_dangerous`, `is_refrigerated`, `in_time`, `out_time`, `truck_no`, `voyage_in`, `bl_no`, `shipper`, `consignee`) VALUES
('MSKU1234567', '20GP', '20', 'MAERSK', 1, 18.50, '电子产品', 0, 0, '2026-05-28 08:30:00', '2026-06-05 12:00:00', '沪A12345', 'MA001E', 'BL20260528001', '上海电子科技', '美国ABC公司'),
('MSKU7654321', '40HQ', '40', 'MAERSK', 1, 25.00, '服装', 0, 0, '2026-05-28 09:15:00', '2026-06-08 10:00:00', '沪A67890', 'MA001E', 'BL20260528002', '浙江服装厂', '欧洲DEF公司'),
('COS1987654', '20GP', '20', 'COSCO', 1, 22.00, '机械零件', 0, 0, '2026-05-28 10:00:00', '2026-06-10 08:00:00', '沪B11111', 'CS002W', 'BL20260528003', '江苏机械厂', '日本GHI公司'),
('COS4567890', '40GP', '40', 'COSCO', 1, 15.00, '家具', 0, 0, '2026-05-28 14:30:00', '2026-06-03 14:00:00', '沪B22222', 'CS003E', 'BL20260528004', '广东家具厂', '澳大利亚JKL公司'),
('MSKU1112223', '20RF', '20', 'MAERSK', 1, 20.00, '海鲜', 0, 1, '2026-05-29 06:00:00', '2026-06-01 06:00:00', '沪C33333', 'MA004W', 'BL20260529001', '舟山渔业', '韩国MNO公司'),
('COS3334445', '20GP', '20', 'COSCO', 1, 12.50, '化工品', 1, 0, '2026-05-29 08:00:00', '2026-06-15 10:00:00', '沪D44444', 'CS005E', 'BL20260529002', '上海化工', '新加坡PQR公司'),
('MSKU5556667', '40HQ', '40', 'MAERSK', 1, 28.00, '建材', 0, 0, '2026-05-29 10:30:00', '2026-06-20 12:00:00', '沪E55555', 'MA006E', 'BL20260529003', '安徽建材厂', '巴西STU公司'),
('COS7778889', '20GP', '20', 'COSCO', 1, 16.80, '食品', 0, 0, '2026-05-29 13:45:00', '2026-06-07 09:00:00', '沪F66666', 'CS007W', 'BL20260529004', '山东食品厂', '泰国VWX公司'),
('MSKU9990001', '40GP', '40', 'MAERSK', 1, 24.00, '汽车配件', 0, 0, '2026-05-30 07:30:00', '2026-06-12 14:00:00', '沪G77777', 'MA008E', 'BL20260530001', '吉林汽车厂', '墨西哥YZA公司'),
('COS2223334', '20GP', '20', 'COSCO', 1, 8.50, '纺织品', 0, 0, '2026-05-30 09:00:00', '2026-06-09 11:00:00', '沪H88888', 'CS009W', 'BL20260530002', '新疆纺织厂', '印度BCD公司');

-- 初始化一些模拟的历史统计数据
INSERT INTO `statistics_record` (`stat_date`, `stat_type`, `yard_id`, `total_containers_in`, `total_containers_out`, `total_rehandles`, `rehandle_rate`, `avg_allocation_score`, `crane_utilization_rate`, `avg_task_wait_time`, `slot_utilization_rate`) VALUES
('2026-05-27', 'daily', 1, 45, 38, 5, 0.0641, 85.5, 72.5, 8.5, 68.2),
('2026-05-27', 'daily', 2, 28, 25, 3, 0.0566, 82.3, 68.0, 7.2, 55.8),
('2026-05-27', 'daily', 3, 52, 48, 6, 0.0577, 87.2, 75.3, 9.1, 72.5),
('2026-05-28', 'daily', 1, 52, 45, 6, 0.0606, 86.8, 74.2, 7.8, 70.5),
('2026-05-28', 'daily', 2, 35, 30, 4, 0.0606, 84.1, 70.5, 8.0, 58.2),
('2026-05-28', 'daily', 3, 58, 50, 7, 0.0625, 88.5, 78.0, 8.5, 74.8),
('2026-05-29', 'daily', 1, 48, 42, 5, 0.0532, 87.5, 73.0, 8.2, 72.0),
('2026-05-29', 'daily', 2, 30, 28, 3, 0.0500, 85.0, 69.5, 7.5, 59.5),
('2026-05-29', 'daily', 3, 55, 52, 6, 0.0522, 89.0, 76.8, 8.8, 75.2);

-- 初始化一些作业任务
INSERT INTO `task` (`task_no`, `task_type`, `priority`, `status`, `container_id`, `container_no`, `is_rehandle`, `planned_start_time`, `estimated_duration`, `remark`) VALUES
('TK20260530001', 1, 2, 0, 1, 'MSKU1234567', 0, '2026-05-30 10:00:00', 5, '进场落箱'),
('TK20260530002', 1, 2, 0, 2, 'MSKU7654321', 0, '2026-05-30 10:15:00', 8, '进场落箱(40尺)'),
('TK20260530003', 1, 1, 0, 5, 'MSKU1112223', 0, '2026-05-30 09:30:00', 5, '冷藏箱，优先处理');
