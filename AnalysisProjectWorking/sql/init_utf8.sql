-- Project Cost Analysis Database Script
CREATE DATABASE IF NOT EXISTS project_cost_analysis DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE project_cost_analysis;

-- Drop tables in reverse order
DROP TABLE IF EXISTS proj_timesheet_summary;
DROP TABLE IF EXISTS proj_report_cache;
DROP TABLE IF EXISTS sys_work_calendar;
DROP TABLE IF EXISTS sys_approval_record;
DROP TABLE IF EXISTS sys_approval_flow;
DROP TABLE IF EXISTS proj_timesheet;
DROP TABLE IF EXISTS proj_project_member;
DROP TABLE IF EXISTS proj_project;
DROP TABLE IF EXISTS sys_user;
DROP TABLE IF EXISTS sys_dept;

-- 1. Department table
CREATE TABLE sys_dept (
    dept_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    dept_name VARCHAR(100) NOT NULL,
    parent_id BIGINT DEFAULT 0,
    sort_order INT DEFAULT 0,
    status TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. User table
CREATE TABLE sys_user (
    user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    real_name VARCHAR(50) NOT NULL,
    dept_id BIGINT,
    email VARCHAR(100),
    phone VARCHAR(20),
    hourly_rate INT DEFAULT 0 COMMENT 'hourly rate in cents',
    role VARCHAR(20) DEFAULT 'employee' COMMENT 'admin, manager, employee',
    status TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_dept_id (dept_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Project table
CREATE TABLE proj_project (
    project_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_code VARCHAR(50) NOT NULL UNIQUE,
    project_name VARCHAR(200) NOT NULL,
    project_type VARCHAR(50),
    dept_id BIGINT,
    manager_id BIGINT,
    start_date DATE,
    end_date DATE,
    budget_cost INT DEFAULT 0 COMMENT 'budget in cents',
    budget_hours DECIMAL(10,2) DEFAULT 0,
    description TEXT,
    status TINYINT DEFAULT 1 COMMENT '0:draft,1:active,2:done,3:cancelled',
    create_by BIGINT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_dept_id (dept_id),
    INDEX idx_manager_id (manager_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Project member table
CREATE TABLE proj_project_member (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(50) DEFAULT 'member' COMMENT 'manager, member',
    hourly_rate INT DEFAULT 0 COMMENT 'hourly rate in cents for this project',
    join_date DATE,
    leave_date DATE,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_project_user (project_id, user_id),
    INDEX idx_project_id (project_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Timesheet table
CREATE TABLE proj_timesheet (
    timesheet_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    project_id BIGINT NOT NULL,
    work_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    work_hours DECIMAL(4,2) NOT NULL,
    work_content TEXT,
    approval_status TINYINT DEFAULT 0 COMMENT '0:draft,1:pending,2:approved,3:rejected',
    current_approver_id BIGINT,
    rejection_reason VARCHAR(500),
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    submit_time DATETIME,
    approval_time DATETIME,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_project_id (project_id),
    INDEX idx_work_date (work_date),
    INDEX idx_approval_status (approval_status),
    INDEX idx_user_date (user_id, work_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Approval flow config
CREATE TABLE sys_approval_flow (
    flow_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    flow_name VARCHAR(100) NOT NULL,
    flow_type VARCHAR(50) NOT NULL COMMENT 'timesheet',
    dept_id BIGINT,
    project_id BIGINT,
    approver_order INT NOT NULL,
    approver_id BIGINT NOT NULL,
    status TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_flow_type (flow_type),
    INDEX idx_dept_project (dept_id, project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Approval record
CREATE TABLE sys_approval_record (
    record_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    flow_type VARCHAR(50) NOT NULL,
    business_id BIGINT NOT NULL,
    approver_id BIGINT NOT NULL,
    approve_order INT NOT NULL,
    approval_status TINYINT NOT NULL COMMENT '2:approved,3:rejected',
    approval_comment VARCHAR(500),
    approval_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_business (flow_type, business_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Work calendar
CREATE TABLE sys_work_calendar (
    calendar_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    calendar_date DATE NOT NULL UNIQUE,
    date_type TINYINT NOT NULL COMMENT '1:workday,2:weekend,3:holiday',
    week_day INT,
    holiday_name VARCHAR(100),
    INDEX idx_calendar_date (calendar_date),
    INDEX idx_date_type (date_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Report cache
CREATE TABLE proj_report_cache (
    cache_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    cache_key VARCHAR(200) NOT NULL UNIQUE,
    cache_type VARCHAR(50) NOT NULL,
    dimension VARCHAR(100),
    start_date DATE,
    end_date DATE,
    cache_data JSON,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    expire_time DATETIME,
    INDEX idx_cache_key (cache_key),
    INDEX idx_cache_type (cache_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Timesheet summary for fast query
CREATE TABLE proj_timesheet_summary (
    summary_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    summary_date DATE NOT NULL,
    summary_type VARCHAR(20) NOT NULL COMMENT 'day,week,month',
    total_hours DECIMAL(10,2) DEFAULT 0,
    total_cost INT DEFAULT 0 COMMENT 'in cents',
    approved_hours DECIMAL(10,2) DEFAULT 0,
    approved_cost INT DEFAULT 0 COMMENT 'in cents',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_summary (project_id, user_id, summary_date, summary_type),
    INDEX idx_project_date (project_id, summary_date),
    INDEX idx_user_date (user_id, summary_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert initial data
-- Departments
INSERT INTO sys_dept (dept_id, dept_name, parent_id, sort_order) VALUES
(1, 'Headquarters', 0, 1),
(2, 'Technology', 1, 1),
(3, 'Product', 1, 2),
(4, 'PMO', 1, 3);

-- Users (password: 123456)
INSERT INTO sys_user (user_id, username, password, real_name, dept_id, email, hourly_rate, role) VALUES
(1, 'admin', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'Admin', 1, 'admin@company.com', 50000, 'admin'),
(2, 'manager1', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'Manager A', 4, 'mgr1@company.com', 40000, 'manager'),
(3, 'emp1', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'Employee A', 2, 'emp1@company.com', 20000, 'employee'),
(4, 'emp2', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'Employee B', 2, 'emp2@company.com', 25000, 'employee');

-- Sample projects
INSERT INTO proj_project (project_id, project_code, project_name, project_type, dept_id, manager_id, start_date, end_date, budget_cost, budget_hours, status, create_by) VALUES
(1, 'P2024001', 'CRM System Development', 'Software', 4, 2, '2024-01-01', '2024-06-30', 5000000, 1000, 1, 1),
(2, 'P2024002', 'Mobile APP Development', 'Software', 4, 2, '2024-03-01', '2024-08-31', 3000000, 600, 1, 1);

-- Project members
INSERT INTO proj_project_member (project_id, user_id, role, hourly_rate, join_date) VALUES
(1, 2, 'manager', 40000, '2024-01-01'),
(1, 3, 'member', 20000, '2024-01-01'),
(1, 4, 'member', 25000, '2024-01-15'),
(2, 2, 'manager', 40000, '2024-03-01'),
(2, 3, 'member', 20000, '2024-03-01');

-- Approval flow
INSERT INTO sys_approval_flow (flow_name, flow_type, dept_id, approver_order, approver_id) VALUES
('Timesheet Approval', 'timesheet', 4, 1, 2);

-- Work calendar for 2024
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

-- Holidays
UPDATE sys_work_calendar SET date_type = 3, holiday_name = 'New Year' WHERE calendar_date = '2024-01-01';
UPDATE sys_work_calendar SET date_type = 3, holiday_name = 'Spring Festival' WHERE calendar_date BETWEEN '2024-02-10' AND '2024-02-17';
UPDATE sys_work_calendar SET date_type = 3, holiday_name = 'Labour Day' WHERE calendar_date BETWEEN '2024-05-01' AND '2024-05-05';
UPDATE sys_work_calendar SET date_type = 3, holiday_name = 'National Day' WHERE calendar_date BETWEEN '2024-10-01' AND '2024-10-07';
