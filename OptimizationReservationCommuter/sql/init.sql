CREATE DATABASE IF NOT EXISTS commuter_reservation DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE commuter_reservation;

DROP TABLE IF EXISTS boarding_records;
DROP TABLE IF EXISTS capacity_alerts;
DROP TABLE IF EXISTS optimization_suggestions;
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS schedule_segments;
DROP TABLE IF EXISTS schedules;
DROP TABLE IF EXISTS route_stations;
DROP TABLE IF EXISTS stations;
DROP TABLE IF EXISTS routes;
DROP TABLE IF EXISTS employees;

CREATE TABLE routes (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '线路名称',
    direction TINYINT NOT NULL DEFAULT 1 COMMENT '方向: 1-上行 2-下行',
    total_distance DECIMAL(10,2) DEFAULT 0 COMMENT '总距离(km)',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-启用 0-停用',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='线路表';

CREATE TABLE stations (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '站点名称',
    address VARCHAR(255) DEFAULT '' COMMENT '站点地址',
    latitude DECIMAL(10,7) DEFAULT NULL COMMENT '纬度',
    longitude DECIMAL(10,7) DEFAULT NULL COMMENT '经度',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='站点表';

CREATE TABLE route_stations (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    route_id BIGINT UNSIGNED NOT NULL COMMENT '线路ID',
    station_id BIGINT UNSIGNED NOT NULL COMMENT '站点ID',
    sequence INT NOT NULL COMMENT '站点顺序',
    estimated_minutes INT DEFAULT 0 COMMENT '距首站预计分钟数',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_route_station_seq (route_id, station_id, sequence),
    KEY idx_route_id (route_id),
    KEY idx_station_id (station_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='线路站点关联表';

CREATE TABLE schedules (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    route_id BIGINT UNSIGNED NOT NULL COMMENT '线路ID',
    date DATE NOT NULL COMMENT '发车日期',
    departure_time TIME NOT NULL COMMENT '发车时间',
    total_seats INT NOT NULL DEFAULT 0 COMMENT '总座位数',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-可预约 2-已发车 3-已取消',
    reservation_deadline DATETIME DEFAULT NULL COMMENT '预约截止时间',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_route_date (route_id, date),
    KEY idx_date (date),
    KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='班次表';

CREATE TABLE schedule_segments (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    schedule_id BIGINT UNSIGNED NOT NULL COMMENT '班次ID',
    segment_index INT NOT NULL COMMENT '段序号(从0开始)',
    from_station_id BIGINT UNSIGNED NOT NULL COMMENT '出发站点ID',
    to_station_id BIGINT UNSIGNED NOT NULL COMMENT '到达站点ID',
    available_seats INT NOT NULL DEFAULT 0 COMMENT '剩余座位数',
    PRIMARY KEY (id),
    UNIQUE KEY uk_schedule_segment (schedule_id, segment_index),
    KEY idx_schedule_id (schedule_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='班次站点段座位表';

CREATE TABLE employees (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    employee_no VARCHAR(50) NOT NULL COMMENT '工号',
    department VARCHAR(100) DEFAULT '' COMMENT '部门',
    phone VARCHAR(20) DEFAULT '' COMMENT '手机号',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-在职 0-离职',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_employee_no (employee_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='员工表';

CREATE TABLE reservations (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    employee_id BIGINT UNSIGNED NOT NULL COMMENT '员工ID',
    schedule_id BIGINT UNSIGNED NOT NULL COMMENT '班次ID',
    boarding_station_id BIGINT UNSIGNED NOT NULL COMMENT '上车站点ID',
    alighting_station_id BIGINT UNSIGNED NOT NULL COMMENT '下车站点ID',
    seat_number INT DEFAULT 0 COMMENT '座位号',
    qr_code VARCHAR(64) NOT NULL DEFAULT '' COMMENT '核验二维码标识',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '1-已预约 2-已核验 3-已取消 4-已过期',
    reserved_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '预约时间',
    cancelled_at DATETIME DEFAULT NULL COMMENT '取消时间',
    checked_in_at DATETIME DEFAULT NULL COMMENT '核验时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_qr_code (qr_code),
    KEY idx_employee (employee_id),
    KEY idx_schedule (schedule_id),
    KEY idx_status (status),
    KEY idx_employee_schedule (employee_id, schedule_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='预约记录表';

CREATE TABLE boarding_records (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    reservation_id BIGINT UNSIGNED NOT NULL COMMENT '预约记录ID',
    employee_id BIGINT UNSIGNED NOT NULL COMMENT '员工ID',
    schedule_id BIGINT UNSIGNED NOT NULL COMMENT '班次ID',
    station_id BIGINT UNSIGNED NOT NULL COMMENT '核验站点ID',
    verify_token VARCHAR(128) NOT NULL DEFAULT '' COMMENT '核验令牌(防代乘)',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '1-成功 2-失败(站点不符) 3-失败(令牌无效) 4-失败(已核验)',
    verified_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '核验时间',
    PRIMARY KEY (id),
    KEY idx_reservation (reservation_id),
    KEY idx_schedule (schedule_id),
    KEY idx_verified_at (verified_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='上车核验记录表';

CREATE TABLE capacity_alerts (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    schedule_id BIGINT UNSIGNED NOT NULL COMMENT '班次ID',
    segment_index INT NOT NULL COMMENT '段序号',
    occupancy_rate DECIMAL(5,2) NOT NULL COMMENT '满载率(%)',
    alert_level TINYINT NOT NULL COMMENT '1-预警(>=80%) 2-满载(>=100%)',
    is_handled TINYINT NOT NULL DEFAULT 0 COMMENT '0-未处理 1-已处理',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_schedule (schedule_id),
    KEY idx_is_handled (is_handled),
    KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='满载预警表';

CREATE TABLE optimization_suggestions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    type TINYINT NOT NULL COMMENT '1-线路调整 2-新增班次 3-减少班次 4-新增站点',
    title VARCHAR(200) NOT NULL COMMENT '建议标题',
    description TEXT COMMENT '建议描述',
    suggestion_data JSON COMMENT '建议详情数据',
    status TINYINT NOT NULL DEFAULT 0 COMMENT '0-待审核 1-已采纳 2-已拒绝',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_status (status),
    KEY idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='优化建议表';

INSERT INTO stations (name, address, latitude, longitude) VALUES
('公司总部', '科技园区A座', 31.2304000, 121.4737000),
('地铁北苑站', '北苑路88号', 31.2527000, 121.4591000),
('地铁望京站', '望京西路12号', 31.2387000, 121.4796000),
('地铁大望路站', '大望路66号', 31.2240000, 121.4580000),
('地铁国贸站', '建国门外大街1号', 31.2156000, 121.4512000),
('地铁西二旗站', '西二旗大街38号', 31.2700000, 121.4850000),
('地铁上地站', '上地十街10号', 31.2620000, 121.4780000),
('地铁天通苑站', '天通苑北苑2区', 31.2820000, 121.4620000);

INSERT INTO routes (name, direction, total_distance, status) VALUES
('北部通勤线', 1, 18.50, 1),
('南部通勤线', 1, 15.20, 1),
('北部通勤线', 2, 18.50, 1);

INSERT INTO route_stations (route_id, station_id, sequence, estimated_minutes) VALUES
(1, 8, 1, 0),
(1, 2, 2, 12),
(1, 6, 3, 22),
(1, 7, 4, 30),
(1, 1, 5, 42),
(2, 5, 1, 0),
(2, 4, 2, 10),
(2, 3, 3, 20),
(2, 1, 4, 32),
(3, 1, 1, 0),
(3, 7, 2, 12),
(3, 6, 3, 20),
(3, 2, 4, 30),
(3, 8, 5, 42);

INSERT INTO schedules (route_id, date, departure_time, total_seats, status, reservation_deadline) VALUES
(1, '2026-05-30', '07:30:00', 45, 1, '2026-05-29 22:00:00'),
(1, '2026-05-30', '08:00:00', 45, 1, '2026-05-29 22:00:00'),
(2, '2026-05-30', '07:30:00', 45, 1, '2026-05-29 22:00:00'),
(3, '2026-05-30', '18:00:00', 45, 1, '2026-05-30 16:00:00'),
(3, '2026-05-30', '18:30:00', 45, 1, '2026-05-30 16:00:00');

INSERT INTO schedule_segments (schedule_id, segment_index, from_station_id, to_station_id, available_seats) VALUES
(1, 0, 8, 2, 45),
(1, 1, 2, 6, 45),
(1, 2, 6, 7, 45),
(1, 3, 7, 1, 45),
(2, 0, 8, 2, 45),
(2, 1, 2, 6, 45),
(2, 2, 6, 7, 45),
(2, 3, 7, 1, 45),
(3, 0, 5, 4, 45),
(3, 1, 4, 3, 45),
(3, 2, 3, 1, 45),
(4, 0, 1, 7, 45),
(4, 1, 7, 6, 45),
(4, 2, 6, 2, 45),
(4, 3, 2, 8, 45),
(5, 0, 1, 7, 45),
(5, 1, 7, 6, 45),
(5, 2, 6, 2, 45),
(5, 3, 2, 8, 45);

INSERT INTO employees (name, employee_no, department, phone) VALUES
('张三', 'EMP001', '研发部', '13800000001'),
('李四', 'EMP002', '研发部', '13800000002'),
('王五', 'EMP003', '产品部', '13800000003'),
('赵六', 'EMP004', '设计部', '13800000004'),
('钱七', 'EMP005', '市场部', '13800000005'),
('孙八', 'EMP006', '研发部', '13800000006'),
('周九', 'EMP007', '行政部', '13800000007'),
('吴十', 'EMP008', '财务部', '13800000008');
