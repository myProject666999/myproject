-- 用户表
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    `password` VARCHAR(100) NOT NULL COMMENT '密码',
    `steam_id` VARCHAR(50) DEFAULT NULL COMMENT 'Steam ID',
    `nickname` VARCHAR(50) DEFAULT NULL COMMENT '昵称',
    `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 游戏表
DROP TABLE IF EXISTS `game`;
CREATE TABLE `game` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '游戏ID',
    `steam_app_id` INT DEFAULT NULL COMMENT 'Steam App ID',
    `name` VARCHAR(100) NOT NULL COMMENT '游戏名称',
    `cover_image` VARCHAR(255) DEFAULT NULL COMMENT '封面图片URL',
    `description` TEXT COMMENT '游戏描述',
    `genre` VARCHAR(50) DEFAULT NULL COMMENT '游戏类型',
    `developer` VARCHAR(100) DEFAULT NULL COMMENT '开发商',
    `publisher` VARCHAR(100) DEFAULT NULL COMMENT '发行商',
    `release_date` DATE DEFAULT NULL COMMENT '发行日期',
    `price` DECIMAL(10,2) DEFAULT 0.00 COMMENT '购买价格',
    `platform` VARCHAR(20) DEFAULT 'PC' COMMENT '平台',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='游戏表';

-- 用户游戏库存表
DROP TABLE IF EXISTS `user_game`;
CREATE TABLE `user_game` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '库存ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `game_id` BIGINT NOT NULL COMMENT '游戏ID',
    `total_play_time` INT DEFAULT 0 COMMENT '总游玩时长（分钟）',
    `last_played_at` DATETIME DEFAULT NULL COMMENT '上次游玩时间',
    `completion_status` TINYINT DEFAULT 0 COMMENT '通关状态：0-未开始，1-进行中，2-已通关，3-已放弃',
    `completion_percentage` INT DEFAULT 0 COMMENT '完成百分比',
    `purchase_date` DATE DEFAULT NULL COMMENT '购买日期',
    `is_favorite` TINYINT DEFAULT 0 COMMENT '是否收藏：0-否，1-是',
    `notes` TEXT COMMENT '个人笔记',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_game_id` (`game_id`),
    UNIQUE KEY `uk_user_game` (`user_id`, `game_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户游戏库存表';

-- 游玩记录表
DROP TABLE IF EXISTS `play_session`;
CREATE TABLE `play_session` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
    `user_game_id` BIGINT NOT NULL COMMENT '用户游戏ID',
    `start_time` DATETIME NOT NULL COMMENT '开始时间',
    `end_time` DATETIME DEFAULT NULL COMMENT '结束时间',
    `duration` INT DEFAULT 0 COMMENT '持续时长（分钟）',
    `notes` VARCHAR(500) DEFAULT NULL COMMENT '备注',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX `idx_user_game_id` (`user_game_id`),
    INDEX `idx_start_time` (`start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='游玩记录表';

-- 成就表
DROP TABLE IF EXISTS `achievement`;
CREATE TABLE `achievement` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '成就ID',
    `game_id` BIGINT NOT NULL COMMENT '游戏ID',
    `steam_api_name` VARCHAR(100) DEFAULT NULL COMMENT 'Steam成就API名称',
    `name` VARCHAR(100) NOT NULL COMMENT '成就名称',
    `description` VARCHAR(500) DEFAULT NULL COMMENT '成就描述',
    `icon` VARCHAR(255) DEFAULT NULL COMMENT '成就图标URL',
    `rarity` DECIMAL(5,2) DEFAULT NULL COMMENT '稀有度百分比',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX `idx_game_id` (`game_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成就表';

-- 用户成就表
DROP TABLE IF EXISTS `user_achievement`;
CREATE TABLE `user_achievement` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `achievement_id` BIGINT NOT NULL COMMENT '成就ID',
    `unlocked_at` DATETIME DEFAULT NULL COMMENT '解锁时间',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_achievement_id` (`achievement_id`),
    UNIQUE KEY `uk_user_achievement` (`user_id`, `achievement_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户成就表';

-- 同步记录表
DROP TABLE IF EXISTS `sync_log`;
CREATE TABLE `sync_log` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '同步ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `sync_type` VARCHAR(20) NOT NULL COMMENT '同步类型：MANUAL-手动，STEAM_API-Steam API',
    `status` TINYINT NOT NULL COMMENT '状态：0-失败，1-成功',
    `games_synced` INT DEFAULT 0 COMMENT '同步游戏数量',
    `achievements_synced` INT DEFAULT 0 COMMENT '同步成就数量',
    `play_time_synced` INT DEFAULT 0 COMMENT '同步时长（分钟）',
    `error_message` TEXT DEFAULT NULL COMMENT '错误信息',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '同步时间',
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='同步记录表';

-- 插入初始测试数据
INSERT INTO `user` (`username`, `password`, `nickname`) VALUES 
('admin', 'admin123', '管理员'),
('player1', '123456', '玩家一号');

INSERT INTO `game` (`name`, `genre`, `developer`, `publisher`, `price`, `platform`, `description`) VALUES 
('艾尔登法环', '动作RPG', 'FromSoftware', 'FromSoftware', 298.00, 'PC', '《艾尔登法环》是一款由FromSoftware开发的动作角色扮演游戏。'),
('赛博朋克2077', 'RPG', 'CD Projekt Red', 'CD Projekt Red', 298.00, 'PC', '《赛博朋克2077》是一款开放世界动作冒险游戏。'),
('原神', 'RPG', '米哈游', '米哈游', 0.00, 'PC', '《原神》是一款开放世界冒险游戏。'),
('只狼：影逝二度', '动作', 'FromSoftware', 'Activision', 268.00, 'PC', '《只狼：影逝二度》是一款动作冒险游戏。');

INSERT INTO `user_game` (`user_id`, `game_id`, `total_play_time`, `completion_status`, `completion_percentage`, `is_favorite`) VALUES 
(1, 1, 1250, 2, 100, 1),
(1, 2, 480, 1, 60, 1),
(1, 3, 3600, 1, 85, 0),
(2, 1, 120, 0, 0, 1),
(2, 4, 720, 2, 100, 1);

INSERT INTO `play_session` (`user_game_id`, `start_time`, `end_time`, `duration`) VALUES 
(1, '2026-05-01 19:00:00', '2026-05-01 21:30:00', 150),
(1, '2026-05-03 20:00:00', '2026-05-03 22:00:00', 120),
(2, '2026-05-05 18:00:00', '2026-05-05 20:00:00', 120),
(3, '2026-05-10 14:00:00', '2026-05-10 18:00:00', 240);

INSERT INTO `achievement` (`game_id`, `name`, `description`, `rarity`) VALUES 
(1, '艾尔登之王', '成为艾尔登之王', 2.5),
(1, '所有追忆', '获得所有追忆', 1.2),
(2, '城市传奇', '成为夜之城的传奇', 5.0),
(4, '忍者大师', '只狼通关', 8.5);

INSERT INTO `user_achievement` (`user_id`, `achievement_id`, `unlocked_at`) VALUES 
(1, 1, '2026-04-15 20:30:00'),
(1, 4, '2026-03-20 15:00:00'),
(2, 4, '2026-05-10 18:00:00');
