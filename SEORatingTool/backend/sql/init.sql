-- SEO Rating Tool Database
-- MySQL 8.0+

CREATE DATABASE IF NOT EXISTS seo_rating DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE seo_rating;

-- 分析记录表
CREATE TABLE IF NOT EXISTS analysis (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(512) NOT NULL,
    title VARCHAR(255) DEFAULT '',
    score TINYINT UNSIGNED DEFAULT 0,
    meta_score TINYINT UNSIGNED DEFAULT 0,
    keyword_score TINYINT UNSIGNED DEFAULT 0,
    link_score TINYINT UNSIGNED DEFAULT 0,
    mobile_score TINYINT UNSIGNED DEFAULT 0,
    content_score TINYINT UNSIGNED DEFAULT 0,
    suggestions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_url (url),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Meta检查详情表
CREATE TABLE IF NOT EXISTS meta_detail (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    analysis_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) DEFAULT '',
    title_length INT DEFAULT 0,
    description TEXT,
    description_length INT DEFAULT 0,
    keywords VARCHAR(512) DEFAULT '',
    viewport VARCHAR(255) DEFAULT '',
    author VARCHAR(128) DEFAULT '',
    robots VARCHAR(64) DEFAULT '',
    favicon VARCHAR(512) DEFAULT '',
    has_title BOOLEAN DEFAULT FALSE,
    has_description BOOLEAN DEFAULT FALSE,
    has_keywords BOOLEAN DEFAULT FALSE,
    has_viewport BOOLEAN DEFAULT FALSE,
    charset VARCHAR(32) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_analysis_id (analysis_id),
    FOREIGN KEY (analysis_id) REFERENCES analysis(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 关键词详情表
CREATE TABLE IF NOT EXISTS keyword_detail (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    analysis_id BIGINT UNSIGNED NOT NULL,
    keyword VARCHAR(255) NOT NULL,
    count INT DEFAULT 0,
    density DECIMAL(5,2) DEFAULT 0,
    in_title BOOLEAN DEFAULT FALSE,
    in_description BOOLEAN DEFAULT FALSE,
    in_h1 BOOLEAN DEFAULT FALSE,
    in_url BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_analysis_id (analysis_id),
    FOREIGN KEY (analysis_id) REFERENCES analysis(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 链接详情表
CREATE TABLE IF NOT EXISTS link_detail (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    analysis_id BIGINT UNSIGNED NOT NULL,
    url VARCHAR(512) NOT NULL,
    type VARCHAR(16) NOT NULL DEFAULT 'external',
    anchor_text VARCHAR(255) DEFAULT '',
    nofollow BOOLEAN DEFAULT FALSE,
    status_code INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_analysis_id (analysis_id),
    INDEX idx_type (type),
    FOREIGN KEY (analysis_id) REFERENCES analysis(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 移动友好详情表
CREATE TABLE IF NOT EXISTS mobile_detail (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    analysis_id BIGINT UNSIGNED NOT NULL,
    has_viewport BOOLEAN DEFAULT FALSE,
    has_flexible_layout BOOLEAN DEFAULT FALSE,
    has_responsive_images BOOLEAN DEFAULT FALSE,
    has_touch_targets BOOLEAN DEFAULT FALSE,
    flash_detected BOOLEAN DEFAULT FALSE,
    text_readable BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_analysis_id (analysis_id),
    FOREIGN KEY (analysis_id) REFERENCES analysis(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 内容分析详情表
CREATE TABLE IF NOT EXISTS content_detail (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    analysis_id BIGINT UNSIGNED NOT NULL,
    total_words INT DEFAULT 0,
    h1_count INT DEFAULT 0,
    h2_count INT DEFAULT 0,
    h3_count INT DEFAULT 0,
    img_count INT DEFAULT 0,
    img_with_alt INT DEFAULT 0,
    has_favicon BOOLEAN DEFAULT FALSE,
    has_sitemap BOOLEAN DEFAULT FALSE,
    has_robots_txt BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_analysis_id (analysis_id),
    FOREIGN KEY (analysis_id) REFERENCES analysis(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
