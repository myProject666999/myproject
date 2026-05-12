
-- 创建数据库
CREATE DATABASE IF NOT EXISTS beauty_hair_salon DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE beauty_hair_salon;

-- ============================================
-- 权限系统表
-- ============================================

-- 用户表
CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    nickname VARCHAR(50) COMMENT '昵称',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    avatar VARCHAR(255) COMMENT '头像',
    status TINYINT DEFAULT 1 COMMENT '状态 0-禁用 1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 角色表
CREATE TABLE IF NOT EXISTS sys_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL COMMENT '角色名称',
    role_code VARCHAR(50) NOT NULL UNIQUE COMMENT '角色编码',
    description VARCHAR(255) COMMENT '描述',
    status TINYINT DEFAULT 1 COMMENT '状态 0-禁用 1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

-- 权限表
CREATE TABLE IF NOT EXISTS sys_permission (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    permission_name VARCHAR(50) NOT NULL COMMENT '权限名称',
    permission_code VARCHAR(100) NOT NULL UNIQUE COMMENT '权限编码',
    parent_id BIGINT DEFAULT 0 COMMENT '父权限ID',
    type TINYINT DEFAULT 1 COMMENT '类型 1-菜单 2-按钮',
    path VARCHAR(255) COMMENT '路由路径',
    component VARCHAR(255) COMMENT '组件路径',
    icon VARCHAR(50) COMMENT '图标',
    sort INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态 0-禁用 1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限表';

-- 用户角色关联表
CREATE TABLE IF NOT EXISTS sys_user_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联表';

-- 角色权限关联表
CREATE TABLE IF NOT EXISTS sys_role_permission (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色权限关联表';

-- ============================================
-- 基础信息表
-- ============================================

-- 门店表
CREATE TABLE IF NOT EXISTS store (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_name VARCHAR(100) NOT NULL COMMENT '门店名称',
    store_code VARCHAR(50) UNIQUE COMMENT '门店编码',
    address VARCHAR(255) COMMENT '地址',
    phone VARCHAR(20) COMMENT '电话',
    manager_name VARCHAR(50) COMMENT '店长姓名',
    status TINYINT DEFAULT 1 COMMENT '状态 0-关闭 1-营业中',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='门店表';

-- 服务项目分类表
CREATE TABLE IF NOT EXISTS service_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL COMMENT '分类名称',
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID',
    sort INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态 0-禁用 1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='服务项目分类表';

-- 服务项目表
CREATE TABLE IF NOT EXISTS service_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(100) NOT NULL COMMENT '项目名称',
    category_id BIGINT COMMENT '分类ID',
    item_code VARCHAR(50) UNIQUE COMMENT '项目编码',
    price DECIMAL(10,2) NOT NULL COMMENT '售价',
    cost_price DECIMAL(10,2) COMMENT '成本价',
    duration INT COMMENT '服务时长(分钟)',
    description VARCHAR(500) COMMENT '项目描述',
    status TINYINT DEFAULT 1 COMMENT '状态 0-下架 1-上架',
    sort INT DEFAULT 0 COMMENT '排序',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='服务项目表';

-- 商品表
CREATE TABLE IF NOT EXISTS product (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL COMMENT '商品名称',
    product_code VARCHAR(50) UNIQUE COMMENT '商品编码',
    category VARCHAR(50) COMMENT '分类',
    unit VARCHAR(20) COMMENT '单位',
    stock INT DEFAULT 0 COMMENT '库存',
    safety_stock INT DEFAULT 0 COMMENT '安全库存',
    sale_price DECIMAL(10,2) NOT NULL COMMENT '售价',
    cost_price DECIMAL(10,2) COMMENT '成本价',
    supplier VARCHAR(100) COMMENT '供应商',
    description VARCHAR(500) COMMENT '商品描述',
    status TINYINT DEFAULT 1 COMMENT '状态 0-下架 1-上架',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- ============================================
-- 员工/技师表
-- ============================================

-- 员工表
CREATE TABLE IF NOT EXISTS employee (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT COMMENT '关联系统用户ID',
    store_id BIGINT COMMENT '所属门店ID',
    employee_name VARCHAR(50) NOT NULL COMMENT '员工姓名',
    employee_no VARCHAR(50) UNIQUE COMMENT '员工编号',
    phone VARCHAR(20) COMMENT '手机号',
    position VARCHAR(50) COMMENT '职位',
    is_technician TINYINT DEFAULT 0 COMMENT '是否技师 0-否 1-是',
    level VARCHAR(20) COMMENT '技师级别',
    speciality VARCHAR(255) COMMENT '擅长项目',
    avatar VARCHAR(255) COMMENT '头像',
    commission_rate DECIMAL(5,2) DEFAULT 0 COMMENT '提成比例',
    status TINYINT DEFAULT 1 COMMENT '状态 0-离职 1-在职',
    join_date DATE COMMENT '入职日期',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='员工表';

-- 技师排班表
CREATE TABLE IF NOT EXISTS technician_schedule (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    technician_id BIGINT NOT NULL COMMENT '技师ID',
    schedule_date DATE NOT NULL COMMENT '排班日期',
    time_slot VARCHAR(50) NOT NULL COMMENT '时间段',
    status TINYINT DEFAULT 1 COMMENT '状态 0-休息 1-上班',
    remark VARCHAR(255) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技师排班表';

-- ============================================
-- 会员管理表
-- ============================================

-- 会员表
CREATE TABLE IF NOT EXISTS member (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_no VARCHAR(50) UNIQUE COMMENT '会员编号',
    member_name VARCHAR(50) NOT NULL COMMENT '会员姓名',
    phone VARCHAR(20) UNIQUE NOT NULL COMMENT '手机号',
    gender TINYINT COMMENT '性别 0-女 1-男',
    birthday DATE COMMENT '生日',
    id_card VARCHAR(20) COMMENT '身份证号',
    address VARCHAR(255) COMMENT '地址',
    email VARCHAR(100) COMMENT '邮箱',
    level VARCHAR(20) DEFAULT '普通会员' COMMENT '会员等级',
    points INT DEFAULT 0 COMMENT '积分',
    balance DECIMAL(10,2) DEFAULT 0 COMMENT '储值余额',
    skin_type VARCHAR(50) COMMENT '肤质标签',
    hair_type VARCHAR(50) COMMENT '发质标签',
    allergy_info VARCHAR(255) COMMENT '过敏信息',
    remark VARCHAR(500) COMMENT '备注',
    avatar VARCHAR(255) COMMENT '头像',
    referral_member_id BIGINT COMMENT '推荐人会员ID',
    register_store_id BIGINT COMMENT '注册门店ID',
    register_date DATE COMMENT '注册日期',
    status TINYINT DEFAULT 1 COMMENT '状态 0-禁用 1-正常',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会员表';

-- 会员卡类型表
CREATE TABLE IF NOT EXISTS card_type (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    card_name VARCHAR(100) NOT NULL COMMENT '卡名称',
    card_type TINYINT NOT NULL COMMENT '卡类型 1-储值卡 2-次卡 3-套餐卡',
    card_code VARCHAR(50) UNIQUE COMMENT '卡编码',
    face_value DECIMAL(10,2) COMMENT '面值/售价',
    give_value DECIMAL(10,2) DEFAULT 0 COMMENT '赠送金额',
    validity_days INT COMMENT '有效期(天)',
    description VARCHAR(500) COMMENT '描述',
    status TINYINT DEFAULT 1 COMMENT '状态 0-停用 1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会员卡类型表';

-- 会员卡次卡/套餐服务关联表
CREATE TABLE IF NOT EXISTS card_type_service (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    card_type_id BIGINT NOT NULL COMMENT '卡类型ID',
    service_item_id BIGINT NOT NULL COMMENT '服务项目ID',
    quantity INT DEFAULT 1 COMMENT '次数',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会员卡服务关联表';

-- 会员持有的卡表
CREATE TABLE IF NOT EXISTS member_card (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id BIGINT NOT NULL COMMENT '会员ID',
    card_type_id BIGINT NOT NULL COMMENT '卡类型ID',
    card_no VARCHAR(50) UNIQUE COMMENT '卡号',
    balance DECIMAL(10,2) DEFAULT 0 COMMENT '储值余额(储值卡)',
    total_times INT DEFAULT 0 COMMENT '总次数(次卡/套餐卡)',
    remaining_times INT DEFAULT 0 COMMENT '剩余次数',
    buy_price DECIMAL(10,2) COMMENT '购买价格',
    buy_date DATE COMMENT '购买日期',
    expire_date DATE COMMENT '到期日期',
    status TINYINT DEFAULT 1 COMMENT '状态 0-已过期 1-正常 2-已用完',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会员持卡表';

-- 会员消费记录表
CREATE TABLE IF NOT EXISTS member_consumption (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id BIGINT NOT NULL COMMENT '会员ID',
    member_card_id BIGINT COMMENT '使用的会员卡ID',
    consumption_no VARCHAR(50) UNIQUE COMMENT '消费单号',
    consumption_type TINYINT NOT NULL COMMENT '消费类型 1-服务 2-商品 3-开卡 4-充值',
    total_amount DECIMAL(10,2) NOT NULL COMMENT '消费总金额',
    discount_amount DECIMAL(10,2) DEFAULT 0 COMMENT '优惠金额',
    pay_amount DECIMAL(10,2) NOT NULL COMMENT '实付金额',
    pay_method VARCHAR(50) COMMENT '支付方式',
    store_id BIGINT COMMENT '消费门店',
    operator_id BIGINT COMMENT '操作人',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会员消费记录表';

-- 消费明细记录表
CREATE TABLE IF NOT EXISTS consumption_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    consumption_id BIGINT NOT NULL COMMENT '消费记录ID',
    item_type TINYINT NOT NULL COMMENT '项目类型 1-服务 2-商品',
    item_id BIGINT NOT NULL COMMENT '项目/商品ID',
    item_name VARCHAR(100) COMMENT '项目/商品名称',
    quantity INT DEFAULT 1 COMMENT '数量',
    unit_price DECIMAL(10,2) COMMENT '单价',
    subtotal DECIMAL(10,2) COMMENT '小计',
    technician_id BIGINT COMMENT '服务技师ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='消费明细表';

-- 会员充值记录表
CREATE TABLE IF NOT EXISTS member_recharge (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id BIGINT NOT NULL COMMENT '会员ID',
    member_card_id BIGINT COMMENT '会员卡ID',
    recharge_no VARCHAR(50) UNIQUE COMMENT '充值单号',
    recharge_amount DECIMAL(10,2) NOT NULL COMMENT '充值金额',
    give_amount DECIMAL(10,2) DEFAULT 0 COMMENT '赠送金额',
    pay_method VARCHAR(50) COMMENT '支付方式',
    store_id BIGINT COMMENT '充值门店',
    operator_id BIGINT COMMENT '操作人',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会员充值记录表';

-- ============================================
-- 预约管理表
-- ============================================

-- 预约表
CREATE TABLE IF NOT EXISTS appointment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    appointment_no VARCHAR(50) UNIQUE COMMENT '预约单号',
    member_id BIGINT COMMENT '会员ID',
    customer_name VARCHAR(50) COMMENT '顾客姓名(非会员)',
    phone VARCHAR(20) COMMENT '联系电话',
    appointment_date DATE NOT NULL COMMENT '预约日期',
    appointment_time VARCHAR(50) NOT NULL COMMENT '预约时间',
    technician_id BIGINT NOT NULL COMMENT '预约技师',
    service_item_id BIGINT COMMENT '预约服务项目',
    service_name VARCHAR(100) COMMENT '服务名称',
    estimated_duration INT COMMENT '预计时长(分钟)',
    estimated_amount DECIMAL(10,2) COMMENT '预计金额',
    status TINYINT DEFAULT 1 COMMENT '状态 1-待确认 2-已确认 3-已到店 4-已完成 5-已取消',
    source VARCHAR(50) COMMENT '预约来源 线下/线上',
    store_id BIGINT COMMENT '预约门店',
    operator_id BIGINT COMMENT '操作人',
    remark VARCHAR(500) COMMENT '备注',
    arrive_time DATETIME COMMENT '到店时间',
    cancel_reason VARCHAR(255) COMMENT '取消原因',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预约表';

-- ============================================
-- 订单/收银管理表
-- ============================================

-- 订单表
CREATE TABLE IF NOT EXISTS `order` (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(50) UNIQUE NOT NULL COMMENT '订单号',
    member_id BIGINT COMMENT '会员ID',
    customer_name VARCHAR(50) COMMENT '顾客姓名',
    phone VARCHAR(20) COMMENT '联系电话',
    appointment_id BIGINT COMMENT '关联预约ID',
    total_amount DECIMAL(10,2) NOT NULL COMMENT '订单总金额',
    discount_amount DECIMAL(10,2) DEFAULT 0 COMMENT '优惠金额',
    points_deduction DECIMAL(10,2) DEFAULT 0 COMMENT '积分抵扣',
    payable_amount DECIMAL(10,2) NOT NULL COMMENT '应付金额',
    paid_amount DECIMAL(10,2) DEFAULT 0 COMMENT '实付金额',
    payment_method VARCHAR(50) COMMENT '支付方式',
    points_earned INT DEFAULT 0 COMMENT '获得积分',
    store_id BIGINT COMMENT '门店ID',
    operator_id BIGINT COMMENT '收银员ID',
    status TINYINT DEFAULT 1 COMMENT '状态 1-待支付 2-已支付 3-已取消 4-已退款',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 订单明细表
CREATE TABLE IF NOT EXISTS order_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL COMMENT '订单ID',
    item_type TINYINT NOT NULL COMMENT '项目类型 1-服务 2-商品 3-开卡 4-充值',
    item_id BIGINT COMMENT '项目/商品/卡类型ID',
    item_name VARCHAR(100) NOT NULL COMMENT '项目/商品名称',
    quantity INT DEFAULT 1 COMMENT '数量',
    unit_price DECIMAL(10,2) NOT NULL COMMENT '单价',
    subtotal DECIMAL(10,2) NOT NULL COMMENT '小计',
    discount DECIMAL(10,2) DEFAULT 0 COMMENT '折扣金额',
    technician_id BIGINT COMMENT '服务技师ID',
    member_card_id BIGINT COMMENT '使用的会员卡ID',
    commission_amount DECIMAL(10,2) DEFAULT 0 COMMENT '提成金额',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单明细表';

-- 支付记录表
CREATE TABLE IF NOT EXISTS payment_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL COMMENT '订单ID',
    payment_no VARCHAR(50) UNIQUE COMMENT '支付单号',
    payment_method VARCHAR(50) NOT NULL COMMENT '支付方式',
    amount DECIMAL(10,2) NOT NULL COMMENT '支付金额',
    transaction_id VARCHAR(100) COMMENT '第三方交易号',
    status TINYINT DEFAULT 1 COMMENT '状态 1-待支付 2-支付成功 3-支付失败',
    operator_id BIGINT COMMENT '操作人',
    remark VARCHAR(255) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='支付记录表';

-- ============================================
-- 提成管理表
-- ============================================

-- 提成记录表
CREATE TABLE IF NOT EXISTS commission_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL COMMENT '员工ID',
    order_id BIGINT COMMENT '订单ID',
    order_detail_id BIGINT COMMENT '订单明细ID',
    commission_type VARCHAR(50) COMMENT '提成类型',
    service_amount DECIMAL(10,2) COMMENT '服务金额',
    commission_rate DECIMAL(5,2) COMMENT '提成比例',
    commission_amount DECIMAL(10,2) COMMENT '提成金额',
    status TINYINT DEFAULT 1 COMMENT '状态 1-待结算 2-已结算',
    settle_time DATETIME COMMENT '结算时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='提成记录表';

-- ============================================
-- 库存管理表
-- ============================================

-- 库存变动记录表
CREATE TABLE IF NOT EXISTS inventory_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL COMMENT '商品ID',
    record_type TINYINT NOT NULL COMMENT '变动类型 1-入库 2-出库 3-盘点 4-退货',
    quantity INT NOT NULL COMMENT '变动数量',
    before_stock INT COMMENT '变动前库存',
    after_stock INT COMMENT '变动后库存',
    unit_price DECIMAL(10,2) COMMENT '单价',
    total_amount DECIMAL(10,2) COMMENT '总金额',
    operator_id BIGINT COMMENT '操作人',
    remark VARCHAR(255) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存变动记录表';

-- ============================================
-- 初始化数据
-- ============================================

-- 初始化角色
INSERT INTO sys_role (role_name, role_code, description, status) VALUES 
('超级管理员', 'admin', '系统最高权限', 1),
('店长', 'store_manager', '门店管理权限', 1),
('收银员', 'cashier', '收银权限', 1),
('技师', 'technician', '技师权限', 1);

-- 初始化管理员账户 (密码: 123456, BCrypt 哈希)
INSERT INTO sys_user (username, password, nickname, phone, status) VALUES 
('admin', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '超级管理员', '13800138000', 1);

-- 初始化用户角色关联
INSERT INTO sys_user_role (user_id, role_id) VALUES (1, 1);

-- 初始化权限菜单
INSERT INTO sys_permission (permission_name, permission_code, parent_id, type, path, component, icon, sort, status) VALUES 
('系统管理', 'system', 0, 1, '/system', 'Layout', 'Setting', 1, 1),
('用户管理', 'system:user', 1, 1, '/system/user', 'system/user/index', 'User', 1, 1),
('角色管理', 'system:role', 1, 1, '/system/role', 'system/role/index', 'Peoples', 2, 1),
('权限管理', 'system:permission', 1, 1, '/system/permission', 'system/permission/index', 'Key', 3, 1),
('基础信息', 'base', 0, 1, '/base', 'Layout', 'Document', 2, 1),
('门店管理', 'base:store', 5, 1, '/base/store', 'base/store/index', 'OfficeBuilding', 1, 1),
('员工管理', 'base:employee', 5, 1, '/base/employee', 'base/employee/index', 'UserFilled', 2, 1),
('服务项目', 'base:service', 5, 1, '/base/service', 'base/service/index', 'Service', 3, 1),
('商品管理', 'base:product', 5, 1, '/base/product', 'base/product/index', 'Goods', 4, 1),
('会员管理', 'member', 0, 1, '/member', 'Layout', 'User', 3, 1),
('会员档案', 'member:list', 10, 1, '/member/list', 'member/list/index', 'UserFilled', 1, 1),
('会员等级', 'member:level', 10, 1, '/member/level', 'member/level/index', 'Medal', 2, 1),
('会员卡管理', 'member:card', 10, 1, '/member/card', 'member/card/index', 'CreditCard', 3, 1),
('预约管理', 'appointment', 0, 1, '/appointment', 'Layout', 'Calendar', 4, 1),
('预约列表', 'appointment:list', 14, 1, '/appointment/list', 'appointment/list/index', 'Calendar', 1, 1),
('技师排班', 'appointment:schedule', 14, 1, '/appointment/schedule', 'appointment/schedule/index', 'Schedule', 2, 1),
('收银管理', 'cashier', 0, 1, '/cashier', 'Layout', 'Wallet', 5, 1),
('收银台', 'cashier:desk', 17, 1, '/cashier/desk', 'cashier/desk/index', 'Money', 1, 1),
('订单管理', 'cashier:order', 17, 1, '/cashier/order', 'cashier/order/index', 'Tickets', 2, 1),
('财务管理', 'finance', 0, 1, '/finance', 'Layout', 'Money', 6, 1),
('充值记录', 'finance:recharge', 20, 1, '/finance/recharge', 'finance/recharge/index', 'Wallet', 1, 1),
('消费记录', 'finance:consumption', 20, 1, '/finance/consumption', 'finance/consumption/index', 'Histogram', 2, 1),
('提成管理', 'finance:commission', 20, 1, '/finance/commission', 'finance/commission/index', 'Money', 3, 1),
('报表管理', 'report', 0, 1, '/report', 'Layout', 'DataAnalysis', 7, 1),
('营业日报', 'report:daily', 24, 1, '/report/daily', 'report/daily/index', 'Histogram', 1, 1),
('会员分析', 'report:member', 24, 1, '/report/member', 'report/member/index', 'User', 2, 1),
('库存管理', 'inventory', 0, 1, '/inventory', 'Layout', 'Box', 8, 1),
('库存查询', 'inventory:list', 27, 1, '/inventory/list', 'inventory/list/index', 'Box', 1, 1),
('库存记录', 'inventory:record', 27, 1, '/inventory/record', 'inventory/record/index', 'Document', 2, 1);

-- 初始化角色权限关联 (管理员拥有所有权限)
INSERT INTO sys_role_permission (role_id, permission_id) 
SELECT 1, id FROM sys_permission;

-- 初始化门店
INSERT INTO store (store_name, store_code, address, phone, manager_name, status) VALUES 
('总店', 'STORE001', '北京市朝阳区建国路88号', '010-12345678', '张三', 1),
('朝阳分店', 'STORE002', '北京市朝阳区望京SOHO', '010-87654321', '李四', 1);

-- 初始化服务分类
INSERT INTO service_category (category_name, parent_id, sort, status) VALUES 
('美发', 0, 1, 1),
('美容', 0, 2, 1),
('养发', 0, 3, 1),
('染发', 1, 1, 1),
('烫发', 1, 2, 1),
('剪发', 1, 3, 1);

-- 初始化服务项目
INSERT INTO service_item (item_name, category_id, item_code, price, cost_price, duration, description, status, sort) VALUES 
('精剪', 6, 'S001', 68.00, 10.00, 30, '专业精剪，根据脸型设计发型', 1, 1),
('洗剪吹', 6, 'S002', 38.00, 8.00, 25, '基础洗剪吹套餐', 1, 2),
('冷烫', 5, 'S003', 298.00, 50.00, 90, '温和冷烫，不伤发质', 1, 1),
('热烫', 5, 'S004', 498.00, 80.00, 120, '持久热烫，卷度自然', 1, 2),
('染发（黑色）', 4, 'S005', 198.00, 30.00, 60, '植物染发剂，安全健康', 1, 1),
('染发（彩色）', 4, 'S006', 398.00, 60.00, 90, '多种颜色可选', 1, 2),
('面部护理', 2, 'S007', 298.00, 50.00, 60, '深层清洁补水', 1, 1),
('精油SPA', 3, 'S008', 198.00, 40.00, 45, '头皮精油SPA护理', 1, 1);

-- 初始化会员卡类型
INSERT INTO card_type (card_name, card_type, card_code, face_value, give_value, validity_days, description, status) VALUES 
('银卡储值卡', 1, 'C001', 1000.00, 100.00, 730, '充值1000送100，全场9折', 1),
('金卡储值卡', 1, 'C002', 3000.00, 500.00, 730, '充值3000送500，全场85折', 1),
('钻石卡储值卡', 1, 'C003', 5000.00, 1000.00, 730, '充值5000送1000，全场8折', 1),
('剪发10次卡', 2, 'C004', 500.00, 0.00, 365, '可使用精剪10次', 1),
('烫发套餐卡', 3, 'C005', 888.00, 0.00, 365, '包含烫发+染发各1次', 1);

-- 初始化次卡/套餐服务关联
INSERT INTO card_type_service (card_type_id, service_item_id, quantity) VALUES 
(4, 1, 10),
(5, 3, 1),
(5, 6, 1);
