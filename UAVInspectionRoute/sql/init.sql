SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS uav_inspection DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE uav_inspection;

-- ============================================================
-- 巡检区域表
-- ============================================================
CREATE TABLE IF NOT EXISTS inspection_areas (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(128) NOT NULL COMMENT '区域名称',
    area_type TINYINT NOT NULL DEFAULT 0 COMMENT '区域类型: 0=电力 1=光伏 2=农田',
    boundary_polygon JSON NOT NULL COMMENT '区域边界多边形坐标 [[lng,lat],...]',
    center_lng DOUBLE NOT NULL COMMENT '中心点经度',
    center_lat DOUBLE NOT NULL COMMENT '中心点纬度',
    description VARCHAR(512) DEFAULT '' COMMENT '区域描述',
    created_by BIGINT UNSIGNED DEFAULT 0 COMMENT '创建人ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,
    INDEX idx_area_type (area_type),
    INDEX idx_created_at (created_at),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='巡检区域';

-- ============================================================
-- 禁飞区表
-- ============================================================
CREATE TABLE IF NOT EXISTS no_fly_zones (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(128) NOT NULL COMMENT '禁飞区名称',
    zone_type TINYINT NOT NULL DEFAULT 0 COMMENT '类型: 0=机场 1=军事 2=政府 3=其他',
    center_lng DOUBLE NOT NULL COMMENT '中心经度',
    center_lat DOUBLE NOT NULL COMMENT '中心纬度',
    radius DOUBLE NOT NULL DEFAULT 0 COMMENT '半径(米)，圆形禁飞区',
    boundary_polygon JSON DEFAULT NULL COMMENT '多边形禁飞区坐标',
    max_altitude DOUBLE DEFAULT 0 COMMENT '限飞高度(米)，0=全高度禁飞',
    effective_from DATETIME DEFAULT NULL COMMENT '生效开始时间',
    effective_to DATETIME DEFAULT NULL COMMENT '生效结束时间',
    source VARCHAR(64) DEFAULT '' COMMENT '数据来源',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,
    INDEX idx_zone_type (zone_type),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='禁飞区';

-- ============================================================
-- 航线表
-- ============================================================
CREATE TABLE IF NOT EXISTS routes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(128) NOT NULL COMMENT '航线名称',
    area_id BIGINT UNSIGNED NOT NULL COMMENT '所属巡检区域ID',
    route_type TINYINT NOT NULL DEFAULT 0 COMMENT '航线类型: 0=手动规划 1=自动网格',
    altitude DOUBLE NOT NULL DEFAULT 50 COMMENT '默认飞行高度(米)',
    speed DOUBLE NOT NULL DEFAULT 5 COMMENT '默认飞行速度(m/s)',
    overlap_rate DOUBLE NOT NULL DEFAULT 70 COMMENT '重叠率(%)',
    side_overlap_rate DOUBLE NOT NULL DEFAULT 60 COMMENT '旁向重叠率(%)',
    camera_angle DOUBLE NOT NULL DEFAULT 90 COMMENT '云台角度(度)，90=垂直向下',
    total_distance DOUBLE DEFAULT 0 COMMENT '航线总距离(米)',
    estimated_duration INT DEFAULT 0 COMMENT '预计飞行时长(秒)',
    description VARCHAR(512) DEFAULT '' COMMENT '航线描述',
    created_by BIGINT UNSIGNED DEFAULT 0 COMMENT '创建人ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,
    INDEX idx_area_id (area_id),
    INDEX idx_created_at (created_at),
    INDEX idx_deleted_at (deleted_at),
    CONSTRAINT fk_route_area FOREIGN KEY (area_id) REFERENCES inspection_areas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='航线';

-- ============================================================
-- 航线点表
-- ============================================================
CREATE TABLE IF NOT EXISTS route_points (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    route_id BIGINT UNSIGNED NOT NULL COMMENT '所属航线ID',
    seq_num INT UNSIGNED NOT NULL COMMENT '点序号（从1开始）',
    lng DOUBLE NOT NULL COMMENT '经度',
    lat DOUBLE NOT NULL COMMENT '纬度',
    altitude DOUBLE NOT NULL DEFAULT 50 COMMENT '飞行高度(米)',
    speed DOUBLE DEFAULT 0 COMMENT '该段速度(m/s)，0=使用航线默认',
    point_type TINYINT NOT NULL DEFAULT 0 COMMENT '点类型: 0=航点 1=起飞点 2=降落点 3=悬停点',
    action TINYINT DEFAULT 0 COMMENT '动作: 0=无 1=拍照 2=录像 3=悬停拍照',
    heading DOUBLE DEFAULT 0 COMMENT '航向角(度)',
    gimbal_pitch DOUBLE DEFAULT -90 COMMENT '云台俯仰角(度)',
    hover_time INT DEFAULT 0 COMMENT '悬停时间(秒)',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_route_id (route_id),
    INDEX idx_route_seq (route_id, seq_num),
    CONSTRAINT fk_point_route FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='航线点';

-- ============================================================
-- 无人机表
-- ============================================================
CREATE TABLE IF NOT EXISTS drones (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(128) NOT NULL COMMENT '无人机名称',
    sn VARCHAR(64) NOT NULL COMMENT '序列号',
    model VARCHAR(64) DEFAULT '' COMMENT '型号',
    max_flight_time INT DEFAULT 30 COMMENT '最大续航(分钟)',
    max_altitude DOUBLE DEFAULT 120 COMMENT '最大飞行高度(米)',
    max_speed DOUBLE DEFAULT 15 COMMENT '最大飞行速度(m/s)',
    camera_type VARCHAR(64) DEFAULT '' COMMENT '相机型号',
    status TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0=空闲 1=执行中 2=维护中 3=离线',
    last_seen_at DATETIME DEFAULT NULL COMMENT '最后在线时间',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,
    UNIQUE INDEX idx_sn (sn),
    INDEX idx_status (status),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='无人机';

-- ============================================================
-- 巡检任务表
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(128) NOT NULL COMMENT '任务标题',
    area_id BIGINT UNSIGNED NOT NULL COMMENT '巡检区域ID',
    route_id BIGINT UNSIGNED NOT NULL COMMENT '航线ID',
    drone_id BIGINT UNSIGNED DEFAULT NULL COMMENT '执行无人机ID',
    status TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0=待分配 1=已分配 2=执行中 3=已完成 4=已取消 5=异常中断',
    priority TINYINT NOT NULL DEFAULT 1 COMMENT '优先级: 0=低 1=中 2=高 3=紧急',
    inspection_type TINYINT NOT NULL DEFAULT 0 COMMENT '巡检类型: 0=常规 1=应急 2=复核',
    scheduled_at DATETIME DEFAULT NULL COMMENT '计划执行时间',
    started_at DATETIME DEFAULT NULL COMMENT '实际开始时间',
    completed_at DATETIME DEFAULT NULL COMMENT '实际完成时间',
    actual_duration INT DEFAULT 0 COMMENT '实际飞行时长(秒)',
    flight_distance DOUBLE DEFAULT 0 COMMENT '实际飞行距离(米)',
    operator_id BIGINT UNSIGNED DEFAULT 0 COMMENT '操作员ID',
    result_summary VARCHAR(512) DEFAULT '' COMMENT '执行结果摘要',
    cancel_reason VARCHAR(256) DEFAULT '' COMMENT '取消原因',
    created_by BIGINT UNSIGNED DEFAULT 0 COMMENT '创建人ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,
    INDEX idx_area_id (area_id),
    INDEX idx_route_id (route_id),
    INDEX idx_drone_id (drone_id),
    INDEX idx_status (status),
    INDEX idx_scheduled_at (scheduled_at),
    INDEX idx_deleted_at (deleted_at),
    CONSTRAINT fk_task_area FOREIGN KEY (area_id) REFERENCES inspection_areas(id),
    CONSTRAINT fk_task_route FOREIGN KEY (route_id) REFERENCES routes(id),
    CONSTRAINT fk_task_drone FOREIGN KEY (drone_id) REFERENCES drones(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='巡检任务';

-- ============================================================
-- 任务状态流转记录表
-- ============================================================
CREATE TABLE IF NOT EXISTS task_status_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    task_id BIGINT UNSIGNED NOT NULL COMMENT '任务ID',
    from_status TINYINT NOT NULL COMMENT '原状态',
    to_status TINYINT NOT NULL COMMENT '新状态',
    operator_id BIGINT UNSIGNED DEFAULT 0 COMMENT '操作人ID',
    remark VARCHAR(256) DEFAULT '' COMMENT '备注',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_task_id (task_id),
    CONSTRAINT fk_log_task FOREIGN KEY (task_id) REFERENCES tasks(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务状态流转记录';

-- ============================================================
-- 影像归档表
-- ============================================================
CREATE TABLE IF NOT EXISTS media_files (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    task_id BIGINT UNSIGNED NOT NULL COMMENT '所属任务ID',
    file_name VARCHAR(256) NOT NULL COMMENT '文件名',
    file_type TINYINT NOT NULL DEFAULT 0 COMMENT '类型: 0=图片 1=视频',
    mime_type VARCHAR(64) DEFAULT '' COMMENT 'MIME类型',
    file_size BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '文件大小(字节)',
    storage_path VARCHAR(512) NOT NULL COMMENT '存储路径',
    thumbnail_path VARCHAR(512) DEFAULT '' COMMENT '缩略图路径',
    file_hash VARCHAR(64) DEFAULT '' COMMENT '文件MD5哈希',
    width INT DEFAULT 0 COMMENT '图片宽度',
    height INT DEFAULT 0 COMMENT '图片高度',
    duration DOUBLE DEFAULT 0 COMMENT '视频时长(秒)',
    capture_lng DOUBLE DEFAULT NULL COMMENT '拍摄经度',
    capture_lat DOUBLE DEFAULT NULL COMMENT '拍摄纬度',
    capture_altitude DOUBLE DEFAULT 0 COMMENT '拍摄高度(米)',
    capture_heading DOUBLE DEFAULT 0 COMMENT '拍摄航向角',
    capture_gimbal_pitch DOUBLE DEFAULT -90 COMMENT '拍摄云台俯仰角',
    capture_time DATETIME DEFAULT NULL COMMENT '拍摄时间',
    route_point_id BIGINT UNSIGNED DEFAULT NULL COMMENT '关联航线点ID',
    upload_status TINYINT NOT NULL DEFAULT 0 COMMENT '上传状态: 0=上传中 1=已完成 2=失败',
    chunk_count INT DEFAULT 0 COMMENT '分片总数',
    uploaded_chunks VARCHAR(1024) DEFAULT '' COMMENT '已上传分片索引(逗号分隔)',
    archived_at DATETIME DEFAULT NULL COMMENT '归档时间',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,
    INDEX idx_task_id (task_id),
    INDEX idx_file_type (file_type),
    INDEX idx_upload_status (upload_status),
    INDEX idx_capture_time (capture_time),
    INDEX idx_file_hash (file_hash),
    INDEX idx_deleted_at (deleted_at),
    CONSTRAINT fk_media_task FOREIGN KEY (task_id) REFERENCES tasks(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='影像归档';

-- ============================================================
-- 文件分片上传临时表
-- ============================================================
CREATE TABLE IF NOT EXISTS upload_chunks (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    upload_id VARCHAR(64) NOT NULL COMMENT '上传批次ID',
    file_name VARCHAR(256) NOT NULL COMMENT '文件名',
    chunk_index INT UNSIGNED NOT NULL COMMENT '分片索引',
    chunk_hash VARCHAR(64) DEFAULT '' COMMENT '分片MD5',
    chunk_size BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '分片大小',
    storage_path VARCHAR(512) NOT NULL COMMENT '分片存储路径',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_upload_chunk (upload_id, chunk_index),
    INDEX idx_upload_id (upload_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件分片上传临时记录';

-- ============================================================
-- 问题标注表
-- ============================================================
CREATE TABLE IF NOT EXISTS annotations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    media_id BIGINT UNSIGNED NOT NULL COMMENT '所属影像ID',
    task_id BIGINT UNSIGNED NOT NULL COMMENT '所属任务ID',
    area_id BIGINT UNSIGNED NOT NULL COMMENT '所属巡检区域ID',
    title VARCHAR(128) NOT NULL COMMENT '标注标题',
    category TINYINT NOT NULL DEFAULT 0 COMMENT '问题类别: 0=设备缺陷 1=线路异常 2=植被侵限 3=地表变化 4=其他',
    severity TINYINT NOT NULL DEFAULT 0 COMMENT '严重程度: 0=提示 1=一般 2=严重 3=危急',
    description VARCHAR(1024) DEFAULT '' COMMENT '问题描述',
    shape_type TINYINT NOT NULL DEFAULT 0 COMMENT '标注形状: 0=矩形 1=圆形 2=多边形 3=点',
    shape_data JSON NOT NULL COMMENT '标注形状数据(影像坐标)',
    x_ratio DOUBLE DEFAULT 0 COMMENT '标注中心X比例(0-1，相对影像宽度)',
    y_ratio DOUBLE DEFAULT 0 COMMENT '标注中心Y比例(0-1，相对影像高度)',
    width_ratio DOUBLE DEFAULT 0 COMMENT '标注宽度比例',
    height_ratio DOUBLE DEFAULT 0 COMMENT '标注高度比例',
    geo_lng DOUBLE DEFAULT NULL COMMENT '地理经度(由影像坐标换算)',
    geo_lat DOUBLE DEFAULT NULL COMMENT '地理纬度(由影像坐标换算)',
    status TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0=待确认 1=已确认 2=已处理 3=已忽略',
    assigned_to BIGINT UNSIGNED DEFAULT NULL COMMENT '处理人ID',
    resolved_at DATETIME DEFAULT NULL COMMENT '处理完成时间',
    resolution VARCHAR(512) DEFAULT '' COMMENT '处理说明',
    created_by BIGINT UNSIGNED DEFAULT 0 COMMENT '标注人ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,
    INDEX idx_media_id (media_id),
    INDEX idx_task_id (task_id),
    INDEX idx_area_id (area_id),
    INDEX idx_category (category),
    INDEX idx_severity (severity),
    INDEX idx_status (status),
    INDEX idx_geo (geo_lng, geo_lat),
    INDEX idx_deleted_at (deleted_at),
    CONSTRAINT fk_annotation_media FOREIGN KEY (media_id) REFERENCES media_files(id),
    CONSTRAINT fk_annotation_task FOREIGN KEY (task_id) REFERENCES tasks(id),
    CONSTRAINT fk_annotation_area FOREIGN KEY (area_id) REFERENCES inspection_areas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='问题标注';

-- ============================================================
-- 巡检报告表
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(128) NOT NULL COMMENT '报告标题',
    task_id BIGINT UNSIGNED NOT NULL COMMENT '关联任务ID',
    area_id BIGINT UNSIGNED NOT NULL COMMENT '巡检区域ID',
    report_type TINYINT NOT NULL DEFAULT 0 COMMENT '报告类型: 0=常规报告 1=异常报告 2=对比报告',
    total_media INT DEFAULT 0 COMMENT '影像总数',
    total_annotations INT DEFAULT 0 COMMENT '标注总数',
    critical_count INT DEFAULT 0 COMMENT '危急问题数',
    severe_count INT DEFAULT 0 COMMENT '严重问题数',
    normal_count INT DEFAULT 0 COMMENT '一般问题数',
    info_count INT DEFAULT 0 COMMENT '提示问题数',
    flight_duration INT DEFAULT 0 COMMENT '飞行时长(秒)',
    flight_distance DOUBLE DEFAULT 0 COMMENT '飞行距离(米)',
    coverage_area DOUBLE DEFAULT 0 COMMENT '覆盖面积(平方米)',
    content JSON DEFAULT NULL COMMENT '报告内容(JSON)',
    file_path VARCHAR(512) DEFAULT '' COMMENT '导出文件路径',
    status TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0=草稿 1=已生成 2=已审核 3=已发布',
    reviewed_by BIGINT UNSIGNED DEFAULT NULL COMMENT '审核人ID',
    reviewed_at DATETIME DEFAULT NULL COMMENT '审核时间',
    created_by BIGINT UNSIGNED DEFAULT 0 COMMENT '创建人ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,
    INDEX idx_task_id (task_id),
    INDEX idx_area_id (area_id),
    INDEX idx_report_type (report_type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_deleted_at (deleted_at),
    CONSTRAINT fk_report_task FOREIGN KEY (task_id) REFERENCES tasks(id),
    CONSTRAINT fk_report_area FOREIGN KEY (area_id) REFERENCES inspection_areas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='巡检报告';

-- ============================================================
-- 历史对比记录表
-- ============================================================
CREATE TABLE IF NOT EXISTS comparisons (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(128) NOT NULL COMMENT '对比标题',
    area_id BIGINT UNSIGNED NOT NULL COMMENT '巡检区域ID',
    base_task_id BIGINT UNSIGNED NOT NULL COMMENT '基准任务ID',
    compare_task_id BIGINT UNSIGNED NOT NULL COMMENT '对比任务ID',
    comparison_type TINYINT NOT NULL DEFAULT 0 COMMENT '对比类型: 0=影像对比 1=标注对比 2=综合对比',
    result JSON DEFAULT NULL COMMENT '对比结果(JSON)',
    new_annotations INT DEFAULT 0 COMMENT '新增问题数',
    resolved_annotations INT DEFAULT 0 COMMENT '已解决问题数',
    changed_annotations INT DEFAULT 0 COMMENT '变化问题数',
    similarity_score DOUBLE DEFAULT 0 COMMENT '相似度评分(0-100)',
    description VARCHAR(512) DEFAULT '' COMMENT '对比说明',
    created_by BIGINT UNSIGNED DEFAULT 0 COMMENT '创建人ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,
    INDEX idx_area_id (area_id),
    INDEX idx_base_task (base_task_id),
    INDEX idx_compare_task (compare_task_id),
    INDEX idx_deleted_at (deleted_at),
    CONSTRAINT fk_comp_area FOREIGN KEY (area_id) REFERENCES inspection_areas(id),
    CONSTRAINT fk_comp_base FOREIGN KEY (base_task_id) REFERENCES tasks(id),
    CONSTRAINT fk_comp_compare FOREIGN KEY (compare_task_id) REFERENCES tasks(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='历史对比';

-- ============================================================
-- 用户表
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(64) NOT NULL COMMENT '用户名',
    password VARCHAR(256) NOT NULL COMMENT '密码(加密)',
    real_name VARCHAR(64) DEFAULT '' COMMENT '真实姓名',
    phone VARCHAR(20) DEFAULT '' COMMENT '手机号',
    email VARCHAR(128) DEFAULT '' COMMENT '邮箱',
    role TINYINT NOT NULL DEFAULT 0 COMMENT '角色: 0=操作员 1=管理员 2=审核员',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0=禁用 1=启用',
    last_login_at DATETIME DEFAULT NULL COMMENT '最后登录时间',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,
    UNIQUE INDEX idx_username (username),
    INDEX idx_role (role),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户';

-- ============================================================
-- 初始管理员
-- ============================================================
INSERT INTO users (username, password, real_name, role) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '系统管理员', 1);
