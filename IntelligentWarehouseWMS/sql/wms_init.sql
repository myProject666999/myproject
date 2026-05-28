CREATE DATABASE IF NOT EXISTS wms_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE wms_db;

CREATE TABLE `warehouse` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '仓库ID',
  `warehouse_code` varchar(32) NOT NULL COMMENT '仓库编码',
  `warehouse_name` varchar(64) NOT NULL COMMENT '仓库名称',
  `address` varchar(255) DEFAULT NULL COMMENT '仓库地址',
  `manager` varchar(32) DEFAULT NULL COMMENT '负责人',
  `phone` varchar(20) DEFAULT NULL COMMENT '联系电话',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_warehouse_code` (`warehouse_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='仓库表';

CREATE TABLE `shelf` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '货架ID',
  `warehouse_id` bigint NOT NULL COMMENT '仓库ID',
  `shelf_code` varchar(32) NOT NULL COMMENT '货架编码',
  `shelf_name` varchar(64) DEFAULT NULL COMMENT '货架名称',
  `rows` int NOT NULL DEFAULT 5 COMMENT '行数',
  `columns` int NOT NULL DEFAULT 5 COMMENT '列数',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_shelf_code` (`shelf_code`),
  KEY `idx_warehouse_id` (`warehouse_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='货架表';

CREATE TABLE `location` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '库位ID',
  `warehouse_id` bigint NOT NULL COMMENT '仓库ID',
  `shelf_id` bigint NOT NULL COMMENT '货架ID',
  `location_code` varchar(32) NOT NULL COMMENT '库位编码',
  `row_no` int NOT NULL COMMENT '行号',
  `col_no` int NOT NULL COMMENT '列号',
  `capacity` decimal(10,2) NOT NULL DEFAULT 100.00 COMMENT '容量',
  `used_capacity` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT '已用容量',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用, 1-空闲, 2-占用, 3-部分占用',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_location_code` (`location_code`),
  KEY `idx_warehouse_id` (`warehouse_id`),
  KEY `idx_shelf_id` (`shelf_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='库位表';

CREATE TABLE `product` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '货品ID',
  `sku` varchar(64) NOT NULL COMMENT 'SKU编码',
  `product_name` varchar(128) NOT NULL COMMENT '货品名称',
  `category` varchar(64) DEFAULT NULL COMMENT '分类',
  `spec` varchar(128) DEFAULT NULL COMMENT '规格',
  `unit` varchar(16) NOT NULL DEFAULT '件' COMMENT '单位',
  `weight` decimal(10,2) DEFAULT NULL COMMENT '重量(kg)',
  `volume` decimal(10,2) DEFAULT NULL COMMENT '体积(m³)',
  `min_stock` int NOT NULL DEFAULT 0 COMMENT '安全库存下限',
  `max_stock` int NOT NULL DEFAULT 999999 COMMENT '安全库存上限',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态: 0-下架, 1-上架',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_sku` (`sku`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='货品表';

CREATE TABLE `inventory` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '库存ID',
  `warehouse_id` bigint NOT NULL COMMENT '仓库ID',
  `location_id` bigint NOT NULL COMMENT '库位ID',
  `product_id` bigint NOT NULL COMMENT '货品ID',
  `sku` varchar(64) NOT NULL COMMENT 'SKU编码',
  `quantity` int NOT NULL DEFAULT 0 COMMENT '库存数量',
  `available_qty` int NOT NULL DEFAULT 0 COMMENT '可用数量',
  `locked_qty` int NOT NULL DEFAULT 0 COMMENT '锁定数量',
  `version` int NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
  `batch_no` varchar(64) DEFAULT NULL COMMENT '批次号',
  `production_date` date DEFAULT NULL COMMENT '生产日期',
  `expiry_date` date DEFAULT NULL COMMENT '过期日期',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_location_product` (`location_id`, `product_id`, `batch_no`),
  KEY `idx_warehouse_id` (`warehouse_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_sku` (`sku`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='库存表';

CREATE TABLE `inbound_order` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '入库单ID',
  `order_no` varchar(32) NOT NULL COMMENT '入库单号',
  `warehouse_id` bigint NOT NULL COMMENT '仓库ID',
  `order_type` tinyint NOT NULL COMMENT '入库类型: 1-采购入库, 2-退货入库, 3-调拨入库',
  `supplier` varchar(128) DEFAULT NULL COMMENT '供应商',
  `total_qty` int NOT NULL DEFAULT 0 COMMENT '总数量',
  `inbound_qty` int NOT NULL DEFAULT 0 COMMENT '已入库数量',
  `status` tinyint NOT NULL DEFAULT 0 COMMENT '状态: 0-待审核, 1-待入库, 2-部分入库, 3-已完成, 9-已取消',
  `operator` varchar(32) DEFAULT NULL COMMENT '操作人',
  `audit_time` datetime DEFAULT NULL COMMENT '审核时间',
  `complete_time` datetime DEFAULT NULL COMMENT '完成时间',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_warehouse_id` (`warehouse_id`),
  KEY `idx_status` (`status`),
  KEY `idx_order_type` (`order_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='入库单表';

CREATE TABLE `inbound_order_item` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '明细ID',
  `order_id` bigint NOT NULL COMMENT '入库单ID',
  `product_id` bigint NOT NULL COMMENT '货品ID',
  `sku` varchar(64) NOT NULL COMMENT 'SKU编码',
  `product_name` varchar(128) NOT NULL COMMENT '货品名称',
  `spec` varchar(128) DEFAULT NULL COMMENT '规格',
  `unit` varchar(16) NOT NULL COMMENT '单位',
  `plan_qty` int NOT NULL COMMENT '计划数量',
  `inbound_qty` int NOT NULL DEFAULT 0 COMMENT '已入库数量',
  `batch_no` varchar(64) DEFAULT NULL COMMENT '批次号',
  `production_date` date DEFAULT NULL COMMENT '生产日期',
  `expiry_date` date DEFAULT NULL COMMENT '过期日期',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='入库单明细表';

CREATE TABLE `putaway_task` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '上架任务ID',
  `task_no` varchar(32) NOT NULL COMMENT '任务编号',
  `order_id` bigint NOT NULL COMMENT '入库单ID',
  `order_item_id` bigint NOT NULL COMMENT '入库单明细ID',
  `warehouse_id` bigint NOT NULL COMMENT '仓库ID',
  `product_id` bigint NOT NULL COMMENT '货品ID',
  `sku` varchar(64) NOT NULL COMMENT 'SKU编码',
  `recommend_location_id` bigint DEFAULT NULL COMMENT '推荐库位ID',
  `actual_location_id` bigint DEFAULT NULL COMMENT '实际库位ID',
  `plan_qty` int NOT NULL COMMENT '计划数量',
  `putaway_qty` int NOT NULL DEFAULT 0 COMMENT '已上架数量',
  `status` tinyint NOT NULL DEFAULT 0 COMMENT '状态: 0-待上架, 1-上架中, 2-已完成, 9-已取消',
  `operator` varchar(32) DEFAULT NULL COMMENT '操作人',
  `complete_time` datetime DEFAULT NULL COMMENT '完成时间',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_task_no` (`task_no`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_warehouse_id` (`warehouse_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='上架任务表';

CREATE TABLE `outbound_order` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '出库单ID',
  `order_no` varchar(32) NOT NULL COMMENT '出库单号',
  `warehouse_id` bigint NOT NULL COMMENT '仓库ID',
  `order_type` tinyint NOT NULL COMMENT '出库类型: 1-销售出库, 2-调拨出库, 3-退货出库',
  `customer` varchar(128) DEFAULT NULL COMMENT '客户',
  `total_qty` int NOT NULL DEFAULT 0 COMMENT '总数量',
  `outbound_qty` int NOT NULL DEFAULT 0 COMMENT '已出库数量',
  `status` tinyint NOT NULL DEFAULT 0 COMMENT '状态: 0-待审核, 1-待拣货, 2-拣货中, 3-部分出库, 4-已完成, 9-已取消',
  `operator` varchar(32) DEFAULT NULL COMMENT '操作人',
  `audit_time` datetime DEFAULT NULL COMMENT '审核时间',
  `complete_time` datetime DEFAULT NULL COMMENT '完成时间',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_warehouse_id` (`warehouse_id`),
  KEY `idx_status` (`status`),
  KEY `idx_order_type` (`order_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='出库单表';

CREATE TABLE `outbound_order_item` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '明细ID',
  `order_id` bigint NOT NULL COMMENT '出库单ID',
  `product_id` bigint NOT NULL COMMENT '货品ID',
  `sku` varchar(64) NOT NULL COMMENT 'SKU编码',
  `product_name` varchar(128) NOT NULL COMMENT '货品名称',
  `spec` varchar(128) DEFAULT NULL COMMENT '规格',
  `unit` varchar(16) NOT NULL COMMENT '单位',
  `plan_qty` int NOT NULL COMMENT '计划数量',
  `outbound_qty` int NOT NULL DEFAULT 0 COMMENT '已出库数量',
  `locked_qty` int NOT NULL DEFAULT 0 COMMENT '已锁定数量',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='出库单明细表';

CREATE TABLE `picking_task` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '拣货任务ID',
  `task_no` varchar(32) NOT NULL COMMENT '任务编号',
  `order_id` bigint NOT NULL COMMENT '出库单ID',
  `order_item_id` bigint NOT NULL COMMENT '出库单明细ID',
  `warehouse_id` bigint NOT NULL COMMENT '仓库ID',
  `product_id` bigint NOT NULL COMMENT '货品ID',
  `sku` varchar(64) NOT NULL COMMENT 'SKU编码',
  `location_id` bigint NOT NULL COMMENT '拣货库位ID',
  `plan_qty` int NOT NULL COMMENT '计划数量',
  `pick_qty` int NOT NULL DEFAULT 0 COMMENT '已拣数量',
  `sort_order` int NOT NULL DEFAULT 0 COMMENT '拣货顺序',
  `status` tinyint NOT NULL DEFAULT 0 COMMENT '状态: 0-待拣货, 1-拣货中, 2-已完成, 9-已取消',
  `operator` varchar(32) DEFAULT NULL COMMENT '操作人',
  `complete_time` datetime DEFAULT NULL COMMENT '完成时间',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_task_no` (`task_no`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_warehouse_id` (`warehouse_id`),
  KEY `idx_status` (`status`),
  KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='拣货任务表';

CREATE TABLE `stocktake_task` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '盘点任务ID',
  `task_no` varchar(32) NOT NULL COMMENT '任务编号',
  `warehouse_id` bigint NOT NULL COMMENT '仓库ID',
  `task_name` varchar(128) NOT NULL COMMENT '任务名称',
  `task_type` tinyint NOT NULL COMMENT '盘点类型: 1-全库盘点, 2-抽盘, 3-按库位',
  `total_sku` int NOT NULL DEFAULT 0 COMMENT '盘点SKU数',
  `checked_sku` int NOT NULL DEFAULT 0 COMMENT '已盘SKU数',
  `status` tinyint NOT NULL DEFAULT 0 COMMENT '状态: 0-待开始, 1-进行中, 2-待审核, 3-已完成, 9-已取消',
  `operator` varchar(32) DEFAULT NULL COMMENT '操作人',
  `start_time` datetime DEFAULT NULL COMMENT '开始时间',
  `end_time` datetime DEFAULT NULL COMMENT '结束时间',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_task_no` (`task_no`),
  KEY `idx_warehouse_id` (`warehouse_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='盘点任务表';

CREATE TABLE `stocktake_task_item` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '盘点明细ID',
  `task_id` bigint NOT NULL COMMENT '盘点任务ID',
  `warehouse_id` bigint NOT NULL COMMENT '仓库ID',
  `location_id` bigint NOT NULL COMMENT '库位ID',
  `product_id` bigint NOT NULL COMMENT '货品ID',
  `sku` varchar(64) NOT NULL COMMENT 'SKU编码',
  `product_name` varchar(128) NOT NULL COMMENT '货品名称',
  `spec` varchar(128) DEFAULT NULL COMMENT '规格',
  `book_qty` int NOT NULL COMMENT '账面数量',
  `actual_qty` int DEFAULT NULL COMMENT '实盘数量',
  `diff_qty` int DEFAULT NULL COMMENT '差异数量',
  `status` tinyint NOT NULL DEFAULT 0 COMMENT '状态: 0-待盘点, 1-已盘点',
  `checker` varchar(32) DEFAULT NULL COMMENT '盘点人',
  `check_time` datetime DEFAULT NULL COMMENT '盘点时间',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_task_id` (`task_id`),
  KEY `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='盘点任务明细表';

CREATE TABLE `inventory_log` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '流水ID',
  `log_no` varchar(32) NOT NULL COMMENT '流水编号',
  `warehouse_id` bigint NOT NULL COMMENT '仓库ID',
  `location_id` bigint DEFAULT NULL COMMENT '库位ID',
  `product_id` bigint NOT NULL COMMENT '货品ID',
  `sku` varchar(64) NOT NULL COMMENT 'SKU编码',
  `log_type` tinyint NOT NULL COMMENT '流水类型: 1-入库, 2-出库, 3-盘点调整, 4-库位移动, 5-库存预警',
  `business_type` varchar(32) DEFAULT NULL COMMENT '业务类型',
  `business_no` varchar(32) DEFAULT NULL COMMENT '业务单号',
  `before_qty` int NOT NULL COMMENT '变更前数量',
  `change_qty` int NOT NULL COMMENT '变更数量',
  `after_qty` int NOT NULL COMMENT '变更后数量',
  `operator` varchar(32) DEFAULT NULL COMMENT '操作人',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_log_no` (`log_no`),
  KEY `idx_warehouse_id` (`warehouse_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_log_type` (`log_type`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='库存流水表';

CREATE TABLE `inventory_alert` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '预警ID',
  `alert_no` varchar(32) NOT NULL COMMENT '预警编号',
  `warehouse_id` bigint NOT NULL COMMENT '仓库ID',
  `product_id` bigint NOT NULL COMMENT '货品ID',
  `sku` varchar(64) NOT NULL COMMENT 'SKU编码',
  `product_name` varchar(128) NOT NULL COMMENT '货品名称',
  `alert_type` tinyint NOT NULL COMMENT '预警类型: 1-低于下限, 2-高于上限',
  `current_qty` int NOT NULL COMMENT '当前库存',
  `threshold_qty` int NOT NULL COMMENT '阈值',
  `status` tinyint NOT NULL DEFAULT 0 COMMENT '状态: 0-未处理, 1-已处理',
  `handler` varchar(32) DEFAULT NULL COMMENT '处理人',
  `handle_time` datetime DEFAULT NULL COMMENT '处理时间',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_alert_no` (`alert_no`),
  KEY `idx_warehouse_id` (`warehouse_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_alert_type` (`alert_type`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='库存预警表';

INSERT INTO `warehouse` (`warehouse_code`, `warehouse_name`, `address`, `manager`, `phone`) VALUES
('WH001', '主仓库', '上海市浦东新区张江高科技园区', '张三', '13800138001'),
('WH002', '备用仓库', '上海市松江区工业园区', '李四', '13800138002');

INSERT INTO `shelf` (`warehouse_id`, `shelf_code`, `shelf_name`, `rows`, `columns`) VALUES
(1, 'WH001-A', 'A区货架', 5, 5),
(1, 'WH001-B', 'B区货架', 5, 5),
(1, 'WH001-C', 'C区货架', 5, 5),
(2, 'WH002-A', '备用库A区货架', 5, 5);

INSERT INTO `location` (`warehouse_id`, `shelf_id`, `location_code`, `row_no`, `col_no`, `status`) VALUES
(1, 1, 'WH001-A-01-01', 1, 1, 1),
(1, 1, 'WH001-A-01-02', 1, 2, 1),
(1, 1, 'WH001-A-01-03', 1, 3, 1),
(1, 1, 'WH001-A-01-04', 1, 4, 1),
(1, 1, 'WH001-A-01-05', 1, 5, 1),
(1, 1, 'WH001-A-02-01', 2, 1, 1),
(1, 1, 'WH001-A-02-02', 2, 2, 1),
(1, 1, 'WH001-A-02-03', 2, 3, 1),
(1, 1, 'WH001-A-02-04', 2, 4, 1),
(1, 1, 'WH001-A-02-05', 2, 5, 1),
(1, 1, 'WH001-A-03-01', 3, 1, 1),
(1, 1, 'WH001-A-03-02', 3, 2, 1),
(1, 1, 'WH001-A-03-03', 3, 3, 1),
(1, 1, 'WH001-A-03-04', 3, 4, 1),
(1, 1, 'WH001-A-03-05', 3, 5, 1),
(1, 2, 'WH001-B-01-01', 1, 1, 1),
(1, 2, 'WH001-B-01-02', 1, 2, 1),
(1, 2, 'WH001-B-01-03', 1, 3, 1),
(1, 2, 'WH001-B-01-04', 1, 4, 1),
(1, 2, 'WH001-B-01-05', 1, 5, 1);

CREATE TABLE `sys_user` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(32) NOT NULL COMMENT '用户名',
  `password` varchar(64) NOT NULL COMMENT '密码(BCrypt加密)',
  `real_name` varchar(32) DEFAULT NULL COMMENT '真实姓名',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `email` varchar(64) DEFAULT NULL COMMENT '邮箱',
  `role` tinyint NOT NULL DEFAULT 2 COMMENT '角色: 1-管理员, 2-普通用户',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统用户表';

INSERT INTO `product` (`sku`, `product_name`, `category`, `spec`, `unit`, `min_stock`, `max_stock`) VALUES
('SKU001', '笔记本电脑', '电子产品', '14英寸/8G/256G', '台', 10, 100),
('SKU002', '无线鼠标', '电子产品', '蓝牙/黑色', '个', 50, 500),
('SKU003', '机械键盘', '电子产品', '青轴/104键', '个', 30, 300),
('SKU004', '显示器', '电子产品', '27英寸/2K', '台', 5, 50),
('SKU005', 'USB-C数据线', '配件', '1米/快充', '根', 100, 1000),
('SKU006', '手机支架', '配件', '可调节/黑色', '个', 80, 800),
('SKU007', '充电宝', '电子产品', '20000mAh', '个', 20, 200),
('SKU008', '耳机', '电子产品', '无线/降噪', '副', 25, 250);

INSERT INTO `sys_user` (`username`, `password`, `real_name`, `phone`, `role`) VALUES
('admin', '$2a$10$.x0B01Qr.y6sT1ni9bzT1OBt2BKu/HzCh8PjDrMMm8vZ/UpbnOc5u', '系统管理员', '13800138000', 1),
('operator', '$2a$10$.x0B01Qr.y6sT1ni9bzT1OBt2BKu/HzCh8PjDrMMm8vZ/UpbnOc5u', '仓库管理员', '13800138003', 2);

INSERT INTO `inventory` (`warehouse_id`, `location_id`, `product_id`, `sku`, `quantity`, `available_qty`, `locked_qty`, `version`, `batch_no`) VALUES
(1, 1, 1, 'SKU001', 50, 50, 0, 0, 'B20240101'),
(1, 2, 2, 'SKU002', 200, 200, 0, 0, 'B20240102'),
(1, 3, 3, 'SKU003', 100, 100, 0, 0, 'B20240103'),
(1, 6, 4, 'SKU004', 20, 20, 0, 0, 'B20240104'),
(1, 7, 5, 'SKU005', 500, 500, 0, 0, 'B20240105'),
(1, 8, 6, 'SKU006', 300, 300, 0, 0, 'B20240106'),
(1, 15, 7, 'SKU007', 80, 80, 0, 0, 'B20240107'),
(1, 16, 8, 'SKU008', 120, 120, 0, 0, 'B20240108');
