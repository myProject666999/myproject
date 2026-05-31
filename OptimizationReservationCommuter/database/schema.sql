CREATE DATABASE IF NOT EXISTS shuttle_booking DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE shuttle_booking;

CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_no VARCHAR(50) UNIQUE NOT NULL COMMENT '工号',
    name VARCHAR(100) NOT NULL COMMENT '姓名',
    department VARCHAR(100) COMMENT '部门',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    face_feature TEXT COMMENT '人脸特征数据(防代乘)',
    qr_secret VARCHAR(255) COMMENT '二维码密钥',
    status TINYINT DEFAULT 1 COMMENT '1:在职 0:离职',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_employee_no (employee_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='员工表';

CREATE TABLE stations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '站点名称',
    address VARCHAR(255) COMMENT '站点地址',
    longitude DECIMAL(10, 7) COMMENT '经度',
    latitude DECIMAL(10, 7) COMMENT '纬度',
    description VARCHAR(500) COMMENT '站点描述',
    status TINYINT DEFAULT 1 COMMENT '1:启用 0:停用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='站点表';

CREATE TABLE routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_no VARCHAR(50) UNIQUE NOT NULL COMMENT '线路编号',
    name VARCHAR(100) NOT NULL COMMENT '线路名称',
    direction TINYINT NOT NULL COMMENT '1:上班 2:下班',
    description VARCHAR(500) COMMENT '线路描述',
    distance DECIMAL(8, 2) COMMENT '总距离(公里)',
    estimated_time INT COMMENT '预计时长(分钟)',
    status TINYINT DEFAULT 1 COMMENT '1:启用 0:停用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_route_no (route_no),
    INDEX idx_direction (direction)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='线路表';

CREATE TABLE route_stations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_id INT NOT NULL COMMENT '线路ID',
    station_id INT NOT NULL COMMENT '站点ID',
    sequence INT NOT NULL COMMENT '站点顺序',
    arrival_time TIME COMMENT '预计到达时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
    UNIQUE KEY uk_route_station (route_id, station_id),
    INDEX idx_route_sequence (route_id, sequence)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='线路站点关联表';

CREATE TABLE shuttles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plate_no VARCHAR(50) UNIQUE NOT NULL COMMENT '车牌号',
    capacity INT NOT NULL COMMENT '座位数',
    model VARCHAR(100) COMMENT '车型',
    driver_name VARCHAR(50) COMMENT '司机姓名',
    driver_phone VARCHAR(20) COMMENT '司机电话',
    status TINYINT DEFAULT 1 COMMENT '1:可用 0:维修 2:停用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_plate_no (plate_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='车辆表';

CREATE TABLE schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    schedule_no VARCHAR(50) UNIQUE NOT NULL COMMENT '班次编号',
    route_id INT NOT NULL COMMENT '线路ID',
    shuttle_id INT NOT NULL COMMENT '车辆ID',
    departure_date DATE NOT NULL COMMENT '发车日期',
    departure_time TIME NOT NULL COMMENT '发车时间',
    capacity INT NOT NULL COMMENT '总座位数',
    booked_seats INT DEFAULT 0 COMMENT '已预约座位数',
    warning_threshold DECIMAL(5, 2) DEFAULT 0.9 COMMENT '满载预警阈值',
    status TINYINT DEFAULT 1 COMMENT '1:正常 2:满载 3:取消',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (route_id) REFERENCES routes(id),
    FOREIGN KEY (shuttle_id) REFERENCES shuttles(id),
    INDEX idx_schedule_no (schedule_no),
    INDEX idx_route_date (route_id, departure_date),
    INDEX idx_datetime (departure_date, departure_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='班次表';

CREATE TABLE reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reservation_no VARCHAR(50) UNIQUE NOT NULL COMMENT '预约编号',
    employee_id INT NOT NULL COMMENT '员工ID',
    schedule_id INT NOT NULL COMMENT '班次ID',
    board_station_id INT NOT NULL COMMENT '上车站点ID',
    exit_station_id INT COMMENT '下车站点ID',
    seat_no VARCHAR(20) COMMENT '座位号',
    qr_token VARCHAR(255) COMMENT '核验二维码token',
    qr_expire_time DATETIME COMMENT '二维码过期时间',
    is_verified TINYINT DEFAULT 0 COMMENT '0:未核验 1:已核验',
    verify_time DATETIME COMMENT '核验时间',
    verify_station_id INT COMMENT '核验站点',
    status TINYINT DEFAULT 1 COMMENT '1:已预约 2:已改签 3:已取消 4:已完成',
    cancel_reason VARCHAR(500) COMMENT '取消原因',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (schedule_id) REFERENCES schedules(id),
    FOREIGN KEY (board_station_id) REFERENCES stations(id),
    FOREIGN KEY (exit_station_id) REFERENCES stations(id),
    FOREIGN KEY (verify_station_id) REFERENCES stations(id),
    INDEX idx_reservation_no (reservation_no),
    INDEX idx_employee (employee_id),
    INDEX idx_schedule (schedule_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预约表';

CREATE TABLE verify_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reservation_id INT NOT NULL COMMENT '预约ID',
    employee_id INT NOT NULL COMMENT '员工ID',
    schedule_id INT NOT NULL COMMENT '班次ID',
    station_id INT NOT NULL COMMENT '核验站点ID',
    verify_type TINYINT NOT NULL COMMENT '1:扫码 2:人脸',
    verify_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '核验时间',
    verify_result TINYINT NOT NULL COMMENT '1:成功 0:失败',
    fail_reason VARCHAR(500) COMMENT '失败原因',
    device_info VARCHAR(500) COMMENT '设备信息',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (schedule_id) REFERENCES schedules(id),
    FOREIGN KEY (station_id) REFERENCES stations(id),
    INDEX idx_reservation (reservation_id),
    INDEX idx_employee_time (employee_id, verify_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='核验记录表';

CREATE TABLE capacity_warnings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    schedule_id INT NOT NULL COMMENT '班次ID',
    warning_level TINYINT NOT NULL COMMENT '1:黄色预警(80%) 2:红色预警(90%)',
    current_booked INT NOT NULL COMMENT '当前预约数',
    capacity INT NOT NULL COMMENT '总容量',
    warning_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '预警时间',
    is_handled TINYINT DEFAULT 0 COMMENT '0:未处理 1:已处理',
    handle_note VARCHAR(500) COMMENT '处理备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES schedules(id),
    INDEX idx_schedule (schedule_id),
    INDEX idx_warning_time (warning_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='满载预警表';

CREATE TABLE optimization_suggestions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    suggestion_type TINYINT NOT NULL COMMENT '1:新增班次 2:调整线路 3:新增站点',
    title VARCHAR(200) NOT NULL COMMENT '建议标题',
    content TEXT COMMENT '建议详情',
    analysis_data JSON COMMENT '分析数据',
    confidence_score DECIMAL(5, 2) COMMENT '置信度分数',
    status TINYINT DEFAULT 0 COMMENT '0:待审核 1:已采纳 2:已拒绝',
    start_date DATE COMMENT '建议生效日期',
    end_date DATE COMMENT '建议结束日期',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (suggestion_type),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='优化建议表';

CREATE TABLE system_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL COMMENT '配置键',
    config_value TEXT COMMENT '配置值',
    description VARCHAR(500) COMMENT '配置描述',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_config_key (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';

INSERT INTO system_configs (config_key, config_value, description) VALUES
('booking_deadline_minutes', '60', '预约截止时间(发车前分钟数)'),
('rebooking_limit', '1', '每日改签次数限制'),
('capacity_warning_yellow', '0.8', '黄色预警阈值'),
('capacity_warning_red', '0.9', '红色预警阈值'),
('qr_valid_minutes', '30', '二维码有效时长(分钟)');

INSERT INTO stations (name, address, longitude, latitude) VALUES
('市政府站', '市政府东门', 116.397228, 39.907556),
('科技园站', '科技园北门', 116.407228, 39.917556),
('软件园站', '软件园二期东门', 116.417228, 39.927556),
('地铁站A口', '地铁1号线A口', 116.427228, 39.937556),
('商业区站', '中央商业区西口', 116.437228, 39.947556),
('住宅区A站', '阳光花园南门', 116.447228, 39.957556),
('住宅区B站', '幸福里小区北门', 116.457228, 39.967556),
('工业区站', '产业园区西门', 116.467228, 39.977556);

INSERT INTO routes (route_no, name, direction, description, distance, estimated_time) VALUES
('ROUTE001', '市区上班1号线', 1, '市政府-科技园-软件园', 15.50, 45),
('ROUTE002', '市区上班2号线', 1, '地铁站-商业区-工业区', 20.00, 60),
('ROUTE003', '市区下班1号线', 2, '软件园-科技园-市政府', 15.50, 45),
('ROUTE004', '市区下班2号线', 2, '工业区-商业区-地铁站', 20.00, 60);

INSERT INTO route_stations (route_id, station_id, sequence, arrival_time) VALUES
(1, 1, 1, '07:00:00'),
(1, 2, 2, '07:15:00'),
(1, 3, 3, '07:30:00'),
(2, 4, 1, '07:30:00'),
(2, 5, 2, '07:50:00'),
(2, 8, 3, '08:20:00'),
(3, 3, 1, '18:00:00'),
(3, 2, 2, '18:15:00'),
(3, 1, 3, '18:30:00'),
(4, 8, 1, '18:00:00'),
(4, 5, 2, '18:30:00'),
(4, 4, 3, '18:50:00');

INSERT INTO shuttles (plate_no, capacity, model, driver_name, driver_phone) VALUES
('京A12345', 45, '宇通大巴', '张师傅', '13800138001'),
('京A12346', 45, '宇通大巴', '李师傅', '13800138002'),
('京A12347', 30, '金龙中巴', '王师傅', '13800138003'),
('京A12348', 30, '金龙中巴', '赵师傅', '13800138004');

INSERT INTO employees (employee_no, name, department, phone, email) VALUES
('EMP001', '张三', '研发部', '13900139001', 'zhangsan@company.com'),
('EMP002', '李四', '市场部', '13900139002', 'lisi@company.com'),
('EMP003', '王五', '人事部', '13900139003', 'wangwu@company.com'),
('EMP004', '赵六', '财务部', '13900139004', 'zhaoliu@company.com'),
('EMP005', '钱七', '运营部', '13900139005', 'qianqi@company.com');
