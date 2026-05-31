-- =============================================
-- 会议室预订系统数据库脚本
-- Database: MySQL 5.7+
-- =============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS meeting_room_reservation DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_general_ci;

USE meeting_room_reservation;

-- =============================================
-- 用户表
-- =============================================
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    `username` VARCHAR(50) NOT NULL COMMENT '用户名',
    `password` VARCHAR(100) NOT NULL COMMENT '密码',
    `real_name` VARCHAR(50) NOT NULL COMMENT '真实姓名',
    `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
    `role` TINYINT NOT NULL DEFAULT 2 COMMENT '角色：1-管理员，2-普通用户',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='用户表';

-- =============================================
-- 会议室表
-- =============================================
DROP TABLE IF EXISTS `meeting_room`;
CREATE TABLE `meeting_room` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '会议室ID',
    `name` VARCHAR(100) NOT NULL COMMENT '会议室名称',
    `code` VARCHAR(50) NOT NULL COMMENT '会议室编号',
    `location` VARCHAR(200) NOT NULL COMMENT '位置',
    `capacity` INT NOT NULL COMMENT '容纳人数',
    `description` TEXT DEFAULT NULL COMMENT '描述',
    `equipment` VARCHAR(500) DEFAULT NULL COMMENT '设备配置',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='会议室表';

-- =============================================
-- 预订表
-- =============================================
DROP TABLE IF EXISTS `reservation`;
CREATE TABLE `reservation` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '预订ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `room_id` BIGINT NOT NULL COMMENT '会议室ID',
    `title` VARCHAR(200) NOT NULL COMMENT '会议主题',
    `start_time` DATETIME NOT NULL COMMENT '开始时间',
    `end_time` DATETIME NOT NULL COMMENT '结束时间',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-已取消，1-已预订，2-已完成',
    `attendees` INT DEFAULT NULL COMMENT '参会人数',
    `description` TEXT DEFAULT NULL COMMENT '会议说明',
    `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
    `cancel_reason` VARCHAR(500) DEFAULT NULL COMMENT '取消原因',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_room_id` (`room_id`),
    KEY `idx_start_time` (`start_time`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='预订表';

-- =============================================
-- 初始数据
-- =============================================

-- 初始用户（密码：123456，MD5加密：e10adc3949ba59abbe56e057f20f883e）
INSERT INTO `user` (`username`, `password`, `real_name`, `email`, `phone`, `role`, `status`) VALUES
('admin', 'e10adc3949ba59abbe56e057f20f883e', '系统管理员', 'admin@example.com', '13800000000', 1, 1),
('zhangsan', 'e10adc3949ba59abbe56e057f20f883e', '张三', 'zhangsan@example.com', '13800000001', 2, 1),
('lisi', 'e10adc3949ba59abbe56e057f20f883e', '李四', 'lisi@example.com', '13800000002', 2, 1),
('wangwu', 'e10adc3949ba59abbe56e057f20f883e', '王五', 'wangwu@example.com', '13800000003', 2, 1);

-- 初始会议室
INSERT INTO `meeting_room` (`name`, `code`, `location`, `capacity`, `description`, `equipment`, `status`) VALUES
('大会议室', 'MR001', '3楼301', 20, '大型会议室，适合部门级会议', '投影仪,白板,视频会议,音响', 1),
('中会议室', 'MR002', '3楼302', 10, '中型会议室，适合团队会议', '投影仪,白板,视频会议', 1),
('小会议室', 'MR003', '3楼303', 6, '小型会议室，适合小组讨论', '电视,白板', 1),
('培训室', 'MR004', '4楼401', 50, '大型培训室，适合培训和演讲', '投影仪,音响,麦克风,白板', 1),
('VIP会议室', 'MR005', '5楼501', 15, 'VIP会议室，适合重要客户会议', '投影仪,视频会议,茶歇服务,白板', 1);
