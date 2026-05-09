-- 医院管理系统数据库表结构

-- 角色表
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL UNIQUE,
  `description` varchar(200) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 用户表
CREATE TABLE IF NOT EXISTS `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `name` varchar(50) NOT NULL,
  `role_id` int unsigned NOT NULL,
  `department_id` int unsigned DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `status` tinyint DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_role_id` (`role_id`),
  KEY `idx_department_id` (`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 科室表
CREATE TABLE IF NOT EXISTS `departments` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `code` varchar(20) DEFAULT NULL,
  `type` tinyint DEFAULT 1,
  `description` varchar(200) DEFAULT NULL,
  `status` tinyint DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 挂号级别表
CREATE TABLE IF NOT EXISTS `registration_levels` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `description` varchar(200) DEFAULT NULL,
  `status` tinyint DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 结算类别表
CREATE TABLE IF NOT EXISTS `settlement_categories` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` varchar(200) DEFAULT NULL,
  `status` tinyint DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 诊断目录表
CREATE TABLE IF NOT EXISTS `diagnosis_catalogs` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(20) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `pinyin_code` varchar(50) DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `status` tinyint DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`),
  KEY `idx_pinyin_code` (`pinyin_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 非药品收费项目表
CREATE TABLE IF NOT EXISTS `charge_items` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(20) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `category` varchar(50) DEFAULT NULL,
  `pinyin_code` varchar(50) DEFAULT NULL,
  `description` varchar(200) DEFAULT NULL,
  `status` tinyint DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`),
  KEY `idx_pinyin_code` (`pinyin_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 费用科目表
CREATE TABLE IF NOT EXISTS `expense_subjects` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `code` varchar(20) DEFAULT NULL,
  `description` varchar(200) DEFAULT NULL,
  `status` tinyint DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 药品表
CREATE TABLE IF NOT EXISTS `medicines` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(20) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `generic_name` varchar(100) DEFAULT NULL,
  `specification` varchar(50) DEFAULT NULL,
  `unit` varchar(20) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `manufacturer` varchar(100) DEFAULT NULL,
  `stock` int DEFAULT 0,
  `type` tinyint DEFAULT 1,
  `pinyin_code` varchar(50) DEFAULT NULL,
  `status` tinyint DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`),
  KEY `idx_pinyin_code` (`pinyin_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 医生排班表
CREATE TABLE IF NOT EXISTS `doctor_schedules` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `doctor_id` int unsigned NOT NULL,
  `department_id` int unsigned NOT NULL,
  `date` date NOT NULL,
  `shift` tinyint DEFAULT 1,
  `registration_level_id` int unsigned DEFAULT NULL,
  `max_patients` int DEFAULT 20,
  `current_patients` int DEFAULT 0,
  `status` tinyint DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_doctor_id` (`doctor_id`),
  KEY `idx_department_id` (`department_id`),
  KEY `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 患者表
CREATE TABLE IF NOT EXISTS `patients` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `medical_record_no` varchar(20) DEFAULT NULL,
  `name` varchar(50) NOT NULL,
  `gender` tinyint DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `id_card` varchar(18) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` varchar(200) DEFAULT NULL,
  `allergy_history` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_medical_record_no` (`medical_record_no`),
  KEY `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 挂号记录表
CREATE TABLE IF NOT EXISTS `registrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `registration_no` varchar(20) NOT NULL UNIQUE,
  `patient_id` int unsigned NOT NULL,
  `schedule_id` int unsigned NOT NULL,
  `doctor_id` int unsigned NOT NULL,
  `department_id` int unsigned NOT NULL,
  `registration_level_id` int unsigned NOT NULL,
  `settlement_category_id` int unsigned DEFAULT NULL,
  `fee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` tinyint DEFAULT 1,
  `queue_number` int DEFAULT NULL,
  `registered_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `seen_at` timestamp NULL DEFAULT NULL,
  `finished_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_patient_id` (`patient_id`),
  KEY `idx_doctor_id` (`doctor_id`),
  KEY `idx_department_id` (`department_id`),
  KEY `idx_registration_no` (`registration_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 病历表
CREATE TABLE IF NOT EXISTS `medical_records` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `registration_id` int unsigned NOT NULL,
  `patient_id` int unsigned NOT NULL,
  `doctor_id` int unsigned NOT NULL,
  `chief_complaint` varchar(500) DEFAULT NULL,
  `present_illness` varchar(1000) DEFAULT NULL,
  `past_medical_history` varchar(500) DEFAULT NULL,
  `physical_examination` varchar(1000) DEFAULT NULL,
  `auxiliary_examination` varchar(1000) DEFAULT NULL,
  `diagnosis` varchar(500) DEFAULT NULL,
  `treatment_advice` varchar(1000) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_registration_id` (`registration_id`),
  KEY `idx_patient_id` (`patient_id`),
  KEY `idx_doctor_id` (`doctor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 检查申请表
CREATE TABLE IF NOT EXISTS `examination_requests` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `request_no` varchar(20) NOT NULL UNIQUE,
  `registration_id` int unsigned NOT NULL,
  `patient_id` int unsigned NOT NULL,
  `doctor_id` int unsigned NOT NULL,
  `department_id` int unsigned NOT NULL,
  `exam_type` varchar(50) DEFAULT NULL,
  `exam_items` varchar(500) DEFAULT NULL,
  `clinical_info` varchar(500) DEFAULT NULL,
  `status` tinyint DEFAULT 1,
  `result` text,
  `technician_id` int unsigned DEFAULT NULL,
  `requested_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `examined_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_registration_id` (`registration_id`),
  KEY `idx_patient_id` (`patient_id`),
  KEY `idx_doctor_id` (`doctor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 检验申请表
CREATE TABLE IF NOT EXISTS `laboratory_requests` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `request_no` varchar(20) NOT NULL UNIQUE,
  `registration_id` int unsigned NOT NULL,
  `patient_id` int unsigned NOT NULL,
  `doctor_id` int unsigned NOT NULL,
  `department_id` int unsigned NOT NULL,
  `lab_type` varchar(50) DEFAULT NULL,
  `lab_items` varchar(500) DEFAULT NULL,
  `clinical_info` varchar(500) DEFAULT NULL,
  `status` tinyint DEFAULT 1,
  `result` text,
  `technician_id` int unsigned DEFAULT NULL,
  `requested_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `examined_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_registration_id` (`registration_id`),
  KEY `idx_patient_id` (`patient_id`),
  KEY `idx_doctor_id` (`doctor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 处方表
CREATE TABLE IF NOT EXISTS `prescriptions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `prescription_no` varchar(20) NOT NULL UNIQUE,
  `registration_id` int unsigned NOT NULL,
  `patient_id` int unsigned NOT NULL,
  `doctor_id` int unsigned NOT NULL,
  `department_id` int unsigned NOT NULL,
  `type` tinyint DEFAULT 1,
  `status` tinyint DEFAULT 1,
  `dispensed_at` timestamp NULL DEFAULT NULL,
  `dispensed_by` int unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_registration_id` (`registration_id`),
  KEY `idx_patient_id` (`patient_id`),
  KEY `idx_doctor_id` (`doctor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 处方详情表
CREATE TABLE IF NOT EXISTS `prescription_items` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `prescription_id` int unsigned NOT NULL,
  `medicine_id` int unsigned NOT NULL,
  `medicine_name` varchar(100) NOT NULL,
  `specification` varchar(50) DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT 0,
  `unit` varchar(20) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `dosage` varchar(100) DEFAULT NULL,
  `usage_info` varchar(200) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_prescription_id` (`prescription_id`),
  KEY `idx_medicine_id` (`medicine_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 处置申请表
CREATE TABLE IF NOT EXISTS `treatment_requests` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `request_no` varchar(20) NOT NULL UNIQUE,
  `registration_id` int unsigned NOT NULL,
  `patient_id` int unsigned NOT NULL,
  `doctor_id` int unsigned NOT NULL,
  `department_id` int unsigned NOT NULL,
  `treatment_type` varchar(50) DEFAULT NULL,
  `treatment_items` varchar(500) DEFAULT NULL,
  `clinical_info` varchar(500) DEFAULT NULL,
  `status` tinyint DEFAULT 1,
  `result` text,
  `operator_id` int unsigned DEFAULT NULL,
  `requested_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `treated_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_registration_id` (`registration_id`),
  KEY `idx_patient_id` (`patient_id`),
  KEY `idx_doctor_id` (`doctor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 费用明细表
CREATE TABLE IF NOT EXISTS `fee_items` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `registration_id` int unsigned NOT NULL,
  `patient_id` int unsigned NOT NULL,
  `item_type` tinyint NOT NULL,
  `item_id` int unsigned NOT NULL,
  `item_name` varchar(100) NOT NULL,
  `quantity` int NOT NULL DEFAULT 1,
  `unit_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `settlement_category_id` int unsigned DEFAULT NULL,
  `status` tinyint DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_registration_id` (`registration_id`),
  KEY `idx_patient_id` (`patient_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 工作量统计表
CREATE TABLE IF NOT EXISTS `workload_statistics` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `doctor_id` int unsigned NOT NULL,
  `department_id` int unsigned NOT NULL,
  `date` date NOT NULL,
  `total_patients` int DEFAULT 0,
  `total_income` decimal(10,2) DEFAULT 0.00,
  `prescription_count` int DEFAULT 0,
  `examination_count` int DEFAULT 0,
  `laboratory_count` int DEFAULT 0,
  `treatment_count` int DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_doctor_date` (`doctor_id`, `date`),
  KEY `idx_department_id` (`department_id`),
  KEY `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 日结表
CREATE TABLE IF NOT EXISTS `daily_settlements` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `settlement_no` varchar(20) NOT NULL UNIQUE,
  `settlement_date` date NOT NULL,
  `operator_id` int unsigned NOT NULL,
  `total_registration_count` int DEFAULT 0,
  `total_registration_income` decimal(10,2) DEFAULT 0.00,
  `total_charge_count` int DEFAULT 0,
  `total_charge_income` decimal(10,2) DEFAULT 0.00,
  `total_income` decimal(10,2) DEFAULT 0.00,
  `status` tinyint DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_settlement_date` (`settlement_date`),
  KEY `idx_operator_id` (`operator_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 初始化数据
-- 角色
INSERT INTO `roles` (`name`, `description`) VALUES
('admin', '系统管理员'),
('doctor', '医生'),
('technician', '医技医生'),
('pharmacy', '药房'),
('reception', '挂号收费');

-- 默认管理员账号 admin / admin123
INSERT INTO `users` (`username`, `password`, `name`, `role_id`, `status`) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '系统管理员', 1, 1);

-- 科室
INSERT INTO `departments` (`name`, `code`, `type`, `description`, `status`) VALUES
('内科', 'NK', 1, '内科门诊', 1),
('外科', 'WK', 1, '外科门诊', 1),
('儿科', 'EK', 1, '儿科门诊', 1),
('妇产科', 'FCK', 1, '妇产科门诊', 1),
('放射科', 'FSK', 2, '放射科检查', 1),
('检验科', 'JYK', 2, '检验科', 1),
('药房', 'YF', 3, '药房', 1),
('挂号处', 'GHC', 3, '挂号收费处', 1);

-- 挂号级别
INSERT INTO `registration_levels` (`name`, `price`, `description`, `status`) VALUES
('普通号', 10.00, '普通门诊号', 1),
('专家号', 30.00, '专家门诊号', 1),
('特需号', 100.00, '特需门诊号', 1);

-- 结算类别
INSERT INTO `settlement_categories` (`name`, `description`, `status`) VALUES
('自费', '自费患者', 1),
('医保', '城镇职工医保', 1),
('农合', '新型农村合作医疗', 1);

-- 费用科目
INSERT INTO `expense_subjects` (`name`, `code`, `description`, `status`) VALUES
('挂号费', 'GHF', '挂号费用', 1),
('检查费', 'JCF', '检查费用', 1),
('检验费', 'JYF', '检验费用', 1),
('药品费', 'YPF', '药品费用', 1),
('处置费', 'ZCF', '处置费用', 1);
