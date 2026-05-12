-- 创建数据库
CREATE DATABASE IF NOT EXISTS onsite_repair DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE onsite_repair;

-- 用户表
CREATE TABLE IF NOT EXISTS user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    phone VARCHAR(20) NOT NULL UNIQUE COMMENT '手机号',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    nickname VARCHAR(50) COMMENT '昵称',
    avatar VARCHAR(255) COMMENT '头像',
    real_name VARCHAR(50) COMMENT '真实姓名',
    gender TINYINT DEFAULT 0 COMMENT '性别：0-未知 1-男 2-女',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用 1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 师傅表
CREATE TABLE IF NOT EXISTS worker (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '师傅ID',
    phone VARCHAR(20) NOT NULL UNIQUE COMMENT '手机号',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    nickname VARCHAR(50) COMMENT '昵称',
    avatar VARCHAR(255) COMMENT '头像',
    real_name VARCHAR(50) COMMENT '真实姓名',
    id_card VARCHAR(18) COMMENT '身份证号',
    id_card_front VARCHAR(255) COMMENT '身份证正面照',
    id_card_back VARCHAR(255) COMMENT '身份证背面照',
    skills VARCHAR(500) COMMENT '技能标签（逗号分隔）',
    certificate VARCHAR(255) COMMENT '资质证书',
    latitude DECIMAL(10, 7) COMMENT '纬度',
    longitude DECIMAL(10, 7) COMMENT '经度',
    address VARCHAR(255) COMMENT '当前地址',
    rating DECIMAL(3, 2) DEFAULT 5.00 COMMENT '评分',
    order_count INT DEFAULT 0 COMMENT '订单数',
    status TINYINT DEFAULT 0 COMMENT '状态：0-待审核 1-审核通过 2-审核拒绝 3-禁用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='师傅表';

-- 订单表
CREATE TABLE IF NOT EXISTS repair_order (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '订单ID',
    order_no VARCHAR(32) NOT NULL UNIQUE COMMENT '订单号',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    worker_id BIGINT COMMENT '师傅ID',
    category VARCHAR(50) NOT NULL COMMENT '维修类别：家电/水电',
    fault_type VARCHAR(100) NOT NULL COMMENT '故障类型',
    fault_desc TEXT NOT NULL COMMENT '故障描述',
    images TEXT COMMENT '故障图片URL（逗号分隔）',
    video VARCHAR(255) COMMENT '故障视频URL',
    contact_name VARCHAR(50) NOT NULL COMMENT '联系人',
    contact_phone VARCHAR(20) NOT NULL COMMENT '联系电话',
    address VARCHAR(255) NOT NULL COMMENT '地址',
    latitude DECIMAL(10, 7) NOT NULL COMMENT '纬度',
    longitude DECIMAL(10, 7) NOT NULL COMMENT '经度',
    appointment_time DATETIME COMMENT '预约时间',
    parts_list TEXT COMMENT '配件清单JSON',
    parts_amount DECIMAL(10, 2) DEFAULT 0 COMMENT '配件费用',
    labor_amount DECIMAL(10, 2) DEFAULT 0 COMMENT '人工费用',
    total_amount DECIMAL(10, 2) DEFAULT 0 COMMENT '总费用',
    negotiated_amount DECIMAL(10, 2) COMMENT '议价后金额',
    negotiated_note TEXT COMMENT '议价备注',
    negotiation_status TINYINT DEFAULT 0 COMMENT '议价状态：0-未议价 1-用户议价中 2-师傅已确认 3-用户已确认',
    before_images TEXT COMMENT '维修前图片URL（逗号分隔）',
    after_images TEXT COMMENT '维修后图片URL（逗号分隔）',
    recording_url VARCHAR(255) COMMENT '服务录音URL',
    status TINYINT DEFAULT 0 COMMENT '订单状态：0-待接单 1-已接单 2-服务中 3-待确认 4-待支付 5-已完成 6-已取消 7-已关闭',
    grab_start_time DATETIME COMMENT '抢单开始时间',
    grab_end_time DATETIME COMMENT '抢单结束时间',
    accept_time DATETIME COMMENT '接单时间',
    start_time DATETIME COMMENT '开始服务时间',
    finish_time DATETIME COMMENT '完成时间',
    cancel_time DATETIME COMMENT '取消时间',
    cancel_reason TEXT COMMENT '取消原因',
    pay_time DATETIME COMMENT '支付时间',
    pay_type VARCHAR(20) COMMENT '支付方式',
    pay_trade_no VARCHAR(64) COMMENT '支付交易号',
    warranty_months INT DEFAULT 3 COMMENT '保修期（月）',
    warranty_start_time DATETIME COMMENT '保修期开始时间',
    warranty_end_time DATETIME COMMENT '保修期结束时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0,
    INDEX idx_user_id (user_id),
    INDEX idx_worker_id (worker_id),
    INDEX idx_status (status),
    INDEX idx_order_no (order_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 抢单记录表
CREATE TABLE IF NOT EXISTS grab_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL COMMENT '订单ID',
    worker_id BIGINT NOT NULL COMMENT '师傅ID',
    distance DECIMAL(10, 2) COMMENT '距离（公里）',
    grab_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '抢单时间',
    is_success TINYINT DEFAULT 0 COMMENT '是否成功：0-失败 1-成功',
    INDEX idx_order_id (order_id),
    INDEX idx_worker_id (worker_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='抢单记录表';

-- 评价表
CREATE TABLE IF NOT EXISTS review (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL UNIQUE COMMENT '订单ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    worker_id BIGINT NOT NULL COMMENT '师傅ID',
    rating TINYINT NOT NULL COMMENT '评分：1-5',
    content TEXT COMMENT '评价内容',
    images TEXT COMMENT '评价图片URL（逗号分隔）',
    status TINYINT DEFAULT 1 COMMENT '状态：0-隐藏 1-显示',
    reply_content TEXT COMMENT '师傅回复',
    reply_time DATETIME COMMENT '回复时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_worker_id (worker_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评价表';

-- 通知表
CREATE TABLE IF NOT EXISTS notification (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_type TINYINT NOT NULL COMMENT '用户类型：1-用户 2-师傅',
    user_id BIGINT NOT NULL COMMENT '用户/师傅ID',
    type VARCHAR(50) NOT NULL COMMENT '通知类型',
    title VARCHAR(100) NOT NULL COMMENT '标题',
    content TEXT COMMENT '内容',
    related_id BIGINT COMMENT '关联ID（如订单ID）',
    is_read TINYINT DEFAULT 0 COMMENT '是否已读：0-未读 1-已读',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_type, user_id),
    INDEX idx_unread (user_type, user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通知表';

-- 管理员表
CREATE TABLE IF NOT EXISTS admin (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    status TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';

-- 初始化管理员
INSERT INTO admin (username, password, nickname) VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '超级管理员');
