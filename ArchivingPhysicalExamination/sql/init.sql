-- 创建数据库
CREATE DATABASE IF NOT EXISTS physical_examination DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE physical_examination;

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    `password` VARCHAR(100) NOT NULL COMMENT '密码',
    `real_name` VARCHAR(50) COMMENT '真实姓名',
    `phone` VARCHAR(20) COMMENT '手机号',
    `email` VARCHAR(100) COMMENT '邮箱',
    `gender` TINYINT DEFAULT 0 COMMENT '性别: 0-未知, 1-男, 2-女',
    `birthday` DATE COMMENT '出生日期',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 体检报告表
CREATE TABLE IF NOT EXISTS `exam_report` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '报告ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `exam_date` DATE NOT NULL COMMENT '体检日期',
    `hospital` VARCHAR(200) COMMENT '体检医院',
    `report_no` VARCHAR(100) COMMENT '报告编号',
    `file_path` VARCHAR(500) COMMENT '报告文件路径',
    `file_name` VARCHAR(200) COMMENT '原文件名',
    `overall_result` VARCHAR(500) COMMENT '总体结论',
    `doctor` VARCHAR(50) COMMENT '体检医生',
    `remark` VARCHAR(500) COMMENT '备注',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_exam_date` (`exam_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='体检报告表';

-- 指标类别表
CREATE TABLE IF NOT EXISTS `indicator_category` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '类别ID',
    `name` VARCHAR(100) NOT NULL COMMENT '类别名称',
    `code` VARCHAR(50) NOT NULL UNIQUE COMMENT '类别编码',
    `description` VARCHAR(500) COMMENT '描述',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='指标类别表';

-- 体检指标表
CREATE TABLE IF NOT EXISTS `exam_indicator` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '指标ID',
    `report_id` BIGINT NOT NULL COMMENT '报告ID',
    `category_id` BIGINT COMMENT '类别ID',
    `indicator_name` VARCHAR(200) NOT NULL COMMENT '指标名称',
    `indicator_code` VARCHAR(50) COMMENT '指标编码',
    `indicator_value` DECIMAL(12,4) COMMENT '指标值',
    `value_unit` VARCHAR(20) COMMENT '单位',
    `reference_range` VARCHAR(100) COMMENT '参考范围',
    `min_value` DECIMAL(12,4) COMMENT '最小值',
    `max_value` DECIMAL(12,4) COMMENT '最大值',
    `result_status` TINYINT DEFAULT 0 COMMENT '结果状态: 0-正常, 1-偏高, 2-偏低',
    `is_abnormal` TINYINT DEFAULT 0 COMMENT '是否异常: 0-否, 1-是',
    `remark` VARCHAR(500) COMMENT '备注',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX `idx_report_id` (`report_id`),
    INDEX `idx_category_id` (`category_id`),
    INDEX `idx_indicator_name` (`indicator_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='体检指标表';

-- 异常规则配置表
CREATE TABLE IF NOT EXISTS `abnormal_rule` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '规则ID',
    `indicator_name` VARCHAR(200) NOT NULL COMMENT '指标名称',
    `indicator_code` VARCHAR(50) COMMENT '指标编码',
    `category_id` BIGINT COMMENT '类别ID',
    `min_normal` DECIMAL(12,4) COMMENT '正常最小值',
    `max_normal` DECIMAL(12,4) COMMENT '正常最大值',
    `unit` VARCHAR(20) COMMENT '单位',
    `warning_level` TINYINT DEFAULT 1 COMMENT '警告级别: 1-轻度, 2-中度, 3-重度',
    `description` VARCHAR(500) COMMENT '异常描述',
    `suggestion` VARCHAR(1000) COMMENT '建议',
    `is_active` TINYINT DEFAULT 1 COMMENT '是否启用: 0-禁用, 1-启用',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='异常规则配置表';

-- 初始化数据
INSERT INTO `indicator_category` (`name`, `code`, `description`, `sort_order`) VALUES
('血常规', 'blood_routine', '血常规检查项目', 1),
('尿常规', 'urine_routine', '尿常规检查项目', 2),
('肝功能', 'liver_function', '肝功能检查项目', 3),
('肾功能', 'kidney_function', '肾功能检查项目', 4),
('血脂', 'blood_lipid', '血脂检查项目', 5),
('血糖', 'blood_sugar', '血糖检查项目', 6),
('血压', 'blood_pressure', '血压检查项目', 7),
('其他', 'other', '其他检查项目', 100);

INSERT INTO `abnormal_rule` (`indicator_name`, `indicator_code`, `category_id`, `min_normal`, `max_normal`, `unit`, `warning_level`, `description`, `suggestion`) VALUES
('白细胞计数', 'WBC', 1, 4.0, 10.0, '×10^9/L', 2, '白细胞计数异常', '建议复查血常规'),
('红细胞计数', 'RBC', 1, 4.0, 5.5, '×10^12/L', 2, '红细胞计数异常', '建议复查血常规'),
('血红蛋白', 'HGB', 1, 120, 160, 'g/L', 2, '血红蛋白异常', '建议复查血常规'),
('血小板计数', 'PLT', 1, 100, 300, '×10^9/L', 2, '血小板计数异常', '建议复查血常规'),
('谷丙转氨酶', 'ALT', 3, 0, 40, 'U/L', 2, '谷丙转氨酶偏高', '建议检查肝功能，避免饮酒'),
('谷草转氨酶', 'AST', 3, 0, 40, 'U/L', 2, '谷草转氨酶偏高', '建议检查肝功能'),
('总胆红素', 'TBIL', 3, 3.4, 17.1, 'μmol/L', 1, '总胆红素异常', '建议复查肝功能'),
('肌酐', 'CREA', 4, 44, 133, 'μmol/L', 2, '肌酐异常', '建议检查肾功能'),
('尿素氮', 'BUN', 4, 2.9, 8.2, 'mmol/L', 2, '尿素氮异常', '建议检查肾功能'),
('尿酸', 'UA', 4, 150, 420, 'μmol/L', 1, '尿酸偏高', '建议控制饮食，多喝水'),
('总胆固醇', 'TC', 5, 3.0, 5.2, 'mmol/L', 2, '总胆固醇偏高', '建议低脂饮食，增加运动'),
('甘油三酯', 'TG', 5, 0.45, 1.70, 'mmol/L', 2, '甘油三酯偏高', '建议低脂饮食，增加运动'),
('高密度脂蛋白', 'HDL-C', 5, 1.0, 1.9, 'mmol/L', 1, '高密度脂蛋白异常', '建议增加运动'),
('低密度脂蛋白', 'LDL-C', 5, 0, 3.4, 'mmol/L', 2, '低密度脂蛋白偏高', '建议低脂饮食'),
('空腹血糖', 'GLU', 6, 3.9, 6.1, 'mmol/L', 3, '血糖异常', '建议复查血糖，控制饮食'),
('收缩压', 'SBP', 7, 90, 140, 'mmHg', 3, '血压异常', '建议监测血压，必要时就医'),
('舒张压', 'DBP', 7, 60, 90, 'mmHg', 3, '血压异常', '建议监测血压，必要时就医');

INSERT INTO `user` (`username`, `password`, `real_name`, `phone`, `gender`) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '管理员', '13800000000', 1);
