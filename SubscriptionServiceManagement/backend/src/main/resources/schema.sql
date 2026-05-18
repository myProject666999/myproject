CREATE TABLE IF NOT EXISTS subscriptions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '订阅名称',
    description VARCHAR(500) COMMENT '描述',
    category VARCHAR(50) COMMENT '分类：视频、音乐、云存储、工具等',
    price DECIMAL(10, 2) NOT NULL COMMENT '价格',
    currency VARCHAR(10) NOT NULL DEFAULT 'CNY' COMMENT '币种：CNY、USD、EUR等',
    cycle_type VARCHAR(20) NOT NULL COMMENT '周期类型：MONTHLY、YEARLY、CUSTOM',
    cycle_days INT COMMENT '自定义周期天数（当cycle_type为CUSTOM时有效）',
    start_date DATE NOT NULL COMMENT '订阅开始日期',
    next_renewal_date DATE NOT NULL COMMENT '下次续费日期',
    is_active TINYINT(1) DEFAULT 1 COMMENT '是否有效：1-有效，0-已取消',
    reminder_days INT DEFAULT 7 COMMENT '提前多少天提醒',
    payment_method VARCHAR(50) COMMENT '支付方式',
    account VARCHAR(100) COMMENT '绑定账号',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_next_renewal (next_renewal_date),
    INDEX idx_active (is_active),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订阅服务表';

CREATE TABLE IF NOT EXISTS exchange_rates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    currency_from VARCHAR(10) NOT NULL COMMENT '源币种',
    currency_to VARCHAR(10) NOT NULL DEFAULT 'CNY' COMMENT '目标币种',
    rate DECIMAL(15, 6) NOT NULL COMMENT '汇率',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_currency_pair (currency_from, currency_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='汇率表';

CREATE TABLE IF NOT EXISTS reminders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    subscription_id BIGINT NOT NULL COMMENT '订阅ID',
    reminder_date DATE NOT NULL COMMENT '提醒日期',
    is_sent TINYINT(1) DEFAULT 0 COMMENT '是否已发送：1-已发送，0-未发送',
    message VARCHAR(500) COMMENT '提醒消息',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
    INDEX idx_reminder_date (reminder_date),
    INDEX idx_sent (is_sent)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='提醒记录表';
