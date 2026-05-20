-- 创建数据库
CREATE DATABASE IF NOT EXISTS travel_planning DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE travel_planning;

-- 行程表
CREATE TABLE IF NOT EXISTS trip (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '行程ID',
    name VARCHAR(200) NOT NULL COMMENT '行程名称',
    description TEXT COMMENT '行程描述',
    start_date DATE NOT NULL COMMENT '开始日期',
    end_date DATE NOT NULL COMMENT '结束日期',
    destination VARCHAR(200) NOT NULL COMMENT '目的地',
    total_budget DECIMAL(10,2) DEFAULT 0.00 COMMENT '总预算',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='行程表';

-- 每日行程表
CREATE TABLE IF NOT EXISTS daily_schedule (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '每日行程ID',
    trip_id BIGINT NOT NULL COMMENT '行程ID',
    day_number INT NOT NULL COMMENT '第几天',
    date DATE NOT NULL COMMENT '日期',
    description TEXT COMMENT '当日描述',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (trip_id) REFERENCES trip(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='每日行程表';

-- 景点表
CREATE TABLE IF NOT EXISTS attraction (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '景点ID',
    daily_schedule_id BIGINT NOT NULL COMMENT '每日行程ID',
    name VARCHAR(200) NOT NULL COMMENT '景点名称',
    description TEXT COMMENT '景点描述',
    address VARCHAR(500) COMMENT '地址',
    longitude DECIMAL(10,7) COMMENT '经度',
    latitude DECIMAL(10,7) COMMENT '纬度',
    visit_time TIME COMMENT '预计参观时间',
    duration INT COMMENT '预计停留时长(分钟)',
    cost DECIMAL(10,2) DEFAULT 0.00 COMMENT '费用',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (daily_schedule_id) REFERENCES daily_schedule(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='景点表';

-- 酒店表
CREATE TABLE IF NOT EXISTS hotel (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '酒店ID',
    trip_id BIGINT NOT NULL COMMENT '行程ID',
    name VARCHAR(200) NOT NULL COMMENT '酒店名称',
    address VARCHAR(500) COMMENT '酒店地址',
    longitude DECIMAL(10,7) COMMENT '经度',
    latitude DECIMAL(10,7) COMMENT '纬度',
    check_in_date DATE NOT NULL COMMENT '入住日期',
    check_out_date DATE NOT NULL COMMENT '退房日期',
    price_per_night DECIMAL(10,2) DEFAULT 0.00 COMMENT '每晚价格',
    total_price DECIMAL(10,2) DEFAULT 0.00 COMMENT '总价格',
    phone VARCHAR(50) COMMENT '联系电话',
    remark TEXT COMMENT '备注',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (trip_id) REFERENCES trip(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='酒店表';

-- 预算表
CREATE TABLE IF NOT EXISTS budget (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '预算ID',
    trip_id BIGINT NOT NULL COMMENT '行程ID',
    category VARCHAR(100) NOT NULL COMMENT '预算类别',
    item_name VARCHAR(200) NOT NULL COMMENT '项目名称',
    estimated_amount DECIMAL(10,2) DEFAULT 0.00 COMMENT '预算金额',
    actual_amount DECIMAL(10,2) DEFAULT 0.00 COMMENT '实际金额',
    remark TEXT COMMENT '备注',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (trip_id) REFERENCES trip(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预算表';

-- 物品清单表
CREATE TABLE IF NOT EXISTS packing_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '物品ID',
    trip_id BIGINT NOT NULL COMMENT '行程ID',
    name VARCHAR(200) NOT NULL COMMENT '物品名称',
    category VARCHAR(100) COMMENT '类别',
    quantity INT DEFAULT 1 COMMENT '数量',
    is_packed TINYINT DEFAULT 0 COMMENT '是否已打包',
    remark TEXT COMMENT '备注',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (trip_id) REFERENCES trip(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物品清单表';

-- 插入测试数据
INSERT INTO trip (name, description, start_date, end_date, destination, total_budget) VALUES
('云南七日游', '云南昆明-大理-丽江七日自由行', '2024-07-01', '2024-07-07', '云南', 5000.00);

INSERT INTO daily_schedule (trip_id, day_number, date, description) VALUES
(1, 1, '2024-07-01', '抵达昆明，游览滇池'),
(1, 2, '2024-07-02', '昆明到大理，游览洱海'),
(1, 3, '2024-07-03', '大理古城一日游'),
(1, 4, '2024-07-04', '大理到丽江，游览丽江古城'),
(1, 5, '2024-07-05', '玉龙雪山一日游'),
(1, 6, '2024-07-06', '泸沽湖一日游'),
(1, 7, '2024-07-07', '返程');

INSERT INTO attraction (daily_schedule_id, name, description, address, longitude, latitude, visit_time, duration, cost, sort_order) VALUES
(1, '滇池', '昆明滇池风景区', '云南省昆明市西山区滇池路', 102.6375, 24.9567, '09:00:00', 180, 0.00, 1),
(1, '云南民族村', '展示云南25个少数民族风情', '云南省昆明市西山区滇池路1310号', 102.6350, 24.9480, '13:00:00', 180, 90.00, 2),
(2, '洱海', '大理洱海风景区', '云南省大理白族自治州大理市', 100.1800, 25.6000, '10:00:00', 240, 0.00, 1),
(3, '大理古城', '历史文化名城', '云南省大理白族自治州大理市古城', 100.2330, 25.6980, '09:00:00', 300, 0.00, 1),
(4, '丽江古城', '世界文化遗产', '云南省丽江市古城区', 100.2330, 26.8720, '10:00:00', 300, 0.00, 1),
(5, '玉龙雪山', '纳西族神山', '云南省丽江市玉龙纳西族自治县', 100.2220, 27.1020, '08:00:00', 480, 360.00, 1);

INSERT INTO hotel (trip_id, name, address, longitude, latitude, check_in_date, check_out_date, price_per_night, total_price, phone) VALUES
(1, '昆明洲际酒店', '云南省昆明市西山区滇池路', 102.6400, 24.9500, '2024-07-01', '2024-07-02', 680.00, 680.00, '0871-12345678'),
(1, '大理海景酒店', '云南省大理市洱海边', 100.1800, 25.6000, '2024-07-02', '2024-07-04', 580.00, 1160.00, '0872-87654321'),
(1, '丽江古城客栈', '云南省丽江市古城区', 100.2330, 26.8720, '2024-07-04', '2024-07-07', 480.00, 1440.00, '0888-11112222');

INSERT INTO budget (trip_id, category, item_name, estimated_amount, actual_amount, remark) VALUES
(1, '交通', '机票', 2000.00, 0.00, '往返机票'),
(1, '住宿', '酒店', 3280.00, 0.00, '7晚住宿'),
(1, '餐饮', '餐饮', 1400.00, 0.00, '每日200'),
(1, '门票', '景点门票', 500.00, 0.00, ''),
(1, '其他', '购物', 1000.00, 0.00, '纪念品等');

INSERT INTO packing_item (trip_id, name, category, quantity, is_packed, remark) VALUES
(1, '身份证', '证件', 1, 0, ''),
(1, '充电宝', '电子设备', 2, 0, ''),
(1, '防晒霜', '护肤', 1, 0, 'SPF50'),
(1, '外套', '衣物', 2, 0, '玉龙雪山需要'),
(1, '常用药品', '药品', 1, 0, '感冒药、肠胃药');
