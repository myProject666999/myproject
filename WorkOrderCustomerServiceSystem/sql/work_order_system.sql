-- =============================================
-- 工单/客服系统数据库脚本
-- 创建数据库
-- =============================================
CREATE DATABASE IF NOT EXISTS work_order_system DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE work_order_system;

-- =============================================
-- 1. 用户表
-- =============================================
DROP TABLE IF EXISTS sys_user;
CREATE TABLE sys_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    email VARCHAR(100) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '手机号',
    role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER' COMMENT '角色: CUSTOMER-普通用户, AGENT-客服, ADMIN-管理员',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT '状态: ACTIVE-活跃, INACTIVE-停用',
    department VARCHAR(100) COMMENT '部门',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- =============================================
-- 2. 工单分类表
-- =============================================
DROP TABLE IF EXISTS ticket_category;
CREATE TABLE ticket_category (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '分类ID',
    name VARCHAR(100) NOT NULL COMMENT '分类名称',
    parent_id BIGINT COMMENT '父分类ID',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT '状态: ACTIVE-活跃, INACTIVE-停用',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单分类表';

-- =============================================
-- 3. 工单核心表
-- =============================================
DROP TABLE IF EXISTS ticket;
CREATE TABLE ticket (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '工单ID',
    ticket_no VARCHAR(30) NOT NULL UNIQUE COMMENT '工单编号',
    title VARCHAR(200) NOT NULL COMMENT '工单标题',
    description TEXT NOT NULL COMMENT '工单描述',
    category_id BIGINT NOT NULL COMMENT '分类ID',
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' COMMENT '优先级: LOW-低, MEDIUM-中, HIGH-高, URGENT-紧急',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '状态: PENDING-待处理, ASSIGNED-已分配, PROCESSING-处理中, RESOLVED-已解决, CLOSED-已关闭, REJECTED-已拒绝',
    customer_id BIGINT NOT NULL COMMENT '提交用户ID',
    agent_id BIGINT COMMENT '处理客服ID',
    sla_deadline DATETIME COMMENT 'SLA截止时间',
    sla_status VARCHAR(20) DEFAULT 'NORMAL' COMMENT 'SLA状态: NORMAL-正常, WARNING-即将超时, OVERDUE-已超时',
    resolved_at DATETIME COMMENT '解决时间',
    closed_at DATETIME COMMENT '关闭时间',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_ticket_no (ticket_no),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_customer_id (customer_id),
    INDEX idx_agent_id (agent_id),
    INDEX idx_category_id (category_id),
    INDEX idx_created_at (created_at),
    INDEX idx_sla_deadline (sla_deadline)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单核心表';

-- =============================================
-- 4. 工单回复记录表
-- =============================================
DROP TABLE IF EXISTS ticket_reply;
CREATE TABLE ticket_reply (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '回复ID',
    ticket_id BIGINT NOT NULL COMMENT '工单ID',
    user_id BIGINT NOT NULL COMMENT '回复用户ID',
    user_role VARCHAR(20) NOT NULL COMMENT '用户角色: CUSTOMER-用户, AGENT-客服',
    content TEXT NOT NULL COMMENT '回复内容',
    attachments VARCHAR(500) COMMENT '附件URL',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_ticket_id (ticket_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单回复记录表';

-- =============================================
-- 5. 工单操作日志表
-- =============================================
DROP TABLE IF EXISTS ticket_log;
CREATE TABLE ticket_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
    ticket_id BIGINT NOT NULL COMMENT '工单ID',
    action VARCHAR(50) NOT NULL COMMENT '操作类型: CREATE-创建, ASSIGN-分配, UPDATE_STATUS-更新状态, REPLY-回复, CLOSE-关闭, REOPEN-重开',
    old_value VARCHAR(200) COMMENT '旧值',
    new_value VARCHAR(200) COMMENT '新值',
    operator_id BIGINT NOT NULL COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人名称',
    remark VARCHAR(500) COMMENT '备注',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_ticket_id (ticket_id),
    INDEX idx_action (action),
    INDEX idx_operator_id (operator_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单操作日志表';

-- =============================================
-- 6. SLA配置表
-- =============================================
DROP TABLE IF EXISTS sla_config;
CREATE TABLE sla_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '配置ID',
    priority VARCHAR(20) NOT NULL UNIQUE COMMENT '优先级: LOW, MEDIUM, HIGH, URGENT',
    response_hours DECIMAL(10,2) NOT NULL COMMENT '响应时间(小时)',
    resolve_hours DECIMAL(10,2) NOT NULL COMMENT '解决时间(小时)',
    warning_hours DECIMAL(10,2) NOT NULL COMMENT '预警时间(小时)',
    description VARCHAR(200) COMMENT '描述',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='SLA配置表';

-- =============================================
-- 7. SLA记录日志表
-- =============================================
DROP TABLE IF EXISTS sla_log;
CREATE TABLE sla_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
    ticket_id BIGINT NOT NULL COMMENT '工单ID',
    event_type VARCHAR(50) NOT NULL COMMENT '事件类型: SLA_WARNING-预警, SLA_OVERDUE-超时, SLA_RESOLVED-按时解决',
    sla_deadline DATETIME COMMENT 'SLA截止时间',
    actual_time DATETIME COMMENT '实际触发时间',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_ticket_id (ticket_id),
    INDEX idx_event_type (event_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='SLA记录日志表';

-- =============================================
-- 8. 通知消息表
-- =============================================
DROP TABLE IF EXISTS notification;
CREATE TABLE notification (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '通知ID',
    user_id BIGINT NOT NULL COMMENT '接收用户ID',
    title VARCHAR(200) NOT NULL COMMENT '通知标题',
    content TEXT NOT NULL COMMENT '通知内容',
    type VARCHAR(50) NOT NULL DEFAULT 'SYSTEM' COMMENT '通知类型: TICKET-工单通知, SLA-SLA提醒, SYSTEM-系统通知',
    ticket_id BIGINT COMMENT '关联工单ID',
    is_read TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已读: 0-未读, 1-已读',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通知消息表';

-- =============================================
-- 初始化数据
-- =============================================

-- 初始化用户 (密码: 123456, BCrypt加密: $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH)
INSERT INTO sys_user (username, password, real_name, email, phone, role, department) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '系统管理员', 'admin@example.com', '13800138000', 'ADMIN', '技术部'),
('agent1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '客服小张', 'agent1@example.com', '13800138001', 'AGENT', '客服部'),
('agent2', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '客服小李', 'agent2@example.com', '13800138002', 'AGENT', '客服部'),
('customer1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '客户王先生', 'customer1@example.com', '13900139001', 'CUSTOMER', NULL),
('customer2', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '客户李女士', 'customer2@example.com', '13900139002', 'CUSTOMER', NULL);

-- 初始化工单分类
INSERT INTO ticket_category (name, parent_id, sort_order) VALUES
('技术问题', NULL, 1),
('账户问题', NULL, 2),
('账单问题', NULL, 3),
('功能建议', NULL, 4),
('软件安装', 1, 1),
('系统故障', 1, 2),
('性能问题', 1, 3),
('登录问题', 2, 1),
('密码重置', 2, 2),
('账单查询', 3, 1),
('退款申请', 3, 2);

-- 初始化SLA配置
INSERT INTO sla_config (priority, response_hours, resolve_hours, warning_hours, description) VALUES
('LOW', 24.00, 72.00, 12.00, '低优先级：24小时内响应，72小时内解决'),
('MEDIUM', 8.00, 24.00, 4.00, '中优先级：8小时内响应，24小时内解决'),
('HIGH', 2.00, 8.00, 1.00, '高优先级：2小时内响应，8小时内解决'),
('URGENT', 0.50, 2.00, 0.25, '紧急优先级：30分钟内响应，2小时内解决');

-- 初始化测试工单数据
INSERT INTO ticket (ticket_no, title, description, category_id, priority, status, customer_id, agent_id, sla_deadline, created_at) VALUES
('T20240101001', '软件安装失败', '尝试安装软件时提示错误代码E1001', 5, 'HIGH', 'PROCESSING', 4, 2, DATE_ADD(NOW(), INTERVAL 8 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR)),
('T20240101002', '无法登录账户', '输入正确密码后仍然无法登录', 8, 'URGENT', 'ASSIGNED', 5, 2, DATE_ADD(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR)),
('T20240101003', '建议增加导出功能', '希望能增加数据导出Excel的功能', 4, 'LOW', 'PENDING', 4, NULL, DATE_ADD(NOW(), INTERVAL 72 HOUR), DATE_SUB(NOW(), INTERVAL 5 HOUR)),
('T20240101004', '系统运行缓慢', '最近系统响应速度明显下降', 7, 'MEDIUM', 'RESOLVED', 5, 3, DATE_ADD(NOW(), INTERVAL 24 HOUR), DATE_SUB(NOW(), INTERVAL 10 HOUR)),
('T20240101005', '账单金额不符', '本月账单金额与实际消费不符', 10, 'HIGH', 'PENDING', 4, NULL, DATE_ADD(NOW(), INTERVAL 8 HOUR), DATE_SUB(NOW(), INTERVAL 30 MINUTE));

-- 初始化回复记录
INSERT INTO ticket_reply (ticket_id, user_id, user_role, content) VALUES
(1, 4, 'CUSTOMER', '软件安装时出现E1001错误，请帮忙查看'),
(1, 2, 'AGENT', '您好，请问您的操作系统是什么版本？'),
(2, 5, 'CUSTOMER', '登录时一直转圈，无法进入系统'),
(2, 2, 'AGENT', '已收到您的问题，正在紧急处理中'),
(4, 5, 'CUSTOMER', '最近打开页面都很慢'),
(4, 3, 'AGENT', '经过排查，已优化服务器配置，问题已解决');

-- 初始化操作日志
INSERT INTO ticket_log (ticket_id, action, old_value, new_value, operator_id, operator_name, remark) VALUES
(1, 'CREATE', NULL, 'PENDING', 4, '客户王先生', '创建工单'),
(1, 'ASSIGN', NULL, 'agent1', 1, '系统管理员', '分配工单'),
(1, 'UPDATE_STATUS', 'ASSIGNED', 'PROCESSING', 2, '客服小张', '开始处理'),
(2, 'CREATE', NULL, 'PENDING', 5, '客户李女士', '创建工单'),
(2, 'ASSIGN', NULL, 'agent1', 1, '系统管理员', '分配工单'),
(2, 'UPDATE_STATUS', 'ASSIGNED', 'PROCESSING', 2, '客服小张', '开始处理'),
(3, 'CREATE', NULL, 'PENDING', 4, '客户王先生', '创建工单'),
(4, 'CREATE', NULL, 'PENDING', 5, '客户李女士', '创建工单'),
(4, 'ASSIGN', NULL, 'agent2', 1, '系统管理员', '分配工单'),
(4, 'UPDATE_STATUS', 'ASSIGNED', 'RESOLVED', 3, '客服小李', '问题已解决'),
(5, 'CREATE', NULL, 'PENDING', 4, '客户王先生', '创建工单');