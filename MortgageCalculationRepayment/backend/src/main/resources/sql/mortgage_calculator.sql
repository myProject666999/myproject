CREATE TABLE IF NOT EXISTS loan_scheme (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT '方案名称',
    loan_amount DECIMAL(15,2) NOT NULL COMMENT '贷款金额（元）',
    loan_term_months INT NOT NULL COMMENT '贷款期限（月）',
    annual_interest_rate DECIMAL(8,4) NOT NULL COMMENT '年利率（%）',
    repayment_type VARCHAR(20) NOT NULL COMMENT '还款方式：EQUAL_INSTALLMENT-等额本息，EQUAL_PRINCIPAL-等额本金',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='贷款方案表';

CREATE TABLE IF NOT EXISTS repayment_plan (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    loan_scheme_id BIGINT NOT NULL COMMENT '贷款方案ID',
    period INT NOT NULL COMMENT '期数',
    repayment_date DATE NOT NULL COMMENT '还款日期',
    monthly_payment DECIMAL(15,2) NOT NULL COMMENT '月供',
    principal DECIMAL(15,2) NOT NULL COMMENT '本金',
    interest DECIMAL(15,2) NOT NULL COMMENT '利息',
    remaining_principal DECIMAL(15,2) NOT NULL COMMENT '剩余本金',
    paid_principal DECIMAL(15,2) DEFAULT 0 COMMENT '已还本金',
    paid_interest DECIMAL(15,2) DEFAULT 0 COMMENT '已还利息',
    is_overdue TINYINT DEFAULT 0 COMMENT '是否逾期：0-否，1-是',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_loan_scheme_id (loan_scheme_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='还款计划表';

CREATE TABLE IF NOT EXISTS prepayment_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    loan_scheme_id BIGINT NOT NULL COMMENT '贷款方案ID',
    prepayment_date DATE NOT NULL COMMENT '提前还款日期',
    prepayment_amount DECIMAL(15,2) NOT NULL COMMENT '提前还款金额',
    prepayment_type VARCHAR(20) NOT NULL COMMENT '提前还款类型：SHORTEN_TERM-减期，REDUCE_PAYMENT-减额',
    remaining_principal_before DECIMAL(15,2) NOT NULL COMMENT '提前还款前剩余本金',
    remaining_principal_after DECIMAL(15,2) NOT NULL COMMENT '提前还款后剩余本金',
    saved_interest DECIMAL(15,2) NOT NULL COMMENT '节省利息',
    new_term_months INT COMMENT '新的期限（减期时）',
    new_monthly_payment DECIMAL(15,2) COMMENT '新月供（减额时）',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_loan_scheme_id (loan_scheme_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='提前还款记录表';

CREATE TABLE IF NOT EXISTS interest_rate_adjustment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    loan_scheme_id BIGINT NOT NULL COMMENT '贷款方案ID',
    adjustment_date DATE NOT NULL COMMENT '调整日期',
    old_rate DECIMAL(8,4) NOT NULL COMMENT '旧利率',
    new_rate DECIMAL(8,4) NOT NULL COMMENT '新利率',
    effective_date DATE NOT NULL COMMENT '生效日期',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_loan_scheme_id (loan_scheme_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='利率调整记录表';

INSERT IGNORE INTO loan_scheme (id, name, loan_amount, loan_term_months, annual_interest_rate, repayment_type) VALUES
(1, '首套房公积金贷款', 1000000.00, 360, 3.1000, 'EQUAL_INSTALLMENT'),
(2, '商贷等额本金', 2000000.00, 360, 4.2000, 'EQUAL_PRINCIPAL');
