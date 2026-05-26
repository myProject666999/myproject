-- 创建数据库
CREATE DATABASE IF NOT EXISTS equipment_asset_management DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE equipment_asset_management;

-- 1. 部门表
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '部门名称',
    description VARCHAR(255) COMMENT '部门描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门表';

-- 2. 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    department_id INT COMMENT '所属部门ID',
    phone VARCHAR(20) COMMENT '联系电话',
    email VARCHAR(100) COMMENT '邮箱',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 3. 资产分类表
CREATE TABLE IF NOT EXISTS asset_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '分类名称',
    parent_id INT DEFAULT 0 COMMENT '父分类ID',
    description VARCHAR(255) COMMENT '分类描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资产分类表';

-- 4. 资产表
CREATE TABLE IF NOT EXISTS assets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_code VARCHAR(50) NOT NULL UNIQUE COMMENT '资产编号',
    name VARCHAR(200) NOT NULL COMMENT '资产名称',
    category_id INT NOT NULL COMMENT '分类ID',
    specification VARCHAR(200) COMMENT '规格型号',
    brand VARCHAR(100) COMMENT '品牌',
    serial_number VARCHAR(100) COMMENT '序列号',
    purchase_date DATE COMMENT '采购日期',
    purchase_price DECIMAL(12, 2) COMMENT '采购价格',
    supplier VARCHAR(200) COMMENT '供应商',
    location VARCHAR(200) COMMENT '存放位置',
    status ENUM('IDLE', 'IN_USE', 'MAINTENANCE', 'SCRAPPED', 'LOST') DEFAULT 'IDLE' 
        COMMENT '资产状态: IDLE-空闲, IN_USE-使用中, MAINTENANCE-维修中, SCRAPPED-已报废, LOST-已丢失',
    qr_code VARCHAR(500) COMMENT '二维码内容',
    description TEXT COMMENT '备注',
    current_user_id INT COMMENT '当前使用人ID',
    current_department_id INT COMMENT '当前使用部门ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES asset_categories(id),
    FOREIGN KEY (current_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (current_department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资产表';

-- 5. 领用/归还记录表
CREATE TABLE IF NOT EXISTS borrow_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL COMMENT '资产ID',
    user_id INT NOT NULL COMMENT '领用人ID',
    department_id INT COMMENT '领用部门ID',
    borrow_date DATE NOT NULL COMMENT '领用日期',
    expected_return_date DATE COMMENT '预计归还日期',
    actual_return_date DATE COMMENT '实际归还日期',
    purpose VARCHAR(255) COMMENT '领用用途',
    status ENUM('BORROWED', 'RETURNED') DEFAULT 'BORROWED' 
        COMMENT '状态: BORROWED-领用中, RETURNED-已归还',
    borrow_operator_id INT COMMENT '领用操作人ID',
    return_operator_id INT COMMENT '归还操作人ID',
    remarks TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='领用归还记录表';

-- 6. 维修记录表
CREATE TABLE IF NOT EXISTS maintenance_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL COMMENT '资产ID',
    fault_description TEXT NOT NULL COMMENT '故障描述',
    report_date DATE NOT NULL COMMENT '报修日期',
    reporter_id INT COMMENT '报修人ID',
    maintenance_type ENUM('INTERNAL', 'EXTERNAL') DEFAULT 'INTERNAL' 
        COMMENT '维修类型: INTERNAL-内部维修, EXTERNAL-外部维修',
    maintenance_person VARCHAR(100) COMMENT '维修人员',
    maintenance_date DATE COMMENT '维修日期',
    maintenance_content TEXT COMMENT '维修内容',
    maintenance_cost DECIMAL(12, 2) DEFAULT 0 COMMENT '维修费用',
    status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING' 
        COMMENT '维修状态: PENDING-待处理, PROCESSING-处理中, COMPLETED-已完成, CANCELLED-已取消',
    completed_date DATE COMMENT '完成日期',
    remarks TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY (asset_id) REFERENCES assets(id),
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='维修记录表';

-- 7. 报废记录表
CREATE TABLE IF NOT EXISTS scrap_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL COMMENT '资产ID',
    scrap_reason TEXT NOT NULL COMMENT '报废原因',
    scrap_date DATE NOT NULL COMMENT '报废日期',
    applicant_id INT COMMENT '申请人ID',
    approver_id INT COMMENT '审批人ID',
    scrap_value DECIMAL(12, 2) DEFAULT 0 COMMENT '残值',
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING' 
        COMMENT '审批状态: PENDING-待审批, APPROVED-已批准, REJECTED-已拒绝',
    remarks TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='报废记录表';

-- 8. 盘点表
CREATE TABLE IF NOT EXISTS inventory_checks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    check_code VARCHAR(50) NOT NULL UNIQUE COMMENT '盘点单号',
    name VARCHAR(200) NOT NULL COMMENT '盘点名称',
    check_date DATE NOT NULL COMMENT '盘点日期',
    operator_id INT COMMENT '盘点操作人ID',
    status ENUM('DRAFT', 'PROCESSING', 'COMPLETED') DEFAULT 'DRAFT' 
        COMMENT '盘点状态: DRAFT-草稿, PROCESSING-进行中, COMPLETED-已完成',
    total_count INT DEFAULT 0 COMMENT '应盘数量',
    checked_count INT DEFAULT 0 COMMENT '已盘数量',
    normal_count INT DEFAULT 0 COMMENT '正常数量',
    abnormal_count INT DEFAULT 0 COMMENT '异常数量',
    remarks TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (operator_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='盘点表';

-- 9. 盘点明细表
CREATE TABLE IF NOT EXISTS inventory_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    check_id INT NOT NULL COMMENT '盘点单ID',
    asset_id INT NOT NULL COMMENT '资产ID',
    check_status ENUM('NORMAL', 'MISSING', 'DAMAGED', 'NOT_FOUND') DEFAULT 'NOT_FOUND' 
        COMMENT '盘点状态: NORMAL-正常, MISSING-丢失, DAMAGED-损坏, NOT_FOUND-未盘点',
    check_time DATETIME COMMENT '盘点时间',
    check_operator_id INT COMMENT '盘点人ID',
    location_actual VARCHAR(200) COMMENT '实际位置',
    remarks VARCHAR(255) COMMENT '盘点备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (check_id) REFERENCES inventory_checks(id) ON DELETE CASCADE,
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    UNIQUE KEY unique_check_asset (check_id, asset_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='盘点明细表';

-- 10. 资产调拨记录表
CREATE TABLE IF NOT EXISTS transfer_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL COMMENT '资产ID',
    from_user_id INT COMMENT '原使用人ID',
    to_user_id INT COMMENT '新使用人ID',
    from_department_id INT COMMENT '原部门ID',
    to_department_id INT COMMENT '新部门ID',
    transfer_date DATE NOT NULL COMMENT '调拨日期',
    reason VARCHAR(255) COMMENT '调拨原因',
    operator_id INT COMMENT '操作人ID',
    remarks TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (from_department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (to_department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资产调拨记录表';

-- 插入初始数据

-- 部门数据
INSERT INTO departments (name, description) VALUES
('技术部', '负责公司技术开发和维护'),
('市场部', '负责市场营销和销售'),
('财务部', '负责财务管理'),
('人事部', '负责人力资源管理'),
('行政部', '负责行政管理');

-- 用户数据
INSERT INTO users (username, name, department_id, phone, email) VALUES
('admin', '系统管理员', 1, '13800138000', 'admin@company.com'),
('zhangsan', '张三', 1, '13800138001', 'zhangsan@company.com'),
('lisi', '李四', 2, '13800138002', 'lisi@company.com'),
('wangwu', '王五', 3, '13800138003', 'wangwu@company.com'),
('zhaoliu', '赵六', 4, '13800138004', 'zhaoliu@company.com');

-- 资产分类数据
INSERT INTO asset_categories (name, parent_id, description) VALUES
('IT设备', 0, '信息技术设备'),
('办公设备', 0, '办公用设备'),
('家具用具', 0, '家具和日常用具'),
('交通工具', 0, '车辆等交通工具'),
('电脑', 1, '台式机和笔记本'),
('打印机', 2, '打印设备'),
('桌椅', 3, '办公桌椅');

-- 资产数据
INSERT INTO assets (asset_code, name, category_id, specification, brand, serial_number, purchase_date, purchase_price, supplier, location, status, description) VALUES
('AST-001', '联想ThinkPad笔记本', 5, 'X1 Carbon Gen 10', '联想', 'SN2024001', '2024-01-15', 12999.00, '联想授权经销商', '技术部办公室', 'IN_USE', '开发人员用笔记本'),
('AST-002', '戴尔台式电脑', 5, 'OptiPlex 7010', '戴尔', 'SN2024002', '2024-01-20', 5999.00, '戴尔授权经销商', '市场部办公室', 'IN_USE', '市场部办公电脑'),
('AST-003', '惠普激光打印机', 6, 'LaserJet Pro M404dn', '惠普', 'SN2024003', '2024-02-01', 2999.00, '惠普专卖店', '公共打印区', 'IDLE', '公共打印设备'),
('AST-004', '办公桌椅套装', 7, '标准款', '国产品牌', 'SN2024004', '2024-02-10', 1500.00, '家具公司', '财务部办公室', 'IDLE', '财务部办公桌'),
('AST-005', '苹果MacBook Pro', 5, 'MacBook Pro 14', '苹果', 'SN2024005', '2024-03-01', 16999.00, '苹果官网', '技术部办公室', 'IDLE', '设计人员用笔记本');

-- 领用记录
INSERT INTO borrow_records (asset_id, user_id, department_id, borrow_date, expected_return_date, purpose, status) VALUES
(1, 2, 1, '2024-01-16', '2024-12-31', '开发工作使用', 'BORROWED'),
(2, 3, 2, '2024-01-21', '2024-12-31', '市场部日常办公', 'BORROWED');

-- 维修记录
INSERT INTO maintenance_records (asset_id, fault_description, report_date, reporter_id, maintenance_type, status) VALUES
(1, '键盘按键失灵', '2024-03-10', 2, 'EXTERNAL', 'COMPLETED');

UPDATE assets SET current_user_id = 2, current_department_id = 1 WHERE id = 1;
UPDATE assets SET current_user_id = 3, current_department_id = 2 WHERE id = 2;
