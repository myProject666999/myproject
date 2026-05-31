-- ============================================================
-- Online Emoji Pack - Database Schema
-- 在线表情包/素材库数据库脚本
-- ============================================================

CREATE DATABASE IF NOT EXISTS emoji_pack DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE emoji_pack;

-- ============================================================
-- 用户表
-- ============================================================
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    `username` VARCHAR(50) NOT NULL COMMENT '用户名',
    `password` VARCHAR(100) NOT NULL COMMENT '密码',
    `nickname` VARCHAR(50) NOT NULL COMMENT '昵称',
    `avatar` VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
    `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-正常 0-禁用',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ============================================================
-- 分类表
-- ============================================================
DROP TABLE IF EXISTS `category`;
CREATE TABLE `category` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '分类ID',
    `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
    `icon` VARCHAR(500) DEFAULT NULL COMMENT '分类图标URL',
    `sort` INT NOT NULL DEFAULT 0 COMMENT '排序',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-正常 0-禁用',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分类表';

-- ============================================================
-- 标签表
-- ============================================================
DROP TABLE IF EXISTS `tag`;
CREATE TABLE `tag` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '标签ID',
    `name` VARCHAR(50) NOT NULL COMMENT '标签名称',
    `usage_count` INT NOT NULL DEFAULT 0 COMMENT '使用次数',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-正常 0-禁用',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='标签表';

-- ============================================================
-- 素材表
-- ============================================================
DROP TABLE IF EXISTS `material`;
CREATE TABLE `material` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '素材ID',
    `title` VARCHAR(200) NOT NULL COMMENT '标题',
    `description` TEXT COMMENT '描述',
    `category_id` BIGINT NOT NULL COMMENT '分类ID',
    `uploader_id` BIGINT NOT NULL COMMENT '上传者ID',
    `file_url` VARCHAR(500) NOT NULL COMMENT '文件URL',
    `thumbnail_url` VARCHAR(500) NOT NULL COMMENT '缩略图URL',
    `file_type` VARCHAR(20) NOT NULL COMMENT '文件类型: image/png, image/gif, image/jpeg',
    `file_size` BIGINT NOT NULL DEFAULT 0 COMMENT '文件大小(字节)',
    `width` INT DEFAULT NULL COMMENT '图片宽度',
    `height` INT DEFAULT NULL COMMENT '图片高度',
    `is_copyright` TINYINT NOT NULL DEFAULT 0 COMMENT '是否有版权: 0-无 1-有',
    `download_limit` INT NOT NULL DEFAULT 0 COMMENT '下载限制次数, 0表示不限',
    `download_count` INT NOT NULL DEFAULT 0 COMMENT '下载次数',
    `favorite_count` INT NOT NULL DEFAULT 0 COMMENT '收藏次数',
    `view_count` INT NOT NULL DEFAULT 0 COMMENT '浏览次数',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-正常 0-禁用 2-待审核',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_category_id` (`category_id`),
    KEY `idx_uploader_id` (`uploader_id`),
    KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='素材表';

-- ============================================================
-- 素材-标签关联表
-- ============================================================
DROP TABLE IF EXISTS `material_tag`;
CREATE TABLE `material_tag` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `material_id` BIGINT NOT NULL COMMENT '素材ID',
    `tag_id` BIGINT NOT NULL COMMENT '标签ID',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_material_tag` (`material_id`, `tag_id`),
    KEY `idx_tag_id` (`tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='素材-标签关联表';

-- ============================================================
-- 合集/专辑表
-- ============================================================
DROP TABLE IF EXISTS `collection`;
CREATE TABLE `collection` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '合集ID',
    `title` VARCHAR(200) NOT NULL COMMENT '合集标题',
    `cover_url` VARCHAR(500) DEFAULT NULL COMMENT '封面URL',
    `description` TEXT COMMENT '描述',
    `user_id` BIGINT NOT NULL COMMENT '创建者ID',
    `material_count` INT NOT NULL DEFAULT 0 COMMENT '素材数量',
    `favorite_count` INT NOT NULL DEFAULT 0 COMMENT '收藏次数',
    `view_count` INT NOT NULL DEFAULT 0 COMMENT '浏览次数',
    `is_public` TINYINT NOT NULL DEFAULT 1 COMMENT '是否公开: 1-公开 0-私有',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-正常 0-禁用',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='合集/专辑表';

-- ============================================================
-- 合集-素材关联表
-- ============================================================
DROP TABLE IF EXISTS `collection_material`;
CREATE TABLE `collection_material` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `collection_id` BIGINT NOT NULL COMMENT '合集ID',
    `material_id` BIGINT NOT NULL COMMENT '素材ID',
    `sort` INT NOT NULL DEFAULT 0 COMMENT '排序',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '添加时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_collection_material` (`collection_id`, `material_id`),
    KEY `idx_material_id` (`material_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='合集-素材关联表';

-- ============================================================
-- 收藏表
-- ============================================================
DROP TABLE IF EXISTS `favorite`;
CREATE TABLE `favorite` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '收藏ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `material_id` BIGINT DEFAULT NULL COMMENT '素材ID',
    `collection_id` BIGINT DEFAULT NULL COMMENT '合集ID',
    `type` TINYINT NOT NULL COMMENT '类型: 1-素材 2-合集',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_target` (`user_id`, `material_id`, `collection_id`),
    KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收藏表';

-- ============================================================
-- 下载记录表
-- ============================================================
DROP TABLE IF EXISTS `download_log`;
CREATE TABLE `download_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '记录ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `material_id` BIGINT NOT NULL COMMENT '素材ID',
    `download_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '下载时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_material_id` (`material_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='下载记录表';

-- ============================================================
-- 初始化数据
-- ============================================================

-- 插入默认管理员用户 (密码: 123456 BCrypt加密)
INSERT INTO `user` (`username`, `password`, `nickname`, `avatar`, `email`) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '管理员', NULL, 'admin@emojipack.com'),
('demo', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '演示用户', NULL, 'demo@emojipack.com');

-- 插入默认分类
INSERT INTO `category` (`name`, `icon`, `sort`) VALUES
('表情包', NULL, 1),
('头像', NULL, 2),
('背景', NULL, 3),
('插画', NULL, 4),
('动图', NULL, 5),
('其他', NULL, 99);

-- 插入示例标签
INSERT INTO `tag` (`name`, `usage_count`) VALUES
('可爱', 10),
('搞笑', 8),
('动漫', 15),
('风景', 5),
('动物', 12),
('文字', 7),
('动态', 9),
('萌系', 11),
('炫酷', 6),
('唯美', 4);
