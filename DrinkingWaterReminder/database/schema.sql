CREATE DATABASE IF NOT EXISTS drinking_water_reminder DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE drinking_water_reminder;

CREATE TABLE IF NOT EXISTS user_setting (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    weight DECIMAL(5,2) NOT NULL DEFAULT 60.00,
    daily_target INT NOT NULL DEFAULT 2000,
    reminder_interval INT NOT NULL DEFAULT 60,
    reminder_enabled TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS water_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    amount INT NOT NULL,
    record_date DATE NOT NULL,
    record_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_date (record_date)
);

CREATE TABLE IF NOT EXISTS daily_summary (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    summary_date DATE NOT NULL UNIQUE,
    total_amount INT NOT NULL DEFAULT 0,
    target_amount INT NOT NULL DEFAULT 2000,
    is_achieved TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date (summary_date)
);

INSERT INTO user_setting (weight, daily_target, reminder_interval, reminder_enabled) 
VALUES (60.00, 2000, 60, 1);
