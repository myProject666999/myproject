CREATE DATABASE IF NOT EXISTS watermark_tool DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE watermark_tool;

-- 模板表
CREATE TABLE IF NOT EXISTS templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT '模板名称',
    type ENUM('text', 'logo') NOT NULL COMMENT '水印类型',
    text_content VARCHAR(500) DEFAULT NULL COMMENT '文字水印内容',
    logo_path VARCHAR(500) DEFAULT NULL COMMENT 'Logo水印路径',
    position ENUM('top-left', 'top-center', 'top-right', 'middle-left', 'middle-center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right') DEFAULT 'bottom-right' COMMENT '水印位置',
    opacity DECIMAL(3,2) DEFAULT 1.00 COMMENT '透明度',
    font_size INT DEFAULT 24 COMMENT '字体大小',
    font_color VARCHAR(50) DEFAULT 'rgba(255, 255, 255, 0.8)' COMMENT '字体颜色',
    margin INT DEFAULT 20 COMMENT '边距(像素)',
    is_default TINYINT DEFAULT 0 COMMENT '是否默认模板',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='水印模板表';

-- 水印任务表
CREATE TABLE IF NOT EXISTS watermark_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_name VARCHAR(255) NOT NULL COMMENT '任务名称',
    template_id INT DEFAULT NULL COMMENT '使用的模板ID',
    config JSON DEFAULT NULL COMMENT '水印配置快照',
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending' COMMENT '任务状态',
    total_count INT DEFAULT 0 COMMENT '总图片数量',
    success_count INT DEFAULT 0 COMMENT '成功处理数量',
    failed_count INT DEFAULT 0 COMMENT '失败数量',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='水印任务表';

-- 图片记录表
CREATE TABLE IF NOT EXISTS images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT DEFAULT NULL COMMENT '所属任务ID',
    original_filename VARCHAR(500) NOT NULL COMMENT '原始文件名',
    original_path VARCHAR(500) NOT NULL COMMENT '原始文件路径',
    watermarked_path VARCHAR(500) DEFAULT NULL COMMENT '水印后文件路径',
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending' COMMENT '处理状态',
    error_message VARCHAR(1000) DEFAULT NULL COMMENT '错误信息',
    width INT DEFAULT NULL COMMENT '图片宽度',
    height INT DEFAULT NULL COMMENT '图片高度',
    file_size BIGINT DEFAULT NULL COMMENT '文件大小(字节)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES watermark_tasks(id) ON DELETE CASCADE,
    INDEX idx_task_id (task_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='图片记录表';

-- 插入默认模板数据
INSERT INTO templates (name, type, text_content, position, opacity, font_size, font_color, margin, is_default) VALUES
('默认文字水印', 'text', 'www.example.com', 'bottom-right', 1.00, 24, 'rgba(255, 255, 255, 0.8)', 20, 1),
('左上角水印', 'text', '版权所有', 'top-left', 0.80, 18, 'rgba(0, 0, 0, 0.6)', 15, 0),
('居中水印', 'text', 'Sample', 'middle-center', 0.50, 48, 'rgba(255, 255, 255, 0.5)', 0, 0),
('右下角Logo', 'logo', NULL, 'bottom-right', 1.00, NULL, NULL, 20, 0);
