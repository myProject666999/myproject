-- =============================================
-- 物流快递跟踪系统 数据库脚本
-- =============================================

CREATE DATABASE IF NOT EXISTS logistics_express DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE logistics_express;

-- =============================================
-- 运单表
-- =============================================
DROP TABLE IF EXISTS t_waybill;
CREATE TABLE t_waybill (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    waybill_no VARCHAR(32) NOT NULL COMMENT '运单号',
    sender_name VARCHAR(64) NOT NULL COMMENT '寄件人姓名',
    sender_phone VARCHAR(20) NOT NULL COMMENT '寄件人电话',
    sender_address VARCHAR(255) NOT NULL COMMENT '寄件人地址',
    receiver_name VARCHAR(64) NOT NULL COMMENT '收件人姓名',
    receiver_phone VARCHAR(20) NOT NULL COMMENT '收件人电话',
    receiver_address VARCHAR(255) NOT NULL COMMENT '收件人地址',
    goods_name VARCHAR(128) NOT NULL COMMENT '物品名称',
    goods_weight DECIMAL(10,2) DEFAULT 0.00 COMMENT '物品重量(kg)',
    freight DECIMAL(10,2) DEFAULT 0.00 COMMENT '运费',
    status TINYINT DEFAULT 0 COMMENT '状态: 0-待揽件 1-运输中 2-派送中 3-已签收 4-已退回 5-异常',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_waybill_no (waybill_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='运单表';

-- =============================================
-- 轨迹节点表
-- =============================================
DROP TABLE IF EXISTS t_tracking_node;
CREATE TABLE t_tracking_node (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    waybill_id BIGINT NOT NULL COMMENT '运单ID',
    waybill_no VARCHAR(32) NOT NULL COMMENT '运单号',
    node_type TINYINT NOT NULL COMMENT '节点类型: 1-揽件 2-运输 3-中转 4-派送 5-签收 6-退回 7-异常',
    location VARCHAR(128) NOT NULL COMMENT '当前位置',
    description VARCHAR(500) COMMENT '描述',
    operator VARCHAR(64) COMMENT '操作人/快递员',
    operator_phone VARCHAR(20) COMMENT '操作人电话',
    node_time DATETIME NOT NULL COMMENT '节点发生时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_waybill_id (waybill_id),
    INDEX idx_waybill_no (waybill_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='轨迹节点表';

-- =============================================
-- 状态变更通知表
-- =============================================
DROP TABLE IF EXISTS t_status_notification;
CREATE TABLE t_status_notification (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    waybill_id BIGINT NOT NULL COMMENT '运单ID',
    waybill_no VARCHAR(32) NOT NULL COMMENT '运单号',
    old_status TINYINT COMMENT '变更前状态',
    new_status TINYINT NOT NULL COMMENT '变更后状态',
    notify_type TINYINT DEFAULT 1 COMMENT '通知类型: 1-短信 2-邮件 3-站内信',
    notify_content VARCHAR(500) COMMENT '通知内容',
    notify_target VARCHAR(64) COMMENT '通知对象(手机号/邮箱)',
    is_read TINYINT DEFAULT 0 COMMENT '是否已读: 0-未读 1-已读',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_waybill_id (waybill_id),
    INDEX idx_waybill_no (waybill_no),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='状态变更通知表';

-- =============================================
-- 用户表 (后台管理)
-- =============================================
DROP TABLE IF EXISTS t_user;
CREATE TABLE t_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    username VARCHAR(32) NOT NULL COMMENT '用户名',
    password VARCHAR(128) NOT NULL COMMENT '密码',
    real_name VARCHAR(64) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    role TINYINT DEFAULT 2 COMMENT '角色: 1-管理员 2-普通用户',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- =============================================
-- 初始化数据
-- =============================================
INSERT INTO t_user (username, password, real_name, phone, role) VALUES
('admin', '123456', '系统管理员', '13800138000', 1),
('operator', '123456', '操作员', '13800138001', 2);

INSERT INTO t_waybill (waybill_no, sender_name, sender_phone, sender_address, receiver_name, receiver_phone, receiver_address, goods_name, goods_weight, freight, status) VALUES
('YB20260524001', '张三', '13911110001', '北京市朝阳区', '李四', '13922220001', '上海市浦东新区', '电子产品', 2.50, 15.00, 3),
('YB20260524002', '王五', '13911110002', '广州市天河区', '赵六', '13922220002', '深圳市南山区', '服装', 1.20, 12.00, 2),
('YB20260524003', '孙七', '13911110003', '成都市武侯区', '周八', '13922220003', '杭州市西湖区', '书籍', 0.80, 10.00, 1),
('YB20260524004', '吴九', '13911110004', '武汉市洪山区', '郑十', '13922220004', '南京市鼓楼区', '食品', 3.00, 18.00, 0);

INSERT INTO t_tracking_node (waybill_id, waybill_no, node_type, location, description, operator, operator_phone, node_time) VALUES
(1, 'YB20260524001', 1, '北京市朝阳区', '快件已揽件', '刘师傅', '13700000001', '2026-05-20 09:30:00'),
(1, 'YB20260524001', 2, '北京转运中心', '快件到达北京转运中心', '系统', NULL, '2026-05-20 14:20:00'),
(1, 'YB20260524001', 3, '上海转运中心', '快件到达上海转运中心', '系统', NULL, '2026-05-21 08:45:00'),
(1, 'YB20260524001', 4, '上海市浦东新区', '快件正在派送', '陈师傅', '13700000002', '2026-05-21 14:00:00'),
(1, 'YB20260524001', 5, '上海市浦东新区', '快件已签收，签收人：李四', '陈师傅', '13700000002', '2026-05-21 16:30:00'),

(2, 'YB20260524002', 1, '广州市天河区', '快件已揽件', '黄师傅', '13700000003', '2026-05-22 10:00:00'),
(2, 'YB20260524002', 2, '广州转运中心', '快件到达广州转运中心', '系统', NULL, '2026-05-22 15:30:00'),
(2, 'YB20260524002', 3, '深圳转运中心', '快件到达深圳转运中心', '系统', NULL, '2026-05-23 09:00:00'),
(2, 'YB20260524002', 4, '深圳市南山区', '快件正在派送', '林师傅', '13700000004', '2026-05-24 08:30:00'),

(3, 'YB20260524003', 1, '成都市武侯区', '快件已揽件', '徐师傅', '13700000005', '2026-05-23 11:00:00'),
(3, 'YB20260524003', 2, '成都转运中心', '快件到达成都转运中心', '系统', NULL, '2026-05-23 16:00:00'),
(3, 'YB20260524003', 3, '杭州转运中心', '快件到达杭州转运中心', '系统', NULL, '2026-05-24 10:00:00'),

(4, 'YB20260524004', 0, '武汉市洪山区', '等待揽件', NULL, NULL, '2026-05-24 10:00:00');
