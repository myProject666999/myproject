-- 创建数据库
CREATE DATABASE IF NOT EXISTS carbon_emission DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE carbon_emission;

-- 1. 组织架构表（支持多组织层级汇总）
DROP TABLE IF EXISTS sys_organization;
CREATE TABLE sys_organization (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '组织ID',
    org_code VARCHAR(50) NOT NULL UNIQUE COMMENT '组织编码',
    org_name VARCHAR(100) NOT NULL COMMENT '组织名称',
    parent_id BIGINT DEFAULT 0 COMMENT '父组织ID',
    org_level INT DEFAULT 1 COMMENT '组织层级',
    org_type TINYINT DEFAULT 1 COMMENT '组织类型：1-集团 2-分公司 3-部门',
    address VARCHAR(255) COMMENT '地址',
    contact_person VARCHAR(50) COMMENT '联系人',
    contact_phone VARCHAR(20) COMMENT '联系电话',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用 1-启用',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除 1-已删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_parent_id (parent_id),
    INDEX idx_org_code (org_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='组织架构表';

-- 2. 排放因子库表（按版本管理）
DROP TABLE IF EXISTS emission_factor;
CREATE TABLE emission_factor (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '因子ID',
    factor_code VARCHAR(50) NOT NULL COMMENT '因子编码',
    factor_name VARCHAR(200) NOT NULL COMMENT '因子名称',
    factor_type TINYINT NOT NULL COMMENT '因子类型：1-能源 2-交通 3-物料 4-其他',
    category VARCHAR(100) COMMENT '排放类别',
    sub_category VARCHAR(100) COMMENT '排放子类别',
    unit VARCHAR(50) NOT NULL COMMENT '计量单位',
    co2_factor DECIMAL(15,6) NOT NULL COMMENT 'CO2排放因子(tCO2/单位)',
    ch4_factor DECIMAL(15,6) DEFAULT 0 COMMENT 'CH4排放因子',
    n2o_factor DECIMAL(15,6) DEFAULT 0 COMMENT 'N2O排放因子',
    total_factor DECIMAL(15,6) NOT NULL COMMENT '总排放因子（CO2e）',
    version VARCHAR(20) NOT NULL COMMENT '版本号',
    standard_source VARCHAR(200) COMMENT '标准来源（如IPCC、GB/T等）',
    calculation_formula TEXT COMMENT '核算公式说明（可追溯口径）',
    description TEXT COMMENT '描述说明',
    is_current TINYINT DEFAULT 0 COMMENT '是否当前版本：0-否 1-是',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用 1-启用',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_factor_version (factor_code, version),
    INDEX idx_factor_type (factor_type),
    INDEX idx_version (version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='排放因子库表';

-- 3. 排放源数据表（能源/差旅/采购）
DROP TABLE IF EXISTS emission_data;
CREATE TABLE emission_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '数据ID',
    data_no VARCHAR(50) NOT NULL UNIQUE COMMENT '数据编号',
    org_id BIGINT NOT NULL COMMENT '所属组织ID',
    emission_scope TINYINT NOT NULL COMMENT '排放范围：1-范围一 2-范围二 3-范围三',
    source_type TINYINT NOT NULL COMMENT '排放源类型：1-能源 2-差旅 3-采购 4-生产 5-其他',
    source_category VARCHAR(100) COMMENT '排放源分类',
    activity_name VARCHAR(200) NOT NULL COMMENT '活动名称',
    activity_date DATE NOT NULL COMMENT '活动日期',
    activity_month VARCHAR(7) NOT NULL COMMENT '活动月份（yyyy-MM）',
    quantity DECIMAL(15,4) NOT NULL COMMENT '活动数据量',
    unit VARCHAR(50) NOT NULL COMMENT '计量单位',
    factor_id BIGINT COMMENT '关联排放因子ID',
    factor_version VARCHAR(20) COMMENT '使用的因子版本',
    description TEXT COMMENT '描述',
    batch_no VARCHAR(50) COMMENT '导入批次号',
    data_source TINYINT DEFAULT 1 COMMENT '数据来源：1-手动录入 2-批量导入 3-系统对接',
    status TINYINT DEFAULT 1 COMMENT '状态：0-待审核 1-已审核 2-已驳回',
    audit_user VARCHAR(50) COMMENT '审核人',
    audit_time DATETIME COMMENT '审核时间',
    audit_remark VARCHAR(500) COMMENT '审核意见',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    create_by VARCHAR(50) COMMENT '创建人',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_org_id (org_id),
    INDEX idx_emission_scope (emission_scope),
    INDEX idx_activity_month (activity_month),
    INDEX idx_batch_no (batch_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='排放源数据表';

-- 4. 核算结果表
DROP TABLE IF EXISTS emission_calculation;
CREATE TABLE emission_calculation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '核算ID',
    calculation_no VARCHAR(50) NOT NULL UNIQUE COMMENT '核算编号',
    org_id BIGINT NOT NULL COMMENT '组织ID',
    period_type TINYINT NOT NULL COMMENT '周期类型：1-月度 2-季度 3-年度',
    period_value VARCHAR(20) NOT NULL COMMENT '周期值（yyyy-MM/yyyy-Qn/yyyy）',
    emission_scope TINYINT NOT NULL COMMENT '排放范围：1-范围一 2-范围二 3-范围三 4-总计',
    source_type TINYINT COMMENT '排放源类型',
    activity_total DECIMAL(18,4) COMMENT '活动数据总量',
    emission_co2 DECIMAL(18,6) DEFAULT 0 COMMENT 'CO2排放量(tCO2)',
    emission_ch4 DECIMAL(18,6) DEFAULT 0 COMMENT 'CH4排放量',
    emission_n2o DECIMAL(18,6) DEFAULT 0 COMMENT 'N2O排放量',
    emission_total DECIMAL(18,6) NOT NULL COMMENT '总排放量(tCO2e)',
    factor_version VARCHAR(20) COMMENT '核算使用的因子版本',
    calculation_formula TEXT COMMENT '核算公式（追溯口径）',
    calculation_detail TEXT COMMENT '核算明细JSON',
    is_summary TINYINT DEFAULT 0 COMMENT '是否汇总数据：0-明细 1-汇总',
    parent_calculation_id BIGINT COMMENT '上级汇总核算ID',
    calculation_status TINYINT DEFAULT 1 COMMENT '核算状态：0-核算中 1-已完成 2-已确认',
    confirm_user VARCHAR(50) COMMENT '确认人',
    confirm_time DATETIME COMMENT '确认时间',
    remark VARCHAR(500) COMMENT '备注',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_org_period_scope (org_id, period_type, period_value, emission_scope, source_type),
    INDEX idx_org_id (org_id),
    INDEX idx_period (period_type, period_value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='核算结果表';

-- 5. 减排目标表
DROP TABLE IF EXISTS reduction_target;
CREATE TABLE reduction_target (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '目标ID',
    target_no VARCHAR(50) NOT NULL UNIQUE COMMENT '目标编号',
    org_id BIGINT NOT NULL COMMENT '组织ID',
    target_name VARCHAR(200) NOT NULL COMMENT '目标名称',
    target_type TINYINT NOT NULL COMMENT '目标类型：1-绝对减排 2-强度减排',
    emission_scope TINYINT DEFAULT 4 COMMENT '排放范围：1-范围一 2-范围二 3-范围三 4-全范围',
    base_year VARCHAR(4) NOT NULL COMMENT '基准年',
    base_emission DECIMAL(18,6) NOT NULL COMMENT '基准排放量(tCO2e)',
    target_year VARCHAR(4) NOT NULL COMMENT '目标年',
    target_reduction_rate DECIMAL(8,4) NOT NULL COMMENT '目标减排率(%)',
    target_emission DECIMAL(18,6) NOT NULL COMMENT '目标排放量(tCO2e)',
    actual_emission DECIMAL(18,6) COMMENT '实际排放量(tCO2e)',
    actual_reduction_rate DECIMAL(8,4) COMMENT '实际减排率(%)',
    achievement_rate DECIMAL(8,4) COMMENT '目标完成率(%)',
    description TEXT COMMENT '目标描述',
    measures TEXT COMMENT '减排措施',
    status TINYINT DEFAULT 1 COMMENT '状态：0-未开始 1-进行中 2-已完成 3-已逾期',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    create_by VARCHAR(50) COMMENT '创建人',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_org_id (org_id),
    INDEX idx_target_year (target_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='减排目标表';

-- 6. ESG指标库表
DROP TABLE IF EXISTS esg_indicator;
CREATE TABLE esg_indicator (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '指标ID',
    indicator_code VARCHAR(50) NOT NULL UNIQUE COMMENT '指标编码',
    indicator_name VARCHAR(200) NOT NULL COMMENT '指标名称',
    dimension TINYINT NOT NULL COMMENT '维度：1-环境(E) 2-社会(S) 3-治理(G)',
    category VARCHAR(100) COMMENT '指标分类',
    indicator_type TINYINT DEFAULT 1 COMMENT '指标类型：1-定量 2-定性',
    unit VARCHAR(50) COMMENT '计量单位',
    standard VARCHAR(200) COMMENT '参考标准（如GRI、SASB、HKEX等）',
    calculation_method TEXT COMMENT '计算方法',
    data_source VARCHAR(200) COMMENT '数据来源',
    description TEXT COMMENT '指标说明',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用 1-启用',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_dimension (dimension)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='ESG指标库表';

-- 7. ESG指标数据表
DROP TABLE IF EXISTS esg_indicator_data;
CREATE TABLE esg_indicator_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '数据ID',
    indicator_id BIGINT NOT NULL COMMENT '指标ID',
    org_id BIGINT NOT NULL COMMENT '组织ID',
    period_type TINYINT NOT NULL COMMENT '周期类型：1-月度 2-季度 3-年度',
    period_value VARCHAR(20) NOT NULL COMMENT '周期值',
    indicator_value DECIMAL(18,6) COMMENT '指标值（定量）',
    indicator_text TEXT COMMENT '指标值（定性）',
    supporting_document VARCHAR(500) COMMENT '佐证文件',
    status TINYINT DEFAULT 1 COMMENT '状态：0-待审核 1-已审核 2-已驳回',
    audit_user VARCHAR(50) COMMENT '审核人',
    audit_time DATETIME COMMENT '审核时间',
    audit_remark VARCHAR(500) COMMENT '审核意见',
    remark VARCHAR(500) COMMENT '备注',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    create_by VARCHAR(50) COMMENT '创建人',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_indicator_org_period (indicator_id, org_id, period_type, period_value),
    INDEX idx_org_id (org_id),
    INDEX idx_indicator_id (indicator_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='ESG指标数据表';

-- 8. 报告模板表
DROP TABLE IF EXISTS report_template;
CREATE TABLE report_template (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '模板ID',
    template_code VARCHAR(50) NOT NULL UNIQUE COMMENT '模板编码',
    template_name VARCHAR(200) NOT NULL COMMENT '模板名称',
    template_type TINYINT NOT NULL COMMENT '模板类型：1-碳排放报告 2-ESG报告 3-其他',
    report_standard VARCHAR(100) COMMENT '报告标准（GRI、TCFD等）',
    template_file VARCHAR(500) COMMENT '模板文件路径',
    template_config TEXT COMMENT '模板配置JSON',
    version VARCHAR(20) NOT NULL COMMENT '版本号',
    is_current TINYINT DEFAULT 0 COMMENT '是否当前版本',
    description TEXT COMMENT '描述',
    status TINYINT DEFAULT 1 COMMENT '状态',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='报告模板表';

-- 9. 报告主表（支持历史版本留存）
DROP TABLE IF EXISTS report;
CREATE TABLE report (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '报告ID',
    report_no VARCHAR(50) NOT NULL COMMENT '报告编号',
    report_name VARCHAR(200) NOT NULL COMMENT '报告名称',
    report_type TINYINT NOT NULL COMMENT '报告类型：1-碳排放报告 2-ESG报告',
    org_id BIGINT NOT NULL COMMENT '组织ID',
    template_id BIGINT COMMENT '使用模板ID',
    period_type TINYINT NOT NULL COMMENT '周期类型',
    period_value VARCHAR(20) NOT NULL COMMENT '周期值',
    report_standard VARCHAR(100) COMMENT '报告标准',
    version INT DEFAULT 1 COMMENT '报告版本号',
    parent_report_id BIGINT COMMENT '父报告ID（历史版本关联）',
    report_file VARCHAR(500) COMMENT '报告文件路径',
    report_content LONGTEXT COMMENT '报告内容JSON',
    total_emission DECIMAL(18,6) COMMENT '总排放量(tCO2e)',
    scope1_emission DECIMAL(18,6) COMMENT '范围一排放量',
    scope2_emission DECIMAL(18,6) COMMENT '范围二排放量',
    scope3_emission DECIMAL(18,6) COMMENT '范围三排放量',
    esg_score DECIMAL(8,4) COMMENT 'ESG评分',
    report_status TINYINT DEFAULT 1 COMMENT '报告状态：0-草稿 1-待审核 2-已发布 3-已归档',
    publish_time DATETIME COMMENT '发布时间',
    audit_user VARCHAR(50) COMMENT '审核人',
    audit_time DATETIME COMMENT '审核时间',
    approver VARCHAR(50) COMMENT '审批人',
    approve_time DATETIME COMMENT '审批时间',
    remark VARCHAR(500) COMMENT '备注',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    create_by VARCHAR(50) COMMENT '创建人',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_org_id (org_id),
    INDEX idx_report_no (report_no),
    INDEX idx_period (period_type, period_value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='报告主表';

-- 10. 批量导入批次表
DROP TABLE IF EXISTS import_batch;
CREATE TABLE import_batch (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '批次ID',
    batch_no VARCHAR(50) NOT NULL UNIQUE COMMENT '批次号',
    batch_name VARCHAR(200) COMMENT '批次名称',
    import_type TINYINT NOT NULL COMMENT '导入类型：1-排放数据 2-ESG指标 3-其他',
    org_id BIGINT COMMENT '组织ID',
    total_count INT DEFAULT 0 COMMENT '总记录数',
    success_count INT DEFAULT 0 COMMENT '成功数量',
    fail_count INT DEFAULT 0 COMMENT '失败数量',
    import_file VARCHAR(500) COMMENT '导入文件路径',
    error_log TEXT COMMENT '错误日志',
    import_status TINYINT DEFAULT 1 COMMENT '导入状态：0-导入中 1-成功 2-失败 3-部分成功',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    create_by VARCHAR(50) COMMENT '创建人',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_batch_no (batch_no),
    INDEX idx_org_id (org_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='批量导入批次表';

-- 11. 系统用户表（简化版）
DROP TABLE IF EXISTS sys_user;
CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    email VARCHAR(100) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '手机号',
    org_id BIGINT COMMENT '所属组织ID',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用 1-启用',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';

-- 初始化数据
-- 插入默认组织
INSERT INTO sys_organization (org_code, org_name, parent_id, org_level, org_type, sort_order) VALUES
('ROOT', '集团总部', 0, 1, 1, 1),
('BRANCH001', '北京分公司', 1, 2, 2, 1),
('BRANCH002', '上海分公司', 1, 2, 2, 2);

-- 插入排放因子数据（示例数据，按版本管理）
INSERT INTO emission_factor (factor_code, factor_name, factor_type, category, sub_category, unit, co2_factor, ch4_factor, n2o_factor, total_factor, version, standard_source, calculation_formula, is_current) VALUES
('ELEC_CN', '中国电网电力', 1, '能源消费', '电力', 'MWh', 0.5810, 0, 0, 0.5810, 'V1.0', 'GB/T 32151.1-2015', '排放量 = 用电量 × 排放因子', 1),
('COAL', '原煤', 1, '能源消费', '煤炭', 't', 2.6640, 0.0014, 0.0002, 2.7022, 'V1.0', 'IPCC AR5', '排放量 = 消耗量 × 单位热值 × 排放因子', 1),
('GASOLINE', '汽油', 1, '能源消费', '成品油', 't', 3.1500, 0.0009, 0.00002, 3.1648, 'V1.0', 'IPCC AR5', '排放量 = 消耗量 × 排放因子', 1),
('DIESEL', '柴油', 1, '能源消费', '成品油', 't', 3.1600, 0.0007, 0.00003, 3.1729, 'V1.0', 'IPCC AR5', '排放量 = 消耗量 × 排放因子', 1),
('NATURAL_GAS', '天然气', 1, '能源消费', '燃气', '10^4 m³', 21.6220, 0.001, 0.00001, 21.653, 'V1.0', 'GB/T 32151.1-2015', '排放量 = 消耗量 × 排放因子', 1),
('FLIGHT', '飞机出行', 2, '商务差旅', '航空', '公里', 0.000255, 0, 0, 0.000255, 'V1.0', 'GHG Protocol', '排放量 = 距离 × 排放因子', 1),
('CAR_TRAVEL', '汽车出行', 2, '商务差旅', '公路', '公里', 0.000192, 0, 0, 0.000192, 'V1.0', 'GHG Protocol', '排放量 = 距离 × 排放因子', 1),
('TRAIN', '火车出行', 2, '商务差旅', '铁路', '公里', 0.000041, 0, 0, 0.000041, 'V1.0', 'GHG Protocol', '排放量 = 距离 × 排放因子', 1),
('STEEL', '钢材采购', 3, '上游采购', '原材料', 't', 1.8000, 0, 0, 1.8000, 'V1.0', 'Ecoinvent', '排放量 = 采购量 × 排放因子', 1),
('CEMENT', '水泥采购', 3, '上游采购', '原材料', 't', 0.8500, 0, 0, 0.8500, 'V1.0', 'Ecoinvent', '排放量 = 采购量 × 排放因子', 1);

-- 插入ESG指标（示例）
INSERT INTO esg_indicator (indicator_code, indicator_name, dimension, category, indicator_type, unit, standard, sort_order) VALUES
('E001', '碳排放总量', 1, '气候变化', 1, 'tCO2e', 'GRI 305', 1),
('E002', '碳排放强度', 1, '气候变化', 1, 'tCO2e/万元', 'GRI 305', 2),
('E003', '能源消费总量', 1, '能源', 1, 'tce', 'GRI 302', 3),
('E004', '可再生能源占比', 1, '能源', 1, '%', 'GRI 302', 4),
('E005', '水资源消耗量', 1, '水资源', 1, 'm³', 'GRI 303', 5),
('S001', '员工总数', 2, '雇佣', 1, '人', 'GRI 401', 1),
('S002', '员工培训时长', 2, '培训', 1, '小时/人', 'GRI 404', 2),
('S003', '公益捐赠金额', 2, '社区', 1, '万元', 'GRI 413', 3),
('G001', '董事会人数', 3, '治理结构', 1, '人', 'GRI 102', 1),
('G002', '独立董事占比', 3, '治理结构', 1, '%', 'GRI 102', 2),
('G003', '反腐败培训人数', 3, '合规', 1, '人', 'GRI 205', 3);

-- 插入默认用户（密码：123456，MD5加密后）
INSERT INTO sys_user (username, password, real_name, email, org_id) VALUES
('admin', 'e10adc3949ba59abbe56e057f20f883e', '管理员', 'admin@carbon.com', 1),
('user001', 'e10adc3949ba59abbe56e057f20f883e', '张三', 'zhangsan@carbon.com', 2);

-- 插入报告模板
INSERT INTO report_template (template_code, template_name, template_type, report_standard, version, is_current, description) VALUES
('CARBON_YEARLY', '年度碳排放报告', 1, 'GHG Protocol', 'V1.0', 1, '企业年度碳排放核算报告模板'),
('ESG_YEARLY', '年度ESG报告', 2, 'GRI Standards', 'V1.0', 1, '企业年度ESG披露报告模板');
