-- ============================================================
-- OnlinePPTSharing 数据库脚本
-- 在线PPT/幻灯片分享系统
-- ============================================================

CREATE DATABASE IF NOT EXISTS online_ppt_sharing DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE online_ppt_sharing;

-- ============================================================
-- 用户表
-- ============================================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码(加密存储)',
  `email` VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
  `nickname` VARCHAR(50) DEFAULT NULL COMMENT '昵称',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  `bio` VARCHAR(500) DEFAULT NULL COMMENT '个人简介',
  `status` TINYINT DEFAULT 1 COMMENT '状态:1正常,0禁用',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ============================================================
-- 分类表
-- ============================================================
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE COMMENT '分类名称',
  `description` VARCHAR(200) DEFAULT NULL COMMENT '分类描述',
  `icon` VARCHAR(100) DEFAULT NULL COMMENT '分类图标',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分类表';

-- ============================================================
-- 文档表
-- ============================================================
DROP TABLE IF EXISTS `documents`;
CREATE TABLE `documents` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL COMMENT '上传者ID',
  `category_id` INT UNSIGNED DEFAULT NULL COMMENT '分类ID',
  `title` VARCHAR(200) NOT NULL COMMENT '文档标题',
  `description` TEXT COMMENT '文档描述',
  `file_name` VARCHAR(255) NOT NULL COMMENT '原始文件名',
  `file_path` VARCHAR(255) NOT NULL COMMENT '文件存储路径',
  `file_size` BIGINT DEFAULT 0 COMMENT '文件大小(字节)',
  `file_type` VARCHAR(20) DEFAULT NULL COMMENT '文件类型:ppt,pptx,pdf等',
  `cover_image` VARCHAR(255) DEFAULT NULL COMMENT '封面图片',
  `total_slides` INT DEFAULT 0 COMMENT '总页数',
  `status` TINYINT DEFAULT 0 COMMENT '状态:0转换中,1正常,2转换失败,3已删除',
  `is_public` TINYINT DEFAULT 1 COMMENT '是否公开:1公开,0私有',
  `allow_download` TINYINT DEFAULT 1 COMMENT '是否允许下载:1允许,0不允许',
  `view_count` INT DEFAULT 0 COMMENT '浏览次数',
  `like_count` INT DEFAULT 0 COMMENT '点赞数量',
  `download_count` INT DEFAULT 0 COMMENT '下载次数',
  `share_count` INT DEFAULT 0 COMMENT '分享次数',
  `tags` VARCHAR(500) DEFAULT NULL COMMENT '标签,逗号分隔',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_category_id` (`category_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_title` (`title`),
  FULLTEXT KEY `ft_title_desc` (`title`, `description`),
  CONSTRAINT `fk_doc_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_doc_category` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文档表';

-- ============================================================
-- 幻灯片页表
-- ============================================================
DROP TABLE IF EXISTS `slides`;
CREATE TABLE `slides` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `document_id` INT UNSIGNED NOT NULL COMMENT '文档ID',
  `page_number` INT NOT NULL COMMENT '页码',
  `image_path` VARCHAR(255) NOT NULL COMMENT '图片路径',
  `image_url` VARCHAR(255) NOT NULL COMMENT '图片访问URL',
  `width` INT DEFAULT NULL COMMENT '图片宽度',
  `height` INT DEFAULT NULL COMMENT '图片高度',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_document_id` (`document_id`),
  INDEX `idx_page_number` (`page_number`),
  UNIQUE KEY `uk_doc_page` (`document_id`, `page_number`),
  CONSTRAINT `fk_slide_document` FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='幻灯片页表';

-- ============================================================
-- 点赞表
-- ============================================================
DROP TABLE IF EXISTS `likes`;
CREATE TABLE `likes` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
  `document_id` INT UNSIGNED NOT NULL COMMENT '文档ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_document` (`user_id`, `document_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_document_id` (`document_id`),
  CONSTRAINT `fk_like_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_like_document` FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='点赞表';

-- ============================================================
-- 收藏表
-- ============================================================
DROP TABLE IF EXISTS `favorites`;
CREATE TABLE `favorites` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
  `document_id` INT UNSIGNED NOT NULL COMMENT '文档ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_document` (`user_id`, `document_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_document_id` (`document_id`),
  CONSTRAINT `fk_favorite_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_favorite_document` FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收藏表';

-- ============================================================
-- 下载记录表
-- ============================================================
DROP TABLE IF EXISTS `downloads`;
CREATE TABLE `downloads` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED DEFAULT NULL COMMENT '用户ID(匿名用户为NULL)',
  `document_id` INT UNSIGNED NOT NULL COMMENT '文档ID',
  `ip_address` VARCHAR(45) DEFAULT NULL COMMENT 'IP地址',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_document_id` (`document_id`),
  INDEX `idx_created_at` (`created_at`),
  CONSTRAINT `fk_download_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_download_document` FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='下载记录表';

-- ============================================================
-- 分享记录表
-- ============================================================
DROP TABLE IF EXISTS `shares`;
CREATE TABLE `shares` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED DEFAULT NULL COMMENT '用户ID',
  `document_id` INT UNSIGNED NOT NULL COMMENT '文档ID',
  `share_type` VARCHAR(20) DEFAULT 'link' COMMENT '分享类型:link,wechat,qq,weibo等',
  `ip_address` VARCHAR(45) DEFAULT NULL COMMENT 'IP地址',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_document_id` (`document_id`),
  INDEX `idx_created_at` (`created_at`),
  CONSTRAINT `fk_share_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_share_document` FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分享记录表';

-- ============================================================
-- 评论表
-- ============================================================
DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
  `document_id` INT UNSIGNED NOT NULL COMMENT '文档ID',
  `content` TEXT NOT NULL COMMENT '评论内容',
  `parent_id` INT UNSIGNED DEFAULT NULL COMMENT '父评论ID(用于回复)',
  `status` TINYINT DEFAULT 1 COMMENT '状态:1正常,0删除',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_document_id` (`document_id`),
  INDEX `idx_parent_id` (`parent_id`),
  CONSTRAINT `fk_comment_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comment_document` FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评论表';

-- ============================================================
-- 初始数据 - 分类
-- ============================================================
INSERT INTO `categories` (`name`, `description`, `icon`, `sort_order`) VALUES
('工作总结', '工作汇报、年终总结', '📊', 1),
('教育培训', '教学课件、培训资料', '📚', 2),
('产品介绍', '产品展示、发布会', '📦', 3),
('商业计划', '商业计划书、融资路演', '💼', 4),
('营销策划', '营销方案、活动策划', '🎯', 5),
('设计模板', '设计素材、模板', '🎨', 6),
('科技前沿', '技术分享、科技动态', '🔬', 7),
('其他', '其他分类', '📁', 99);

-- ============================================================
-- 初始数据 - 测试用户 (密码: 123456)
-- ============================================================
INSERT INTO `users` (`username`, `password`, `email`, `nickname`, `bio`) VALUES
('admin', '$2a$10$uBCldWbEpVO.uh/Z/V4prOLcLXoqJoXxHMohtQo8nfilisOSjAfVq', 'admin@example.com', '管理员', '系统管理员账号'),
('demo', '$2a$10$uBCldWbEpVO.uh/Z/V4prOLcLXoqJoXxHMohtQo8nfilisOSjAfVq', 'demo@example.com', '演示用户', '演示用普通用户账号');
