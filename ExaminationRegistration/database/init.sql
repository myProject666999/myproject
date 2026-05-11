CREATE DATABASE IF NOT EXISTS `exam_registration` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `exam_registration`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `nickname` varchar(50) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `gender` int(11) DEFAULT 0,
  `birthday` datetime DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `role` varchar(20) DEFAULT 'user',
  `status` int(11) DEFAULT 1,
  `created_at` datetime(3) DEFAULT NULL,
  `updated_at` datetime(3) DEFAULT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_username` (`username`),
  KEY `idx_users_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `school_intros` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `content` text,
  `image` varchar(255) DEFAULT NULL,
  `view_count` int(11) DEFAULT 0,
  `like_count` int(11) DEFAULT 0,
  `dislike_count` int(11) DEFAULT 0,
  `sort` int(11) DEFAULT 0,
  `status` int(11) DEFAULT 1,
  `created_at` datetime(3) DEFAULT NULL,
  `updated_at` datetime(3) DEFAULT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_school_intros_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `intro_likes` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `intro_id` bigint(20) unsigned NOT NULL,
  `created_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_intro_likes_user_id` (`user_id`),
  KEY `idx_intro_likes_intro_id` (`intro_id`),
  UNIQUE KEY `uniq_user_intro_like` (`user_id`, `intro_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `intro_dislikes` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `intro_id` bigint(20) unsigned NOT NULL,
  `created_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_intro_dislikes_user_id` (`user_id`),
  KEY `idx_intro_dislikes_intro_id` (`intro_id`),
  UNIQUE KEY `uniq_user_intro_dislike` (`user_id`, `intro_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `favorites` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `target_type` varchar(50) NOT NULL,
  `target_id` bigint(20) unsigned NOT NULL,
  `created_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_favorites_user_id` (`user_id`),
  KEY `idx_favorites_target_id` (`target_id`),
  UNIQUE KEY `uniq_user_target` (`user_id`, `target_type`, `target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `enrollment_projects` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `description` text,
  `image` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT 0.00,
  `original_price` decimal(10,2) DEFAULT 0.00,
  `category` varchar(50) DEFAULT NULL,
  `duration` varchar(100) DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `status` int(11) DEFAULT 1,
  `sort` int(11) DEFAULT 0,
  `view_count` int(11) DEFAULT 0,
  `created_at` datetime(3) DEFAULT NULL,
  `updated_at` datetime(3) DEFAULT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_enrollment_projects_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `carts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `project_id` bigint(20) unsigned NOT NULL,
  `quantity` int(11) DEFAULT 1,
  `created_at` datetime(3) DEFAULT NULL,
  `updated_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_carts_user_id` (`user_id`),
  KEY `idx_carts_project_id` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `orders` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `order_no` varchar(50) NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `address_id` bigint(20) unsigned DEFAULT 0,
  `total_amount` decimal(10,2) DEFAULT 0.00,
  `status` varchar(20) DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_time` datetime DEFAULT NULL,
  `remark` varchar(500) DEFAULT NULL,
  `created_at` datetime(3) DEFAULT NULL,
  `updated_at` datetime(3) DEFAULT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_orders_order_no` (`order_no`),
  KEY `idx_orders_user_id` (`user_id`),
  KEY `idx_orders_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `order_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) unsigned NOT NULL,
  `project_id` bigint(20) unsigned NOT NULL,
  `project_name` varchar(200) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT 0.00,
  `quantity` int(11) DEFAULT 1,
  `created_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order_items_order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `addresses` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `province` varchar(50) DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  `district` varchar(50) DEFAULT NULL,
  `detail` varchar(255) DEFAULT NULL,
  `is_default` int(11) DEFAULT 0,
  `created_at` datetime(3) DEFAULT NULL,
  `updated_at` datetime(3) DEFAULT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_addresses_user_id` (`user_id`),
  KEY `idx_addresses_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `exam_papers` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `description` text,
  `category` varchar(50) DEFAULT NULL,
  `duration` int(11) DEFAULT 60,
  `total_score` int(11) DEFAULT 100,
  `pass_score` int(11) DEFAULT 60,
  `status` int(11) DEFAULT 1,
  `sort` int(11) DEFAULT 0,
  `created_at` datetime(3) DEFAULT NULL,
  `updated_at` datetime(3) DEFAULT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_exam_papers_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `questions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `paper_id` bigint(20) unsigned NOT NULL,
  `question_type` varchar(20) DEFAULT NULL,
  `content` text,
  `image` varchar(255) DEFAULT NULL,
  `answer` text,
  `analysis` text,
  `score` int(11) DEFAULT 0,
  `sort` int(11) DEFAULT 0,
  `created_at` datetime(3) DEFAULT NULL,
  `updated_at` datetime(3) DEFAULT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_questions_paper_id` (`paper_id`),
  KEY `idx_questions_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `question_options` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `question_id` bigint(20) unsigned NOT NULL,
  `option_key` varchar(10) DEFAULT NULL,
  `option_text` text,
  `sort` int(11) DEFAULT 0,
  `created_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_question_options_question_id` (`question_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `forum_posts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `title` varchar(200) NOT NULL,
  `content` text,
  `category` varchar(50) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `view_count` int(11) DEFAULT 0,
  `like_count` int(11) DEFAULT 0,
  `status` int(11) DEFAULT 1,
  `created_at` datetime(3) DEFAULT NULL,
  `updated_at` datetime(3) DEFAULT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_forum_posts_user_id` (`user_id`),
  KEY `idx_forum_posts_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `exam_records` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `paper_id` bigint(20) unsigned NOT NULL,
  `paper_title` varchar(200) DEFAULT NULL,
  `score` int(11) DEFAULT 0,
  `total_score` int(11) DEFAULT 100,
  `is_pass` int(11) DEFAULT 0,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `duration` int(11) DEFAULT 0,
  `created_at` datetime(3) DEFAULT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_exam_records_user_id` (`user_id`),
  KEY `idx_exam_records_paper_id` (`paper_id`),
  KEY `idx_exam_records_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `exam_answers` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `exam_record_id` bigint(20) unsigned NOT NULL,
  `question_id` bigint(20) unsigned NOT NULL,
  `user_answer` text,
  `correct_answer` text,
  `is_correct` int(11) DEFAULT 0,
  `score` int(11) DEFAULT 0,
  `created_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_exam_answers_exam_record_id` (`exam_record_id`),
  KEY `idx_exam_answers_question_id` (`question_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `wrong_questions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `question_id` bigint(20) unsigned NOT NULL,
  `paper_id` bigint(20) unsigned NOT NULL,
  `wrong_count` int(11) DEFAULT 1,
  `created_at` datetime(3) DEFAULT NULL,
  `updated_at` datetime(3) DEFAULT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_wrong_questions_user_id` (`user_id`),
  KEY `idx_wrong_questions_question_id` (`question_id`),
  KEY `idx_wrong_questions_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `school_intros` (`title`, `content`, `sort`, `status`) VALUES
('学校简介', '欢迎来到我们学校！这里提供优质的教育资源和培训服务，帮助学员实现自己的职业目标。', 1, 1),
('师资力量', '我们拥有一支专业的师资团队，所有教师都具有丰富的教学经验和行业背景。', 2, 1),
('教学环境', '学校配备了现代化的教学设施和舒适的学习环境，为学员提供最佳的学习体验。', 3, 1);

INSERT INTO `enrollment_projects` (`name`, `description`, `price`, `original_price`, `category`, `duration`, `status`, `sort`) VALUES
('Java开发工程师培训', '从零基础到就业的完整Java开发课程，涵盖Java基础、Web开发、框架应用等内容。', 5800.00, 8800.00, '编程语言', '3个月', 1, 1),
('前端开发工程师培训', '学习HTML、CSS、JavaScript、Vue、React等前端技术，成为专业的前端开发工程师。', 4980.00, 7800.00, '编程语言', '2个月', 1, 2),
('Python数据分析培训', '系统学习Python编程和数据分析技能，掌握数据处理、可视化和机器学习基础。', 3980.00, 5980.00, '数据科学', '2个月', 1, 3),
('软件测试工程师培训', '学习软件测试理论、自动化测试、性能测试等技能，成为专业的测试工程师。', 3580.00, 5580.00, '测试', '2个月', 1, 4);

INSERT INTO `exam_papers` (`title`, `description`, `category`, `duration`, `total_score`, `pass_score`, `status`, `sort`) VALUES
('Java基础考试', '测试Java基础知识掌握程度，包含面向对象、集合、多线程等内容。', '编程语言', 60, 100, 60, 1, 1),
('前端开发考试', '测试HTML、CSS、JavaScript、Vue等前端技术的掌握程度。', '前端', 60, 100, 60, 1, 2),
('Python基础考试', '测试Python基础语法、数据结构和常用库的掌握情况。', '编程语言', 60, 100, 60, 1, 3);

INSERT INTO `questions` (`paper_id`, `question_type`, `content`, `answer`, `score`, `sort`) VALUES
(1, 'single', 'Java中，以下哪个关键字用于定义常量？', 'B', 10, 1),
(1, 'single', 'Java中，ArrayList和LinkedList的区别是什么？', 'A', 10, 2),
(1, 'single', 'Java中，以下哪个不是基本数据类型？', 'C', 10, 3),
(1, 'single', 'Java中，异常处理的关键字不包括？', 'D', 10, 4),
(1, 'single', 'Java中，实现多线程的方式有几种？', 'C', 10, 5),
(2, 'single', 'HTML5新增的语义化标签是？', 'C', 10, 1),
(2, 'single', 'CSS中，flex布局的主轴对齐方式属性是？', 'B', 10, 2),
(2, 'single', 'JavaScript中，var、let、const的区别是？', 'D', 10, 3),
(3, 'single', 'Python中，以下哪个是不可变数据类型？', 'B', 10, 1),
(3, 'single', 'Python中，列表推导式的正确写法是？', 'A', 10, 2);

INSERT INTO `question_options` (`question_id`, `option_key`, `option_text`, `sort`) VALUES
(1, 'A', 'static', 1),
(1, 'B', 'final', 2),
(1, 'C', 'const', 3),
(1, 'D', 'private', 4),
(2, 'A', 'ArrayList基于数组，LinkedList基于链表', 1),
(2, 'B', 'ArrayList和LinkedList没有区别', 2),
(2, 'C', 'LinkedList查询更快', 3),
(2, 'D', 'ArrayList插入删除更快', 4),
(3, 'A', 'int', 1),
(3, 'B', 'char', 2),
(3, 'C', 'String', 3),
(3, 'D', 'boolean', 4),
(4, 'A', 'try', 1),
(4, 'B', 'catch', 2),
(4, 'C', 'finally', 3),
(4, 'D', 'throwable', 4),
(5, 'A', '1种', 1),
(5, 'B', '2种', 2),
(5, 'C', '3种以上', 3),
(5, 'D', '不能实现', 4),
(6, 'A', '<div>', 1),
(6, 'B', '<span>', 2),
(6, 'C', '<article>', 3),
(6, 'D', '<table>', 4),
(7, 'A', 'align-items', 1),
(7, 'B', 'justify-content', 2),
(7, 'C', 'flex-direction', 3),
(7, 'D', 'flex-wrap', 4),
(8, 'A', '都是一样的', 1),
(8, 'B', 'var有块级作用域', 2),
(8, 'C', 'let可以重复声明', 3),
(8, 'D', 'const声明的变量不能重新赋值', 4),
(9, 'A', 'list', 1),
(9, 'B', 'tuple', 2),
(9, 'C', 'dict', 3),
(9, 'D', 'set', 4),
(10, 'A', '[x*2 for x in range(10)]', 1),
(10, 'B', '(x*2 for x in range(10))', 2),
(10, 'C', '{x*2 for x in range(10)}', 3),
(10, 'D', 'x*2 for x in range(10)', 4);

INSERT INTO `users` (`username`, `password`, `email`, `nickname`, `role`, `status`) VALUES
('admin', '$2a$10$/OH/JODHn20nQ2jAftc8qeffy5cCz7yuXewhFQUGaKFw9aQfkw66e', 'admin@example.com', '系统管理员', 'admin', 1),
('testuser', '$2a$10$/OH/JODHn20nQ2jAftc8qeffy5cCz7yuXewhFQUGaKFw9aQfkw66e', 'test@example.com', '测试用户', 'user', 1);

INSERT INTO `forum_posts` (`user_id`, `title`, `content`, `category`, `view_count`, `like_count`, `status`) VALUES
(2, 'Java学习心得分享', '经过两个月的学习，我对Java有了深入的理解，想和大家分享一下我的学习心得...', '学习交流', 100, 20, 1),
(2, '前端面试经验', '最近面试了几家公司，整理了一些前端面试常见的问题和答案...', '求职面试', 150, 35, 1);
