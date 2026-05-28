-- 项目工时与人力成本分析系统数据库脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS project_cost_analysis DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE project_cost_analysis;

-- 1. 部门表
CREATE TABLE sys_dept (
    dept_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '部门ID',
    dept_name VARCHAR(100) NOT NULL COMMENT '部门名称',
    parent_id BIGINT DEFAULT 0 COMMENT '父部门ID',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-禁用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门表';

-- 2. 用户表
CREATE TABLE sys_user (
    user_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    dept_id BIGINT COMMENT '部门ID',
    email VARCHAR(100) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '手机号',
    hourly_rate INT DEFAULT 0 COMMENT '小时费率（单位：分）',
    role VARCHAR(20) DEFAULT 'employee' COMMENT '角色：admin-管理员，manager-经理，employee-员工',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-禁用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_dept_id (dept_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 3. 项目表
CREATE TABLE proj_project (
    project_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '项目ID',
    project_code VARCHAR(50) NOT NULL UNIQUE COMMENT '项目编号',
    project_name VARCHAR(200) NOT NULL COMMENT '项目名称',
    project_type VARCHAR(50) COMMENT '项目类型',
    dept_id BIGINT COMMENT '所属部门ID',
    manager_id BIGINT COMMENT '项目经理ID',
    start_date DATE COMMENT '开始日期',
    end_date DATE COMMENT '结束日期',
    budget_cost INT DEFAULT 0 COMMENT '预算成本（单位：分）',
    budget_hours DECIMAL(10,2) DEFAULT 0 COMMENT '预算工时（小时）',
    description TEXT COMMENT '项目描述',
    status TINYINT DEFAULT 1 COMMENT '状态：0-草稿，1-进行中，2-已完成，3-已取消',
    create_by BIGINT COMMENT '创建人ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_dept_id (dept_id),
    INDEX idx_manager_id (manager_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目表';

-- 4. 项目成员表
CREATE TABLE proj_project_member (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    project_id BIGINT NOT NULL COMMENT '项目ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role VARCHAR(50) DEFAULT 'member' COMMENT '角色：manager-项目经理，member-成员',
    hourly_rate INT DEFAULT 0 COMMENT '项目内小时费率（单位：分，为空则使用用户表费率）',
    join_date DATE COMMENT '加入日期',
    leave_date DATE COMMENT '离开日期',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_project_user (project_id, user_id),
    INDEX idx_project_id (project_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目成员表';

-- 5. 工时表
CREATE TABLE proj_timesheet (
    timesheet_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '工时ID',
    user_id BIGINT NOT NULL COMMENT '填报人ID',
    project_id BIGINT NOT NULL COMMENT '项目ID',
    work_date DATE NOT NULL COMMENT '工作日期',
    start_time TIME NOT NULL COMMENT '开始时间',
    end_time TIME NOT NULL COMMENT '结束时间',
    work_hours DECIMAL(4,2) NOT NULL COMMENT '工时（小时）',
    work_content TEXT COMMENT '工作内容',
    approval_status TINYINT DEFAULT 0 COMMENT '审批状态：0-草稿，1-待审批，2-已通过，3-已拒绝',
    current_approver_id BIGINT COMMENT '当前审批人ID',
    rejection_reason VARCHAR(500) COMMENT '拒绝原因',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    submit_time DATETIME COMMENT '提交时间',
    approval_time DATETIME COMMENT '审批时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (user_id),
    INDEX idx_project_id (project_id),
    INDEX idx_work_date (work_date),
    INDEX idx_approval_status (approval_status),
    INDEX idx_user_date (user_id, work_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工时表';

-- 6. 审批流配置表
CREATE TABLE sys_approval_flow (
    flow_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '流程ID',
    flow_name VARCHAR(100) NOT NULL COMMENT '流程名称',
    flow_type VARCHAR(50) NOT NULL COMMENT '流程类型：timesheet-工时审批',
    dept_id BIGINT COMMENT '适用部门ID',
    project_id BIGINT COMMENT '适用项目ID',
    approver_order INT NOT NULL COMMENT '审批顺序',
    approver_id BIGINT NOT NULL COMMENT '审批人ID',
    status TINYINT DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_flow_type (flow_type),
    INDEX idx_dept_project (dept_id, project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审批流配置表';

-- 7. 审批记录表
CREATE TABLE sys_approval_record (
    record_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
    flow_type VARCHAR(50) NOT NULL COMMENT '流程类型',
    business_id BIGINT NOT NULL COMMENT '业务ID',
    approver_id BIGINT NOT NULL COMMENT '审批人ID',
    approve_order INT NOT NULL COMMENT '审批顺序',
    approval_status TINYINT NOT NULL COMMENT '审批状态：2-通过，3-拒绝',
    approval_comment VARCHAR(500) COMMENT '审批意见',
    approval_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '审批时间',
    INDEX idx_business (flow_type, business_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审批记录表';

-- 8. 工作日历表
CREATE TABLE sys_work_calendar (
    calendar_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日历ID',
    calendar_date DATE NOT NULL UNIQUE COMMENT '日期',
    date_type TINYINT NOT NULL COMMENT '日期类型：1-工作日，2-周末，3-节假日',
    week_day INT COMMENT '星期几（1-7）',
    holiday_name VARCHAR(100) COMMENT '节假日名称',
    INDEX idx_calendar_date (calendar_date),
    INDEX idx_date_type (date_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作日历表';

-- 9. 报表缓存表
CREATE TABLE proj_report_cache (
    cache_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '缓存ID',
    cache_key VARCHAR(200) NOT NULL UNIQUE COMMENT '缓存键',
    cache_type VARCHAR(50) NOT NULL COMMENT '缓存类型：project_cost-项目成本，utilization-利用率',
    dimension VARCHAR(100) COMMENT '维度：day,week,month,project,user,dept',
    start_date DATE COMMENT '开始日期',
    end_date DATE COMMENT '结束日期',
    cache_data JSON COMMENT '缓存数据',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    expire_time DATETIME COMMENT '过期时间',
    INDEX idx_cache_key (cache_key),
    INDEX idx_cache_type (cache_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='报表缓存表';

-- 10. 工时汇总表（用于快速查询）
CREATE TABLE proj_timesheet_summary (
    summary_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '汇总ID',
    project_id BIGINT NOT NULL COMMENT '项目ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    summary_date DATE NOT NULL COMMENT '汇总日期（按月的话是当月第一天）',
    summary_type VARCHAR(20) NOT NULL COMMENT '汇总类型：day,week,month',
    total_hours DECIMAL(10,2) DEFAULT 0 COMMENT '总工时',
    total_cost INT DEFAULT 0 COMMENT '总成本（单位：分）',
    approved_hours DECIMAL(10,2) DEFAULT 0 COMMENT '已审批工时',
    approved_cost INT DEFAULT 0 COMMENT '已审批成本',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_summary (project_id, user_id, summary_date, summary_type),
    INDEX idx_project_date (project_id, summary_date),
    INDEX idx_user_date (user_id, summary_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工时汇总表';

-- 初始化数据
-- 插入默认部门
INSERT INTO sys_dept (dept_id, dept_name, parent_id, sort_order) VALUES
(1, '总公司', 0, 1),
(2, '技术部', 1, 1),
(3, '产品部', 1, 2),
(4, '项目部', 1, 3);

-- 插入默认用户（密码：123456）
INSERT INTO sys_user (user_id, username, password, real_name, dept_id, email, hourly_rate, role) VALUES
(1, 'admin', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '管理员', 1, 'admin@company.com', 50000, 'admin'),
(2, 'manager1', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '项目经理A', 4, 'mgr1@company.com', 40000, 'manager'),
(3, 'emp1', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '员工A', 2, 'emp1@company.com', 20000, 'employee'),
(4, 'emp2', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '员工B', 2, 'emp2@company.com', 25000, 'employee');

-- 插入示例项目
INSERT INTO proj_project (project_id, project_code, project_name, project_type, dept_id, manager_id, start_date, end_date, budget_cost, budget_hours, status, create_by) VALUES
(1, 'P2024001', '客户管理系统开发', '软件开发', 4, 2, '2024-01-01', '2024-06-30', 5000000, 1000, 1, 1),
(2, 'P2024002', '移动端APP开发', '软件开发', 4, 2, '2024-03-01', '2024-08-31', 3000000, 600, 1, 1);

-- 插入项目成员
INSERT INTO proj_project_member (project_id, user_id, role, hourly_rate, join_date) VALUES
(1, 2, 'manager', 40000, '2024-01-01'),
(1, 3, 'member', 20000, '2024-01-01'),
(1, 4, 'member', 25000, '2024-01-15'),
(2, 2, 'manager', 40000, '2024-03-01'),
(2, 3, 'member', 20000, '2024-03-01');

-- 插入审批流配置
INSERT INTO sys_approval_flow (flow_name, flow_type, dept_id, approver_order, approver_id) VALUES
('工时审批-部门经理', 'timesheet', 4, 1, 2);

-- 插入2024年工作日历（简化版，假设周一到周五为工作日）
INSERT INTO sys_work_calendar (calendar_date, date_type, week_day)
SELECT 
    date,
    CASE WHEN WEEKDAY(date) < 5 THEN 1 ELSE 2 END as date_type,
    WEEKDAY(date) + 1 as week_day
FROM (
    SELECT ADDDATE('2024-01-01', t4*1000 + t3*100 + t2*10 + t1) as date
    FROM 
        (SELECT 0 t1 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) t1,
        (SELECT 0 t2 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) t2,
        (SELECT 0 t3 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) t3,
        (SELECT 0 t4 UNION SELECT 1) t4
) dates
WHERE date BETWEEN '2024-01-01' AND '2024-12-31';

-- 更新节假日（示例：元旦、春节、劳动节、国庆）
UPDATE sys_work_calendar SET date_type = 3, holiday_name = '元旦' WHERE calendar_date = '2024-01-01';
UPDATE sys_work_calendar SET date_type = 3, holiday_name = '春节' WHERE calendar_date BETWEEN '2024-02-10' AND '2024-02-17';
UPDATE sys_work_calendar SET date_type = 3, holiday_name = '清明节' WHERE calendar_date = '2024-04-04';
UPDATE sys_work_calendar SET date_type = 3, holiday_name = '劳动节' WHERE calendar_date BETWEEN '2024-05-01' AND '2024-05-05';
UPDATE sys_work_calendar SET date_type = 3, holiday_name = '端午节' WHERE calendar_date = '2024-06-10';
UPDATE sys_work_calendar SET date_type = 3, holiday_name = '中秋节' WHERE calendar_date = '2024-09-17';
UPDATE sys_work_calendar SET date_type = 3, holiday_name = '国庆节' WHERE calendar_date BETWEEN '2024-10-01' AND '2024-10-07';
