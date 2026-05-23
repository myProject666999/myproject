-- =============================================
-- 在线邀请函系统数据库脚本
-- =============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `online_invitation` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `online_invitation`;

-- =============================================
-- 模板表
-- =============================================
DROP TABLE IF EXISTS `templates`;
CREATE TABLE `templates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL COMMENT '模板名称',
  `category` VARCHAR(50) NOT NULL DEFAULT 'wedding' COMMENT '分类: wedding/birthday/party',
  `preview_image` VARCHAR(255) DEFAULT NULL COMMENT '预览图片URL',
  `background_color` VARCHAR(20) DEFAULT '#ffffff' COMMENT '背景颜色',
  `text_color` VARCHAR(20) DEFAULT '#333333' COMMENT '文字颜色',
  `accent_color` VARCHAR(20) DEFAULT '#e91e63' COMMENT '强调色',
  `font_family` VARCHAR(100) DEFAULT 'serif' COMMENT '字体',
  `layout_type` VARCHAR(50) DEFAULT 'center' COMMENT '布局类型: center/left/right',
  `animation_style` VARCHAR(50) DEFAULT 'fade' COMMENT '动画样式: fade/slide/zoom',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='邀请函模板表';

-- =============================================
-- 邀请函表
-- =============================================
DROP TABLE IF EXISTS `invitations`;
CREATE TABLE `invitations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `template_id` INT NOT NULL COMMENT '模板ID',
  `title` VARCHAR(200) NOT NULL COMMENT '邀请函标题',
  `subtitle` VARCHAR(200) DEFAULT NULL COMMENT '副标题',
  `host_name` VARCHAR(100) NOT NULL COMMENT '主办方/新人姓名',
  `host_name2` VARCHAR(100) DEFAULT NULL COMMENT '第二主办方姓名(如婚礼另一半)',
  `event_date` DATE NOT NULL COMMENT '活动日期',
  `event_time` TIME NOT NULL COMMENT '活动时间',
  `location_name` VARCHAR(200) NOT NULL COMMENT '地点名称',
  `location_address` VARCHAR(500) NOT NULL COMMENT '详细地址',
  `latitude` DECIMAL(10, 7) DEFAULT NULL COMMENT '纬度',
  `longitude` DECIMAL(10, 7) DEFAULT NULL COMMENT '经度',
  `description` TEXT COMMENT '邀请函正文/描述',
  `cover_image` VARCHAR(255) DEFAULT NULL COMMENT '封面图片URL',
  `background_music` VARCHAR(255) DEFAULT NULL COMMENT '背景音乐URL',
  `custom_style` JSON DEFAULT NULL COMMENT '自定义样式(JSON)',
  `share_code` VARCHAR(20) UNIQUE COMMENT '分享码',
  `view_count` INT DEFAULT 0 COMMENT '浏览次数',
  `status` TINYINT(1) DEFAULT 1 COMMENT '状态: 0-禁用 1-启用',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_template_id` (`template_id`),
  INDEX `idx_share_code` (`share_code`),
  INDEX `idx_event_date` (`event_date`),
  FOREIGN KEY (`template_id`) REFERENCES `templates` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='邀请函表';

-- =============================================
-- 报名表
-- =============================================
DROP TABLE IF EXISTS `registrations`;
CREATE TABLE `registrations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `invitation_id` INT NOT NULL COMMENT '邀请函ID',
  `name` VARCHAR(100) NOT NULL COMMENT '报名人姓名',
  `phone` VARCHAR(20) NOT NULL COMMENT '联系电话',
  `attend_count` INT DEFAULT 1 COMMENT '参加人数',
  `message` TEXT COMMENT '留言/祝福',
  `attend_status` TINYINT(1) DEFAULT 1 COMMENT '参加状态: 0-不参加 1-参加',
  `ip_address` VARCHAR(50) DEFAULT NULL COMMENT 'IP地址',
  `user_agent` VARCHAR(500) DEFAULT NULL COMMENT '浏览器标识',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_invitation_id` (`invitation_id`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`invitation_id`) REFERENCES `invitations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='报名表';

-- =============================================
-- 照片/相册表
-- =============================================
DROP TABLE IF EXISTS `photos`;
CREATE TABLE `photos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `invitation_id` INT NOT NULL COMMENT '邀请函ID',
  `image_url` VARCHAR(255) NOT NULL COMMENT '图片URL',
  `caption` VARCHAR(200) DEFAULT NULL COMMENT '图片说明',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_invitation_id` (`invitation_id`),
  FOREIGN KEY (`invitation_id`) REFERENCES `invitations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='照片表';

-- =============================================
-- 插入默认模板数据
-- =============================================
INSERT INTO `templates` (`name`, `category`, `preview_image`, `background_color`, `text_color`, `accent_color`, `font_family`, `layout_type`, `animation_style`, `sort_order`) VALUES
('浪漫粉色婚礼', 'wedding', '/templates/wedding-pink.png', '#fff0f5', '#8b4513', '#ff69b4', 'Georgia, serif', 'center', 'fade', 1),
('简约白色婚礼', 'wedding', '/templates/wedding-white.png', '#ffffff', '#333333', '#c9a96e', 'Georgia, serif', 'center', 'fade', 2),
('复古红色婚礼', 'wedding', '/templates/wedding-red.png', '#8b0000', '#ffffff', '#ffd700', 'Georgia, serif', 'center', 'zoom', 3),
('蓝色海洋婚礼', 'wedding', '/templates/wedding-blue.png', '#e0f7fa', '#006064', '#00bcd4', 'Arial, sans-serif', 'center', 'slide', 4),
('紫色梦幻婚礼', 'wedding', '/templates/wedding-purple.png', '#f3e5f5', '#4a148c', '#9c27b0', 'Georgia, serif', 'center', 'fade', 5),
('金色奢华婚礼', 'wedding', '/templates/wedding-gold.png', '#fff8e1', '#5d4037', '#ffc107', 'Georgia, serif', 'center', 'zoom', 6),
('清新绿色生日', 'birthday', '/templates/birthday-green.png', '#e8f5e9', '#1b5e20', '#4caf50', 'Arial, sans-serif', 'center', 'fade', 7),
('粉色甜蜜生日', 'birthday', '/templates/birthday-pink.png', '#fce4ec', '#880e4f', '#e91e63', 'Arial, sans-serif', 'center', 'slide', 8),
('蓝色童趣生日', 'birthday', '/templates/birthday-blue.png', '#e3f2fd', '#0d47a1', '#2196f3', 'Arial, sans-serif', 'center', 'fade', 9),
('活力橙色派对', 'party', '/templates/party-orange.png', '#fff3e0', '#bf360c', '#ff5722', 'Arial, sans-serif', 'center', 'zoom', 10),
('酷炫黑色派对', 'party', '/templates/party-black.png', '#212121', '#ffffff', '#f44336', 'Arial, sans-serif', 'center', 'slide', 11),
('彩虹缤纷派对', 'party', '/templates/party-rainbow.png', '#ffffff', '#333333', '#9c27b0', 'Arial, sans-serif', 'center', 'fade', 12);

-- =============================================
-- 插入示例邀请函数据
-- =============================================
INSERT INTO `invitations` (`template_id`, `title`, `subtitle`, `host_name`, `host_name2`, `event_date`, `event_time`, `location_name`, `location_address`, `latitude`, `longitude`, `description`, `share_code`, `view_count`) VALUES
(1, '诚挚邀请', '我们要结婚啦', '张晓明', '李美丽', '2026-06-18', '18:00:00', '香格里拉大酒店', '北京市朝阳区建国路88号', 39.9087200, 116.4204400, '亲爱的朋友们：\n\n我们即将携手步入婚姻的殿堂，诚挚地邀请您见证这美好的时刻。\n\n期待您的光临！', 'abc123', 0),
(7, '生日快乐', '欢迎来参加生日派对', '王小红', NULL, '2026-07-15', '14:00:00', '阳光会所', '上海市浦东新区世纪大道100号', 31.2304000, 121.4737000, '亲爱的朋友们：\n\n生日快乐！一起来庆祝这个特别的日子吧！', 'bcd456', 0);

-- =============================================
-- 插入示例报名数据
-- =============================================
INSERT INTO `registrations` (`invitation_id`, `name`, `phone`, `attend_count`, `message`, `attend_status`) VALUES
(1, '张三', '13800138001', 2, '恭喜恭喜！', 1),
(1, '李四', '13800138002', 1, '祝福你们！', 1),
(2, '王五', '13900139001', 3, '生日快乐！', 1);

-- =============================================
-- 插入示例照片数据
-- =============================================
INSERT INTO `photos` (`invitation_id`, `image_url`, `caption`, `sort_order`) VALUES
(1, '/photos/sample1.jpg', '甜蜜时光', 1),
(1, '/photos/sample2.jpg', '美好回忆', 2),
(2, '/photos/birthday1.jpg', '生日快乐', 1);
