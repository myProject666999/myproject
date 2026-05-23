CREATE DATABASE IF NOT EXISTS birthday_blessing DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE birthday_blessing;

CREATE TABLE IF NOT EXISTS blessings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  avatar_color VARCHAR(20) DEFAULT '#f472b6',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  caption VARCHAR(255),
  uploaded_by VARCHAR(100),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sort_order (sort_order),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS music (
  id INT AUTO_INCREMENT PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  music_name VARCHAR(255) NOT NULL,
  artist VARCHAR(255),
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO settings (setting_key, setting_value) VALUES
  ('birthday_date', '2026-06-15T00:00:00'),
  ('hero_title', '生日快乐'),
  ('hero_subtitle', '愿你的每一天都充满阳光与欢笑'),
  ('music_enabled', 'true')
ON DUPLICATE KEY UPDATE setting_key = setting_key;

INSERT INTO blessings (name, message, avatar_color) VALUES
  ('小明', '生日快乐！愿你岁岁平安，年年有今日！', '#f472b6'),
  ('小红', '亲爱的朋友，生日快乐！感谢一路有你！', '#60a5fa'),
  ('小李', 'Happy Birthday! 愿所有美好都如约而至！', '#34d399')
ON DUPLICATE KEY UPDATE name = name;
