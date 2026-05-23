-- 九宫格拼图工具数据库脚本

CREATE DATABASE IF NOT EXISTS puzzle_grid_tool
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE puzzle_grid_tool;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 拼图作品表
CREATE TABLE IF NOT EXISTS puzzles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT,
  title VARCHAR(200),
  layout_type VARCHAR(50) NOT NULL DEFAULT 'grid_3x3',
  grid_count INT NOT NULL DEFAULT 9,
  gap INT NOT NULL DEFAULT 10,
  border_width INT NOT NULL DEFAULT 0,
  border_color VARCHAR(20) NOT NULL DEFAULT '#FFFFFF',
  background_color VARCHAR(20) NOT NULL DEFAULT '#FFFFFF',
  text_content TEXT,
  text_color VARCHAR(20) NOT NULL DEFAULT '#000000',
  text_font_size INT NOT NULL DEFAULT 24,
  canvas_width INT NOT NULL DEFAULT 1080,
  canvas_height INT NOT NULL DEFAULT 1080,
  image_data JSON,
  thumbnail VARCHAR(500),
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 图片资源表
CREATE TABLE IF NOT EXISTS images (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  puzzle_id BIGINT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  position INT NOT NULL,
  width INT,
  height INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (puzzle_id) REFERENCES puzzles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建索引
CREATE INDEX idx_puzzles_user_id ON puzzles(user_id);
CREATE INDEX idx_puzzles_created_at ON puzzles(created_at);
CREATE INDEX idx_images_puzzle_id ON images(puzzle_id);

-- 插入默认用户（可选）
INSERT INTO users (username, email) VALUES ('demo', 'demo@example.com')
ON DUPLICATE KEY UPDATE username = username;
