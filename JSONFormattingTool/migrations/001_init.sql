-- JSON格式化工具数据库初始化脚本
-- 数据库: json_formatting_tool

CREATE DATABASE IF NOT EXISTS json_formatting_tool DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE json_formatting_tool;

-- 历史记录表
CREATE TABLE IF NOT EXISTS history (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_history_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入示例数据
INSERT INTO history (id, title, content) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '示例用户数据', '{"name": "张三", "age": 25, "email": "zhangsan@example.com"}'),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', '示例配置数据', '{"app": {"name": "JSONFormatter", "version": "1.0.0"}, "settings": {"theme": "dark", "language": "zh-CN"}}');
