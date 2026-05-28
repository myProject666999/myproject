-- 创作者跨平台数据聚合分析台 数据库脚本
-- 创建时间: 2026-05-28

CREATE DATABASE IF NOT EXISTS creator_platform DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE creator_platform;

-- 1. 平台枚举表
DROP TABLE IF EXISTS `platform`;
CREATE TABLE `platform` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `platform_code` VARCHAR(32) NOT NULL COMMENT '平台编码: DOUYIN, BILIBILI, XIAOHONGSHU',
  `platform_name` VARCHAR(64) NOT NULL COMMENT '平台名称: 抖音, B站, 小红书',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_platform_code` (`platform_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='平台信息表';

-- 2. 创作者账号表
DROP TABLE IF EXISTS `creator_account`;
CREATE TABLE `creator_account` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `creator_id` BIGINT NOT NULL COMMENT '创作者ID',
  `platform_id` BIGINT NOT NULL COMMENT '平台ID',
  `platform_account_id` VARCHAR(128) NOT NULL COMMENT '平台账号ID',
  `platform_account_name` VARCHAR(128) NOT NULL COMMENT '平台账号名称',
  `platform_account_avatar` VARCHAR(512) DEFAULT NULL COMMENT '平台账号头像',
  `access_token` VARCHAR(512) DEFAULT NULL COMMENT '访问令牌',
  `refresh_token` VARCHAR(512) DEFAULT NULL COMMENT '刷新令牌',
  `token_expire_time` DATETIME DEFAULT NULL COMMENT '令牌过期时间',
  `bind_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '绑定时间',
  `last_sync_time` DATETIME DEFAULT NULL COMMENT '最后同步时间',
  `sync_status` TINYINT NOT NULL DEFAULT 0 COMMENT '同步状态: 0-未同步, 1-同步中, 2-同步成功, 3-同步失败',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0-解绑, 1-正常',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_creator_platform_account` (`creator_id`, `platform_id`, `platform_account_id`),
  KEY `idx_creator_id` (`creator_id`),
  KEY `idx_platform_id` (`platform_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='创作者账号绑定表';

-- 3. 创作者表
DROP TABLE IF EXISTS `creator`;
CREATE TABLE `creator` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `creator_name` VARCHAR(64) NOT NULL COMMENT '创作者名称',
  `creator_avatar` VARCHAR(512) DEFAULT NULL COMMENT '创作者头像',
  `phone` VARCHAR(32) DEFAULT NULL COMMENT '手机号',
  `email` VARCHAR(64) DEFAULT NULL COMMENT '邮箱',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用, 1-正常',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='创作者表';

-- 4. 账号日数据表（归一化后）
DROP TABLE IF EXISTS `account_daily_metrics`;
CREATE TABLE `account_daily_metrics` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `creator_id` BIGINT NOT NULL COMMENT '创作者ID',
  `account_id` BIGINT NOT NULL COMMENT '账号ID',
  `platform_id` BIGINT NOT NULL COMMENT '平台ID',
  `stat_date` DATE NOT NULL COMMENT '统计日期',
  `total_fans` BIGINT NOT NULL DEFAULT 0 COMMENT '总粉丝数',
  `new_fans` INT NOT NULL DEFAULT 0 COMMENT '当日新增粉丝',
  `lost_fans` INT NOT NULL DEFAULT 0 COMMENT '当日流失粉丝',
  `total_views` BIGINT NOT NULL DEFAULT 0 COMMENT '总播放量',
  `daily_views` INT NOT NULL DEFAULT 0 COMMENT '当日播放量',
  `total_likes` BIGINT NOT NULL DEFAULT 0 COMMENT '总点赞数',
  `daily_likes` INT NOT NULL DEFAULT 0 COMMENT '当日点赞数',
  `total_comments` BIGINT NOT NULL DEFAULT 0 COMMENT '总评论数',
  `daily_comments` INT NOT NULL DEFAULT 0 COMMENT '当日评论数',
  `total_shares` BIGINT NOT NULL DEFAULT 0 COMMENT '总分享数',
  `daily_shares` INT NOT NULL DEFAULT 0 COMMENT '当日分享数',
  `total_collects` BIGINT NOT NULL DEFAULT 0 COMMENT '总收藏数',
  `daily_collects` INT NOT NULL DEFAULT 0 COMMENT '当日收藏数',
  `engagement_rate` DECIMAL(10,4) NOT NULL DEFAULT 0 COMMENT '互动率',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_account_date` (`account_id`, `stat_date`),
  KEY `idx_creator_date` (`creator_id`, `stat_date`),
  KEY `idx_platform_date` (`platform_id`, `stat_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='账号日数据指标表（归一化）';

-- 5. 内容表
DROP TABLE IF EXISTS `content`;
CREATE TABLE `content` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `creator_id` BIGINT NOT NULL COMMENT '创作者ID',
  `account_id` BIGINT NOT NULL COMMENT '账号ID',
  `platform_id` BIGINT NOT NULL COMMENT '平台ID',
  `platform_content_id` VARCHAR(128) NOT NULL COMMENT '平台内容ID',
  `content_title` VARCHAR(255) NOT NULL COMMENT '内容标题',
  `content_type` VARCHAR(32) NOT NULL COMMENT '内容类型: VIDEO, ARTICLE, IMAGE',
  `content_cover` VARCHAR(512) DEFAULT NULL COMMENT '内容封面',
  `content_url` VARCHAR(512) DEFAULT NULL COMMENT '内容链接',
  `publish_time` DATETIME NOT NULL COMMENT '发布时间',
  `publish_hour` TINYINT NOT NULL COMMENT '发布时段(0-23)',
  `publish_weekday` TINYINT NOT NULL COMMENT '发布星期(1-7)',
  `duration` INT DEFAULT NULL COMMENT '视频时长(秒)',
  `tags` VARCHAR(512) DEFAULT NULL COMMENT '标签,逗号分隔',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0-已删除, 1-正常',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_account_platform_content` (`account_id`, `platform_content_id`),
  KEY `idx_creator_id` (`creator_id`),
  KEY `idx_publish_time` (`publish_time`),
  KEY `idx_publish_hour` (`publish_hour`),
  KEY `idx_publish_weekday` (`publish_weekday`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='内容表';

-- 6. 内容数据表
DROP TABLE IF EXISTS `content_metrics`;
CREATE TABLE `content_metrics` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `content_id` BIGINT NOT NULL COMMENT '内容ID',
  `creator_id` BIGINT NOT NULL COMMENT '创作者ID',
  `account_id` BIGINT NOT NULL COMMENT '账号ID',
  `platform_id` BIGINT NOT NULL COMMENT '平台ID',
  `total_views` BIGINT NOT NULL DEFAULT 0 COMMENT '总播放量',
  `total_likes` INT NOT NULL DEFAULT 0 COMMENT '总点赞数',
  `total_comments` INT NOT NULL DEFAULT 0 COMMENT '总评论数',
  `total_shares` INT NOT NULL DEFAULT 0 COMMENT '总分享数',
  `total_collects` INT NOT NULL DEFAULT 0 COMMENT '总收藏数',
  `complete_rate` DECIMAL(10,4) DEFAULT NULL COMMENT '完播率',
  `average_watch_time` DECIMAL(10,2) DEFAULT NULL COMMENT '平均观看时长(秒)',
  `engagement_rate` DECIMAL(10,4) NOT NULL DEFAULT 0 COMMENT '互动率',
  `hot_value` DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '热度值',
  `last_update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_content_id` (`content_id`),
  KEY `idx_creator_id` (`creator_id`),
  KEY `idx_total_views` (`total_views`),
  KEY `idx_hot_value` (`hot_value`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='内容数据表';

-- 7. 内容日数据表
DROP TABLE IF EXISTS `content_daily_metrics`;
CREATE TABLE `content_daily_metrics` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `content_id` BIGINT NOT NULL COMMENT '内容ID',
  `creator_id` BIGINT NOT NULL COMMENT '创作者ID',
  `account_id` BIGINT NOT NULL COMMENT '账号ID',
  `platform_id` BIGINT NOT NULL COMMENT '平台ID',
  `stat_date` DATE NOT NULL COMMENT '统计日期',
  `daily_views` INT NOT NULL DEFAULT 0 COMMENT '当日播放量',
  `daily_likes` INT NOT NULL DEFAULT 0 COMMENT '当日点赞数',
  `daily_comments` INT NOT NULL DEFAULT 0 COMMENT '当日评论数',
  `daily_shares` INT NOT NULL DEFAULT 0 COMMENT '当日分享数',
  `daily_collects` INT NOT NULL DEFAULT 0 COMMENT '当日收藏数',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_content_date` (`content_id`, `stat_date`),
  KEY `idx_creator_date` (`creator_id`, `stat_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='内容日数据表';

-- 8. 数据同步任务表
DROP TABLE IF EXISTS `sync_task`;
CREATE TABLE `sync_task` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `task_type` VARCHAR(32) NOT NULL COMMENT '任务类型: ACCOUNT_DATA, CONTENT_DATA, DAILY_AGGREGATION',
  `account_id` BIGINT DEFAULT NULL COMMENT '账号ID',
  `creator_id` BIGINT DEFAULT NULL COMMENT '创作者ID',
  `sync_date` DATE DEFAULT NULL COMMENT '同步日期',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0-待执行, 1-执行中, 2-成功, 3-失败',
  `retry_count` INT NOT NULL DEFAULT 0 COMMENT '重试次数',
  `max_retry` INT NOT NULL DEFAULT 3 COMMENT '最大重试次数',
  `error_message` TEXT DEFAULT NULL COMMENT '错误信息',
  `execute_start_time` DATETIME DEFAULT NULL COMMENT '执行开始时间',
  `execute_end_time` DATETIME DEFAULT NULL COMMENT '执行结束时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_account_id` (`account_id`),
  KEY `idx_creator_id` (`creator_id`),
  KEY `idx_task_type` (`task_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数据同步任务表';

-- 9. 发布时段分析表
DROP TABLE IF EXISTS `publish_time_analysis`;
CREATE TABLE `publish_time_analysis` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `creator_id` BIGINT NOT NULL COMMENT '创作者ID',
  `platform_id` BIGINT NOT NULL COMMENT '平台ID',
  `publish_hour` TINYINT NOT NULL COMMENT '发布时段(0-23)',
  `content_count` INT NOT NULL DEFAULT 0 COMMENT '内容数量',
  `avg_views` DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '平均播放量',
  `avg_likes` DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '平均点赞数',
  `avg_engagement_rate` DECIMAL(10,4) NOT NULL DEFAULT 0 COMMENT '平均互动率',
  `score` DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '综合评分',
  `stat_start_date` DATE NOT NULL COMMENT '统计开始日期',
  `stat_end_date` DATE NOT NULL COMMENT '统计结束日期',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_creator_platform_hour` (`creator_id`, `platform_id`, `publish_hour`),
  KEY `idx_score` (`score`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='发布时段分析表';

-- 10. 周报表
DROP TABLE IF EXISTS `weekly_report`;
CREATE TABLE `weekly_report` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `creator_id` BIGINT NOT NULL COMMENT '创作者ID',
  `report_type` VARCHAR(32) NOT NULL DEFAULT 'ALL' COMMENT '报告类型: ALL-全平台, DOUYIN-抖音, BILIBILI-B站, XIAOHONGSHU-小红书',
  `week_start_date` DATE NOT NULL COMMENT '周开始日期',
  `week_end_date` DATE NOT NULL COMMENT '周结束日期',
  `week_num` INT NOT NULL COMMENT '第几周',
  `total_fans` BIGINT NOT NULL DEFAULT 0 COMMENT '期末总粉丝',
  `weekly_new_fans` INT NOT NULL DEFAULT 0 COMMENT '本周新增粉丝',
  `weekly_lost_fans` INT NOT NULL DEFAULT 0 COMMENT '本周流失粉丝',
  `weekly_net_fans` INT NOT NULL DEFAULT 0 COMMENT '本周净增粉丝',
  `weekly_views` BIGINT NOT NULL DEFAULT 0 COMMENT '本周播放量',
  `weekly_likes` INT NOT NULL DEFAULT 0 COMMENT '本周点赞数',
  `weekly_comments` INT NOT NULL DEFAULT 0 COMMENT '本周评论数',
  `weekly_shares` INT NOT NULL DEFAULT 0 COMMENT '本周分享数',
  `weekly_collects` INT NOT NULL DEFAULT 0 COMMENT '本周收藏数',
  `weekly_engagement_rate` DECIMAL(10,4) NOT NULL DEFAULT 0 COMMENT '本周平均互动率',
  `top_content_id` BIGINT DEFAULT NULL COMMENT '最佳表现内容ID',
  `top_content_views` BIGINT DEFAULT 0 COMMENT '最佳内容播放量',
  `fans_growth_rate` DECIMAL(10,4) DEFAULT 0 COMMENT '粉丝增长率',
  `views_growth_rate` DECIMAL(10,4) DEFAULT 0 COMMENT '播放量增长率',
  `summary` TEXT DEFAULT NULL COMMENT '周报总结',
  `suggestions` TEXT DEFAULT NULL COMMENT '优化建议',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_creator_week_type` (`creator_id`, `week_start_date`, `week_end_date`, `report_type`),
  KEY `idx_creator_id` (`creator_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='周报表';

-- 11. 平台原始数据表（存储各平台原始响应，便于后续重新解析）
DROP TABLE IF EXISTS `platform_raw_data`;
CREATE TABLE `platform_raw_data` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `platform_id` BIGINT NOT NULL COMMENT '平台ID',
  `account_id` BIGINT NOT NULL COMMENT '账号ID',
  `data_type` VARCHAR(32) NOT NULL COMMENT '数据类型: ACCOUNT_PROFILE, ACCOUNT_STATS, CONTENT_LIST, CONTENT_STATS',
  `raw_data` JSON NOT NULL COMMENT '原始数据(JSON格式)',
  `fetch_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '抓取时间',
  `data_date` DATE DEFAULT NULL COMMENT '数据日期',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_account_type` (`account_id`, `data_type`),
  KEY `idx_fetch_time` (`fetch_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='平台原始数据表';

-- 初始化平台数据
INSERT INTO `platform` (`platform_code`, `platform_name`, `status`) VALUES
('DOUYIN', '抖音', 1),
('BILIBILI', 'B站', 1),
('XIAOHONGSHU', '小红书', 1);

-- 初始化测试创作者数据
INSERT INTO `creator` (`creator_name`, `phone`, `status`) VALUES
('测试创作者', '13800138000', 1);
