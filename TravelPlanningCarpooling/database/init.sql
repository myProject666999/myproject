CREATE DATABASE IF NOT EXISTS carpooling CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE carpooling;

DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `location_shares`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `ride_requests`;
DROP TABLE IF EXISTS `rides`;
DROP TABLE IF EXISTS `vehicles`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `phone` VARCHAR(20) NOT NULL COMMENT '手机号',
  `password` VARCHAR(255) NOT NULL COMMENT '密码',
  `nickname` VARCHAR(50) NOT NULL COMMENT '昵称',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像',
  `gender` TINYINT DEFAULT 0 COMMENT '性别 0未知 1男 2女',
  `credit_score` INT DEFAULT 100 COMMENT '信用分',
  `total_rides` INT DEFAULT 0 COMMENT '总行程数',
  `completed_rides` INT DEFAULT 0 COMMENT '完成行程数',
  `role` TINYINT DEFAULT 1 COMMENT '角色 1乘客 2车主 3两者',
  `real_name` VARCHAR(50) DEFAULT NULL COMMENT '真实姓名',
  `id_card` VARCHAR(20) DEFAULT NULL COMMENT '身份证号',
  `is_verified` TINYINT DEFAULT 0 COMMENT '是否实名认证 0否 1是',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_phone` (`phone`),
  KEY `idx_credit` (`credit_score`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE `vehicles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `owner_id` BIGINT UNSIGNED NOT NULL COMMENT '车主ID',
  `plate_number` VARCHAR(20) NOT NULL COMMENT '车牌号',
  `brand` VARCHAR(50) NOT NULL COMMENT '品牌',
  `model` VARCHAR(50) NOT NULL COMMENT '型号',
  `color` VARCHAR(20) DEFAULT NULL COMMENT '颜色',
  `seats` INT NOT NULL DEFAULT 4 COMMENT '座位数',
  `vehicle_photo` VARCHAR(255) DEFAULT NULL COMMENT '车辆照片',
  `is_verified` TINYINT DEFAULT 0 COMMENT '是否认证 0否 1是',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_plate` (`plate_number`),
  KEY `idx_owner` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='车辆表';

CREATE TABLE `rides` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `owner_id` BIGINT UNSIGNED NOT NULL COMMENT '车主ID',
  `vehicle_id` BIGINT UNSIGNED NOT NULL COMMENT '车辆ID',
  `departure` VARCHAR(100) NOT NULL COMMENT '出发地',
  `departure_lng` DECIMAL(10,7) NOT NULL COMMENT '出发地经度',
  `departure_lat` DECIMAL(10,7) NOT NULL COMMENT '出发地纬度',
  `destination` VARCHAR(100) NOT NULL COMMENT '目的地',
  `destination_lng` DECIMAL(10,7) NOT NULL COMMENT '目的地经度',
  `destination_lat` DECIMAL(10,7) NOT NULL COMMENT '目的地纬度',
  `departure_time` DATETIME NOT NULL COMMENT '出发时间',
  `available_seats` INT NOT NULL COMMENT '可载人数',
  `locked_seats` INT DEFAULT 0 COMMENT '已锁定座位数',
  `price_per_person` DECIMAL(10,2) NOT NULL COMMENT '分摊费用/人',
  `description` VARCHAR(500) DEFAULT NULL COMMENT '行程描述',
  `status` TINYINT DEFAULT 1 COMMENT '状态 1招募中 2已出发 3已完成 4已取消',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_owner` (`owner_id`),
  KEY `idx_departure_time` (`departure_time`),
  KEY `idx_status` (`status`),
  KEY `idx_departure_loc` (`departure_lng`, `departure_lat`),
  KEY `idx_dest_loc` (`destination_lng`, `destination_lat`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='行程表';

CREATE TABLE `ride_requests` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `passenger_id` BIGINT UNSIGNED NOT NULL COMMENT '乘客ID',
  `departure` VARCHAR(100) NOT NULL COMMENT '出发地',
  `departure_lng` DECIMAL(10,7) NOT NULL COMMENT '出发地经度',
  `departure_lat` DECIMAL(10,7) NOT NULL COMMENT '出发地纬度',
  `destination` VARCHAR(100) NOT NULL COMMENT '目的地',
  `destination_lng` DECIMAL(10,7) NOT NULL COMMENT '目的地经度',
  `destination_lat` DECIMAL(10,7) NOT NULL COMMENT '目的地纬度',
  `earliest_time` DATETIME NOT NULL COMMENT '最早出发时间',
  `latest_time` DATETIME NOT NULL COMMENT '最晚出发时间',
  `passengers_count` INT NOT NULL DEFAULT 1 COMMENT '乘车人数',
  `max_price` DECIMAL(10,2) DEFAULT NULL COMMENT '可接受最高价格',
  `description` VARCHAR(500) DEFAULT NULL COMMENT '需求描述',
  `status` TINYINT DEFAULT 1 COMMENT '状态 1待匹配 2已匹配 3已取消 4已完成',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_passenger` (`passenger_id`),
  KEY `idx_time` (`earliest_time`, `latest_time`),
  KEY `idx_status` (`status`),
  KEY `idx_departure_loc` (`departure_lng`, `departure_lat`),
  KEY `idx_dest_loc` (`destination_lng`, `destination_lat`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='拼车需求表';

CREATE TABLE `orders` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ride_id` BIGINT UNSIGNED NOT NULL COMMENT '行程ID',
  `request_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '需求ID',
  `owner_id` BIGINT UNSIGNED NOT NULL COMMENT '车主ID',
  `passenger_id` BIGINT UNSIGNED NOT NULL COMMENT '乘客ID',
  `passengers_count` INT NOT NULL DEFAULT 1 COMMENT '乘车人数',
  `price` DECIMAL(10,2) NOT NULL COMMENT '订单金额',
  `pickup_address` VARCHAR(200) DEFAULT NULL COMMENT '上车地点',
  `dropoff_address` VARCHAR(200) DEFAULT NULL COMMENT '下车地点',
  `status` TINYINT DEFAULT 1 COMMENT '状态 1待确认 2已确认 3已出发 4已完成 5已取消 6已拒绝',
  `owner_confirm_time` DATETIME DEFAULT NULL COMMENT '车主确认时间',
  `start_time` DATETIME DEFAULT NULL COMMENT '出发时间',
  `complete_time` DATETIME DEFAULT NULL COMMENT '完成时间',
  `cancel_time` DATETIME DEFAULT NULL COMMENT '取消时间',
  `cancel_reason` VARCHAR(500) DEFAULT NULL COMMENT '取消原因',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ride` (`ride_id`),
  KEY `idx_owner` (`owner_id`),
  KEY `idx_passenger` (`passenger_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

CREATE TABLE `location_shares` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ride_id` BIGINT UNSIGNED NOT NULL COMMENT '行程ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `lng` DECIMAL(10,7) NOT NULL COMMENT '经度',
  `lat` DECIMAL(10,7) NOT NULL COMMENT '纬度',
  `speed` DECIMAL(10,2) DEFAULT NULL COMMENT '速度 km/h',
  `heading` DECIMAL(5,2) DEFAULT NULL COMMENT '方向角 0-360',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ride` (`ride_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='位置共享表';

CREATE TABLE `reviews` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL COMMENT '订单ID',
  `ride_id` BIGINT UNSIGNED NOT NULL COMMENT '行程ID',
  `reviewer_id` BIGINT UNSIGNED NOT NULL COMMENT '评价人ID',
  `reviewee_id` BIGINT UNSIGNED NOT NULL COMMENT '被评价人ID',
  `rating` INT NOT NULL COMMENT '评分 1-5',
  `content` VARCHAR(500) DEFAULT NULL COMMENT '评价内容',
  `tags` VARCHAR(200) DEFAULT NULL COMMENT '标签 逗号分隔',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_reviewer` (`order_id`, `reviewer_id`),
  KEY `idx_reviewee` (`reviewee_id`),
  KEY `idx_rating` (`rating`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评价表';

INSERT INTO `users` (`phone`, `password`, `nickname`, `credit_score`, `role`, `is_verified`) VALUES
('13800138001', '$2a$10$MYqfd2qmS/L.X6gjD5s/X.hcWdW0rgFEYh9ppFTn89zwizfWu3Lpe', '张三', 95, 3, 1),
('13800138002', '$2a$10$MYqfd2qmS/L.X6gjD5s/X.hcWdW0rgFEYh9ppFTn89zwizfWu3Lpe', '李四', 98, 3, 1),
('13800138003', '$2a$10$MYqfd2qmS/L.X6gjD5s/X.hcWdW0rgFEYh9ppFTn89zwizfWu3Lpe', '王五', 88, 1, 0),
('13800138004', '$2a$10$MYqfd2qmS/L.X6gjD5s/X.hcWdW0rgFEYh9ppFTn89zwizfWu3Lpe', '赵六', 92, 2, 1),
('13800138005', '$2a$10$MYqfd2qmS/L.X6gjD5s/X.hcWdW0rgFEYh9ppFTn89zwizfWu3Lpe', '钱七', 90, 3, 0);

INSERT INTO `vehicles` (`owner_id`, `plate_number`, `brand`, `model`, `color`, `seats`, `is_verified`) VALUES
(1, '京A12345', '丰田', '凯美瑞', '黑色', 5, 1),
(4, '京B67890', '本田', '雅阁', '白色', 5, 1),
(2, '京C11111', '大众', '帕萨特', '银色', 5, 1),
(1, '京D22222', '特斯拉', 'Model 3', '红色', 5, 1);

INSERT INTO `rides` (`owner_id`, `vehicle_id`, `departure`, `departure_lng`, `departure_lat`, `destination`, `destination_lng`, `destination_lat`, `departure_time`, `available_seats`, `price_per_person`, `description`, `status`) VALUES
(1, 1, '北京市朝阳区', 116.4074, 39.9042, '天津市和平区', 117.2010, 39.0842, '2026-05-28 08:00:00', 3, 80.00, '舒适轿车，可带小件行李，不吸烟', 1),
(4, 2, '北京市海淀区', 116.3057, 39.9570, '河北省石家庄市', 114.5025, 38.0428, '2026-05-29 09:00:00', 4, 120.00, '新车，空间大，可带宠物提前说', 1),
(2, 3, '上海市浦东新区', 121.5447, 31.2281, '杭州市西湖区', 120.1551, 30.2741, '2026-05-30 07:30:00', 2, 60.00, '老司机，10年驾龄，准时出发', 1),
(1, 4, '北京市通州区', 116.6569, 39.9086, '天津市滨海新区', 117.6983, 39.0269, '2026-06-01 10:00:00', 3, 70.00, '新能源车，安静舒适', 2),
(2, 3, '广州市天河区', 113.3859, 23.1291, '深圳市南山区', 113.9303, 22.5333, '2026-05-27 14:00:00', 3, 50.00, '经常跑这条线，熟悉路况', 3);

INSERT INTO `ride_requests` (`passenger_id`, `departure`, `departure_lng`, `departure_lat`, `destination`, `destination_lng`, `destination_lat`, `earliest_time`, `latest_time`, `passengers_count`, `max_price`, `description`, `status`) VALUES
(3, '北京市朝阳区国贸', 116.4609, 39.9092, '天津市南开区', 117.1513, 39.1345, '2026-05-28 07:30:00', '2026-05-28 09:00:00', 1, 100.00, '一个人，一个行李箱', 1),
(5, '北京市五道口', 116.3387, 39.9853, '河北省石家庄市正定县', 114.5647, 38.1456, '2026-05-29 08:00:00', '2026-05-29 10:00:00', 2, 150.00, '两个人，可稍微绕行接人', 1),
(3, '上海市虹桥火车站', 121.3214, 31.1945, '杭州市余杭区', 120.0123, 30.3456, '2026-05-30 07:00:00', '2026-05-30 08:00:00', 1, 80.00, '赶高铁，希望准时', 1);

INSERT INTO `orders` (`ride_id`, `request_id`, `owner_id`, `passenger_id`, `passengers_count`, `price`, `pickup_address`, `dropoff_address`, `status`, `owner_confirm_time`, `start_time`, `complete_time`) VALUES
(5, NULL, 2, 3, 1, 50.00, '广州天河城', '深圳科技园', 4, '2026-05-27 14:10:00', '2026-05-27 14:30:00', '2026-05-27 16:30:00'),
(4, NULL, 1, 5, 2, 140.00, '通州万达', '滨海高铁站', 3, '2026-06-01 09:30:00', '2026-06-01 10:00:00', NULL);

INSERT INTO `reviews` (`order_id`, `ride_id`, `reviewer_id`, `reviewee_id`, `rating`, `content`, `tags`) VALUES
(1, 5, 3, 2, 5, '车主很准时，车内干净，驾驶平稳', '准时,干净,平稳'),
(1, 5, 2, 3, 5, '乘客准时，沟通顺畅', '准时,礼貌');
