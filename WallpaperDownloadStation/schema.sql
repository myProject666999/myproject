-- ============================================================
-- Wallpaper Download Station - Database Schema
-- ============================================================

DROP DATABASE IF EXISTS `wallpaper_station`;
CREATE DATABASE `wallpaper_station` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `wallpaper_station`;

-- -----------------------------------------------------------
-- 分类表
-- -----------------------------------------------------------
CREATE TABLE `categories` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
  `slug` VARCHAR(50) NOT NULL COMMENT 'URL友好标识',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '分类描述',
  `icon` VARCHAR(100) DEFAULT NULL COMMENT '分类图标',
  `sort` INT NOT NULL DEFAULT 0 COMMENT '排序权重',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1启用 0禁用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='壁纸分类表';

-- -----------------------------------------------------------
-- 壁纸表
-- -----------------------------------------------------------
CREATE TABLE `wallpapers` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL COMMENT '壁纸标题',
  `description` TEXT DEFAULT NULL COMMENT '壁纸描述',
  `original_url` VARCHAR(500) NOT NULL COMMENT '原图URL',
  `original_width` INT NOT NULL COMMENT '原图宽度',
  `original_height` INT NOT NULL COMMENT '原图高度',
  `file_size` BIGINT NOT NULL DEFAULT 0 COMMENT '原文件大小(bytes)',
  `file_format` VARCHAR(10) NOT NULL DEFAULT 'jpg' COMMENT '文件格式',
  `views` INT NOT NULL DEFAULT 0 COMMENT '浏览次数',
  `downloads` INT NOT NULL DEFAULT 0 COMMENT '下载次数',
  `likes` INT NOT NULL DEFAULT 0 COMMENT '点赞数',
  `author` VARCHAR(100) DEFAULT NULL COMMENT '作者',
  `source` VARCHAR(200) DEFAULT NULL COMMENT '来源',
  `is_featured` TINYINT NOT NULL DEFAULT 0 COMMENT '是否精选:1是 0否',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1上架 0下架',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_featured` (`is_featured`),
  KEY `idx_status` (`status`),
  KEY `idx_created` (`created_at`),
  KEY `idx_views` (`views`),
  KEY `idx_downloads` (`downloads`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='壁纸主表';

-- -----------------------------------------------------------
-- 壁纸尺寸表（多尺寸自动生成）
-- -----------------------------------------------------------
CREATE TABLE `wallpaper_sizes` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `wallpaper_id` INT UNSIGNED NOT NULL COMMENT '壁纸ID',
  `resolution_label` VARCHAR(20) NOT NULL COMMENT '分辨率标签:如1920x1080',
  `width` INT NOT NULL COMMENT '宽度',
  `height` INT NOT NULL COMMENT '高度',
  `url` VARCHAR(500) NOT NULL COMMENT '对应尺寸URL',
  `file_size` BIGINT NOT NULL DEFAULT 0 COMMENT '文件大小(bytes)',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_wallpaper` (`wallpaper_id`),
  KEY `idx_resolution` (`resolution_label`),
  CONSTRAINT `fk_wallpaper_sizes_wallpaper` FOREIGN KEY (`wallpaper_id`) REFERENCES `wallpapers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='壁纸尺寸表';

-- -----------------------------------------------------------
-- 壁纸分类关联表
-- -----------------------------------------------------------
CREATE TABLE `wallpaper_categories` (
  `wallpaper_id` INT UNSIGNED NOT NULL,
  `category_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`wallpaper_id`, `category_id`),
  KEY `idx_category` (`category_id`),
  CONSTRAINT `fk_wc_wallpaper` FOREIGN KEY (`wallpaper_id`) REFERENCES `wallpapers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_wc_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='壁纸分类关联表';

-- -----------------------------------------------------------
-- 收藏表（基于IP/Session）
-- -----------------------------------------------------------
CREATE TABLE `favorites` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `wallpaper_id` INT UNSIGNED NOT NULL COMMENT '壁纸ID',
  `user_identifier` VARCHAR(100) NOT NULL COMMENT '用户标识(IP+UA hash)',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_wallpaper` (`user_identifier`, `wallpaper_id`),
  KEY `idx_wallpaper` (`wallpaper_id`),
  CONSTRAINT `fk_favorite_wallpaper` FOREIGN KEY (`wallpaper_id`) REFERENCES `wallpapers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收藏表';

-- ============================================================
-- 初始化数据
-- ============================================================

-- 分类数据
INSERT INTO `categories` (`name`, `slug`, `description`, `icon`, `sort`, `status`) VALUES
('自然风景', 'nature', '壮丽山川、星空、海滩等自然风光', '🌄', 1, 1),
('动漫', 'anime', '二次元、动漫角色壁纸', '🎨', 2, 1),
('游戏', 'games', '游戏原画、场景壁纸', '🎮', 3, 1),
('城市建筑', 'cityscape', '城市夜景、现代建筑', '🏙️', 4, 1),
('动物', 'animals', '可爱动物、野生动物壁纸', '🐾', 5, 1),
('太空', 'space', '星系、星云、宇宙深空', '🌌', 6, 1),
('抽象', 'abstract', '艺术抽象、几何图形', '🌀', 7, 1),
('汽车', 'cars', '跑车、经典汽车壁纸', '🚗', 8, 1),
('科技', 'technology', '科技感、未来感壁纸', '🔬', 9, 1),
('简约', 'minimal', '极简主义、纯色壁纸', '◻️', 10, 1);

-- 壁纸数据（示例）
INSERT INTO `wallpapers` (`title`, `description`, `original_url`, `original_width`, `original_height`, `file_size`, `file_format`, `author`, `source`, `is_featured`, `status`) VALUES
('星空下的山脉', '壮丽的银河拱桥横跨雪山之巅', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=3840&q=80', 3840, 2160, 5242880, 'jpg', 'Unsplash', 'https://unsplash.com', 1, 1),
('樱花飘落', '日本京都粉色樱花漫天飞舞', 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=3840&q=80', 3840, 2160, 4718592, 'jpg', 'Unsplash', 'https://unsplash.com', 1, 1),
('赛博朋克城市', '霓虹灯闪烁的未来都市夜景', 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=3840&q=80', 3840, 2160, 6291456, 'jpg', 'Unsplash', 'https://unsplash.com', 1, 1),
('森林晨雾', '清晨阳光穿透林间薄雾', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=3840&q=80', 3840, 2160, 3932160, 'jpg', 'Unsplash', 'https://unsplash.com', 0, 1),
('海浪拍岸', '金色夕阳下的澎湃海浪', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=3840&q=80', 3840, 2160, 4194304, 'jpg', 'Unsplash', 'https://unsplash.com', 0, 1),
('雪山倒影', '澄澈湖面上的完美雪山倒影', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=3840&q=80', 3840, 2160, 5505024, 'jpg', 'Unsplash', 'https://unsplash.com', 1, 1),
('极光之夜', '北极圈绿色极光在夜空舞动', 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=3840&q=80', 3840, 2160, 4980736, 'jpg', 'Unsplash', 'https://unsplash.com', 1, 1),
('沙漠孤影', '大漠夕阳下孤独的骆驼剪影', 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=3840&q=80', 3840, 2160, 3670016, 'jpg', 'Unsplash', 'https://unsplash.com', 0, 1),
('抽象几何', '现代几何艺术抽象背景', 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=3840&q=80', 3840, 2160, 2621440, 'jpg', 'Unsplash', 'https://unsplash.com', 0, 1),
('科技芯片', '电路板与蓝光科技感壁纸', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=3840&q=80', 3840, 2160, 4456448, 'jpg', 'Unsplash', 'https://unsplash.com', 1, 1),
('星空银河', '高清银河全景桌面壁纸', 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=3840&q=80', 3840, 2160, 6815744, 'jpg', 'Unsplash', 'https://unsplash.com', 1, 1),
('草原云海', '蒙古草原上的神奇云海', 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=3840&q=80', 3840, 2160, 3145728, 'jpg', 'Unsplash', 'https://unsplash.com', 0, 1);

-- 壁纸分类关联
INSERT INTO `wallpaper_categories` (`wallpaper_id`, `category_id`) VALUES
(1, 1), (1, 6),
(2, 1), (2, 2),
(3, 4), (3, 9),
(4, 1),
(5, 1),
(6, 1),
(7, 1), (7, 6),
(8, 1),
(9, 7),
(10, 9),
(11, 6),
(12, 1);

-- 壁纸尺寸数据（多尺寸自动生成记录）
INSERT INTO `wallpaper_sizes` (`wallpaper_id`, `resolution_label`, `width`, `height`, `url`, `file_size`) VALUES
(1, '3840x2160', 3840, 2160, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=3840&q=80', 5242880),
(1, '2560x1440', 2560, 1440, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2560&q=80', 3145728),
(1, '1920x1080', 1920, 1080, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80', 2097152),
(1, '1366x768', 1366, 768, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1366&q=80', 1572864),
(1, '1280x720', 1280, 720, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280&q=80', 1310720),
(2, '3840x2160', 3840, 2160, 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=3840&q=80', 4718592),
(2, '2560x1440', 2560, 1440, 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=2560&q=80', 2883584),
(2, '1920x1080', 1920, 1080, 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1920&q=80', 1966080),
(2, '1366x768', 1366, 768, 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1366&q=80', 1441792),
(2, '1280x720', 1280, 720, 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1280&q=80', 1179648),
(3, '3840x2160', 3840, 2160, 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=3840&q=80', 6291456),
(3, '2560x1440', 2560, 1440, 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=2560&q=80', 3774874),
(3, '1920x1080', 1920, 1080, 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1920&q=80', 2516582),
(3, '1366x768', 1366, 768, 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1366&q=80', 1782579),
(3, '1280x720', 1280, 720, 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1280&q=80', 1468006),
(4, '3840x2160', 3840, 2160, 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=3840&q=80', 3932160),
(4, '2560x1440', 2560, 1440, 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=2560&q=80', 2359296),
(4, '1920x1080', 1920, 1080, 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80', 1572864),
(4, '1366x768', 1366, 768, 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1366&q=80', 1179648),
(4, '1280x720', 1280, 720, 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1280&q=80', 983040),
(5, '3840x2160', 3840, 2160, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=3840&q=80', 4194304),
(5, '2560x1440', 2560, 1440, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2560&q=80', 2516582),
(5, '1920x1080', 1920, 1080, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80', 1677722),
(5, '1366x768', 1366, 768, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1366&q=80', 1258291),
(5, '1280x720', 1280, 720, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1280&q=80', 1048576),
(6, '3840x2160', 3840, 2160, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=3840&q=80', 5505024),
(6, '2560x1440', 2560, 1440, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=2560&q=80', 3276800),
(6, '1920x1080', 1920, 1080, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80', 2202010),
(6, '1366x768', 1366, 768, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1366&q=80', 1638400),
(6, '1280x720', 1280, 720, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1280&q=80', 1363149),
(7, '3840x2160', 3840, 2160, 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=3840&q=80', 4980736),
(7, '2560x1440', 2560, 1440, 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=2560&q=80', 2988442),
(7, '1920x1080', 1920, 1080, 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=1920&q=80', 1992294),
(7, '1366x768', 1366, 768, 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=1366&q=80', 1462760),
(7, '1280x720', 1280, 720, 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=1280&q=80', 1245184),
(8, '3840x2160', 3840, 2160, 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=3840&q=80', 3670016),
(8, '2560x1440', 2560, 1440, 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=2560&q=80', 2202010),
(8, '1920x1080', 1920, 1080, 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=1920&q=80', 1468006),
(8, '1366x768', 1366, 768, 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=1366&q=80', 1081344),
(8, '1280x720', 1280, 720, 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=1280&q=80', 891289),
(9, '3840x2160', 3840, 2160, 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=3840&q=80', 2621440),
(9, '2560x1440', 2560, 1440, 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=2560&q=80', 1572864),
(9, '1920x1080', 1920, 1080, 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1920&q=80', 1048576),
(9, '1366x768', 1366, 768, 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1366&q=80', 786432),
(9, '1280x720', 1280, 720, 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1280&q=80', 655360),
(10, '3840x2160', 3840, 2160, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=3840&q=80', 4456448),
(10, '2560x1440', 2560, 1440, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=2560&q=80', 2673869),
(10, '1920x1080', 1920, 1080, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80', 1782579),
(10, '1366x768', 1366, 768, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1366&q=80', 1310720),
(10, '1280x720', 1280, 720, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1280&q=80', 1114112),
(11, '3840x2160', 3840, 2160, 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=3840&q=80', 6815744),
(11, '2560x1440', 2560, 1440, 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=2560&q=80', 4089446),
(11, '1920x1080', 1920, 1080, 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80', 2726298),
(11, '1366x768', 1366, 768, 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1366&q=80', 2002780),
(11, '1280x720', 1280, 720, 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1280&q=80', 1703936),
(12, '3840x2160', 3840, 2160, 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=3840&q=80', 3145728),
(12, '2560x1440', 2560, 1440, 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=2560&q=80', 1887437),
(12, '1920x1080', 1920, 1080, 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1920&q=80', 1258291),
(12, '1366x768', 1366, 768, 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1366&q=80', 917504),
(12, '1280x720', 1280, 720, 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1280&q=80', 786432);

-- -----------------------------------------------------------
-- 常用分辨率预设
-- -----------------------------------------------------------
-- 4K UHD: 3840x2160
-- 2K QHD: 2560x1440
-- FHD: 1920x1080
-- HD: 1366x768
-- HD Ready: 1280x720
