DROP TABLE IF EXISTS sys_dept;
CREATE TABLE sys_dept (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    dept_name VARCHAR(100) NOT NULL,
    parent_id BIGINT DEFAULT 0,
    dept_level INT DEFAULT 1,
    status TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS sys_role;
CREATE TABLE sys_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_code VARCHAR(50) NOT NULL UNIQUE,
    role_name VARCHAR(100) NOT NULL,
    description VARCHAR(200),
    status TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS sys_user;
CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    real_name VARCHAR(50) NOT NULL,
    employee_no VARCHAR(50) NOT NULL UNIQUE,
    dept_id BIGINT,
    phone VARCHAR(20),
    email VARCHAR(100),
    status TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (dept_id) REFERENCES sys_dept(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS sys_user_role;
CREATE TABLE sys_user_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES sys_user(id),
    FOREIGN KEY (role_id) REFERENCES sys_role(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS reimbursement_type;
CREATE TABLE reimbursement_type (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type_code VARCHAR(50) NOT NULL UNIQUE,
    type_name VARCHAR(100) NOT NULL,
    max_amount DECIMAL(12,2) DEFAULT 9999999.99,
    description VARCHAR(200),
    status TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS reimbursement;
CREATE TABLE reimbursement (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reimbursement_no VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    type_id BIGINT NOT NULL,
    applicant_id BIGINT NOT NULL,
    dept_id BIGINT,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    reason TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    current_approver_id BIGINT,
    current_approval_level INT DEFAULT 1,
    submit_time DATETIME,
    approval_time DATETIME,
    payment_time DATETIME,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (applicant_id) REFERENCES sys_user(id),
    FOREIGN KEY (type_id) REFERENCES reimbursement_type(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS reimbursement_item;
CREATE TABLE reimbursement_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reimbursement_id BIGINT NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    item_type VARCHAR(50),
    amount DECIMAL(12,2) NOT NULL,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(12,2),
    expense_date DATE,
    description VARCHAR(500),
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reimbursement_id) REFERENCES reimbursement(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS invoice_attachment;
CREATE TABLE invoice_attachment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reimbursement_id BIGINT NOT NULL,
    item_id BIGINT,
    file_name VARCHAR(200) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size BIGINT,
    invoice_no VARCHAR(50),
    invoice_code VARCHAR(50),
    invoice_amount DECIMAL(12,2),
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reimbursement_id) REFERENCES reimbursement(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES reimbursement_item(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS approval_flow_config;
CREATE TABLE approval_flow_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type_id BIGINT NOT NULL,
    dept_id BIGINT,
    min_amount DECIMAL(12,2) DEFAULT 0,
    max_amount DECIMAL(12,2) DEFAULT 9999999.99,
    approval_level INT NOT NULL,
    approver_role_id BIGINT NOT NULL,
    approver_user_id BIGINT,
    status TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (type_id) REFERENCES reimbursement_type(id),
    FOREIGN KEY (approver_role_id) REFERENCES sys_role(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS approval_record;
CREATE TABLE approval_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reimbursement_id BIGINT NOT NULL,
    approver_id BIGINT NOT NULL,
    approver_name VARCHAR(50) NOT NULL,
    approval_level INT NOT NULL,
    approval_action VARCHAR(30) NOT NULL,
    opinion TEXT,
    approval_time DATETIME,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reimbursement_id) REFERENCES reimbursement(id) ON DELETE CASCADE,
    FOREIGN KEY (approver_id) REFERENCES sys_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_reimbursement_applicant ON reimbursement(applicant_id);
CREATE INDEX idx_reimbursement_status ON reimbursement(status);
CREATE INDEX idx_reimbursement_current_approver ON reimbursement(current_approver_id);
CREATE INDEX idx_approval_record_reimbursement ON approval_record(reimbursement_id);
CREATE INDEX idx_invoice_attachment_reimbursement ON invoice_attachment(reimbursement_id);
CREATE INDEX idx_approval_flow_config_type ON approval_flow_config(type_id);

INSERT INTO sys_dept (dept_name, parent_id, dept_level) VALUES
('Company HQ', 0, 1),
('Technology Dept', 1, 2),
('Finance Dept', 1, 2),
('Marketing Dept', 1, 2),
('HR Dept', 1, 2),
('Dev Team', 2, 3),
('Test Team', 2, 3);

INSERT INTO sys_role (role_code, role_name, description) VALUES
('EMPLOYEE', 'Employee', 'General employee role'),
('DEPT_MANAGER', 'Department Manager', 'Department manager role'),
('FINANCE', 'Finance Staff', 'Finance staff role'),
('FINANCE_MANAGER', 'Finance Manager', 'Finance manager role'),
('GENERAL_MANAGER', 'General Manager', 'General manager role');

INSERT INTO sys_user (username, password, real_name, employee_no, dept_id, phone, email) VALUES
('zhangsan', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'Zhang San', 'EMP001', 6, '13800138001', 'zhangsan@company.com'),
('lisi', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'Li Si', 'EMP002', 6, '13800138002', 'lisi@company.com'),
('wangwu', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'Wang Wu', 'EMP003', 3, '13800138003', 'wangwu@company.com'),
('zhaoliu', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'Zhao Liu', 'EMP004', 3, '13800138004', 'zhaoliu@company.com'),
('qianqi', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'Qian Qi', 'EMP005', 2, '13800138005', 'qianqi@company.com'),
('sunba', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'Sun Ba', 'EMP006', 1, '13800138006', 'sunba@company.com');

INSERT INTO sys_user_role (user_id, role_id) VALUES
(1, 1),
(2, 1),
(3, 1), (3, 3),
(4, 1), (4, 4),
(5, 1), (5, 2),
(6, 1), (6, 5);

INSERT INTO reimbursement_type (type_code, type_name, max_amount, description) VALUES
('TRAVEL', 'Travel Expense', 50000.00, 'Business travel expenses'),
('OFFICE', 'Office Supplies', 5000.00, 'Office supply purchase'),
('ENTERTAIN', 'Entertainment', 20000.00, 'Business entertainment'),
('TRAINING', 'Training', 30000.00, 'Training expenses'),
('OTHER', 'Other Expense', 100000.00, 'Other expense type');

INSERT INTO approval_flow_config (type_id, dept_id, min_amount, max_amount, approval_level, approver_role_id, approver_user_id) VALUES
(1, NULL, 0, 5000, 1, 2, NULL),
(1, NULL, 0, 5000, 2, 3, NULL),
(1, NULL, 5000.01, 20000, 1, 2, NULL),
(1, NULL, 5000.01, 20000, 2, 3, NULL),
(1, NULL, 5000.01, 20000, 3, 5, NULL),
(1, NULL, 20000.01, 9999999.99, 1, 2, NULL),
(1, NULL, 20000.01, 9999999.99, 2, 4, NULL),
(1, NULL, 20000.01, 9999999.99, 3, 5, NULL),
(2, NULL, 0, 9999999.99, 1, 2, NULL),
(2, NULL, 0, 9999999.99, 2, 3, NULL),
(3, NULL, 0, 5000, 1, 2, NULL),
(3, NULL, 0, 5000, 2, 3, NULL),
(3, NULL, 5000.01, 9999999.99, 1, 2, NULL),
(3, NULL, 5000.01, 9999999.99, 2, 4, NULL),
(3, NULL, 5000.01, 9999999.99, 3, 5, NULL),
(4, NULL, 0, 9999999.99, 1, 2, NULL),
(4, NULL, 0, 9999999.99, 2, 4, NULL),
(5, NULL, 0, 9999999.99, 1, 2, NULL),
(5, NULL, 0, 9999999.99, 2, 4, NULL),
(5, NULL, 0, 9999999.99, 3, 5, NULL);