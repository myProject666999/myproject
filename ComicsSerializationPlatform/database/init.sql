CREATE DATABASE IF NOT EXISTS comics_platform DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE comics_platform;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  avatar VARCHAR(255),
  role ENUM('reader', 'author', 'admin') DEFAULT 'reader',
  bio VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS comics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  author_id INT NOT NULL,
  author_name VARCHAR(50),
  cover VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  status ENUM('ongoing', 'completed', 'hiatus') DEFAULT 'ongoing',
  total_chapters INT DEFAULT 0,
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS chapters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  comic_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  chapter_number INT NOT NULL,
  images JSON NOT NULL,
  status ENUM('draft', 'published') DEFAULT 'published',
  views INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (comic_id) REFERENCES comics(id) ON DELETE CASCADE,
  UNIQUE KEY unique_chapter (comic_id, chapter_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  comic_id INT NOT NULL,
  last_read_chapter INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (comic_id) REFERENCES comics(id) ON DELETE CASCADE,
  UNIQUE KEY unique_subscription (user_id, comic_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  comic_id INT NOT NULL,
  chapter_id INT,
  content TEXT NOT NULL,
  parent_id INT DEFAULT NULL,
  likes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (comic_id) REFERENCES comics(id) ON DELETE CASCADE,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE SET NULL,
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reading_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  comic_id INT NOT NULL,
  chapter_id INT NOT NULL,
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (comic_id) REFERENCES comics(id) ON DELETE CASCADE,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
  UNIQUE KEY unique_reading (user_id, comic_id, chapter_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  comic_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (comic_id) REFERENCES comics(id) ON DELETE CASCADE,
  UNIQUE KEY unique_favorite (user_id, comic_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO users (username, password, email, role) VALUES
('admin', '$2a$10$50cKRWTdNlSG8beyBShuGOJdVYH6FTXFif3RQr2Y4VlxvIsBGhHAu', 'admin@comics.com', 'admin'),
('author1', '$2a$10$50cKRWTdNlSG8beyBShuGOJdVYH6FTXFif3RQr2Y4VlxvIsBGhHAu', 'author1@comics.com', 'author'),
('reader1', '$2a$10$50cKRWTdNlSG8beyBShuGOJdVYH6FTXFif3RQr2Y4VlxvIsBGhHAu', 'reader1@comics.com', 'reader');

INSERT INTO comics (title, author_id, author_name, cover, description, category, status) VALUES
('热血江湖', 2, 'author1', '/uploads/covers/comic1.jpg', '一个关于江湖恩怨的故事', '热血', 'ongoing'),
('校园日常', 2, 'author1', '/uploads/covers/comic2.jpg', '轻松愉快的校园生活', '日常', 'ongoing');

INSERT INTO chapters (comic_id, title, chapter_number, images) VALUES
(1, '初入江湖', 1, '["/uploads/chapters/1/1.jpg", "/uploads/chapters/1/2.jpg", "/uploads/chapters/1/3.jpg"]'),
(1, '神秘人物', 2, '["/uploads/chapters/2/1.jpg", "/uploads/chapters/2/2.jpg"]'),
(2, '开学第一天', 1, '["/uploads/chapters/3/1.jpg", "/uploads/chapters/3/2.jpg", "/uploads/chapters/3/3.jpg"]');

INSERT INTO subscriptions (user_id, comic_id, last_read_chapter) VALUES
(3, 1, 1),
(3, 2, 0);

INSERT INTO comments (user_id, comic_id, chapter_id, content) VALUES
(3, 1, 1, '画风很棒！'),
(3, 1, NULL, '期待后续更新');
