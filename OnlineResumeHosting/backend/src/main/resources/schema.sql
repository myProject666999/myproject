-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码',
  `email` VARCHAR(100) COMMENT '邮箱',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 模板表
CREATE TABLE IF NOT EXISTS `template` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT '模板名称',
  `code` VARCHAR(50) NOT NULL COMMENT '模板编码',
  `description` VARCHAR(500) COMMENT '模板描述',
  `thumbnail_url` VARCHAR(255) COMMENT '缩略图地址',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='模板表';

-- 简历表
CREATE TABLE IF NOT EXISTS `resume` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `template_id` BIGINT DEFAULT 1 COMMENT '模板ID',
  `title` VARCHAR(200) NOT NULL COMMENT '简历标题',
  `name` VARCHAR(50) COMMENT '姓名',
  `gender` VARCHAR(10) COMMENT '性别',
  `phone` VARCHAR(20) COMMENT '电话',
  `email` VARCHAR(100) COMMENT '邮箱',
  `location` VARCHAR(100) COMMENT '所在城市',
  `avatar_url` VARCHAR(255) COMMENT '头像地址',
  `summary` TEXT COMMENT '个人简介',
  `is_public` TINYINT(1) DEFAULT 1 COMMENT '是否公开',
  `view_count` INT DEFAULT 0 COMMENT '浏览次数',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='简历表';

-- 教育经历表
CREATE TABLE IF NOT EXISTS `resume_education` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `resume_id` BIGINT NOT NULL COMMENT '简历ID',
  `school` VARCHAR(200) NOT NULL COMMENT '学校名称',
  `degree` VARCHAR(50) COMMENT '学历',
  `major` VARCHAR(100) COMMENT '专业',
  `start_date` DATE COMMENT '开始时间',
  `end_date` DATE COMMENT '结束时间',
  `description` TEXT COMMENT '描述',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  PRIMARY KEY (`id`),
  KEY `idx_resume_id` (`resume_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='教育经历表';

-- 工作经历表
CREATE TABLE IF NOT EXISTS `resume_experience` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `resume_id` BIGINT NOT NULL COMMENT '简历ID',
  `company` VARCHAR(200) NOT NULL COMMENT '公司名称',
  `position` VARCHAR(100) COMMENT '职位',
  `start_date` DATE COMMENT '开始时间',
  `end_date` DATE COMMENT '结束时间',
  `is_current` TINYINT(1) DEFAULT 0 COMMENT '是否在职',
  `description` TEXT COMMENT '工作描述',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  PRIMARY KEY (`id`),
  KEY `idx_resume_id` (`resume_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作经历表';

-- 项目经验表
CREATE TABLE IF NOT EXISTS `resume_project` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `resume_id` BIGINT NOT NULL COMMENT '简历ID',
  `name` VARCHAR(200) NOT NULL COMMENT '项目名称',
  `role` VARCHAR(100) COMMENT '担任角色',
  `start_date` DATE COMMENT '开始时间',
  `end_date` DATE COMMENT '结束时间',
  `description` TEXT COMMENT '项目描述',
  `technologies` VARCHAR(500) COMMENT '技术栈',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  PRIMARY KEY (`id`),
  KEY `idx_resume_id` (`resume_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目经验表';

-- 技能表
CREATE TABLE IF NOT EXISTS `resume_skill` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `resume_id` BIGINT NOT NULL COMMENT '简历ID',
  `name` VARCHAR(100) NOT NULL COMMENT '技能名称',
  `level` INT DEFAULT 5 COMMENT '熟练程度 1-10',
  `category` VARCHAR(50) COMMENT '分类',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  PRIMARY KEY (`id`),
  KEY `idx_resume_id` (`resume_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技能表';

-- 短链表
CREATE TABLE IF NOT EXISTS `short_link` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `resume_id` BIGINT NOT NULL COMMENT '简历ID',
  `short_code` VARCHAR(50) NOT NULL COMMENT '短链码',
  `original_url` VARCHAR(500) NOT NULL COMMENT '原始链接',
  `expire_at` DATETIME COMMENT '过期时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_short_code` (`short_code`),
  KEY `idx_resume_id` (`resume_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='短链表';

-- 访问日志表
CREATE TABLE IF NOT EXISTS `visit_log` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `resume_id` BIGINT NOT NULL COMMENT '简历ID',
  `ip` VARCHAR(50) COMMENT '访问IP',
  `user_agent` VARCHAR(500) COMMENT '浏览器标识',
  `referer` VARCHAR(500) COMMENT '来源',
  `visited_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_resume_id` (`resume_id`),
  KEY `idx_visited_at` (`visited_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='访问日志表';

-- 初始化模板数据
INSERT IGNORE INTO `template` (`id`, `name`, `code`, `description`, `is_active`) VALUES
(1, '经典模板', 'classic', '简洁经典的简历模板，适合大多数场景', 1),
(2, '现代模板', 'modern', '现代化设计风格，适合互联网行业', 1),
(3, '简约模板', 'minimal', '极简风格，突出内容本身', 1),
(4, '创意模板', 'creative', '创意设计，适合设计和创意岗位', 1);

-- 初始化测试用户
INSERT IGNORE INTO `user` (`id`, `username`, `password`, `email`) VALUES
(1, 'test', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'test@example.com');

-- 初始化测试简历
INSERT IGNORE INTO `resume` (`id`, `user_id`, `template_id`, `title`, `name`, `gender`, `phone`, `email`, `location`, `summary`) VALUES
(1, 1, 1, '我的简历', '张三', '男', '13800138000', 'zhangsan@example.com', '北京', '拥有5年Java开发经验，熟悉Spring Boot微服务架构，热衷于技术研究和分享。');
