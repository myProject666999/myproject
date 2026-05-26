-- =============================================
-- 在线笔记协作系统 - 数据库脚本
-- Database: online_note_collaboration
-- =============================================

SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `online_note_collaboration` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `online_note_collaboration`;

-- =============================================
-- 用户表
-- =============================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `email` VARCHAR(100) NOT NULL COMMENT '邮箱',
  `password` VARCHAR(255) NOT NULL COMMENT '密码(加密)',
  `avatar` VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
  `status` TINYINT DEFAULT 1 COMMENT '状态:1-正常,0-禁用',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- =============================================
-- 团队空间表
-- =============================================
DROP TABLE IF EXISTS `spaces`;
CREATE TABLE `spaces` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '空间ID',
  `name` VARCHAR(100) NOT NULL COMMENT '空间名称',
  `description` VARCHAR(500) DEFAULT NULL COMMENT '空间描述',
  `owner_id` BIGINT UNSIGNED NOT NULL COMMENT '所有者用户ID',
  `avatar` VARCHAR(500) DEFAULT NULL COMMENT '空间头像',
  `is_default` TINYINT DEFAULT 0 COMMENT '是否为默认空间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_owner_id` (`owner_id`),
  CONSTRAINT `fk_spaces_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='团队空间表';

-- =============================================
-- 空间成员表
-- =============================================
DROP TABLE IF EXISTS `space_members`;
CREATE TABLE `space_members` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '成员ID',
  `space_id` BIGINT UNSIGNED NOT NULL COMMENT '空间ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `role` TINYINT NOT NULL DEFAULT 2 COMMENT '角色:1-所有者,2-编辑者,3-只读',
  `joined_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_space_user` (`space_id`, `user_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_members_space` FOREIGN KEY (`space_id`) REFERENCES `spaces` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_members_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='空间成员表';

-- =============================================
-- 文档表
-- =============================================
DROP TABLE IF EXISTS `documents`;
CREATE TABLE `documents` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '文档ID',
  `space_id` BIGINT UNSIGNED NOT NULL COMMENT '所属空间ID',
  `parent_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '父文档ID(用于目录结构)',
  `title` VARCHAR(200) NOT NULL COMMENT '文档标题',
  `content` LONGTEXT DEFAULT NULL COMMENT '文档内容(富文本)',
  `content_type` VARCHAR(20) DEFAULT 'rich' COMMENT '内容类型:rich-富文本,markdown-Markdown',
  `sort_order` INT DEFAULT 0 COMMENT '排序顺序',
  `created_by` BIGINT UNSIGNED NOT NULL COMMENT '创建者ID',
  `updated_by` BIGINT UNSIGNED DEFAULT NULL COMMENT '最后更新者ID',
  `is_deleted` TINYINT DEFAULT 0 COMMENT '是否删除:0-否,1-是',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_space_id` (`space_id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_created_by` (`created_by`),
  CONSTRAINT `fk_docs_space` FOREIGN KEY (`space_id`) REFERENCES `spaces` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_docs_parent` FOREIGN KEY (`parent_id`) REFERENCES `documents` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_docs_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文档表';

-- =============================================
-- 评论表
-- =============================================
DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '评论ID',
  `document_id` BIGINT UNSIGNED NOT NULL COMMENT '文档ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '评论用户ID',
  `parent_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '父评论ID(用于回复)',
  `content` TEXT NOT NULL COMMENT '评论内容',
  `mentions` JSON DEFAULT NULL COMMENT '@提及的用户ID列表',
  `is_resolved` TINYINT DEFAULT 0 COMMENT '是否已解决:0-否,1-是',
  `resolved_at` DATETIME DEFAULT NULL COMMENT '解决时间',
  `resolved_by` BIGINT UNSIGNED DEFAULT NULL COMMENT '解决者ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_document_id` (`document_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_parent_id` (`parent_id`),
  CONSTRAINT `fk_comments_doc` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_comments_parent` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评论表';

-- =============================================
-- 回收站表
-- =============================================
DROP TABLE IF EXISTS `recycle_bin`;
CREATE TABLE `recycle_bin` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '回收站ID',
  `document_id` BIGINT UNSIGNED NOT NULL COMMENT '文档ID',
  `space_id` BIGINT UNSIGNED NOT NULL COMMENT '空间ID',
  `original_title` VARCHAR(200) NOT NULL COMMENT '原文档标题',
  `original_content` LONGTEXT DEFAULT NULL COMMENT '原文档内容',
  `deleted_by` BIGINT UNSIGNED NOT NULL COMMENT '删除者ID',
  `expire_at` DATETIME DEFAULT NULL COMMENT '过期时间(默认30天)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '删除时间',
  PRIMARY KEY (`id`),
  KEY `idx_document_id` (`document_id`),
  KEY `idx_space_id` (`space_id`),
  KEY `idx_expire_at` (`expire_at`),
  CONSTRAINT `fk_recycle_doc` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_recycle_space` FOREIGN KEY (`space_id`) REFERENCES `spaces` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_recycle_user` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='回收站表';

-- =============================================
-- 文档协作锁表 (Redis缓存同时使用)
-- =============================================
DROP TABLE IF EXISTS `document_locks`;
CREATE TABLE `document_locks` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '锁ID',
  `document_id` BIGINT UNSIGNED NOT NULL COMMENT '文档ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '持有锁的用户ID',
  `lock_type` TINYINT DEFAULT 1 COMMENT '锁类型:1-编辑锁,2-只读锁',
  `acquired_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '获取时间',
  `expire_at` DATETIME DEFAULT NULL COMMENT '过期时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_document` (`document_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_locks_doc` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_locks_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文档协作锁表';

-- =============================================
-- 在线用户状态表 (Redis缓存同时使用)
-- =============================================
DROP TABLE IF EXISTS `online_users`;
CREATE TABLE `online_users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `space_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '当前所在空间ID',
  `document_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '当前编辑文档ID',
  `last_active` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '最后活跃时间',
  `connection_id` VARCHAR(100) DEFAULT NULL COMMENT 'WebSocket连接ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user` (`user_id`),
  KEY `idx_space_id` (`space_id`),
  KEY `idx_document_id` (`document_id`),
  CONSTRAINT `fk_online_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_online_space` FOREIGN KEY (`space_id`) REFERENCES `spaces` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_online_doc` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='在线用户状态表';

-- =============================================
-- 插入初始数据
-- =============================================

-- 默认用户 (密码: 123456, 使用 bcrypt 加密)
INSERT INTO `users` (`id`, `username`, `email`, `password`, `avatar`, `status`) VALUES
(1, 'admin', 'admin@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NULL, 1),
(2, 'user1', 'user1@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NULL, 1),
(3, 'user2', 'user2@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NULL, 1);

-- 默认空间
INSERT INTO `spaces` (`id`, `name`, `description`, `owner_id`, `is_default`) VALUES
(1, '默认空间', '系统默认创建的团队空间', 1, 1);

-- 空间成员
INSERT INTO `space_members` (`id`, `space_id`, `user_id`, `role`) VALUES
(1, 1, 1, 1),
(2, 1, 2, 2),
(3, 1, 3, 3);

-- 示例文档
INSERT INTO `documents` (`id`, `space_id`, `title`, `content`, `content_type`, `created_by`) VALUES
(1, 1, '欢迎使用在线笔记协作', '<p>这是一个<strong>团队协作</strong>笔记系统，支持：</p><ul><li>富文本编辑</li><li>实时协作</li><li>评论和@提醒</li><li>权限管理</li></ul>', 'rich', 1),
(2, 1, '项目规划', '<h2>项目目标</h2><p>搭建一个高性能的在线协作笔记平台</p>', 'rich', 1);

SET FOREIGN_KEY_CHECKS = 1;
