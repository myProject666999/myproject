USE tcm_system;

DROP TABLE IF EXISTS herb_conflict;
DROP TABLE IF EXISTS follow_up;
DROP TABLE IF EXISTS decoction_order;
DROP TABLE IF EXISTS prescription_herb;
DROP TABLE IF EXISTS prescription;
DROP TABLE IF EXISTS prescription_template_herb;
DROP TABLE IF EXISTS prescription_template;
DROP TABLE IF EXISTS herb_inventory;
DROP TABLE IF EXISTS herb;
DROP TABLE IF EXISTS patient_diagnosis;
DROP TABLE IF EXISTS patient;

CREATE TABLE patient (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    gender TINYINT NOT NULL,
    age INT NOT NULL,
    phone VARCHAR(20),
    id_card VARCHAR(18),
    address VARCHAR(200),
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE patient_diagnosis (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    patient_id BIGINT NOT NULL,
    visit_date DATE NOT NULL,
    chief_complaint TEXT,
    present_history TEXT,
    past_history TEXT,
    tongue_condition VARCHAR(200),
    pulse_condition VARCHAR(200),
    diagnosis TEXT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_patient_id (patient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE herb (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    pinyin VARCHAR(100),
    alias VARCHAR(200),
    category VARCHAR(50),
    nature VARCHAR(50),
    meridian VARCHAR(100),
    efficacy TEXT,
    dosage_range VARCHAR(50),
    contraindication TEXT,
    description TEXT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE herb_inventory (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    herb_id BIGINT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2),
    batch_no VARCHAR(50),
    expire_date DATE,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_herb_id (herb_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE prescription_template (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    pinyin VARCHAR(200),
    source VARCHAR(200),
    category VARCHAR(50),
    composition TEXT,
    `usage` VARCHAR(200),
    efficacy TEXT,
    indication TEXT,
    contraindication TEXT,
    is_classic TINYINT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE prescription_template_herb (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    template_id BIGINT NOT NULL,
    herb_id BIGINT NOT NULL,
    dosage DECIMAL(10,2) NOT NULL,
    note VARCHAR(200),
    sort_order INT DEFAULT 0,
    INDEX idx_template_id (template_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE prescription (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    patient_id BIGINT NOT NULL,
    diagnosis_id BIGINT,
    template_id BIGINT,
    prescription_no VARCHAR(50) NOT NULL,
    doctor_name VARCHAR(50),
    visit_date DATE NOT NULL,
    diagnosis_text TEXT,
    treatment TEXT,
    total_dosage INT DEFAULT 1,
    `usage` VARCHAR(200),
    note TEXT,
    status TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_prescription_no (prescription_no),
    INDEX idx_patient_id (patient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE prescription_herb (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    prescription_id BIGINT NOT NULL,
    herb_id BIGINT NOT NULL,
    herb_name VARCHAR(50),
    dosage DECIMAL(10,2) NOT NULL,
    note VARCHAR(200),
    sort_order INT DEFAULT 0,
    INDEX idx_prescription_id (prescription_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE decoction_order (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    prescription_id BIGINT NOT NULL,
    order_no VARCHAR(50) NOT NULL,
    decoction_type VARCHAR(50),
    package_count INT,
    operator VARCHAR(50),
    start_time DATETIME,
    complete_time DATETIME,
    status TINYINT DEFAULT 1,
    note TEXT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_order_no (order_no),
    INDEX idx_prescription_id (prescription_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE follow_up (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    patient_id BIGINT NOT NULL,
    last_prescription_id BIGINT,
    visit_date DATE NOT NULL,
    `condition` TEXT,
    curative_effect VARCHAR(100),
    adjustment TEXT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_patient_id (patient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE herb_conflict (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    herb_a_id BIGINT NOT NULL,
    herb_a_name VARCHAR(50) NOT NULL,
    herb_b_id BIGINT NOT NULL,
    herb_b_name VARCHAR(50) NOT NULL,
    conflict_type TINYINT NOT NULL,
    description TEXT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
