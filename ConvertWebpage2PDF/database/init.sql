CREATE DATABASE IF NOT EXISTS web2pdf DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE web2pdf;

DROP TABLE IF EXISTS conversion_jobs;
CREATE TABLE conversion_jobs (
    id VARCHAR(36) PRIMARY KEY COMMENT '任务ID',
    url TEXT NOT NULL COMMENT '网页URL',
    title VARCHAR(255) DEFAULT '' COMMENT '网页标题',
    style VARCHAR(50) DEFAULT 'default' COMMENT '样式选择',
    enable_toc TINYINT(1) DEFAULT 1 COMMENT '是否生成目录',
    pagination VARCHAR(50) DEFAULT 'A4' COMMENT '分页格式',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '任务状态',
    file_path VARCHAR(500) DEFAULT '' COMMENT 'PDF文件路径',
    page_count INT DEFAULT 0 COMMENT '页数',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    completed_at DATETIME NULL COMMENT '完成时间',
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='转换任务表';

DROP TABLE IF EXISTS batch_jobs;
CREATE TABLE batch_jobs (
    id VARCHAR(36) PRIMARY KEY COMMENT '批量任务ID',
    name VARCHAR(255) DEFAULT '' COMMENT '批量任务名称',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '任务状态',
    total_count INT DEFAULT 0 COMMENT '总任务数',
    success_count INT DEFAULT 0 COMMENT '成功数',
    failed_count INT DEFAULT 0 COMMENT '失败数',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    completed_at DATETIME NULL COMMENT '完成时间',
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='批量任务表';
