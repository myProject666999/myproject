-- 应急物资储备与调拨管理系统数据库脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS emergency_material DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE emergency_material;

-- 1. 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码(加密)',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    role ENUM('admin', 'manager', 'operator', 'viewer') NOT NULL DEFAULT 'viewer' COMMENT '角色',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1启用,0禁用',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 2. 仓库表
CREATE TABLE IF NOT EXISTS warehouses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '仓库ID',
    code VARCHAR(50) NOT NULL UNIQUE COMMENT '仓库编码',
    name VARCHAR(100) NOT NULL COMMENT '仓库名称',
    province VARCHAR(50) COMMENT '省份',
    city VARCHAR(50) COMMENT '城市',
    district VARCHAR(50) COMMENT '区县',
    address VARCHAR(255) COMMENT '详细地址',
    longitude DECIMAL(10, 6) COMMENT '经度',
    latitude DECIMAL(10, 6) COMMENT '纬度',
    manager_id BIGINT COMMENT '管理员ID',
    capacity DECIMAL(15, 2) COMMENT '容量(立方米)',
    used_capacity DECIMAL(15, 2) DEFAULT 0 COMMENT '已用容量',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1启用,0停用',
    remark TEXT COMMENT '备注',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_code (code),
    INDEX idx_city (city),
    INDEX idx_status (status),
    FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='仓库表';

-- 3. 物资分类表
CREATE TABLE IF NOT EXISTS material_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
    code VARCHAR(50) NOT NULL UNIQUE COMMENT '分类编码',
    name VARCHAR(100) NOT NULL COMMENT '分类名称',
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1启用,0禁用',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_code (code),
    INDEX idx_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物资分类表';

-- 4. 物资表
CREATE TABLE IF NOT EXISTS materials (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '物资ID',
    code VARCHAR(50) NOT NULL UNIQUE COMMENT '物资编码',
    name VARCHAR(100) NOT NULL COMMENT '物资名称',
    category_id BIGINT COMMENT '分类ID',
    specification VARCHAR(200) COMMENT '规格型号',
    unit VARCHAR(20) NOT NULL COMMENT '计量单位',
    warning_stock INT DEFAULT 0 COMMENT '预警库存',
    emergency_level ENUM('high', 'medium', 'low') DEFAULT 'medium' COMMENT '应急优先级',
    description TEXT COMMENT '物资描述',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1启用,0禁用',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_code (code),
    INDEX idx_category (category_id),
    INDEX idx_emergency_level (emergency_level),
    FOREIGN KEY (category_id) REFERENCES material_categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物资表';

-- 5. 库存表（批次级库存）
CREATE TABLE IF NOT EXISTS inventory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '库存ID',
    warehouse_id BIGINT NOT NULL COMMENT '仓库ID',
    material_id BIGINT NOT NULL COMMENT '物资ID',
    batch_no VARCHAR(100) NOT NULL COMMENT '批次号',
    quantity INT NOT NULL DEFAULT 0 COMMENT '库存数量',
    locked_quantity INT NOT NULL DEFAULT 0 COMMENT '锁定数量',
    available_quantity INT NOT NULL DEFAULT 0 COMMENT '可用数量',
    unit_price DECIMAL(15, 2) COMMENT '单价',
    production_date DATE COMMENT '生产日期',
    expiry_date DATE COMMENT '有效期至',
    expiry_warning_level ENUM('none', 'yellow', 'orange', 'red') DEFAULT 'none' COMMENT '效期预警等级',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1正常,0冻结',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_warehouse_material_batch (warehouse_id, material_id, batch_no),
    INDEX idx_warehouse (warehouse_id),
    INDEX idx_material (material_id),
    INDEX idx_expiry_date (expiry_date),
    INDEX idx_warning_level (expiry_warning_level),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存表';

-- 6. 库存总览表（物资级汇总，用于快速查询）
CREATE TABLE IF NOT EXISTS inventory_summary (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '汇总ID',
    warehouse_id BIGINT NOT NULL COMMENT '仓库ID',
    material_id BIGINT NOT NULL COMMENT '物资ID',
    total_quantity INT NOT NULL DEFAULT 0 COMMENT '总库存',
    locked_quantity INT NOT NULL DEFAULT 0 COMMENT '锁定数量',
    available_quantity INT NOT NULL DEFAULT 0 COMMENT '可用数量',
    warning_stock INT DEFAULT 0 COMMENT '预警库存',
    is_below_warning TINYINT DEFAULT 0 COMMENT '是否低于预警线',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_warehouse_material (warehouse_id, material_id),
    INDEX idx_warehouse (warehouse_id),
    INDEX idx_material (material_id),
    INDEX idx_below_warning (is_below_warning),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存汇总表';

-- 7. 效期预警表
CREATE TABLE IF NOT EXISTS expiry_alerts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '预警ID',
    inventory_id BIGINT NOT NULL COMMENT '库存ID',
    warehouse_id BIGINT NOT NULL COMMENT '仓库ID',
    material_id BIGINT NOT NULL COMMENT '物资ID',
    batch_no VARCHAR(100) NOT NULL COMMENT '批次号',
    expiry_date DATE COMMENT '有效期至',
    remaining_days INT COMMENT '剩余天数',
    alert_level ENUM('yellow', 'orange', 'red') NOT NULL COMMENT '预警等级:黄(30天),橙(15天),红(7天)',
    quantity INT NOT NULL COMMENT '预警数量',
    status TINYINT NOT NULL DEFAULT 0 COMMENT '状态:0未处理,1已处理',
    handled_by BIGINT COMMENT '处理人',
    handled_at DATETIME COMMENT '处理时间',
    handle_remark TEXT COMMENT '处理备注',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_inventory (inventory_id),
    INDEX idx_warehouse (warehouse_id),
    INDEX idx_material (material_id),
    INDEX idx_alert_level (alert_level),
    INDEX idx_status (status),
    FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE,
    FOREIGN KEY (handled_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='效期预警表';

-- 8. 调拨单表
CREATE TABLE IF NOT EXISTS transfer_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '调拨单ID',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '调拨单号',
    title VARCHAR(200) NOT NULL COMMENT '调拨标题',
    type ENUM('emergency', 'normal') DEFAULT 'normal' COMMENT '调拨类型',
    priority ENUM('high', 'medium', 'low') DEFAULT 'medium' COMMENT '优先级',
    from_warehouse_id BIGINT NOT NULL COMMENT '调出仓库ID',
    to_warehouse_id BIGINT NOT NULL COMMENT '调入仓库ID',
    status ENUM('draft', 'pending_approval', 'approved', 'rejected', 'in_transit', 'received', 'completed', 'cancelled') 
        DEFAULT 'draft' COMMENT '状态',
    applicant_id BIGINT COMMENT '申请人ID',
    apply_time DATETIME COMMENT '申请时间',
    approver_id BIGINT COMMENT '审批人ID',
    approve_time DATETIME COMMENT '审批时间',
    approve_remark TEXT COMMENT '审批备注',
    sender_id BIGINT COMMENT '发货人ID',
    send_time DATETIME COMMENT '发货时间',
    receiver_id BIGINT COMMENT '收货人ID',
    receive_time DATETIME COMMENT '收货时间',
    total_quantity INT DEFAULT 0 COMMENT '总数量',
    estimated_arrival_date DATE COMMENT '预计到达日期',
    transport_info TEXT COMMENT '运输信息',
    remark TEXT COMMENT '备注',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_order_no (order_no),
    INDEX idx_from_warehouse (from_warehouse_id),
    INDEX idx_to_warehouse (to_warehouse_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_applicant (applicant_id),
    FOREIGN KEY (from_warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
    FOREIGN KEY (to_warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
    FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='调拨单表';

-- 9. 调拨单明细表
CREATE TABLE IF NOT EXISTS transfer_order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '明细ID',
    order_id BIGINT NOT NULL COMMENT '调拨单ID',
    material_id BIGINT NOT NULL COMMENT '物资ID',
    from_inventory_id BIGINT COMMENT '调出库存ID',
    batch_no VARCHAR(100) COMMENT '批次号',
    apply_quantity INT NOT NULL COMMENT '申请数量',
    approved_quantity INT COMMENT '审批数量',
    actual_quantity INT COMMENT '实际调拨数量',
    received_quantity INT COMMENT '实收数量',
    unit_price DECIMAL(15, 2) COMMENT '单价',
    remark TEXT COMMENT '备注',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_order (order_id),
    INDEX idx_material (material_id),
    FOREIGN KEY (order_id) REFERENCES transfer_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE,
    FOREIGN KEY (from_inventory_id) REFERENCES inventory(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='调拨单明细表';

-- 10. 出入库记录表
CREATE TABLE IF NOT EXISTS stock_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
    record_no VARCHAR(50) NOT NULL UNIQUE COMMENT '单据号',
    type ENUM('in', 'out') NOT NULL COMMENT '类型:in入库,out出库',
    biz_type ENUM('purchase', 'transfer_in', 'transfer_out', 'allocation', 'return', 'adjustment', 'scrap') 
        NOT NULL COMMENT '业务类型',
    warehouse_id BIGINT NOT NULL COMMENT '仓库ID',
    material_id BIGINT NOT NULL COMMENT '物资ID',
    inventory_id BIGINT COMMENT '库存ID',
    batch_no VARCHAR(100) COMMENT '批次号',
    quantity INT NOT NULL COMMENT '数量',
    before_quantity INT COMMENT '操作前数量',
    after_quantity INT COMMENT '操作后数量',
    unit_price DECIMAL(15, 2) COMMENT '单价',
    related_order_id BIGINT COMMENT '关联单据ID',
    related_order_no VARCHAR(50) COMMENT '关联单据号',
    operator_id BIGINT COMMENT '操作人ID',
    operation_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    remark TEXT COMMENT '备注',
    idempotent_key VARCHAR(100) NOT NULL COMMENT '幂等键',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_idempotent (idempotent_key),
    INDEX idx_record_no (record_no),
    INDEX idx_type (type),
    INDEX idx_warehouse (warehouse_id),
    INDEX idx_material (material_id),
    INDEX idx_inventory (inventory_id),
    INDEX idx_operation_time (operation_time),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE,
    FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE SET NULL,
    FOREIGN KEY (operator_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='出入库记录表';

-- 11. 需求申报表
CREATE TABLE IF NOT EXISTS demand_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '申报ID',
    request_no VARCHAR(50) NOT NULL UNIQUE COMMENT '申报单号',
    title VARCHAR(200) NOT NULL COMMENT '申报标题',
    department VARCHAR(100) COMMENT '申报部门',
    applicant_id BIGINT COMMENT '申请人ID',
    emergency_level ENUM('high', 'medium', 'low') DEFAULT 'medium' COMMENT '紧急程度',
    reason TEXT COMMENT '申请原因',
    status ENUM('draft', 'pending_approval', 'approved', 'rejected', 'processing', 'completed', 'cancelled') 
        DEFAULT 'draft' COMMENT '状态',
    approver_id BIGINT COMMENT '审批人ID',
    approve_time DATETIME COMMENT '审批时间',
    approve_remark TEXT COMMENT '审批备注',
    total_quantity INT DEFAULT 0 COMMENT '总数量',
    demand_date DATE COMMENT '需求日期',
    remark TEXT COMMENT '备注',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_request_no (request_no),
    INDEX idx_status (status),
    INDEX idx_emergency_level (emergency_level),
    FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='需求申报表';

-- 12. 需求申报明细表
CREATE TABLE IF NOT EXISTS demand_request_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '明细ID',
    request_id BIGINT NOT NULL COMMENT '申报ID',
    material_id BIGINT NOT NULL COMMENT '物资ID',
    demand_quantity INT NOT NULL COMMENT '需求数量',
    approved_quantity INT COMMENT '审批数量',
    allocated_quantity INT DEFAULT 0 COMMENT '已分配数量',
    remark TEXT COMMENT '备注',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_request (request_id),
    INDEX idx_material (material_id),
    FOREIGN KEY (request_id) REFERENCES demand_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='需求申报明细表';

-- 13. 操作日志表
CREATE TABLE IF NOT EXISTS operation_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    user_id BIGINT COMMENT '用户ID',
    username VARCHAR(50) COMMENT '用户名',
    module VARCHAR(50) NOT NULL COMMENT '模块',
    operation VARCHAR(50) NOT NULL COMMENT '操作',
    method VARCHAR(20) COMMENT '请求方法',
    path VARCHAR(200) COMMENT '请求路径',
    ip VARCHAR(50) COMMENT 'IP地址',
    params TEXT COMMENT '请求参数',
    result TEXT COMMENT '返回结果',
    biz_id BIGINT COMMENT '业务ID',
    biz_no VARCHAR(50) COMMENT '业务单号',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1成功,0失败',
    error_msg TEXT COMMENT '错误信息',
    duration INT COMMENT '耗时(毫秒)',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user (user_id),
    INDEX idx_module (module),
    INDEX idx_biz_id (biz_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- 14. 系统配置表
CREATE TABLE IF NOT EXISTS system_configs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '配置ID',
    config_key VARCHAR(100) NOT NULL UNIQUE COMMENT '配置键',
    config_value TEXT COMMENT '配置值',
    config_desc VARCHAR(200) COMMENT '配置描述',
    config_group VARCHAR(50) DEFAULT 'default' COMMENT '配置分组',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_config_key (config_key),
    INDEX idx_config_group (config_group)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';

-- 插入初始数据
-- 插入默认管理员用户 (密码: admin123)
INSERT INTO users (username, password, real_name, role, status) VALUES 
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '系统管理员', 'admin', 1)
ON DUPLICATE KEY UPDATE username=username;

-- 插入物资分类
INSERT INTO material_categories (code, name, parent_id, sort_order, status) VALUES 
('emergency', '应急物资', 0, 1, 1),
('medical', '医疗物资', 0, 2, 1),
('shelter', '生活物资', 0, 3, 1),
('communication', '通讯设备', 0, 4, 1),
('transport', '运输设备', 0, 5, 1)
ON DUPLICATE KEY UPDATE code=code;

-- 插入系统配置
INSERT INTO system_configs (config_key, config_value, config_desc, config_group) VALUES 
('expiry_warning_yellow', '30', '黄色预警天数', 'expiry'),
('expiry_warning_orange', '15', '橙色预警天数', 'expiry'),
('expiry_warning_red', '7', '红色预警天数', 'expiry'),
('order_no_prefix_transfer', 'TR', '调拨单号前缀', 'order'),
('order_no_prefix_record', 'SR', '出入库单号前缀', 'order'),
('order_no_prefix_demand', 'DR', '需求申报单号前缀', 'order')
ON DUPLICATE KEY UPDATE config_key=config_key;

-- 插入示例仓库数据
INSERT INTO warehouses (code, name, province, city, district, address, longitude, latitude, status) VALUES 
('WH001', '北京中心仓库', '北京市', '北京市', '朝阳区', '朝阳区建国路88号', 116.4074, 39.9042, 1),
('WH002', '上海浦东仓库', '上海市', '上海市', '浦东新区', '浦东新区世纪大道100号', 121.4737, 31.2304, 1),
('WH003', '广州白云仓库', '广东省', '广州市', '白云区', '白云区机场路100号', 113.2644, 23.1291, 1),
('WH004', '成都武侯仓库', '四川省', '成都市', '武侯区', '武侯区人民南路100号', 104.0668, 30.5728, 1),
('WH005', '武汉江汉仓库', '湖北省', '武汉市', '江汉区', '江汉区建设大道100号', 114.3055, 30.5928, 1)
ON DUPLICATE KEY UPDATE code=code;

-- 插入示例物资数据
INSERT INTO materials (code, name, category_id, specification, unit, warning_stock, emergency_level, status) VALUES 
('MAT001', '医用防护服', 2, '一次性无菌', '套', 1000, 'high', 1),
('MAT002', 'N95口罩', 2, '头戴式', '个', 5000, 'high', 1),
('MAT003', '医用手套', 2, '乳胶M号', '副', 5000, 'medium', 1),
('MAT004', '消毒液', 2, '500ml瓶装', '瓶', 2000, 'high', 1),
('MAT005', '救生衣', 1, '成人款', '件', 500, 'high', 1),
('MAT006', '救生圈', 1, '标准型', '个', 200, 'medium', 1),
('MAT007', '应急帐篷', 1, '4人款', '顶', 100, 'high', 1),
('MAT008', '方便面', 3, '桶装', '桶', 10000, 'medium', 1),
('MAT009', '矿泉水', 3, '550ml瓶装', '瓶', 20000, 'medium', 1),
('MAT010', '卫星电话', 4, '北斗款', '部', 20, 'high', 1)
ON DUPLICATE KEY UPDATE code=code;
