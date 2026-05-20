CREATE DATABASE IF NOT EXISTS food_checkin DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE food_checkin;

DROP TABLE IF EXISTS `photo`;
DROP TABLE IF EXISTS `checkin_dish`;
DROP TABLE IF EXISTS `checkin`;
DROP TABLE IF EXISTS `dish`;
DROP TABLE IF EXISTS `restaurant`;

CREATE TABLE `restaurant` (
  `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL COMMENT '餐厅名称',
  `address` VARCHAR(255) NOT NULL COMMENT '详细地址',
  `latitude` DECIMAL(10, 7) NOT NULL COMMENT '纬度',
  `longitude` DECIMAL(10, 7) NOT NULL COMMENT '经度',
  `phone` VARCHAR(20) COMMENT '联系电话',
  `cuisine_type` VARCHAR(50) COMMENT '菜系类型',
  `avg_price` DECIMAL(10, 2) COMMENT '人均价格',
  `description` TEXT COMMENT '餐厅描述',
  `overall_rating` DECIMAL(3, 2) DEFAULT 0 COMMENT '综合评分',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_name` (`name`),
  INDEX `idx_location` (`latitude`, `longitude`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='餐厅表';

CREATE TABLE `dish` (
  `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `restaurant_id` BIGINT NOT NULL COMMENT '所属餐厅ID',
  `name` VARCHAR(100) NOT NULL COMMENT '菜品名称',
  `price` DECIMAL(10, 2) COMMENT '菜品价格',
  `description` TEXT COMMENT '菜品描述',
  `avg_rating` DECIMAL(3, 2) DEFAULT 0 COMMENT '平均评分',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`restaurant_id`) REFERENCES `restaurant`(`id`) ON DELETE CASCADE,
  INDEX `idx_restaurant` (`restaurant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜品表';

CREATE TABLE `checkin` (
  `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `restaurant_id` BIGINT NOT NULL COMMENT '餐厅ID',
  `checkin_date` DATE NOT NULL COMMENT '打卡日期',
  `meal_type` VARCHAR(20) COMMENT '餐次（早餐/午餐/晚餐/夜宵）',
  `total_amount` DECIMAL(10, 2) COMMENT '消费金额',
  `overall_rating` DECIMAL(3, 2) NOT NULL COMMENT '本次整体评分',
  `comment` TEXT COMMENT '打卡评价',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`restaurant_id`) REFERENCES `restaurant`(`id`) ON DELETE CASCADE,
  INDEX `idx_date` (`checkin_date`),
  INDEX `idx_restaurant_date` (`restaurant_id`, `checkin_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='打卡记录表';

CREATE TABLE `checkin_dish` (
  `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `checkin_id` BIGINT NOT NULL COMMENT '打卡记录ID',
  `dish_id` BIGINT NOT NULL COMMENT '菜品ID',
  `rating` DECIMAL(3, 2) NOT NULL COMMENT '菜品评分',
  `comment` VARCHAR(500) COMMENT '菜品评价',
  FOREIGN KEY (`checkin_id`) REFERENCES `checkin`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`dish_id`) REFERENCES `dish`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_checkin_dish` (`checkin_id`, `dish_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='打卡菜品关联表';

CREATE TABLE `photo` (
  `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `checkin_id` BIGINT NOT NULL COMMENT '打卡记录ID',
  `dish_id` BIGINT COMMENT '关联菜品ID（可选）',
  `photo_url` VARCHAR(500) NOT NULL COMMENT '照片URL',
  `description` VARCHAR(255) COMMENT '照片描述',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`checkin_id`) REFERENCES `checkin`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`dish_id`) REFERENCES `dish`(`id`) ON DELETE SET NULL,
  INDEX `idx_checkin` (`checkin_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='照片表';

INSERT INTO `restaurant` (`name`, `address`, `latitude`, `longitude`, `phone`, `cuisine_type`, `avg_price`, `description`, `overall_rating`) VALUES
('海底捞火锅', '北京市朝阳区建国路88号SOHO现代城1层', 39.9087, 116.4074, '010-88888888', '火锅', 150.00, '正宗四川火锅，服务周到', 4.8),
('外婆家', '北京市海淀区中关村大街1号', 39.9847, 116.3046, '010-66666666', '江浙菜', 80.00, '家常江浙菜，性价比高', 4.5),
('西贝莜面村', '北京市西城区西单北大街131号', 39.9139, 116.3741, '010-77777777', '西北菜', 100.00, '地道西北风味', 4.6);

INSERT INTO `dish` (`restaurant_id`, `name`, `price`, `description`, `avg_rating`) VALUES
(1, '番茄锅底', 48.00, '酸甜可口的番茄汤底', 4.9),
(1, '牛油麻辣锅底', 58.00, '正宗四川麻辣味', 4.8),
(1, '招牌毛肚', 68.00, '脆爽毛肚，七上八下', 4.9),
(2, '外婆红烧肉', 48.00, '肥而不腻，入口即化', 4.7),
(2, '西湖醋鱼', 68.00, '酸甜适中，鱼肉鲜嫩', 4.5),
(2, '蒜蓉西兰花', 22.00, '清淡爽口', 4.3),
(3, '莜面窝窝', 38.00, '手工制作，筋道十足', 4.6),
(3, '烤羊排', 128.00, '外焦里嫩，香气四溢', 4.8),
(3, '黄馍馍', 18.00, '粗粮制作，健康美味', 4.4);

INSERT INTO `checkin` (`restaurant_id`, `checkin_date`, `meal_type`, `total_amount`, `overall_rating`, `comment`) VALUES
(1, '2026-05-15', '晚餐', 350.00, 4.8, '服务一如既往的好，毛肚非常新鲜'),
(1, '2026-05-20', '午餐', 280.00, 4.9, '番茄锅底味道浓郁，菜品新鲜'),
(2, '2026-05-18', '午餐', 160.00, 4.5, '红烧肉很入味，性价比很高'),
(3, '2026-05-10', '晚餐', 220.00, 4.7, '羊排非常好吃，莜面窝窝很有特色');

INSERT INTO `checkin_dish` (`checkin_id`, `dish_id`, `rating`, `comment`) VALUES
(1, 1, 5.0, '番茄味很浓'),
(1, 3, 5.0, '非常脆爽'),
(2, 2, 4.8, '麻辣过瘾'),
(2, 3, 5.0, '新鲜脆嫩'),
(3, 4, 4.7, '肥而不腻'),
(3, 5, 4.5, '鱼肉鲜嫩'),
(4, 8, 4.9, '外焦里嫩'),
(4, 7, 4.6, '很有嚼劲');

INSERT INTO `photo` (`checkin_id`, `dish_id`, `photo_url`, `description`) VALUES
(1, 3, '/images/photo1.jpg', '新鲜的毛肚'),
(1, 1, '/images/photo2.jpg', '番茄锅底'),
(2, 2, '/images/photo3.jpg', '麻辣锅底'),
(3, 4, '/images/photo4.jpg', '红烧肉'),
(4, 8, '/images/photo5.jpg', '烤羊排');
