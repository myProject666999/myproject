-- =============================================
-- 企业内部公告系统数据库脚本
-- =============================================

CREATE DATABASE IF NOT EXISTS notification_system DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE notification_system;

-- =============================================
-- 部门表
-- =============================================
DROP TABLE IF EXISTS sys_department;
CREATE TABLE sys_department (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '部门ID',
    name VARCHAR(100) NOT NULL COMMENT '部门名称',
    parent_id BIGINT DEFAULT 0 COMMENT '父部门ID',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门表';

-- =============================================
-- 用户表
-- =============================================
DROP TABLE IF EXISTS sys_user;
CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    department_id BIGINT COMMENT '部门ID',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    avatar VARCHAR(255) COMMENT '头像URL',
    role TINYINT DEFAULT 2 COMMENT '角色：1-管理员，2-普通员工',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_department_id (department_id),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- =============================================
-- 公告分类表
-- =============================================
DROP TABLE IF EXISTS announcement_category;
CREATE TABLE announcement_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
    name VARCHAR(50) NOT NULL COMMENT '分类名称',
    icon VARCHAR(100) COMMENT '图标',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公告分类表';

-- =============================================
-- 公告表
-- =============================================
DROP TABLE IF EXISTS announcement;
CREATE TABLE announcement (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '公告ID',
    title VARCHAR(200) NOT NULL COMMENT '公告标题',
    content TEXT NOT NULL COMMENT '公告内容',
    category_id BIGINT COMMENT '分类ID',
    type TINYINT DEFAULT 1 COMMENT '类型：1-普通公告，2-紧急公告',
    priority TINYINT DEFAULT 0 COMMENT '优先级：0-普通，1-置顶',
    status TINYINT DEFAULT 1 COMMENT '状态：0-草稿，1-已发布，2-已撤回',
    publisher_id BIGINT NOT NULL COMMENT '发布人ID',
    publisher_name VARCHAR(50) COMMENT '发布人姓名',
    department_id BIGINT COMMENT '发布部门ID',
    target_departments VARCHAR(500) COMMENT '定向推送部门ID列表，多个用逗号分隔',
    is_all_departments TINYINT DEFAULT 1 COMMENT '是否所有部门可见：0-否，1-是',
    read_count INT DEFAULT 0 COMMENT '已读数量',
    total_count INT DEFAULT 0 COMMENT '目标总人数',
    publish_time DATETIME COMMENT '发布时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_category_id (category_id),
    INDEX idx_publisher_id (publisher_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_publish_time (publish_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公告表';

-- =============================================
-- 公告附件表
-- =============================================
DROP TABLE IF EXISTS announcement_attachment;
CREATE TABLE announcement_attachment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '附件ID',
    announcement_id BIGINT NOT NULL COMMENT '公告ID',
    file_name VARCHAR(255) NOT NULL COMMENT '文件名',
    file_path VARCHAR(500) NOT NULL COMMENT '文件存储路径',
    file_size BIGINT COMMENT '文件大小（字节）',
    file_type VARCHAR(50) COMMENT '文件类型',
    download_count INT DEFAULT 0 COMMENT '下载次数',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_announcement_id (announcement_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公告附件表';

-- =============================================
-- 公告已读记录表
-- =============================================
DROP TABLE IF EXISTS announcement_read;
CREATE TABLE announcement_read (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
    announcement_id BIGINT NOT NULL COMMENT '公告ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    user_name VARCHAR(50) COMMENT '用户姓名',
    department_id BIGINT COMMENT '部门ID',
    read_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '阅读时间',
    UNIQUE KEY uk_announcement_user (announcement_id, user_id),
    INDEX idx_user_id (user_id),
    INDEX idx_read_time (read_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公告已读记录表';

-- =============================================
-- 公告评论表
-- =============================================
DROP TABLE IF EXISTS announcement_comment;
CREATE TABLE announcement_comment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '评论ID',
    announcement_id BIGINT NOT NULL COMMENT '公告ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    user_name VARCHAR(50) COMMENT '用户姓名',
    user_avatar VARCHAR(255) COMMENT '用户头像',
    content TEXT NOT NULL COMMENT '评论内容',
    parent_id BIGINT DEFAULT 0 COMMENT '父评论ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_announcement_id (announcement_id),
    INDEX idx_user_id (user_id),
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公告评论表';

-- =============================================
-- 初始化数据
-- =============================================

-- 部门数据
INSERT INTO sys_department (name, parent_id, sort_order) VALUES
('总公司', 0, 1),
('技术部', 1, 1),
('市场部', 1, 2),
('人力资源部', 1, 3),
('财务部', 1, 4),
('行政部', 1, 5),
('前端组', 2, 1),
('后端组', 2, 2),
('测试组', 2, 3);

-- 用户数据（密码均为 123456，使用BCrypt加密）
INSERT INTO sys_user (username, password, real_name, department_id, phone, email, role, status) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '系统管理员', 1, '13800000001', 'admin@company.com', 1, 1),
('zhangsan', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '张三', 7, '13800000002', 'zhangsan@company.com', 2, 1),
('lisi', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '李四', 8, '13800000003', 'lisi@company.com', 2, 1),
('wangwu', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '王五', 3, '13800000004', 'wangwu@company.com', 2, 1),
('zhaoliu', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '赵六', 4, '13800000005', 'zhaoliu@company.com', 2, 1),
('qianqi', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '钱七', 5, '13800000006', 'qianqi@company.com', 2, 1),
('sunba', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '孙八', 6, '13800000007', 'sunba@company.com', 2, 1),
('zhoujiu', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '周九', 8, '13800000008', 'zhoujiu@company.com', 2, 1);

-- 公告分类数据
INSERT INTO announcement_category (name, icon, sort_order) VALUES
('公司通知', '📢', 1),
('规章制度', '📋', 2),
('会议通知', '📅', 3),
('培训信息', '🎓', 4),
('活动通知', '🎉', 5),
('其他公告', '📌', 6);

-- 公告数据
INSERT INTO announcement (title, content, category_id, type, priority, status, publisher_id, publisher_name, department_id, target_departments, is_all_departments, read_count, total_count, publish_time) VALUES
('关于2026年春节放假安排的通知', '各部门：根据国务院办公厅通知精神，结合公司实际情况，现将2026年春节放假安排通知如下：1月28日至2月3日放假调休，共7天。请各部门提前做好工作安排，确保各项工作正常运转。', 1, 2, 1, 1, 1, '系统管理员', 1, NULL, 1, 5, 8, '2026-01-20 09:00:00'),
('员工绩效考核管理办法', '为规范公司员工绩效考核管理，客观、公正地评价员工的工作表现，充分调动员工的积极性和创造性，特制定本办法。本办法适用于公司全体正式员工。', 2, 1, 0, 1, 1, '系统管理员', 1, NULL, 1, 3, 8, '2026-01-15 14:00:00'),
('技术分享会通知', '为促进技术交流与学习，提升团队技术水平，定于本周五下午14:00在会议室A召开技术分享会。分享主题：Vue3组合式API实践与最佳实践。', 3, 1, 0, 1, 2, '张三', 2, '2,7,8,9', 0, 2, 4, '2026-01-22 10:00:00'),
('关于开展新员工培训的通知', '为帮助新员工尽快融入公司文化，熟悉工作环境和业务流程，将于下周一开始为期一周的新员工培训。请相关部门配合安排。', 4, 1, 0, 1, 4, '赵六', 4, NULL, 1, 1, 8, '2026-01-25 16:00:00'),
('公司年会活动通知', '一年一度的公司年会即将到来！为丰富员工文化生活，增强团队凝聚力，定于2月10日举办公司年会。各部门请准备1-2个节目参与表演。', 5, 1, 0, 1, 5, '钱七', 5, NULL, 1, 0, 8, '2026-01-26 11:00:00'),
('办公区域安全管理制度', '为保障公司财产安全和员工人身安全，维护正常的工作秩序，特制定本制度。全体员工须严格遵守各项安全规定。', 2, 1, 0, 1, 1, '系统管理员', 1, NULL, 1, 0, 8, '2026-01-27 09:00:00'),
('关于部分部门调整的通知', '根据公司发展需要，经管理层研究决定，对部分部门进行调整，具体安排请见附件。涉及部门请配合完成相关工作交接。', 1, 2, 1, 1, 1, '系统管理员', 1, NULL, 1, 0, 8, '2026-05-25 10:00:00'),
('财务报销流程更新通知', '为提高财务工作效率，自下月起，报销流程将进行调整，实行线上审批。请全体员工熟悉新流程。', 1, 1, 0, 1, 5, '钱七', 4, NULL, 1, 0, 8, '2026-05-26 15:00:00');

-- 已读记录数据
INSERT INTO announcement_read (announcement_id, user_id, user_name, department_id, read_time) VALUES
(1, 1, '系统管理员', 1, '2026-01-20 10:00:00'),
(1, 2, '张三', 7, '2026-01-20 11:30:00'),
(1, 3, '李四', 8, '2026-01-20 14:00:00'),
(1, 5, '赵六', 4, '2026-01-21 09:00:00'),
(1, 6, '钱七', 5, '2026-01-21 10:00:00'),
(2, 1, '系统管理员', 1, '2026-01-15 15:00:00'),
(2, 2, '张三', 7, '2026-01-16 09:00:00'),
(2, 3, '李四', 8, '2026-01-16 11:00:00'),
(3, 2, '张三', 7, '2026-01-22 10:30:00'),
(3, 3, '李四', 8, '2026-01-22 11:00:00'),
(4, 1, '系统管理员', 1, '2026-01-25 17:00:00');

-- 评论数据
INSERT INTO announcement_comment (announcement_id, user_id, user_name, content, parent_id) VALUES
(1, 2, '张三', '收到，会提前安排好工作的！', 0),
(1, 3, '李四', '好的，已了解。', 0),
(1, 5, '赵六', '请问放假期间有值班安排吗？', 0),
(1, 1, '系统管理员', '值班安排将另行通知，请留意后续公告。', 3),
(3, 3, '李四', '期待这次分享！', 0),
(3, 8, '周九', '正好想学习Vue3，赞！', 0);
