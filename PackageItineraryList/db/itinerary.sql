-- 创建数据库
CREATE DATABASE IF NOT EXISTS itinerary_list DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE itinerary_list;

-- 用户表
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password` VARCHAR(100) NOT NULL,
    `nickname` VARCHAR(50),
    `avatar` VARCHAR(255),
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted` TINYINT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 场景模板表（支持继承机制）
DROP TABLE IF EXISTS `template`;
CREATE TABLE `template` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(500),
    `scene_type` VARCHAR(50) NOT NULL,
    `icon` VARCHAR(255),
    `default_days` INT DEFAULT 3,
    `is_system` TINYINT DEFAULT 0,
    `is_public` TINYINT DEFAULT 0,
    `parent_id` BIGINT,
    `creator_id` BIGINT,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted` TINYINT DEFAULT 0,
    FOREIGN KEY (`parent_id`) REFERENCES `template`(`id`),
    FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 物品分类表
DROP TABLE IF EXISTS `category`;
CREATE TABLE `category` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL,
    `icon` VARCHAR(255),
    `sort_order` INT DEFAULT 0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `deleted` TINYINT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 模板物品关联表
DROP TABLE IF EXISTS `template_item`;
CREATE TABLE `template_item` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `template_id` BIGINT NOT NULL,
    `category_id` BIGINT,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(500),
    `default_quantity` INT DEFAULT 1,
    `is_required` TINYINT DEFAULT 0,
    `sort_order` INT DEFAULT 0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `deleted` TINYINT DEFAULT 0,
    FOREIGN KEY (`template_id`) REFERENCES `template`(`id`),
    FOREIGN KEY (`category_id`) REFERENCES `category`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 行程清单表
DROP TABLE IF EXISTS `itinerary`;
CREATE TABLE `itinerary` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `template_id` BIGINT,
    `user_id` BIGINT NOT NULL,
    `days` INT DEFAULT 1,
    `departure_date` DATE,
    `return_date` DATE,
    `destination` VARCHAR(200),
    `notes` TEXT,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted` TINYINT DEFAULT 0,
    FOREIGN KEY (`template_id`) REFERENCES `template`(`id`),
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 清单项表
DROP TABLE IF EXISTS `itinerary_item`;
CREATE TABLE `itinerary_item` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `itinerary_id` BIGINT NOT NULL,
    `template_item_id` BIGINT,
    `category_id` BIGINT,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(500),
    `quantity` INT DEFAULT 1,
    `is_checked` TINYINT DEFAULT 0,
    `checked_at` DATETIME,
    `is_custom` TINYINT DEFAULT 0,
    `sort_order` INT DEFAULT 0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted` TINYINT DEFAULT 0,
    FOREIGN KEY (`itinerary_id`) REFERENCES `itinerary`(`id`),
    FOREIGN KEY (`template_item_id`) REFERENCES `template_item`(`id`),
    FOREIGN KEY (`category_id`) REFERENCES `category`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 共享表
DROP TABLE IF EXISTS `share`;
CREATE TABLE `share` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `itinerary_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `share_code` VARCHAR(50) NOT NULL UNIQUE,
    `share_url` VARCHAR(500),
    `expire_at` DATETIME,
    `can_edit` TINYINT DEFAULT 0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `expired` TINYINT DEFAULT 0,
    `deleted` TINYINT DEFAULT 0,
    FOREIGN KEY (`itinerary_id`) REFERENCES `itinerary`(`id`),
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 共享参与者表
DROP TABLE IF EXISTS `share_participant`;
CREATE TABLE `share_participant` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `share_id` BIGINT NOT NULL,
    `user_id` BIGINT,
    `nickname` VARCHAR(50),
    `joined_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`share_id`) REFERENCES `share`(`id`),
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入初始数据
-- 插入默认用户
INSERT INTO `user` (`username`, `password`, `nickname`) VALUES
('demo', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '演示用户');

-- 插入物品分类
INSERT INTO `category` (`name`, `icon`, `sort_order`) VALUES
('证件票据', '📄', 1),
('衣物鞋履', '👕', 2),
('电子设备', '📱', 3),
('洗漱用品', '🧴', 4),
('药品健康', '💊', 5),
('其他物品', '🎒', 6);

-- 插入系统模板 - 商务出差
INSERT INTO `template` (`name`, `description`, `scene_type`, `icon`, `default_days`, `is_system`, `is_public`, `creator_id`) VALUES
('商务出差', '商务出差必备物品清单', 'business', '💼', 3, 1, 1, 1),
('海岛度假', '海岛度假必备物品清单', 'island', '🏝️', 5, 1, 1, 1),
('滑雪旅行', '滑雪旅行必备物品清单', 'ski', '⛷️', 3, 1, 1, 1),
('城市旅游', '城市旅游必备物品清单', 'city', '🏙️', 4, 1, 1, 1);

-- 商务出差模板物品
INSERT INTO `template_item` (`template_id`, `category_id`, `name`, `description`, `default_quantity`, `is_required`, `sort_order`) VALUES
(1, 1, '身份证', '必备证件', 1, 1, 1),
(1, 1, '名片', '商务名片', 20, 0, 2),
(1, 1, '笔记本电脑', '工作电脑', 1, 1, 3),
(1, 1, '充电器', '电脑充电器', 1, 1, 4),
(1, 2, '西装', '正装', 2, 1, 1),
(1, 2, '衬衫', '正装衬衫', 3, 1, 2),
(1, 2, '领带', '商务领带', 2, 0, 3),
(1, 2, '皮鞋', '商务皮鞋', 1, 1, 4),
(1, 3, '手机', '手机', 1, 1, 1),
(1, 3, '充电宝', '移动电源', 1, 0, 2),
(1, 3, '耳机', '蓝牙耳机', 1, 0, 3),
(1, 4, '洗漱用品', '旅行装洗漱用品', 1, 1, 1),
(1, 5, '常用药品', '感冒药、肠胃药等', 1, 0, 1);

-- 海岛度假模板物品
INSERT INTO `template_item` (`template_id`, `category_id`, `name`, `description`, `default_quantity`, `is_required`, `sort_order`) VALUES
(2, 1, '身份证/护照', '证件', 1, 1, 1),
(2, 1, '机票酒店订单', '电子或纸质订单', 1, 1, 2),
(2, 2, '泳装', '泳衣泳裤', 2, 1, 1),
(2, 2, '沙滩裤', '沙滩短裤', 2, 1, 2),
(2, 2, 'T恤', '短袖T恤', 5, 1, 3),
(2, 2, '凉鞋/拖鞋', '沙滩鞋', 1, 1, 4),
(2, 2, '遮阳帽', '太阳帽', 1, 0, 5),
(2, 3, '手机防水袋', '潜水拍照必备', 1, 0, 1),
(2, 4, '防晒霜', 'SPF50+', 1, 1, 1),
(2, 4, '太阳镜', '偏光太阳镜', 1, 1, 2),
(2, 4, '芦荟胶', '晒后修复', 1, 0, 3),
(2, 6, '潜水装备', '浮潜三宝', 1, 0, 1),
(2, 6, '沙滩巾', '大毛巾', 1, 0, 2);

-- 滑雪旅行模板物品
INSERT INTO `template_item` (`template_id`, `category_id`, `name`, `description`, `default_quantity`, `is_required`, `sort_order`) VALUES
(3, 1, '身份证', '证件', 1, 1, 1),
(3, 2, '滑雪服', '防水保暖滑雪服', 1, 1, 1),
(3, 2, '滑雪裤', '防水滑雪裤', 1, 1, 2),
(3, 2, '速干衣', '保暖内衣', 2, 1, 3),
(3, 2, '抓绒衣', '中间层', 1, 1, 4),
(3, 2, '厚袜子', '滑雪袜', 3, 1, 5),
(3, 2, '手套', '防水滑雪手套', 1, 1, 6),
(3, 3, '运动相机', '记录滑雪精彩瞬间', 1, 0, 1),
(3, 4, '护脸面罩', '防风保暖', 1, 1, 1),
(3, 4, '护目镜', '防雪盲', 1, 1, 2),
(3, 5, '暖宝宝', '保暖贴', 10, 0, 1),
(3, 6, '雪板', '可租可自带', 1, 0, 1),
(3, 6, '雪鞋', '滑雪靴', 1, 0, 2),
(3, 6, '头盔', '安全必备', 1, 1, 3);

-- 城市旅游模板物品
INSERT INTO `template_item` (`template_id`, `category_id`, `name`, `description`, `default_quantity`, `is_required`, `sort_order`) VALUES
(4, 1, '身份证', '证件', 1, 1, 1),
(4, 1, '交通票', '机票/高铁票', 1, 1, 2),
(4, 2, '舒适衣物', '根据天气选择', 3, 1, 1),
(4, 2, '舒适鞋子', '步行舒适', 1, 1, 2),
(4, 3, '手机', '手机', 1, 1, 1),
(4, 3, '充电宝', '大容量', 1, 1, 2),
(4, 3, '耳机', '旅途听歌', 1, 0, 3),
(4, 4, '洗漱用品', '旅行装', 1, 1, 1),
(4, 5, '常用药品', '感冒药、创可贴等', 1, 0, 1),
(4, 6, '雨伞', '晴雨两用', 1, 0, 1),
(4, 6, '背包', '日常出行背包', 1, 1, 2);

COMMIT;
