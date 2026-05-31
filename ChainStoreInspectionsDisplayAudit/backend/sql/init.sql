-- 连锁门店巡店与陈列稽核系统数据库
-- 创建数据库
CREATE DATABASE IF NOT EXISTS chain_store_inspection DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE chain_store_inspection;

-- 1. 门店表
CREATE TABLE IF NOT EXISTS stores (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '门店ID',
    store_code VARCHAR(50) NOT NULL UNIQUE COMMENT '门店编码',
    store_name VARCHAR(100) NOT NULL COMMENT '门店名称',
    address VARCHAR(255) NOT NULL COMMENT '门店地址',
    province VARCHAR(50) COMMENT '省份',
    city VARCHAR(50) COMMENT '城市',
    district VARCHAR(50) COMMENT '区县',
    longitude DECIMAL(10, 7) COMMENT '经度',
    latitude DECIMAL(10, 7) COMMENT '纬度',
    manager_name VARCHAR(50) COMMENT '店长姓名',
    manager_phone VARCHAR(20) COMMENT '店长电话',
    area VARCHAR(50) COMMENT '所属区域',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常 0-关闭',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_store_code (store_code),
    INDEX idx_city (city),
    INDEX idx_area (area)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='门店表';

-- 2. 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码（加密）',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    role VARCHAR(20) NOT NULL DEFAULT 'inspector' COMMENT '角色：admin-管理员 inspector-巡店员 manager-门店经理',
    avatar VARCHAR(255) COMMENT '头像URL',
    department VARCHAR(100) COMMENT '所属部门',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常 0-禁用',
    last_login_at DATETIME COMMENT '最后登录时间',
    last_login_ip VARCHAR(50) COMMENT '最后登录IP',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 3. 检查表模板表
CREATE TABLE IF NOT EXISTS checklist_templates (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '模板ID',
    template_name VARCHAR(100) NOT NULL COMMENT '模板名称',
    template_type VARCHAR(50) NOT NULL COMMENT '模板类型：display-陈列 hygiene-卫生 price-价签 other-其他',
    description TEXT COMMENT '模板描述',
    total_score INT DEFAULT 100 COMMENT '总分',
    pass_score INT DEFAULT 60 COMMENT '及格分',
    version VARCHAR(20) DEFAULT '1.0' COMMENT '版本号',
    status TINYINT DEFAULT 1 COMMENT '状态：1-启用 0-禁用',
    creator_id BIGINT UNSIGNED COMMENT '创建人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_template_type (template_type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='检查表模板表';

-- 4. 检查项表
CREATE TABLE IF NOT EXISTS checklist_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '检查项ID',
    template_id BIGINT UNSIGNED NOT NULL COMMENT '所属模板ID',
    item_code VARCHAR(50) NOT NULL COMMENT '检查项编码',
    item_name VARCHAR(200) NOT NULL COMMENT '检查项名称',
    item_description TEXT COMMENT '检查项说明',
    category VARCHAR(50) COMMENT '检查项分类',
    score INT DEFAULT 10 COMMENT '分值',
    sort_order INT DEFAULT 0 COMMENT '排序',
    is_required TINYINT DEFAULT 1 COMMENT '是否必查：1-是 0-否',
    need_photo TINYINT DEFAULT 0 COMMENT '是否需要拍照：1-是 0-否',
    scoring_criteria TEXT COMMENT '评分标准',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_template_id (template_id),
    INDEX idx_category (category),
    FOREIGN KEY (template_id) REFERENCES checklist_templates(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='检查项表';

-- 5. 巡店任务表
CREATE TABLE IF NOT EXISTS inspection_tasks (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '任务ID',
    task_code VARCHAR(50) NOT NULL UNIQUE COMMENT '任务编号',
    task_name VARCHAR(100) NOT NULL COMMENT '任务名称',
    task_type VARCHAR(50) NOT NULL COMMENT '任务类型：routine-日常 audit-稽核 special-专项',
    template_id BIGINT UNSIGNED NOT NULL COMMENT '检查表模板ID',
    store_id BIGINT UNSIGNED NOT NULL COMMENT '门店ID',
    inspector_id BIGINT UNSIGNED NOT NULL COMMENT '巡店员ID',
    plan_date DATE COMMENT '计划巡检日期',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态：pending-待开始 in_progress-进行中 completed-已完成 cancelled-已取消',
    priority TINYINT DEFAULT 2 COMMENT '优先级：1-高 2-中 3-低',
    remark TEXT COMMENT '任务备注',
    actual_score INT COMMENT '实际得分',
    is_pass TINYINT COMMENT '是否合格：1-合格 0-不合格',
    creator_id BIGINT UNSIGNED COMMENT '创建人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_task_code (task_code),
    INDEX idx_store_id (store_id),
    INDEX idx_inspector_id (inspector_id),
    INDEX idx_status (status),
    INDEX idx_plan_date (plan_date),
    FOREIGN KEY (template_id) REFERENCES checklist_templates(id),
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (inspector_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='巡店任务表';

-- 6. 巡店记录表
CREATE TABLE IF NOT EXISTS inspection_records (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
    task_id BIGINT UNSIGNED NOT NULL COMMENT '任务ID',
    item_id BIGINT UNSIGNED NOT NULL COMMENT '检查项ID',
    score INT COMMENT '得分',
    is_pass TINYINT COMMENT '是否合格：1-合格 0-不合格',
    check_result TEXT COMMENT '检查结果说明',
    inspector_id BIGINT UNSIGNED NOT NULL COMMENT '检查人ID',
    check_time DATETIME COMMENT '检查时间',
    longitude DECIMAL(10, 7) COMMENT '检查时经度',
    latitude DECIMAL(10, 7) COMMENT '检查时纬度',
    location_address VARCHAR(255) COMMENT '检查时地址',
    has_photo TINYINT DEFAULT 0 COMMENT '是否有照片：1-是 0-否',
    offline_id VARCHAR(64) COMMENT '离线记录ID，用于同步',
    sync_status TINYINT DEFAULT 1 COMMENT '同步状态：1-已同步 0-待同步',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_task_id (task_id),
    INDEX idx_item_id (item_id),
    INDEX idx_offline_id (offline_id),
    FOREIGN KEY (task_id) REFERENCES inspection_tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES checklist_items(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='巡店记录表';

-- 7. 照片表（防造假：带定位、时间戳、设备信息）
CREATE TABLE IF NOT EXISTS photos (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '照片ID',
    record_id BIGINT UNSIGNED COMMENT '关联巡检记录ID',
    issue_id BIGINT UNSIGNED COMMENT '关联问题ID',
    photo_url VARCHAR(255) NOT NULL COMMENT '照片URL',
    thumbnail_url VARCHAR(255) COMMENT '缩略图URL',
    photo_type VARCHAR(20) DEFAULT 'inspection' COMMENT '照片类型：inspection-巡检 issue-问题 rectification-整改',
    longitude DECIMAL(10, 7) NOT NULL COMMENT '拍摄经度',
    latitude DECIMAL(10, 7) NOT NULL COMMENT '拍摄纬度',
    location_address VARCHAR(255) COMMENT '拍摄地址',
    shoot_time DATETIME NOT NULL COMMENT '拍摄时间（设备时间）',
    device_type VARCHAR(50) COMMENT '设备类型',
    device_model VARCHAR(100) COMMENT '设备型号',
    device_uuid VARCHAR(100) COMMENT '设备唯一标识',
    file_size BIGINT COMMENT '文件大小（字节）',
    file_hash VARCHAR(64) COMMENT '文件哈希值（防篡改）',
    is_valid TINYINT DEFAULT 1 COMMENT '是否有效：1-有效 0-无效',
    uploader_id BIGINT UNSIGNED COMMENT '上传人ID',
    offline_id VARCHAR(64) COMMENT '离线ID',
    sync_status TINYINT DEFAULT 1 COMMENT '同步状态：1-已同步 0-待同步',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_record_id (record_id),
    INDEX idx_issue_id (issue_id),
    INDEX idx_shoot_time (shoot_time),
    INDEX idx_file_hash (file_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='照片表';

-- 8. 问题表
CREATE TABLE IF NOT EXISTS issues (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '问题ID',
    issue_code VARCHAR(50) NOT NULL UNIQUE COMMENT '问题编号',
    task_id BIGINT UNSIGNED NOT NULL COMMENT '关联任务ID',
    record_id BIGINT UNSIGNED COMMENT '关联巡检记录ID',
    item_id BIGINT UNSIGNED COMMENT '关联检查项ID',
    store_id BIGINT UNSIGNED NOT NULL COMMENT '门店ID',
    title VARCHAR(200) NOT NULL COMMENT '问题标题',
    description TEXT COMMENT '问题描述',
    issue_level VARCHAR(20) DEFAULT 'normal' COMMENT '问题等级：minor-轻微 normal-一般 major-严重 critical-致命',
    issue_type VARCHAR(50) COMMENT '问题类型：display-陈列 hygiene-卫生 price-价签 other-其他',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态：pending-待派单 assigned-已派单 rectifying-整改中 rechecking-复查中 resolved-已解决 closed-已关闭',
    discoverer_id BIGINT UNSIGNED NOT NULL COMMENT '发现人ID',
    discover_time DATETIME NOT NULL COMMENT '发现时间',
    assignee_id BIGINT UNSIGNED COMMENT '整改负责人ID',
    deadline DATE COMMENT '整改截止日期',
    actual_resolve_time DATETIME COMMENT '实际解决时间',
    is_rectified TINYINT DEFAULT 0 COMMENT '是否已整改：1-是 0-否',
    rectification_count INT DEFAULT 0 COMMENT '整改次数',
    offline_id VARCHAR(64) COMMENT '离线ID',
    sync_status TINYINT DEFAULT 1 COMMENT '同步状态：1-已同步 0-待同步',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_issue_code (issue_code),
    INDEX idx_task_id (task_id),
    INDEX idx_store_id (store_id),
    INDEX idx_status (status),
    INDEX idx_issue_level (issue_level),
    INDEX idx_deadline (deadline),
    FOREIGN KEY (task_id) REFERENCES inspection_tasks(id),
    FOREIGN KEY (store_id) REFERENCES stores(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='问题表';

-- 9. 整改表（整改闭环）
CREATE TABLE IF NOT EXISTS rectifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '整改ID',
    issue_id BIGINT UNSIGNED NOT NULL COMMENT '问题ID',
    rectification_no VARCHAR(50) NOT NULL UNIQUE COMMENT '整改单号',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态：pending-待整改 submitted-已提交待复查 passed-复查通过 rejected-复查不通过',
    description TEXT COMMENT '整改说明',
    rectifier_id BIGINT UNSIGNED NOT NULL COMMENT '整改人ID',
    submit_time DATETIME COMMENT '提交整改时间',
    rechecker_id BIGINT UNSIGNED COMMENT '复查人ID',
    recheck_time DATETIME COMMENT '复查时间',
    recheck_result TEXT COMMENT '复查结果',
    recheck_longitude DECIMAL(10, 7) COMMENT '复查经度',
    recheck_latitude DECIMAL(10, 7) COMMENT '复查纬度',
    deadline DATE COMMENT '整改截止日期',
    is_overdue TINYINT DEFAULT 0 COMMENT '是否逾期：1-是 0-否',
    offline_id VARCHAR(64) COMMENT '离线ID',
    sync_status TINYINT DEFAULT 1 COMMENT '同步状态：1-已同步 0-待同步',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_issue_id (issue_id),
    INDEX idx_rectification_no (rectification_no),
    INDEX idx_status (status),
    INDEX idx_rectifier_id (rectifier_id),
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='整改表';

-- 10. 整改状态流转日志（状态机历史）
CREATE TABLE IF NOT EXISTS rectification_status_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    rectification_id BIGINT UNSIGNED NOT NULL COMMENT '整改ID',
    issue_id BIGINT UNSIGNED NOT NULL COMMENT '问题ID',
    from_status VARCHAR(20) COMMENT '原状态',
    to_status VARCHAR(20) NOT NULL COMMENT '目标状态',
    operator_id BIGINT UNSIGNED NOT NULL COMMENT '操作人ID',
    operate_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    remark TEXT COMMENT '操作备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_rectification_id (rectification_id),
    INDEX idx_issue_id (issue_id),
    INDEX idx_operate_time (operate_time),
    FOREIGN KEY (rectification_id) REFERENCES rectifications(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='整改状态流转日志';

-- 11. 门店得分表（聚合用于排行）
CREATE TABLE IF NOT EXISTS store_scores (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '得分ID',
    store_id BIGINT UNSIGNED NOT NULL COMMENT '门店ID',
    period_type VARCHAR(20) NOT NULL DEFAULT 'month' COMMENT '周期类型：day-日 week-周 month-月 quarter-季 year-年',
    period_value VARCHAR(20) NOT NULL COMMENT '周期值：如2024-01, 2024-W01',
    task_count INT DEFAULT 0 COMMENT '巡检任务数',
    completed_count INT DEFAULT 0 COMMENT '完成任务数',
    total_score DECIMAL(10, 2) DEFAULT 0 COMMENT '总分',
    avg_score DECIMAL(5, 2) DEFAULT 0 COMMENT '平均分',
    pass_rate DECIMAL(5, 2) DEFAULT 0 COMMENT '合格率%',
    issue_count INT DEFAULT 0 COMMENT '问题数',
    rectified_count INT DEFAULT 0 COMMENT '已整改问题数',
    rectification_rate DECIMAL(5, 2) DEFAULT 0 COMMENT '整改完成率%',
    rank INT COMMENT '排名',
    last_rank INT COMMENT '上期排名',
    rank_change INT COMMENT '排名变化',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_store_period (store_id, period_type, period_value),
    INDEX idx_store_id (store_id),
    INDEX idx_period (period_type, period_value),
    INDEX idx_rank (period_type, period_value, rank),
    FOREIGN KEY (store_id) REFERENCES stores(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='门店得分表';

-- 12. 巡店报告表
CREATE TABLE IF NOT EXISTS inspection_reports (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '报告ID',
    report_code VARCHAR(50) NOT NULL UNIQUE COMMENT '报告编号',
    report_type VARCHAR(20) NOT NULL COMMENT '报告类型：task-任务报告 store-门店报告 summary-汇总报告',
    report_name VARCHAR(200) NOT NULL COMMENT '报告名称',
    task_id BIGINT UNSIGNED COMMENT '关联任务ID',
    store_id BIGINT UNSIGNED COMMENT '关联门店ID',
    period_type VARCHAR(20) COMMENT '统计周期',
    period_value VARCHAR(20) COMMENT '周期值',
    content JSON COMMENT '报告内容（JSON格式）',
    summary TEXT COMMENT '报告摘要',
    total_score INT COMMENT '总分',
    avg_score DECIMAL(5, 2) COMMENT '平均分',
    pass_rate DECIMAL(5, 2) COMMENT '合格率',
    issue_count INT COMMENT '问题总数',
    rectified_count INT COMMENT '已整改数',
    creator_id BIGINT UNSIGNED NOT NULL COMMENT '创建人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_report_code (report_code),
    INDEX idx_report_type (report_type),
    INDEX idx_task_id (task_id),
    INDEX idx_store_id (store_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='巡店报告表';

-- 13. 离线同步表
CREATE TABLE IF NOT EXISTS offline_sync_records (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '同步ID',
    sync_batch_no VARCHAR(64) NOT NULL COMMENT '同步批次号',
    device_uuid VARCHAR(100) NOT NULL COMMENT '设备UUID',
    user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    data_type VARCHAR(50) NOT NULL COMMENT '数据类型：record-记录 photo-照片 issue-问题 rectification-整改',
    data_count INT DEFAULT 0 COMMENT '数据条数',
    sync_status VARCHAR(20) DEFAULT 'pending' COMMENT '同步状态：pending-待处理 processing-处理中 success-成功 failed-失败',
    sync_time DATETIME COMMENT '同步时间',
    error_msg TEXT COMMENT '错误信息',
    data_json LONGTEXT COMMENT '同步数据JSON',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_sync_batch_no (sync_batch_no),
    INDEX idx_device_uuid (device_uuid),
    INDEX idx_sync_status (sync_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='离线同步表';

-- ==================== 初始化数据 ====================

-- 插入默认用户（密码：123456，使用bcrypt加密）
INSERT INTO users (username, password, real_name, phone, role, department, status) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '系统管理员', '13800138000', 'admin', '运营部', 1),
('inspector01', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '张三', '13800138001', 'inspector', '巡店一部', 1),
('inspector02', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '李四', '13800138002', 'inspector', '巡店一部', 1),
('manager01', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '王店长', '13800138003', 'manager', '华东区', 1);

-- 插入测试门店
INSERT INTO stores (store_code, store_name, address, province, city, district, longitude, latitude, manager_name, manager_phone, area, status) VALUES
('SH001', '上海南京路店', '上海市黄浦区南京路100号', '上海市', '上海市', '黄浦区', 121.4737, 31.2304, '王店长', '13800138003', '华东区', 1),
('SH002', '上海徐家汇店', '上海市徐汇区徐家汇路200号', '上海市', '上海市', '徐汇区', 121.4365, 31.1887, '李店长', '13800138004', '华东区', 1),
('BJ001', '北京王府井店', '北京市东城区王府井大街300号', '北京市', '北京市', '东城区', 116.4103, 39.9165, '赵店长', '13800138005', '华北区', 1),
('BJ002', '北京朝阳大悦城店', '北京市朝阳区朝阳北路400号', '北京市', '北京市', '朝阳区', 116.5109, 39.9339, '刘店长', '13800138006', '华北区', 1),
('GZ001', '广州天河城店', '广东省广州市天河区天河路500号', '广东省', '广州市', '天河区', 113.3249, 23.1392, '陈店长', '13800138007', '华南区', 1),
('SZ001', '深圳万象城店', '广东省深圳市罗湖区宝安南路600号', '广东省', '深圳市', '罗湖区', 114.1095, 22.5429, '林店长', '13800138008', '华南区', 1);

-- 插入检查表模板
INSERT INTO checklist_templates (template_name, template_type, description, total_score, pass_score, version, status, creator_id) VALUES
('日常陈列检查表', 'display', '用于日常巡店的陈列规范检查，包括商品陈列、堆头、端架等', 100, 60, '1.0', 1, 1),
('卫生安全检查表', 'hygiene', '用于检查门店卫生状况，包括食品卫生、环境清洁等', 100, 70, '1.0', 1, 1),
('价签规范检查表', 'price', '用于检查商品价签规范，包括价签完整、价格正确等', 100, 60, '1.0', 1, 1),
('综合巡检表', 'other', '综合检查模板，包含陈列、卫生、价签等多维度检查', 100, 60, '1.0', 1, 1);

-- 插入检查项 - 日常陈列检查表
INSERT INTO checklist_items (template_id, item_code, item_name, item_description, category, score, sort_order, is_required, need_photo, scoring_criteria) VALUES
(1, 'DISP001', '商品陈列整齐', '检查商品是否陈列整齐，无歪斜、倒塌现象', '基础陈列', 10, 1, 1, 1, '完全整齐10分，轻微不整齐5-8分，严重不整齐0分'),
(1, 'DISP002', '商品丰满度', '检查货架商品是否丰满，无大面积空缺', '基础陈列', 10, 2, 1, 1, '丰满10分，轻微空缺5-8分，大面积空缺0分'),
(1, 'DISP003', '商品正面朝外', '检查商品是否正面朝外，标签面向顾客', '基础陈列', 10, 3, 1, 0, '全部正确10分，80%以上7-9分，80%以下0-6分'),
(1, 'DISP004', '堆头陈列规范', '检查堆头商品陈列是否整齐、有气势', '特殊陈列', 15, 4, 1, 1, '规范15分，较规范10-14分，不规范0-9分'),
(1, 'DISP005', '端架陈列规范', '检查端架商品陈列是否规范', '特殊陈列', 15, 5, 1, 1, '规范15分，较规范10-14分，不规范0-9分'),
(1, 'DISP006', 'POP海报规范', '检查POP海报是否张贴规范、无过期', '营销物料', 10, 6, 0, 0, '规范10分，1处不规范5-8分，多处0-4分'),
(1, 'DISP007', '通道畅通', '检查通道是否畅通，无杂物堆积', '环境', 10, 7, 1, 0, '畅通10分，轻微堵塞5-8分，严重堵塞0分'),
(1, 'DISP008', '灯光照明', '检查灯光照明是否正常，无损坏', '环境', 10, 8, 0, 0, '全部正常10分，1处损坏5-8分，多处0-4分'),
(1, 'DISP009', '促销标识清晰', '检查促销标识是否清晰准确', '营销物料', 10, 9, 0, 0, '清晰准确10分，1处错误5-8分，多处0-4分');

-- 插入检查项 - 卫生安全检查表
INSERT INTO checklist_items (template_id, item_code, item_name, item_description, category, score, sort_order, is_required, need_photo, scoring_criteria) VALUES
(2, 'HYG001', '地面清洁', '检查地面是否清洁，无污渍、杂物', '公共区域', 10, 1, 1, 1, '清洁10分，轻微污渍5-8分，严重污渍0分'),
(2, 'HYG002', '货架清洁', '检查货架是否清洁，无灰尘、污渍', '公共区域', 10, 2, 1, 1, '清洁10分，轻微灰尘5-8分，严重0分'),
(2, 'HYG003', '食品卫生', '检查食品是否在保质期内，包装完好', '食品安全', 20, 3, 1, 1, '全部合格20分，1项不合格10-15分，多项0-9分'),
(2, 'HYG004', '冷藏设备温度', '检查冷藏/冷冻设备温度是否正常', '设备设施', 15, 4, 1, 0, '正常15分，偏差1-2度8-12分，偏差2度以上0分'),
(2, 'HYG005', '从业人员健康证', '检查从业人员健康证是否有效', '人员管理', 15, 5, 1, 0, '全部有效15分，1人过期8-12分，多人0分'),
(2, 'HYG006', '卫生间清洁', '检查卫生间是否清洁、无异味', '公共区域', 10, 6, 1, 1, '清洁10分，轻微异味5-8分，严重0分'),
(2, 'HYG007', '垃圾桶管理', '检查垃圾桶是否及时清理、加盖', '公共区域', 10, 7, 1, 0, '规范10分，轻微不规范5-8分，严重0分'),
(2, 'HYG008', '消毒记录', '检查消毒记录是否完整', '文档管理', 10, 8, 0, 0, '完整10分，部分缺失5-8分，无记录0分');

-- 插入检查项 - 价签规范检查表
INSERT INTO checklist_items (template_id, item_code, item_name, item_description, category, score, sort_order, is_required, need_photo, scoring_criteria) VALUES
(3, 'PRICE001', '价签完整', '检查所有商品是否有价签', '价签管理', 20, 1, 1, 1, '全部有20分，缺失率5%以内12-18分，5%以上0-11分'),
(3, 'PRICE002', '价签对应', '检查价签与商品是否一一对应', '价签管理', 20, 2, 1, 1, '全部对应20分，1处错误10-15分，多处0-9分'),
(3, 'PRICE003', '价格准确', '检查价签价格与系统是否一致', '价格管理', 20, 3, 1, 0, '全部准确20分，1处错误10-15分，多处0-9分'),
(3, 'PRICE004', '价签清晰', '检查价签是否清晰、无破损', '价签管理', 15, 4, 1, 0, '清晰15分，轻微模糊8-12分，严重0分'),
(3, 'PRICE005', '促销价签规范', '检查促销价签是否规范，有原价和现价', '促销管理', 15, 5, 0, 0, '规范15分，轻微不规范8-12分，严重0分'),
(3, 'PRICE006', '价签位置正确', '检查价签位置是否正确，便于查看', '价签管理', 10, 6, 0, 0, '正确10分，部分错位5-8分，严重错位0分');

-- 插入测试巡店任务
INSERT INTO inspection_tasks (task_code, task_name, task_type, template_id, store_id, inspector_id, plan_date, status, priority, creator_id) VALUES
('TASK202401001', '上海南京路店日常巡检', 'routine', 1, 1, 2, '2024-01-15', 'pending', 2, 1),
('TASK202401002', '上海徐家汇店日常巡检', 'routine', 1, 2, 2, '2024-01-16', 'pending', 2, 1),
('TASK202401003', '北京王府井店卫生专项检查', 'special', 2, 3, 3, '2024-01-15', 'in_progress', 1, 1),
('TASK202401004', '北京朝阳大悦城店价签检查', 'audit', 3, 4, 3, '2024-01-17', 'pending', 3, 1),
('TASK202401005', '广州天河城店综合巡检', 'routine', 4, 5, 2, '2024-01-18', 'completed', 2, 1),
('TASK202401006', '深圳万象城店陈列检查', 'audit', 1, 6, 2, '2024-01-10', 'completed', 2, 1);

-- 插入测试巡检记录（已完成任务）
INSERT INTO inspection_records (task_id, item_id, score, is_pass, check_result, inspector_id, check_time, longitude, latitude, location_address, has_photo, sync_status) VALUES
(5, 1, 9, 1, '商品陈列基本整齐，有少量商品歪斜', 2, '2024-01-18 10:30:00', 113.3249, 23.1392, '广东省广州市天河区天河路500号', 1, 1),
(5, 2, 10, 1, '商品丰满，无空缺', 2, '2024-01-18 10:32:00', 113.3249, 23.1392, '广东省广州市天河区天河路500号', 1, 1),
(5, 3, 8, 1, '大部分商品正面朝外，有少量未规范', 2, '2024-01-18 10:35:00', 113.3249, 23.1392, '广东省广州市天河区天河路500号', 0, 1),
(5, 4, 12, 1, '堆头陈列较规范', 2, '2024-01-18 10:40:00', 113.3249, 23.1392, '广东省广州市天河区天河路500号', 1, 1),
(5, 5, 14, 1, '端架陈列规范', 2, '2024-01-18 10:45:00', 113.3249, 23.1392, '广东省广州市天河区天河路500号', 1, 1),
(6, 1, 10, 1, '商品陈列整齐', 2, '2024-01-10 09:30:00', 114.1095, 22.5429, '广东省深圳市罗湖区宝安南路600号', 1, 1),
(6, 2, 10, 1, '商品丰满', 2, '2024-01-10 09:35:00', 114.1095, 22.5429, '广东省深圳市罗湖区宝安南路600号', 1, 1),
(6, 4, 15, 1, '堆头陈列非常规范', 2, '2024-01-10 09:40:00', 114.1095, 22.5429, '广东省深圳市罗湖区宝安南路600号', 1, 1);

-- 更新已完成任务的得分
UPDATE inspection_tasks SET actual_score = 85, is_pass = 1, start_time = '2024-01-18 10:00:00', end_time = '2024-01-18 11:30:00' WHERE id = 5;
UPDATE inspection_tasks SET actual_score = 92, is_pass = 1, start_time = '2024-01-10 09:00:00', end_time = '2024-01-10 10:30:00' WHERE id = 6;
UPDATE inspection_tasks SET start_time = '2024-01-15 09:00:00' WHERE id = 3;

-- 插入测试问题
INSERT INTO issues (issue_code, task_id, record_id, item_id, store_id, title, description, issue_level, issue_type, status, discoverer_id, discover_time, assignee_id, deadline) VALUES
('ISS202401001', 5, 1, 1, 5, '饮料区商品陈列不整齐', '饮料区有部分商品歪斜，需要整理', 'minor', 'display', 'assigned', 2, '2024-01-18 10:30:00', 4, '2024-01-20'),
('ISS202401002', 5, 3, 3, 5, '零食区商品未正面朝外', '零食区约10%商品未正面朝外', 'normal', 'display', 'pending', 2, '2024-01-18 10:35:00', NULL, NULL),
('ISS202401003', 3, NULL, NULL, 3, '入口处地面有污渍', '门店入口处有明显污渍，需要立即清理', 'normal', 'hygiene', 'rectifying', 3, '2024-01-15 09:30:00', 4, '2024-01-16'),
('ISS202401004', 3, NULL, NULL, 3, '冷藏柜温度偏高', '冷藏柜显示温度为8度，超出标准范围', 'major', 'hygiene', 'assigned', 3, '2024-01-15 09:45:00', 4, '2024-01-16');

-- 插入测试整改单
INSERT INTO rectifications (issue_id, rectification_no, status, description, rectifier_id, deadline) VALUES
(1, 'RECT202401001', 'pending', '正在安排人员整理饮料区陈列', 4, '2024-01-20'),
(3, 'RECT202401002', 'submitted', '已清理入口处污渍，请复查', 4, '2024-01-16'),
(4, 'RECT202401003', 'pending', '正在联系维修人员检修冷藏柜', 4, '2024-01-16');

-- 插入整改状态流转日志
INSERT INTO rectification_status_logs (rectification_id, issue_id, from_status, to_status, operator_id, remark) VALUES
(1, 1, NULL, 'pending', 1, '创建整改单'),
(2, 3, NULL, 'pending', 1, '创建整改单'),
(2, 3, 'pending', 'submitted', 4, '提交整改，申请复查'),
(3, 4, NULL, 'pending', 1, '创建整改单');

-- 插入门店月度得分数据
INSERT INTO store_scores (store_id, period_type, period_value, task_count, completed_count, total_score, avg_score, pass_rate, issue_count, rectified_count, rectification_rate, `rank`, last_rank) VALUES
(1, 'month', '2024-01', 1, 0, 0, 0, 0, 0, 0, 0, 5, 3),
(2, 'month', '2024-01', 1, 0, 0, 0, 0, 0, 0, 0, 6, 4),
(3, 'month', '2024-01', 1, 0, 0, 0, 0, 2, 0, 0, 4, 5),
(4, 'month', '2024-01', 1, 0, 0, 0, 0, 0, 0, 0, 3, 6),
(5, 'month', '2024-01', 1, 1, 85, 85.00, 100.00, 2, 0, 0.00, 2, 2),
(6, 'month', '2024-01', 1, 1, 92, 92.00, 100.00, 0, 0, 0, 1, 1);
