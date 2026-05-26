-- ===========================================
-- 在线简历投递与招聘平台数据库脚本
-- ===========================================

CREATE DATABASE IF NOT EXISTS `online_recruitment` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `online_recruitment`;

SET FOREIGN_KEY_CHECKS = 0;

-- -------------------------------------------
-- 用户表（求职者/HR双角色）
-- -------------------------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码（加密）',
  `email` VARCHAR(100) NOT NULL COMMENT '邮箱',
  `phone` VARCHAR(20) COMMENT '手机号',
  `role` VARCHAR(20) NOT NULL COMMENT '角色：JOB_SEEKER-求职者，HR-企业HR',
  `avatar` VARCHAR(255) COMMENT '头像URL',
  `real_name` VARCHAR(50) COMMENT '真实姓名',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- -------------------------------------------
-- 企业信息表
-- -------------------------------------------
DROP TABLE IF EXISTS `company`;
CREATE TABLE `company` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '企业ID',
  `hr_id` BIGINT NOT NULL COMMENT 'HR用户ID',
  `name` VARCHAR(100) NOT NULL COMMENT '企业名称',
  `industry` VARCHAR(50) NOT NULL COMMENT '所属行业',
  `scale` VARCHAR(20) COMMENT '企业规模：0-20人，20-99人，100-499人，500-999人，1000人以上',
  `province` VARCHAR(50) COMMENT '省份',
  `city` VARCHAR(50) COMMENT '城市',
  `address` VARCHAR(255) COMMENT '详细地址',
  `logo` VARCHAR(255) COMMENT '企业Logo',
  `description` TEXT COMMENT '企业简介',
  `website` VARCHAR(255) COMMENT '官方网站',
  `verified` TINYINT NOT NULL DEFAULT 0 COMMENT '认证状态：0-未认证，1-已认证',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
  PRIMARY KEY (`id`),
  KEY `idx_hr_id` (`hr_id`),
  KEY `idx_industry` (`industry`),
  KEY `idx_city` (`city`),
  KEY `idx_verified` (`verified`),
  FULLTEXT KEY `ft_name_desc` (`name`, `description`),
  CONSTRAINT `fk_company_hr` FOREIGN KEY (`hr_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业信息表';

-- -------------------------------------------
-- 职位表
-- -------------------------------------------
DROP TABLE IF EXISTS `job`;
CREATE TABLE `job` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '职位ID',
  `company_id` BIGINT NOT NULL COMMENT '企业ID',
  `hr_id` BIGINT NOT NULL COMMENT '发布HR用户ID',
  `title` VARCHAR(100) NOT NULL COMMENT '职位名称',
  `department` VARCHAR(100) COMMENT '所属部门',
  `job_type` VARCHAR(20) NOT NULL DEFAULT 'FULL_TIME' COMMENT '工作类型：FULL_TIME-全职，PART_TIME-兼职，INTERN-实习',
  `min_salary` INT NOT NULL COMMENT '最低薪资（K）',
  `max_salary` INT NOT NULL COMMENT '最高薪资（K）',
  `salary_months` INT DEFAULT 12 COMMENT '薪资月份',
  `province` VARCHAR(50) NOT NULL COMMENT '工作省份',
  `city` VARCHAR(50) NOT NULL COMMENT '工作城市',
  `address` VARCHAR(255) COMMENT '详细地址',
  `experience` VARCHAR(20) COMMENT '经验要求：不限，1年以内，1-3年，3-5年，5-10年，10年以上',
  `education` VARCHAR(20) COMMENT '学历要求：不限，大专，本科，硕士，博士',
  `keywords` VARCHAR(255) COMMENT '关键词标签，逗号分隔',
  `description` TEXT NOT NULL COMMENT '职位描述',
  `requirements` TEXT COMMENT '任职要求',
  `benefits` TEXT COMMENT '福利待遇',
  `status` VARCHAR(20) NOT NULL DEFAULT 'OPEN' COMMENT '状态：OPEN-招聘中，PAUSED-已暂停，CLOSED-已关闭',
  `view_count` INT NOT NULL DEFAULT 0 COMMENT '浏览次数',
  `apply_count` INT NOT NULL DEFAULT 0 COMMENT '投递次数',
  `hot_score` INT NOT NULL DEFAULT 0 COMMENT '热度分数（用于热门职位排序）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
  PRIMARY KEY (`id`),
  KEY `idx_company_id` (`company_id`),
  KEY `idx_hr_id` (`hr_id`),
  KEY `idx_job_type` (`job_type`),
  KEY `idx_city` (`city`),
  KEY `idx_salary` (`min_salary`, `max_salary`),
  KEY `idx_status` (`status`),
  KEY `idx_hot_score` (`hot_score`),
  KEY `idx_created_at` (`created_at`),
  FULLTEXT KEY `ft_title_desc` (`title`, `description`, `requirements`),
  CONSTRAINT `fk_job_company` FOREIGN KEY (`company_id`) REFERENCES `company` (`id`),
  CONSTRAINT `fk_job_hr` FOREIGN KEY (`hr_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='职位表';

-- -------------------------------------------
-- 求职者简历表
-- -------------------------------------------
DROP TABLE IF EXISTS `resume`;
CREATE TABLE `resume` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '简历ID',
  `user_id` BIGINT NOT NULL COMMENT '求职者用户ID',
  `real_name` VARCHAR(50) NOT NULL COMMENT '真实姓名',
  `gender` VARCHAR(10) COMMENT '性别',
  `birthday` DATE COMMENT '出生日期',
  `phone` VARCHAR(20) NOT NULL COMMENT '手机号',
  `email` VARCHAR(100) COMMENT '邮箱',
  `province` VARCHAR(50) COMMENT '所在省份',
  `city` VARCHAR(50) COMMENT '所在城市',
  `avatar` VARCHAR(255) COMMENT '头像',
  `intention_position` VARCHAR(100) COMMENT '期望职位',
  `intention_city` VARCHAR(50) COMMENT '期望城市',
  `intention_salary_min` INT COMMENT '期望最低薪资（K）',
  `intention_salary_max` INT COMMENT '期望最高薪资（K）',
  `work_status` VARCHAR(20) COMMENT '求职状态：ON_JOB-在职，LOOKING-离职，FRESHER-应届生',
  `education` VARCHAR(20) COMMENT '最高学历',
  `graduate_school` VARCHAR(100) COMMENT '毕业院校',
  `major` VARCHAR(100) COMMENT '专业',
  `graduate_date` DATE COMMENT '毕业时间',
  `work_experience` INT DEFAULT 0 COMMENT '工作年限',
  `skills` TEXT COMMENT '技能标签，JSON格式',
  `self_introduction` TEXT COMMENT '自我介绍',
  `attachment_url` VARCHAR(255) COMMENT '附件简历URL',
  `is_public` TINYINT NOT NULL DEFAULT 0 COMMENT '是否公开：0-不公开，1-公开（仅HR可搜索）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_id` (`user_id`),
  KEY `idx_intention_position` (`intention_position`),
  KEY `idx_intention_city` (`intention_city`),
  KEY `idx_education` (`education`),
  KEY `idx_is_public` (`is_public`),
  FULLTEXT KEY `ft_skills_intro` (`skills`, `self_introduction`),
  CONSTRAINT `fk_resume_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='求职者简历表';

-- -------------------------------------------
-- 工作经历表
-- -------------------------------------------
DROP TABLE IF EXISTS `work_experience`;
CREATE TABLE `work_experience` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `resume_id` BIGINT NOT NULL COMMENT '简历ID',
  `company_name` VARCHAR(100) NOT NULL COMMENT '公司名称',
  `position` VARCHAR(100) NOT NULL COMMENT '职位',
  `start_date` DATE NOT NULL COMMENT '开始时间',
  `end_date` DATE COMMENT '结束时间，NULL表示至今',
  `description` TEXT COMMENT '工作描述',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_resume_id` (`resume_id`),
  CONSTRAINT `fk_work_exp_resume` FOREIGN KEY (`resume_id`) REFERENCES `resume` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工作经历表';

-- -------------------------------------------
-- 教育经历表
-- -------------------------------------------
DROP TABLE IF EXISTS `education_experience`;
CREATE TABLE `education_experience` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `resume_id` BIGINT NOT NULL COMMENT '简历ID',
  `school` VARCHAR(100) NOT NULL COMMENT '学校名称',
  `major` VARCHAR(100) NOT NULL COMMENT '专业',
  `education` VARCHAR(20) NOT NULL COMMENT '学历',
  `start_date` DATE NOT NULL COMMENT '开始时间',
  `end_date` DATE COMMENT '结束时间',
  `description` TEXT COMMENT '描述',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_resume_id` (`resume_id`),
  CONSTRAINT `fk_edu_exp_resume` FOREIGN KEY (`resume_id`) REFERENCES `resume` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教育经历表';

-- -------------------------------------------
-- 项目经历表
-- -------------------------------------------
DROP TABLE IF EXISTS `project_experience`;
CREATE TABLE `project_experience` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `resume_id` BIGINT NOT NULL COMMENT '简历ID',
  `name` VARCHAR(100) NOT NULL COMMENT '项目名称',
  `role` VARCHAR(100) COMMENT '担任角色',
  `start_date` DATE NOT NULL COMMENT '开始时间',
  `end_date` DATE COMMENT '结束时间',
  `description` TEXT COMMENT '项目描述',
  `technology` TEXT COMMENT '技术栈',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_resume_id` (`resume_id`),
  CONSTRAINT `fk_project_exp_resume` FOREIGN KEY (`resume_id`) REFERENCES `resume` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目经历表';

-- -------------------------------------------
-- 投递记录表（状态机核心）
-- -------------------------------------------
DROP TABLE IF EXISTS `job_application`;
CREATE TABLE `job_application` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '投递ID',
  `job_id` BIGINT NOT NULL COMMENT '职位ID',
  `resume_id` BIGINT NOT NULL COMMENT '简历ID',
  `user_id` BIGINT NOT NULL COMMENT '求职者用户ID',
  `company_id` BIGINT NOT NULL COMMENT '企业ID',
  `hr_id` BIGINT NOT NULL COMMENT 'HR用户ID',
  `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '投递状态：PENDING-待查看，VIEWED-已查看，PASSED-初筛通过，INTERVIEW-面试中，OFFER-已发Offer，REJECTED-已拒绝，HIRED-已录用',
  `resume_snapshot` TEXT COMMENT '简历快照（JSON，投递时的简历状态）',
  `hr_remark` TEXT COMMENT 'HR备注',
  `interview_time` DATETIME COMMENT '面试时间',
  `interview_venue` VARCHAR(255) COMMENT '面试地点',
  `applied_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '投递时间',
  `viewed_at` DATETIME COMMENT '查看时间',
  `processed_at` DATETIME COMMENT '处理时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_job_user` (`job_id`, `user_id`),
  KEY `idx_job_id` (`job_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_resume_id` (`resume_id`),
  KEY `idx_company_id` (`company_id`),
  KEY `idx_hr_id` (`hr_id`),
  KEY `idx_status` (`status`),
  KEY `idx_applied_at` (`applied_at`),
  CONSTRAINT `fk_apply_job` FOREIGN KEY (`job_id`) REFERENCES `job` (`id`),
  CONSTRAINT `fk_apply_resume` FOREIGN KEY (`resume_id`) REFERENCES `resume` (`id`),
  CONSTRAINT `fk_apply_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `fk_apply_company` FOREIGN KEY (`company_id`) REFERENCES `company` (`id`),
  CONSTRAINT `fk_apply_hr` FOREIGN KEY (`hr_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='投递记录表';

-- -------------------------------------------
-- 投递状态变更历史表（审计用）
-- -------------------------------------------
DROP TABLE IF EXISTS `application_status_history`;
CREATE TABLE `application_status_history` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `application_id` BIGINT NOT NULL COMMENT '投递ID',
  `operator_id` BIGINT NOT NULL COMMENT '操作人ID',
  `operator_role` VARCHAR(20) NOT NULL COMMENT '操作人角色',
  `from_status` VARCHAR(20) NOT NULL COMMENT '原状态',
  `to_status` VARCHAR(20) NOT NULL COMMENT '目标状态',
  `remark` TEXT COMMENT '变更原因',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_application_id` (`application_id`),
  KEY `idx_operator_id` (`operator_id`),
  CONSTRAINT `fk_status_history_apply` FOREIGN KEY (`application_id`) REFERENCES `job_application` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='投递状态变更历史表';

-- -------------------------------------------
-- 消息通知表
-- -------------------------------------------
DROP TABLE IF EXISTS `notification`;
CREATE TABLE `notification` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '通知ID',
  `receiver_id` BIGINT NOT NULL COMMENT '接收者用户ID',
  `sender_id` BIGINT COMMENT '发送者用户ID（系统发送为NULL）',
  `type` VARCHAR(20) NOT NULL COMMENT '通知类型：SYSTEM-系统通知，APPLICATION-投递通知，INTERVIEW-面试通知，MESSAGE-聊天消息',
  `title` VARCHAR(200) NOT NULL COMMENT '通知标题',
  `content` TEXT COMMENT '通知内容',
  `related_type` VARCHAR(20) COMMENT '关联类型：JOB-职位，APPLICATION-投递，CHAT-聊天',
  `related_id` BIGINT COMMENT '关联ID',
  `is_read` TINYINT NOT NULL DEFAULT 0 COMMENT '是否已读：0-未读，1-已读',
  `read_at` DATETIME COMMENT '读取时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_receiver_id` (`receiver_id`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_notification_receiver` FOREIGN KEY (`receiver_id`) REFERENCES `user` (`id`),
  CONSTRAINT `fk_notification_sender` FOREIGN KEY (`sender_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息通知表';

-- -------------------------------------------
-- 聊天消息表
-- -------------------------------------------
DROP TABLE IF EXISTS `chat_message`;
CREATE TABLE `chat_message` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '消息ID',
  `sender_id` BIGINT NOT NULL COMMENT '发送者ID',
  `receiver_id` BIGINT NOT NULL COMMENT '接收者ID',
  `application_id` BIGINT COMMENT '关联投递ID',
  `content` TEXT NOT NULL COMMENT '消息内容',
  `type` VARCHAR(20) NOT NULL DEFAULT 'TEXT' COMMENT '消息类型：TEXT-文本，IMAGE-图片，FILE-文件',
  `is_read` TINYINT NOT NULL DEFAULT 0 COMMENT '是否已读：0-未读，1-已读',
  `read_at` DATETIME COMMENT '读取时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_sender_receiver` (`sender_id`, `receiver_id`),
  KEY `idx_application_id` (`application_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_chat_sender` FOREIGN KEY (`sender_id`) REFERENCES `user` (`id`),
  CONSTRAINT `fk_chat_receiver` FOREIGN KEY (`receiver_id`) REFERENCES `user` (`id`),
  CONSTRAINT `fk_chat_application` FOREIGN KEY (`application_id`) REFERENCES `job_application` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='聊天消息表';

-- -------------------------------------------
-- 职位收藏表
-- -------------------------------------------
DROP TABLE IF EXISTS `job_favorite`;
CREATE TABLE `job_favorite` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `job_id` BIGINT NOT NULL COMMENT '职位ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_job` (`user_id`, `job_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_job_id` (`job_id`),
  CONSTRAINT `fk_favorite_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `fk_favorite_job` FOREIGN KEY (`job_id`) REFERENCES `job` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='职位收藏表';

SET FOREIGN_KEY_CHECKS = 1;

-- ===========================================
-- 初始化数据
-- ===========================================

-- 插入测试用户
INSERT INTO `user` (`username`, `password`, `email`, `phone`, `role`, `real_name`, `status`) VALUES
('jobseeker1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'jobseeker1@example.com', '13800138001', 'JOB_SEEKER', '张三', 1),
('jobseeker2', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'jobseeker2@example.com', '13800138002', 'JOB_SEEKER', '李四', 1),
('hr1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'hr1@example.com', '13900139001', 'HR', '王HR', 1),
('hr2', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'hr2@example.com', '13900139002', 'HR', '李HR', 1);

-- 插入测试企业
INSERT INTO `company` (`hr_id`, `name`, `industry`, `scale`, `province`, `city`, `address`, `description`, `verified`) VALUES
(3, '字节跳动科技有限公司', '互联网/信息技术', '1000人以上', '北京市', '北京市', '海淀区知春路', '字节跳动是一家全球化的科技公司', 1),
(3, '阿里巴巴集团', '互联网/电子商务', '1000人以上', '浙江省', '杭州市', '余杭区文一西路', '阿里巴巴集团是全球领先的电子商务公司', 1),
(4, '腾讯科技', '互联网/游戏', '1000人以上', '广东省', '深圳市', '南山区科技园', '腾讯是中国最大的互联网综合服务提供商之一', 1);

-- 插入测试职位
INSERT INTO `job` (`company_id`, `hr_id`, `title`, `department`, `job_type`, `min_salary`, `max_salary`, `salary_months`, `province`, `city`, `experience`, `education`, `keywords`, `description`, `requirements`, `benefits`, `status`, `hot_score`) VALUES
(1, 3, '高级Java开发工程师', '后端研发部', 'FULL_TIME', 25, 45, 16, '北京市', '北京市', '3-5年', '本科', 'Java,SpringBoot,MySQL,Redis', '负责公司核心业务系统的开发与维护', '1. 3年以上Java开发经验\n2. 熟悉SpringBoot等主流框架\n3. 熟悉MySQL和Redis', '五险一金,年终奖,带薪年假,免费三餐', 'OPEN', 95),
(1, 3, '前端开发工程师', '前端研发部', 'FULL_TIME', 20, 40, 16, '北京市', '北京市', '1-3年', '本科', 'React,Vue,TypeScript', '负责公司Web产品的前端开发工作', '1. 1年以上前端开发经验\n2. 熟悉React或Vue框架\n3. 熟悉TypeScript', '五险一金,年终奖,带薪年假,免费三餐', 'OPEN', 88),
(2, 3, '数据分析师', '数据中台', 'FULL_TIME', 18, 35, 16, '浙江省', '杭州市', '1-3年', '本科', 'Python,SQL,数据分析', '负责业务数据分析与报表制作', '1. 熟悉Python和SQL\n2. 有数据分析相关经验', '五险一金,股票期权,带薪年假', 'OPEN', 82),
(3, 4, '游戏客户端开发', '游戏研发部', 'FULL_TIME', 30, 50, 16, '广东省', '深圳市', '3-5年', '本科', 'Unity,C#,游戏开发', '负责游戏客户端的开发与优化', '1. 3年以上Unity开发经验\n2. 熟悉C#编程语言', '五险一金,年终奖,健身房', 'OPEN', 90),
(3, 4, '产品经理', '产品部', 'FULL_TIME', 25, 45, 16, '广东省', '深圳市', '3-5年', '本科', '产品设计,需求分析,PRD', '负责产品规划与需求管理', '1. 3年以上产品经理经验\n2. 有成功上线的产品案例', '五险一金,股票期权,带薪年假', 'OPEN', 85),
(1, 3, '后端开发实习生', '后端研发部', 'INTERN', 4, 6, 12, '北京市', '北京市', '不限', '本科', 'Java,SpringBoot', '参与后端系统的开发工作', '1. 熟悉Java基础\n2. 每周至少实习4天', '实习补贴,免费三餐,转正机会', 'OPEN', 70);

-- 插入测试简历
INSERT INTO `resume` (`user_id`, `real_name`, `gender`, `phone`, `email`, `province`, `city`, `intention_position`, `intention_city`, `intention_salary_min`, `intention_salary_max`, `work_status`, `education`, `graduate_school`, `major`, `work_experience`, `self_introduction`, `is_public`) VALUES
(1, '张三', '男', '13800138001', 'jobseeker1@example.com', '北京市', '北京市', '高级Java开发工程师', '北京市', 25, 35, 'ON_JOB', '本科', '北京大学', '计算机科学与技术', 5, '5年Java开发经验，精通SpringBoot微服务架构，有大型分布式系统开发经验。', 1),
(2, '李四', '女', '13800138002', 'jobseeker2@example.com', '浙江省', '杭州市', '前端开发工程师', '杭州市', 18, 28, 'LOOKING', '本科', '浙江大学', '软件工程', 2, '2年前端开发经验，熟悉React和Vue框架，对用户体验有深入理解。', 1);

-- 插入测试工作经历
INSERT INTO `work_experience` (`resume_id`, `company_name`, `position`, `start_date`, `end_date`, `description`) VALUES
(1, '美团点评', 'Java开发工程师', '2019-07-01', '2021-06-30', '负责外卖平台的订单系统开发'),
(1, '京东', '高级Java开发工程师', '2021-07-01', NULL, '负责京东商城的商品系统架构设计与开发'),
(2, '网易', '前端开发工程师', '2021-07-01', '2023-05-31', '负责网易云音乐Web端的开发');

-- 插入测试教育经历
INSERT INTO `education_experience` (`resume_id`, `school`, `major`, `education`, `start_date`, `end_date`) VALUES
(1, '北京大学', '计算机科学与技术', '本科', '2015-09-01', '2019-06-30'),
(2, '浙江大学', '软件工程', '本科', '2017-09-01', '2021-06-30');

-- 插入测试投递记录
INSERT INTO `job_application` (`job_id`, `resume_id`, `user_id`, `company_id`, `hr_id`, `status`, `applied_at`) VALUES
(1, 1, 1, 1, 3, 'VIEWED', '2024-01-15 10:30:00'),
(2, 1, 1, 1, 3, 'PENDING', '2024-01-16 14:20:00'),
(4, 2, 2, 3, 4, 'PASSED', '2024-01-10 09:00:00'),
(5, 2, 2, 3, 4, 'INTERVIEW', '2024-01-12 11:00:00');

-- 插入测试状态历史
INSERT INTO `application_status_history` (`application_id`, `operator_id`, `operator_role`, `from_status`, `to_status`, `remark`) VALUES
(3, 4, 'HR', 'PENDING', 'VIEWED', 'HR查看了简历'),
(3, 4, 'HR', 'VIEWED', 'PASSED', '初筛通过，邀请面试'),
(4, 4, 'HR', 'PENDING', 'VIEWED', 'HR查看了简历'),
(4, 4, 'HR', 'VIEWED', 'PASSED', '初筛通过'),
(4, 4, 'HR', 'PASSED', 'INTERVIEW', '安排面试');

-- 插入测试通知
INSERT INTO `notification` (`receiver_id`, `sender_id`, `type`, `title`, `content`, `related_type`, `related_id`) VALUES
(1, 3, 'APPLICATION', '您的简历已被查看', '您好，您投递的"高级Java开发工程师"职位简历已被HR查看。', 'APPLICATION', 1),
(2, 4, 'INTERVIEW', '面试邀请', '您好，您投递的"游戏客户端开发"职位已通过初筛，请参加面试。', 'APPLICATION', 4),
(3, NULL, 'SYSTEM', '新简历投递', '您发布的"高级Java开发工程师"职位收到一份新的简历投递。', 'APPLICATION', 1);

-- 插入测试职位收藏
INSERT INTO `job_favorite` (`user_id`, `job_id`) VALUES
(1, 4),
(1, 5),
(2, 1),
(2, 2);

-- ===========================================
-- 常用查询视图
-- ===========================================

-- 职位详情视图
CREATE OR REPLACE VIEW `v_job_detail` AS
SELECT 
  j.*,
  c.name AS company_name,
  c.industry AS company_industry,
  c.scale AS company_scale,
  c.logo AS company_logo,
  c.verified AS company_verified,
  u.username AS hr_username,
  u.real_name AS hr_real_name
FROM `job` j
INNER JOIN `company` c ON j.company_id = c.id
INNER JOIN `user` u ON j.hr_id = u.id
WHERE j.deleted = 0 AND c.deleted = 0;

-- 投递记录详情视图
CREATE OR REPLACE VIEW `v_application_detail` AS
SELECT 
  a.*,
  j.title AS job_title,
  j.min_salary,
  j.max_salary,
  j.city AS job_city,
  c.name AS company_name,
  c.logo AS company_logo,
  r.real_name AS applicant_name,
  r.phone AS applicant_phone,
  r.education AS applicant_education,
  r.work_experience AS applicant_work_years,
  u.username AS applicant_username
FROM `job_application` a
INNER JOIN `job` j ON a.job_id = j.id
INNER JOIN `company` c ON a.company_id = c.id
INNER JOIN `resume` r ON a.resume_id = r.id
INNER JOIN `user` u ON a.user_id = u.id
WHERE a.deleted = 0;

COMMIT;

-- ===========================================
-- 数据库脚本执行完成
-- ===========================================
