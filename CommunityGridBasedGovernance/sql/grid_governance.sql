-- 创建数据库
CREATE DATABASE IF NOT EXISTS grid_governance DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE grid_governance;

-- 用户表
DROP TABLE IF EXISTS sys_user;
CREATE TABLE sys_user (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    username VARCHAR(50) NOT NULL COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    phone VARCHAR(20) NOT NULL COMMENT '手机号',
    role_type VARCHAR(20) NOT NULL COMMENT '角色类型: RESIDENT-居民, GRID_WORKER-网格员, ADMIN-管理员',
    grid_id BIGINT DEFAULT NULL COMMENT '所属网格ID(网格员专属)',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-启用, 0-禁用',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_username (username),
    KEY idx_grid_id (grid_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 网格信息表
DROP TABLE IF EXISTS grid_info;
CREATE TABLE grid_info (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    grid_code VARCHAR(50) NOT NULL COMMENT '网格编号',
    grid_name VARCHAR(100) NOT NULL COMMENT '网格名称',
    area_name VARCHAR(100) NOT NULL COMMENT '所属区域名称',
    lng_min DECIMAL(11,8) NOT NULL COMMENT '最小经度',
    lng_max DECIMAL(11,8) NOT NULL COMMENT '最大经度',
    lat_min DECIMAL(10,8) NOT NULL COMMENT '最小纬度',
    lat_max DECIMAL(10,8) NOT NULL COMMENT '最大纬度',
    center_lng DECIMAL(11,8) NOT NULL COMMENT '中心经度',
    center_lat DECIMAL(10,8) NOT NULL COMMENT '中心纬度',
    description VARCHAR(500) DEFAULT NULL COMMENT '网格描述',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-启用, 0-禁用',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_grid_code (grid_code),
    KEY idx_area_name (area_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='网格信息表';

-- 工单表
DROP TABLE IF EXISTS work_order;
CREATE TABLE work_order (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    order_no VARCHAR(32) NOT NULL COMMENT '工单编号',
    title VARCHAR(200) NOT NULL COMMENT '工单标题',
    description TEXT NOT NULL COMMENT '问题描述',
    order_type VARCHAR(30) NOT NULL COMMENT '工单类型: TRASH-垃圾, ILLEGAL_BUILD-违建, FACILITY_DAMAGE-设施损坏, OTHER-其他',
    level VARCHAR(20) NOT NULL DEFAULT 'NORMAL' COMMENT '紧急程度: LOW-低, NORMAL-中, HIGH-高, URGENT-紧急',
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' COMMENT '工单状态: PENDING-待派单, ASSIGNED-已派单, PROCESSING-处理中, ESCALATED-已升级, COMPLETED-已完成, EVALUATED-已评价, CLOSED-已关闭',
    reporter_id BIGINT NOT NULL COMMENT '上报人ID',
    reporter_name VARCHAR(50) NOT NULL COMMENT '上报人姓名',
    reporter_phone VARCHAR(20) NOT NULL COMMENT '上报人电话',
    grid_id BIGINT DEFAULT NULL COMMENT '所属网格ID',
    grid_worker_id BIGINT DEFAULT NULL COMMENT '处理网格员ID',
    grid_worker_name VARCHAR(50) DEFAULT NULL COMMENT '处理网格员姓名',
    lng DECIMAL(11,8) NOT NULL COMMENT '位置经度',
    lat DECIMAL(10,8) NOT NULL COMMENT '位置纬度',
    address VARCHAR(300) NOT NULL COMMENT '详细地址',
    before_images TEXT COMMENT '问题图片(JSON数组)',
    after_images TEXT COMMENT '处理后图片(JSON数组)',
    process_result TEXT COMMENT '处理结果描述',
    assign_time DATETIME DEFAULT NULL COMMENT '派单时间',
    process_start_time DATETIME DEFAULT NULL COMMENT '开始处理时间',
    complete_time DATETIME DEFAULT NULL COMMENT '完成时间',
    expect_complete_time DATETIME DEFAULT NULL COMMENT '预计完成时间',
    escalation_count INT NOT NULL DEFAULT 0 COMMENT '升级次数',
    last_escalation_time DATETIME DEFAULT NULL COMMENT '最后升级时间',
    is_overdue TINYINT NOT NULL DEFAULT 0 COMMENT '是否逾期: 0-否, 1-是',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_order_no (order_no),
    KEY idx_status (status),
    KEY idx_grid_id (grid_id),
    KEY idx_worker_id (grid_worker_id),
    KEY idx_reporter_id (reporter_id),
    KEY idx_create_time (create_time),
    KEY idx_order_type (order_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单表';

-- 工单处理日志表
DROP TABLE IF EXISTS work_order_log;
CREATE TABLE work_order_log (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    operator_id BIGINT NOT NULL COMMENT '操作人ID',
    operator_name VARCHAR(50) NOT NULL COMMENT '操作人姓名',
    operation_type VARCHAR(50) NOT NULL COMMENT '操作类型: CREATE-创建, ASSIGN-派单, ACCEPT-接单, PROCESS-处理, ESCALATE-升级, COMPLETE-完成, EVALUATE-评价, CLOSE-关闭',
    before_status VARCHAR(30) DEFAULT NULL COMMENT '操作前状态',
    after_status VARCHAR(30) DEFAULT NULL COMMENT '操作后状态',
    remark TEXT COMMENT '操作备注',
    images TEXT COMMENT '处理图片(JSON数组)',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id),
    KEY idx_order_id (order_id),
    KEY idx_operation_type (operation_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单处理日志表';

-- 工单评价表
DROP TABLE IF EXISTS work_order_evaluation;
CREATE TABLE work_order_evaluation (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    reporter_id BIGINT NOT NULL COMMENT '评价人ID',
    overall_score INT NOT NULL COMMENT '总体评分(1-5星)',
    response_speed_score INT NOT NULL COMMENT '响应速度评分(1-5星)',
    process_quality_score INT NOT NULL COMMENT '处理质量评分(1-5星)',
    service_attitude_score INT NOT NULL COMMENT '服务态度评分(1-5星)',
    content TEXT COMMENT '评价内容',
    is_satisfied TINYINT NOT NULL COMMENT '是否满意: 0-不满意, 1-满意',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_order_id (order_id),
    KEY idx_reporter_id (reporter_id),
    KEY idx_overall_score (overall_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单评价表';

-- 热点分析表
DROP TABLE IF EXISTS work_order_hotspot;
CREATE TABLE work_order_hotspot (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    grid_id BIGINT NOT NULL COMMENT '网格ID',
    grid_name VARCHAR(100) NOT NULL COMMENT '网格名称',
    area_name VARCHAR(100) NOT NULL COMMENT '区域名称',
    order_type VARCHAR(30) NOT NULL COMMENT '工单类型',
    total_count INT NOT NULL DEFAULT 0 COMMENT '工单总数',
    pending_count INT NOT NULL DEFAULT 0 COMMENT '待处理数',
    processing_count INT NOT NULL DEFAULT 0 COMMENT '处理中数',
    completed_count INT NOT NULL DEFAULT 0 COMMENT '已完成数',
    overdue_count INT NOT NULL DEFAULT 0 COMMENT '逾期数',
    avg_process_hours DECIMAL(10,2) DEFAULT NULL COMMENT '平均处理时长(小时)',
    avg_score DECIMAL(4,2) DEFAULT NULL COMMENT '平均评分',
    stat_date DATE NOT NULL COMMENT '统计日期',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    KEY idx_grid_stat (grid_id, stat_date),
    KEY idx_area_stat (area_name, stat_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='热点分析表';

-- 初始化数据
-- 插入网格数据
INSERT INTO grid_info (grid_code, grid_name, area_name, lng_min, lng_max, lat_min, lat_max, center_lng, center_lat, description) VALUES
('GRID001', '阳光社区第一网格', '阳光社区', 116.30000000, 116.32000000, 39.90000000, 39.92000000, 116.31000000, 39.91000000, '涵盖阳光小区1-10号楼'),
('GRID002', '阳光社区第二网格', '阳光社区', 116.32000000, 116.34000000, 39.90000000, 39.92000000, 116.33000000, 39.91000000, '涵盖阳光小区11-20号楼'),
('GRID003', '幸福社区第一网格', '幸福社区', 116.34000000, 116.36000000, 39.90000000, 39.92000000, 116.35000000, 39.91000000, '涵盖幸福花园1-8号楼'),
('GRID004', '幸福社区第二网格', '幸福社区', 116.36000000, 116.38000000, 39.90000000, 39.92000000, 116.37000000, 39.91000000, '涵盖幸福花园9-16号楼'),
('GRID005', '和平社区网格', '和平社区', 116.30000000, 116.34000000, 39.88000000, 39.90000000, 116.32000000, 39.89000000, '涵盖和平里全部区域');

-- 插入用户数据
INSERT INTO sys_user (username, password, real_name, phone, role_type, grid_id, status) VALUES
('admin', '123456', '系统管理员', '13800000000', 'ADMIN', NULL, 1),
('resident1', '123456', '张三', '13800000001', 'RESIDENT', NULL, 1),
('resident2', '123456', '李四', '13800000002', 'RESIDENT', NULL, 1),
('resident3', '123456', '王五', '13800000003', 'RESIDENT', NULL, 1),
('worker1', '123456', '网格员小张', '13900000001', 'GRID_WORKER', 1, 1),
('worker2', '123456', '网格员小李', '13900000002', 'GRID_WORKER', 2, 1),
('worker3', '123456', '网格员小王', '13900000003', 'GRID_WORKER', 3, 1),
('worker4', '123456', '网格员小赵', '13900000004', 'GRID_WORKER', 4, 1),
('worker5', '123456', '网格员小刘', '13900000005', 'GRID_WORKER', 5, 1);
