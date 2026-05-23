CREATE DATABASE IF NOT EXISTS speech_teleprompter
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE speech_teleprompter;

CREATE TABLE IF NOT EXISTS scripts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL DEFAULT '未命名稿件',
  content LONGTEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO scripts (title, content) VALUES
('欢迎使用演讲提词器', '这是一篇示例稿件。\n\n你可以在编辑页粘贴或输入你的演讲稿，然后进入播放页享受平滑的自动滚动体验。\n\n调节字号和滚动速度，让每一次演讲都更加从容。');
