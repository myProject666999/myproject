CREATE DATABASE IF NOT EXISTS enterprise_cashflow DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE enterprise_cashflow;

CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'VIEWER',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE account (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_name VARCHAR(100) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    account_no VARCHAR(50) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'CNY',
    balance BIGINT NOT NULL DEFAULT 0,
    is_deleted TINYINT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE account_transaction (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_id BIGINT NOT NULL,
    type VARCHAR(10) NOT NULL,
    amount BIGINT NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'CNY',
    description VARCHAR(500),
    transaction_date DATE NOT NULL,
    related_type VARCHAR(30),
    related_id BIGINT,
    is_deleted TINYINT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_account_id (account_id),
    INDEX idx_transaction_date (transaction_date),
    CONSTRAINT fk_transaction_account FOREIGN KEY (account_id) REFERENCES account(id)
) ENGINE=InnoDB;

CREATE TABLE receivable (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    amount BIGINT NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'CNY',
    due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    received_amount BIGINT NOT NULL DEFAULT 0,
    description VARCHAR(500),
    is_deleted TINYINT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_due_date (due_date),
    INDEX idx_status (status)
) ENGINE=InnoDB;

CREATE TABLE payable (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(100) NOT NULL,
    amount BIGINT NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'CNY',
    due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    paid_amount BIGINT NOT NULL DEFAULT 0,
    description VARCHAR(500),
    is_deleted TINYINT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_due_date (due_date),
    INDEX idx_status (status)
) ENGINE=InnoDB;

CREATE TABLE exchange_rate (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    from_currency VARCHAR(10) NOT NULL,
    to_currency VARCHAR(10) NOT NULL,
    rate DECIMAL(18,8) NOT NULL,
    effective_date DATE NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_currency_pair (from_currency, to_currency),
    INDEX idx_effective_date (effective_date)
) ENGINE=InnoDB;

CREATE TABLE warning_threshold (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    absolute_amount BIGINT,
    percentage DECIMAL(5,2),
    level VARCHAR(10) NOT NULL,
    is_enabled TINYINT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE warning_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    trigger_date DATE NOT NULL,
    gap_date DATE NOT NULL,
    gap_amount BIGINT NOT NULL,
    level VARCHAR(10) NOT NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'ACTIVE',
    resolved_at DATETIME,
    threshold_name VARCHAR(100),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_trigger_date (trigger_date)
) ENGINE=InnoDB;

CREATE TABLE daily_report (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_date DATE NOT NULL UNIQUE,
    opening_balance BIGINT NOT NULL,
    total_income BIGINT NOT NULL DEFAULT 0,
    total_expense BIGINT NOT NULL DEFAULT 0,
    closing_balance BIGINT NOT NULL,
    content_json TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_report_date (report_date)
) ENGINE=InnoDB;

INSERT INTO sys_user (username, password, role) VALUES ('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'ADMIN');
INSERT INTO sys_user (username, password, role) VALUES ('finance', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'FINANCE');
INSERT INTO sys_user (username, password, role) VALUES ('viewer', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'VIEWER');

INSERT INTO account (account_name, bank_name, account_no, currency, balance) VALUES ('基本户', '中国工商银行', '6222****1001', 'CNY', 500000000);
INSERT INTO account (account_name, bank_name, account_no, currency, balance) VALUES ('美元户', '中国银行', '6222****2001', 'USD', 10000000);
INSERT INTO account (account_name, bank_name, account_no, currency, balance) VALUES ('税费专户', '中国建设银行', '6222****3001', 'CNY', 50000000);

INSERT INTO exchange_rate (from_currency, to_currency, rate, effective_date) VALUES ('USD', 'CNY', 7.25000000, '2026-05-31');
INSERT INTO exchange_rate (from_currency, to_currency, rate, effective_date) VALUES ('EUR', 'CNY', 7.90000000, '2026-05-31');
INSERT INTO exchange_rate (from_currency, to_currency, rate, effective_date) VALUES ('HKD', 'CNY', 0.93000000, '2026-05-31');
INSERT INTO exchange_rate (from_currency, to_currency, rate, effective_date) VALUES ('JPY', 'CNY', 0.04800000, '2026-05-31');

INSERT INTO warning_threshold (name, type, absolute_amount, percentage, level, is_enabled) VALUES ('黄色预警', 'ABSOLUTE', 20000000, NULL, 'YELLOW', 1);
INSERT INTO warning_threshold (name, type, absolute_amount, percentage, level, is_enabled) VALUES ('橙色预警', 'ABSOLUTE', 10000000, NULL, 'ORANGE', 1);
INSERT INTO warning_threshold (name, type, absolute_amount, percentage, level, is_enabled) VALUES ('红色预警', 'ABSOLUTE', 5000000, NULL, 'RED', 1);

INSERT INTO receivable (customer_name, amount, currency, due_date, status, received_amount, description) VALUES ('华为技术有限公司', 300000000, 'CNY', '2026-06-05', 'PENDING', 0, 'Q2项目尾款');
INSERT INTO receivable (customer_name, amount, currency, due_date, status, received_amount, description) VALUES ('腾讯科技', 150000000, 'CNY', '2026-06-10', 'PENDING', 0, '云服务费');
INSERT INTO receivable (customer_name, amount, currency, due_date, status, received_amount, description) VALUES ('Alibaba Group', 5000000, 'USD', '2026-06-15', 'PENDING', 0, '技术服务费');
INSERT INTO receivable (customer_name, amount, currency, due_date, status, received_amount, description) VALUES ('字节跳动', 80000000, 'CNY', '2026-06-20', 'PENDING', 0, '广告投放款');
INSERT INTO receivable (customer_name, amount, currency, due_date, status, received_amount, description) VALUES ('美团', 60000000, 'CNY', '2026-05-25', 'OVERDUE', 0, '平台服务费（已逾期）');
INSERT INTO receivable (customer_name, amount, currency, due_date, status, received_amount, description) VALUES ('小米科技', 120000000, 'CNY', '2026-07-01', 'PENDING', 0, '硬件采购款');
INSERT INTO receivable (customer_name, amount, currency, due_date, status, received_amount, description) VALUES ('京东集团', 45000000, 'CNY', '2026-07-15', 'PENDING', 0, '供应链服务费');

INSERT INTO payable (supplier_name, amount, currency, due_date, status, paid_amount, description) VALUES ('阿里云', 80000000, 'CNY', '2026-06-03', 'PENDING', 0, '服务器租赁费');
INSERT INTO payable (supplier_name, amount, currency, due_date, status, paid_amount, description) VALUES ('中国移动', 25000000, 'CNY', '2026-06-08', 'PENDING', 0, '通信服务费');
INSERT INTO payable (supplier_name, amount, currency, due_date, status, paid_amount, description) VALUES ('员工薪资', 350000000, 'CNY', '2026-06-05', 'PENDING', 0, '6月份工资');
INSERT INTO payable (supplier_name, amount, currency, due_date, status, paid_amount, description) VALUES ('办公室租金', 120000000, 'CNY', '2026-06-10', 'PENDING', 0, 'Q2办公室租金');
INSERT INTO payable (supplier_name, amount, currency, due_date, status, paid_amount, description) VALUES ('AWS', 3000000, 'USD', '2026-06-20', 'PENDING', 0, '云服务月费');
INSERT INTO payable (supplier_name, amount, currency, due_date, status, paid_amount, description) VALUES ('社保公积金', 95000000, 'CNY', '2026-06-15', 'PENDING', 0, '6月社保公积金');
INSERT INTO payable (supplier_name, amount, currency, due_date, status, paid_amount, description) VALUES ('税务缴纳', 180000000, 'CNY', '2026-06-25', 'PENDING', 0, 'Q2企业所得税');
INSERT INTO payable (supplier_name, amount, currency, due_date, status, paid_amount, description) VALUES ('供应商A', 40000000, 'CNY', '2026-07-01', 'PENDING', 0, '原材料采购款');
