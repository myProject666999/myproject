-- 创建数据库
CREATE DATABASE IF NOT EXISTS health_appointment DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE health_appointment;

-- 科室表
CREATE TABLE IF NOT EXISTS department (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    name VARCHAR(100) NOT NULL COMMENT '科室名称',
    description VARCHAR(500) COMMENT '科室描述',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态 1启用 0禁用',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='科室表';

-- 医生表
CREATE TABLE IF NOT EXISTS doctor (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    department_id BIGINT NOT NULL COMMENT '科室ID',
    name VARCHAR(50) NOT NULL COMMENT '医生姓名',
    title VARCHAR(50) COMMENT '职称',
    avatar VARCHAR(255) COMMENT '头像',
    introduction TEXT COMMENT '医生简介',
    skill VARCHAR(500) COMMENT '擅长',
    status TINYINT DEFAULT 1 COMMENT '状态 1启用 0禁用',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_department_id (department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='医生表';

-- 患者表
CREATE TABLE IF NOT EXISTS patient (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    name VARCHAR(50) NOT NULL COMMENT '患者姓名',
    phone VARCHAR(20) NOT NULL COMMENT '手机号',
    id_card VARCHAR(18) COMMENT '身份证号',
    gender TINYINT COMMENT '性别 1男 2女',
    age INT COMMENT '年龄',
    address VARCHAR(255) COMMENT '地址',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='患者表';

-- 排班表
CREATE TABLE IF NOT EXISTS schedule (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    doctor_id BIGINT NOT NULL COMMENT '医生ID',
    department_id BIGINT NOT NULL COMMENT '科室ID',
    schedule_date DATE NOT NULL COMMENT '排班日期',
    time_period VARCHAR(20) NOT NULL COMMENT '时段 上午/下午/晚上',
    start_time TIME NOT NULL COMMENT '开始时间',
    end_time TIME NOT NULL COMMENT '结束时间',
    total_count INT DEFAULT 20 COMMENT '总号源数',
    remaining_count INT DEFAULT 20 COMMENT '剩余号源数',
    consult_fee DECIMAL(10,2) DEFAULT 0.00 COMMENT '挂号费',
    status TINYINT DEFAULT 1 COMMENT '状态 1可预约 0已约满/停诊',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_doctor_date (doctor_id, schedule_date),
    INDEX idx_department_date (department_id, schedule_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='排班表';

-- 预约表
CREATE TABLE IF NOT EXISTS appointment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    appointment_no VARCHAR(32) NOT NULL COMMENT '预约单号',
    patient_id BIGINT NOT NULL COMMENT '患者ID',
    schedule_id BIGINT NOT NULL COMMENT '排班ID',
    doctor_id BIGINT NOT NULL COMMENT '医生ID',
    department_id BIGINT NOT NULL COMMENT '科室ID',
    schedule_date DATE NOT NULL COMMENT '预约日期',
    time_period VARCHAR(20) NOT NULL COMMENT '时段',
    queue_number INT COMMENT '排队号',
    consult_fee DECIMAL(10,2) DEFAULT 0.00 COMMENT '挂号费',
    status TINYINT DEFAULT 1 COMMENT '状态 1待就诊 2已就诊 3已取消 4已爽约',
    cancel_reason VARCHAR(500) COMMENT '取消原因',
    cancel_time DATETIME COMMENT '取消时间',
    visit_time DATETIME COMMENT '就诊时间',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_appointment_no (appointment_no),
    INDEX idx_patient_id (patient_id),
    INDEX idx_schedule_id (schedule_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预约表';

-- 叫号表
CREATE TABLE IF NOT EXISTS queue_call (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    appointment_id BIGINT NOT NULL COMMENT '预约ID',
    schedule_id BIGINT NOT NULL COMMENT '排班ID',
    doctor_id BIGINT NOT NULL COMMENT '医生ID',
    patient_name VARCHAR(50) NOT NULL COMMENT '患者姓名',
    queue_number INT NOT NULL COMMENT '排队号',
    call_count INT DEFAULT 0 COMMENT '叫号次数',
    status TINYINT DEFAULT 0 COMMENT '状态 0待叫号 1叫号中 2已过号 3已就诊',
    first_call_time DATETIME COMMENT '首次叫号时间',
    last_call_time DATETIME COMMENT '最后叫号时间',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_schedule_doctor (schedule_id, doctor_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='叫号表';

-- 系统配置表
CREATE TABLE IF NOT EXISTS sys_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    config_key VARCHAR(50) NOT NULL COMMENT '配置键',
    config_value VARCHAR(500) COMMENT '配置值',
    description VARCHAR(200) COMMENT '配置描述',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_config_key (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';

-- 插入测试数据

-- 科室数据
INSERT INTO department (name, description, sort_order, status) VALUES
('内科', '内科主要诊治呼吸系统、循环系统、消化系统、内分泌系统等疾病', 1, 1),
('外科', '外科主要通过手术等方式治疗疾病', 2, 1),
('儿科', '专门针对儿童健康和疾病的医疗科室', 3, 1),
('妇产科', '专门针对女性生殖系统健康和孕期保健的医疗科室', 4, 1),
('眼科', '专门诊治眼部疾病的医疗科室', 5, 1),
('耳鼻喉科', '专门诊治耳、鼻、咽喉部位疾病的医疗科室', 6, 1),
('皮肤科', '专门诊治皮肤疾病的医疗科室', 7, 1),
('口腔科', '专门诊治口腔疾病的医疗科室', 8, 1);

-- 医生数据
INSERT INTO doctor (department_id, name, title, introduction, skill, status) VALUES
(1, '张医生', '主任医师', '从事内科临床工作20年，具有丰富的临床经验', '擅长高血压、糖尿病、冠心病等慢性病诊治', 1),
(1, '李医生', '副主任医师', '内科专家，擅长呼吸系统疾病诊治', '擅长肺炎、哮喘、慢性支气管炎等', 1),
(1, '王医生', '主治医师', '年轻有为的内科医生，对待患者耐心细致', '擅长消化系统疾病诊治', 1),
(2, '刘医生', '主任医师', '外科专家，曾在多家知名医院进修', '擅长普外科微创手术', 1),
(2, '陈医生', '副主任医师', '外科骨干医生，临床经验丰富', '擅长骨科相关手术', 1),
(3, '赵医生', '主任医师', '儿科专家，从医30年，深受患儿家长信赖', '擅长小儿呼吸系统、消化系统疾病', 1),
(3, '孙医生', '主治医师', '儿科医生，亲和力强', '擅长小儿常见病诊治', 1),
(4, '周医生', '主任医师', '妇产科专家，医术精湛', '擅长妇产科常见病、多发病诊治', 1),
(5, '吴医生', '副主任医师', '眼科专家，曾赴国外进修', '擅长白内障、青光眼等眼病诊治', 1),
(6, '郑医生', '主治医师', '耳鼻喉科医生，专业技术过硬', '擅长耳鼻喉科常见病诊治', 1),
(7, '冯医生', '副主任医师', '皮肤科专家，临床经验丰富', '擅长各类皮肤病诊治', 1),
(8, '蒋医生', '主治医师', '口腔科医生，医术精湛', '擅长牙齿疾病诊治及口腔美容', 1);

-- 患者数据
INSERT INTO patient (name, phone, id_card, gender, age, address) VALUES
('患者一', '13800138001', '110101199001011234', 1, 34, '北京市朝阳区'),
('患者二', '13800138002', '110101199102022345', 2, 33, '北京市海淀区'),
('患者三', '13800138003', '110101199203033456', 1, 32, '北京市西城区'),
('患者四', '13800138004', '110101199304044567', 2, 31, '北京市东城区'),
('患者五', '13800138005', '110101199405055678', 1, 30, '北京市丰台区');

-- 系统配置
INSERT INTO sys_config (config_key, config_value, description) VALUES
('cancel_limit_hours', '24', '预约取消限制时间（小时），就诊前多少小时内不能取消'),
('max_appointment_per_day', '2', '每人每天最大预约数'),
('queue_call_interval', '5', '叫号间隔时间（分钟）'),
('missed_appointment_limit', '3', '爽约次数限制，达到则限制预约');

-- 排班数据（生成未来7天的排班）
INSERT INTO schedule (doctor_id, department_id, schedule_date, time_period, start_time, end_time, total_count, remaining_count, consult_fee, status) VALUES
-- 内科医生排班
(1, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '上午', '08:00:00', '12:00:00', 20, 20, 50.00, 1),
(1, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '下午', '14:00:00', '17:30:00', 20, 20, 50.00, 1),
(1, 1, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '上午', '08:00:00', '12:00:00', 20, 20, 50.00, 1),
(1, 1, DATE_ADD(CURDATE(), INTERVAL 5 DAY), '上午', '08:00:00', '12:00:00', 20, 20, 50.00, 1),
(1, 1, DATE_ADD(CURDATE(), INTERVAL 5 DAY), '下午', '14:00:00', '17:30:00', 20, 20, 50.00, 1),
(2, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '上午', '08:00:00', '12:00:00', 20, 20, 40.00, 1),
(2, 1, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '下午', '14:00:00', '17:30:00', 20, 20, 40.00, 1),
(2, 1, DATE_ADD(CURDATE(), INTERVAL 4 DAY), '上午', '08:00:00', '12:00:00', 20, 20, 40.00, 1),
(2, 1, DATE_ADD(CURDATE(), INTERVAL 6 DAY), '上午', '08:00:00', '12:00:00', 20, 20, 40.00, 1),
(3, 1, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '上午', '08:00:00', '12:00:00', 25, 25, 30.00, 1),
(3, 1, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '下午', '14:00:00', '17:30:00', 25, 25, 30.00, 1),
(3, 1, DATE_ADD(CURDATE(), INTERVAL 5 DAY), '下午', '14:00:00', '17:30:00', 25, 25, 30.00, 1),
-- 外科医生排班
(4, 2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '上午', '08:00:00', '12:00:00', 15, 15, 60.00, 1),
(4, 2, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '上午', '08:00:00', '12:00:00', 15, 15, 60.00, 1),
(4, 2, DATE_ADD(CURDATE(), INTERVAL 4 DAY), '下午', '14:00:00', '17:30:00', 15, 15, 60.00, 1),
(5, 2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '下午', '14:00:00', '17:30:00', 20, 20, 45.00, 1),
(5, 2, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '上午', '08:00:00', '12:00:00', 20, 20, 45.00, 1),
(5, 2, DATE_ADD(CURDATE(), INTERVAL 5 DAY), '上午', '08:00:00', '12:00:00', 20, 20, 45.00, 1),
-- 儿科医生排班
(6, 3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '上午', '08:00:00', '12:00:00', 30, 30, 55.00, 1),
(6, 3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '下午', '14:00:00', '17:30:00', 30, 30, 55.00, 1),
(6, 3, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '上午', '08:00:00', '12:00:00', 30, 30, 55.00, 1),
(6, 3, DATE_ADD(CURDATE(), INTERVAL 4 DAY), '上午', '08:00:00', '12:00:00', 30, 30, 55.00, 1),
(7, 3, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '下午', '14:00:00', '17:30:00', 35, 35, 35.00, 1),
(7, 3, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '上午', '08:00:00', '12:00:00', 35, 35, 35.00, 1),
(7, 3, DATE_ADD(CURDATE(), INTERVAL 6 DAY), '上午', '08:00:00', '12:00:00', 35, 35, 35.00, 1),
-- 其他科室医生排班
(8, 4, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '上午', '08:00:00', '12:00:00', 15, 15, 55.00, 1),
(8, 4, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '上午', '08:00:00', '12:00:00', 15, 15, 55.00, 1),
(8, 4, DATE_ADD(CURDATE(), INTERVAL 5 DAY), '下午', '14:00:00', '17:30:00', 15, 15, 55.00, 1),
(9, 5, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '下午', '14:00:00', '17:30:00', 20, 20, 50.00, 1),
(9, 5, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '上午', '08:00:00', '12:00:00', 20, 20, 50.00, 1),
(9, 5, DATE_ADD(CURDATE(), INTERVAL 4 DAY), '上午', '08:00:00', '12:00:00', 20, 20, 50.00, 1),
(10, 6, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '上午', '08:00:00', '12:00:00', 25, 25, 35.00, 1),
(10, 6, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '下午', '14:00:00', '17:30:00', 25, 25, 35.00, 1),
(10, 6, DATE_ADD(CURDATE(), INTERVAL 6 DAY), '上午', '08:00:00', '12:00:00', 25, 25, 35.00, 1),
(11, 7, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '上午', '08:00:00', '12:00:00', 20, 20, 45.00, 1),
(11, 7, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '上午', '08:00:00', '12:00:00', 20, 20, 45.00, 1),
(11, 7, DATE_ADD(CURDATE(), INTERVAL 5 DAY), '下午', '14:00:00', '17:30:00', 20, 20, 45.00, 1),
(12, 8, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '下午', '14:00:00', '17:30:00', 15, 15, 40.00, 1),
(12, 8, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '上午', '08:00:00', '12:00:00', 15, 15, 40.00, 1),
(12, 8, DATE_ADD(CURDATE(), INTERVAL 4 DAY), '上午', '08:00:00', '12:00:00', 15, 15, 40.00, 1);
