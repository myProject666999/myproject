-- ============================================================
-- 慕课MOOC在线学习平台数据库脚本
-- Database: mooc_platform
-- Charset: utf8mb4
-- ============================================================

DROP DATABASE IF EXISTS `mooc_platform`;
CREATE DATABASE `mooc_platform` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `mooc_platform`;

-- ============================================================
-- 1. 角色表
-- ============================================================
CREATE TABLE `roles` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '角色ID',
    `name` VARCHAR(50) NOT NULL COMMENT '角色名称',
    `code` VARCHAR(50) NOT NULL COMMENT '角色编码',
    `description` VARCHAR(200) DEFAULT NULL COMMENT '角色描述',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_role_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

-- ============================================================
-- 2. 用户表
-- ============================================================
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    `username` VARCHAR(50) NOT NULL COMMENT '用户名',
    `password` VARCHAR(255) NOT NULL COMMENT '密码(加密)',
    `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
    `avatar` VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
    `nickname` VARCHAR(50) DEFAULT NULL COMMENT '昵称',
    `gender` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '性别:0未知 1男 2女',
    `bio` VARCHAR(500) DEFAULT NULL COMMENT '个人简介',
    `status` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态:0禁用 1正常',
    `last_login_at` DATETIME DEFAULT NULL COMMENT '最后登录时间',
    `last_login_ip` VARCHAR(50) DEFAULT NULL COMMENT '最后登录IP',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted_at` DATETIME DEFAULT NULL COMMENT '软删除时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`),
    KEY `idx_email` (`email`),
    KEY `idx_phone` (`phone`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ============================================================
-- 3. 用户角色关联表
-- ============================================================
CREATE TABLE `user_roles` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `role_id` BIGINT UNSIGNED NOT NULL COMMENT '角色ID',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_role` (`user_id`, `role_id`),
    KEY `idx_role_id` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户角色关联表';

-- ============================================================
-- 4. 教师信息表
-- ============================================================
CREATE TABLE `teachers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '教师ID',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '关联用户ID',
    `title` VARCHAR(50) DEFAULT NULL COMMENT '职称',
    `organization` VARCHAR(100) DEFAULT NULL COMMENT '所属机构',
    `years_of_experience` INT UNSIGNED DEFAULT 0 COMMENT '教学年限',
    `specialties` VARCHAR(500) DEFAULT NULL COMMENT '擅长领域(逗号分隔)',
    `certification` VARCHAR(500) DEFAULT NULL COMMENT '资质认证',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教师信息表';

-- ============================================================
-- 5. 课程分类表
-- ============================================================
CREATE TABLE `course_categories` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '分类ID',
    `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
    `parent_id` BIGINT UNSIGNED DEFAULT 0 COMMENT '父分类ID',
    `sort_order` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '排序',
    `icon` VARCHAR(200) DEFAULT NULL COMMENT '分类图标',
    `description` VARCHAR(200) DEFAULT NULL COMMENT '分类描述',
    `status` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态:0禁用 1正常',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程分类表';

-- ============================================================
-- 6. 课程表
-- ============================================================
CREATE TABLE `courses` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '课程ID',
    `teacher_id` BIGINT UNSIGNED NOT NULL COMMENT '教师ID',
    `category_id` BIGINT UNSIGNED NOT NULL COMMENT '分类ID',
    `title` VARCHAR(200) NOT NULL COMMENT '课程标题',
    `subtitle` VARCHAR(200) DEFAULT NULL COMMENT '课程副标题',
    `cover_image` VARCHAR(500) DEFAULT NULL COMMENT '课程封面图URL',
    `description` TEXT COMMENT '课程详细描述',
    `level` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '难度等级:0入门 1初级 2中级 3高级',
    `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '课程价格',
    `original_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '原价',
    `duration` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '课程总时长(秒)',
    `student_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '学员数量',
    `rating_avg` DECIMAL(3,2) NOT NULL DEFAULT 0.00 COMMENT '平均评分',
    `rating_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '评分数量',
    `tags` VARCHAR(500) DEFAULT NULL COMMENT '标签(逗号分隔)',
    `status` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '状态:0草稿 1已发布 2已下架',
    `published_at` DATETIME DEFAULT NULL COMMENT '发布时间',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted_at` DATETIME DEFAULT NULL COMMENT '软删除时间',
    PRIMARY KEY (`id`),
    KEY `idx_teacher_id` (`teacher_id`),
    KEY `idx_category_id` (`category_id`),
    KEY `idx_status` (`status`),
    KEY `idx_rating_avg` (`rating_avg`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程表';

-- ============================================================
-- 7. 课程章节表
-- ============================================================
CREATE TABLE `course_chapters` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '章节ID',
    `course_id` BIGINT UNSIGNED NOT NULL COMMENT '课程ID',
    `title` VARCHAR(200) NOT NULL COMMENT '章节标题',
    `description` VARCHAR(500) DEFAULT NULL COMMENT '章节描述',
    `sort_order` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '排序',
    `is_free` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否免费试学:0否 1是',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_course_id` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程章节表';

-- ============================================================
-- 8. 课时表
-- ============================================================
CREATE TABLE `course_lessons` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '课时ID',
    `chapter_id` BIGINT UNSIGNED NOT NULL COMMENT '章节ID',
    `course_id` BIGINT UNSIGNED NOT NULL COMMENT '课程ID',
    `title` VARCHAR(200) NOT NULL COMMENT '课时标题',
    `lesson_type` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '课时类型:1视频 2文档 3测验',
    `video_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '视频ID(课时类型为视频时)',
    `content` TEXT COMMENT '文档内容(课时类型为文档时)',
    `sort_order` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '排序',
    `duration` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '时长(秒,视频时有效)',
    `is_free` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否免费试学:0否 1是',
    `status` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态:0禁用 1正常',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_chapter_id` (`chapter_id`),
    KEY `idx_course_id` (`course_id`),
    KEY `idx_video_id` (`video_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课时表';

-- ============================================================
-- 9. 视频元数据表
-- ============================================================
CREATE TABLE `videos` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '视频ID',
    `file_name` VARCHAR(255) NOT NULL COMMENT '原始文件名',
    `file_size` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '文件大小(字节)',
    `duration` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '视频时长(秒)',
    `storage_key` VARCHAR(500) NOT NULL COMMENT '对象存储key',
    `storage_provider` VARCHAR(50) NOT NULL DEFAULT 'aliyun' COMMENT '存储服务商:aliyun/qiniu/aws',
    `cdn_url` VARCHAR(500) DEFAULT NULL COMMENT 'CDN播放地址',
    `cover_url` VARCHAR(500) DEFAULT NULL COMMENT '视频封面',
    `resolution` VARCHAR(50) DEFAULT NULL COMMENT '分辨率:720p/1080p/4k',
    `format` VARCHAR(20) NOT NULL DEFAULT 'mp4' COMMENT '视频格式',
    `mime_type` VARCHAR(50) DEFAULT NULL COMMENT 'MIME类型',
    `upload_status` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '上传状态:0未完成 1已完成 2失败',
    `uploaded_at` DATETIME DEFAULT NULL COMMENT '上传完成时间',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_storage_key` (`storage_key`(191)),
    KEY `idx_upload_status` (`upload_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='视频元数据表';

-- ============================================================
-- 10. 视频分片上传记录表
-- ============================================================
CREATE TABLE `video_chunks` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '分片ID',
    `video_id` BIGINT UNSIGNED NOT NULL COMMENT '视频ID',
    `chunk_index` INT UNSIGNED NOT NULL COMMENT '分片序号',
    `chunk_size` BIGINT UNSIGNED NOT NULL COMMENT '分片大小(字节)',
    `storage_key` VARCHAR(500) NOT NULL COMMENT '分片存储key',
    `md5` VARCHAR(64) DEFAULT NULL COMMENT '分片MD5校验',
    `upload_status` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '上传状态:0上传中 1已完成',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_video_id` (`video_id`),
    UNIQUE KEY `uk_video_chunk` (`video_id`, `chunk_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='视频分片上传记录表';

-- ============================================================
-- 11. 视频播放签名记录表
-- ============================================================
CREATE TABLE `video_tokens` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '签名ID',
    `video_id` BIGINT UNSIGNED NOT NULL COMMENT '视频ID',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `token` VARCHAR(255) NOT NULL COMMENT '播放签名token',
    `expire_at` DATETIME NOT NULL COMMENT '过期时间',
    `client_ip` VARCHAR(50) DEFAULT NULL COMMENT '客户端IP',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_token` (`token`),
    KEY `idx_video_user` (`video_id`, `user_id`),
    KEY `idx_expire_at` (`expire_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='视频播放签名记录表';

-- ============================================================
-- 12. 选课记录表
-- ============================================================
CREATE TABLE `enrollments` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '选课ID',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `course_id` BIGINT UNSIGNED NOT NULL COMMENT '课程ID',
    `price_paid` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '实付价格',
    `payment_status` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '支付状态:0未支付 1已支付 2已退款',
    `enrolled_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '选课时间',
    `completed_at` DATETIME DEFAULT NULL COMMENT '完成时间',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_course` (`user_id`, `course_id`),
    KEY `idx_course_id` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='选课记录表';

-- ============================================================
-- 13. 学习进度表
-- ============================================================
CREATE TABLE `learning_progress` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '进度ID',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `course_id` BIGINT UNSIGNED NOT NULL COMMENT '课程ID',
    `lesson_id` BIGINT UNSIGNED NOT NULL COMMENT '课时ID',
    `progress` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '进度百分比:0-100',
    `last_position` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '最后播放位置(秒)',
    `total_watch_time` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '累计观看时长(秒)',
    `is_completed` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否完成:0否 1是',
    `completed_at` DATETIME DEFAULT NULL COMMENT '完成时间',
    `last_watch_at` DATETIME DEFAULT NULL COMMENT '最后观看时间',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_lesson` (`user_id`, `lesson_id`),
    KEY `idx_user_course` (`user_id`, `course_id`),
    KEY `idx_is_completed` (`is_completed`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学习进度表';

-- ============================================================
-- 14. 测验题目表
-- ============================================================
CREATE TABLE `quiz_questions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '题目ID',
    `lesson_id` BIGINT UNSIGNED NOT NULL COMMENT '课时ID',
    `course_id` BIGINT UNSIGNED NOT NULL COMMENT '课程ID',
    `question_type` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '题型:1单选 2多选 3判断',
    `content` TEXT NOT NULL COMMENT '题目内容',
    `score` INT UNSIGNED NOT NULL DEFAULT 10 COMMENT '题目分值',
    `sort_order` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '排序',
    `status` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态:0禁用 1正常',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_lesson_id` (`lesson_id`),
    KEY `idx_course_id` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='测验题目表';

-- ============================================================
-- 15. 测验选项表
-- ============================================================
CREATE TABLE `quiz_options` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '选项ID',
    `question_id` BIGINT UNSIGNED NOT NULL COMMENT '题目ID',
    `option_label` VARCHAR(10) NOT NULL COMMENT '选项标识:A/B/C/D',
    `option_content` VARCHAR(500) NOT NULL COMMENT '选项内容',
    `is_correct` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否正确:0否 1是',
    `sort_order` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '排序',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_question_id` (`question_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='测验选项表';

-- ============================================================
-- 16. 测验记录表
-- ============================================================
CREATE TABLE `quiz_records` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '记录ID',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `course_id` BIGINT UNSIGNED NOT NULL COMMENT '课程ID',
    `lesson_id` BIGINT UNSIGNED NOT NULL COMMENT '课时ID',
    `attempt_count` INT UNSIGNED NOT NULL DEFAULT 1 COMMENT '第几次尝试',
    `total_score` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '总得分',
    `total_questions` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '题目总数',
    `correct_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '答对题数',
    `is_passed` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否通过:0否 1是',
    `time_spent` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '答题耗时(秒)',
    `submitted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_lesson` (`user_id`, `lesson_id`),
    KEY `idx_user_course` (`user_id`, `course_id`),
    KEY `idx_is_passed` (`is_passed`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='测验记录表';

-- ============================================================
-- 17. 测验答题明细表
-- ============================================================
CREATE TABLE `quiz_answers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '答题ID',
    `record_id` BIGINT UNSIGNED NOT NULL COMMENT '测验记录ID',
    `question_id` BIGINT UNSIGNED NOT NULL COMMENT '题目ID',
    `user_answer` VARCHAR(255) DEFAULT NULL COMMENT '用户答案',
    `correct_answer` VARCHAR(255) DEFAULT NULL COMMENT '正确答案',
    `is_correct` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否正确:0否 1是',
    `score` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '得分',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_record_id` (`record_id`),
    KEY `idx_question_id` (`question_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='测验答题明细表';

-- ============================================================
-- 18. 结课证书表
-- ============================================================
CREATE TABLE `certificates` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '证书ID',
    `certificate_no` VARCHAR(50) NOT NULL COMMENT '证书编号',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `course_id` BIGINT UNSIGNED NOT NULL COMMENT '课程ID',
    `title` VARCHAR(200) NOT NULL COMMENT '证书标题',
    `course_name` VARCHAR(200) NOT NULL COMMENT '课程名称',
    `teacher_name` VARCHAR(50) NOT NULL COMMENT '教师姓名',
    `final_score` DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT '最终成绩',
    `issued_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '颁发时间',
    `certificate_url` VARCHAR(500) DEFAULT NULL COMMENT '证书图片URL',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_certificate_no` (`certificate_no`),
    UNIQUE KEY `uk_user_course` (`user_id`, `course_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_course_id` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='结课证书表';

-- ============================================================
-- 19. 课程评论表
-- ============================================================
CREATE TABLE `course_reviews` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '评论ID',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `course_id` BIGINT UNSIGNED NOT NULL COMMENT '课程ID',
    `rating` TINYINT UNSIGNED NOT NULL DEFAULT 5 COMMENT '评分:1-5星',
    `content` VARCHAR(1000) NOT NULL COMMENT '评论内容',
    `parent_id` BIGINT UNSIGNED DEFAULT 0 COMMENT '父评论ID(回复用)',
    `like_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '点赞数',
    `status` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态:0隐藏 1正常',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted_at` DATETIME DEFAULT NULL COMMENT '软删除时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_course_id` (`course_id`),
    KEY `idx_parent_id` (`parent_id`),
    KEY `idx_rating` (`rating`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程评论表';

-- ============================================================
-- 20. 评论点赞表
-- ============================================================
CREATE TABLE `review_likes` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '点赞ID',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `review_id` BIGINT UNSIGNED NOT NULL COMMENT '评论ID',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_review` (`user_id`, `review_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论点赞表';

-- ============================================================
-- 21. 学习笔记表
-- ============================================================
CREATE TABLE `study_notes` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '笔记ID',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `course_id` BIGINT UNSIGNED NOT NULL COMMENT '课程ID',
    `lesson_id` BIGINT UNSIGNED NOT NULL COMMENT '课时ID',
    `timestamp` INT UNSIGNED DEFAULT NULL COMMENT '笔记对应的视频时间点(秒)',
    `content` TEXT NOT NULL COMMENT '笔记内容',
    `is_public` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否公开:0否 1是',
    `like_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '点赞数',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_lesson_id` (`lesson_id`),
    KEY `idx_course_id` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学习笔记表';

-- ============================================================
-- 22. 操作日志表
-- ============================================================
CREATE TABLE `operation_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
    `user_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '用户ID',
    `module` VARCHAR(50) NOT NULL COMMENT '操作模块',
    `operation` VARCHAR(50) NOT NULL COMMENT '操作类型',
    `method` VARCHAR(200) DEFAULT NULL COMMENT '请求方法',
    `request_params` TEXT COMMENT '请求参数',
    `ip` VARCHAR(50) DEFAULT NULL COMMENT '操作IP',
    `status` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '状态:0成功 1失败',
    `error_msg` VARCHAR(500) DEFAULT NULL COMMENT '错误信息',
    `cost_time` INT UNSIGNED DEFAULT NULL COMMENT '耗时(ms)',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_module` (`module`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';

-- ============================================================
-- 初始化数据
-- ============================================================

-- 初始化角色
INSERT INTO `roles` (`name`, `code`, `description`) VALUES
('超级管理员', 'admin', '系统超级管理员'),
('教师', 'teacher', '课程教师/讲师'),
('学员', 'student', '普通学员');

-- 初始化用户(密码为 123456 的 bcrypt 加密值)
INSERT INTO `users` (`username`, `password`, `email`, `nickname`, `status`) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin@mooc.com', '超级管理员', 1),
('teacher', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'teacher@mooc.com', '张老师', 1),
('student', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'student@mooc.com', '李同学', 1);

-- 分配角色
INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES (1, 1), (2, 2), (3, 3);

-- 初始化教师信息
INSERT INTO `teachers` (`user_id`, `title`, `organization`, `years_of_experience`, `specialties`) VALUES
(2, '高级讲师', '慕课学院', 10, 'Java,Python,Go');

-- 初始化课程分类
INSERT INTO `course_categories` (`name`, `parent_id`, `sort_order`, `description`) VALUES
('前端开发', 0, 1, '前端开发相关课程'),
('后端开发', 0, 2, '后端开发相关课程'),
('移动开发', 0, 3, '移动开发相关课程'),
('数据库', 0, 4, '数据库相关课程'),
('运维', 0, 5, '运维相关课程');

INSERT INTO `course_categories` (`name`, `parent_id`, `sort_order`, `description`) VALUES
('Vue.js', 1, 1, 'Vue.js框架'),
('React', 1, 2, 'React框架'),
('Angular', 1, 3, 'Angular框架'),
('Java', 2, 1, 'Java开发'),
('Python', 2, 2, 'Python开发'),
('Go', 2, 3, 'Go语言开发'),
('MySQL', 4, 1, 'MySQL数据库'),
('Redis', 4, 2, 'Redis缓存');
