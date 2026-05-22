CREATE DATABASE IF NOT EXISTS sleep_record DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE sleep_record;

DROP TABLE IF EXISTS sleep_record;

CREATE TABLE sleep_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    sleep_date DATE NOT NULL COMMENT '入睡日期',
    sleep_time DATETIME NOT NULL COMMENT '入睡时间',
    wake_time DATETIME NOT NULL COMMENT '起床时间',
    quality_score TINYINT NOT NULL DEFAULT 0 COMMENT '睡眠质量打分(1-10)',
    deep_sleep DECIMAL(3,1) NOT NULL DEFAULT 0.0 COMMENT '深睡眠时长(小时)',
    light_sleep DECIMAL(3,1) NOT NULL DEFAULT 0.0 COMMENT '浅睡眠时长(小时)',
    remark VARCHAR(500) DEFAULT NULL COMMENT '备注',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_sleep_date (sleep_date),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='睡眠记录表';

INSERT INTO sleep_record (sleep_date, sleep_time, wake_time, quality_score, deep_sleep, light_sleep, remark) VALUES
('2026-05-01', '2026-05-01 23:30:00', '2026-05-02 07:15:00', 8, 2.5, 5.3, '睡眠质量不错'),
('2026-05-02', '2026-05-03 00:15:00', '2026-05-03 08:00:00', 7, 2.0, 5.8, '熬夜了，质量一般'),
('2026-05-03', '2026-05-03 22:45:00', '2026-05-04 06:30:00', 9, 3.0, 4.8, '早睡早起精神好'),
('2026-05-04', '2026-05-04 23:50:00', '2026-05-05 07:20:00', 7, 2.2, 5.3, ''),
('2026-05-05', '2026-05-05 23:00:00', '2026-05-06 07:00:00', 8, 2.8, 5.2, '规律作息'),
('2026-05-06', '2026-05-07 01:00:00', '2026-05-07 09:00:00', 6, 1.5, 6.5, '失眠，入睡困难'),
('2026-05-07', '2026-05-07 23:15:00', '2026-05-08 07:10:00', 8, 2.5, 5.4, ''),
('2026-05-08', '2026-05-08 22:30:00', '2026-05-09 06:45:00', 9, 3.2, 4.9, '深度睡眠充足'),
('2026-05-09', '2026-05-09 23:45:00', '2026-05-10 07:30:00', 7, 2.0, 5.8, '周末稍晚'),
('2026-05-10', '2026-05-11 00:30:00', '2026-05-11 08:30:00', 6, 1.8, 6.2, '周末熬夜');
