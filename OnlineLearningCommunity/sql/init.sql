-- =============================================
-- 在线学习社区 + 打卡组队 数据库脚本
-- 数据库: MySQL 8.0+
-- =============================================

DROP DATABASE IF EXISTS online_learning_community;
CREATE DATABASE online_learning_community DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE online_learning_community;

-- =============================================
-- 1. 用户表
-- =============================================
CREATE TABLE users (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username        VARCHAR(50)  NOT NULL UNIQUE COMMENT '用户名',
    password        VARCHAR(255) NOT NULL COMMENT '密码(加密)',
    nickname        VARCHAR(50)  NOT NULL COMMENT '昵称',
    avatar          VARCHAR(500) NULL     COMMENT '头像URL',
    bio             VARCHAR(500) NULL     COMMENT '个人简介',
    total_checkins  INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '累计打卡天数',
    max_streak      INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '最长连续打卡天数',
    current_streak  INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '当前连续打卡天数',
    last_checkin_at DATETIME     NULL     COMMENT '上次打卡时间',
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- =============================================
-- 2. 学习小组表
-- =============================================
CREATE TABLE study_groups (
    id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(100) NOT NULL COMMENT '小组名称',
    description  TEXT         NULL     COMMENT '小组描述',
    avatar       VARCHAR(500) NULL     COMMENT '小组头像',
    category     VARCHAR(50)  NOT NULL DEFAULT '学习' COMMENT '分类(学习/编程/考研/雅思等)',
    max_members  INT UNSIGNED NOT NULL DEFAULT 30 COMMENT '最大成员数',
    member_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '当前成员数',
    is_private   TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '是否私有',
    owner_id     BIGINT UNSIGNED NOT NULL COMMENT '组长/创建者ID',
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_owner_id (owner_id),
    INDEX idx_category (category),
    INDEX idx_member_count (member_count DESC),
    CONSTRAINT fk_group_owner FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学习小组表';

-- =============================================
-- 3. 小组成员表
-- =============================================
CREATE TABLE group_members (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    group_id      BIGINT UNSIGNED NOT NULL COMMENT '小组ID',
    user_id       BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    role          ENUM('owner','admin','member') NOT NULL DEFAULT 'member' COMMENT '角色',
    joined_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
    group_streak  INT UNSIGNED    NOT NULL DEFAULT 0 COMMENT '在本小组的连续打卡天数',
    group_checkins INT UNSIGNED   NOT NULL DEFAULT 0 COMMENT '在本小组累计打卡天数',
    UNIQUE KEY uk_group_user (group_id, user_id),
    INDEX idx_user_id (user_id),
    INDEX idx_group_id (group_id),
    CONSTRAINT fk_member_group FOREIGN KEY (group_id) REFERENCES study_groups (id) ON DELETE CASCADE,
    CONSTRAINT fk_member_user  FOREIGN KEY (user_id)  REFERENCES users (id)        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='小组成员表';

-- =============================================
-- 4. 打卡记录表
-- =============================================
CREATE TABLE check_ins (
    id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id      BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    group_id     BIGINT UNSIGNED NOT NULL COMMENT '小组ID',
    checkin_date DATE            NOT NULL COMMENT '打卡日期(YYYY-MM-DD)',
    content      TEXT            NULL     COMMENT '打卡内容/学习笔记',
    study_minutes INT UNSIGNED   NOT NULL DEFAULT 0 COMMENT '学习时长(分钟)',
    mood         ENUM('happy','neutral','tired','motivated') NOT NULL DEFAULT 'neutral' COMMENT '心情',
    created_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_group_date (user_id, group_id, checkin_date),
    INDEX idx_user_date (user_id, checkin_date DESC),
    INDEX idx_group_date (group_id, checkin_date DESC),
    CONSTRAINT fk_checkin_user  FOREIGN KEY (user_id)  REFERENCES users        (id) ON DELETE CASCADE,
    CONSTRAINT fk_checkin_group FOREIGN KEY (group_id) REFERENCES study_groups (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='打卡记录表';

-- =============================================
-- 5. 动态/帖子表
-- =============================================
CREATE TABLE posts (
    id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id      BIGINT UNSIGNED NOT NULL COMMENT '发帖用户ID',
    group_id     BIGINT UNSIGNED NULL     COMMENT '所属小组ID(空则为广场)',
    content      TEXT            NOT NULL COMMENT '帖子内容',
    images       JSON            NULL     COMMENT '图片URL数组',
    like_count   INT UNSIGNED    NOT NULL DEFAULT 0 COMMENT '点赞数',
    comment_count INT UNSIGNED   NOT NULL DEFAULT 0 COMMENT '评论数',
    is_public    TINYINT(1)      NOT NULL DEFAULT 1 COMMENT '是否公开',
    created_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_group_id (group_id),
    INDEX idx_created_at (created_at DESC),
    CONSTRAINT fk_post_user  FOREIGN KEY (user_id)  REFERENCES users        (id) ON DELETE CASCADE,
    CONSTRAINT fk_post_group FOREIGN KEY (group_id) REFERENCES study_groups (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='帖子/动态表';

-- =============================================
-- 6. 评论表
-- =============================================
CREATE TABLE comments (
    id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    post_id    BIGINT UNSIGNED NOT NULL COMMENT '帖子ID',
    user_id    BIGINT UNSIGNED NOT NULL COMMENT '评论用户ID',
    content    TEXT            NOT NULL COMMENT '评论内容',
    parent_id  BIGINT UNSIGNED NULL     COMMENT '父评论ID(回复)',
    created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_post_id (post_id),
    INDEX idx_user_id (user_id),
    CONSTRAINT fk_comment_post FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';

-- =============================================
-- 7. 点赞表
-- =============================================
CREATE TABLE likes (
    id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT UNSIGNED NOT NULL COMMENT '点赞用户ID',
    post_id    BIGINT UNSIGNED NULL     COMMENT '点赞帖子ID',
    comment_id BIGINT UNSIGNED NULL     COMMENT '点赞评论ID',
    created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_post    (user_id, post_id),
    UNIQUE KEY uk_user_comment (user_id, comment_id),
    INDEX idx_post_id    (post_id),
    INDEX idx_comment_id (comment_id),
    CONSTRAINT fk_like_user    FOREIGN KEY (user_id)    REFERENCES users    (id) ON DELETE CASCADE,
    CONSTRAINT fk_like_post    FOREIGN KEY (post_id)    REFERENCES posts    (id) ON DELETE CASCADE,
    CONSTRAINT fk_like_comment FOREIGN KEY (comment_id) REFERENCES comments (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='点赞表';

-- =============================================
-- 8. 目标表
-- =============================================
CREATE TABLE goals (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id       BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    group_id      BIGINT UNSIGNED NOT NULL COMMENT '小组ID',
    title         VARCHAR(200)    NOT NULL COMMENT '目标标题',
    description   TEXT            NULL     COMMENT '目标描述',
    target_value  INT UNSIGNED    NOT NULL DEFAULT 0 COMMENT '目标值(如打卡N天)',
    current_value INT UNSIGNED    NOT NULL DEFAULT 0 COMMENT '当前进度',
    unit          VARCHAR(20)     NOT NULL DEFAULT '天' COMMENT '单位',
    deadline      DATE            NULL     COMMENT '截止日期',
    status        ENUM('active','completed','abandoned') NOT NULL DEFAULT 'active' COMMENT '状态',
    created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id  (user_id),
    INDEX idx_group_id (group_id),
    INDEX idx_status   (status),
    CONSTRAINT fk_goal_user  FOREIGN KEY (user_id)  REFERENCES users        (id) ON DELETE CASCADE,
    CONSTRAINT fk_goal_group FOREIGN KEY (group_id) REFERENCES study_groups (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='目标表';

-- =============================================
-- 9. 通知表
-- =============================================
CREATE TABLE notifications (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT UNSIGNED NOT NULL COMMENT '接收用户ID',
    type        ENUM('checkin_reminder','like','comment','new_member','group_invite','system') NOT NULL COMMENT '通知类型',
    title       VARCHAR(200)    NOT NULL COMMENT '通知标题',
    content     TEXT            NULL     COMMENT '通知内容',
    related_id  BIGINT UNSIGNED NULL     COMMENT '关联ID(帖子/小组等)',
    is_read     TINYINT(1)      NOT NULL DEFAULT 0 COMMENT '是否已读',
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_read (user_id, is_read),
    INDEX idx_created_at (created_at DESC),
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知表';

-- =============================================
-- 示例数据
-- =============================================
INSERT INTO users (username, password, nickname, avatar, bio, total_checkins, max_streak, current_streak, last_checkin_at) VALUES
('zhangsan',  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '张三', NULL, '专注于前端开发', 15, 10, 5, '2026-05-24 08:00:00'),
('lisi',      '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '李四', NULL, '考研备考中', 30, 20, 3, '2026-05-22 09:30:00'),
('wangwu',    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '王五', NULL, '雅思冲7分', 45, 30, 8, '2026-05-24 07:00:00');

INSERT INTO study_groups (name, description, category, max_members, member_count, owner_id) VALUES
('前端学习打卡团', '一起打卡学习前端技术，共同进步！', '编程', 30, 3, 1),
('考研上岸小分队', '每日复习打卡，互相监督！', '考研', 20, 2, 2),
('雅思冲分小组',   '雅思备考打卡，口语练习', '语言', 25, 1, 3);

INSERT INTO group_members (group_id, user_id, role, group_streak, group_checkins) VALUES
(1, 1, 'owner',  5, 15),
(1, 2, 'member', 3, 10),
(1, 3, 'member', 2, 8),
(2, 2, 'owner',  3, 30),
(2, 1, 'member', 2, 5),
(3, 3, 'owner',  8, 45);

INSERT INTO check_ins (user_id, group_id, checkin_date, content, study_minutes, mood) VALUES
(1, 1, '2026-05-24', '学习了React Hooks深入原理', 120, 'happy'),
(2, 1, '2026-05-23', '完成Vue3源码阅读第2章', 90,  'motivated'),
(3, 1, '2026-05-24', '复习TypeScript泛型', 60,  'neutral'),
(2, 2, '2026-05-22', '数学复习线代第3章', 150, 'motivated'),
(1, 2, '2026-05-21', '英语真题阅读理解', 90,  'happy'),
(3, 3, '2026-05-24', '雅思听力Section 3练习', 45,  'happy');

INSERT INTO posts (user_id, group_id, content, like_count, comment_count) VALUES
(1, 1,    '今天学习了React Hooks的高级用法，收获很大！推荐大家也看看官方文档。', 5, 2),
(2, 2,    '考研倒计时200天，今天做了一套真题，数学错了3道，继续加油！', 8, 3),
(3, 3,    '雅思听力从5.5到6.5的经验分享，多做精听真的有效！', 12, 5),
(1, NULL, '分享一个前端学习路线，希望对大家有帮助～', 20, 10);

INSERT INTO comments (post_id, user_id, content) VALUES
(1, 2, '谢谢分享，我也在学Hooks'),
(1, 3, '官方文档确实是最好的学习资料'),
(2, 1, '加油！一起上岸！'),
(3, 1, '精听是真的有用，我也在坚持');

INSERT INTO likes (user_id, post_id) VALUES
(2, 1), (3, 1), (1, 2), (3, 2), (1, 3), (2, 3), (2, 4), (3, 4);

INSERT INTO goals (user_id, group_id, title, description, target_value, current_value, unit, deadline, status) VALUES
(1, 1, '30天打卡挑战', '连续打卡30天', 30, 15, '天', '2026-06-30', 'active'),
(2, 2, '考研上岸', '每天学习8小时', 200, 30, '天', '2026-12-24', 'active'),
(3, 3, '雅思7分', '雅思总分达到7分', 7, 6, '分', '2026-09-01', 'active');
