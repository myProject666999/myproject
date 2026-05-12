CREATE DATABASE IF NOT EXISTS dental_clinic DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE dental_clinic;

CREATE TABLE IF NOT EXISTS clinic (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) COMMENT '诊所名称',
    address VARCHAR(255) COMMENT '地址',
    phone VARCHAR(20) COMMENT '电话',
    license VARCHAR(50) COMMENT '营业执照号',
    status INT DEFAULT 1 COMMENT '状态 1启用 0禁用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE COMMENT '用户名',
    password VARCHAR(255) COMMENT '密码',
    name VARCHAR(50) COMMENT '姓名',
    phone VARCHAR(20) COMMENT '电话',
    email VARCHAR(100) COMMENT '邮箱',
    role VARCHAR(20) COMMENT '角色 ADMIN-管理员 DOCTOR-医生 RECEPTION-前台',
    clinic_id BIGINT COMMENT '诊所ID',
    status INT DEFAULT 1 COMMENT '状态 1启用 0禁用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS doctor (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT COMMENT '用户ID',
    name VARCHAR(50) COMMENT '医生姓名',
    title VARCHAR(50) COMMENT '职称',
    specialty VARCHAR(100) COMMENT '专长',
    license_number VARCHAR(50) COMMENT '执业证号',
    phone VARCHAR(20) COMMENT '电话',
    clinic_id BIGINT COMMENT '诊所ID',
    avatar VARCHAR(255) COMMENT '头像',
    introduction TEXT COMMENT '简介',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status INT DEFAULT 1 COMMENT '状态 1启用 0禁用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS patient (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) COMMENT '姓名',
    gender VARCHAR(10) COMMENT '性别',
    birth_date DATE COMMENT '出生日期',
    phone VARCHAR(20) COMMENT '电话',
    email VARCHAR(100) COMMENT '邮箱',
    id_card VARCHAR(18) COMMENT '身份证号',
    address VARCHAR(255) COMMENT '地址',
    marital_status VARCHAR(20) COMMENT '婚姻状况',
    occupation VARCHAR(50) COMMENT '职业',
    medical_history TEXT COMMENT '病史',
    allergy_history TEXT COMMENT '过敏史',
    emergency_contact VARCHAR(50) COMMENT '紧急联系人',
    emergency_phone VARCHAR(20) COMMENT '紧急联系电话',
    remark TEXT COMMENT '备注',
    clinic_id BIGINT COMMENT '诊所ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS schedule (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    doctor_id BIGINT COMMENT '医生ID',
    clinic_id BIGINT COMMENT '诊所ID',
    schedule_date DATE COMMENT '排班日期',
    start_time TIME COMMENT '开始时间',
    end_time TIME COMMENT '结束时间',
    total_slots INT COMMENT '总号源数',
    booked_slots INT DEFAULT 0 COMMENT '已预约数',
    description VARCHAR(255) COMMENT '描述',
    status INT DEFAULT 1 COMMENT '状态 1启用 0禁用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS appointment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    appointment_no VARCHAR(50) UNIQUE COMMENT '预约号',
    patient_id BIGINT COMMENT '患者ID',
    doctor_id BIGINT COMMENT '医生ID',
    clinic_id BIGINT COMMENT '诊所ID',
    schedule_id BIGINT COMMENT '排班ID',
    appointment_date DATE COMMENT '预约日期',
    appointment_time TIME COMMENT '预约时间',
    service_type VARCHAR(50) COMMENT '服务类型',
    description VARCHAR(255) COMMENT '描述',
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT '状态 PENDING待确认 CONFIRMED已确认 COMPLETED已完成 CANCELLED已取消',
    remark TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS treatment_plan (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    plan_no VARCHAR(50) UNIQUE COMMENT '计划编号',
    patient_id BIGINT COMMENT '患者ID',
    doctor_id BIGINT COMMENT '医生ID',
    clinic_id BIGINT COMMENT '诊所ID',
    diagnosis TEXT COMMENT '诊断',
    treatment_content TEXT COMMENT '治疗内容',
    tooth_positions VARCHAR(255) COMMENT '涉及牙齿位置(逗号分隔的FDI编号)',
    total_stages INT DEFAULT 1 COMMENT '总阶段数',
    current_stage INT DEFAULT 0 COMMENT '当前阶段',
    total_amount DECIMAL(10,2) DEFAULT 0 COMMENT '总金额',
    paid_amount DECIMAL(10,2) DEFAULT 0 COMMENT '已付金额',
    status VARCHAR(20) DEFAULT 'IN_PROGRESS' COMMENT '状态 IN_PROGRESS进行中 PAID已付 COMPLETED已完成',
    expected_start_date DATE COMMENT '预计开始日期',
    expected_end_date DATE COMMENT '预计结束日期',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS treatment_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    record_no VARCHAR(50) UNIQUE COMMENT '记录编号',
    patient_id BIGINT COMMENT '患者ID',
    doctor_id BIGINT COMMENT '医生ID',
    appointment_id BIGINT COMMENT '预约ID',
    clinic_id BIGINT COMMENT '诊所ID',
    diagnosis TEXT COMMENT '诊断',
    treatment_plan TEXT COMMENT '治疗方案',
    treatment_content TEXT COMMENT '治疗内容',
    tooth_positions VARCHAR(255) COMMENT '涉及牙齿位置(逗号分隔的FDI编号)',
    amount DECIMAL(10,2) DEFAULT 0 COMMENT '金额',
    paid_amount DECIMAL(10,2) DEFAULT 0 COMMENT '已付金额',
    payment_status VARCHAR(20) DEFAULT 'UNPAID' COMMENT '付款状态 UNPAID未付 PARTIAL部分 PAID已付',
    remark TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tooth_status (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT COMMENT '患者ID',
    tooth_number INT COMMENT 'FDI牙齿编号',
    status VARCHAR(50) COMMENT '牙齿状态 NORMAL正常 MISSING缺失 IMPLANT种植 CROWN冠修复 BRIDGE桥修复',
    tooth_condition TEXT COMMENT '牙齿状况描述',
    remark TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS medical_image (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT COMMENT '患者ID',
    treatment_record_id BIGINT COMMENT '治疗记录ID',
    image_type VARCHAR(50) COMMENT '影像类型 X_RAY X光 CT CBCT口腔全景',
    image_name VARCHAR(255) COMMENT '影像名称',
    image_path VARCHAR(255) COMMENT '影像路径',
    tooth_positions VARCHAR(255) COMMENT '涉及牙齿',
    description TEXT COMMENT '描述',
    take_date DATETIME COMMENT '拍摄日期',
    uploader_id BIGINT COMMENT '上传人ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS payment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_no VARCHAR(50) UNIQUE COMMENT '缴费单号',
    patient_id BIGINT COMMENT '患者ID',
    treatment_plan_id BIGINT COMMENT '治疗计划ID',
    treatment_record_id BIGINT COMMENT '治疗记录ID',
    clinic_id BIGINT COMMENT '诊所ID',
    amount DECIMAL(10,2) DEFAULT 0 COMMENT '金额',
    payment_method VARCHAR(50) COMMENT '支付方式 CASH现金 CARD刷卡 WECHAT微信 ALIPAY支付宝',
    remark TEXT COMMENT '备注',
    operator_id BIGINT COMMENT '操作员ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS reminder (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT COMMENT '患者ID',
    appointment_id BIGINT COMMENT '预约ID',
    treatment_plan_id BIGINT COMMENT '治疗计划ID',
    reminder_type VARCHAR(50) COMMENT '提醒类型 APPOINTMENT预约 TREATMENT治疗复查',
    title VARCHAR(100) COMMENT '标题',
    content TEXT COMMENT '内容',
    reminder_time DATETIME COMMENT '提醒时间',
    sent_time DATETIME COMMENT '发送时间',
    send_method VARCHAR(50) COMMENT '发送方式 SMS短信 EMAIL邮件',
    send_status INT DEFAULT 0 COMMENT '发送状态 0未发送 1已发送',
    read_status INT DEFAULT 0 COMMENT '读取状态 0未读 1已读',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO clinic (name, address, phone, license, status) VALUES 
('阳光口腔诊所', '北京市朝阳区建国路88号', '010-12345678', '1234567890', 1);

INSERT INTO sys_user (username, password, name, phone, email, role, clinic_id, status) VALUES 
('admin', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '系统管理员', '13800138000', 'admin@example.com', 'ADMIN', 1, 1);

INSERT INTO doctor (name, title, specialty, license_number, phone, clinic_id, introduction, sort_order, status) VALUES 
('张医生', '主任医师', '口腔修复、种植牙', '12345', '13900139001', 1, '从事口腔临床工作20年，擅长口腔修复和种植牙技术', 1, 1),
('李医生', '副主任医师', '牙齿矫正、儿童牙科', '67890', '13900139002', 1, '擅长各类错颌畸形的正畸治疗及儿童牙病防治', 2, 1);

INSERT INTO patient (name, gender, birth_date, phone, email, id_card, address, medical_history, allergy_history, clinic_id) VALUES 
('张三', '男', '1985-05-15', '13812345678', 'zhangsan@example.com', '110101198505151234', '北京市海淀区中关村大街1号', '无特殊病史', '青霉素过敏', 1),
('李四', '女', '1990-08-20', '13887654321', 'lisi@example.com', '110101199008201234', '北京市西城区西单北大街1号', '高血压', '无', 1);
