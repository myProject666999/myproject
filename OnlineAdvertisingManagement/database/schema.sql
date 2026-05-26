CREATE DATABASE IF NOT EXISTS ad_management DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ad_management;

CREATE TABLE IF NOT EXISTS ad_spaces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '广告位名称',
    code VARCHAR(50) UNIQUE NOT NULL COMMENT '广告位代码',
    width INT NOT NULL COMMENT '宽度(px)',
    height INT NOT NULL COMMENT '高度(px)',
    position VARCHAR(50) NOT NULL COMMENT '位置描述',
    status TINYINT DEFAULT 1 COMMENT '1-启用 0-禁用',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='广告位表';

CREATE TABLE IF NOT EXISTS ad_materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '素材名称',
    type VARCHAR(20) NOT NULL COMMENT '类型: image, video, text',
    file_url VARCHAR(255) NOT NULL COMMENT '文件地址',
    link_url VARCHAR(255) COMMENT '跳转链接',
    width INT COMMENT '素材宽度',
    height INT COMMENT '素材高度',
    status TINYINT DEFAULT 1 COMMENT '1-启用 0-禁用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='广告素材表';

CREATE TABLE IF NOT EXISTS ad_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '排期名称',
    ad_space_id INT NOT NULL COMMENT '广告位ID',
    material_id INT NOT NULL COMMENT '素材ID',
    start_time DATETIME NOT NULL COMMENT '开始时间',
    end_time DATETIME NOT NULL COMMENT '结束时间',
    priority INT DEFAULT 0 COMMENT '优先级，数字越大优先级越高',
    status TINYINT DEFAULT 1 COMMENT '1-启用 0-禁用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ad_space_id) REFERENCES ad_spaces(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES ad_materials(id) ON DELETE CASCADE,
    INDEX idx_ad_space (ad_space_id),
    INDEX idx_material (material_id),
    INDEX idx_time_range (start_time, end_time),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='广告排期表';

CREATE TABLE IF NOT EXISTS ad_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    schedule_id INT NOT NULL COMMENT '排期ID',
    ad_space_id INT NOT NULL COMMENT '广告位ID',
    material_id INT NOT NULL COMMENT '素材ID',
    stat_date DATE NOT NULL COMMENT '统计日期',
    impressions INT DEFAULT 0 COMMENT '曝光量',
    clicks INT DEFAULT 0 COMMENT '点击量',
    ctr DECIMAL(10, 4) DEFAULT 0 COMMENT '点击率(CTR)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES ad_schedules(id) ON DELETE CASCADE,
    FOREIGN KEY (ad_space_id) REFERENCES ad_spaces(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES ad_materials(id) ON DELETE CASCADE,
    UNIQUE KEY uk_schedule_date (schedule_id, stat_date),
    INDEX idx_stat_date (stat_date),
    INDEX idx_ad_space_date (ad_space_id, stat_date),
    INDEX idx_material_date (material_id, stat_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='广告统计表';

INSERT INTO ad_spaces (name, code, width, height, position, status, description) VALUES
('首页顶部横幅', 'HOME_TOP_BANNER', 1200, 120, '首页顶部', 1, '首页最上方横幅广告位'),
('首页侧边栏', 'HOME_SIDEBAR', 300, 250, '首页右侧侧边栏', 1, '首页右侧侧边栏广告位'),
('文章详情页底部', 'ARTICLE_BOTTOM', 800, 100, '文章详情底部', 1, '文章内容底部广告位'),
('列表页中部', 'LIST_MIDDLE', 728, 90, '列表页中部', 1, '列表内容中间广告位');

INSERT INTO ad_materials (name, type, file_url, link_url, width, height, status) VALUES
('促销活动横幅', 'image', 'https://example.com/banner1.jpg', 'https://example.com/promo1', 1200, 120, 1),
('新品发布广告', 'image', 'https://example.com/banner2.jpg', 'https://example.com/new-product', 1200, 120, 1),
('侧边栏优惠', 'image', 'https://example.com/sidebar1.jpg', 'https://example.com/sale', 300, 250, 1),
('会员招募', 'image', 'https://example.com/banner3.jpg', 'https://example.com/vip', 728, 90, 1);

INSERT INTO ad_schedules (name, ad_space_id, material_id, start_time, end_time, priority, status) VALUES
('618大促首页横幅', 1, 1, '2026-06-01 00:00:00', '2026-06-20 23:59:59', 10, 1),
('新品发布首页横幅', 1, 2, '2026-05-26 00:00:00', '2026-05-31 23:59:59', 5, 1),
('侧边栏优惠活动', 2, 3, '2026-05-26 00:00:00', '2026-06-30 23:59:59', 8, 1),
('会员招募列表页', 4, 4, '2026-05-26 00:00:00', '2026-12-31 23:59:59', 3, 1);

INSERT INTO ad_stats (schedule_id, ad_space_id, material_id, stat_date, impressions, clicks, ctr) VALUES
(1, 1, 1, '2026-05-26', 15200, 456, 0.0300),
(2, 1, 2, '2026-05-26', 8500, 212, 0.0249),
(3, 2, 3, '2026-05-26', 6800, 189, 0.0278),
(4, 4, 4, '2026-05-26', 12000, 312, 0.0260),
(1, 1, 1, '2026-05-25', 14500, 435, 0.0300),
(2, 1, 2, '2026-05-25', 9200, 230, 0.0250),
(3, 2, 3, '2026-05-25', 7100, 195, 0.0275),
(4, 4, 4, '2026-05-25', 11500, 299, 0.0260);
