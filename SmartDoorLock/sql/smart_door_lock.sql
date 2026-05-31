-- =============================================
-- 长租公寓智能门锁与租约管理系统 数据库脚本
-- =============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS smart_door_lock DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE smart_door_lock;

-- =============================================
-- 1. 用户表（系统管理员/运营人员）
-- =============================================
DROP TABLE IF EXISTS sys_user;
CREATE TABLE sys_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码（加密）',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    role VARCHAR(20) NOT NULL DEFAULT 'OPERATOR' COMMENT '角色：ADMIN-管理员，OPERATOR-运营员',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';

-- =============================================
-- 2. 房源表
-- =============================================
DROP TABLE IF EXISTS apartment;
CREATE TABLE apartment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    apartment_no VARCHAR(50) NOT NULL UNIQUE COMMENT '房源编号',
    building VARCHAR(50) COMMENT '楼栋',
    floor VARCHAR(20) COMMENT '楼层',
    room_no VARCHAR(20) COMMENT '房间号',
    area DECIMAL(10,2) COMMENT '面积（平方米）',
    room_type VARCHAR(20) COMMENT '户型：一室一厅、两室一厅等',
    decoration VARCHAR(20) COMMENT '装修：简装、精装、豪装',
    furniture VARCHAR(500) COMMENT '家具配置',
    monthly_rent DECIMAL(12,2) NOT NULL COMMENT '月租金',
    deposit DECIMAL(12,2) NOT NULL COMMENT '押金',
    status VARCHAR(20) NOT NULL DEFAULT 'VACANT' COMMENT '状态：VACANT-空置，OCCUPIED-已出租，MAINTENANCE-维修中，RESERVED-已预订',
    address VARCHAR(200) COMMENT '详细地址',
    description VARCHAR(500) COMMENT '房源描述',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    INDEX idx_status(status),
    INDEX idx_apartment_no(apartment_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='房源表';

-- =============================================
-- 3. 租客表
-- =============================================
DROP TABLE IF EXISTS tenant;
CREATE TABLE tenant (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    tenant_no VARCHAR(50) NOT NULL UNIQUE COMMENT '租客编号',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    phone VARCHAR(20) NOT NULL UNIQUE COMMENT '手机号',
    id_card VARCHAR(18) COMMENT '身份证号',
    gender VARCHAR(10) COMMENT '性别：MALE-男，FEMALE-女',
    age INT COMMENT '年龄',
    work_unit VARCHAR(100) COMMENT '工作单位',
    emergency_contact VARCHAR(50) COMMENT '紧急联系人',
    emergency_phone VARCHAR(20) COMMENT '紧急联系电话',
    address VARCHAR(200) COMMENT '户籍地址',
    status VARCHAR(20) NOT NULL DEFAULT 'NORMAL' COMMENT '状态：NORMAL-正常，BLACKLIST-黑名单',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    INDEX idx_tenant_no(tenant_no),
    INDEX idx_phone(phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='租客表';

-- =============================================
-- 4. 智能门锁表
-- =============================================
DROP TABLE IF EXISTS door_lock;
CREATE TABLE door_lock (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    lock_no VARCHAR(50) NOT NULL UNIQUE COMMENT '门锁编号',
    lock_model VARCHAR(50) COMMENT '门锁型号',
    lock_brand VARCHAR(50) COMMENT '门锁品牌',
    apartment_id BIGINT NOT NULL COMMENT '关联房源ID',
    apartment_no VARCHAR(50) NOT NULL COMMENT '房源编号',
    install_time DATETIME COMMENT '安装时间',
    last_maintain_time DATETIME COMMENT '上次维护时间',
    battery_level INT COMMENT '电量百分比',
    network_status VARCHAR(20) NOT NULL DEFAULT 'ONLINE' COMMENT '网络状态：ONLINE-在线，OFFLINE-离线',
    lock_status VARCHAR(20) NOT NULL DEFAULT 'NORMAL' COMMENT '门锁状态：NORMAL-正常，FAULT-故障',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-停用，1-启用',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    INDEX idx_apartment_id(apartment_id),
    INDEX idx_lock_no(lock_no),
    INDEX idx_network_status(network_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='智能门锁表';

-- =============================================
-- 5. 租约表
-- =============================================
DROP TABLE IF EXISTS lease_contract;
CREATE TABLE lease_contract (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    contract_no VARCHAR(50) NOT NULL UNIQUE COMMENT '合同编号',
    tenant_id BIGINT NOT NULL COMMENT '租客ID',
    tenant_name VARCHAR(50) NOT NULL COMMENT '租客姓名',
    apartment_id BIGINT NOT NULL COMMENT '房源ID',
    apartment_no VARCHAR(50) NOT NULL COMMENT '房源编号',
    start_date DATE NOT NULL COMMENT '租期开始日期',
    end_date DATE NOT NULL COMMENT '租期结束日期',
    lease_term INT NOT NULL COMMENT '租期（月）',
    monthly_rent DECIMAL(12,2) NOT NULL COMMENT '月租金',
    deposit DECIMAL(12,2) NOT NULL COMMENT '押金',
    payment_method VARCHAR(20) NOT NULL DEFAULT 'MONTHLY' COMMENT '付款方式：MONTHLY-月付，QUARTERLY-季付，HALF_YEAR-半年付，YEARLY-年付',
    payment_day INT NOT NULL DEFAULT 1 COMMENT '每月付款日',
    water_price DECIMAL(10,2) COMMENT '水费单价（元/吨）',
    electricity_price DECIMAL(10,2) COMMENT '电费单价（元/度）',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '状态：PENDING-待生效，ACTIVE-执行中，EXPIRED-已到期，TERMINATED-已终止',
    check_in_date DATE COMMENT '实际入住日期',
    check_out_date DATE COMMENT '实际退房日期',
    signing_date DATE COMMENT '签约日期',
    remark VARCHAR(1000) COMMENT '备注',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    INDEX idx_contract_no(contract_no),
    INDEX idx_tenant_id(tenant_id),
    INDEX idx_apartment_id(apartment_id),
    INDEX idx_status(status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='租约表';

-- =============================================
-- 6. 门锁密码表
-- =============================================
DROP TABLE IF EXISTS lock_password;
CREATE TABLE lock_password (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    password_no VARCHAR(50) NOT NULL UNIQUE COMMENT '密码编号',
    lock_id BIGINT NOT NULL COMMENT '门锁ID',
    lock_no VARCHAR(50) NOT NULL COMMENT '门锁编号',
    apartment_id BIGINT NOT NULL COMMENT '房源ID',
    contract_id BIGINT COMMENT '关联租约ID',
    tenant_id BIGINT COMMENT '租客ID',
    tenant_name VARCHAR(50) COMMENT '租客姓名',
    password_type VARCHAR(20) NOT NULL COMMENT '密码类型：PERMANENT-永久密码，TEMPORARY-临时密码，DISPOSABLE-一次性密码',
    password VARCHAR(20) NOT NULL COMMENT '密码内容',
    effective_time DATETIME NOT NULL COMMENT '生效时间',
    expire_time DATETIME NOT NULL COMMENT '过期时间',
    permission_type VARCHAR(20) NOT NULL DEFAULT 'NORMAL' COMMENT '权限类型：ADMIN-管理员，TENANT-租客，CLEANER-保洁，MAINTENANCE-维修，VISITOR-访客',
    use_limit INT DEFAULT -1 COMMENT '使用次数限制：-1-无限制',
    used_count INT NOT NULL DEFAULT 0 COMMENT '已使用次数',
    last_use_time DATETIME COMMENT '最后使用时间',
    send_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '下发状态：PENDING-待下发，SUCCESS-下发成功，FAILED-下发失败',
    send_time DATETIME COMMENT '下发时间',
    send_request_id VARCHAR(100) COMMENT '下发请求ID（幂等用）',
    send_fail_reason VARCHAR(500) COMMENT '下发失败原因',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT '状态：ACTIVE-有效，USED-已使用，EXPIRED-已过期，CANCELLED-已取消',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    UNIQUE KEY uk_send_request_id(send_request_id),
    INDEX idx_lock_id(lock_id),
    INDEX idx_contract_id(contract_id),
    INDEX idx_tenant_id(tenant_id),
    INDEX idx_status(status),
    INDEX idx_expire_time(expire_time),
    INDEX idx_password_type(password_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='门锁密码表';

-- =============================================
-- 7. 租金账单表
-- =============================================
DROP TABLE IF EXISTS rent_bill;
CREATE TABLE rent_bill (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    bill_no VARCHAR(50) NOT NULL UNIQUE COMMENT '账单编号',
    contract_id BIGINT NOT NULL COMMENT '租约ID',
    contract_no VARCHAR(50) NOT NULL COMMENT '合同编号',
    tenant_id BIGINT NOT NULL COMMENT '租客ID',
    tenant_name VARCHAR(50) NOT NULL COMMENT '租客姓名',
    apartment_id BIGINT NOT NULL COMMENT '房源ID',
    apartment_no VARCHAR(50) NOT NULL COMMENT '房源编号',
    bill_month VARCHAR(7) NOT NULL COMMENT '账单月份（yyyy-MM）',
    bill_start_date DATE NOT NULL COMMENT '账期开始日期',
    bill_end_date DATE NOT NULL COMMENT '账期结束日期',
    rent_amount DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '租金金额',
    water_fee DECIMAL(12,2) DEFAULT 0 COMMENT '水费',
    electricity_fee DECIMAL(12,2) DEFAULT 0 COMMENT '电费',
    gas_fee DECIMAL(12,2) DEFAULT 0 COMMENT '燃气费',
    property_fee DECIMAL(12,2) DEFAULT 0 COMMENT '物业费',
    network_fee DECIMAL(12,2) DEFAULT 0 COMMENT '网费',
    other_fee DECIMAL(12,2) DEFAULT 0 COMMENT '其他费用',
    late_fee DECIMAL(12,2) DEFAULT 0 COMMENT '滞纳金',
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '账单总金额',
    paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '已付金额',
    unpaid_amount DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '未付金额',
    due_date DATE NOT NULL COMMENT '缴费截止日期',
    payment_time DATETIME COMMENT '实际缴费时间',
    payment_method VARCHAR(20) COMMENT '缴费方式：ALIPAY-支付宝，WECHAT-微信，BANK-银行转账，CASH-现金',
    payment_transaction_no VARCHAR(100) COMMENT '支付交易号',
    status VARCHAR(20) NOT NULL DEFAULT 'UNPAID' COMMENT '状态：UNPAID-未缴费，PARTIAL-部分缴费，PAID-已缴费，OVERDUE-已逾期',
    reminder_count INT NOT NULL DEFAULT 0 COMMENT '提醒次数',
    last_reminder_time DATETIME COMMENT '最后提醒时间',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    INDEX idx_bill_no(bill_no),
    INDEX idx_contract_id(contract_id),
    INDEX idx_tenant_id(tenant_id),
    INDEX idx_bill_month(bill_month),
    INDEX idx_status(status),
    INDEX idx_due_date(due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='租金账单表';

-- =============================================
-- 8. 水电抄表记录表
-- =============================================
DROP TABLE IF EXISTS utility_record;
CREATE TABLE utility_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    record_no VARCHAR(50) NOT NULL UNIQUE COMMENT '抄表编号',
    contract_id BIGINT NOT NULL COMMENT '租约ID',
    apartment_id BIGINT NOT NULL COMMENT '房源ID',
    apartment_no VARCHAR(50) NOT NULL COMMENT '房源编号',
    record_month VARCHAR(7) NOT NULL COMMENT '抄表月份（yyyy-MM）',
    record_date DATE NOT NULL COMMENT '抄表日期',
    last_water_reading DECIMAL(10,2) COMMENT '上次水表读数',
    current_water_reading DECIMAL(10,2) COMMENT '本次水表读数',
    water_consumption DECIMAL(10,2) COMMENT '用水量（吨）',
    water_unit_price DECIMAL(10,2) COMMENT '水费单价',
    water_fee DECIMAL(12,2) COMMENT '水费金额',
    last_electricity_reading DECIMAL(10,2) COMMENT '上次电表读数',
    current_electricity_reading DECIMAL(10,2) COMMENT '本次电表读数',
    electricity_consumption DECIMAL(10,2) COMMENT '用电量（度）',
    electricity_unit_price DECIMAL(10,2) COMMENT '电费单价',
    electricity_fee DECIMAL(12,2) COMMENT '电费金额',
    reader_id BIGINT COMMENT '抄表人ID',
    reader_name VARCHAR(50) COMMENT '抄表人姓名',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    INDEX idx_contract_id(contract_id),
    INDEX idx_apartment_id(apartment_id),
    INDEX idx_record_month(record_month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='水电抄表记录表';

-- =============================================
-- 9. 报修工单表
-- =============================================
DROP TABLE IF EXISTS repair_order;
CREATE TABLE repair_order (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工单编号',
    contract_id BIGINT COMMENT '租约ID',
    tenant_id BIGINT COMMENT '租客ID',
    tenant_name VARCHAR(50) COMMENT '租客姓名',
    apartment_id BIGINT NOT NULL COMMENT '房源ID',
    apartment_no VARCHAR(50) NOT NULL COMMENT '房源编号',
    repair_type VARCHAR(50) NOT NULL COMMENT '报修类型：WATER-水电，ELECTRIC-电器，FURNITURE-家具，LOCK-门锁，OTHER-其他',
    priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL' COMMENT '优先级：LOW-低，NORMAL-普通，HIGH-高，URGENT-紧急',
    title VARCHAR(200) NOT NULL COMMENT '报修标题',
    description VARCHAR(1000) NOT NULL COMMENT '报修描述',
    images VARCHAR(1000) COMMENT '报修图片URL，多个用逗号分隔',
    report_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '报修时间',
    reporter_id BIGINT COMMENT '报修人ID',
    reporter_name VARCHAR(50) COMMENT '报修人姓名',
    reporter_phone VARCHAR(20) COMMENT '报修人电话',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '状态：PENDING-待分配，ASSIGNED-已分配，PROCESSING-处理中，COMPLETED-已完成，CANCELLED-已取消',
    assignee_id BIGINT COMMENT '处理人ID',
    assignee_name VARCHAR(50) COMMENT '处理人姓名',
    assign_time DATETIME COMMENT '分配时间',
    process_start_time DATETIME COMMENT '开始处理时间',
    process_description VARCHAR(1000) COMMENT '处理描述',
    complete_time DATETIME COMMENT '完成时间',
    cost_amount DECIMAL(12,2) DEFAULT 0 COMMENT '维修费用',
    cost_bearer VARCHAR(20) DEFAULT 'OWNER' COMMENT '费用承担：OWNER-业主，TENANT-租客',
    satisfaction_score INT COMMENT '满意度评分：1-5分',
    satisfaction_comment VARCHAR(500) COMMENT '满意度评价',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    INDEX idx_order_no(order_no),
    INDEX idx_apartment_id(apartment_id),
    INDEX idx_tenant_id(tenant_id),
    INDEX idx_status(status),
    INDEX idx_priority(priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='报修工单表';

-- =============================================
-- 10. 退租结算表
-- =============================================
DROP TABLE IF EXISTS check_out_settlement;
CREATE TABLE check_out_settlement (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    settlement_no VARCHAR(50) NOT NULL UNIQUE COMMENT '结算编号',
    contract_id BIGINT NOT NULL COMMENT '租约ID',
    contract_no VARCHAR(50) NOT NULL COMMENT '合同编号',
    tenant_id BIGINT NOT NULL COMMENT '租客ID',
    tenant_name VARCHAR(50) NOT NULL COMMENT '租客姓名',
    apartment_id BIGINT NOT NULL COMMENT '房源ID',
    apartment_no VARCHAR(50) NOT NULL COMMENT '房源编号',
    check_out_date DATE NOT NULL COMMENT '退房日期',
    settlement_date DATE COMMENT '结算日期',
    deposit_amount DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '押金总额',
    rent_settlement DECIMAL(12,2) DEFAULT 0 COMMENT '租金结算（多退少补）',
    water_settlement DECIMAL(12,2) DEFAULT 0 COMMENT '水费结算',
    electricity_settlement DECIMAL(12,2) DEFAULT 0 COMMENT '电费结算',
    gas_settlement DECIMAL(12,2) DEFAULT 0 COMMENT '燃气费结算',
    property_settlement DECIMAL(12,2) DEFAULT 0 COMMENT '物业费结算',
    repair_fee DECIMAL(12,2) DEFAULT 0 COMMENT '维修费',
    cleaning_fee DECIMAL(12,2) DEFAULT 0 COMMENT '清洁费',
    key_deposit DECIMAL(12,2) DEFAULT 0 COMMENT '钥匙/门禁卡押金',
    compensation_fee DECIMAL(12,2) DEFAULT 0 COMMENT '物品损坏赔偿金',
    other_deduction DECIMAL(12,2) DEFAULT 0 COMMENT '其他扣款',
    other_refund DECIMAL(12,2) DEFAULT 0 COMMENT '其他退款',
    total_deduction DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '扣款总额',
    total_refund DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '退款总额',
    actual_refund DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '实际退款金额',
    refund_method VARCHAR(20) COMMENT '退款方式：ALIPAY-支付宝，WECHAT-微信，BANK-银行转账，CASH-现金',
    refund_transaction_no VARCHAR(100) COMMENT '退款交易号',
    refund_time DATETIME COMMENT '退款时间',
    settlement_detail VARCHAR(2000) COMMENT '结算明细说明',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '状态：PENDING-待结算，SETTLED-已结算，REFUNDED-已退款',
    operator_id BIGINT COMMENT '经办人ID',
    operator_name VARCHAR(50) COMMENT '经办人姓名',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    INDEX idx_settlement_no(settlement_no),
    INDEX idx_contract_id(contract_id),
    INDEX idx_tenant_id(tenant_id),
    INDEX idx_status(status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='退租结算表';

-- =============================================
-- 11. 入住记录表
-- =============================================
DROP TABLE IF EXISTS check_in_record;
CREATE TABLE check_in_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    record_no VARCHAR(50) NOT NULL UNIQUE COMMENT '记录编号',
    contract_id BIGINT NOT NULL COMMENT '租约ID',
    contract_no VARCHAR(50) NOT NULL COMMENT '合同编号',
    tenant_id BIGINT NOT NULL COMMENT '租客ID',
    tenant_name VARCHAR(50) NOT NULL COMMENT '租客姓名',
    apartment_id BIGINT NOT NULL COMMENT '房源ID',
    apartment_no VARCHAR(50) NOT NULL COMMENT '房源编号',
    record_type VARCHAR(20) NOT NULL COMMENT '记录类型：CHECK_IN-入住，CHECK_OUT-退房，KEY_COLLECT-取钥匙，KEY_RETURN-还钥匙',
    record_date DATE NOT NULL COMMENT '记录日期',
    record_time DATETIME NOT NULL COMMENT '记录时间',
    operator_id BIGINT COMMENT '经办人ID',
    operator_name VARCHAR(50) COMMENT '经办人姓名',
    water_meter_reading DECIMAL(10,2) COMMENT '水表读数',
    electricity_meter_reading DECIMAL(10,2) COMMENT '电表读数',
    gas_meter_reading DECIMAL(10,2) COMMENT '燃气表读数',
    key_count INT COMMENT '钥匙数量',
    door_card_count INT COMMENT '门禁卡数量',
    check_items VARCHAR(2000) COMMENT '物品检查清单（JSON格式）',
    check_result VARCHAR(20) COMMENT '检查结果：NORMAL-正常，DAMAGED-有损坏',
    damage_description VARCHAR(500) COMMENT '损坏情况说明',
    signature_image VARCHAR(500) COMMENT '签字图片URL',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    INDEX idx_record_no(record_no),
    INDEX idx_contract_id(contract_id),
    INDEX idx_tenant_id(tenant_id),
    INDEX idx_apartment_id(apartment_id),
    INDEX idx_record_type(record_type),
    INDEX idx_record_date(record_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='入住记录表';

-- =============================================
-- 12. 消息通知表
-- =============================================
DROP TABLE IF EXISTS notification;
CREATE TABLE notification (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    notification_no VARCHAR(50) NOT NULL UNIQUE COMMENT '通知编号',
    user_type VARCHAR(20) NOT NULL COMMENT '接收方类型：TENANT-租客，OPERATOR-运营，ADMIN-管理员',
    user_id BIGINT COMMENT '接收方ID',
    user_name VARCHAR(50) COMMENT '接收方姓名',
    user_phone VARCHAR(20) COMMENT '接收方手机号',
    notification_type VARCHAR(50) NOT NULL COMMENT '通知类型：PAYMENT_REMINDER-缴费提醒，PAYMENT_SUCCESS-缴费成功，PASSWORD_SEND-密码下发，REPAIR_STATUS-报修进度，EXPIRE_REMINDER-到期提醒，OVERDUE_REMINDER-逾期提醒',
    title VARCHAR(200) NOT NULL COMMENT '通知标题',
    content VARCHAR(2000) NOT NULL COMMENT '通知内容',
    channel VARCHAR(20) NOT NULL DEFAULT 'SYSTEM' COMMENT '发送渠道：SYSTEM-系统消息，SMS-短信，APP_PUSH-APP推送',
    send_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '发送状态：PENDING-待发送，SUCCESS-发送成功，FAILED-发送失败',
    send_time DATETIME COMMENT '发送时间',
    read_status TINYINT NOT NULL DEFAULT 0 COMMENT '阅读状态：0-未读，1-已读',
    read_time DATETIME COMMENT '阅读时间',
    related_type VARCHAR(50) COMMENT '关联业务类型：CONTRACT, BILL, REPAIR等',
    related_id BIGINT COMMENT '关联业务ID',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    INDEX idx_notification_no(notification_no),
    INDEX idx_user_id(user_id),
    INDEX idx_notification_type(notification_type),
    INDEX idx_send_status(send_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='消息通知表';

-- =============================================
-- 13. 操作日志表
-- =============================================
DROP TABLE IF EXISTS operation_log;
CREATE TABLE operation_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    log_no VARCHAR(50) NOT NULL UNIQUE COMMENT '日志编号',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    operation_type VARCHAR(50) NOT NULL COMMENT '操作类型：CREATE, UPDATE, DELETE, SEND_PASSWORD, GENERATE_BILL等',
    module VARCHAR(50) NOT NULL COMMENT '操作模块：APARTMENT, TENANT, CONTRACT, LOCK_PASSWORD, BILL, REPAIR等',
    content VARCHAR(2000) NOT NULL COMMENT '操作内容',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    user_agent VARCHAR(500) COMMENT '用户代理',
    operation_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_log_no(log_no),
    INDEX idx_operator_id(operator_id),
    INDEX idx_module(module),
    INDEX idx_operation_time(operation_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- =============================================
-- 初始化数据
-- =============================================

-- 初始化系统用户（密码：123456，MD5加密后）
INSERT INTO sys_user (username, password, real_name, phone, role, status) VALUES
('admin', 'e10adc3949ba59abbe56e057f20f883e', '系统管理员', '13800138000', 'ADMIN', 1),
('operator1', 'e10adc3949ba59abbe56e057f20f883e', '运营员小王', '13800138001', 'OPERATOR', 1);

-- 初始化房源数据
INSERT INTO apartment (apartment_no, building, floor, room_no, area, room_type, decoration, furniture, monthly_rent, deposit, status, address, description) VALUES
('APT001', '1栋', '3层', '301', 45.00, '一室一厅', '精装', '床、衣柜、沙发、电视、空调、冰箱、洗衣机', 2500.00, 5000.00, 'VACANT', '朝阳区阳光花园1栋301', '朝南，采光好，近地铁'),
('APT002', '1栋', '5层', '502', 65.00, '两室一厅', '精装', '床、衣柜、沙发、电视、空调、冰箱、洗衣机、餐桌椅', 3500.00, 7000.00, 'VACANT', '朝阳区阳光花园1栋502', '南北通透，精装修'),
('APT003', '2栋', '2层', '201', 35.00, '单间', '简装', '床、衣柜、空调', 1800.00, 3600.00, 'VACANT', '朝阳区阳光花园2栋201', '单间带独立卫生间'),
('APT004', '2栋', '8层', '803', 55.00, '一室一厅', '豪装', '智能家居，品牌家电', 4000.00, 8000.00, 'VACANT', '朝阳区阳光花园2栋803', '豪华装修，拎包入住'),
('APT005', '3栋', '6层', '602', 75.00, '两室一厅', '精装', '床、衣柜、沙发、电视、空调、冰箱、洗衣机', 3800.00, 7600.00, 'VACANT', '朝阳区阳光花园3栋602', '楼层佳，视野好');

-- 初始化智能门锁数据
INSERT INTO door_lock (lock_no, lock_model, lock_brand, apartment_id, apartment_no, install_time, battery_level, network_status, lock_status, status) VALUES
('LOCK001', 'S1-Pro', '小米', 1, 'APT001', '2024-01-01 10:00:00', 85, 'ONLINE', 'NORMAL', 1),
('LOCK002', 'S1-Pro', '小米', 2, 'APT002', '2024-01-01 10:30:00', 92, 'ONLINE', 'NORMAL', 1),
('LOCK003', 'S1-Pro', '小米', 3, 'APT003', '2024-01-01 11:00:00', 78, 'ONLINE', 'NORMAL', 1),
('LOCK004', 'S1-Pro', '小米', 4, 'APT004', '2024-01-01 11:30:00', 95, 'ONLINE', 'NORMAL', 1),
('LOCK005', 'S1-Pro', '小米', 5, 'APT005', '2024-01-01 14:00:00', 88, 'ONLINE', 'NORMAL', 1);

-- 初始化租客数据
INSERT INTO tenant (tenant_no, name, phone, id_card, gender, age, work_unit, emergency_contact, emergency_phone, status) VALUES
('T001', '张三', '13900139001', '110101199001011234', 'MALE', 34, '科技公司', '张父', '13900139002', 'NORMAL'),
('T002', '李四', '13900139003', '110101199202022345', 'FEMALE', 32, '教育机构', '李母', '13900139004', 'NORMAL'),
('T003', '王五', '13900139005', '110101198803033456', 'MALE', 36, '金融公司', '王妻', '13900139006', 'NORMAL');

-- =============================================
-- 创建定时任务所需的事件调度器（如果需要）
-- =============================================
SET GLOBAL event_scheduler = ON;

-- 每日检查密码过期事件
DROP EVENT IF EXISTS event_check_password_expire;
CREATE EVENT event_check_password_expire
ON SCHEDULE EVERY 1 DAY STARTS DATE_ADD(CURDATE(), INTERVAL 1 HOUR)
DO
    UPDATE lock_password SET status = 'EXPIRED'
    WHERE status = 'ACTIVE' AND expire_time <= NOW();

-- 每日检查账单逾期事件
DROP EVENT IF EXISTS event_check_bill_overdue;
CREATE EVENT event_check_bill_overdue
ON SCHEDULE EVERY 1 DAY STARTS DATE_ADD(CURDATE(), INTERVAL 2 HOUR)
DO
    UPDATE rent_bill SET status = 'OVERDUE'
    WHERE status IN ('UNPAID', 'PARTIAL') AND due_date < CURDATE();

-- 每小时检查租约状态事件
DROP EVENT IF EXISTS event_check_contract_status;
CREATE EVENT event_check_contract_status
ON SCHEDULE EVERY 1 HOUR
DO
    UPDATE lease_contract SET status = 'EXPIRED'
    WHERE status = 'ACTIVE' AND end_date < CURDATE();

COMMIT;
