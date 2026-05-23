CREATE DATABASE IF NOT EXISTS `draft_vote` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `draft_vote`;

DROP TABLE IF EXISTS `votes`;
DROP TABLE IF EXISTS `free_tickets`;
DROP TABLE IF EXISTS `contestants`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `phone` VARCHAR(32) NOT NULL,
  `nickname` VARCHAR(64) NOT NULL,
  `avatar` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `contestants` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(64) NOT NULL,
  `avatar` VARCHAR(255) DEFAULT NULL,
  `description` VARCHAR(1024) DEFAULT NULL,
  `color` VARCHAR(16) DEFAULT '#7c3aed',
  `total_votes` BIGINT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `votes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `contestant_id` BIGINT UNSIGNED NOT NULL,
  `count` INT NOT NULL,
  `ip` VARCHAR(64) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_time` (`user_id`, `created_at`),
  KEY `idx_contestant_time` (`contestant_id`, `created_at`),
  KEY `idx_ip_time` (`ip`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `free_tickets` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `date` DATE NOT NULL,
  `amount` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_date` (`user_id`, `date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `contestants` (`name`, `avatar`, `description`, `color`, `total_votes`) VALUES
('林星岚', 'https://i.pravatar.cc/240?img=1', '来自上海的 vocal 担当，音域宽广，擅长抒情与舞台演绎。', '#7c3aed', 1240),
('苏野',    'https://i.pravatar.cc/240?img=12', '舞蹈担当，舞台感染力强，节奏把控力惊人。', '#ec4899', 1180),
('江予安',  'https://i.pravatar.cc/240?img=32', '说唱担当，原创能力出众，flow 多变。', '#22d3ee', 980),
('陆离',    'https://i.pravatar.cc/240?img=45', '全能型选手，唱跳俱佳，台风稳健。', '#fbbf24', 1520),
('沈清禾',  'https://i.pravatar.cc/240?img=47', '门面担当，音色清透，气质温婉。', '#f472b6', 1030),
('陈默',    'https://i.pravatar.cc/240?img=15', '低音炮 vocal，中低音区质感独特。', '#60a5fa', 860),
('温以凡',  'https://i.pravatar.cc/240?img=22', '国风担当，擅长古典舞与民族唱法。', '#34d399', 1090),
('顾言',    'https://i.pravatar.cc/240?img=68', '创作担当，词曲皆精，钢琴实力出众。', '#a78bfa', 1300);
