-- =============================================
-- 运动日记数据库脚本
-- =============================================

CREATE DATABASE IF NOT EXISTS `exercise_diary`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_general_ci;

USE `exercise_diary`;
SET NAMES utf8mb4;

-- ---------------------------------------------
-- 用户表
-- ---------------------------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username`    VARCHAR(50)  NOT NULL                COMMENT '用户名',
  `password`    VARCHAR(100) NOT NULL                COMMENT '密码(MD5)',
  `nickname`    VARCHAR(50)  DEFAULT NULL            COMMENT '昵称',
  `weight`      DECIMAL(5,2) DEFAULT 60.00           COMMENT '体重(kg),用于热量计算',
  `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB COMMENT='用户表';

-- 默认用户 admin/123456 (MD5: e10adc3949ba59abbe56e057f20f883e)
INSERT INTO `user` (`id`, `username`, `password`, `nickname`, `weight`)
VALUES (1, 'admin', 'e10adc3949ba59abbe56e057f20f883e', '运动达人', 65.00);

-- ---------------------------------------------
-- 运动类型表(含 MET 值)
--   MET = Metabolic Equivalent of Task, 1 MET ≈ 静息代谢率
--   消耗热量 = MET * 体重(kg) * 时间(h)
-- ---------------------------------------------
DROP TABLE IF EXISTS `exercise_type`;
CREATE TABLE `exercise_type` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '类型ID',
  `name`        VARCHAR(50)  NOT NULL                COMMENT '类型名称',
  `category`    VARCHAR(30)  NOT NULL                COMMENT '分类: 跑步/健身/瑜伽/其他',
  `met`         DECIMAL(4,2) NOT NULL                COMMENT 'MET 值',
  `icon`        VARCHAR(50)  DEFAULT NULL            COMMENT '图标标识',
  `description` VARCHAR(200) DEFAULT NULL            COMMENT '描述',
  `sort`        INT          DEFAULT 0               COMMENT '排序',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name` (`name`)
) ENGINE=InnoDB COMMENT='运动类型表';

INSERT INTO `exercise_type` (`name`, `category`, `met`, `icon`, `description`, `sort`) VALUES
('慢跑',     '跑步',  7.00, '🏃', '速度约 8km/h 的慢跑',              1),
('快跑',     '跑步', 11.00, '🏃', '速度约 12km/h 的快跑',             2),
('散步',     '跑步',  3.50, '🚶', '悠闲散步',                          3),
('力量训练', '健身',  6.00, '🏋️', '中等强度力量训练',                 4),
('HIIT',    '健身',  8.00, '💪', '高强度间歇训练',                    5),
('骑行',     '健身',  7.50, '🚴', '户外或动感单车',                    6),
('游泳',     '健身',  8.00, '🏊', '自由泳中等强度',                    7),
('阴瑜伽',   '瑜伽',  2.50, '🧘', '舒缓拉伸为主',                      8),
('流瑜伽',   '瑜伽',  4.00, '🧘', '连贯的动作序列',                    9),
('阿斯汤加', '瑜伽',  5.00, '🧘', '高强度瑜伽练习',                   10),
('羽毛球',   '其他',  5.50, '🏸', '休闲双打',                         11),
('篮球',     '其他',  8.00, '🏀', '半场或全场比赛',                   12);

-- ---------------------------------------------
-- 运动记录表
-- ---------------------------------------------
DROP TABLE IF EXISTS `exercise_record`;
CREATE TABLE `exercise_record` (
  `id`           BIGINT        NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `user_id`      BIGINT        NOT NULL                COMMENT '用户ID',
  `exercise_type_id` BIGINT    NOT NULL                COMMENT '运动类型ID',
  `duration`     INT           NOT NULL                COMMENT '时长(分钟)',
  `intensity`    TINYINT       DEFAULT 3               COMMENT '强度: 1-轻松 2-适中 3-较强 4-剧烈',
  `calories`     DECIMAL(8,2)  NOT NULL                COMMENT '消耗热量(kcal)',
  `distance`     DECIMAL(6,2)  DEFAULT NULL            COMMENT '距离(km, 可选)',
  `remark`       VARCHAR(200)  DEFAULT NULL            COMMENT '备注',
  `exercise_date` DATE         NOT NULL                COMMENT '运动日期',
  `create_time`  DATETIME      DEFAULT CURRENT_TIMESTAMP,
  `update_time`  DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_date` (`user_id`, `exercise_date`),
  KEY `idx_user_type` (`user_id`, `exercise_type_id`)
) ENGINE=InnoDB COMMENT='运动记录表';

-- ---------------------------------------------
-- PR 记录表(Personal Record)
-- ---------------------------------------------
DROP TABLE IF EXISTS `pr_record`;
CREATE TABLE `pr_record` (
  `id`              BIGINT       NOT NULL AUTO_INCREMENT COMMENT 'PR ID',
  `user_id`         BIGINT       NOT NULL                COMMENT '用户ID',
  `exercise_type_id` BIGINT      NOT NULL                COMMENT '运动类型ID',
  `pr_type`         VARCHAR(30)  NOT NULL                COMMENT 'PR类型: 最远距离/最长时长/最高强度/最大热量',
  `pr_value`        DECIMAL(10,2) NOT NULL               COMMENT 'PR数值',
  `pr_unit`         VARCHAR(20)  DEFAULT NULL            COMMENT '单位',
  `achieved_date`   DATE         NOT NULL                COMMENT '达成日期',
  `remark`          VARCHAR(200) DEFAULT NULL            COMMENT '备注',
  `create_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_type` (`user_id`, `exercise_type_id`)
) ENGINE=InnoDB COMMENT='PR记录表';

-- 示例数据(可选)
INSERT INTO `exercise_record`
  (`user_id`, `exercise_type_id`, `duration`, `intensity`, `calories`, `distance`, `remark`, `exercise_date`) VALUES
(1, 1, 30, 2, 7.00 * 65.00 * 30 / 60, 4.00, '晨跑感觉不错', CURDATE() - INTERVAL 2 DAY),
(1, 4, 45, 3, 6.00 * 65.00 * 45 / 60, NULL, '上肢力量训练',  CURDATE() - INTERVAL 1 DAY),
(1, 9, 60, 2, 4.00 * 65.00 * 60 / 60, NULL, '晨间流瑜伽',  CURDATE());

INSERT INTO `pr_record`
  (`user_id`, `exercise_type_id`, `pr_type`, `pr_value`, `pr_unit`, `achieved_date`, `remark`) VALUES
(1, 1, '最远距离', 10.00, 'km',  '2026-04-10', '半程马拉松训练'),
(1, 1, '最长时长', 75.00, '分钟','2026-04-10', NULL),
(1, 4, '最大热量', 350.00, 'kcal','2026-03-28', '高强度训练日');
