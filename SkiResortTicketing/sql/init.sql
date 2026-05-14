-- ============================================================
-- 滑雪场票务与雪具租赁系统 - 数据库初始化脚本
-- 数据库: ski_resort_ticketing
-- ============================================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS ski_resort_ticketing DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ski_resort_ticketing;

-- ============================================================
-- 1. 管理员表
-- ============================================================
DROP TABLE IF EXISTS sys_user;
CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    role VARCHAR(20) NOT NULL DEFAULT 'admin' COMMENT '角色: admin-管理员, staff-员工',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-启用, 0-禁用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';

-- ============================================================
-- 2. 票种表
-- ============================================================
DROP TABLE IF EXISTS ticket_type;
CREATE TABLE ticket_type (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '票种ID',
    name VARCHAR(100) NOT NULL COMMENT '票种名称',
    type VARCHAR(20) NOT NULL COMMENT '类型: half_day-半日, full_day-全日, night-夜场',
    price DECIMAL(10,2) NOT NULL COMMENT '票价',
    valid_time VARCHAR(100) COMMENT '有效时间段',
    description TEXT COMMENT '描述',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-在售, 0-下架',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='票种表';

-- ============================================================
-- 3. 客户订单表
-- ============================================================
DROP TABLE IF EXISTS customer_order;
CREATE TABLE customer_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '订单ID',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '订单编号',
    customer_name VARCHAR(50) COMMENT '客户姓名',
    id_card VARCHAR(50) COMMENT '身份证号',
    phone VARCHAR(20) COMMENT '联系电话',
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '订单总金额',
    paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '已付金额',
    deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '押金总额',
    status TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0-待支付, 1-已支付, 2-已入园, 3-已归还, 4-已取消, 5-已退款',
    remark TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_order_no (order_no),
    INDEX idx_customer (id_card),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客户订单表';

-- ============================================================
-- 4. 订单票种明细表
-- ============================================================
DROP TABLE IF EXISTS order_ticket;
CREATE TABLE order_ticket (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    order_id BIGINT NOT NULL COMMENT '订单ID',
    ticket_type_id BIGINT NOT NULL COMMENT '票种ID',
    ticket_qr_code VARCHAR(100) COMMENT '门票二维码',
    price DECIMAL(10,2) NOT NULL COMMENT '单价',
    quantity INT NOT NULL DEFAULT 1 COMMENT '数量',
    total_price DECIMAL(10,2) NOT NULL COMMENT '小计',
    enter_time DATETIME COMMENT '入园时间',
    gate_no VARCHAR(20) COMMENT '入园闸机号',
    status TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0-未使用, 1-已使用, 2-已退款',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_order_id (order_id),
    INDEX idx_qr_code (ticket_qr_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单票种明细表';

-- ============================================================
-- 5. 雪具类型表
-- ============================================================
DROP TABLE IF EXISTS equipment_type;
CREATE TABLE equipment_type (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '类型ID',
    name VARCHAR(50) NOT NULL COMMENT '类型名称: 雪板, 雪鞋, 头盔, 雪杖, 护目镜, 护具',
    code VARCHAR(20) NOT NULL UNIQUE COMMENT '类型编码',
    deposit DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '押金',
    rental_price DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '租赁单价',
    description VARCHAR(255) COMMENT '描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='雪具类型表';

-- ============================================================
-- 6. 雪具库存表
-- ============================================================
DROP TABLE IF EXISTS equipment_stock;
CREATE TABLE equipment_stock (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '雪具ID',
    equipment_type_id BIGINT NOT NULL COMMENT '雪具类型ID',
    equipment_no VARCHAR(50) NOT NULL UNIQUE COMMENT '雪具编号',
    specification VARCHAR(100) COMMENT '规格/尺码',
    status TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0-在库, 1-已借出, 2-维修中, 3-报废',
    remark VARCHAR(255) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_type (equipment_type_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='雪具库存表';

-- ============================================================
-- 7. 雪具租赁记录表
-- ============================================================
DROP TABLE IF EXISTS equipment_rental;
CREATE TABLE equipment_rental (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '租赁ID',
    order_id BIGINT NOT NULL COMMENT '订单ID',
    equipment_stock_id BIGINT NOT NULL COMMENT '雪具库存ID',
    equipment_type_id BIGINT NOT NULL COMMENT '雪具类型ID',
    deposit DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '押金',
    rental_price DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '租赁单价',
    rental_duration INT COMMENT '租赁时长(小时)',
    rental_amount DECIMAL(10,2) DEFAULT 0 COMMENT '租赁费用',
    rent_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '借出时间',
    return_time DATETIME COMMENT '归还时间',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-租赁中, 2-已归还, 3-损坏/遗失',
    rent_operator BIGINT COMMENT '借出操作员ID',
    return_operator BIGINT COMMENT '归还操作员ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_order_id (order_id),
    INDEX idx_equipment (equipment_stock_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='雪具租赁记录表';

-- ============================================================
-- 8. 教练信息表
-- ============================================================
DROP TABLE IF EXISTS coach;
CREATE TABLE coach (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '教练ID',
    name VARCHAR(50) NOT NULL COMMENT '教练姓名',
    gender TINYINT COMMENT '性别: 1-男, 2-女',
    phone VARCHAR(20) COMMENT '联系电话',
    level VARCHAR(20) COMMENT '等级: 初级, 中级, 高级, 国家级',
    hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '时薪',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-在岗, 0-休假, 2-离职',
    photo VARCHAR(255) COMMENT '照片',
    description TEXT COMMENT '简介',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='教练信息表';

-- ============================================================
-- 9. 教练预约时间表
-- ============================================================
DROP TABLE IF EXISTS coach_schedule;
CREATE TABLE coach_schedule (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    coach_id BIGINT NOT NULL COMMENT '教练ID',
    schedule_date DATE NOT NULL COMMENT '日期',
    time_slot VARCHAR(20) NOT NULL COMMENT '时间段: 08:00-10:00, 10:00-12:00 等',
    status TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0-可预约, 1-已预约, 2-不可预约',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_coach_date (coach_id, schedule_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='教练预约时间表';

-- ============================================================
-- 10. 教练预约订单表
-- ============================================================
DROP TABLE IF EXISTS coach_booking;
CREATE TABLE coach_booking (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '预约ID',
    order_id BIGINT NOT NULL COMMENT '订单ID',
    coach_id BIGINT NOT NULL COMMENT '教练ID',
    coach_schedule_id BIGINT NOT NULL COMMENT '教练时间ID',
    booking_date DATE NOT NULL COMMENT '预约日期',
    time_slot VARCHAR(20) NOT NULL COMMENT '时间段',
    hours INT NOT NULL DEFAULT 1 COMMENT '预约时长(小时)',
    price DECIMAL(10,2) NOT NULL COMMENT '费用',
    status TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0-待确认, 1-已确认, 2-进行中, 3-已完成, 4-已取消',
    student_name VARCHAR(50) COMMENT '学员姓名',
    student_level VARCHAR(20) COMMENT '学员水平: 零基础, 初级, 中级, 高级',
    remark TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_order_id (order_id),
    INDEX idx_coach_id (coach_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='教练预约订单表';

-- ============================================================
-- 11. 储物柜区域表
-- ============================================================
DROP TABLE IF EXISTS locker_area;
CREATE TABLE locker_area (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '区域ID',
    name VARCHAR(50) NOT NULL COMMENT '区域名称: A区, B区 等',
    location VARCHAR(255) COMMENT '位置描述',
    total_count INT NOT NULL DEFAULT 0 COMMENT '储物柜总数',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='储物柜区域表';

-- ============================================================
-- 12. 储物柜表
-- ============================================================
DROP TABLE IF EXISTS locker;
CREATE TABLE locker (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '储物柜ID',
    area_id BIGINT NOT NULL COMMENT '区域ID',
    locker_no VARCHAR(20) NOT NULL UNIQUE COMMENT '柜号',
    size VARCHAR(20) COMMENT '尺寸: 小号, 中号, 大号',
    status TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0-空闲, 1-已占用, 2-维护中',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_area (area_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='储物柜表';

-- ============================================================
-- 13. 储物柜使用记录表
-- ============================================================
DROP TABLE IF EXISTS locker_usage;
CREATE TABLE locker_usage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '使用ID',
    order_id BIGINT COMMENT '订单ID',
    locker_id BIGINT NOT NULL COMMENT '储物柜ID',
    customer_name VARCHAR(50) COMMENT '使用人',
    phone VARCHAR(20) COMMENT '联系电话',
    password VARCHAR(50) COMMENT '开箱密码',
    deposit DECIMAL(10,2) DEFAULT 0 COMMENT '押金',
    rental_price DECIMAL(10,2) DEFAULT 0 COMMENT '租赁费用',
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-使用中, 2-已结束',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_locker (locker_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='储物柜使用记录表';

-- ============================================================
-- 14. 闸机设备表
-- ============================================================
DROP TABLE IF EXISTS gate_device;
CREATE TABLE gate_device (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '设备ID',
    gate_no VARCHAR(20) NOT NULL UNIQUE COMMENT '闸机编号',
    name VARCHAR(50) COMMENT '闸机名称',
    location VARCHAR(255) COMMENT '安装位置',
    type VARCHAR(20) COMMENT '类型: 入口闸机, 出口闸机',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-正常, 0-故障',
    last_heartbeat DATETIME COMMENT '最后心跳时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='闸机设备表';

-- ============================================================
-- 15. 闸机通行记录表
-- ============================================================
DROP TABLE IF EXISTS gate_access_log;
CREATE TABLE gate_access_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
    gate_id BIGINT NOT NULL COMMENT '闸机ID',
    gate_no VARCHAR(20) COMMENT '闸机编号',
    ticket_qr_code VARCHAR(100) COMMENT '门票二维码',
    order_id BIGINT COMMENT '订单ID',
    access_type TINYINT NOT NULL COMMENT '通行类型: 1-入园, 2-出园',
    result TINYINT NOT NULL COMMENT '结果: 1-成功, 0-失败',
    fail_reason VARCHAR(255) COMMENT '失败原因',
    access_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '通行时间',
    INDEX idx_gate_time (gate_id, access_time),
    INDEX idx_qr_code (ticket_qr_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='闸机通行记录表';

-- ============================================================
-- 16. 失物登记表
-- ============================================================
DROP TABLE IF EXISTS lost_and_found;
CREATE TABLE lost_and_found (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    type TINYINT NOT NULL COMMENT '类型: 1-失物登记, 2-招领登记',
    item_name VARCHAR(100) NOT NULL COMMENT '物品名称',
    item_type VARCHAR(50) COMMENT '物品类型: 证件, 电子设备, 衣物, 雪具, 其他',
    description TEXT COMMENT '物品描述',
    location VARCHAR(255) COMMENT '丢失/拾取地点',
    lost_time DATETIME COMMENT '丢失/拾取时间',
    registrant_name VARCHAR(50) COMMENT '登记人姓名',
    registrant_phone VARCHAR(20) COMMENT '登记人电话',
    status TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0-待认领, 1-已认领, 2-已完成',
    claimer_name VARCHAR(50) COMMENT '认领人姓名',
    claimer_phone VARCHAR(20) COMMENT '认领人电话',
    claimer_id_card VARCHAR(50) COMMENT '认领人身份证',
    claim_time DATETIME COMMENT '认领时间',
    remark TEXT COMMENT '备注',
    photo VARCHAR(255) COMMENT '物品照片',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_type (type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='失物招领表';

-- ============================================================
-- 17. 支付记录表
-- ============================================================
DROP TABLE IF EXISTS payment_record;
CREATE TABLE payment_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '支付ID',
    order_id BIGINT NOT NULL COMMENT '订单ID',
    payment_no VARCHAR(50) NOT NULL UNIQUE COMMENT '支付流水号',
    payment_type VARCHAR(20) COMMENT '支付方式: 现金, 微信, 支付宝, 银行卡',
    payment_type_detail VARCHAR(20) COMMENT '支付类型: ticket-门票, deposit-押金, coach-教练, locker-储物柜',
    amount DECIMAL(10,2) NOT NULL COMMENT '支付金额',
    status TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0-待支付, 1-已支付, 2-已退款',
    refund_time DATETIME COMMENT '退款时间',
    refund_amount DECIMAL(10,2) DEFAULT 0 COMMENT '退款金额',
    operator_id BIGINT COMMENT '操作员ID',
    remark VARCHAR(255) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_order_id (order_id),
    INDEX idx_payment_no (payment_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='支付记录表';

-- ============================================================
-- 初始化数据
-- ============================================================

-- 初始化管理员账号: admin / 123456
INSERT INTO sys_user (username, password, real_name, phone, role, status) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '系统管理员', '13800000000', 'admin', 1),
('staff01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '前台员工01', '13800000001', 'staff', 1),
('staff02', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '租赁部员工', '13800000002', 'staff', 1);

-- 初始化票种数据
INSERT INTO ticket_type (name, type, price, valid_time, description, status) VALUES
('周末半日票', 'half_day', 158.00, '周末 08:00-12:00 或 13:00-17:00', '周末上午或下午使用，任选一个时段', 1),
('平日全日票', 'full_day', 288.00, '周一至周五 08:00-17:00', '工作日全天使用', 1),
('周末全日票', 'full_day', 388.00, '周六周日 08:00-17:00', '周末全天使用', 1),
('节日全日票', 'full_day', 488.00, '节假日 08:00-17:00', '法定节假日全天使用', 1),
('夜场票', 'night', 98.00, '18:00-22:00', '夜场滑雪票', 1);

-- 初始化雪具类型
INSERT INTO equipment_type (name, code, deposit, rental_price, description) VALUES
('双板滑雪板', 'SKI_BOARD', 500.00, 80.00, '双板套装含固定器'),
('单板滑雪板', 'SNOWBOARD', 500.00, 100.00, '单板含固定器'),
('滑雪鞋', 'SKI_BOOTS', 200.00, 40.00, '专业滑雪鞋'),
('头盔', 'HELMET', 100.00, 20.00, '滑雪头盔'),
('雪杖', 'SKI_POLES', 50.00, 10.00, '滑雪杖'),
('护目镜', 'GOGGLES', 100.00, 30.00, '滑雪护目镜'),
('护具套装', 'PROTECTION', 150.00, 40.00, '护膝护肘护臀套装'),
('滑雪服', 'SKI_JACKET', 300.00, 60.00, '专业滑雪服套装');

-- 初始化雪具库存（示例数据）
INSERT INTO equipment_stock (equipment_type_id, equipment_no, specification, status) VALUES
(1, 'SB001', '160cm', 0),
(1, 'SB002', '165cm', 0),
(1, 'SB003', '170cm', 0),
(1, 'SB004', '175cm', 0),
(2, 'SN001', '155cm', 0),
(2, 'SN002', '160cm', 0),
(2, 'SN003', '150cm', 0),
(3, 'BT001', '38码', 0),
(3, 'BT002', '40码', 0),
(3, 'BT003', '42码', 0),
(3, 'BT004', '44码', 0),
(4, 'HM001', 'M码', 0),
(4, 'HM002', 'L码', 0),
(5, 'PL001', '标准', 0),
(5, 'PL002', '标准', 0),
(6, 'GG001', '标准', 0),
(7, 'PR001', 'M码', 0),
(7, 'PR002', 'L码', 0),
(8, 'SJ001', 'M码', 0),
(8, 'SJ002', 'L码', 0);

-- 初始化教练数据
INSERT INTO coach (name, gender, phone, level, hourly_rate, status, description) VALUES
('张伟', 1, '13900000001', '国家级', 500.00, 1, '国家队退役运动员，15年滑雪教学经验，擅长双板滑行技巧指导'),
('李娜', 2, '13900000002', '高级', 400.00, 1, '全国冠军，单板自由式专家，教学风格活泼有趣'),
('王强', 1, '13900000003', '高级', 380.00, 1, '10年教学经验，尤其擅长零基础学员入门指导'),
('刘洋', 1, '13900000004', '中级', 280.00, 1, '认证滑雪教练，耐心细致，适合初学者'),
('陈静', 2, '13900000005', '中级', 280.00, 1, '温柔女教练，特别适合儿童和女性学员'),
('赵鹏', 1, '13900000006', '初级', 200.00, 1, '新晋教练，精力充沛，性价比首选');

-- 初始化储物柜区域
INSERT INTO locker_area (name, location, total_count) VALUES
('A区', '一楼大厅左侧', 50),
('B区', '一楼大厅右侧', 50),
('C区', '二楼租赁区旁', 30);

-- 初始化储物柜（示例数据）
INSERT INTO locker (area_id, locker_no, size, status) VALUES
(1, 'A001', '小号', 0),
(1, 'A002', '小号', 0),
(1, 'A003', '中号', 0),
(1, 'A004', '中号', 0),
(1, 'A005', '大号', 0),
(2, 'B001', '小号', 0),
(2, 'B002', '中号', 0),
(2, 'B003', '大号', 0),
(3, 'C001', '大号', 0),
(3, 'C002', '大号', 0);

-- 初始化闸机设备
INSERT INTO gate_device (gate_no, name, location, type, status) VALUES
('G001', '主入口1号闸机', '滑雪场主入口左侧', '入口闸机', 1),
('G002', '主入口2号闸机', '滑雪场主入口右侧', '入口闸机', 1),
('G003', 'VIP入口闸机', 'VIP通道入口', '入口闸机', 1),
('G004', '出口1号闸机', '滑雪场出口左侧', '出口闸机', 1),
('G005', '出口2号闸机', '滑雪场出口右侧', '出口闸机', 1);

-- ============================================================
-- 数据库初始化完成
-- ============================================================
