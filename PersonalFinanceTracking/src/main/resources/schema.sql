CREATE DATABASE IF NOT EXISTS personal_finance DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE personal_finance;

DROP TABLE IF EXISTS budget;
DROP TABLE IF EXISTS transaction;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS account;

CREATE TABLE account (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '账户名称',
    type VARCHAR(20) NOT NULL COMMENT '账户类型：现金/银行卡/支付宝/微信/其他',
    balance DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT '账户余额',
    description VARCHAR(200) COMMENT '备注',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='账户表';

CREATE TABLE category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '分类名称',
    type VARCHAR(10) NOT NULL COMMENT '类型：expense-支出 income-收入',
    icon VARCHAR(50) COMMENT '图标',
    sort_order INT NOT NULL DEFAULT 0 COMMENT '排序',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分类表';

CREATE TABLE transaction (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_id BIGINT NOT NULL COMMENT '账户ID',
    category_id BIGINT NOT NULL COMMENT '分类ID',
    type VARCHAR(10) NOT NULL COMMENT '类型：expense-支出 income-收入',
    amount DECIMAL(15,2) NOT NULL COMMENT '金额',
    description VARCHAR(500) COMMENT '描述',
    transaction_date DATE NOT NULL COMMENT '交易日期',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_account_id (account_id),
    INDEX idx_category_id (category_id),
    INDEX idx_transaction_date (transaction_date),
    INDEX idx_type (type),
    FOREIGN KEY (account_id) REFERENCES account(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='交易记录表';

CREATE TABLE budget (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT NOT NULL COMMENT '分类ID',
    year INT NOT NULL COMMENT '年份',
    month INT NOT NULL COMMENT '月份',
    budget_amount DECIMAL(15,2) NOT NULL COMMENT '预算金额',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_category_year_month (category_id, year, month),
    INDEX idx_year_month (year, month),
    FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预算表';

INSERT INTO account (name, type, balance, description) VALUES
('现金', '现金', 0.00, '日常使用的现金'),
('工资卡', '银行卡', 0.00, '主要工资卡'),
('支付宝', '支付宝', 0.00, '支付宝账户'),
('微信钱包', '微信', 0.00, '微信支付账户');

INSERT INTO category (name, type, icon, sort_order) VALUES
('餐饮', 'expense', '🍜', 1),
('交通', 'expense', '🚗', 2),
('购物', 'expense', '🛒', 3),
('娱乐', 'expense', '🎮', 4),
('医疗', 'expense', '💊', 5),
('教育', 'expense', '📚', 6),
('住房', 'expense', '🏠', 7),
('通讯', 'expense', '📱', 8),
('其他支出', 'expense', '📝', 99),
('工资', 'income', '💰', 1),
('奖金', 'income', '🎁', 2),
('投资收益', 'income', '📈', 3),
('兼职', 'income', '💼', 4),
('其他收入', 'income', '📥', 99);
