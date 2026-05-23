-- LaTeX 公式编辑器数据库初始化脚本
-- 适用数据库：MySQL 5.7+ / MariaDB
-- 连接：127.0.0.1:3306  root / 123456

CREATE DATABASE IF NOT EXISTS latex_editor DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE latex_editor;

-- --------------------------------------------------------
-- 收藏表
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    latex TEXT NOT NULL,
    title VARCHAR(255) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 收藏标签表（预留分组能力）
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS favorite_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    favorite_id INT NOT NULL,
    tag VARCHAR(100) NOT NULL,
    CONSTRAINT fk_favorite_id FOREIGN KEY (favorite_id) REFERENCES favorites(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 历史记录表
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    latex TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 索引
-- --------------------------------------------------------
CREATE INDEX idx_history_created ON history(created_at DESC);
CREATE INDEX idx_favorites_created ON favorites(created_at DESC);

-- --------------------------------------------------------
-- 初始化示例数据
-- --------------------------------------------------------
INSERT INTO favorites (latex, title) VALUES
    ('\\int_{a}^{b} f(x)\\,dx', '定积分'),
    ('\\sum_{i=1}^{n} i', '求和'),
    ('\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', '2x2 矩阵')
ON DUPLICATE KEY UPDATE id = id;
