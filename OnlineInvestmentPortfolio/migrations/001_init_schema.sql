-- 创建数据库
CREATE DATABASE IF NOT EXISTS investment_portfolio DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE investment_portfolio;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    balance DECIMAL(15, 2) NOT NULL DEFAULT 100000.00,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 自选股表
CREATE TABLE IF NOT EXISTS watchlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_symbol (user_id, symbol),
    INDEX idx_user_id (user_id),
    INDEX idx_symbol (symbol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 持仓表
CREATE TABLE IF NOT EXISTS positions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    shares INT NOT NULL DEFAULT 0,
    avg_cost DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_symbol (user_id, symbol),
    INDEX idx_user_id (user_id),
    INDEX idx_symbol (symbol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 交易记录表
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    type ENUM('buy', 'sell') NOT NULL,
    shares INT NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    total DECIMAL(15, 2) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_symbol (symbol),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 提醒表
CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    type ENUM('price_above', 'price_below', 'change_percent') NOT NULL,
    threshold DECIMAL(15, 4) NOT NULL,
    enabled TINYINT(1) NOT NULL DEFAULT 1,
    triggered TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_symbol (symbol),
    INDEX idx_enabled (enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 收益记录表（用于生成收益曲线）
CREATE TABLE IF NOT EXISTS performance_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    total_value DECIMAL(15, 2) NOT NULL,
    cash_balance DECIMAL(15, 2) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, date),
    INDEX idx_user_id (user_id),
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入示例股票数据（用于模拟行情）
CREATE TABLE IF NOT EXISTS stocks (
    symbol VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    price_change DECIMAL(15, 2) NOT NULL DEFAULT 0,
    change_percent DECIMAL(8, 4) NOT NULL DEFAULT 0,
    volume BIGINT NOT NULL DEFAULT 0,
    market_cap DECIMAL(20, 2) NOT NULL DEFAULT 0,
    pe_ratio DECIMAL(10, 2) NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_symbol (symbol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入一些示例股票数据
INSERT IGNORE INTO stocks (symbol, name, price, price_change, change_percent, volume, market_cap, pe_ratio) VALUES
('AAPL', '苹果公司', 178.50, 2.35, 1.33, 52340000, 2800000000000.00, 28.5),
('GOOGL', '谷歌', 141.80, -1.20, -0.84, 21450000, 1780000000000.00, 25.2),
('MSFT', '微软', 378.90, 4.56, 1.22, 18760000, 2850000000000.00, 35.8),
('AMZN', '亚马逊', 178.25, 3.15, 1.80, 35670000, 1850000000000.00, 62.3),
('TSLA', '特斯拉', 248.50, -5.30, -2.09, 98760000, 790000000000.00, 72.1),
('META', 'Meta', 505.20, 8.90, 1.79, 14320000, 1300000000000.00, 32.4),
('NVDA', '英伟达', 875.30, 15.60, 1.81, 42150000, 2160000000000.00, 68.5),
('BABA', '阿里巴巴', 85.60, 1.25, 1.48, 12340000, 215000000000.00, 12.3),
('JD', '京东', 28.45, 0.35, 1.24, 8760000, 45000000000.00, 18.6),
('PDD', '拼多多', 145.80, -2.30, -1.55, 6540000, 185000000000.00, 22.8),
('000001.SZ', '平安银行', 11.25, 0.18, 1.63, 85630000, 218000000000.00, 8.5),
('600519.SS', '贵州茅台', 1685.00, 25.50, 1.54, 2340000, 2120000000000.00, 32.6),
('601318.SS', '中国平安', 45.80, 0.65, 1.44, 45670000, 835000000000.00, 9.8),
('000858.SZ', '五粮液', 152.30, 2.15, 1.43, 12340000, 590000000000.00, 25.2),
('600036.SS', '招商银行', 32.45, 0.42, 1.31, 34560000, 810000000000.00, 7.2);
