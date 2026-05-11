-- 学生综合素质测评管理系统数据库初始化脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS student_quality_system DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE student_quality_system;

-- 用户表（教师、学生、管理员
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码',
  `role` VARCHAR(20) NOT NULL COMMENT '角色: admin/teacher/student',
  `real_name` VARCHAR(50) NOT NULL COMMENT '真实姓名',
  `email` VARCHAR(100) COMMENT '邮箱',
  `phone` VARCHAR(20) COMMENT '电话',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 教师信息表
CREATE TABLE IF NOT EXISTS `teachers` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '教师ID',
  `user_id` BIGINT NOT NULL COMMENT '关联用户ID',
  `teacher_no` VARCHAR(20) NOT NULL UNIQUE COMMENT '工号',
  `real_name` VARCHAR(50) NOT NULL COMMENT '姓名',
  `gender` VARCHAR(10) COMMENT '性别',
  `title` VARCHAR(50) COMMENT '职称',
  `department` VARCHAR(100) COMMENT '部门',
  `major` VARCHAR(100) COMMENT '专业方向',
  `email` VARCHAR(100) COMMENT '邮箱',
  `phone` VARCHAR(20) COMMENT '电话',
  `address` VARCHAR(255) COMMENT '地址',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 学生信息表
CREATE TABLE IF NOT EXISTS `students` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '学生ID',
  `user_id` BIGINT NOT NULL COMMENT '关联用户ID',
  `student_no` VARCHAR(20) NOT NULL UNIQUE COMMENT '学号',
  `real_name` VARCHAR(50) NOT NULL COMMENT '姓名',
  `gender` VARCHAR(10) COMMENT '性别',
  `class_name` VARCHAR(50) COMMENT '班级',
  `grade` VARCHAR(20) COMMENT '年级',
  `major` VARCHAR(100) COMMENT '专业',
  `department` VARCHAR(100) COMMENT '学院/系',
  `email` VARCHAR(100) COMMENT '邮箱',
  `phone` VARCHAR(20) COMMENT '电话',
  `address` VARCHAR(255) COMMENT '家庭地址',
  `id_card` VARCHAR(20) COMMENT '身份证号',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 成绩表
CREATE TABLE IF NOT EXISTS `grades` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '成绩ID',
  `student_id` BIGINT NOT NULL COMMENT '学生ID',
  `student_no` VARCHAR(20) NOT NULL COMMENT '学号',
  `student_name` VARCHAR(50) NOT NULL COMMENT '学生姓名',
  `course_name` VARCHAR(100) NOT NULL COMMENT '课程名称',
  `semester` VARCHAR(50) COMMENT '学期',
  `score` DECIMAL(5,2) NOT NULL COMMENT '成绩',
  `credit` DECIMAL(3,1) COMMENT '学分',
  `exam_type` VARCHAR(20) COMMENT '考试类型',
  `remark` VARCHAR(255) COMMENT '备注',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 奖惩表
CREATE TABLE IF NOT EXISTS `rewards_punishments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '奖惩ID',
  `student_id` BIGINT NOT NULL COMMENT '学生ID',
  `student_no` VARCHAR(20) NOT NULL COMMENT '学号',
  `student_name` VARCHAR(50) NOT NULL COMMENT '学生姓名',
  `type` VARCHAR(20) NOT NULL COMMENT '类型: reward/punishment',
  `title` VARCHAR(100) NOT NULL COMMENT '标题',
  `content` TEXT COMMENT '内容描述',
  `date` DATE COMMENT '日期',
  `level` VARCHAR(50) COMMENT '级别',
  `description` TEXT COMMENT '详细描述',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 能力加分表
CREATE TABLE IF NOT EXISTS `ability_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '加分ID',
  `student_id` BIGINT NOT NULL COMMENT '学生ID',
  `student_no` VARCHAR(20) NOT NULL COMMENT '学号',
  `student_name` VARCHAR(50) NOT NULL COMMENT '学生姓名',
  `category` VARCHAR(50) NOT NULL COMMENT '加分类型',
  `title` VARCHAR(100) NOT NULL COMMENT '项目名称',
  `points` DECIMAL(5,2) NOT NULL COMMENT '加分值',
  `description` TEXT COMMENT '描述',
  `date` DATE COMMENT '日期',
  `status` VARCHAR(20) DEFAULT 'pending' COMMENT '状态: pending/approved/rejected',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 综合素质测评表
CREATE TABLE IF NOT EXISTS `evaluations` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '测评ID',
  `student_id` BIGINT NOT NULL COMMENT '学生ID',
  `student_no` VARCHAR(20) NOT NULL COMMENT '学号',
  `student_name` VARCHAR(50) NOT NULL COMMENT '学生姓名',
  `semester` VARCHAR(50) COMMENT '学期',
  `academic_score` DECIMAL(5,2) COMMENT '学业成绩分',
  `moral_score` DECIMAL(5,2) COMMENT '思想品德分',
  `ability_score` DECIMAL(5,2) COMMENT '能力加分',
  `total_score` DECIMAL(5,2) COMMENT '总分',
  `level` VARCHAR(20) COMMENT '等级',
  `comment` TEXT COMMENT '评语',
  `status` VARCHAR(20) DEFAULT 'draft' COMMENT '状态: draft/submitted/approved',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 留言板表
CREATE TABLE IF NOT EXISTS `messages` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '留言ID',
  `sender_id` BIGINT NOT NULL COMMENT '发送者ID',
  `sender_name` VARCHAR(50) NOT NULL COMMENT '发送者姓名',
  `sender_role` VARCHAR(20) NOT NULL COMMENT '发送者角色',
  `title` VARCHAR(100) NOT NULL COMMENT '标题',
  `content` TEXT NOT NULL COMMENT '留言内容',
  `reply` TEXT COMMENT '回复内容',
  `reply_time` DATETIME COMMENT '回复时间',
  `status` VARCHAR(20) DEFAULT 'unreplied' COMMENT '状态: unreplied/replied',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 权限表（用于动态权限配置
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `role` VARCHAR(20) NOT NULL COMMENT '角色',
  `module` VARCHAR(50) NOT NULL COMMENT '模块',
  `can_view` TINYINT(1) DEFAULT 1 COMMENT '是否可查看',
  `can_create` TINYINT(1) DEFAULT 0 COMMENT '是否可新增',
  `can_update` TINYINT(1) DEFAULT 0 COMMENT '是否可修改',
  `can_delete` TINYINT(1) DEFAULT 0 COMMENT '是否可删除',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_role_module` (`role`, `module`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 初始化默认数据
-- 管理员账号: admin/123456
INSERT INTO users (username, password, role, real_name, email, phone) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZI.uCRwbdYilmz5Xbw4e721a', 'admin', '系统管理员', 'admin@example.com', '13800138000');

-- 教师账号: teacher01/123456
INSERT INTO users (username, password, role, real_name, email, phone) VALUES
('teacher01', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZI.uCRwbdYilmz5Xbw4e721a', 'teacher', '张老师', 'teacher@example.com', '13900139000');

-- 学生账号: student01/123456
INSERT INTO users (username, password, role, real_name, email, phone) VALUES
('student01', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZI.uCRwbdYilmz5Xbw4e721a', 'student', '李学生', 'student@example.com', '13700137000');

-- 初始化权限配置
INSERT INTO permissions (role, module, can_view, can_create, can_update, can_delete) VALUES
-- 管理员权限
('admin', 'personal', 1, 1, 1, 1),
('admin', 'rewards', 1, 1, 1, 1),
('admin', 'messages', 1, 1, 1, 1),
('admin', 'ability', 1, 1, 1, 1),
('admin', 'evaluation', 1, 1, 1, 1),
('admin', 'grades', 1, 1, 1, 1),
('admin', 'teachers', 1, 1, 1, 1),
('admin', 'students', 1, 1, 1, 1),
('admin', 'permissions', 1, 1, 1, 1),
-- 教师权限
('teacher', 'personal', 1, 0, 1, 0),
('teacher', 'grades', 1, 1, 1, 1),
('teacher', 'teachers', 1, 0, 1, 0),
('teacher', 'students', 1, 1, 1, 0),
('teacher', 'rewards', 1, 1, 1, 1),
('teacher', 'messages', 1, 1, 1, 1),
('teacher', 'ability', 1, 1, 1, 1),
('teacher', 'evaluation', 1, 1, 1, 1),
-- 学生权限
('student', 'personal', 1, 0, 1, 0),
('student', 'grades', 1, 0, 0, 0),
('student', 'messages', 1, 1, 0, 0);
