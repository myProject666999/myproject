-- =============================================
-- Song List Sharing Platform Database Schema
-- =============================================
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Drop tables if exist
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `songs`;
DROP TABLE IF EXISTS `playlists`;
DROP TABLE IF EXISTS `follows`;
DROP TABLE IF EXISTS `users`;

-- =============================================
-- User Table
-- =============================================
CREATE TABLE `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(64) NOT NULL,
  `password` VARCHAR(128) NOT NULL,
  `nickname` VARCHAR(64) DEFAULT NULL,
  `avatar` VARCHAR(255) DEFAULT NULL,
  `bio` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- =============================================
-- Follow Table (many-to-many: user follows user)
-- =============================================
CREATE TABLE `follows` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `follower_id` INT UNSIGNED NOT NULL,
  `following_id` INT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_follow` (`follower_id`, `following_id`),
  KEY `idx_following` (`following_id`),
  CONSTRAINT `fk_follower` FOREIGN KEY (`follower_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_following` FOREIGN KEY (`following_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='关注关系表';

-- =============================================
-- Playlist Table
-- =============================================
CREATE TABLE `playlists` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(128) NOT NULL,
  `description` VARCHAR(512) DEFAULT NULL,
  `cover` VARCHAR(255) DEFAULT NULL,
  `is_public` TINYINT(1) NOT NULL DEFAULT 1,
  `like_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `view_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `fk_playlist_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='歌单表';

-- =============================================
-- Song Table
-- =============================================
CREATE TABLE `songs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `playlist_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(128) NOT NULL,
  `artist` VARCHAR(128) DEFAULT NULL,
  `audio_url` VARCHAR(255) DEFAULT NULL,
  `audio_path` VARCHAR(255) DEFAULT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_playlist` (`playlist_id`),
  CONSTRAINT `fk_song_playlist` FOREIGN KEY (`playlist_id`) REFERENCES `playlists` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='歌曲表';

-- =============================================
-- Review Table (点评)
-- =============================================
CREATE TABLE `reviews` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `song_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `content` TEXT NOT NULL,
  `rating` TINYINT UNSIGNED DEFAULT NULL COMMENT '1-5 星',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_song` (`song_id`),
  KEY `idx_user` (`user_id`),
  CONSTRAINT `fk_review_song` FOREIGN KEY (`song_id`) REFERENCES `songs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_review_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='歌曲点评表';

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- Sample Data
-- =============================================
INSERT INTO `users` (`username`, `password`, `nickname`, `avatar`, `bio`) VALUES
('alice', '$2a$10$R/JxeBkrJiXtxcFuL7nWmeOcZj4H7VRiIFi/jTmy7E6hE3nqaIlye', 'Alice', '', '热爱音乐的小听众'),
('bob',   '$2a$10$R/JxeBkrJiXtxcFuL7nWmeOcZj4H7VRiIFi/jTmy7E6hE3nqaIlye', 'Bob',   '', '民谣爱好者');

INSERT INTO `playlists` (`user_id`, `title`, `description`, `cover`, `like_count`, `view_count`) VALUES
(1, '深夜民谣', '一个人听的安静民谣', '', 12, 88),
(2, '夏日摇滚', '阳光、汗水与吉他', '', 7, 45);

INSERT INTO `songs` (`playlist_id`, `title`, `artist`, `audio_url`, `sort_order`) VALUES
(1, '安河桥', '宋冬野', 'https://music.163.com/song/media/outer/url?id=29567190.mp3', 1),
(1, '理想三旬', '陈鸿宇', 'https://music.163.com/song/media/outer/url?id=428495750.mp3', 2),
(2, 'Yellow', 'Coldplay', 'https://music.163.com/song/media/outer/url?id=22090368.mp3', 1);

INSERT INTO `reviews` (`song_id`, `user_id`, `content`, `rating`) VALUES
(1, 1, '深夜独自聆听，情绪万千', 5),
(1, 2, '经典之作，百听不厌', 5),
(3, 2, 'Coldplay 的成名曲，青春记忆', 4);
