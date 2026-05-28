CREATE DATABASE IF NOT EXISTS `unmanned_container` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `unmanned_container`;

DROP TABLE IF EXISTS `damage_records`;
DROP TABLE IF EXISTS `stock_check_items`;
DROP TABLE IF EXISTS `stock_checks`;
DROP TABLE IF EXISTS `replenishment_task_items`;
DROP TABLE IF EXISTS `replenishment_tasks`;
DROP TABLE IF EXISTS `sales`;
DROP TABLE IF EXISTS `inventory`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `replenishers`;
DROP TABLE IF EXISTS `containers`;

CREATE TABLE `containers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `container_no` VARCHAR(64) NOT NULL COMMENT '货柜编号',
  `name` VARCHAR(128) NOT NULL COMMENT '货柜名称',
  `address` VARCHAR(256) NOT NULL COMMENT '地址',
  `longitude` DECIMAL(10, 6) NOT NULL COMMENT '经度',
  `latitude` DECIMAL(10, 6) NOT NULL COMMENT '纬度',
  `area` VARCHAR(64) NOT NULL COMMENT '区域（用于路线聚合）',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1-正常 0-故障',
  `capacity` INT NOT NULL DEFAULT 100 COMMENT '总容量',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_container_no` (`container_no`),
  KEY `idx_area` (`area`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='货柜表';

CREATE TABLE `products` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_code` VARCHAR(64) NOT NULL COMMENT '商品编码',
  `name` VARCHAR(128) NOT NULL COMMENT '商品名称',
  `category` VARCHAR(64) NOT NULL COMMENT '商品分类',
  `price` DECIMAL(10, 2) NOT NULL COMMENT '售价',
  `cost` DECIMAL(10, 2) NOT NULL COMMENT '成本价',
  `spec` VARCHAR(128) DEFAULT NULL COMMENT '规格',
  `image_url` VARCHAR(256) DEFAULT NULL COMMENT '图片URL',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1-上架 0-下架',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_product_code` (`product_code`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品表';

CREATE TABLE `replenishers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_no` VARCHAR(64) NOT NULL COMMENT '员工编号',
  `name` VARCHAR(64) NOT NULL COMMENT '姓名',
  `phone` VARCHAR(32) NOT NULL COMMENT '手机号',
  `area` VARCHAR(64) DEFAULT NULL COMMENT '负责区域',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1-在岗 0-离职',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_employee_no` (`employee_no`),
  KEY `idx_area` (`area`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='补货员表';

CREATE TABLE `inventory` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `container_id` BIGINT UNSIGNED NOT NULL COMMENT '货柜ID',
  `product_id` BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
  `quantity` INT NOT NULL DEFAULT 0 COMMENT '当前库存',
  `max_quantity` INT NOT NULL DEFAULT 20 COMMENT '最大库存',
  `threshold` INT NOT NULL DEFAULT 5 COMMENT '缺货阈值',
  `last_sale_time` DATETIME DEFAULT NULL COMMENT '最后销售时间',
  `last_replenish_time` DATETIME DEFAULT NULL COMMENT '最后补货时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_container_product` (`container_id`, `product_id`),
  KEY `idx_container_id` (`container_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_low_stock` (`quantity`, `threshold`),
  CONSTRAINT `fk_inventory_container` FOREIGN KEY (`container_id`) REFERENCES `containers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_inventory_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='库存表';

CREATE TABLE `sales` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_no` VARCHAR(64) NOT NULL COMMENT '订单号（幂等键）',
  `container_id` BIGINT UNSIGNED NOT NULL COMMENT '货柜ID',
  `product_id` BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
  `quantity` INT NOT NULL COMMENT '销售数量',
  `unit_price` DECIMAL(10, 2) NOT NULL COMMENT '单价',
  `total_amount` DECIMAL(10, 2) NOT NULL COMMENT '总金额',
  `pay_method` VARCHAR(32) DEFAULT NULL COMMENT '支付方式',
  `pay_time` DATETIME DEFAULT NULL COMMENT '支付时间',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1-成功 2-退款',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_container_id` (`container_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_sale_container` FOREIGN KEY (`container_id`) REFERENCES `containers` (`id`),
  CONSTRAINT `fk_sale_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='销售记录表';

CREATE TABLE `replenishment_tasks` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `task_no` VARCHAR(64) NOT NULL COMMENT '任务编号',
  `replenisher_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '补货员ID',
  `area` VARCHAR(64) NOT NULL COMMENT '区域',
  `container_count` INT NOT NULL DEFAULT 0 COMMENT '涉及货柜数',
  `product_count` INT NOT NULL DEFAULT 0 COMMENT '涉及商品种数',
  `total_quantity` INT NOT NULL DEFAULT 0 COMMENT '总补货数量',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-待派单 1-待补货 2-补货中 3-已完成 4-已取消',
  `planned_time` DATETIME DEFAULT NULL COMMENT '计划补货时间',
  `start_time` DATETIME DEFAULT NULL COMMENT '开始时间',
  `finish_time` DATETIME DEFAULT NULL COMMENT '完成时间',
  `remark` VARCHAR(512) DEFAULT NULL COMMENT '备注',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_task_no` (`task_no`),
  KEY `idx_replenisher_id` (`replenisher_id`),
  KEY `idx_area` (`area`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_task_replenisher` FOREIGN KEY (`replenisher_id`) REFERENCES `replenishers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='补货任务表';

CREATE TABLE `replenishment_task_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `task_id` BIGINT UNSIGNED NOT NULL COMMENT '任务ID',
  `container_id` BIGINT UNSIGNED NOT NULL COMMENT '货柜ID',
  `product_id` BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
  `planned_quantity` INT NOT NULL COMMENT '计划补货数量',
  `actual_quantity` INT DEFAULT NULL COMMENT '实际补货数量',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-待补货 1-已补货',
  `idempotent_key` VARCHAR(128) NOT NULL COMMENT '幂等键（task_id+container_id+product_id）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_idempotent_key` (`idempotent_key`),
  KEY `idx_task_id` (`task_id`),
  KEY `idx_container_id` (`container_id`),
  KEY `idx_product_id` (`product_id`),
  CONSTRAINT `fk_item_task` FOREIGN KEY (`task_id`) REFERENCES `replenishment_tasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_item_container` FOREIGN KEY (`container_id`) REFERENCES `containers` (`id`),
  CONSTRAINT `fk_item_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='补货任务明细表';

CREATE TABLE `stock_checks` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `check_no` VARCHAR(64) NOT NULL COMMENT '盘点单号',
  `container_id` BIGINT UNSIGNED NOT NULL COMMENT '货柜ID',
  `replenisher_id` BIGINT UNSIGNED NOT NULL COMMENT '盘点人ID',
  `check_time` DATETIME NOT NULL COMMENT '盘点时间',
  `total_expected` INT NOT NULL DEFAULT 0 COMMENT '理论库存总数',
  `total_actual` INT NOT NULL DEFAULT 0 COMMENT '实际库存总数',
  `total_difference` INT NOT NULL DEFAULT 0 COMMENT '差异总数',
  `damage_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0 COMMENT '货损金额',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-待处理 1-已处理',
  `remark` VARCHAR(512) DEFAULT NULL COMMENT '备注',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_check_no` (`check_no`),
  KEY `idx_container_id` (`container_id`),
  KEY `idx_replenisher_id` (`replenisher_id`),
  KEY `idx_check_time` (`check_time`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_check_container` FOREIGN KEY (`container_id`) REFERENCES `containers` (`id`),
  CONSTRAINT `fk_check_replenisher` FOREIGN KEY (`replenisher_id`) REFERENCES `replenishers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='盘点表';

CREATE TABLE `stock_check_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `check_id` BIGINT UNSIGNED NOT NULL COMMENT '盘点ID',
  `product_id` BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
  `expected_quantity` INT NOT NULL COMMENT '理论库存',
  `actual_quantity` INT NOT NULL COMMENT '实际库存',
  `difference` INT NOT NULL COMMENT '差异数量',
  `unit_price` DECIMAL(10, 2) NOT NULL COMMENT '单价',
  `difference_amount` DECIMAL(10, 2) NOT NULL COMMENT '差异金额',
  `damage_quantity` INT NOT NULL DEFAULT 0 COMMENT '货损数量',
  `damage_reason` VARCHAR(256) DEFAULT NULL COMMENT '货损原因',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_check_id` (`check_id`),
  KEY `idx_product_id` (`product_id`),
  CONSTRAINT `fk_check_item_check` FOREIGN KEY (`check_id`) REFERENCES `stock_checks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_check_item_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='盘点明细表';

CREATE TABLE `damage_records` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `record_no` VARCHAR(64) NOT NULL COMMENT '货损记录号',
  `container_id` BIGINT UNSIGNED NOT NULL COMMENT '货柜ID',
  `product_id` BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
  `quantity` INT NOT NULL COMMENT '货损数量',
  `unit_price` DECIMAL(10, 2) NOT NULL COMMENT '单价',
  `total_amount` DECIMAL(10, 2) NOT NULL COMMENT '货损金额',
  `reason` VARCHAR(256) NOT NULL COMMENT '货损原因',
  `handler_id` BIGINT UNSIGNED NOT NULL COMMENT '处理人ID',
  `handle_time` DATETIME NOT NULL COMMENT '处理时间',
  `check_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联盘点ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_record_no` (`record_no`),
  KEY `idx_container_id` (`container_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_handle_time` (`handle_time`),
  KEY `idx_check_id` (`check_id`),
  CONSTRAINT `fk_damage_container` FOREIGN KEY (`container_id`) REFERENCES `containers` (`id`),
  CONSTRAINT `fk_damage_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `fk_damage_handler` FOREIGN KEY (`handler_id`) REFERENCES `replenishers` (`id`),
  CONSTRAINT `fk_damage_check` FOREIGN KEY (`check_id`) REFERENCES `stock_checks` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='货损记录表';

INSERT INTO `containers` (`container_no`, `name`, `address`, `longitude`, `latitude`, `area`, `status`, `capacity`) VALUES
('C001', 'A栋1楼货柜', '科技园A栋1楼大厅', 113.950000, 22.540000, '科技园A区', 1, 100),
('C002', 'A栋10楼货柜', '科技园A栋10楼电梯口', 113.950100, 22.540100, '科技园A区', 1, 80),
('C003', 'B栋1楼货柜', '科技园B栋1楼大厅', 113.951000, 22.541000, '科技园B区', 1, 100),
('C004', 'C栋1楼货柜', '科技园C栋1楼大厅', 113.952000, 22.542000, '科技园C区', 1, 120),
('C005', '小区1栋货柜', '阳光花园1栋单元门口', 113.960000, 22.550000, '阳光花园', 1, 80);

INSERT INTO `products` (`product_code`, `name`, `category`, `price`, `cost`, `spec`, `status`) VALUES
('P001', '农夫山泉550ml', '饮料', 2.00, 1.00, '550ml/瓶', 1),
('P002', '可口可乐330ml', '饮料', 3.50, 1.80, '330ml/罐', 1),
('P003', '乐事薯片原味', '零食', 8.00, 4.50, '75g/袋', 1),
('P004', '士力架巧克力', '零食', 6.00, 3.20, '51g/条', 1),
('P005', '康师傅红烧牛肉面', '方便食品', 5.00, 2.80, '105g/桶', 1),
('P006', '蒙牛纯牛奶250ml', '乳制品', 3.50, 2.00, '250ml/盒', 1),
('P007', '雀巢咖啡', '饮料', 5.00, 2.50, '268ml/罐', 1),
('P008', '奥利奥饼干', '零食', 10.00, 5.50, '116g/盒', 1);

INSERT INTO `replenishers` (`employee_no`, `name`, `phone`, `area`, `status`) VALUES
('E001', '张三', '13800138001', '科技园A区,科技园B区', 1),
('E002', '李四', '13800138002', '科技园C区', 1),
('E003', '王五', '13800138003', '阳光花园', 1);

INSERT INTO `inventory` (`container_id`, `product_id`, `quantity`, `max_quantity`, `threshold`) VALUES
(1, 1, 15, 20, 5),
(1, 2, 3, 20, 5),
(1, 3, 8, 15, 4),
(1, 4, 2, 15, 4),
(1, 5, 10, 15, 3),
(1, 6, 4, 20, 5),
(1, 7, 6, 15, 4),
(1, 8, 1, 10, 3),
(2, 1, 8, 20, 5),
(2, 2, 10, 20, 5),
(2, 5, 5, 15, 3),
(2, 6, 12, 20, 5),
(3, 1, 20, 20, 5),
(3, 2, 18, 20, 5),
(3, 3, 10, 15, 4),
(3, 7, 8, 15, 4),
(4, 4, 6, 15, 4),
(4, 5, 12, 15, 3),
(4, 8, 5, 10, 3),
(5, 1, 3, 20, 5),
(5, 2, 4, 20, 5),
(5, 3, 2, 15, 4),
(5, 6, 1, 20, 5);
