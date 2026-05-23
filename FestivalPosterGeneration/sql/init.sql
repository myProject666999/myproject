-- =============================================
-- 节日海报生成系统 数据库初始化脚本
-- =============================================

CREATE DATABASE IF NOT EXISTS festival_poster DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE festival_poster;

-- =============================================
-- 节日表
-- =============================================
DROP TABLE IF EXISTS `festival`;
CREATE TABLE `festival` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL COMMENT '节日名称',
  `slug` VARCHAR(50) NOT NULL COMMENT '节日标识',
  `date` VARCHAR(20) NOT NULL COMMENT '节日日期 MM-DD',
  `icon` VARCHAR(100) DEFAULT NULL COMMENT '节日图标',
  `color` VARCHAR(20) DEFAULT '#e11d48' COMMENT '主题色',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态 1:启用 0:禁用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='节日表';

-- =============================================
-- 海报模板表
-- =============================================
DROP TABLE IF EXISTS `poster_template`;
CREATE TABLE `poster_template` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `festival_id` INT UNSIGNED NOT NULL COMMENT '所属节日',
  `name` VARCHAR(100) NOT NULL COMMENT '模板名称',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '模板描述',
  `preview_image` VARCHAR(255) DEFAULT NULL COMMENT '预览图',
  `background_type` VARCHAR(20) NOT NULL DEFAULT 'color' COMMENT '背景类型: color/gradient/image',
  `background_value` VARCHAR(255) NOT NULL COMMENT '背景值',
  `width` INT NOT NULL DEFAULT 750 COMMENT '画布宽度',
  `height` INT NOT NULL DEFAULT 1334 COMMENT '画布高度',
  `text_config` JSON DEFAULT NULL COMMENT '文字配置',
  `avatar_config` JSON DEFAULT NULL COMMENT '头像配置',
  `sticker_config` JSON DEFAULT NULL COMMENT '贴纸配置',
  `is_limited` TINYINT NOT NULL DEFAULT 0 COMMENT '是否限时 1:限时 0:永久',
  `online_from` DATETIME DEFAULT NULL COMMENT '限时上线开始时间',
  `online_to` DATETIME DEFAULT NULL COMMENT '限时上线结束时间',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态 1:启用 0:禁用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_festival` (`festival_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_template_festival` FOREIGN KEY (`festival_id`) REFERENCES `festival` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='海报模板表';

-- =============================================
-- 模板元素表（文字、装饰等可配置元素）
-- =============================================
DROP TABLE IF EXISTS `template_element`;
CREATE TABLE `template_element` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `template_id` INT UNSIGNED NOT NULL COMMENT '所属模板',
  `element_type` VARCHAR(30) NOT NULL COMMENT '元素类型: text/image/sticker',
  `name` VARCHAR(50) NOT NULL COMMENT '元素名称',
  `config` JSON NOT NULL COMMENT '元素配置',
  `editable` TINYINT NOT NULL DEFAULT 1 COMMENT '是否可编辑 1:是 0:否',
  `required` TINYINT NOT NULL DEFAULT 0 COMMENT '是否必填 1:是 0:否',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_template` (`template_id`),
  CONSTRAINT `fk_element_template` FOREIGN KEY (`template_id`) REFERENCES `poster_template` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='模板元素表';

-- =============================================
-- 初始节日数据
-- =============================================
INSERT INTO `festival` (`name`, `slug`, `date`, `icon`, `color`) VALUES
('春节', 'spring_festival', '01-01', '🧧', '#dc2626'),
('元宵节', 'lantern_festival', '01-15', '🏮', '#f59e0b'),
('情人节', 'valentines', '02-14', '💝', '#ec4899'),
('妇女节', 'womens_day', '03-08', '🌸', '#f472b6'),
('劳动节', 'labor_day', '05-01', '🛠️', '#3b82f6'),
('母亲节', 'mothers_day', '05-12', '🌷', '#f472b6'),
('儿童节', 'childrens_day', '06-01', '🎈', '#f59e0b'),
('父亲节', 'fathers_day', '06-16', '👔', '#3b82f6'),
('七夕节', 'qixi', '07-07', '💕', '#ec4899'),
('中秋节', 'mid_autumn', '08-15', '🌕', '#f59e0b'),
('重阳节', 'double_ninth', '09-09', '🍂', '#f97316'),
('国庆节', 'national_day', '10-01', '🇨🇳', '#dc2626'),
('万圣节', 'halloween', '10-31', '🎃', '#f97316'),
('感恩节', 'thanksgiving', '11-27', '🦃', '#d97706'),
('圣诞节', 'christmas', '12-25', '🎄', '#16a34a');

-- =============================================
-- 初始海报模板数据
-- =============================================
INSERT INTO `poster_template` (
  `festival_id`, `name`, `description`, `preview_image`,
  `background_type`, `background_value`, `width`, `height`,
  `text_config`, `avatar_config`, `sticker_config`,
  `is_limited`, `online_from`, `online_to`, `sort_order`
) VALUES
(
  1, '新春祝福', '经典红底金福字，适合春节送礼祝福', NULL,
  'gradient', 'linear-gradient(180deg, #dc2626 0%, #991b1b 100%)', 750, 1334,
  JSON_OBJECT(
    'title', JSON_OBJECT('text', '新春快乐', 'fontSize', 72, 'fontFamily', '"Microsoft YaHei", sans-serif', 'color', '#fbbf24', 'x', 375, 'y', 280, 'textAlign', 'center'),
    'subtitle', JSON_OBJECT('text', '恭贺新禧 万事如意', 'fontSize', 36, 'fontFamily', '"Microsoft YaHei", sans-serif', 'color', '#fef3c7', 'x', 375, 'y', 380, 'textAlign', 'center'),
    'blessing', JSON_OBJECT('text', '在此新春佳节之际，祝您和家人身体健康、阖家幸福、事业蒸蒸日上！', 'fontSize', 28, 'fontFamily', '"Microsoft YaHei", sans-serif', 'color', '#fef3c7', 'x', 375, 'y', 900, 'textAlign', 'center', 'maxWidth', 600)
  ),
  JSON_OBJECT('enabled', true, 'x', 375, 'y', 600, 'size', 240, 'shape', 'circle', 'borderColor', '#fbbf24', 'borderWidth', 6),
  JSON_ARRAY(
    JSON_OBJECT('type', 'emoji', 'value', '🧧', 'x', 80, 'y', 150, 'size', 60),
    JSON_OBJECT('type', 'emoji', 'value', '🎆', 'x', 670, 'y', 180, 'size', 70),
    JSON_OBJECT('type', 'emoji', 'value', '🏮', 'x', 120, 'y', 1100, 'size', 80),
    JSON_OBJECT('type', 'emoji', 'value', '🏮', 'x', 630, 'y', 1100, 'size', 80)
  ),
  0, NULL, NULL, 1
),
(
  1, '龙年大吉', '龙年专属模板，金龙腾云', NULL,
  'gradient', 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 50%, #fbbf24 100%)', 750, 1334,
  JSON_OBJECT(
    'title', JSON_OBJECT('text', '龙年大吉', 'fontSize', 80, 'fontFamily', '"Microsoft YaHei", sans-serif', 'color', '#fbbf24', 'x', 375, 'y', 300, 'textAlign', 'center'),
    'subtitle', JSON_OBJECT('text', '龙腾虎跃 万事亨通', 'fontSize', 32, 'fontFamily', '"Microsoft YaHei", sans-serif', 'color', '#fef3c7', 'x', 375, 'y', 400, 'textAlign', 'center'),
    'blessing', JSON_OBJECT('text', '龙年到，鸿运照！祝您龙年行大运，财源滚滚来！', 'fontSize', 28, 'fontFamily', '"Microsoft YaHei", sans-serif', 'color', '#fef3c7', 'x', 375, 'y', 950, 'textAlign', 'center', 'maxWidth', 600)
  ),
  JSON_OBJECT('enabled', true, 'x', 375, 'y', 650, 'size', 260, 'shape', 'circle', 'borderColor', '#fbbf24', 'borderWidth', 8),
  JSON_ARRAY(
    JSON_OBJECT('type', 'emoji', 'value', '🐉', 'x', 100, 'y', 120, 'size', 90),
    JSON_OBJECT('type', 'emoji', 'value', '🐉', 'x', 650, 'y', 120, 'size', 90),
    JSON_OBJECT('type', 'emoji', 'value', '🐲', 'x', 375, 'y', 1150, 'size', 100)
  ),
  1, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 2
),
(
  10, '花好月圆', '中秋团圆主题，明月当空', NULL,
  'gradient', 'linear-gradient(180deg, #1e3a5f 0%, #0c1929 100%)', 750, 1334,
  JSON_OBJECT(
    'title', JSON_OBJECT('text', '中秋快乐', 'fontSize', 72, 'fontFamily', '"Microsoft YaHei", sans-serif', 'color', '#fbbf24', 'x', 375, 'y', 280, 'textAlign', 'center'),
    'subtitle', JSON_OBJECT('text', '花好月圆人团圆', 'fontSize', 36, 'fontFamily', '"Microsoft YaHei", sans-serif', 'color', '#fef3c7', 'x', 375, 'y', 380, 'textAlign', 'center'),
    'blessing', JSON_OBJECT('text', '月圆人团圆，祝您中秋佳节快乐，阖家幸福！', 'fontSize', 28, 'fontFamily', '"Microsoft YaHei", sans-serif', 'color', '#e5e7eb', 'x', 375, 'y', 950, 'textAlign', 'center', 'maxWidth', 600)
  ),
  JSON_OBJECT('enabled', true, 'x', 375, 'y', 620, 'size', 220, 'shape', 'circle', 'borderColor', '#fbbf24', 'borderWidth', 4),
  JSON_ARRAY(
    JSON_OBJECT('type', 'emoji', 'value', '🌕', 'x', 620, 'y', 120, 'size', 80),
    JSON_OBJECT('type', 'emoji', 'value', '✨', 'x', 100, 'y', 150, 'size', 40),
    JSON_OBJECT('type', 'emoji', 'value', '✨', 'x', 650, 'y', 300, 'size', 30),
    JSON_OBJECT('type', 'emoji', 'value', '🥮', 'x', 150, 'y', 1150, 'size', 60),
    JSON_OBJECT('type', 'emoji', 'value', '🥮', 'x', 600, 'y', 1150, 'size', 60)
  ),
  0, NULL, NULL, 1
),
(
  15, '圣诞狂欢', '圣诞红绿主题，欢乐节日', NULL,
  'gradient', 'linear-gradient(180deg, #16a34a 0%, #15803d 100%)', 750, 1334,
  JSON_OBJECT(
    'title', JSON_OBJECT('text', 'Merry Christmas', 'fontSize', 60, 'fontFamily', '"Georgia", serif', 'color', '#fef3c7', 'x', 375, 'y', 280, 'textAlign', 'center'),
    'subtitle', JSON_OBJECT('text', '圣诞快乐', 'fontSize', 48, 'fontFamily', '"Microsoft YaHei", sans-serif', 'color', '#fbbf24', 'x', 375, 'y', 380, 'textAlign', 'center'),
    'blessing', JSON_OBJECT('text', '愿圣诞的烛光带给你温馨与幸福！', 'fontSize', 28, 'fontFamily', '"Microsoft YaHei", sans-serif', 'color', '#fef3c7', 'x', 375, 'y', 950, 'textAlign', 'center', 'maxWidth', 600)
  ),
  JSON_OBJECT('enabled', true, 'x', 375, 'y', 620, 'size', 220, 'shape', 'circle', 'borderColor', '#fbbf24', 'borderWidth', 5),
  JSON_ARRAY(
    JSON_OBJECT('type', 'emoji', 'value', '🎄', 'x', 80, 'y', 150, 'size', 70),
    JSON_OBJECT('type', 'emoji', 'value', '🎅', 'x', 650, 'y', 160, 'size', 70),
    JSON_OBJECT('type', 'emoji', 'value', '🎁', 'x', 120, 'y', 1150, 'size', 60),
    JSON_OBJECT('type', 'emoji', 'value', '⛄', 'x', 620, 'y', 1150, 'size', 70),
    JSON_OBJECT('type', 'emoji', 'value', '❄️', 'x', 375, 'y', 450, 'size', 40)
  ),
  0, NULL, NULL, 1
),
(
  3, '浪漫七夕', '粉色浪漫，甜蜜告白', NULL,
  'gradient', 'linear-gradient(180deg, #fce7f3 0%, #ec4899 100%)', 750, 1334,
  JSON_OBJECT(
    'title', JSON_OBJECT('text', '七夕快乐', 'fontSize', 72, 'fontFamily', '"Microsoft YaHei", sans-serif', 'color', '#be185d', 'x', 375, 'y', 280, 'textAlign', 'center'),
    'subtitle', JSON_OBJECT('text', '有情人终成眷属', 'fontSize', 36, 'fontFamily', '"Microsoft YaHei", sans-serif', 'color', '#9d174d', 'x', 375, 'y', 380, 'textAlign', 'center'),
    'blessing', JSON_OBJECT('text', '愿你与心爱之人携手一生，永不分离！', 'fontSize', 28, 'fontFamily', '"Microsoft YaHei", sans-serif', 'color', '#831843', 'x', 375, 'y', 950, 'textAlign', 'center', 'maxWidth', 600)
  ),
  JSON_OBJECT('enabled', true, 'x', 375, 'y', 620, 'size', 220, 'shape', 'circle', 'borderColor', '#be185d', 'borderWidth', 5),
  JSON_ARRAY(
    JSON_OBJECT('type', 'emoji', 'value', '💕', 'x', 100, 'y', 150, 'size', 60),
    JSON_OBJECT('type', 'emoji', 'value', '💖', 'x', 650, 'y', 150, 'size', 60),
    JSON_OBJECT('type', 'emoji', 'value', '💝', 'x', 375, 'y', 1200, 'size', 70)
  ),
  0, NULL, NULL, 1
),
(
  5, '劳动光荣', '致敬劳动者，五一快乐', NULL,
  'gradient', 'linear-gradient(180deg, #1e40af 0%, #1e3a8a 100%)', 750, 1334,
  JSON_OBJECT(
    'title', JSON_OBJECT('text', '劳动节快乐', 'fontSize', 72, 'fontFamily', '"Microsoft YaHei", sans-serif', 'color', '#fef3c7', 'x', 375, 'y', 280, 'textAlign', 'center'),
    'subtitle', JSON_OBJECT('text', '劳动最光荣', 'fontSize', 36, 'fontFamily', '"Microsoft YaHei", sans-serif', 'color', '#fbbf24', 'x', 375, 'y', 380, 'textAlign', 'center'),
    'blessing', JSON_OBJECT('text', '向每一位辛勤的劳动者致敬！祝您节日快乐！', 'fontSize', 28, 'fontFamily', '"Microsoft YaHei", sans-serif', 'color', '#e5e7eb', 'x', 375, 'y', 950, 'textAlign', 'center', 'maxWidth', 600)
  ),
  JSON_OBJECT('enabled', true, 'x', 375, 'y', 620, 'size', 220, 'shape', 'circle', 'borderColor', '#fbbf24', 'borderWidth', 4),
  JSON_ARRAY(
    JSON_OBJECT('type', 'emoji', 'value', '🛠️', 'x', 100, 'y', 150, 'size', 60),
    JSON_OBJECT('type', 'emoji', 'value', '🏆', 'x', 650, 'y', 160, 'size', 70),
    JSON_OBJECT('type', 'emoji', 'value', '⭐', 'x', 120, 'y', 1150, 'size', 50),
    JSON_OBJECT('type', 'emoji', 'value', '⭐', 'x', 620, 'y', 1150, 'size', 50)
  ),
  0, NULL, NULL, 1
);

-- =============================================
-- 模板元素数据
-- =============================================
INSERT INTO `template_element` (`template_id`, `element_type`, `name`, `config`, `editable`, `required`, `sort_order`) VALUES
(1, 'text', '主标题', JSON_OBJECT('type', 'text', 'placeholder', '新春快乐', 'maxLength', 20, 'x', 375, 'y', 280, 'fontSize', 72), 1, 1, 1),
(1, 'text', '副标题', JSON_OBJECT('type', 'text', 'placeholder', '恭贺新禧 万事如意', 'maxLength', 30, 'x', 375, 'y', 380, 'fontSize', 36), 1, 0, 2),
(1, 'text', '祝福语', JSON_OBJECT('type', 'text', 'placeholder', '在此新春佳节之际...', 'maxLength', 100, 'x', 375, 'y', 900, 'fontSize', 28, 'maxWidth', 600), 1, 0, 3),
(1, 'avatar', '头像', JSON_OBJECT('type', 'avatar', 'x', 375, 'y', 600, 'size', 240, 'shape', 'circle'), 1, 1, 4),
(2, 'text', '主标题', JSON_OBJECT('type', 'text', 'placeholder', '龙年大吉', 'maxLength', 20, 'x', 375, 'y', 300, 'fontSize', 80), 1, 1, 1),
(2, 'text', '副标题', JSON_OBJECT('type', 'text', 'placeholder', '龙腾虎跃 万事亨通', 'maxLength', 30, 'x', 375, 'y', 400, 'fontSize', 32), 1, 0, 2),
(2, 'text', '祝福语', JSON_OBJECT('type', 'text', 'placeholder', '龙年到，鸿运照！', 'maxLength', 100, 'x', 375, 'y', 950, 'fontSize', 28, 'maxWidth', 600), 1, 0, 3),
(2, 'avatar', '头像', JSON_OBJECT('type', 'avatar', 'x', 375, 'y', 650, 'size', 260, 'shape', 'circle'), 1, 1, 4),
(3, 'text', '主标题', JSON_OBJECT('type', 'text', 'placeholder', '中秋快乐', 'maxLength', 20, 'x', 375, 'y', 280, 'fontSize', 72), 1, 1, 1),
(3, 'text', '副标题', JSON_OBJECT('type', 'text', 'placeholder', '花好月圆人团圆', 'maxLength', 30, 'x', 375, 'y', 380, 'fontSize', 36), 1, 0, 2),
(3, 'text', '祝福语', JSON_OBJECT('type', 'text', 'placeholder', '月圆人团圆...', 'maxLength', 100, 'x', 375, 'y', 950, 'fontSize', 28, 'maxWidth', 600), 1, 0, 3),
(3, 'avatar', '头像', JSON_OBJECT('type', 'avatar', 'x', 375, 'y', 620, 'size', 220, 'shape', 'circle'), 1, 1, 4),
(4, 'text', '主标题', JSON_OBJECT('type', 'text', 'placeholder', 'Merry Christmas', 'maxLength', 30, 'x', 375, 'y', 280, 'fontSize', 60), 1, 1, 1),
(4, 'text', '副标题', JSON_OBJECT('type', 'text', 'placeholder', '圣诞快乐', 'maxLength', 20, 'x', 375, 'y', 380, 'fontSize', 48), 1, 0, 2),
(4, 'text', '祝福语', JSON_OBJECT('type', 'text', 'placeholder', '愿圣诞的烛光带给你温馨与幸福！', 'maxLength', 100, 'x', 375, 'y', 950, 'fontSize', 28, 'maxWidth', 600), 1, 0, 3),
(4, 'avatar', '头像', JSON_OBJECT('type', 'avatar', 'x', 375, 'y', 620, 'size', 220, 'shape', 'circle'), 1, 1, 4),
(5, 'text', '主标题', JSON_OBJECT('type', 'text', 'placeholder', '七夕快乐', 'maxLength', 20, 'x', 375, 'y', 280, 'fontSize', 72), 1, 1, 1),
(5, 'text', '副标题', JSON_OBJECT('type', 'text', 'placeholder', '有情人终成眷属', 'maxLength', 30, 'x', 375, 'y', 380, 'fontSize', 36), 1, 0, 2),
(5, 'text', '祝福语', JSON_OBJECT('type', 'text', 'placeholder', '愿你与心爱之人携手一生！', 'maxLength', 100, 'x', 375, 'y', 950, 'fontSize', 28, 'maxWidth', 600), 1, 0, 3),
(5, 'avatar', '头像', JSON_OBJECT('type', 'avatar', 'x', 375, 'y', 620, 'size', 220, 'shape', 'circle'), 1, 1, 4),
(6, 'text', '主标题', JSON_OBJECT('type', 'text', 'placeholder', '劳动节快乐', 'maxLength', 20, 'x', 375, 'y', 280, 'fontSize', 72), 1, 1, 1),
(6, 'text', '副标题', JSON_OBJECT('type', 'text', 'placeholder', '劳动最光荣', 'maxLength', 30, 'x', 375, 'y', 380, 'fontSize', 36), 1, 0, 2),
(6, 'text', '祝福语', JSON_OBJECT('type', 'text', 'placeholder', '向每一位辛勤的劳动者致敬！', 'maxLength', 100, 'x', 375, 'y', 950, 'fontSize', 28, 'maxWidth', 600), 1, 0, 3),
(6, 'avatar', '头像', JSON_OBJECT('type', 'avatar', 'x', 375, 'y', 620, 'size', 220, 'shape', 'circle'), 1, 1, 4);
