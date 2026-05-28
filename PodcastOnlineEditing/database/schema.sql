-- 创建数据库
CREATE DATABASE IF NOT EXISTS podcast_editor DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE podcast_editor;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 播客节目表
CREATE TABLE IF NOT EXISTS podcasts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image VARCHAR(255),
    author VARCHAR(100),
    category VARCHAR(100),
    language VARCHAR(20) DEFAULT 'zh-CN',
    explicit TINYINT(1) DEFAULT 0,
    rss_feed_url VARCHAR(255),
    website VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 单集音频表
CREATE TABLE IF NOT EXISTS episodes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    podcast_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    original_file VARCHAR(255) NOT NULL,
    waveform_file VARCHAR(255),
    duration INT DEFAULT 0,
    file_size BIGINT DEFAULT 0,
    sample_rate INT DEFAULT 44100,
    channels INT DEFAULT 2,
    bitrate INT DEFAULT 128,
    status ENUM('uploading', 'processing', 'ready', 'exporting', 'published') DEFAULT 'uploading',
    is_public TINYINT(1) DEFAULT 0,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (podcast_id) REFERENCES podcasts(id) ON DELETE CASCADE,
    INDEX idx_podcast_status (podcast_id, status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 章节标记表
CREATE TABLE IF NOT EXISTS chapters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    episode_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    start_time INT NOT NULL,
    end_time INT,
    description TEXT,
    link_url VARCHAR(255),
    image_url VARCHAR(255),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE,
    INDEX idx_episode_time (episode_id, start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 剪辑操作记录表（非破坏式编辑）
CREATE TABLE IF NOT EXISTS edits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    episode_id INT NOT NULL,
    edit_type ENUM('trim', 'cut', 'split', 'join', 'volume') NOT NULL,
    start_time INT NOT NULL,
    end_time INT,
    parameters JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE,
    INDEX idx_episode_edit (episode_id, edit_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Show Notes 表
CREATE TABLE IF NOT EXISTS show_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    episode_id INT NOT NULL UNIQUE,
    content TEXT,
    transcription TEXT,
    keywords VARCHAR(500),
    summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 导出任务表（异步处理）
CREATE TABLE IF NOT EXISTS export_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    episode_id INT NOT NULL,
    task_type ENUM('audio', 'rss', 'chapter') DEFAULT 'audio',
    format VARCHAR(20) DEFAULT 'mp3',
    quality VARCHAR(20) DEFAULT 'standard',
    output_file VARCHAR(255),
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    progress INT DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- RSS 源配置表
CREATE TABLE IF NOT EXISTS rss_feeds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    podcast_id INT NOT NULL UNIQUE,
    feed_url VARCHAR(255),
    itunes_category VARCHAR(100),
    itunes_subcategory VARCHAR(100),
    itunes_owner_name VARCHAR(100),
    itunes_owner_email VARCHAR(100),
    itunes_image VARCHAR(255),
    copyright VARCHAR(255),
    ttl INT DEFAULT 60,
    last_build_date TIMESTAMP NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (podcast_id) REFERENCES podcasts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 音频片段表（用于拼接）
CREATE TABLE IF NOT EXISTS audio_segments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    episode_id INT NOT NULL,
    source_episode_id INT,
    segment_name VARCHAR(255),
    start_time INT NOT NULL,
    end_time INT NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE,
    FOREIGN KEY (source_episode_id) REFERENCES episodes(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入测试数据
INSERT INTO users (username, email, password_hash) VALUES 
('demo', 'demo@example.com', '$2b$10$demo_hash');

INSERT INTO podcasts (user_id, title, description, author, category) VALUES 
(1, '我的播客', '这是一个测试播客节目', '主播姓名', '科技');

-- 查看创建的表
SHOW TABLES;
