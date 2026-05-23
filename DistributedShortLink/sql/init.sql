-- =============================================================
-- Distributed Short Link Service Database Schema
-- =============================================================

CREATE DATABASE IF NOT EXISTS `shortlink`
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE `shortlink`;

-- -------------------------------------------------------------
-- users
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `username`      VARCHAR(64)  NOT NULL,
    `password`      VARCHAR(255) NOT NULL,
    `email`         VARCHAR(128)          DEFAULT NULL,
    `status`        TINYINT      NOT NULL DEFAULT 1,
    `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- short links
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `short_link`;
CREATE TABLE `short_link` (
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code`          VARCHAR(16)  NOT NULL,
    `url`           VARCHAR(2048) NOT NULL,
    `url_hash`      CHAR(32)     NOT NULL,
    `user_id`       BIGINT UNSIGNED          DEFAULT NULL,
    `expire_at`     DATETIME              DEFAULT NULL,
    `status`        TINYINT      NOT NULL DEFAULT 1,
    `is_custom`     TINYINT      NOT NULL DEFAULT 0,
    `click_count`   BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_code` (`code`),
    KEY `idx_url_hash` (`url_hash`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_expire_at` (`expire_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- access logs
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `access_log`;
CREATE TABLE `access_log` (
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code`          VARCHAR(16)  NOT NULL,
    `short_link_id` BIGINT UNSIGNED          DEFAULT NULL,
    `ip`            VARCHAR(64)           DEFAULT NULL,
    `user_agent`    VARCHAR(512)          DEFAULT NULL,
    `referer`       VARCHAR(512)          DEFAULT NULL,
    `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_code_created` (`code`, `created_at`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- sequence for number allocator
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `sequence`;
CREATE TABLE `sequence` (
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `stub`          CHAR(1)      NOT NULL DEFAULT '',
    `value`         BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_stub` (`stub`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `sequence` (`stub`, `value`) VALUES ('x', 0)
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);
