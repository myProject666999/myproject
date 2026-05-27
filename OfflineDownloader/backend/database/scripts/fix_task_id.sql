-- 修复 download_tasks 表的 task_id 字段类型
USE offline_downloader;

-- 删除旧表（如果存在）
DROP TABLE IF EXISTS download_tasks;
DROP TABLE IF EXISTS files;
DROP TABLE IF EXISTS settings;

-- 重新创建表
CREATE TABLE `download_tasks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `task_id` varchar(64) NOT NULL COMMENT 'aria2任务ID',
  `title` varchar(255) DEFAULT NULL COMMENT '任务标题',
  `url` text NOT NULL COMMENT '下载链接（HTTP/磁力链/ED2K）',
  `type` tinyint NOT NULL DEFAULT '1' COMMENT '任务类型：1-HTTP，2-磁力链，3-ED2K',
  `status` tinyint NOT NULL DEFAULT '0' COMMENT '状态：0-等待中，1-下载中，2-已暂停，3-已完成，4-错误，5-已删除',
  `total_size` bigint unsigned DEFAULT '0' COMMENT '总大小（字节）',
  `downloaded_size` bigint unsigned DEFAULT '0' COMMENT '已下载大小（字节）',
  `speed` bigint unsigned DEFAULT '0' COMMENT '下载速度（字节/秒）',
  `progress` decimal(5,2) DEFAULT '0.00' COMMENT '进度百分比',
  `file_count` int unsigned DEFAULT '0' COMMENT '文件数量',
  `save_path` varchar(500) DEFAULT NULL COMMENT '保存路径',
  `file_name` varchar(255) DEFAULT NULL COMMENT '文件名',
  `info_hash` varchar(64) DEFAULT NULL COMMENT '磁力链info_hash',
  `error_message` varchar(500) DEFAULT NULL COMMENT '错误信息',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `completed_at` datetime DEFAULT NULL COMMENT '完成时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_task_id` (`task_id`),
  KEY `idx_status` (`status`),
  KEY `idx_type` (`type`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='下载任务表';

CREATE TABLE `files` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `task_id` bigint unsigned DEFAULT NULL COMMENT '关联的任务ID',
  `name` varchar(255) NOT NULL COMMENT '文件名',
  `path` varchar(500) NOT NULL COMMENT '文件完整路径',
  `size` bigint unsigned DEFAULT '0' COMMENT '文件大小（字节）',
  `extension` varchar(20) DEFAULT NULL COMMENT '文件扩展名',
  `mime_type` varchar(100) DEFAULT NULL COMMENT 'MIME类型',
  `is_video` tinyint DEFAULT '0' COMMENT '是否视频：0-否，1-是',
  `is_audio` tinyint DEFAULT '0' COMMENT '是否音频：0-否，1-是',
  `is_image` tinyint DEFAULT '0' COMMENT '是否图片：0-否，1-是',
  `thumbnail_path` varchar(500) DEFAULT NULL COMMENT '缩略图路径',
  `duration` int unsigned DEFAULT '0' COMMENT '媒体时长（秒）',
  `downloaded` tinyint DEFAULT '1' COMMENT '是否已下载：0-否，1-是',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_task_id` (`task_id`),
  KEY `idx_path` (`path`),
  KEY `idx_is_video` (`is_video`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件表';

CREATE TABLE `settings` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `key` varchar(50) NOT NULL COMMENT '配置键',
  `value` text COMMENT '配置值',
  `description` varchar(255) DEFAULT NULL COMMENT '配置描述',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- 插入默认配置
INSERT INTO `settings` (`key`, `value`, `description`) VALUES
('download_path', './downloads', '默认下载目录'),
('max_concurrent_downloads', '5', '最大同时下载数'),
('aria2_rpc_url', 'http://127.0.0.1:6800/jsonrpc', 'aria2 RPC地址'),
('aria2_rpc_secret', '', 'aria2 RPC密钥'),
('auto_delete_completed', '0', '自动删除已完成任务（天），0表示不删除');
