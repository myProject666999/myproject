-- ========================================
-- 学情诊断与知识点掌握图谱 数据库脚本
-- ========================================

CREATE DATABASE IF NOT EXISTS `learning_diagnosis` 
DEFAULT CHARACTER SET utf8mb4 
DEFAULT COLLATE utf8mb4_unicode_ci;

USE `learning_diagnosis`;

-- ========================================
-- 1. 用户表
-- ========================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码(哈希)',
  `real_name` VARCHAR(50) NOT NULL COMMENT '真实姓名',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  `role` ENUM('admin', 'teacher', 'student') NOT NULL DEFAULT 'student' COMMENT '角色',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1-正常,0-禁用',
  `last_login_at` DATETIME DEFAULT NULL COMMENT '最后登录时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_role` (`role`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ========================================
-- 2. 班级表
-- ========================================
DROP TABLE IF EXISTS `classes`;
CREATE TABLE `classes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '班级ID',
  `name` VARCHAR(100) NOT NULL COMMENT '班级名称',
  `grade` VARCHAR(50) NOT NULL COMMENT '年级',
  `subject` VARCHAR(50) DEFAULT NULL COMMENT '科目',
  `teacher_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '班主任/授课老师ID',
  `description` TEXT COMMENT '班级描述',
  `student_count` INT NOT NULL DEFAULT 0 COMMENT '学生人数',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1-正常,0-归档',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  KEY `idx_teacher_id` (`teacher_id`),
  KEY `idx_grade` (`grade`),
  CONSTRAINT `fk_class_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='班级表';

-- ========================================
-- 3. 学生班级关联表
-- ========================================
DROP TABLE IF EXISTS `class_students`;
CREATE TABLE `class_students` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `class_id` BIGINT UNSIGNED NOT NULL COMMENT '班级ID',
  `student_id` BIGINT UNSIGNED NOT NULL COMMENT '学生ID',
  `join_date` DATE NOT NULL COMMENT '加入日期',
  `leave_date` DATE DEFAULT NULL COMMENT '离开日期',
  `is_active` TINYINT NOT NULL DEFAULT 1 COMMENT '是否在读:1-是,0-否',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_class_student` (`class_id`, `student_id`),
  KEY `idx_student_id` (`student_id`),
  CONSTRAINT `fk_cs_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cs_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学生班级关联表';

-- ========================================
-- 4. 学科表
-- ========================================
DROP TABLE IF EXISTS `subjects`;
CREATE TABLE `subjects` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '学科ID',
  `name` VARCHAR(50) NOT NULL COMMENT '学科名称',
  `code` VARCHAR(20) NOT NULL COMMENT '学科编码',
  `icon` VARCHAR(255) DEFAULT NULL COMMENT '学科图标',
  `description` TEXT COMMENT '描述',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1-启用,0-禁用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学科表';

-- ========================================
-- 5. 知识点表 (树形结构)
-- ========================================
DROP TABLE IF EXISTS `knowledge_points`;
CREATE TABLE `knowledge_points` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '知识点ID',
  `subject_id` BIGINT UNSIGNED NOT NULL COMMENT '学科ID',
  `parent_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '父知识点ID',
  `name` VARCHAR(100) NOT NULL COMMENT '知识点名称',
  `code` VARCHAR(50) NOT NULL COMMENT '知识点编码',
  `description` TEXT COMMENT '知识点描述',
  `difficulty_level` TINYINT NOT NULL DEFAULT 1 COMMENT '难度等级:1-5',
  `importance_level` TINYINT NOT NULL DEFAULT 1 COMMENT '重要程度:1-5',
  `depth` INT NOT NULL DEFAULT 1 COMMENT '树深度',
  `path` VARCHAR(500) DEFAULT NULL COMMENT '树路径,用逗号分隔',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1-正常,0-停用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_subject_id` (`subject_id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_path` (`path`),
  CONSTRAINT `fk_kp_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_kp_parent` FOREIGN KEY (`parent_id`) REFERENCES `knowledge_points` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识点表';

-- ========================================
-- 6. 知识点关联表 (图谱关系)
-- ========================================
DROP TABLE IF EXISTS `knowledge_relations`;
CREATE TABLE `knowledge_relations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '关系ID',
  `from_kp_id` BIGINT UNSIGNED NOT NULL COMMENT '源知识点ID',
  `to_kp_id` BIGINT UNSIGNED NOT NULL COMMENT '目标知识点ID',
  `relation_type` ENUM('prerequisite', 'related', 'derived', 'part_of') NOT NULL DEFAULT 'related' COMMENT '关系类型:前置条件-相关-衍生-包含',
  `weight` DECIMAL(5,2) NOT NULL DEFAULT 1.00 COMMENT '关系权重',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '关系描述',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_from_to_type` (`from_kp_id`, `to_kp_id`, `relation_type`),
  KEY `idx_to_kp_id` (`to_kp_id`),
  CONSTRAINT `fk_kr_from` FOREIGN KEY (`from_kp_id`) REFERENCES `knowledge_points` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_kr_to` FOREIGN KEY (`to_kp_id`) REFERENCES `knowledge_points` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识点关联表';

-- ========================================
-- 7. 题库表
-- ========================================
DROP TABLE IF EXISTS `questions`;
CREATE TABLE `questions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '题目ID',
  `subject_id` BIGINT UNSIGNED NOT NULL COMMENT '学科ID',
  `type` ENUM('single_choice', 'multiple_choice', 'true_false', 'fill_blank', 'short_answer', 'calculation') NOT NULL COMMENT '题目类型',
  `difficulty` TINYINT NOT NULL DEFAULT 2 COMMENT '难度:1-简单,2-中等,3-较难,4-困难',
  `content` TEXT NOT NULL COMMENT '题目内容',
  `options` JSON DEFAULT NULL COMMENT '选项(JSON格式)',
  `answer` TEXT NOT NULL COMMENT '标准答案',
  `analysis` TEXT COMMENT '答案解析',
  `score` DECIMAL(5,2) NOT NULL DEFAULT 10.00 COMMENT '默认分值',
  `estimated_time` INT DEFAULT NULL COMMENT '预计答题时间(秒)',
  `source` VARCHAR(100) DEFAULT NULL COMMENT '题目来源',
  `creator_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '创建人ID',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1-正常,0-停用',
  `usage_count` INT NOT NULL DEFAULT 0 COMMENT '使用次数',
  `correct_rate` DECIMAL(5,2) DEFAULT NULL COMMENT '全站正确率',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  KEY `idx_subject_id` (`subject_id`),
  KEY `idx_type` (`type`),
  KEY `idx_difficulty` (`difficulty`),
  KEY `idx_creator_id` (`creator_id`),
  CONSTRAINT `fk_q_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_q_creator` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='题库表';

-- ========================================
-- 8. 题目-知识点关联表
-- ========================================
DROP TABLE IF EXISTS `question_knowledge`;
CREATE TABLE `question_knowledge` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `question_id` BIGINT UNSIGNED NOT NULL COMMENT '题目ID',
  `knowledge_point_id` BIGINT UNSIGNED NOT NULL COMMENT '知识点ID',
  `mastery_level` TINYINT NOT NULL DEFAULT 1 COMMENT '掌握层次:1-了解,2-理解,3-应用,4-综合',
  `weight` DECIMAL(5,2) NOT NULL DEFAULT 1.00 COMMENT '关联权重',
  `is_primary` TINYINT NOT NULL DEFAULT 0 COMMENT '是否主要考点:1-是,0-否',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_question_kp` (`question_id`, `knowledge_point_id`),
  KEY `idx_kp_id` (`knowledge_point_id`),
  CONSTRAINT `fk_qk_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_qk_kp` FOREIGN KEY (`knowledge_point_id`) REFERENCES `knowledge_points` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='题目-知识点关联表';

-- ========================================
-- 9. 练习/试卷表
-- ========================================
DROP TABLE IF EXISTS `exercises`;
CREATE TABLE `exercises` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '练习ID',
  `name` VARCHAR(200) NOT NULL COMMENT '练习名称',
  `subject_id` BIGINT UNSIGNED NOT NULL COMMENT '学科ID',
  `creator_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '创建人ID',
  `type` ENUM('practice', 'exam', 'diagnosis', 'recommendation') NOT NULL COMMENT '类型:练习-考试-诊断-推荐',
  `description` TEXT COMMENT '描述',
  `total_score` DECIMAL(8,2) NOT NULL DEFAULT 100.00 COMMENT '总分',
  `total_questions` INT NOT NULL DEFAULT 0 COMMENT '题目总数',
  `time_limit` INT DEFAULT NULL COMMENT '时间限制(分钟)',
  `is_public` TINYINT NOT NULL DEFAULT 0 COMMENT '是否公开:1-是,0-否',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  KEY `idx_subject_id` (`subject_id`),
  KEY `idx_creator_id` (`creator_id`),
  KEY `idx_type` (`type`),
  CONSTRAINT `fk_ex_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ex_creator` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='练习/试卷表';

-- ========================================
-- 10. 练习-题目关联表
-- ========================================
DROP TABLE IF EXISTS `exercise_questions`;
CREATE TABLE `exercise_questions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `exercise_id` BIGINT UNSIGNED NOT NULL COMMENT '练习ID',
  `question_id` BIGINT UNSIGNED NOT NULL COMMENT '题目ID',
  `score` DECIMAL(5,2) NOT NULL COMMENT '题目分值',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_exercise_question` (`exercise_id`, `question_id`),
  KEY `idx_question_id` (`question_id`),
  CONSTRAINT `fk_eq_exercise` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_eq_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='练习-题目关联表';

-- ========================================
-- 11. 学生答题记录表
-- ========================================
DROP TABLE IF EXISTS `answer_records`;
CREATE TABLE `answer_records` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '答题记录ID',
  `student_id` BIGINT UNSIGNED NOT NULL COMMENT '学生ID',
  `exercise_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '练习ID(可为空,单独刷题时)',
  `question_id` BIGINT UNSIGNED NOT NULL COMMENT '题目ID',
  `subject_id` BIGINT UNSIGNED NOT NULL COMMENT '学科ID',
  `student_answer` TEXT COMMENT '学生答案',
  `is_correct` TINYINT DEFAULT NULL COMMENT '是否正确:1-正确,0-错误,NULL-未判分',
  `score` DECIMAL(8,2) DEFAULT NULL COMMENT '得分',
  `time_spent` INT DEFAULT NULL COMMENT '答题用时(秒)',
  `start_time` DATETIME DEFAULT NULL COMMENT '开始答题时间',
  `submit_time` DATETIME NOT NULL COMMENT '提交时间',
  `answer_metadata` JSON DEFAULT NULL COMMENT '答题元数据(答题过程、修改次数等)',
  `source` VARCHAR(50) DEFAULT 'manual' COMMENT '来源:manual-手动,diagnosis-诊断,recommendation-推荐',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_question_id` (`question_id`),
  KEY `idx_exercise_id` (`exercise_id`),
  KEY `idx_subject_id` (`subject_id`),
  KEY `idx_student_subject` (`student_id`, `subject_id`),
  KEY `idx_submit_time` (`submit_time`),
  KEY `idx_is_correct` (`is_correct`),
  CONSTRAINT `fk_ar_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ar_exercise` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ar_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ar_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学生答题记录表';

-- ========================================
-- 12. 练习完成记录表
-- ========================================
DROP TABLE IF EXISTS `exercise_sessions`;
CREATE TABLE `exercise_sessions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '会话ID',
  `student_id` BIGINT UNSIGNED NOT NULL COMMENT '学生ID',
  `exercise_id` BIGINT UNSIGNED NOT NULL COMMENT '练习ID',
  `class_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '班级ID(班级作业)',
  `start_time` DATETIME NOT NULL COMMENT '开始时间',
  `submit_time` DATETIME DEFAULT NULL COMMENT '提交时间',
  `total_score` DECIMAL(8,2) DEFAULT NULL COMMENT '总分',
  `score` DECIMAL(8,2) DEFAULT NULL COMMENT '得分',
  `correct_count` INT DEFAULT NULL COMMENT '正确题数',
  `wrong_count` INT DEFAULT NULL COMMENT '错误题数',
  `time_spent` INT DEFAULT NULL COMMENT '总用时(秒)',
  `status` ENUM('in_progress', 'submitted', 'graded') NOT NULL DEFAULT 'in_progress' COMMENT '状态',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_exercise_id` (`exercise_id`),
  KEY `idx_class_id` (`class_id`),
  KEY `idx_student_exercise` (`student_id`, `exercise_id`),
  CONSTRAINT `fk_es_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_es_exercise` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_es_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='练习完成记录表';

-- ========================================
-- 13. 知识点掌握度表
-- ========================================
DROP TABLE IF EXISTS `knowledge_mastery`;
CREATE TABLE `knowledge_mastery` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '掌握度ID',
  `student_id` BIGINT UNSIGNED NOT NULL COMMENT '学生ID',
  `knowledge_point_id` BIGINT UNSIGNED NOT NULL COMMENT '知识点ID',
  `subject_id` BIGINT UNSIGNED NOT NULL COMMENT '学科ID',
  `mastery_level` DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT '掌握度:0-100',
  `confidence` DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT '置信度',
  `total_questions` INT NOT NULL DEFAULT 0 COMMENT '累计答题数',
  `correct_count` INT NOT NULL DEFAULT 0 COMMENT '正确题数',
  `wrong_count` INT NOT NULL DEFAULT 0 COMMENT '错误题数',
  `streak` INT NOT NULL DEFAULT 0 COMMENT '连续正确/错误次数',
  `last_answer_time` DATETIME DEFAULT NULL COMMENT '最后答题时间',
  `first_answer_time` DATETIME DEFAULT NULL COMMENT '首次答题时间',
  `forgetting_curve` DECIMAL(5,2) NOT NULL DEFAULT 1.00 COMMENT '遗忘系数',
  `mastery_trend` ENUM('improving', 'stable', 'declining') DEFAULT 'stable' COMMENT '掌握趋势',
  `model_version` VARCHAR(50) DEFAULT 'v1.0' COMMENT '计算模型版本',
  `calculation_details` JSON DEFAULT NULL COMMENT '计算详情(可解释性数据)',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_student_kp` (`student_id`, `knowledge_point_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_kp_id` (`knowledge_point_id`),
  KEY `idx_subject_id` (`subject_id`),
  KEY `idx_student_subject` (`student_id`, `subject_id`),
  KEY `idx_mastery_level` (`mastery_level`),
  CONSTRAINT `fk_km_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_km_kp` FOREIGN KEY (`knowledge_point_id`) REFERENCES `knowledge_points` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_km_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识点掌握度表';

-- ========================================
-- 14. 掌握度历史表 (用于趋势分析)
-- ========================================
DROP TABLE IF EXISTS `mastery_history`;
CREATE TABLE `mastery_history` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `student_id` BIGINT UNSIGNED NOT NULL COMMENT '学生ID',
  `knowledge_point_id` BIGINT UNSIGNED NOT NULL COMMENT '知识点ID',
  `subject_id` BIGINT UNSIGNED NOT NULL COMMENT '学科ID',
  `mastery_level` DECIMAL(5,2) NOT NULL COMMENT '掌握度快照',
  `record_date` DATE NOT NULL COMMENT '记录日期',
  `total_questions` INT NOT NULL DEFAULT 0 COMMENT '累计答题数',
  `correct_count` INT NOT NULL DEFAULT 0 COMMENT '正确题数',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_student_kp_date` (`student_id`, `knowledge_point_id`, `record_date`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_kp_id` (`knowledge_point_id`),
  KEY `idx_record_date` (`record_date`),
  CONSTRAINT `fk_mh_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mh_kp` FOREIGN KEY (`knowledge_point_id`) REFERENCES `knowledge_points` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mh_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='掌握度历史表';

-- ========================================
-- 15. 薄弱知识点表
-- ========================================
DROP TABLE IF EXISTS `weak_points`;
CREATE TABLE `weak_points` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `student_id` BIGINT UNSIGNED NOT NULL COMMENT '学生ID',
  `knowledge_point_id` BIGINT UNSIGNED NOT NULL COMMENT '知识点ID',
  `subject_id` BIGINT UNSIGNED NOT NULL COMMENT '学科ID',
  `weakness_score` DECIMAL(5,2) NOT NULL COMMENT '薄弱度评分',
  `weakness_level` ENUM('critical', 'high', 'medium', 'low') NOT NULL COMMENT '薄弱等级',
  `reason` TEXT COMMENT '薄弱原因分析',
  `related_wrong_questions` JSON DEFAULT NULL COMMENT '关联错题',
  `recommended_practice_count` INT NOT NULL DEFAULT 0 COMMENT '已推荐练习次数',
  `practice_since_detected` INT NOT NULL DEFAULT 0 COMMENT '发现以来练习次数',
  `improvement_since_detected` DECIMAL(5,2) DEFAULT NULL COMMENT '发现以来掌握度提升',
  `is_improving` TINYINT NOT NULL DEFAULT 0 COMMENT '是否正在改善',
  `detected_at` DATETIME NOT NULL COMMENT '首次发现时间',
  `last_updated_at` DATETIME NOT NULL COMMENT '最后更新时间',
  `is_resolved` TINYINT NOT NULL DEFAULT 0 COMMENT '是否已解决',
  `resolved_at` DATETIME DEFAULT NULL COMMENT '解决时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_student_kp` (`student_id`, `knowledge_point_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_subject_id` (`subject_id`),
  KEY `idx_weakness_level` (`weakness_level`),
  KEY `idx_is_resolved` (`is_resolved`),
  CONSTRAINT `fk_wp_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_wp_kp` FOREIGN KEY (`knowledge_point_id`) REFERENCES `knowledge_points` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_wp_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='薄弱知识点表';

-- ========================================
-- 16. 推荐练习记录表
-- ========================================
DROP TABLE IF EXISTS `recommendations`;
CREATE TABLE `recommendations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '推荐ID',
  `student_id` BIGINT UNSIGNED NOT NULL COMMENT '学生ID',
  `subject_id` BIGINT UNSIGNED NOT NULL COMMENT '学科ID',
  `exercise_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '生成的练习ID',
  `type` ENUM('weak_point', 'forgetting', 'preview', 'comprehensive') NOT NULL COMMENT '推荐类型',
  `target_knowledge_points` JSON DEFAULT NULL COMMENT '目标知识点',
  `recommendation_reason` TEXT COMMENT '推荐理由',
  `total_questions` INT NOT NULL COMMENT '题目数量',
  `difficulty_range` VARCHAR(20) DEFAULT NULL COMMENT '难度范围',
  `is_completed` TINYINT NOT NULL DEFAULT 0 COMMENT '是否完成',
  `score` DECIMAL(8,2) DEFAULT NULL COMMENT '完成得分',
  `recommended_at` DATETIME NOT NULL COMMENT '推荐时间',
  `completed_at` DATETIME DEFAULT NULL COMMENT '完成时间',
  `expires_at` DATETIME DEFAULT NULL COMMENT '过期时间',
  `algorithm_version` VARCHAR(50) DEFAULT 'v1.0' COMMENT '推荐算法版本',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_subject_id` (`subject_id`),
  KEY `idx_type` (`type`),
  KEY `idx_recommended_at` (`recommended_at`),
  KEY `idx_is_completed` (`is_completed`),
  CONSTRAINT `fk_rec_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rec_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rec_exercise` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='推荐练习记录表';

-- ========================================
-- 17. 学情报告表
-- ========================================
DROP TABLE IF EXISTS `learning_reports`;
CREATE TABLE `learning_reports` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '报告ID',
  `type` ENUM('student_personal', 'student_period', 'class_overall', 'class_comparison', 'diagnosis') NOT NULL COMMENT '报告类型',
  `student_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '学生ID(个人报告)',
  `class_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '班级ID(班级报告)',
  `subject_id` BIGINT UNSIGNED NOT NULL COMMENT '学科ID',
  `period_start` DATE DEFAULT NULL COMMENT '统计开始日期',
  `period_end` DATE DEFAULT NULL COMMENT '统计结束日期',
  `title` VARCHAR(200) NOT NULL COMMENT '报告标题',
  `summary` TEXT COMMENT '报告摘要',
  `content` JSON NOT NULL COMMENT '报告内容(JSON)',
  `overall_score` DECIMAL(5,2) DEFAULT NULL COMMENT '综合评分',
  `comparison_class_ids` JSON DEFAULT NULL COMMENT '对比班级ID列表(对比报告)',
  `creator_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '生成人ID(手动生成)',
  `is_auto_generated` TINYINT NOT NULL DEFAULT 1 COMMENT '是否自动生成',
  `view_count` INT NOT NULL DEFAULT 0 COMMENT '查看次数',
  `share_token` VARCHAR(100) DEFAULT NULL COMMENT '分享令牌',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_class_id` (`class_id`),
  KEY `idx_subject_id` (`subject_id`),
  KEY `idx_type` (`type`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_lr_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lr_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lr_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lr_creator` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学情报告表';

-- ========================================
-- 18. 班级学情统计表
-- ========================================
DROP TABLE IF EXISTS `class_statistics`;
CREATE TABLE `class_statistics` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `class_id` BIGINT UNSIGNED NOT NULL COMMENT '班级ID',
  `subject_id` BIGINT UNSIGNED NOT NULL COMMENT '学科ID',
  `knowledge_point_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '知识点ID(为空则是学科整体)',
  `stat_date` DATE NOT NULL COMMENT '统计日期',
  `avg_mastery` DECIMAL(5,2) DEFAULT NULL COMMENT '平均掌握度',
  `max_mastery` DECIMAL(5,2) DEFAULT NULL COMMENT '最高掌握度',
  `min_mastery` DECIMAL(5,2) DEFAULT NULL COMMENT '最低掌握度',
  `mastery_distribution` JSON DEFAULT NULL COMMENT '掌握度分布',
  `total_questions` INT NOT NULL DEFAULT 0 COMMENT '总答题数',
  `avg_score` DECIMAL(8,2) DEFAULT NULL COMMENT '平均得分',
  `correct_rate` DECIMAL(5,2) DEFAULT NULL COMMENT '正确率',
  `student_count` INT NOT NULL DEFAULT 0 COMMENT '参与学生数',
  `weak_point_count` INT NOT NULL DEFAULT 0 COMMENT '薄弱点总数',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_class_subject_kp_date` (`class_id`, `subject_id`, `knowledge_point_id`, `stat_date`),
  KEY `idx_class_id` (`class_id`),
  KEY `idx_subject_id` (`subject_id`),
  KEY `idx_stat_date` (`stat_date`),
  CONSTRAINT `fk_clsstat_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_clsstat_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_clsstat_kp` FOREIGN KEY (`knowledge_point_id`) REFERENCES `knowledge_points` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='班级学情统计表';

-- ========================================
-- 19. 数据导出记录表
-- ========================================
DROP TABLE IF EXISTS `export_records`;
CREATE TABLE `export_records` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `requester_id` BIGINT UNSIGNED NOT NULL COMMENT '申请人ID',
  `type` ENUM('student_report', 'class_report', 'answer_records', 'mastery_data', 'question_bank') NOT NULL COMMENT '导出类型',
  `format` ENUM('pdf', 'excel', 'csv', 'json') NOT NULL COMMENT '导出格式',
  `parameters` JSON DEFAULT NULL COMMENT '查询参数',
  `file_name` VARCHAR(255) DEFAULT NULL COMMENT '文件名',
  `file_path` VARCHAR(500) DEFAULT NULL COMMENT '文件路径',
  `file_size` BIGINT DEFAULT NULL COMMENT '文件大小(字节)',
  `status` ENUM('pending', 'processing', 'completed', 'failed') NOT NULL DEFAULT 'pending' COMMENT '状态',
  `error_message` TEXT DEFAULT NULL COMMENT '错误信息',
  `expires_at` DATETIME DEFAULT NULL COMMENT '过期时间',
  `download_count` INT NOT NULL DEFAULT 0 COMMENT '下载次数',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `completed_at` DATETIME DEFAULT NULL COMMENT '完成时间',
  PRIMARY KEY (`id`),
  KEY `idx_requester_id` (`requester_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_er_requester` FOREIGN KEY (`requester_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数据导出记录表';

-- ========================================
-- 20. 操作日志表 (隐私审计)
-- ========================================
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `user_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '操作用户ID',
  `username` VARCHAR(50) DEFAULT NULL COMMENT '操作用户名',
  `role` VARCHAR(20) DEFAULT NULL COMMENT '用户角色',
  `action` VARCHAR(100) NOT NULL COMMENT '操作类型',
  `resource_type` VARCHAR(50) NOT NULL COMMENT '资源类型',
  `resource_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '资源ID',
  `description` TEXT COMMENT '操作描述',
  `ip_address` VARCHAR(45) DEFAULT NULL COMMENT 'IP地址',
  `user_agent` VARCHAR(500) DEFAULT NULL COMMENT '浏览器UA',
  `request_data` JSON DEFAULT NULL COMMENT '请求数据(脱敏)',
  `response_data` JSON DEFAULT NULL COMMENT '响应数据(脱敏)',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '操作结果:1-成功,0-失败',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_resource_type` (`resource_type`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='审计日志表';

-- ========================================
-- 初始化数据
-- ========================================

-- 插入学科
INSERT INTO `subjects` (`name`, `code`, `sort_order`) VALUES
('数学', 'math', 1),
('语文', 'chinese', 2),
('英语', 'english', 3),
('物理', 'physics', 4),
('化学', 'chemistry', 5),
('生物', 'biology', 6);

-- 插入测试用户 (密码都是 123456, bcrypt 哈希)
INSERT INTO `users` (`username`, `password`, `real_name`, `email`, `role`, `status`) VALUES
('admin', '$2b$10$eE1x6Q98e1x6Q98e1x6Q9e1x6Q98e1x6Q98e1x6Q98e1x6Q98e1x6', '系统管理员', 'admin@example.com', 'admin', 1),
('teacher1', '$2b$10$eE1x6Q98e1x6Q98e1x6Q9e1x6Q98e1x6Q98e1x6Q98e1x6Q98e1x6', '张老师', 'teacher1@example.com', 'teacher', 1),
('teacher2', '$2b$10$eE1x6Q98e1x6Q98e1x6Q9e1x6Q98e1x6Q98e1x6Q98e1x6Q98e1x6', '李老师', 'teacher2@example.com', 'teacher', 1),
('student1', '$2b$10$eE1x6Q98e1x6Q98e1x6Q9e1x6Q98e1x6Q98e1x6Q98e1x6Q98e1x6', '学生小明', 'student1@example.com', 'student', 1),
('student2', '$2b$10$eE1x6Q98e1x6Q98e1x6Q9e1x6Q98e1x6Q98e1x6Q98e1x6Q98e1x6', '学生小红', 'student2@example.com', 'student', 1),
('student3', '$2b$10$eE1x6Q98e1x6Q98e1x6Q9e1x6Q98e1x6Q98e1x6Q98e1x6Q98e1x6', '学生小刚', 'student3@example.com', 'student', 1);

-- 插入测试班级
INSERT INTO `classes` (`name`, `grade`, `subject`, `teacher_id`, `description`, `student_count`) VALUES
('高一(1)班', '高一', NULL, 2, '高一1班全体科目', 3),
('高一(2)班', '高一', NULL, 3, '高一2班全体科目', 0),
('高一数学培优班', '高一', '数学', 2, '高一数学拔高训练', 3),
('高一英语基础班', '高一', '英语', 3, '高一英语基础巩固', 2);

-- 插入班级学生
INSERT INTO `class_students` (`class_id`, `student_id`, `join_date`) VALUES
(1, 4, '2024-09-01'),
(1, 5, '2024-09-01'),
(1, 6, '2024-09-01'),
(3, 4, '2024-09-01'),
(3, 5, '2024-09-01'),
(3, 6, '2024-09-01'),
(4, 4, '2024-09-01'),
(4, 5, '2024-09-01');

-- 插入数学知识点 (示例)
INSERT INTO `knowledge_points` (`subject_id`, `parent_id`, `name`, `code`, `description`, `difficulty_level`, `importance_level`, `depth`, `path`, `sort_order`) VALUES
(1, NULL, '集合与常用逻辑用语', 'math-001', '集合的基本概念与运算', 1, 2, 1, '1', 1),
(1, NULL, '函数', 'math-002', '函数的概念与性质', 2, 5, 1, '2', 2),
(1, NULL, '三角函数', 'math-003', '三角函数的图像与性质', 2, 4, 1, '3', 3),
(1, NULL, '数列', 'math-004', '等差与等比数列', 3, 4, 1, '4', 4),
(1, 1, '集合的概念', 'math-001-01', '集合的定义与表示', 1, 1, 2, '1,5', 1),
(1, 1, '集合的运算', 'math-001-02', '交集、并集、补集', 1, 2, 2, '1,6', 2),
(1, 2, '函数的概念', 'math-002-01', '定义域与值域', 1, 2, 2, '2,7', 1),
(1, 2, '函数的性质', 'math-002-02', '单调性、奇偶性、周期性', 2, 4, 2, '2,8', 2),
(1, 2, '指数函数', 'math-002-03', '指数函数的图像与性质', 2, 3, 2, '2,9', 3),
(1, 2, '对数函数', 'math-002-04', '对数函数的图像与性质', 2, 3, 2, '2,10', 4),
(1, 3, '任意角与弧度制', 'math-003-01', '角的概念推广', 1, 1, 2, '3,11', 1),
(1, 3, '三角函数的定义', 'math-003-02', '正弦、余弦、正切', 2, 3, 2, '3,12', 2),
(1, 3, '三角恒等变换', 'math-003-03', '和差倍角公式', 3, 4, 2, '3,13', 3),
(1, 4, '等差数列', 'math-004-01', '等差数列的通项与求和', 2, 3, 2, '4,14', 1),
(1, 4, '等比数列', 'math-004-02', '等比数列的通项与求和', 2, 3, 2, '4,15', 2),
(1, 4, '数列求和', 'math-004-03', '常见数列求和方法', 3, 4, 2, '4,16', 3);

-- 插入知识点关系
INSERT INTO `knowledge_relations` (`from_kp_id`, `to_kp_id`, `relation_type`, `weight`, `description`) VALUES
(5, 6, 'prerequisite', 1.00, '集合概念是集合运算的基础'),
(7, 8, 'prerequisite', 1.00, '函数概念是函数性质的基础'),
(8, 9, 'related', 0.80, '函数性质应用于指数函数'),
(8, 10, 'related', 0.80, '函数性质应用于对数函数'),
(11, 12, 'prerequisite', 1.00, '角的概念是三角函数定义的基础'),
(12, 13, 'prerequisite', 0.90, '三角函数定义是恒等变换的基础'),
(14, 15, 'related', 0.70, '等差数列与等比数列对比学习'),
(14, 16, 'prerequisite', 0.90, '等差数列是数列求和的基础'),
(15, 16, 'prerequisite', 0.90, '等比数列是数列求和的基础');

-- 插入测试题目
INSERT INTO `questions` (`subject_id`, `type`, `difficulty`, `content`, `options`, `answer`, `analysis`, `score`, `estimated_time`, `creator_id`) VALUES
(1, 'single_choice', 1, '已知集合 A = {1, 2, 3}，B = {2, 3, 4}，则 A ∩ B = ?', '{"A": "{1, 2, 3, 4}", "B": "{2, 3}", "C": "{1}", "D": "{4}"}', 'B', '交集是两个集合的公共元素，A和B的公共元素是2和3，所以A ∩ B = {2, 3}。', 5, 60, 2),
(1, 'single_choice', 1, '集合 {x | x > 2 且 x < 5} 用区间表示为?', '{"A": "(2, 5)", "B": "[2, 5]", "C": "(2, 5]", "D": "[2, 5)"}', 'A', 'x > 2 表示不包含2，x < 5 表示不包含5，所以用开区间(2, 5)表示。', 5, 45, 2),
(1, 'single_choice', 2, '函数 f(x) = x² - 2x + 1 的定义域是?', '{"A": "R", "B": "(0, +∞)", "C": "[1, +∞)", "D": "(-∞, 1]"}', 'A', '这是一个多项式函数，多项式函数的定义域是全体实数R。', 5, 30, 2),
(1, 'single_choice', 2, '下列函数中，是偶函数的是?', '{"A": "f(x) = x", "B": "f(x) = x³", "C": "f(x) = x²", "D": "f(x) = x + 1"}', 'C', '偶函数满足 f(-x) = f(x)。只有 f(x) = x² 满足 f(-x) = (-x)² = x² = f(x)。', 5, 60, 2),
(1, 'fill_blank', 2, '函数 f(x) = 2^x 的图像恒过点 ______。', NULL, '(0, 1)', '指数函数 f(x) = a^x (a > 0 且 a ≠ 1) 的图像恒过点(0, 1)，因为 a⁰ = 1。', 5, 30, 2),
(1, 'single_choice', 2, 'sin 30° 的值是?', '{"A": "1/2", "B": "√2/2", "C": "√3/2", "D": "1"}', 'A', '在直角三角形中，30°角对的直角边是斜边的一半，所以 sin 30° = 1/2。', 5, 20, 2),
(1, 'calculation', 3, '已知等差数列 {aₙ} 中，a₁ = 2，d = 3，求 a₁₀ 的值。', NULL, 'a₁₀ = 29', '等差数列通项公式：aₙ = a₁ + (n-1)d。所以 a₁₀ = 2 + (10-1)×3 = 2 + 27 = 29。', 10, 120, 2),
(1, 'calculation', 3, '求等比数列 1, 2, 4, 8, ... 的前5项和。', NULL, 'S₅ = 31', '等比数列首项 a₁ = 1，公比 q = 2。前n项和公式 Sₙ = a₁(1-qⁿ)/(1-q)。S₅ = 1×(1-2⁵)/(1-2) = (1-32)/(-1) = 31。', 10, 180, 2);

-- 关联题目与知识点
INSERT INTO `question_knowledge` (`question_id`, `knowledge_point_id`, `mastery_level`, `weight`, `is_primary`) VALUES
(1, 6, 1, 1.00, 1),
(2, 5, 1, 1.00, 1),
(3, 7, 1, 1.00, 1),
(4, 8, 2, 1.00, 1),
(5, 9, 2, 1.00, 1),
(6, 12, 1, 1.00, 1),
(7, 14, 2, 1.00, 1),
(8, 15, 2, 1.00, 1);

-- 插入练习
INSERT INTO `exercises` (`name`, `subject_id`, `creator_id`, `type`, `description`, `total_score`, `total_questions`, `time_limit`) VALUES
('数学基础诊断测试', 1, 2, 'diagnosis', '用于诊断学生数学基础知识掌握情况', 40, 8, 45),
('集合专项练习', 1, 2, 'practice', '集合知识点专项训练', 10, 2, 15),
('函数基础练习', 1, 2, 'practice', '函数基础知识点训练', 15, 3, 25);

-- 关联练习与题目
INSERT INTO `exercise_questions` (`exercise_id`, `question_id`, `score`, `sort_order`) VALUES
(1, 1, 5, 1),
(1, 2, 5, 2),
(1, 3, 5, 3),
(1, 4, 5, 4),
(1, 5, 5, 5),
(1, 6, 5, 6),
(1, 7, 5, 7),
(1, 8, 5, 8),
(2, 1, 5, 1),
(2, 2, 5, 2),
(3, 3, 5, 1),
(3, 4, 5, 2),
(3, 5, 5, 3);

-- ========================================
-- 创建索引优化
-- ========================================
CREATE INDEX `idx_ar_student_question` ON `answer_records` (`student_id`, `question_id`);
CREATE INDEX `idx_km_mastery_student` ON `knowledge_mastery` (`mastery_level`, `student_id`);
CREATE INDEX `idx_mh_student_date` ON `mastery_history` (`student_id`, `record_date`);

-- ========================================
-- 结束
-- ========================================
