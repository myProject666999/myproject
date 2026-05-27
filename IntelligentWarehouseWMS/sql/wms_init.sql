CREATE DATABASE IF NOT EXISTS wms_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE wms_db;

CREATE TABLE warehouse (
  id bigint NOT NULL AUTO_INCREMENT,
  warehouse_code varchar(32) NOT NULL,
  warehouse_name varchar(64) NOT NULL,
  address varchar(255) DEFAULT NULL,
  manager varchar(32) DEFAULT NULL,
  phone varchar(20) DEFAULT NULL,
  status tinyint NOT NULL DEFAULT 1,
  remark varchar(255) DEFAULT NULL,
  create_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_warehouse_code (warehouse_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE shelf (
  id bigint NOT NULL AUTO_INCREMENT,
  warehouse_id bigint NOT NULL,
  shelf_code varchar(32) NOT NULL,
  shelf_name varchar(64) DEFAULT NULL,
  rows int NOT NULL DEFAULT 5,
  columns int NOT NULL DEFAULT 5,
  status tinyint NOT NULL DEFAULT 1,
  remark varchar(255) DEFAULT NULL,
  create_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_shelf_code (shelf_code),
  KEY idx_warehouse_id (warehouse_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE location (
  id bigint NOT NULL AUTO_INCREMENT,
  warehouse_id bigint NOT NULL,
  shelf_id bigint NOT NULL,
  location_code varchar(32) NOT NULL,
  row_no int NOT NULL,
  col_no int NOT NULL,
  capacity decimal(10,2) NOT NULL DEFAULT 100.00,
  used_capacity decimal(10,2) NOT NULL DEFAULT 0.00,
  status tinyint NOT NULL DEFAULT 1,
  remark varchar(255) DEFAULT NULL,
  create_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_location_code (location_code),
  KEY idx_warehouse_id (warehouse_id),
  KEY idx_shelf_id (shelf_id),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE product (
  id bigint NOT NULL AUTO_INCREMENT,
  sku varchar(64) NOT NULL,
  product_name varchar(128) NOT NULL,
  category varchar(64) DEFAULT NULL,
  spec varchar(128) DEFAULT NULL,
  unit varchar(16) NOT NULL DEFAULT '件',
  weight decimal(10,2) DEFAULT NULL,
  volume decimal(10,2) DEFAULT NULL,
  min_stock int NOT NULL DEFAULT 0,
  max_stock int NOT NULL DEFAULT 999999,
  status tinyint NOT NULL DEFAULT 1,
  remark varchar(255) DEFAULT NULL,
  create_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_sku (sku),
  KEY idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE inventory (
  id bigint NOT NULL AUTO_INCREMENT,
  warehouse_id bigint NOT NULL,
  location_id bigint NOT NULL,
  product_id bigint NOT NULL,
  sku varchar(64) NOT NULL,
  quantity int NOT NULL DEFAULT 0,
  available_qty int NOT NULL DEFAULT 0,
  locked_qty int NOT NULL DEFAULT 0,
  version int NOT NULL DEFAULT 0,
  batch_no varchar(64) DEFAULT NULL,
  production_date date DEFAULT NULL,
  expiry_date date DEFAULT NULL,
  create_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_location_product (location_id, product_id, batch_no),
  KEY idx_warehouse_id (warehouse_id),
  KEY idx_product_id (product_id),
  KEY idx_sku (sku)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE inbound_order (
  id bigint NOT NULL AUTO_INCREMENT,
  order_no varchar(32) NOT NULL,
  warehouse_id bigint NOT NULL,
  order_type tinyint NOT NULL,
  supplier varchar(128) DEFAULT NULL,
  total_qty int NOT NULL DEFAULT 0,
  inbound_qty int NOT NULL DEFAULT 0,
  status tinyint NOT NULL DEFAULT 0,
  operator varchar(32) DEFAULT NULL,
  audit_time datetime DEFAULT NULL,
  complete_time datetime DEFAULT NULL,
  remark varchar(255) DEFAULT NULL,
  create_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_order_no (order_no),
  KEY idx_warehouse_id (warehouse_id),
  KEY idx_status (status),
  KEY idx_order_type (order_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE inbound_order_item (
  id bigint NOT NULL AUTO_INCREMENT,
  order_id bigint NOT NULL,
  product_id bigint NOT NULL,
  sku varchar(64) NOT NULL,
  product_name varchar(128) NOT NULL,
  spec varchar(128) DEFAULT NULL,
  unit varchar(16) NOT NULL,
  plan_qty int NOT NULL,
  inbound_qty int NOT NULL DEFAULT 0,
  batch_no varchar(64) DEFAULT NULL,
  production_date date DEFAULT NULL,
  expiry_date date DEFAULT NULL,
  remark varchar(255) DEFAULT NULL,
  create_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_order_id (order_id),
  KEY idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE putaway_task (
  id bigint NOT NULL AUTO_INCREMENT,
  task_no varchar(32) NOT NULL,
  order_id bigint NOT NULL,
  order_item_id bigint NOT NULL,
  warehouse_id bigint NOT NULL,
  product_id bigint NOT NULL,
  sku varchar(64) NOT NULL,
  recommend_location_id bigint DEFAULT NULL,
  actual_location_id bigint DEFAULT NULL,
  plan_qty int NOT NULL,
  putaway_qty int NOT NULL DEFAULT 0,
  status tinyint NOT NULL DEFAULT 0,
  operator varchar(32) DEFAULT NULL,
  complete_time datetime DEFAULT NULL,
  remark varchar(255) DEFAULT NULL,
  create_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_task_no (task_no),
  KEY idx_order_id (order_id),
  KEY idx_warehouse_id (warehouse_id),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE outbound_order (
  id bigint NOT NULL AUTO_INCREMENT,
  order_no varchar(32) NOT NULL,
  warehouse_id bigint NOT NULL,
  order_type tinyint NOT NULL,
  customer varchar(128) DEFAULT NULL,
  total_qty int NOT NULL DEFAULT 0,
  outbound_qty int NOT NULL DEFAULT 0,
  status tinyint NOT NULL DEFAULT 0,
  operator varchar(32) DEFAULT NULL,
  audit_time datetime DEFAULT NULL,
  complete_time datetime DEFAULT NULL,
  remark varchar(255) DEFAULT NULL,
  create_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_order_no (order_no),
  KEY idx_warehouse_id (warehouse_id),
  KEY idx_status (status),
  KEY idx_order_type (order_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE outbound_order_item (
  id bigint NOT NULL AUTO_INCREMENT,
  order_id bigint NOT NULL,
  product_id bigint NOT NULL,
  sku varchar(64) NOT NULL,
  product_name varchar(128) NOT NULL,
  spec varchar(128) DEFAULT NULL,
  unit varchar(16) NOT NULL,
  plan_qty int NOT NULL,
  outbound_qty int NOT NULL DEFAULT 0,
  locked_qty int NOT NULL DEFAULT 0,
  remark varchar(255) DEFAULT NULL,
  create_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_order_id (order_id),
  KEY idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE picking_task (
  id bigint NOT NULL AUTO_INCREMENT,
  task_no varchar(32) NOT NULL,
  order_id bigint NOT NULL,
  order_item_id bigint NOT NULL,
  warehouse_id bigint NOT NULL,
  product_id bigint NOT NULL,
  sku varchar(64) NOT NULL,
  location_id bigint NOT NULL,
  plan_qty int NOT NULL,
  pick_qty int NOT NULL DEFAULT 0,
  sort_order int NOT NULL DEFAULT 0,
  status tinyint NOT NULL DEFAULT 0,
  operator varchar(32) DEFAULT NULL,
  complete_time datetime DEFAULT NULL,
  remark varchar(255) DEFAULT NULL,
  create_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_task_no (task_no),
  KEY idx_order_id (order_id),
  KEY idx_warehouse_id (warehouse_id),
  KEY idx_status (status),
  KEY idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE stocktake_task (
  id bigint NOT NULL AUTO_INCREMENT,
  task_no varchar(32) NOT NULL,
  warehouse_id bigint NOT NULL,
  task_name varchar(128) NOT NULL,
  task_type tinyint NOT NULL,
  total_sku int NOT NULL DEFAULT 0,
  checked_sku int NOT NULL DEFAULT 0,
  status tinyint NOT NULL DEFAULT 0,
  operator varchar(32) DEFAULT NULL,
  start_time datetime DEFAULT NULL,
  end_time datetime DEFAULT NULL,
  remark varchar(255) DEFAULT NULL,
  create_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_task_no (task_no),
  KEY idx_warehouse_id (warehouse_id),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE stocktake_task_item (
  id bigint NOT NULL AUTO_INCREMENT,
  task_id bigint NOT NULL,
  warehouse_id bigint NOT NULL,
  location_id bigint NOT NULL,
  product_id bigint NOT NULL,
  sku varchar(64) NOT NULL,
  product_name varchar(128) NOT NULL,
  spec varchar(128) DEFAULT NULL,
  book_qty int NOT NULL,
  actual_qty int DEFAULT NULL,
  diff_qty int DEFAULT NULL,
  status tinyint NOT NULL DEFAULT 0,
  checker varchar(32) DEFAULT NULL,
  check_time datetime DEFAULT NULL,
  remark varchar(255) DEFAULT NULL,
  create_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_task_id (task_id),
  KEY idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE inventory_log (
  id bigint NOT NULL AUTO_INCREMENT,
  log_no varchar(32) NOT NULL,
  warehouse_id bigint NOT NULL,
  location_id bigint DEFAULT NULL,
  product_id bigint NOT NULL,
  sku varchar(64) NOT NULL,
  log_type tinyint NOT NULL,
  business_type varchar(32) DEFAULT NULL,
  business_no varchar(32) DEFAULT NULL,
  before_qty int NOT NULL,
  change_qty int NOT NULL,
  after_qty int NOT NULL,
  operator varchar(32) DEFAULT NULL,
  remark varchar(255) DEFAULT NULL,
  create_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_log_no (log_no),
  KEY idx_warehouse_id (warehouse_id),
  KEY idx_product_id (product_id),
  KEY idx_log_type (log_type),
  KEY idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE inventory_alert (
  id bigint NOT NULL AUTO_INCREMENT,
  alert_no varchar(32) NOT NULL,
  warehouse_id bigint NOT NULL,
  product_id bigint NOT NULL,
  sku varchar(64) NOT NULL,
  product_name varchar(128) NOT NULL,
  alert_type tinyint NOT NULL,
  current_qty int NOT NULL,
  threshold_qty int NOT NULL,
  status tinyint NOT NULL DEFAULT 0,
  handler varchar(32) DEFAULT NULL,
  handle_time datetime DEFAULT NULL,
  remark varchar(255) DEFAULT NULL,
  create_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_alert_no (alert_no),
  KEY idx_warehouse_id (warehouse_id),
  KEY idx_product_id (product_id),
  KEY idx_alert_type (alert_type),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO warehouse (warehouse_code, warehouse_name, address, manager, phone) VALUES
('WH001', '主仓库', '上海市浦东新区张江高科技园区', '张三', '13800138001'),
('WH002', '备用仓库', '上海市松江区工业园区', '李四', '13800138002');

INSERT INTO shelf (warehouse_id, shelf_code, shelf_name, rows, columns) VALUES
(1, 'A', 'A区货架', 5, 5),
(1, 'B', 'B区货架', 5, 5),
(1, 'C', 'C区货架', 5, 5),
(2, 'A', '备用库A区货架', 5, 5);

INSERT INTO location (warehouse_id, shelf_id, location_code, row_no, col_no, status) VALUES
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

INSERT INTO product (sku, product_name, category, spec, unit, min_stock, max_stock) VALUES
('SKU001', '笔记本电脑', '电子产品', '14英寸/8G/256G', '台', 10, 100),
('SKU002', '无线鼠标', '电子产品', '蓝牙/黑色', '个', 50, 500),
('SKU003', '机械键盘', '电子产品', '青轴/104键', '个', 30, 300),
('SKU004', '显示器', '电子产品', '27英寸/2K', '台', 5, 50),
('SKU005', 'USB-C数据线', '配件', '1米/快充', '根', 100, 1000),
('SKU006', '手机支架', '配件', '可调节/黑色', '个', 80, 800),
('SKU007', '充电宝', '电子产品', '20000mAh', '个', 20, 200),
('SKU008', '耳机', '电子产品', '无线/降噪', '副', 25, 250);
