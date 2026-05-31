-- ========================================================
-- 在线投票 + 排班系统 数据库脚本
-- Database: MySQL 8.0+
-- ========================================================

CREATE DATABASE IF NOT EXISTS `online_voting_scheduling`
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE `online_voting_scheduling`;

-- -------------------------------------------------------
-- 1. 用户表
-- -------------------------------------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
    `id`            BIGINT          NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `username`      VARCHAR(50)     NOT NULL COMMENT '用户名',
    `password`      VARCHAR(100)    NOT NULL COMMENT '密码(加密存储)',
    `real_name`     VARCHAR(50)     NOT NULL COMMENT '真实姓名',
    `email`         VARCHAR(100)    NULL     COMMENT '邮箱',
    `phone`         VARCHAR(20)     NULL     COMMENT '手机号',
    `avatar`        VARCHAR(255)    NULL     COMMENT '头像URL',
    `role`          VARCHAR(20)     NOT NULL DEFAULT 'MEMBER' COMMENT '角色: ADMIN-管理员, MEMBER-普通成员',
    `status`        VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE' COMMENT '状态: ACTIVE-激活, DISABLED-禁用',
    `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- -------------------------------------------------------
-- 2. 团队表
-- -------------------------------------------------------
DROP TABLE IF EXISTS `team`;
CREATE TABLE `team` (
    `id`            BIGINT          NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `name`          VARCHAR(100)    NOT NULL COMMENT '团队名称',
    `description`   VARCHAR(500)    NULL     COMMENT '团队描述',
    `leader_id`     BIGINT          NOT NULL COMMENT '团队负责人ID',
    `status`        VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE' COMMENT '状态: ACTIVE-活跃, DISBANDED-解散',
    `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_leader` (`leader_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='团队表';

-- -------------------------------------------------------
-- 3. 团队成员关联表
-- -------------------------------------------------------
DROP TABLE IF EXISTS `team_member`;
CREATE TABLE `team_member` (
    `id`            BIGINT          NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `team_id`       BIGINT          NOT NULL COMMENT '团队ID',
    `user_id`       BIGINT          NOT NULL COMMENT '用户ID',
    `is_leader`     TINYINT(1)      NOT NULL DEFAULT 0 COMMENT '是否为负责人: 0-否, 1-是',
    `join_at`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
    `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_team_user` (`team_id`, `user_id`),
    KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='团队成员关联表';

-- -------------------------------------------------------
-- 4. 可用时间表（成员填写的可值班时间段）
-- -------------------------------------------------------
DROP TABLE IF EXISTS `available_time`;
CREATE TABLE `available_time` (
    `id`            BIGINT          NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `team_id`       BIGINT          NOT NULL COMMENT '团队ID',
    `user_id`       BIGINT          NOT NULL COMMENT '用户ID',
    `week_day`      TINYINT         NOT NULL COMMENT '星期: 1-周一, 2-周二, ..., 7-周日',
    `start_time`    TIME            NOT NULL COMMENT '可用开始时间',
    `end_time`      TIME            NOT NULL COMMENT '可用结束时间',
    `priority`      INT             NOT NULL DEFAULT 0 COMMENT '优先级: 数字越大优先级越高',
    `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_team_user` (`team_id`, `user_id`),
    KEY `idx_week_day` (`week_day`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='可用时间表';

-- -------------------------------------------------------
-- 5. 排班表
-- -------------------------------------------------------
DROP TABLE IF EXISTS `schedule`;
CREATE TABLE `schedule` (
    `id`            BIGINT          NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `team_id`       BIGINT          NOT NULL COMMENT '团队ID',
    `name`          VARCHAR(100)    NOT NULL COMMENT '排班名称',
    `type`          VARCHAR(20)     NOT NULL DEFAULT 'WEEKLY' COMMENT '类型: WEEKLY-周循环, MONTHLY-月循环, ONCE-一次性',
    `status`        VARCHAR(20)     NOT NULL DEFAULT 'DRAFT' COMMENT '状态: DRAFT-草稿, PUBLISHED-已发布, ARCHIVED-已归档',
    `start_date`    DATE            NOT NULL COMMENT '开始日期',
    `end_date`      DATE            NOT NULL COMMENT '结束日期',
    `created_by`    BIGINT          NOT NULL COMMENT '创建人ID',
    `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_team` (`team_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='排班表';

-- -------------------------------------------------------
-- 6. 排班时段表（具体的值班安排）
-- -------------------------------------------------------
DROP TABLE IF EXISTS `schedule_slot`;
CREATE TABLE `schedule_slot` (
    `id`                BIGINT          NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `schedule_id`       BIGINT          NOT NULL COMMENT '排班表ID',
    `date`              DATE            NOT NULL COMMENT '值班日期',
    `week_day`          TINYINT         NOT NULL COMMENT '星期: 1-周一, ..., 7-周日',
    `start_time`        TIME            NOT NULL COMMENT '值班开始时间',
    `end_time`          TIME            NOT NULL COMMENT '值班结束时间',
    `user_id`           BIGINT          NULL     COMMENT '值班人员ID(NULL表示未分配)',
    `is_auto_assigned`  TINYINT(1)      NOT NULL DEFAULT 0 COMMENT '是否自动分配: 0-手动, 1-自动',
    `status`            VARCHAR(20)     NOT NULL DEFAULT 'ASSIGNED' COMMENT '状态: ASSIGNED-已分配, SWAP_PENDING-调班待审批, COMPLETED-已完成',
    `notes`             VARCHAR(255)    NULL     COMMENT '备注',
    `created_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_schedule` (`schedule_id`),
    KEY `idx_user` (`user_id`),
    KEY `idx_date` (`date`),
    UNIQUE KEY `uk_schedule_date_time_user` (`schedule_id`, `date`, `start_time`, `end_time`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='排班时段表';

-- -------------------------------------------------------
-- 7. 调班申请表
-- -------------------------------------------------------
DROP TABLE IF EXISTS `shift_swap`;
CREATE TABLE `shift_swap` (
    `id`                    BIGINT          NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `slot_id`               BIGINT          NOT NULL COMMENT '原排班时段ID',
    `original_user_id`      BIGINT          NOT NULL COMMENT '原值班人ID',
    `swap_user_id`          BIGINT          NOT NULL COMMENT '申请代班人ID',
    `reason`                VARCHAR(500)    NOT NULL COMMENT '调班原因',
    `status`                VARCHAR(20)     NOT NULL DEFAULT 'PENDING' COMMENT '状态: PENDING-待审批, APPROVED-已同意, REJECTED-已拒绝, CANCELLED-已取消',
    `approver_id`           BIGINT          NULL     COMMENT '审批人ID',
    `approve_time`          DATETIME        NULL     COMMENT '审批时间',
    `approve_comment`       VARCHAR(500)    NULL     COMMENT '审批意见',
    `created_at`            DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`            DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_slot` (`slot_id`),
    KEY `idx_original_user` (`original_user_id`),
    KEY `idx_swap_user` (`swap_user_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='调班申请表';

-- -------------------------------------------------------
-- 8. 投票表（对排班方案进行投票）
-- -------------------------------------------------------
DROP TABLE IF EXISTS `vote`;
CREATE TABLE `vote` (
    `id`            BIGINT          NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `schedule_id`   BIGINT          NOT NULL COMMENT '排班表ID',
    `user_id`       BIGINT          NOT NULL COMMENT '投票人ID',
    `vote_type`     VARCHAR(20)     NOT NULL COMMENT '投票类型: APPROVE-赞成, REJECT-反对, ABSTAIN-弃权',
    `comment`       VARCHAR(500)    NULL     COMMENT '投票意见',
    `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_schedule_user` (`schedule_id`, `user_id`),
    KEY `idx_schedule` (`schedule_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='投票表';

-- -------------------------------------------------------
-- 9. 排班历史记录表
-- -------------------------------------------------------
DROP TABLE IF EXISTS `schedule_history`;
CREATE TABLE `schedule_history` (
    `id`                BIGINT          NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `slot_id`           BIGINT          NOT NULL COMMENT '排班时段ID',
    `action`            VARCHAR(50)     NOT NULL COMMENT '操作类型: ASSIGN-分配, REASSIGN-重新分配, SWAP-调班, MODIFY-修改',
    `action_user_id`    BIGINT          NOT NULL COMMENT '操作人ID',
    `old_user_id`       BIGINT          NULL     COMMENT '原值班人ID',
    `new_user_id`       BIGINT          NULL     COMMENT '新值班人ID',
    `detail`            VARCHAR(500)    NULL     COMMENT '操作详情',
    `created_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_slot` (`slot_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='排班历史记录表';

-- -------------------------------------------------------
-- 初始数据
-- -------------------------------------------------------

-- 默认管理员账号 (密码: admin123, 使用BCrypt加密)
INSERT INTO `user` (`id`, `username`, `password`, `real_name`, `email`, `role`, `status`) VALUES
(1, 'admin', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '系统管理员', 'admin@example.com', 'ADMIN', 'ACTIVE');

-- 默认团队
INSERT INTO `team` (`id`, `name`, `description`, `leader_id`, `status`) VALUES
(1, '默认团队', '系统默认创建的团队', 1, 'ACTIVE');

-- 默认团队成员
INSERT INTO `team_member` (`id`, `team_id`, `user_id`, `is_leader`) VALUES
(1, 1, 1, 1);
