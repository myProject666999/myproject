CREATE DATABASE IF NOT EXISTS restaurant_queue DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE restaurant_queue;

DROP TABLE IF EXISTS verify_records;
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS queues;
DROP TABLE IF EXISTS table_types;
DROP TABLE IF EXISTS queue_settings;
DROP TABLE IF EXISTS restaurants;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20) NOT NULL UNIQUE COMMENT '手机号',
    nickname VARCHAR(50) DEFAULT '' COMMENT '昵称',
    avatar VARCHAR(255) DEFAULT '' COMMENT '头像',
    status TINYINT DEFAULT 1 COMMENT '状态 1正常 0禁用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE restaurants (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '餐厅名称',
    address VARCHAR(255) NOT NULL COMMENT '地址',
    contact_phone VARCHAR(20) DEFAULT '' COMMENT '联系电话',
    business_hours VARCHAR(100) DEFAULT '' COMMENT '营业时间',
    description TEXT COMMENT '餐厅描述',
    cover_image VARCHAR(255) DEFAULT '' COMMENT '封面图',
    status TINYINT DEFAULT 1 COMMENT '状态 1营业 0打烊',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='餐厅表';

CREATE TABLE table_types (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    restaurant_id BIGINT UNSIGNED NOT NULL COMMENT '餐厅ID',
    name VARCHAR(50) NOT NULL COMMENT '桌型名称',
    min_people INT NOT NULL DEFAULT 1 COMMENT '最少人数',
    max_people INT NOT NULL DEFAULT 2 COMMENT '最多人数',
    seat_count INT NOT NULL DEFAULT 2 COMMENT '座位数',
    queue_prefix VARCHAR(10) NOT NULL COMMENT '排队号前缀 如A,B,C',
    total_tables INT NOT NULL DEFAULT 10 COMMENT '该类型总桌数',
    avg_serve_time INT NOT NULL DEFAULT 15 COMMENT '平均用餐时间(分钟)',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态 1启用 0禁用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_restaurant_id (restaurant_id),
    INDEX idx_queue_prefix (queue_prefix)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='桌型表';

CREATE TABLE queue_settings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    restaurant_id BIGINT UNSIGNED NOT NULL UNIQUE COMMENT '餐厅ID',
    max_queue_length INT NOT NULL DEFAULT 50 COMMENT '最大排队长度',
    over_number_limit INT NOT NULL DEFAULT 3 COMMENT '过号最多可延后位数',
    max_advance_days INT NOT NULL DEFAULT 7 COMMENT '最远可预约天数',
    reserve_time_gap INT NOT NULL DEFAULT 30 COMMENT '预约时间段间隔(分钟)',
    rate_limit_seconds INT NOT NULL DEFAULT 60 COMMENT '取号频控时间(秒)',
    rate_limit_count INT NOT NULL DEFAULT 1 COMMENT '频控时间内最大取号次数',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='排队设置表';

CREATE TABLE queues (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    queue_no VARCHAR(20) NOT NULL COMMENT '排队号 如A001',
    queue_number INT NOT NULL COMMENT '纯数字号码',
    restaurant_id BIGINT UNSIGNED NOT NULL COMMENT '餐厅ID',
    table_type_id BIGINT UNSIGNED NOT NULL COMMENT '桌型ID',
    queue_prefix VARCHAR(10) NOT NULL COMMENT '排队号前缀',
    user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    user_phone VARCHAR(20) NOT NULL COMMENT '用户手机号',
    people_count INT NOT NULL DEFAULT 1 COMMENT '用餐人数',
    status TINYINT NOT NULL DEFAULT 0 COMMENT '状态 0等待中 1叫号中 2已入座 3已过号 4已取消 5已完成',
    position INT DEFAULT 0 COMMENT '当前位次',
    estimated_wait_time INT DEFAULT 0 COMMENT '预估等待时间(分钟)',
    is_reservation TINYINT DEFAULT 0 COMMENT '是否预约号 0现场号 1预约号',
    reservation_id BIGINT UNSIGNED DEFAULT NULL COMMENT '关联预约ID',
    over_number_count INT DEFAULT 0 COMMENT '过号次数',
    called_at DATETIME DEFAULT NULL COMMENT '叫号时间',
    seated_at DATETIME DEFAULT NULL COMMENT '入座时间',
    completed_at DATETIME DEFAULT NULL COMMENT '完成时间',
    remark VARCHAR(255) DEFAULT '' COMMENT '备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_queue_no (restaurant_id, queue_no, created_at),
    INDEX idx_restaurant_status (restaurant_id, status),
    INDEX idx_table_type_status (table_type_id, status),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='排队记录表';

CREATE TABLE reservations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    reserve_no VARCHAR(32) NOT NULL UNIQUE COMMENT '预约号',
    restaurant_id BIGINT UNSIGNED NOT NULL COMMENT '餐厅ID',
    table_type_id BIGINT UNSIGNED NOT NULL COMMENT '桌型ID',
    user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    user_phone VARCHAR(20) NOT NULL COMMENT '用户手机号',
    people_count INT NOT NULL DEFAULT 1 COMMENT '用餐人数',
    reserve_date DATE NOT NULL COMMENT '预约日期',
    reserve_time TIME NOT NULL COMMENT '预约时间',
    status TINYINT NOT NULL DEFAULT 0 COMMENT '状态 0待确认 1已确认 2已取消 3已过期 4已完成',
    queue_id BIGINT UNSIGNED DEFAULT NULL COMMENT '关联排队ID',
    verify_code VARCHAR(20) DEFAULT '' COMMENT '核验码',
    verified_at DATETIME DEFAULT NULL COMMENT '核验时间',
    remark VARCHAR(255) DEFAULT '' COMMENT '备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_reserve_no (reserve_no),
    INDEX idx_user_id (user_id),
    INDEX idx_restaurant_date (restaurant_id, reserve_date),
    INDEX idx_reserve_datetime (reserve_date, reserve_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预约记录表';

CREATE TABLE verify_records (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    restaurant_id BIGINT UNSIGNED NOT NULL COMMENT '餐厅ID',
    reservation_id BIGINT UNSIGNED NOT NULL COMMENT '预约ID',
    queue_id BIGINT UNSIGNED DEFAULT NULL COMMENT '排队ID',
    user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    verify_code VARCHAR(20) NOT NULL COMMENT '核验码',
    verify_type TINYINT NOT NULL DEFAULT 1 COMMENT '核验类型 1预约核验 2排队核验',
    verify_result TINYINT NOT NULL DEFAULT 0 COMMENT '核验结果 0失败 1成功',
    operator_id BIGINT UNSIGNED DEFAULT NULL COMMENT '操作人ID',
    remark VARCHAR(255) DEFAULT '' COMMENT '备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_reservation_id (reservation_id),
    INDEX idx_verify_code (verify_code),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='核验记录表';

INSERT INTO restaurants (id, name, address, contact_phone, business_hours, description, status) VALUES
(1, '川味轩火锅', '北京市朝阳区建国路88号', '010-12345678', '11:00-22:00', '正宗四川火锅，麻辣鲜香', 1),
(2, '粤港茶餐厅', '北京市海淀区中关村大街1号', '010-87654321', '07:00-23:00', '地道港式茶点，早茶晚茶应有尽有', 1);

INSERT INTO queue_settings (restaurant_id, max_queue_length, over_number_limit, max_advance_days, reserve_time_gap, rate_limit_seconds, rate_limit_count) VALUES
(1, 50, 3, 7, 30, 60, 1),
(2, 40, 3, 7, 30, 60, 1);

INSERT INTO table_types (restaurant_id, name, min_people, max_people, seat_count, queue_prefix, total_tables, avg_serve_time, sort_order, status) VALUES
(1, '小桌', 1, 2, 2, 'A', 15, 60, 1, 1),
(1, '中桌', 3, 4, 4, 'B', 12, 75, 2, 1),
(1, '大桌', 5, 8, 8, 'C', 8, 90, 3, 1),
(1, '包厢', 8, 12, 12, 'D', 5, 120, 4, 1),
(2, '小桌', 1, 2, 2, 'A', 20, 45, 1, 1),
(2, '中桌', 3, 4, 4, 'B', 15, 60, 2, 1),
(2, '大桌', 5, 6, 6, 'C', 10, 75, 3, 1);

INSERT INTO users (phone, nickname, status) VALUES
('13800138001', '张三', 1),
('13800138002', '李四', 1),
('13800138003', '王五', 1),
('13900139001', '商家A', 1),
('13900139002', '商家B', 1);
