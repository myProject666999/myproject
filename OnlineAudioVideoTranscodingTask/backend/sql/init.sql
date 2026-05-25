-- ============================================================
-- 在线音视频转码任务系统 - 数据库初始化脚本
-- ============================================================

DROP DATABASE IF EXISTS transcoding_db;
CREATE DATABASE transcoding_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE transcoding_db;

-- ============================================================
-- 转码任务表
-- ============================================================
DROP TABLE IF EXISTS tasks;
CREATE TABLE tasks (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '任务ID',
  file_name       VARCHAR(255)    NOT NULL COMMENT '原始文件名',
  file_path       VARCHAR(512)    NOT NULL COMMENT '上传文件存储路径',
  file_size       BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '文件大小(字节)',
  output_format   VARCHAR(16)     NOT NULL COMMENT '目标格式: mp4/mp3/webm/avi/mov/flv/mkv/wav/aac/ogg',
  status          VARCHAR(16)     NOT NULL DEFAULT 'pending' COMMENT '状态: pending/processing/completed/failed',
  progress        TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '转码进度 0-100',
  output_path     VARCHAR(512)    DEFAULT NULL COMMENT '转码后文件存储路径',
  output_size     BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '输出文件大小(字节)',
  error_message   TEXT            DEFAULT NULL COMMENT '错误信息',
  retry_count     TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '已重试次数',
  max_retries     TINYINT UNSIGNED NOT NULL DEFAULT 3 COMMENT '最大重试次数',
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  KEY idx_status (status),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='转码任务表';

-- ============================================================
-- 任务历史记录表（用于审计/分析）
-- ============================================================
DROP TABLE IF EXISTS task_history;
CREATE TABLE task_history (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '历史ID',
  task_id         BIGINT UNSIGNED NOT NULL COMMENT '任务ID',
  action          VARCHAR(32)     NOT NULL COMMENT '动作: create/start/complete/fail/retry',
  detail          TEXT            DEFAULT NULL COMMENT '详细信息',
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (id),
  KEY idx_task_id (task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务历史记录表';
