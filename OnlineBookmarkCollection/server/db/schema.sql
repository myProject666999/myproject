CREATE DATABASE IF NOT EXISTS `bookmark_collection` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `bookmark_collection`;

CREATE TABLE IF NOT EXISTS `folders` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `parent_id` INT UNSIGNED NULL,
  `sort` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_folders_parent` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `tags` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(64) NOT NULL UNIQUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tags_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `bookmarks` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `url` VARCHAR(2048) NOT NULL,
  `icon` VARCHAR(512) NULL,
  `description` VARCHAR(512) NULL,
  `folder_id` INT UNSIGNED NULL,
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '1=正常,2=可疑,3=失效',
  `last_check_at` DATETIME NULL,
  `last_status_code` INT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_bookmarks_folder` (`folder_id`),
  KEY `idx_bookmarks_status` (`status`),
  KEY `idx_bookmarks_title` (`title`),
  KEY `idx_bookmarks_url` (`url`(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `bookmark_tags` (
  `bookmark_id` INT UNSIGNED NOT NULL,
  `tag_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`bookmark_id`, `tag_id`),
  KEY `idx_bt_tag` (`tag_id`),
  CONSTRAINT `fk_bt_bookmark` FOREIGN KEY (`bookmark_id`) REFERENCES `bookmarks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bt_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `folders` (`id`, `name`, `parent_id`, `sort`) VALUES (1, '未分类', NULL, 0);
