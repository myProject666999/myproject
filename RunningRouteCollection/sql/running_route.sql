CREATE DATABASE IF NOT EXISTS running_route DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE running_route;

DROP TABLE IF EXISTS `favorite`;
DROP TABLE IF EXISTS `comment`;
DROP TABLE IF EXISTS `route`;
DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    `password` VARCHAR(255) NOT NULL COMMENT '密码',
    `nickname` VARCHAR(50) COMMENT '昵称',
    `avatar` VARCHAR(255) COMMENT '头像URL',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE `route` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '路线ID',
    `user_id` BIGINT NOT NULL COMMENT '创建者用户ID',
    `name` VARCHAR(100) NOT NULL COMMENT '路线名称',
    `description` TEXT COMMENT '路线描述',
    `distance` DECIMAL(10,2) NOT NULL COMMENT '距离(公里)',
    `difficulty` TINYINT NOT NULL COMMENT '难度等级(1-5)',
    `start_point` VARCHAR(100) NOT NULL COMMENT '起点坐标(lng,lat)',
    `end_point` VARCHAR(100) NOT NULL COMMENT '终点坐标(lng,lat)',
    `polyline` LONGTEXT NOT NULL COMMENT '路线折线点集合(JSON格式)',
    `cover_image` VARCHAR(255) COMMENT '路线封面图',
    `view_count` INT DEFAULT 0 COMMENT '浏览次数',
    `favorite_count` INT DEFAULT 0 COMMENT '收藏次数',
    `comment_count` INT DEFAULT 0 COMMENT '评论次数',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (`user_id`),
    INDEX idx_difficulty (`difficulty`),
    INDEX idx_create_time (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='跑步路线表';

CREATE TABLE `comment` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '评论ID',
    `route_id` BIGINT NOT NULL COMMENT '路线ID',
    `user_id` BIGINT NOT NULL COMMENT '评论用户ID',
    `content` TEXT NOT NULL COMMENT '评论内容',
    `rating` TINYINT COMMENT '评分(1-5)',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_route_id (`route_id`),
    INDEX idx_user_id (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评论表';

CREATE TABLE `favorite` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '收藏ID',
    `route_id` BIGINT NOT NULL COMMENT '路线ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
    UNIQUE KEY uk_route_user (`route_id`, `user_id`),
    INDEX idx_user_id (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收藏表';

INSERT INTO `user` (`username`, `password`, `nickname`) VALUES
('runner1', '123456', '跑者小明'),
('runner2', '123456', '跑者小红'),
('runner3', '123456', '跑者小刚');

INSERT INTO `route` (`user_id`, `name`, `description`, `distance`, `difficulty`, `start_point`, `end_point`, `polyline`, `view_count`, `favorite_count`, `comment_count`) VALUES
(1, '朝阳公园晨跑路线', '环绕朝阳公园的经典跑步路线，风景优美，路面平整', 5.20, 2, '116.480286,39.935889', '116.480286,39.935889', '[{"lng":116.480286,"lat":39.935889},{"lng":116.485432,"lat":39.936234},{"lng":116.488921,"lat":39.933456},{"lng":116.485678,"lat":39.930123},{"lng":116.480286,"lat":39.935889}]', 156, 32, 12),
(2, '奥林匹克公园环线', '奥林匹克公园专业跑步道，适合长距离训练', 10.50, 3, '116.396789,40.005678', '116.396789,40.005678', '[{"lng":116.396789,"lat":40.005678},{"lng":116.402345,"lat":40.006789},{"lng":116.408901,"lat":40.003456},{"lng":116.405678,"lat":39.998765},{"lng":116.396789,"lat":40.005678}]', 289, 67, 28),
(3, '颐和园夜跑路线', '颐和园周边夜景路线，灯光充足，安全系数高', 7.80, 2, '116.278901,39.991234', '116.278901,39.991234', '[{"lng":116.278901,"lat":39.991234},{"lng":116.285678,"lat":39.993456},{"lng":116.289012,"lat":39.989012},{"lng":116.282345,"lat":39.986789},{"lng":116.278901,"lat":39.991234}]', 198, 45, 18);

INSERT INTO `comment` (`route_id`, `user_id`, `content`, `rating`) VALUES
(1, 2, '这条路线非常适合晨跑，空气清新，环境安静', 5),
(1, 3, '跑过几次，路面很舒服，推荐给新手', 4),
(2, 1, '专业跑道就是不一样，10公里跑下来很有成就感', 5),
(2, 3, '距离刚好适合周末拉练', 4),
(3, 1, '夜景很美，夜跑的好去处', 5);

INSERT INTO `favorite` (`route_id`, `user_id`) VALUES
(1, 2), (1, 3), (2, 1), (2, 3), (3, 1), (3, 2);
