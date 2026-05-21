CREATE DATABASE IF NOT EXISTS restaurant_evaluation DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE restaurant_evaluation;

CREATE TABLE `user` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    `username` VARCHAR(50) NOT NULL COMMENT '用户名',
    `password` VARCHAR(255) NOT NULL COMMENT '密码',
    `nickname` VARCHAR(50) NOT NULL COMMENT '昵称',
    `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

CREATE TABLE `friend_relation` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `friend_id` BIGINT NOT NULL COMMENT '好友ID',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-已添加, 0-已删除',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_friend` (`user_id`, `friend_id`),
    KEY `idx_friend_id` (`friend_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='好友关系表';

CREATE TABLE `restaurant` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '餐厅ID',
    `name` VARCHAR(100) NOT NULL COMMENT '餐厅名称',
    `address` VARCHAR(255) DEFAULT NULL COMMENT '地址',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '电话',
    `cuisine_type` VARCHAR(50) DEFAULT NULL COMMENT '菜系类型',
    `price_range` VARCHAR(20) DEFAULT NULL COMMENT '价格区间',
    `cover_image` VARCHAR(255) DEFAULT NULL COMMENT '封面图片',
    `avg_taste_score` DECIMAL(3,1) DEFAULT 0.0 COMMENT '平均口味评分',
    `avg_env_score` DECIMAL(3,1) DEFAULT 0.0 COMMENT '平均环境评分',
    `avg_service_score` DECIMAL(3,1) DEFAULT 0.0 COMMENT '平均服务评分',
    `avg_overall_score` DECIMAL(3,1) DEFAULT 0.0 COMMENT '综合平均分',
    `review_count` INT NOT NULL DEFAULT 0 COMMENT '评价数量',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_name` (`name`),
    KEY `idx_cuisine_type` (`cuisine_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='餐厅表';

CREATE TABLE `restaurant_review` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '评价ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `restaurant_id` BIGINT NOT NULL COMMENT '餐厅ID',
    `taste_score` TINYINT NOT NULL COMMENT '口味评分: 1-5',
    `env_score` TINYINT NOT NULL COMMENT '环境评分: 1-5',
    `service_score` TINYINT NOT NULL COMMENT '服务评分: 1-5',
    `overall_score` DECIMAL(3,1) NOT NULL COMMENT '综合评分',
    `repurchase_willingness` TINYINT NOT NULL DEFAULT 0 COMMENT '复购意愿: 0-不确定, 1-不会, 2-可能会, 3-一定会',
    `content` TEXT DEFAULT NULL COMMENT '评价内容',
    `visit_date` DATE DEFAULT NULL COMMENT '用餐日期',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_restaurant` (`user_id`, `restaurant_id`),
    KEY `idx_restaurant_id` (`restaurant_id`),
    KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='餐厅评价表';

CREATE TABLE `recommended_dish` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `review_id` BIGINT NOT NULL COMMENT '评价ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `restaurant_id` BIGINT NOT NULL COMMENT '餐厅ID',
    `dish_name` VARCHAR(100) NOT NULL COMMENT '菜品名称',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_review_id` (`review_id`),
    KEY `idx_restaurant_id` (`restaurant_id`),
    KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='推荐菜表';

INSERT INTO `user` (`username`, `password`, `nickname`) VALUES
('zhangsan', '123456', '张三'),
('lisi', '123456', '李四'),
('wangwu', '123456', '王五');

INSERT INTO `friend_relation` (`user_id`, `friend_id`) VALUES
(1, 2), (2, 1),
(1, 3), (3, 1),
(2, 3), (3, 2);

INSERT INTO `restaurant` (`name`, `address`, `phone`, `cuisine_type`, `price_range`) VALUES
('海底捞火锅', '北京市朝阳区建国路88号', '010-12345678', '火锅', '¥100-200'),
('外婆家', '北京市海淀区中关村大街1号', '010-87654321', '江浙菜', '¥50-100'),
('西贝莜面村', '北京市西城区西单北大街100号', '010-11112222', '西北菜', '¥80-150');

INSERT INTO `restaurant_review` (`user_id`, `restaurant_id`, `taste_score`, `env_score`, `service_score`, `overall_score`, `repurchase_willingness`, `content`, `visit_date`) VALUES
(1, 1, 5, 4, 5, 4.7, 3, '服务真的没得说，味道也很棒！', '2024-01-15'),
(2, 1, 4, 5, 5, 4.7, 3, '环境很好，服务一流', '2024-01-20'),
(1, 2, 4, 3, 4, 3.7, 2, '性价比不错，适合朋友聚餐', '2024-02-01'),
(3, 2, 5, 4, 3, 4.0, 2, '味道很地道', '2024-02-05'),
(2, 3, 4, 4, 4, 4.0, 3, '西北风味很正宗', '2024-02-10'),
(3, 3, 5, 3, 4, 4.0, 2, '肉夹馍特别好吃', '2024-02-12');

INSERT INTO `recommended_dish` (`review_id`, `user_id`, `restaurant_id`, `dish_name`) VALUES
(1, 1, 1, '番茄锅底'),
(1, 1, 1, '毛肚'),
(2, 2, 1, '虾滑'),
(3, 1, 2, '红烧肉'),
(4, 3, 2, '东坡肉'),
(5, 2, 3, '莜面'),
(6, 3, 3, '肉夹馍');

UPDATE `restaurant` r SET
    `avg_taste_score` = (SELECT AVG(taste_score) FROM `restaurant_review` WHERE restaurant_id = r.id),
    `avg_env_score` = (SELECT AVG(env_score) FROM `restaurant_review` WHERE restaurant_id = r.id),
    `avg_service_score` = (SELECT AVG(service_score) FROM `restaurant_review` WHERE restaurant_id = r.id),
    `avg_overall_score` = (SELECT AVG(overall_score) FROM `restaurant_review` WHERE restaurant_id = r.id),
    `review_count` = (SELECT COUNT(*) FROM `restaurant_review` WHERE restaurant_id = r.id);
