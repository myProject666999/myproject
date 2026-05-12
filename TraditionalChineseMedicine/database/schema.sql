-- 中医诊所辨证开方系统数据库设计

-- 创建数据库
CREATE DATABASE IF NOT EXISTS tcm_system DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tcm_system;

-- 患者信息表
CREATE TABLE IF NOT EXISTS patient (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '患者ID',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    gender TINYINT NOT NULL COMMENT '性别：1男 2女',
    age INT NOT NULL COMMENT '年龄',
    phone VARCHAR(20) COMMENT '联系电话',
    id_card VARCHAR(18) COMMENT '身份证号',
    address VARCHAR(200) COMMENT '住址',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='患者信息表';

-- 患者四诊信息表
CREATE TABLE IF NOT EXISTS patient_diagnosis (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '诊断ID',
    patient_id BIGINT NOT NULL COMMENT '患者ID',
    visit_date DATE NOT NULL COMMENT '就诊日期',
    chief_complaint TEXT COMMENT '主诉',
    present_history TEXT COMMENT '现病史',
    past_history TEXT COMMENT '既往史',
    tongue_condition VARCHAR(200) COMMENT '舌象',
    pulse_condition VARCHAR(200) COMMENT '脉象',
    diagnosis TEXT COMMENT '辨证结论',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_patient_id (patient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='患者四诊信息表';

-- 中药材表
CREATE TABLE IF NOT EXISTS herb (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '药材ID',
    name VARCHAR(50) NOT NULL COMMENT '药材名称',
    pinyin VARCHAR(100) COMMENT '拼音',
    alias VARCHAR(200) COMMENT '别名',
    category VARCHAR(50) COMMENT '分类',
    nature VARCHAR(50) COMMENT '性味',
    meridian VARCHAR(100) COMMENT '归经',
    efficacy TEXT COMMENT '功效',
    dosage_range VARCHAR(50) COMMENT '用量范围',
    contraindication TEXT COMMENT '禁忌',
    description TEXT COMMENT '描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='中药材表';

-- 药材库存表
CREATE TABLE IF NOT EXISTS herb_inventory (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '库存ID',
    herb_id BIGINT NOT NULL COMMENT '药材ID',
    quantity DECIMAL(10,2) NOT NULL COMMENT '库存数量（克）',
    unit_price DECIMAL(10,2) COMMENT '单价（元/克）',
    batch_no VARCHAR(50) COMMENT '批次号',
    expire_date DATE COMMENT '有效期',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_herb_id (herb_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='药材库存表';

-- 方剂模板表
CREATE TABLE IF NOT EXISTS prescription_template (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '模板ID',
    name VARCHAR(100) NOT NULL COMMENT '方剂名称',
    pinyin VARCHAR(200) COMMENT '拼音',
    source VARCHAR(200) COMMENT '来源',
    category VARCHAR(50) COMMENT '分类',
    composition TEXT COMMENT '组成',
    usage VARCHAR(200) COMMENT '用法',
    efficacy TEXT COMMENT '功效',
    indication TEXT COMMENT '主治',
    contraindication TEXT COMMENT '禁忌',
    is_classic TINYINT DEFAULT 0 COMMENT '是否为经典方剂：0否 1是',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='方剂模板表';

-- 方剂模板药材明细表
CREATE TABLE IF NOT EXISTS prescription_template_herb (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '明细ID',
    template_id BIGINT NOT NULL COMMENT '模板ID',
    herb_id BIGINT NOT NULL COMMENT '药材ID',
    dosage DECIMAL(10,2) NOT NULL COMMENT '剂量（克）',
    note VARCHAR(200) COMMENT '备注（如先煎、后下等）',
    sort_order INT DEFAULT 0 COMMENT '排序',
    INDEX idx_template_id (template_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='方剂模板药材明细表';

-- 处方主表
CREATE TABLE IF NOT EXISTS prescription (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '处方ID',
    patient_id BIGINT NOT NULL COMMENT '患者ID',
    diagnosis_id BIGINT COMMENT '诊断ID',
    template_id BIGINT COMMENT '使用的模板ID',
    prescription_no VARCHAR(50) NOT NULL COMMENT '处方编号',
    doctor_name VARCHAR(50) COMMENT '医生姓名',
    visit_date DATE NOT NULL COMMENT '就诊日期',
    diagnosis_text TEXT COMMENT '辨证',
    treatment TEXT COMMENT '治法',
    total_dosage INT DEFAULT 1 COMMENT '剂数',
    usage VARCHAR(200) COMMENT '用法',
    note TEXT COMMENT '医嘱',
    status TINYINT DEFAULT 1 COMMENT '状态：1待煎药 2煎药中 3已完成 4已取药',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_prescription_no (prescription_no),
    INDEX idx_patient_id (patient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='处方主表';

-- 处方药材明细表
CREATE TABLE IF NOT EXISTS prescription_herb (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '明细ID',
    prescription_id BIGINT NOT NULL COMMENT '处方ID',
    herb_id BIGINT NOT NULL COMMENT '药材ID',
    herb_name VARCHAR(50) COMMENT '药材名称',
    dosage DECIMAL(10,2) NOT NULL COMMENT '剂量（克）',
    note VARCHAR(200) COMMENT '备注',
    sort_order INT DEFAULT 0 COMMENT '排序',
    INDEX idx_prescription_id (prescription_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='处方药材明细表';

-- 代煎工单表
CREATE TABLE IF NOT EXISTS decoction_order (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '工单ID',
    prescription_id BIGINT NOT NULL COMMENT '处方ID',
    order_no VARCHAR(50) NOT NULL COMMENT '工单编号',
    decoction_type VARCHAR(50) COMMENT '煎药方式',
    package_count INT COMMENT '包装数量',
    operator VARCHAR(50) COMMENT '操作人员',
    start_time DATETIME COMMENT '开始时间',
    complete_time DATETIME COMMENT '完成时间',
    status TINYINT DEFAULT 1 COMMENT '状态：1待煎 2煎药中 3已完成 4已取药',
    note TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_order_no (order_no),
    INDEX idx_prescription_id (prescription_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='代煎工单表';

-- 复诊记录表
CREATE TABLE IF NOT EXISTS follow_up (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '复诊ID',
    patient_id BIGINT NOT NULL COMMENT '患者ID',
    last_prescription_id BIGINT COMMENT '上次处方ID',
    visit_date DATE NOT NULL COMMENT '复诊日期',
    condition TEXT COMMENT '服药后情况',
    curative_effect VARCHAR(100) COMMENT '疗效评估',
    adjustment TEXT COMMENT '调整内容',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_patient_id (patient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='复诊记录表';

-- 十八反十九畏配置表
CREATE TABLE IF NOT EXISTS herb_conflict (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    herb_a_id BIGINT NOT NULL COMMENT '药材A ID',
    herb_a_name VARCHAR(50) NOT NULL COMMENT '药材A名称',
    herb_b_id BIGINT NOT NULL COMMENT '药材B ID',
    herb_b_name VARCHAR(50) NOT NULL COMMENT '药材B名称',
    conflict_type TINYINT NOT NULL COMMENT '冲突类型：1十八反 2十九畏',
    description TEXT COMMENT '描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='十八反十九畏配置表';
