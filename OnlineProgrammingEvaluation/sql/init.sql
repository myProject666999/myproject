-- =====================================================
-- 在线编程评测系统 (Online Judge) 数据库脚本
-- =====================================================

DROP DATABASE IF EXISTS `online_judge`;
CREATE DATABASE `online_judge` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `online_judge`;

-- -----------------------------------------------------
-- 用户表
-- -----------------------------------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id`            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username`      VARCHAR(50)  NOT NULL COMMENT '用户名(登录)',
  `password`      VARCHAR(100) NOT NULL COMMENT '密码(BCrypt加密)',
  `nickname`      VARCHAR(50)  DEFAULT NULL COMMENT '昵称',
  `email`         VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  `avatar`        VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  `role`          TINYINT      NOT NULL DEFAULT 0 COMMENT '角色: 0-普通用户 1-管理员',
  `status`        TINYINT      NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用 1-正常',
  `solved_count`  INT          NOT NULL DEFAULT 0 COMMENT '通过题目数',
  `submit_count`  INT          NOT NULL DEFAULT 0 COMMENT '提交次数',
  `rating`        INT          NOT NULL DEFAULT 1500 COMMENT '积分(初始1500)',
  `create_time`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- -----------------------------------------------------
-- 题目表
-- -----------------------------------------------------
DROP TABLE IF EXISTS `problem`;
CREATE TABLE `problem` (
  `id`             BIGINT        NOT NULL AUTO_INCREMENT COMMENT '题目ID',
  `title`          VARCHAR(200)  NOT NULL COMMENT '题目标题',
  `description`    TEXT          NOT NULL COMMENT '题目描述',
  `input_desc`     TEXT          COMMENT '输入描述',
  `output_desc`    TEXT          COMMENT '输出描述',
  `sample_input`   TEXT          COMMENT '样例输入',
  `sample_output`  TEXT          COMMENT '样例输出',
  `hint`           TEXT          COMMENT '提示',
  `difficulty`     TINYINT       NOT NULL DEFAULT 1 COMMENT '难度: 1-简单 2-中等 3-困难',
  `time_limit`     INT           NOT NULL DEFAULT 1000 COMMENT '时间限制(ms)',
  `memory_limit`   INT           NOT NULL DEFAULT 256 COMMENT '内存限制(MB)',
  `status`         TINYINT       NOT NULL DEFAULT 1 COMMENT '状态: 0-隐藏 1-公开',
  `submit_count`   INT           NOT NULL DEFAULT 0 COMMENT '提交次数',
  `accepted_count` INT           NOT NULL DEFAULT 0 COMMENT '通过次数',
  `create_time`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_difficulty` (`difficulty`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='题目表';

-- -----------------------------------------------------
-- 题目标签表
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tag`;
CREATE TABLE `tag` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '标签ID',
  `name`        VARCHAR(50)  NOT NULL COMMENT '标签名称',
  `create_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='标签表';

-- -----------------------------------------------------
-- 题目-标签关联表
-- -----------------------------------------------------
DROP TABLE IF EXISTS `problem_tag`;
CREATE TABLE `problem_tag` (
  `problem_id` BIGINT NOT NULL COMMENT '题目ID',
  `tag_id`     BIGINT NOT NULL COMMENT '标签ID',
  PRIMARY KEY (`problem_id`, `tag_id`),
  KEY `idx_tag_id` (`tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='题目-标签关联表';

-- -----------------------------------------------------
-- 题目测试用例表
-- -----------------------------------------------------
DROP TABLE IF EXISTS `problem_case`;
CREATE TABLE `problem_case` (
  `id`          BIGINT    NOT NULL AUTO_INCREMENT COMMENT '测试用例ID',
  `problem_id`  BIGINT    NOT NULL COMMENT '题目ID',
  `input`       TEXT      NOT NULL COMMENT '测试输入',
  `output`      TEXT      NOT NULL COMMENT '期望输出',
  `is_sample`   TINYINT   NOT NULL DEFAULT 0 COMMENT '是否样例: 0-否 1-是',
  `create_time` DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_problem_id` (`problem_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='题目测试用例表';

-- -----------------------------------------------------
-- 提交记录表
-- -----------------------------------------------------
DROP TABLE IF EXISTS `submission`;
CREATE TABLE `submission` (
  `id`           BIGINT        NOT NULL AUTO_INCREMENT COMMENT '提交ID',
  `user_id`      BIGINT        NOT NULL COMMENT '用户ID',
  `problem_id`   BIGINT        NOT NULL COMMENT '题目ID',
  `contest_id`   BIGINT        DEFAULT NULL COMMENT '竞赛ID(可为空)',
  `language`     VARCHAR(20)   NOT NULL COMMENT '编程语言: C/C++/Java/Python',
  `code`         MEDIUMTEXT    NOT NULL COMMENT '提交代码',
  `status`       TINYINT       NOT NULL DEFAULT 0 COMMENT '判题状态: 0-等待 1-判题中 2-Accepted 3-WrongAnswer 4-TimeLimitExceeded 5-MemoryLimitExceeded 6-RuntimeError 7-CompileError 8-SystemError',
  `score`        INT           DEFAULT NULL COMMENT '得分(0-100)',
  `time_used`    INT           DEFAULT NULL COMMENT '运行时间(ms)',
  `memory_used`  INT           DEFAULT NULL COMMENT '运行内存(MB)',
  `case_count`   INT           DEFAULT NULL COMMENT '通过测试用例数',
  `total_case`   INT           DEFAULT NULL COMMENT '总测试用例数',
  `error_msg`    TEXT          COMMENT '错误/编译信息',
  `create_time`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_problem_id` (`problem_id`),
  KEY `idx_contest_id` (`contest_id`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='提交记录表';

-- -----------------------------------------------------
-- 竞赛表
-- -----------------------------------------------------
DROP TABLE IF EXISTS `contest`;
CREATE TABLE `contest` (
  `id`            BIGINT        NOT NULL AUTO_INCREMENT COMMENT '竞赛ID',
  `title`         VARCHAR(200)  NOT NULL COMMENT '竞赛标题',
  `description`   TEXT          COMMENT '竞赛描述',
  `start_time`    DATETIME      NOT NULL COMMENT '开始时间',
  `end_time`      DATETIME      NOT NULL COMMENT '结束时间',
  `type`          TINYINT       NOT NULL DEFAULT 0 COMMENT '类型: 0-标准赛 2-CF赛',
  `status`        TINYINT       NOT NULL DEFAULT 1 COMMENT '状态: 0-未开始 1-进行中 2-已结束',
  `password`      VARCHAR(50)   DEFAULT NULL COMMENT '加入密码(可为空)',
  `create_time`   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_start_time` (`start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='竞赛表';

-- -----------------------------------------------------
-- 竞赛-题目关联表
-- -----------------------------------------------------
DROP TABLE IF EXISTS `contest_problem`;
CREATE TABLE `contest_problem` (
  `contest_id`  BIGINT NOT NULL COMMENT '竞赛ID',
  `problem_id`  BIGINT NOT NULL COMMENT '题目ID',
  `order_index` INT    NOT NULL COMMENT '题目序号(1,2,3...)',
  PRIMARY KEY (`contest_id`, `problem_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='竞赛-题目关联表';

-- -----------------------------------------------------
-- 竞赛-用户参赛记录表
-- -----------------------------------------------------
DROP TABLE IF EXISTS `contest_user`;
CREATE TABLE `contest_user` (
  `contest_id`   BIGINT   NOT NULL COMMENT '竞赛ID',
  `user_id`      BIGINT   NOT NULL COMMENT '用户ID',
  `rank`         INT      DEFAULT NULL COMMENT '排名',
  `solved_count` INT      NOT NULL DEFAULT 0 COMMENT '通过题目数',
  `penalty`      INT      NOT NULL DEFAULT 0 COMMENT '罚时(秒)',
  `join_time`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '参赛时间',
  PRIMARY KEY (`contest_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='竞赛-用户参赛记录表';

-- -----------------------------------------------------
-- 用户AC记录表(记录每个用户对每道题的AC时间)
-- -----------------------------------------------------
DROP TABLE IF EXISTS `user_problem_ac`;
CREATE TABLE `user_problem_ac` (
  `user_id`     BIGINT   NOT NULL COMMENT '用户ID',
  `problem_id`  BIGINT   NOT NULL COMMENT '题目ID',
  `submission_id` BIGINT NOT NULL COMMENT 'AC的提交ID',
  `ac_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'AC时间',
  PRIMARY KEY (`user_id`, `problem_id`),
  KEY `idx_problem_id` (`problem_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户AC记录表';

-- -----------------------------------------------------
-- 公告表
-- -----------------------------------------------------
DROP TABLE IF EXISTS `announcement`;
CREATE TABLE `announcement` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '公告ID',
  `title`       VARCHAR(200) NOT NULL COMMENT '公告标题',
  `content`     TEXT         NOT NULL COMMENT '公告内容',
  `priority`    TINYINT      NOT NULL DEFAULT 0 COMMENT '优先级: 0-普通 1-置顶',
  `create_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公告表';

-- -----------------------------------------------------
-- 系统设置表
-- -----------------------------------------------------
DROP TABLE IF EXISTS `system_config`;
CREATE TABLE `system_config` (
  `config_key`   VARCHAR(100) NOT NULL COMMENT '配置键',
  `config_value` TEXT         COMMENT '配置值',
  `description`  VARCHAR(200) COMMENT '描述',
  PRIMARY KEY (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统设置表';

-- =====================================================
-- 初始数据
-- =====================================================

-- 默认管理员 (用户名: admin, 密码: admin123)
INSERT INTO `user` (`username`, `password`, `nickname`, `email`, `role`, `status`)
VALUES ('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '超级管理员', 'admin@oj.com', 1, 1);

-- 默认标签
INSERT INTO `tag` (`name`) VALUES ('入门'), ('模拟'), ('数学'), ('字符串'), ('数组'), ('链表'), ('栈'), ('队列'), ('哈希表'), ('双指针'), ('二分查找'), ('排序'), ('动态规划'), ('贪心'), ('图论'), ('树'), ('DFS'), ('BFS'), ('回溯'), ('分治'), ('位运算');

-- 系统配置
INSERT INTO `system_config` (`config_key`, `config_value`, `description`) VALUES
('site_name', '在线编程评测系统', '站点名称'),
('default_time_limit', '1000', '默认时间限制(ms)'),
('default_memory_limit', '256', '默认内存限制(MB)'),
('max_code_length', '65536', '最大代码长度(Bytes)'),
('judge_concurrency', '2', '判题并发数');

-- 示例题目
INSERT INTO `problem` (`title`, `description`, `input_desc`, `output_desc`, `sample_input`, `sample_output`, `difficulty`, `time_limit`, `memory_limit`, `status`) VALUES
('A + B', '计算两个整数A和B的和。', '输入包含两个整数A和B,范围为[-10^9, 10^9]。', '输出一个整数,即A+B的结果。', '1 2', '3', 1, 1000, 256, 1),
('Hello World', '请输出"Hello World!"。', '无输入。', '输出一行"Hello World!"。', '', 'Hello World!', 1, 1000, 256, 1);

-- 示例测试用例
INSERT INTO `problem_case` (`problem_id`, `input`, `output`, `is_sample`) VALUES
(1, '1 2', '3', 1),
(1, '1000000000 1000000000', '2000000000', 0),
(1, '-5 7', '2', 0),
(1, '0 0', '0', 0),
(2, '', 'Hello World!', 1);

-- 示例标签关联
INSERT INTO `problem_tag` (`problem_id`, `tag_id`) VALUES
(1, 1), (1, 3),
(2, 1);

-- 示例公告
INSERT INTO `announcement` (`title`, `content`, `priority`, `create_time`) VALUES
('欢迎使用在线编程评测系统', '本系统支持C/C++/Java/Python多种语言，欢迎开始你的编程之旅！', 1, NOW()),
('系统更新说明', '新增竞赛功能与排行榜。', 0, NOW());
