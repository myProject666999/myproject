CREATE DATABASE IF NOT EXISTS `online_judge` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `online_judge`;

CREATE TABLE IF NOT EXISTS `user` (
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

CREATE TABLE IF NOT EXISTS `problem` (
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

CREATE TABLE IF NOT EXISTS `tag` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '标签ID',
  `name`        VARCHAR(50)  NOT NULL COMMENT '标签名称',
  `create_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='标签表';

CREATE TABLE IF NOT EXISTS `problem_tag` (
  `problem_id` BIGINT NOT NULL COMMENT '题目ID',
  `tag_id`     BIGINT NOT NULL COMMENT '标签ID',
  PRIMARY KEY (`problem_id`, `tag_id`),
  KEY `idx_tag_id` (`tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='题目-标签关联表';

CREATE TABLE IF NOT EXISTS `problem_case` (
  `id`          BIGINT    NOT NULL AUTO_INCREMENT COMMENT '测试用例ID',
  `problem_id`  BIGINT    NOT NULL COMMENT '题目ID',
  `input`       TEXT      NOT NULL COMMENT '测试输入',
  `output`      TEXT      NOT NULL COMMENT '期望输出',
  `is_sample`   TINYINT   NOT NULL DEFAULT 0 COMMENT '是否样例: 0-否 1-是',
  `create_time` DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_problem_id` (`problem_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='题目测试用例表';

CREATE TABLE IF NOT EXISTS `submission` (
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

CREATE TABLE IF NOT EXISTS `contest` (
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

CREATE TABLE IF NOT EXISTS `contest_problem` (
  `contest_id`  BIGINT NOT NULL COMMENT '竞赛ID',
  `problem_id`  BIGINT NOT NULL COMMENT '题目ID',
  `order_index` INT    NOT NULL COMMENT '题目序号(1,2,3...)',
  PRIMARY KEY (`contest_id`, `problem_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='竞赛-题目关联表';

CREATE TABLE IF NOT EXISTS `contest_user` (
  `contest_id`   BIGINT   NOT NULL COMMENT '竞赛ID',
  `user_id`      BIGINT   NOT NULL COMMENT '用户ID',
  `rank`         INT      DEFAULT NULL COMMENT '排名',
  `solved_count` INT      NOT NULL DEFAULT 0 COMMENT '通过题目数',
  `penalty`      INT      NOT NULL DEFAULT 0 COMMENT '罚时(秒)',
  `join_time`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '参赛时间',
  PRIMARY KEY (`contest_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='竞赛-用户参赛记录表';

CREATE TABLE IF NOT EXISTS `user_problem_ac` (
  `user_id`     BIGINT   NOT NULL COMMENT '用户ID',
  `problem_id`  BIGINT   NOT NULL COMMENT '题目ID',
  `submission_id` BIGINT NOT NULL COMMENT 'AC的提交ID',
  `ac_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'AC时间',
  PRIMARY KEY (`user_id`, `problem_id`),
  KEY `idx_problem_id` (`problem_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户AC记录表';

CREATE TABLE IF NOT EXISTS `announcement` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '公告ID',
  `title`       VARCHAR(200) NOT NULL COMMENT '公告标题',
  `content`     TEXT         NOT NULL COMMENT '公告内容',
  `priority`    TINYINT      NOT NULL DEFAULT 0 COMMENT '优先级: 0-普通 1-置顶',
  `create_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公告表';

CREATE TABLE IF NOT EXISTS `system_config` (
  `config_key`   VARCHAR(100) NOT NULL COMMENT '配置键',
  `config_value` TEXT         COMMENT '配置值',
  `description`  VARCHAR(200) COMMENT '描述',
  PRIMARY KEY (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统设置表';
