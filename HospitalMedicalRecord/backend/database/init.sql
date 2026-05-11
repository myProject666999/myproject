-- 医院病历管理系统数据库初始化脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS hospital_medical_record DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE hospital_medical_record;

-- 用户表（系统用户：管理员、护士、医生）
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码（加密存储）',
    role ENUM('admin', 'doctor', 'nurse') NOT NULL COMMENT '角色',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '联系电话',
    email VARCHAR(100) COMMENT '邮箱',
    status TINYINT DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT='系统用户表';

-- 医生信息表
CREATE TABLE IF NOT EXISTS doctors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT COMMENT '关联用户ID',
    employee_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工号',
    department VARCHAR(50) NOT NULL COMMENT '科室',
    title VARCHAR(50) COMMENT '职称',
    specialty VARCHAR(100) COMMENT '专长',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) COMMENT='医生信息表';

-- 护士信息表
CREATE TABLE IF NOT EXISTS nurses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT COMMENT '关联用户ID',
    employee_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工号',
    department VARCHAR(50) NOT NULL COMMENT '科室',
    title VARCHAR(50) COMMENT '职称',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) COMMENT='护士信息表';

-- 病人表
CREATE TABLE IF NOT EXISTS patients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_no VARCHAR(50) NOT NULL UNIQUE COMMENT '病历号',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    gender ENUM('male', 'female') NOT NULL COMMENT '性别',
    birth_date DATE COMMENT '出生日期',
    id_card VARCHAR(18) COMMENT '身份证号',
    phone VARCHAR(20) COMMENT '联系电话',
    address VARCHAR(255) COMMENT '地址',
    emergency_contact VARCHAR(50) COMMENT '紧急联系人',
    emergency_phone VARCHAR(20) COMMENT '紧急联系电话',
    allergies TEXT COMMENT '过敏史',
    medical_history TEXT COMMENT '既往病史',
    status TINYINT DEFAULT 1 COMMENT '状态：1-在院，0-出院',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT='病人表';

-- 病历表
CREATE TABLE IF NOT EXISTS medical_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    record_no VARCHAR(50) NOT NULL UNIQUE COMMENT '病历编号',
    patient_id BIGINT NOT NULL COMMENT '病人ID',
    doctor_id BIGINT COMMENT '主治医生ID',
    diagnosis TEXT COMMENT '诊断结果',
    symptoms TEXT COMMENT '主诉症状',
    examination TEXT COMMENT '检查结果',
    treatment_plan TEXT COMMENT '治疗方案',
    prescription TEXT COMMENT '处方',
    notes TEXT COMMENT '备注',
    record_date DATE COMMENT '就诊日期',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
) COMMENT='病历表';

-- 药品表
CREATE TABLE IF NOT EXISTS medicines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    medicine_no VARCHAR(50) NOT NULL UNIQUE COMMENT '药品编号',
    name VARCHAR(100) NOT NULL COMMENT '药品名称',
    generic_name VARCHAR(100) COMMENT '通用名',
    manufacturer VARCHAR(100) COMMENT '生产厂家',
    specification VARCHAR(50) COMMENT '规格',
    dosage_form VARCHAR(50) COMMENT '剂型',
    category VARCHAR(50) COMMENT '药品分类',
    unit VARCHAR(20) COMMENT '单位',
    price DECIMAL(10, 2) COMMENT '价格',
    stock INT DEFAULT 0 COMMENT '库存数量',
    description TEXT COMMENT '药品说明',
    image_url VARCHAR(255) COMMENT '药品图片URL',
    status TINYINT DEFAULT 1 COMMENT '状态：1-可用，0-停用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT='药品表';

-- 插入初始管理员账户（密码：admin123）
INSERT INTO users (username, password, role, real_name, phone, email, status) VALUES
('admin', '$2a$10$qq3zmhm9wpS1hS2AtvP2Vu0y.UYu4cqrRc969yQE9Zf1HTlIn1l7G', 'admin', '系统管理员', '13800138000', 'admin@hospital.com', 1);

-- 插入测试数据（密码：admin123）
INSERT INTO users (username, password, role, real_name, phone, email, status) VALUES
('doctor01', '$2a$10$qq3zmhm9wpS1hS2AtvP2Vu0y.UYu4cqrRc969yQE9Zf1HTlIn1l7G', 'doctor', '张医生', '13900139001', 'doctor01@hospital.com', 1),
('nurse01', '$2a$10$qq3zmhm9wpS1hS2AtvP2Vu0y.UYu4cqrRc969yQE9Zf1HTlIn1l7G', 'nurse', '李护士', '13900139002', 'nurse01@hospital.com', 1);

INSERT INTO doctors (user_id, employee_no, department, title, specialty) VALUES
(2, 'DOC20240001', '内科', '主任医师', '心血管疾病'),
(NULL, 'DOC20240002', '外科', '副主任医师', '普外科'),
(NULL, 'DOC20240003', '儿科', '主治医师', '小儿呼吸系统疾病');

INSERT INTO nurses (user_id, employee_no, department, title) VALUES
(3, 'NUR20240001', '内科', '主管护师'),
(NULL, 'NUR20240002', '外科', '护师'),
(NULL, 'NUR20240003', '儿科', '护士');

INSERT INTO patients (patient_no, name, gender, birth_date, id_card, phone, address, emergency_contact, emergency_phone, allergies, medical_history, status) VALUES
('PAT20240001', '王小明', 'male', '1985-03-15', '110101198503151234', '13800138001', '北京市朝阳区', '王大明', '13800138002', '青霉素过敏', '高血压病史3年', 1),
('PAT20240002', '李小红', 'female', '1990-07-20', '110101199007205678', '13800138003', '北京市海淀区', '李小刚', '13800138004', '无', '无', 1),
('PAT20240003', '张三', 'male', '1978-11-05', '110101197811059012', '13800138005', '北京市西城区', '张四', '13800138006', '海鲜过敏', '糖尿病病史5年', 0);

INSERT INTO medical_records (record_no, patient_id, doctor_id, diagnosis, symptoms, examination, treatment_plan, prescription, notes, record_date) VALUES
('REC20240001', 1, 1, '高血压3级', '头晕、头痛一周，伴胸闷', '血压160/100mmHg，心电图正常', '降压治疗，定期监测血压', '硝苯地平缓释片 20mg bid', '建议低盐低脂饮食', '2024-01-15'),
('REC20240002', 2, 3, '急性上呼吸道感染', '发热、咳嗽、流涕3天', '体温38.5°C，咽部充血，血常规WBC正常', '对症支持治疗', '布洛芬混悬液，小儿氨酚黄那敏颗粒', '多喝温水，注意休息', '2024-01-16');

INSERT INTO medicines (medicine_no, name, generic_name, manufacturer, specification, dosage_form, category, unit, price, stock, description, status) VALUES
('MED001', '硝苯地平缓释片', '硝苯地平', '拜耳医药保健有限公司', '20mg*30片', '片剂', '心血管系统用药', '盒', 35.50, 100, '用于高血压、冠心病的治疗', 1),
('MED002', '阿莫西林胶囊', '阿莫西林', '华北制药股份有限公司', '0.25g*24粒', '胶囊剂', '抗生素', '盒', 12.80, 200, '用于敏感菌所致的呼吸道、泌尿道、皮肤软组织感染', 1),
('MED003', '布洛芬混悬液', '布洛芬', '强生制药有限公司', '100ml:2g', '混悬剂', '解热镇痛抗炎药', '瓶', 28.00, 150, '用于儿童普通感冒或流行性感冒引起的发热', 1),
('MED004', '奥美拉唑肠溶胶囊', '奥美拉唑', '阿斯利康制药有限公司', '20mg*14粒', '胶囊剂', '消化系统用药', '盒', 45.00, 80, '用于胃溃疡、十二指肠溃疡、反流性食管炎', 1),
('MED005', '头孢克洛分散片', '头孢克洛', '礼来苏州制药有限公司', '0.25g*6片', '片剂', '抗生素', '盒', 58.00, 120, '用于敏感菌所致的呼吸道、泌尿道感染', 1);
