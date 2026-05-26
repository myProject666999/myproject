CREATE DATABASE IF NOT EXISTS excel_viewer DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE excel_viewer;

CREATE TABLE IF NOT EXISTS excel_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL COMMENT '原始文件名',
    stored_name VARCHAR(255) NOT NULL COMMENT '存储文件名',
    file_path VARCHAR(500) NOT NULL COMMENT '文件路径',
    file_size BIGINT DEFAULT 0 COMMENT '文件大小(字节)',
    sheet_count INT DEFAULT 0 COMMENT 'Sheet数量',
    share_token VARCHAR(100) UNIQUE COMMENT '分享令牌',
    share_expire_at DATETIME COMMENT '分享过期时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_share_token (share_token),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Excel文件表';
