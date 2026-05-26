-- 创建数据库
CREATE DATABASE IF NOT EXISTS online_training_attendance DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE online_training_attendance;

-- 管理员表
CREATE TABLE IF NOT EXISTS admin (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '管理员ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    email VARCHAR(100) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '手机号',
    status TINYINT DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';

-- 培训班表
CREATE TABLE IF NOT EXISTS training (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '培训班ID',
    name VARCHAR(200) NOT NULL COMMENT '培训班名称',
    description TEXT COMMENT '培训班描述',
    instructor VARCHAR(100) COMMENT '讲师',
    start_date DATE NOT NULL COMMENT '开始日期',
    end_date DATE NOT NULL COMMENT '结束日期',
    total_hours DECIMAL(5,1) DEFAULT 0 COMMENT '总学时',
    min_attendance_rate DECIMAL(5,2) DEFAULT 80.00 COMMENT '最低出勤率要求(%)',
    status TINYINT DEFAULT 1 COMMENT '状态：0-未开始，1-进行中，2-已结束',
    qr_code VARCHAR(500) COMMENT '签到二维码内容',
    created_by BIGINT COMMENT '创建人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (created_by) REFERENCES admin(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='培训班表';

-- 学员表
CREATE TABLE IF NOT EXISTS student (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '学员ID',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    id_card VARCHAR(18) UNIQUE COMMENT '身份证号',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    gender TINYINT COMMENT '性别：1-男，2-女',
    avatar VARCHAR(500) COMMENT '头像URL',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学员表';

-- 培训-学员关联表
CREATE TABLE IF NOT EXISTS training_student (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '关联ID',
    training_id BIGINT NOT NULL COMMENT '培训班ID',
    student_id BIGINT NOT NULL COMMENT '学员ID',
    enroll_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '报名时间',
    attendance_count INT DEFAULT 0 COMMENT '签到次数',
    total_classes INT DEFAULT 0 COMMENT '应签到次数',
    attendance_rate DECIMAL(5,2) DEFAULT 0.00 COMMENT '出勤率(%)',
    is_completed TINYINT DEFAULT 0 COMMENT '是否完成：0-未完成，1-已完成',
    completed_at DATETIME COMMENT '完成时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (training_id) REFERENCES training(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
    UNIQUE KEY uk_training_student (training_id, student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='培训-学员关联表';

-- 签到记录表
CREATE TABLE IF NOT EXISTS attendance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '签到ID',
    training_id BIGINT NOT NULL COMMENT '培训班ID',
    student_id BIGINT NOT NULL COMMENT '学员ID',
    check_in_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '签到时间',
    check_in_type TINYINT DEFAULT 1 COMMENT '签到方式：1-二维码，2-手动',
    ip_address VARCHAR(50) COMMENT '签到IP地址',
    device_info VARCHAR(500) COMMENT '设备信息',
    remark VARCHAR(500) COMMENT '备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (training_id) REFERENCES training(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
    INDEX idx_training_date (training_id, check_in_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='签到记录表';

-- 证书表
CREATE TABLE IF NOT EXISTS certificate (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '证书ID',
    certificate_no VARCHAR(50) NOT NULL UNIQUE COMMENT '证书编号',
    training_id BIGINT NOT NULL COMMENT '培训班ID',
    student_id BIGINT NOT NULL COMMENT '学员ID',
    student_name VARCHAR(50) NOT NULL COMMENT '学员姓名',
    training_name VARCHAR(200) NOT NULL COMMENT '培训班名称',
    instructor VARCHAR(100) COMMENT '讲师',
    start_date DATE COMMENT '开始日期',
    end_date DATE COMMENT '结束日期',
    total_hours DECIMAL(5,1) COMMENT '总学时',
    issue_date DATE NOT NULL COMMENT '颁发日期',
    certificate_url VARCHAR(500) COMMENT '证书图片URL',
    pdf_url VARCHAR(500) COMMENT '证书PDF URL',
    verify_code VARCHAR(100) NOT NULL UNIQUE COMMENT '验证码（用于防伪查验）',
    is_valid TINYINT DEFAULT 1 COMMENT '是否有效：1-有效，0-已吊销',
    revoked_at DATETIME COMMENT '吊销时间',
    revoked_reason VARCHAR(500) COMMENT '吊销原因',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (training_id) REFERENCES training(id),
    FOREIGN KEY (student_id) REFERENCES student(id),
    INDEX idx_certificate_no (certificate_no),
    INDEX idx_verify_code (verify_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='证书表';

-- 签到会话表（用于二维码签到）
CREATE TABLE IF NOT EXISTS checkin_session (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '会话ID',
    training_id BIGINT NOT NULL COMMENT '培训班ID',
    session_token VARCHAR(100) NOT NULL UNIQUE COMMENT '会话令牌',
    qr_code_content VARCHAR(500) COMMENT '二维码内容',
    expire_time DATETIME NOT NULL COMMENT '过期时间',
    is_active TINYINT DEFAULT 1 COMMENT '是否有效：1-有效，0-已失效',
    created_by BIGINT COMMENT '创建人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (training_id) REFERENCES training(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='签到会话表';

-- 插入默认管理员数据 (用户名: admin, 密码: admin123)
INSERT INTO admin (username, password, name, email, phone) VALUES 
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '系统管理员', 'admin@example.com', '13800138000')
ON DUPLICATE KEY UPDATE username=username;
