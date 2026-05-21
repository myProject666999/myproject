-- =============================================
-- 家庭食谱本数据库脚本
-- =============================================

CREATE DATABASE IF NOT EXISTS family_recipe_book DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE family_recipe_book;

SET FOREIGN_KEY_CHECKS = 0;

-- =============================================
-- 菜谱表
-- =============================================
DROP TABLE IF EXISTS `recipe`;
CREATE TABLE `recipe` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '菜谱ID',
    `name` VARCHAR(100) NOT NULL COMMENT '菜谱名称',
    `description` VARCHAR(500) DEFAULT NULL COMMENT '菜谱描述',
    `cover_image` VARCHAR(255) DEFAULT NULL COMMENT '封面图片路径',
    `cooking_time` INT DEFAULT NULL COMMENT '烹饪时间（分钟）',
    `difficulty` VARCHAR(20) DEFAULT NULL COMMENT '难度：简单/中等/困难',
    `servings` INT DEFAULT NULL COMMENT '份量（人份）',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜谱表';

-- =============================================
-- 食材表
-- =============================================
DROP TABLE IF EXISTS `ingredient`;
CREATE TABLE `ingredient` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '食材ID',
    `name` VARCHAR(50) NOT NULL COMMENT '食材名称',
    `category` VARCHAR(50) DEFAULT NULL COMMENT '食材分类：蔬菜/肉类/海鲜/调料/主食等',
    UNIQUE KEY `uk_ingredient_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='食材表';

-- =============================================
-- 菜谱食材关联表（多对多）
-- =============================================
DROP TABLE IF EXISTS `recipe_ingredient`;
CREATE TABLE `recipe_ingredient` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '关联ID',
    `recipe_id` BIGINT NOT NULL COMMENT '菜谱ID',
    `ingredient_id` BIGINT NOT NULL COMMENT '食材ID',
    `quantity` DECIMAL(10,2) DEFAULT NULL COMMENT '用量',
    `unit` VARCHAR(20) DEFAULT NULL COMMENT '单位：克/勺/个等',
    `is_required` TINYINT(1) DEFAULT 1 COMMENT '是否必需：1是0否',
    FOREIGN KEY (`recipe_id`) REFERENCES `recipe`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`ingredient_id`) REFERENCES `ingredient`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `uk_recipe_ingredient` (`recipe_id`, `ingredient_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜谱食材关联表';

-- =============================================
-- 菜谱步骤表
-- =============================================
DROP TABLE IF EXISTS `recipe_step`;
CREATE TABLE `recipe_step` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '步骤ID',
    `recipe_id` BIGINT NOT NULL COMMENT '菜谱ID',
    `step_number` INT NOT NULL COMMENT '步骤序号',
    `description` TEXT NOT NULL COMMENT '步骤描述',
    `image_url` VARCHAR(255) DEFAULT NULL COMMENT '步骤图片路径',
    FOREIGN KEY (`recipe_id`) REFERENCES `recipe`(`id`) ON DELETE CASCADE,
    INDEX `idx_recipe_step` (`recipe_id`, `step_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜谱步骤表';

-- =============================================
-- 季节表
-- =============================================
DROP TABLE IF EXISTS `season`;
CREATE TABLE `season` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '季节ID',
    `name` VARCHAR(20) NOT NULL COMMENT '季节名称：春季/夏季/秋季/冬季',
    UNIQUE KEY `uk_season_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='季节表';

-- =============================================
-- 菜谱季节关联表（多对多）
-- =============================================
DROP TABLE IF EXISTS `recipe_season`;
CREATE TABLE `recipe_season` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '关联ID',
    `recipe_id` BIGINT NOT NULL COMMENT '菜谱ID',
    `season_id` BIGINT NOT NULL COMMENT '季节ID',
    FOREIGN KEY (`recipe_id`) REFERENCES `recipe`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`season_id`) REFERENCES `season`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `uk_recipe_season` (`recipe_id`, `season_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜谱季节关联表';

-- =============================================
-- 收藏表
-- =============================================
DROP TABLE IF EXISTS `favorite`;
CREATE TABLE `favorite` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '收藏ID',
    `recipe_id` BIGINT NOT NULL COMMENT '菜谱ID',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
    FOREIGN KEY (`recipe_id`) REFERENCES `recipe`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `uk_favorite_recipe` (`recipe_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收藏表';

-- =============================================
-- 初始化季节数据
-- =============================================
INSERT INTO `season` (`name`) VALUES ('春季'), ('夏季'), ('秋季'), ('冬季');

-- =============================================
-- 初始化一些常用食材数据
-- =============================================
INSERT INTO `ingredient` (`name`, `category`) VALUES
('猪肉', '肉类'),
('牛肉', '肉类'),
('鸡肉', '肉类'),
('鸡蛋', '蛋类'),
('鱼', '海鲜'),
('虾', '海鲜'),
('白菜', '蔬菜'),
('菠菜', '蔬菜'),
('番茄', '蔬菜'),
('土豆', '蔬菜'),
('胡萝卜', '蔬菜'),
('黄瓜', '蔬菜'),
('茄子', '蔬菜'),
('青椒', '蔬菜'),
('豆芽', '蔬菜'),
('豆腐', '豆制品'),
('米饭', '主食'),
('面条', '主食'),
('大蒜', '调料'),
('生姜', '调料'),
('葱', '调料'),
('盐', '调料'),
('酱油', '调料'),
('醋', '调料'),
('白糖', '调料'),
('料酒', '调料');

SET FOREIGN_KEY_CHECKS = 1;
