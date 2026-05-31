-- 创建数据库
CREATE DATABASE IF NOT EXISTS db_schema_review DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE db_schema_review;

-- ========================================
-- 1. 用户表
-- ========================================
DROP TABLE IF EXISTS sys_user;
CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    email VARCHAR(100) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '手机号',
    role VARCHAR(20) NOT NULL DEFAULT 'developer' COMMENT '角色：developer-开发人员, reviewer-评审人员, dba-DBA, admin-管理员',
    department VARCHAR(100) COMMENT '部门',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用, 1-启用',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除：0-否, 1-是',
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';

-- ========================================
-- 2. 数据库环境配置表
-- ========================================
DROP TABLE IF EXISTS db_environment;
CREATE TABLE db_environment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    env_name VARCHAR(50) NOT NULL COMMENT '环境名称：dev-开发, test-测试, pre-预发, prod-生产',
    env_type VARCHAR(20) NOT NULL COMMENT '环境类型：dev, test, pre, prod',
    db_type VARCHAR(20) NOT NULL DEFAULT 'mysql' COMMENT '数据库类型',
    db_host VARCHAR(100) NOT NULL COMMENT '数据库主机',
    db_port INT NOT NULL DEFAULT 3306 COMMENT '数据库端口',
    db_name VARCHAR(100) NOT NULL COMMENT '数据库名',
    db_username VARCHAR(50) NOT NULL COMMENT '数据库用户名',
    db_password VARCHAR(255) NOT NULL COMMENT '数据库密码',
    description VARCHAR(200) COMMENT '描述',
    is_enabled TINYINT NOT NULL DEFAULT 1 COMMENT '是否启用',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    INDEX idx_env_type (env_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据库环境配置表';

-- ========================================
-- 3. 变更工单表
-- ========================================
DROP TABLE IF EXISTS schema_order;
CREATE TABLE schema_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_no VARCHAR(64) NOT NULL UNIQUE COMMENT '工单编号',
    title VARCHAR(200) NOT NULL COMMENT '工单标题',
    description TEXT COMMENT '变更描述',
    env_id BIGINT NOT NULL COMMENT '环境ID',
    db_name VARCHAR(100) NOT NULL COMMENT '目标数据库名',
    applicant_id BIGINT NOT NULL COMMENT '申请人ID',
    applicant_name VARCHAR(50) NOT NULL COMMENT '申请人姓名',
    status VARCHAR(30) NOT NULL DEFAULT 'draft' COMMENT '状态：draft-草稿, pending_review-待评审, reviewing-评审中, pending_execution-待执行, executing-执行中, success-执行成功, failed-执行失败, rollback-已回滚, cancelled-已取消',
    priority VARCHAR(20) NOT NULL DEFAULT 'normal' COMMENT '优先级：low-低, normal-中, high-高, urgent-紧急',
    change_type VARCHAR(30) NOT NULL COMMENT '变更类型：ddl-结构变更, dml-数据变更, dcl-权限变更',
    risk_level VARCHAR(20) DEFAULT 'unknown' COMMENT '风险等级：low-低, medium-中, high-高, critical-极高',
    is_gray TINYINT NOT NULL DEFAULT 0 COMMENT '是否灰度执行：0-否, 1-是',
    batch_count INT DEFAULT 1 COMMENT '分批执行批次数',
    current_batch INT DEFAULT 0 COMMENT '当前执行批次',
    rollback_sql TEXT COMMENT '回滚SQL预案',
    plan_execute_time DATETIME COMMENT '计划执行时间',
    actual_execute_time DATETIME COMMENT '实际执行时间',
    finish_time DATETIME COMMENT '完成时间',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    INDEX idx_order_no (order_no),
    INDEX idx_applicant (applicant_id),
    INDEX idx_status (status),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='变更工单表';

-- ========================================
-- 4. 工单SQL明细表
-- ========================================
DROP TABLE IF EXISTS schema_order_sql;
CREATE TABLE schema_order_sql (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    sql_content TEXT NOT NULL COMMENT 'SQL内容',
    sql_type VARCHAR(20) NOT NULL COMMENT 'SQL类型：CREATE, ALTER, DROP, INSERT, UPDATE, DELETE等',
    table_name VARCHAR(100) COMMENT '影响的表名',
    estimated_rows BIGINT DEFAULT 0 COMMENT '预估影响行数',
    sort_order INT NOT NULL DEFAULT 0 COMMENT '执行顺序',
    batch_number INT DEFAULT 1 COMMENT '所属批次',
    status VARCHAR(30) NOT NULL DEFAULT 'pending' COMMENT '状态：pending-待执行, executing-执行中, success-成功, failed-失败, skipped-跳过',
    execute_result TEXT COMMENT '执行结果',
    affected_rows BIGINT DEFAULT 0 COMMENT '实际影响行数',
    execute_time DATETIME COMMENT '执行时间',
    execute_duration INT DEFAULT 0 COMMENT '执行耗时(毫秒)',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    INDEX idx_order_id (order_id),
    INDEX idx_table_name (table_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单SQL明细表';

-- ========================================
-- 5. 风险检测结果表
-- ========================================
DROP TABLE IF EXISTS risk_detection;
CREATE TABLE risk_detection (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    sql_id BIGINT COMMENT 'SQL明细ID',
    risk_type VARCHAR(50) NOT NULL COMMENT '风险类型：large_table-大表变更, missing_index-缺索引, table_lock-表锁风险, full_table_scan-全表扫描, drop_table-删除表, rename_table-重命名表, unsafe_operation-不安全操作',
    risk_level VARCHAR(20) NOT NULL COMMENT '风险等级：low, medium, high, critical',
    risk_title VARCHAR(200) NOT NULL COMMENT '风险标题',
    risk_detail TEXT COMMENT '风险详情',
    suggestion TEXT COMMENT '优化建议',
    sql_snippet TEXT COMMENT '相关SQL片段',
    table_name VARCHAR(100) COMMENT '涉及表名',
    detected_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '检测时间',
    is_fixed TINYINT NOT NULL DEFAULT 0 COMMENT '是否已修复：0-否, 1-是',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    is_deleted TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    INDEX idx_order_id (order_id),
    INDEX idx_risk_level (risk_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='风险检测结果表';

-- ========================================
-- 6. 评审记录表
-- ========================================
DROP TABLE IF EXISTS review_record;
CREATE TABLE review_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    reviewer_id BIGINT NOT NULL COMMENT '评审人ID',
    reviewer_name VARCHAR(50) NOT NULL COMMENT '评审人姓名',
    reviewer_role VARCHAR(20) NOT NULL COMMENT '评审人角色',
    review_status VARCHAR(20) NOT NULL COMMENT '评审状态：approved-通过, rejected-驳回, need_modify-需修改',
    review_comment TEXT COMMENT '评审意见',
    review_level INT NOT NULL DEFAULT 1 COMMENT '评审级别：1-一级评审, 2-二级评审, 3-三级评审',
    review_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '评审时间',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    is_deleted TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    INDEX idx_order_id (order_id),
    INDEX idx_reviewer (reviewer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评审记录表';

-- ========================================
-- 7. 评审配置表
-- ========================================
DROP TABLE IF EXISTS review_config;
CREATE TABLE review_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    env_type VARCHAR(20) NOT NULL COMMENT '环境类型',
    risk_level VARCHAR(20) NOT NULL COMMENT '风险等级',
    review_level INT NOT NULL DEFAULT 1 COMMENT '需要的评审级别',
    reviewer_role VARCHAR(20) NOT NULL COMMENT '评审人角色',
    description VARCHAR(200) COMMENT '描述',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    UNIQUE KEY uk_env_risk (env_type, risk_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评审配置表';

-- ========================================
-- 8. 执行记录表
-- ========================================
DROP TABLE IF EXISTS execution_record;
CREATE TABLE execution_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    executor_id BIGINT NOT NULL COMMENT '执行人ID',
    executor_name VARCHAR(50) NOT NULL COMMENT '执行人姓名',
    execution_type VARCHAR(20) NOT NULL COMMENT '执行类型：execute-正常执行, rollback-回滚执行, retry-重试执行',
    batch_number INT DEFAULT 1 COMMENT '执行批次',
    status VARCHAR(30) NOT NULL COMMENT '执行状态：pending, executing, success, failed, stopped',
    is_paused TINYINT NOT NULL DEFAULT 0 COMMENT '是否已暂停：0-否, 1-是',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    duration INT DEFAULT 0 COMMENT '执行耗时(毫秒)',
    execute_log TEXT COMMENT '执行日志',
    error_message TEXT COMMENT '错误信息',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    INDEX idx_order_id (order_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='执行记录表';

-- ========================================
-- 9. 执行进度表
-- ========================================
DROP TABLE IF EXISTS execution_progress;
CREATE TABLE execution_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    execution_id BIGINT NOT NULL COMMENT '执行记录ID',
    order_id BIGINT NOT NULL COMMENT '工单ID',
    sql_id BIGINT NOT NULL COMMENT 'SQL ID',
    status VARCHAR(30) NOT NULL COMMENT '执行状态',
    progress_percent INT DEFAULT 0 COMMENT '进度百分比',
    current_step VARCHAR(100) COMMENT '当前步骤',
    execute_result TEXT COMMENT '执行结果',
    affected_rows BIGINT DEFAULT 0 COMMENT '影响行数',
    error_message TEXT COMMENT '错误信息',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_execution_id (execution_id),
    INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='执行进度表';

-- ========================================
-- 10. 审计日志表
-- ========================================
DROP TABLE IF EXISTS audit_log;
CREATE TABLE audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    log_no VARCHAR(64) NOT NULL UNIQUE COMMENT '日志编号',
    user_id BIGINT NOT NULL COMMENT '操作人ID',
    user_name VARCHAR(50) NOT NULL COMMENT '操作人姓名',
    module VARCHAR(50) NOT NULL COMMENT '模块：order-工单, review-评审, execution-执行, system-系统',
    operation VARCHAR(50) NOT NULL COMMENT '操作类型：create, update, delete, review, execute, rollback, cancel',
    target_id BIGINT COMMENT '目标ID',
    target_type VARCHAR(50) COMMENT '目标类型',
    target_title VARCHAR(200) COMMENT '目标标题',
    before_data TEXT COMMENT '操作前数据(JSON)',
    after_data TEXT COMMENT '操作后数据(JSON)',
    change_detail TEXT COMMENT '变更详情',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    user_agent VARCHAR(500) COMMENT '用户代理',
    operation_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_log_no (log_no),
    INDEX idx_user_id (user_id),
    INDEX idx_module (module),
    INDEX idx_operation_time (operation_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审计日志表';

-- ========================================
-- 11. 风险规则配置表
-- ========================================
DROP TABLE IF EXISTS risk_rule;
CREATE TABLE risk_rule (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    rule_code VARCHAR(50) NOT NULL UNIQUE COMMENT '规则编码',
    rule_name VARCHAR(100) NOT NULL COMMENT '规则名称',
    rule_type VARCHAR(30) NOT NULL COMMENT '规则类型：sql_parse, table_metadata, performance',
    risk_level VARCHAR(20) NOT NULL COMMENT '风险等级',
    rule_description TEXT COMMENT '规则描述',
    rule_expression TEXT COMMENT '规则表达式',
    rule_params TEXT COMMENT '规则参数(JSON)',
    is_enabled TINYINT NOT NULL DEFAULT 1 COMMENT '是否启用',
    sort_order INT NOT NULL DEFAULT 0 COMMENT '排序',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    INDEX idx_rule_type (rule_type),
    INDEX idx_is_enabled (is_enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='风险规则配置表';

-- ========================================
-- 初始化数据
-- ========================================

-- 初始化用户
INSERT INTO sys_user (username, password, real_name, email, phone, role, department, status) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '系统管理员', 'admin@example.com', '13800138000', 'admin', '技术部', 1),
('developer1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '张开发', 'dev1@example.com', '13800138001', 'developer', '研发部', 1),
('developer2', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '李开发', 'dev2@example.com', '13800138002', 'developer', '研发部', 1),
('reviewer1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '王评审', 'reviewer@example.com', '13800138003', 'reviewer', '技术委员会', 1),
('dba1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '赵DBA', 'dba@example.com', '13800138004', 'dba', 'DBA组', 1);

-- 初始化数据库环境
INSERT INTO db_environment (env_name, env_type, db_type, db_host, db_port, db_name, db_username, db_password, description, is_enabled) VALUES
('开发环境', 'dev', 'mysql', '127.0.0.1', 3306, 'example_dev', 'root', '123456', '开发测试用数据库', 1),
('测试环境', 'test', 'mysql', '127.0.0.1', 3306, 'example_test', 'root', '123456', '功能测试用数据库', 1),
('预发环境', 'pre', 'mysql', '127.0.0.1', 3306, 'example_pre', 'root', '123456', '预发布验证数据库', 1),
('生产环境', 'prod', 'mysql', '127.0.0.1', 3306, 'example_prod', 'root', '123456', '生产环境数据库', 1);

-- 初始化评审配置
INSERT INTO review_config (env_type, risk_level, review_level, reviewer_role, description) VALUES
('dev', 'low', 1, 'reviewer', '开发环境低风险需1级评审'),
('dev', 'medium', 1, 'reviewer', '开发环境中风险需1级评审'),
('dev', 'high', 2, 'reviewer', '开发环境高风险需2级评审'),
('dev', 'critical', 2, 'dba', '开发环境极高风险需DBA评审'),
('test', 'low', 1, 'reviewer', '测试环境低风险需1级评审'),
('test', 'medium', 1, 'reviewer', '测试环境中风险需1级评审'),
('test', 'high', 2, 'reviewer', '测试环境高风险需2级评审'),
('test', 'critical', 2, 'dba', '测试环境极高风险需DBA评审'),
('pre', 'low', 1, 'reviewer', '预发环境低风险需1级评审'),
('pre', 'medium', 2, 'reviewer', '预发环境中风险需2级评审'),
('pre', 'high', 2, 'dba', '预发环境高风险需DBA评审'),
('pre', 'critical', 3, 'dba', '预发环境极高风险需3级评审'),
('prod', 'low', 2, 'reviewer', '生产环境低风险需2级评审'),
('prod', 'medium', 2, 'dba', '生产环境中风险需DBA评审'),
('prod', 'high', 3, 'dba', '生产环境高风险需3级评审'),
('prod', 'critical', 3, 'admin', '生产环境极高风险需管理员审批');

-- 初始化风险规则
INSERT INTO risk_rule (rule_code, rule_name, rule_type, risk_level, rule_description, rule_expression, rule_params, is_enabled, sort_order) VALUES
('LARGE_TABLE_ALTER', '大表ALTER操作', 'table_metadata', 'high', '对数据量超过100万行的表执行ALTER操作存在锁表风险', 'table.rows > 1000000 AND sql.type IN (''ALTER'', ''DROP'', ''RENAME'')', '{"threshold": 1000000}', 1, 1),
('MISSING_WHERE_CLAUSE', '缺少WHERE条件的DML', 'sql_parse', 'critical', 'UPDATE/DELETE语句缺少WHERE条件可能导致全表数据变更', 'sql.type IN (''UPDATE'', ''DELETE'') AND !sql.hasWhere', '{}', 1, 2),
('FULL_TABLE_SCAN', '全表扫描风险', 'performance', 'high', 'SQL执行计划显示全表扫描，缺少有效索引', 'explain.type = ''ALL''', '{}', 1, 3),
('DROP_TABLE_OPERATION', '删除表操作', 'sql_parse', 'critical', 'DROP TABLE操作需特别谨慎，建议先重命名', 'sql.type = ''DROP'' AND sql.object = ''TABLE''', '{}', 1, 4),
('RENAME_TABLE_OPERATION', '重命名表操作', 'sql_parse', 'high', 'RENAME TABLE操作可能影响业务连续性', 'sql.type = ''RENAME'' AND sql.object = ''TABLE''', '{}', 1, 5),
('NO_INDEX_AFTER_ALTER', '新增字段无索引', 'sql_parse', 'medium', '新增查询字段后建议考虑添加索引', 'sql.type = ''ALTER'' AND sql.action = ''ADD COLUMN'' AND !sql.hasIndex', '{}', 1, 6),
('LIMIT_MISSING', '批量操作无LIMIT', 'sql_parse', 'medium', '批量UPDATE/DELETE建议添加LIMIT分批执行', 'sql.type IN (''UPDATE'', ''DELETE'') AND sql.estimatedRows > 10000 AND !sql.hasLimit', '{"threshold": 10000}', 1, 7),
('SELECT_WITH_LOCK', 'SELECT加锁操作', 'sql_parse', 'medium', 'SELECT ... FOR UPDATE 可能导致长时间锁等待', 'sql.type = ''SELECT'' AND sql.hasLock', '{}', 1, 8);
