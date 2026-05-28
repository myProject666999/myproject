package main

import (
"database/sql"
"fmt"
"os"

_ "github.com/go-sql-driver/mysql"
)

var tables = []string{
`CREATE TABLE IF NOT EXISTS warehouse (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS shelf (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS location (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS product (
id bigint NOT NULL AUTO_INCREMENT,
sku varchar(64) NOT NULL,
product_name varchar(128) NOT NULL,
category varchar(64) DEFAULT NULL,
spec varchar(128) DEFAULT NULL,
unit varchar(16) NOT NULL DEFAULT '?',
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS inventory (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS inbound_order (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS inbound_order_item (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS putaway_task (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS outbound_order (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS outbound_order_item (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS picking_task (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS stocktake_task (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS stocktake_task_item (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS inventory_log (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS inventory_alert (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
}

var seedData = []string{
`INSERT IGNORE INTO warehouse (warehouse_code, warehouse_name, address, manager, phone) VALUES
('WH001', '???', '??????????????', '??', '13800138001'),
('WH002', '????', '??????????', '??', '13800138002')`,

`INSERT IGNORE INTO shelf (warehouse_id, shelf_code, shelf_name, rows, columns) VALUES
(1, 'A', 'A???', 5, 5),
(1, 'B', 'B???', 5, 5),
(1, 'C', 'C???', 5, 5),
(2, 'A', '???A???', 5, 5)`,

`INSERT IGNORE INTO location (warehouse_id, shelf_id, location_code, row_no, col_no, status) VALUES
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
(1, 2, 'WH001-B-01-05', 1, 5, 1)`,

`INSERT IGNORE INTO product (sku, product_name, category, spec, unit, min_stock, max_stock) VALUES
('SKU001', '?????', '????', '14??/8G/256G', '?', 10, 100),
('SKU002', '????', '????', '??/??', '?', 50, 500),
('SKU003', '????', '????', '??/104?', '?', 30, 300),
('SKU004', '???', '????', '27??/2K', '?', 5, 50),
('SKU005', 'USB-C???', '??', '1?/??', '?', 100, 1000),
('SKU006', '????', '??', '???/??', '?', 80, 800),
('SKU007', '???', '????', '20000mAh', '?', 20, 200),
('SKU008', '??', '????', '??/??', '?', 25, 250)`,
}

func main() {
dsn := "root:123456@tcp(127.0.0.1:3306)/wms_db?charset=utf8mb4&parseTime=True&loc=Local&multiStatements=true&timeout=10s"
db, err := sql.Open("mysql", dsn)
if err != nil { fmt.Println("Open err:", err); os.Exit(1) }
defer db.Close()
if err := db.Ping(); err != nil { fmt.Println("Ping err:", err); os.Exit(1) }
fmt.Println("DB connected OK")

fmt.Println("Creating tables...")
for i, sql := range tables {
if _, err := db.Exec(sql); err != nil {
fmt.Printf("Table %d error: %v\n", i, err)
os.Exit(1)
}
fmt.Printf("  Table %d created OK\n", i+1)
}
fmt.Println("All tables created!")

fmt.Println("Inserting seed data...")
for i, sql := range seedData {
if _, err := db.Exec(sql); err != nil {
fmt.Printf("Seed %d error: %v\n", i, err)
os.Exit(1)
}
fmt.Printf("  Seed %d inserted OK\n", i+1)
}
fmt.Println("All seed data inserted!")

rows, err := db.Query("SHOW TABLES")
if err != nil { fmt.Println("Query tables err:", err); os.Exit(1) }
defer rows.Close()
fmt.Println("\nDatabase tables:")
count := 0
for rows.Next() {
var name string
if err := rows.Scan(&name); err == nil {
fmt.Printf("  - %s\n", name)
count++
}
}
fmt.Printf("\nTotal: %d tables\n", count)
fmt.Println("\n*** DATABASE INITIALIZATION COMPLETE ***")
}
