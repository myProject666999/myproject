-- ============================================================
-- 多人在线协作文档系统数据库脚本
-- 技术栈: MySQL 8.0+
-- ============================================================

CREATE DATABASE IF NOT EXISTS `multi_person_online` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `multi_person_online`;

-- ============================================================
-- 用户表
-- ============================================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `email` VARCHAR(100) NOT NULL COMMENT '邮箱',
  `password` VARCHAR(255) NOT NULL COMMENT '密码(加密)',
  `avatar_url` VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
  `nickname` VARCHAR(50) DEFAULT NULL COMMENT '昵称',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 1-正常 0-禁用',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间(软删除)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_email` (`email`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ============================================================
-- 文件夹表
-- ============================================================
DROP TABLE IF EXISTS `folders`;
CREATE TABLE `folders` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '文件夹ID',
  `name` VARCHAR(100) NOT NULL COMMENT '文件夹名称',
  `parent_id` BIGINT UNSIGNED DEFAULT 0 COMMENT '父文件夹ID, 0表示根目录',
  `owner_id` BIGINT UNSIGNED NOT NULL COMMENT '所有者用户ID',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间(软删除)',
  PRIMARY KEY (`id`),
  KEY `idx_owner_id` (`owner_id`),
  KEY `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件夹表';

-- ============================================================
-- 文档表
-- ============================================================
DROP TABLE IF EXISTS `documents`;
CREATE TABLE `documents` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '文档ID',
  `title` VARCHAR(200) NOT NULL DEFAULT '未命名文档' COMMENT '文档标题',
  `content` LONGTEXT COMMENT '文档内容(OT操作后的数据)',
  `content_version` INT DEFAULT 0 COMMENT '内容版本号(OT同步用)',
  `folder_id` BIGINT UNSIGNED DEFAULT 0 COMMENT '所属文件夹ID, 0表示根目录',
  `owner_id` BIGINT UNSIGNED NOT NULL COMMENT '所有者用户ID',
  `share_token` VARCHAR(100) DEFAULT NULL COMMENT '分享令牌',
  `share_type` TINYINT DEFAULT 0 COMMENT '分享类型: 0-私有 1-链接可读 2-链接可编辑',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 1-正常 0-删除',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间(软删除)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_share_token` (`share_token`),
  KEY `idx_owner_id` (`owner_id`),
  KEY `idx_folder_id` (`folder_id`),
  KEY `idx_updated_at` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文档表';

-- ============================================================
-- 文档权限表
-- ============================================================
DROP TABLE IF EXISTS `document_permissions`;
CREATE TABLE `document_permissions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '权限ID',
  `document_id` BIGINT UNSIGNED NOT NULL COMMENT '文档ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `permission_type` TINYINT NOT NULL DEFAULT 1 COMMENT '权限类型: 1-只读 2-可编辑',
  `source` TINYINT DEFAULT 1 COMMENT '来源: 1-直接邀请 2-链接',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_doc_user` (`document_id`, `user_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文档权限表';

-- ============================================================
-- 文档版本表
-- ============================================================
DROP TABLE IF EXISTS `document_versions`;
CREATE TABLE `document_versions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '版本ID',
  `document_id` BIGINT UNSIGNED NOT NULL COMMENT '文档ID',
  `version` INT NOT NULL COMMENT '版本号',
  `content` LONGTEXT NOT NULL COMMENT '版本内容快照',
  `change_summary` VARCHAR(500) DEFAULT NULL COMMENT '变更摘要',
  `created_by` BIGINT UNSIGNED NOT NULL COMMENT '创建者用户ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_doc_version` (`document_id`, `version`),
  KEY `idx_document_id` (`document_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文档版本表';

-- ============================================================
-- 回收站表
-- ============================================================
DROP TABLE IF EXISTS `recycle_bin`;
CREATE TABLE `recycle_bin` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '回收站ID',
  `document_id` BIGINT UNSIGNED NOT NULL COMMENT '文档ID',
  `title` VARCHAR(200) NOT NULL COMMENT '文档标题(冗余)',
  `owner_id` BIGINT UNSIGNED NOT NULL COMMENT '所有者用户ID',
  `deleted_by` BIGINT UNSIGNED NOT NULL COMMENT '删除操作人ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '删除时间',
  `expires_at` DATETIME DEFAULT NULL COMMENT '过期时间(30天后自动清除)',
  PRIMARY KEY (`id`),
  KEY `idx_document_id` (`document_id`),
  KEY `idx_owner_id` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='回收站表';

-- ============================================================
-- 操作日志表
-- ============================================================
DROP TABLE IF EXISTS `operation_logs`;
CREATE TABLE `operation_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `document_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '文档ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '操作用户ID',
  `action` VARCHAR(50) NOT NULL COMMENT '操作类型',
  `detail` TEXT COMMENT '操作详情(JSON)',
  `ip_address` VARCHAR(50) DEFAULT NULL COMMENT 'IP地址',
  `user_agent` VARCHAR(500) DEFAULT NULL COMMENT '用户代理',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_document_id` (`document_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';

-- ============================================================
-- 插入测试数据
-- ============================================================

-- 默认管理员用户 (密码: admin123, 使用 bcrypt 加密)
INSERT INTO `users` (`username`, `email`, `password`, `nickname`, `avatar_url`) VALUES
('admin', 'admin@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '系统管理员', 'https://api.dicebear.com/7.x/identicon/svg?seed=admin'),
('demo', 'demo@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '演示用户', 'https://api.dicebear.com/7.x/identicon/svg?seed=demo');

-- 默认文件夹
INSERT INTO `folders` (`name`, `parent_id`, `owner_id`, `sort_order`) VALUES
('我的文档', 0, 1, 0),
('工作文档', 0, 1, 1),
('个人文档', 0, 1, 2);

-- 示例文档
INSERT INTO `documents` (`title`, `content`, `owner_id`, `folder_id`) VALUES
('欢迎使用协作文档', '<p>欢迎使用<strong>多人在线协作文档</strong>系统！</p><h2>主要功能</h2><ul><li>多人实时协同编辑</li><li>富文本编辑</li><li>历史版本回溯</li><li>权限与分享</li></ul>', 1, 1),
('会议纪要模板', '<h1>会议纪要</h1><p>会议时间：<br>会议地点：<br>参会人员：</p><h2>会议内容</h2><ol><li></li><li></li><li></li></ol><h2>待办事项</h2><table><thead><tr><th>事项</th><th>负责人</th><th>截止日期</th></tr></thead><tbody><tr><td></td><td></td><td></td></tr></tbody></table>', 1, 2),
('产品需求文档', '<h1>产品需求文档</h1><h2>1. 项目背景</h2><p></p><h2>2. 功能需求</h2><p></p><h2>3. 非功能需求</h2><p></p>', 1, 2);

-- 版本记录
INSERT INTO `document_versions` (`document_id`, `version`, `content`, `change_summary`, `created_by`) VALUES
(1, 1, '<p>欢迎使用<strong>多人在线协作文档</strong>系统！</p>', '初始版本', 1),
(1, 2, '<p>欢迎使用<strong>多人在线协作文档</strong>系统！</p><h2>主要功能</h2><ul><li>多人实时协同编辑</li><li>富文本编辑</li><li>历史版本回溯</li><li>权限与分享</li></ul>', '添加主要功能列表', 1);

-- ============================================================
-- Redis 数据结构说明
-- ============================================================
-- 在线协作者:
--   Key: document:online:{documentId}
--   Type: Set
--   Value: userId
--
-- 协作者信息:
--   Key: document:collaborator:{documentId}:{userId}
--   Type: Hash
--   Fields: { cursor, selection, nickname, avatar }
--
-- 文档锁(乐观锁):
--   Key: document:lock:{documentId}
--   Type: String
--   Value: userId
--
-- OT操作队列:
--   Key: document:ops:{documentId}
--   Type: List
--   Value: JSON(operation)
