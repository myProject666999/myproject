CREATE DATABASE IF NOT EXISTS `avatar_cropping` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `avatar_cropping`;

CREATE TABLE IF NOT EXISTS `templates` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` VARCHAR(100) NOT NULL COMMENT '模板名称',
  `category` VARCHAR(20) NOT NULL COMMENT '分类：border-边框, festival-节日',
  `style` VARCHAR(20) NOT NULL COMMENT '风格：simple-简约, vintage-复古, cartoon-卡通, spring-春节, christmas-圣诞, birthday-生日',
  `image_url` VARCHAR(500) NOT NULL COMMENT '边框图片URL',
  `border_width` INT DEFAULT 0 COMMENT '边框宽度（像素）',
  `border_color` VARCHAR(20) DEFAULT '#000000' COMMENT '边框颜色',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  INDEX `idx_category` (`category`),
  INDEX `idx_style` (`style`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='头像边框模板表';

INSERT INTO `templates` (`name`, `category`, `style`, `image_url`, `border_width`, `border_color`) VALUES
('简约白边', 'border', 'simple', '/templates/border-simple-white.png', 10, '#ffffff'),
('简约黑边', 'border', 'simple', '/templates/border-simple-black.png', 10, '#000000'),
('复古金边', 'border', 'vintage', '/templates/border-vintage-gold.png', 15, '#ffd700'),
('复古铜边', 'border', 'vintage', '/templates/border-vintage-bronze.png', 15, '#cd7f32'),
('卡通粉边', 'border', 'cartoon', '/templates/border-cartoon-pink.png', 12, '#ffb6c1'),
('卡通蓝边', 'border', 'cartoon', '/templates/border-cartoon-blue.png', 12, '#87ceeb'),
('春节红边', 'festival', 'spring', '/templates/festival-spring-red.png', 20, '#dc143c'),
('春节金色', 'festival', 'spring', '/templates/festival-spring-gold.png', 20, '#ffd700'),
('圣诞红绿', 'festival', 'christmas', '/templates/festival-christmas.png', 18, '#228b22'),
('生日彩边', 'festival', 'birthday', '/templates/festival-birthday.png', 15, '#ff69b4');
