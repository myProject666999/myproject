CREATE DATABASE IF NOT EXISTS complaint_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE complaint_db;

DROP TABLE IF EXISTS complaint_progress;
DROP TABLE IF EXISTS complaint_file;
DROP TABLE IF EXISTS complaint;
DROP TABLE IF EXISTS complaint_category;

CREATE TABLE complaint_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(200),
    create_time DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE complaint (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category_id BIGINT NOT NULL,
    area VARCHAR(200),
    content TEXT NOT NULL,
    contact_name VARCHAR(50),
    contact_phone VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    rating INT,
    feedback TEXT,
    create_time DATETIME,
    update_time DATETIME,
    INDEX idx_category (category_id),
    INDEX idx_status (status),
    INDEX idx_phone (contact_phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE complaint_file (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    file_name VARCHAR(200) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    upload_time DATETIME,
    INDEX idx_complaint (complaint_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE complaint_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL,
    description TEXT,
    handler VARCHAR(50),
    create_time DATETIME,
    INDEX idx_complaint (complaint_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO complaint_category (id, name, description, create_time) VALUES
(1, '环境卫生', '关于环境卫生方面的投诉', NOW()),
(2, '设施维修', '关于公共设施损坏、维修的投诉', NOW()),
(3, '噪音扰民', '关于噪音污染扰民的投诉', NOW()),
(4, '安全隐患', '关于安全隐患方面的投诉', NOW()),
(5, '其他', '其他未分类事项', NOW());

INSERT INTO complaint (id, title, category_id, area, content, contact_name, contact_phone, status, rating, feedback, create_time, update_time) VALUES
(1, '小区门口垃圾堆积', 1, '朝阳区阳光小区A栋', '小区门口垃圾堆积多日未清理，天气炎热已散发臭味，严重影响居民生活。', '张三', '13800000001', 'COMPLETED', 5, '处理及时，非常满意！', NOW(), NOW()),
(2, '路灯损坏需维修', 2, '海淀区幸福路', '幸福路与平安街交叉口的路灯已损坏一周，夜间出行非常不便，存在安全隐患。', '李四', '13800000002', 'PROCESSING', NULL, NULL, NOW(), NOW()),
(3, '夜间施工噪音扰民', 3, '西城区建设大街', '附近工地夜间持续施工至凌晨，严重影响居民休息，请相关部门调查处理。', '王五', '13800000003', 'PENDING', NULL, NULL, NOW(), NOW()),
(4, '小区监控摄像头损坏', 4, '丰台区绿色家园', '小区多个监控摄像头已损坏超过半年，业主多次报修未果，存在严重安全隐患。', '赵六', '13800000004', 'REPLIED', NULL, NULL, NOW(), NOW());

INSERT INTO complaint_progress (id, complaint_id, status, description, handler, create_time) VALUES
(1, 1, 'PENDING', '投诉已提交，等待受理', '系统', NOW()),
(2, 1, 'PROCESSING', '已派单至环卫部门', '李主管', NOW()),
(3, 1, 'REPLIED', '垃圾已清理，后续加强监管', '张队长', NOW()),
(4, 1, 'COMPLETED', '用户已评价，事项办结', '系统', NOW()),
(5, 2, 'PENDING', '投诉已提交，等待受理', '系统', NOW()),
(6, 2, 'PROCESSING', '已通知市政部门派人维修', '王主管', NOW()),
(7, 3, 'PENDING', '投诉已提交，等待受理', '系统', NOW()),
(8, 4, 'PENDING', '投诉已提交，等待受理', '系统', NOW()),
(9, 4, 'REPLIED', '已联系物业，预计下周修复', '刘主管', NOW());
