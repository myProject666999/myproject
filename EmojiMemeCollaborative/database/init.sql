CREATE DATABASE IF NOT EXISTS emoji_meme DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE emoji_meme;

DROP TABLE IF EXISTS `review_logs`;
DROP TABLE IF EXISTS `likes`;
DROP TABLE IF EXISTS `memes`;
DROP TABLE IF EXISTS `stickers`;
DROP TABLE IF EXISTS `templates`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(30) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `nickname` VARCHAR(50) DEFAULT NULL,
  `avatar` VARCHAR(255) DEFAULT NULL,
  `role` ENUM('admin', 'user', 'reviewer') NOT NULL DEFAULT 'user',
  `status` ENUM('active', 'banned') NOT NULL DEFAULT 'active',
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_username` (`username`),
  UNIQUE KEY `uk_users_email` (`email`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `templates` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `category` VARCHAR(50) DEFAULT NULL,
  `tags` JSON DEFAULT NULL,
  `width` INT NOT NULL DEFAULT 0,
  `height` INT NOT NULL DEFAULT 0,
  `is_official` TINYINT(1) NOT NULL DEFAULT 0,
  `copyright_info` VARCHAR(500) DEFAULT NULL,
  `created_by` INT DEFAULT NULL,
  `status` ENUM('approved', 'pending', 'rejected') NOT NULL DEFAULT 'pending',
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_templates_category` (`category`),
  KEY `idx_templates_status` (`status`),
  KEY `idx_templates_created_by` (`created_by`),
  KEY `idx_templates_is_official` (`is_official`),
  CONSTRAINT `fk_templates_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `stickers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `category` VARCHAR(50) DEFAULT NULL,
  `created_by` INT DEFAULT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_stickers_category` (`category`),
  KEY `idx_stickers_created_by` (`created_by`),
  CONSTRAINT `fk_stickers_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `memes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL,
  `image_url` VARCHAR(500) DEFAULT NULL,
  `template_id` INT DEFAULT NULL,
  `canvas_data` JSON DEFAULT NULL,
  `created_by` INT NOT NULL,
  `status` ENUM('approved', 'pending', 'rejected') NOT NULL DEFAULT 'pending',
  `view_count` INT NOT NULL DEFAULT 0,
  `like_count` INT NOT NULL DEFAULT 0,
  `favorite_count` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_memes_template_id` (`template_id`),
  KEY `idx_memes_created_by` (`created_by`),
  KEY `idx_memes_status` (`status`),
  KEY `idx_memes_like_count` (`like_count`),
  KEY `idx_memes_created_at` (`created_at`),
  CONSTRAINT `fk_memes_template_id` FOREIGN KEY (`template_id`) REFERENCES `templates` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_memes_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `likes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `meme_id` INT NOT NULL,
  `type` ENUM('like', 'favorite') NOT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_likes_user_meme_type` (`user_id`, `meme_id`, `type`),
  KEY `idx_likes_meme_id` (`meme_id`),
  KEY `idx_likes_user_id` (`user_id`),
  KEY `idx_likes_type` (`type`),
  CONSTRAINT `fk_likes_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_likes_meme_id` FOREIGN KEY (`meme_id`) REFERENCES `memes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `review_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `target_type` ENUM('meme', 'template') NOT NULL,
  `target_id` INT NOT NULL,
  `reviewer_id` INT NOT NULL,
  `action` ENUM('approve', 'reject') NOT NULL,
  `reason` VARCHAR(500) DEFAULT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_review_logs_target` (`target_type`, `target_id`),
  KEY `idx_review_logs_reviewer_id` (`reviewer_id`),
  CONSTRAINT `fk_review_logs_reviewer_id` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`username`, `password_hash`, `email`, `nickname`, `role`, `status`) VALUES
('admin', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz7aKdBdCkqy5uLbTLyGq', 'admin@emojimeme.com', '系统管理员', 'admin', 'active'),
('reviewer1', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz7aKdBdCkqy5uLbTLyGq', 'reviewer@emojimeme.com', '审核员小王', 'reviewer', 'active'),
('user1', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz7aKdBdCkqy5uLbTLyGq', 'user1@example.com', '梗图达人', 'user', 'active'),
('user2', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz7aKdBdCkqy5uLbTLyGq', 'user2@example.com', '表情包大师', 'user', 'active'),
('user3', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz7aKdBdCkqy5uLbTLyGq', 'user3@example.com', '搞笑制造机', 'user', 'active');

INSERT INTO `templates` (`name`, `description`, `image_url`, `category`, `tags`, `width`, `height`, `is_official`, `copyright_info`, `created_by`, `status`) VALUES
('经典表情-笑哭', '最经典的笑哭表情模板', '/uploads/templates/laugh_cry.png', '表情', '["笑哭", "经典", "搞笑"]', 500, 500, 1, '官方素材，免费使用', 1, 'approved'),
('熊猫头', '万能熊猫头模板，加字利器', '/uploads/templates/panda.png', '动物', '["熊猫", "加字", "万能"]', 600, 600, 1, '官方素材，免费使用', 1, 'approved'),
('doge神烦狗', 'doge神烦狗经典模板', '/uploads/templates/doge.png', '动物', '["doge", "神烦狗", "柴犬"]', 500, 500, 1, 'CC BY 2.0 - 原图来自网络', 1, 'approved'),
('打工人', '打工人系列模板', '/uploads/templates/worker.png', '生活', '["打工人", "职场", "社畜"]', 800, 600, 1, '官方素材，免费使用', 1, 'approved'),
('对话气泡', '空白对话气泡模板', '/uploads/templates/bubble.png', '通用', '["对话", "气泡", "通用"]', 600, 400, 1, '官方素材，免费使用', 1, 'approved'),
(' This is Fine ', '一切都好火焰狗模板', '/uploads/templates/this_is_fine.png', '经典', '["this is fine", "火焰", "绝望"]', 800, 500, 0, '原作者：KC Green - CC BY-NC-SA 3.0', 3, 'approved');

INSERT INTO `stickers` (`name`, `image_url`, `category`, `created_by`) VALUES
('大拇指', '/uploads/stickers/thumbs_up.png', '手势', 1),
('爱心', '/uploads/stickers/heart.png', '符号', 1),
('火焰', '/uploads/stickers/fire.png', '特效', 1),
('皇冠', '/uploads/stickers/crown.png', '装饰', 1),
('眼镜', '/uploads/stickers/glasses.png', '装饰', 1),
('墨镜', '/uploads/stickers/sunglasses.png', '装饰', 1),
('泪滴', '/uploads/stickers/tear.png', '表情', 1),
('星星', '/uploads/stickers/star.png', '符号', 1),
('彩虹', '/uploads/stickers/rainbow.png', '特效', 1),
('闪电', '/uploads/stickers/lightning.png', '特效', 1);

INSERT INTO `memes` (`title`, `image_url`, `template_id`, `canvas_data`, `created_by`, `status`, `view_count`, `like_count`, `favorite_count`) VALUES
('打工人的周一', '/uploads/memes/meme_1.png', 4, '{"textLayers":[{"id":"t1","text":"周一早上","x":100,"y":50,"fontSize":36,"fontFamily":"Microsoft YaHei","color":"#ffffff","rotation":0},{"id":"t2","text":"打工人的我","x":100,"y":400,"fontSize":28,"fontFamily":"Microsoft YaHei","color":"#ff0000","rotation":0}],"stickerLayers":[{"id":"s1","stickerId":1,"x":400,"y":300,"width":60,"height":60,"rotation":0}],"backgroundColor":"#ffffff","width":800,"height":600}', 3, 'approved', 1250, 89, 34),
('笑死我了', '/uploads/memes/meme_2.png', 1, '{"textLayers":[{"id":"t1","text":"看到工资条","x":50,"y":200,"fontSize":40,"fontFamily":"Microsoft YaHei","color":"#000000","rotation":0}],"stickerLayers":[],"backgroundColor":"#ffffff","width":500,"height":500}', 4, 'approved', 980, 67, 22),
('doge说啥都对', '/uploads/memes/meme_3.png', 3, '{"textLayers":[{"id":"t1","text":"你说得对","x":200,"y":50,"fontSize":32,"fontFamily":"Microsoft YaHei","color":"#8B4513","rotation":0},{"id":"t2","text":"但是我不听","x":200,"y":350,"fontSize":32,"fontFamily":"Microsoft YaHei","color":"#8B4513","rotation":0}],"stickerLayers":[{"id":"s1","stickerId":5,"x":200,"y":180,"width":80,"height":40,"rotation":10}],"backgroundColor":"#FFF8DC","width":500,"height":500}', 5, 'approved', 2100, 156, 78),
('一切都很好', '/uploads/memes/meme_4.png', 6, '{"textLayers":[{"id":"t1","text":"This is fine","x":300,"y":400,"fontSize":30,"fontFamily":"Arial","color":"#FF4500","rotation":0}],"stickerLayers":[{"id":"s1","stickerId":3,"x":100,"y":50,"width":120,"height":120,"rotation":0}],"backgroundColor":"#FFFACD","width":800,"height":500}', 3, 'approved', 3400, 234, 112),
('熊猫头无语', '/uploads/memes/meme_5.png', 2, '{"textLayers":[{"id":"t1","text":"当你发现","x":50,"y":50,"fontSize":28,"fontFamily":"Microsoft YaHei","color":"#333333","rotation":0},{"id":"t2","text":"周五还要加班","x":50,"y":450,"fontSize":36,"fontFamily":"Microsoft YaHei","color":"#CC0000","rotation":0}],"stickerLayers":[{"id":"s1","stickerId":7,"x":300,"y":250,"width":50,"height":50,"rotation":0}],"backgroundColor":"#ffffff","width":600,"height":600}', 4, 'approved', 890, 45, 18);

INSERT INTO `likes` (`user_id`, `meme_id`, `type`) VALUES
(3, 1, 'like'), (4, 1, 'like'), (5, 1, 'like'),
(3, 2, 'like'), (4, 2, 'like'),
(3, 3, 'like'), (4, 3, 'like'), (5, 3, 'like'),
(3, 4, 'like'), (4, 4, 'like'), (5, 4, 'like'),
(3, 5, 'like'), (4, 5, 'like'),
(3, 1, 'favorite'), (5, 3, 'favorite'),
(4, 4, 'favorite'), (5, 4, 'favorite'),
(3, 4, 'favorite');
