-- =============================================
-- 餐厅扫码点餐系统数据库脚本
-- =============================================

CREATE DATABASE IF NOT EXISTS restaurant_ordering DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE restaurant_ordering;

-- =============================================
-- 用户表
-- =============================================
DROP TABLE IF EXISTS sys_user;
CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码(加密)',
    nickname VARCHAR(50) COMMENT '昵称',
    role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER' COMMENT '角色: ADMIN-管理员, KITCHEN-后厨, CUSTOMER-顾客',
    phone VARCHAR(20) COMMENT '手机号',
    avatar VARCHAR(255) COMMENT '头像',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- =============================================
-- 桌台表
-- =============================================
DROP TABLE IF EXISTS dining_table;
CREATE TABLE dining_table (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '桌台ID',
    table_no VARCHAR(20) NOT NULL UNIQUE COMMENT '桌台号',
    seats INT NOT NULL DEFAULT 4 COMMENT '座位数',
    status VARCHAR(20) NOT NULL DEFAULT 'IDLE' COMMENT '状态: IDLE-空闲, OCCUPIED-用餐中, CLEANING-打扫中',
    qr_code VARCHAR(255) COMMENT '二维码图片URL',
    remark VARCHAR(255) COMMENT '备注',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='桌台表';

-- =============================================
-- 菜品分类表
-- =============================================
DROP TABLE IF EXISTS category;
CREATE TABLE category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
    name VARCHAR(50) NOT NULL COMMENT '分类名称',
    sort_order INT NOT NULL DEFAULT 0 COMMENT '排序',
    icon VARCHAR(255) COMMENT '图标URL',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜品分类表';

-- =============================================
-- 菜品表
-- =============================================
DROP TABLE IF EXISTS dish;
CREATE TABLE dish (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '菜品ID',
    category_id BIGINT NOT NULL COMMENT '分类ID',
    name VARCHAR(100) NOT NULL COMMENT '菜品名称',
    description TEXT COMMENT '菜品描述',
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '价格',
    image VARCHAR(255) COMMENT '菜品图片URL',
    stock INT NOT NULL DEFAULT 999 COMMENT '库存',
    sales INT NOT NULL DEFAULT 0 COMMENT '销量',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0-下架, 1-在售',
    recommend TINYINT NOT NULL DEFAULT 0 COMMENT '推荐: 0-否, 1-是',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_category_id (category_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜品表';

-- =============================================
-- 订单表
-- =============================================
DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '订单ID',
    order_no VARCHAR(32) NOT NULL UNIQUE COMMENT '订单号',
    table_id BIGINT NOT NULL COMMENT '桌台ID',
    user_id BIGINT COMMENT '用户ID',
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '订单总金额',
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '优惠金额',
    pay_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '实付金额',
    pay_status VARCHAR(20) NOT NULL DEFAULT 'UNPAID' COMMENT '支付状态: UNPAID-未支付, PAID-已支付, REFUNDED-已退款',
    order_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '订单状态: PENDING-待确认, CONFIRMED-已确认, COOKING-制作中, SERVED-已出餐, COMPLETED-已完成, CANCELLED-已取消',
    remark VARCHAR(255) COMMENT '备注',
    pay_time DATETIME COMMENT '支付时间',
    finish_time DATETIME COMMENT '完成时间',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_table_id (table_id),
    INDEX idx_order_status (order_status),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- =============================================
-- 订单明细表
-- =============================================
DROP TABLE IF EXISTS order_item;
CREATE TABLE order_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '明细ID',
    order_id BIGINT NOT NULL COMMENT '订单ID',
    dish_id BIGINT NOT NULL COMMENT '菜品ID',
    dish_name VARCHAR(100) NOT NULL COMMENT '菜品名称(快照)',
    dish_price DECIMAL(10,2) NOT NULL COMMENT '菜品价格(快照)',
    quantity INT NOT NULL DEFAULT 1 COMMENT '数量',
    subtotal DECIMAL(10,2) NOT NULL COMMENT '小计金额',
    dish_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '状态: PENDING-待制作, COOKING-制作中, SERVED-已出餐',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_order_id (order_id),
    INDEX idx_dish_status (dish_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单明细表';

-- =============================================
-- 初始化数据
-- =============================================

-- 初始化用户
INSERT INTO sys_user (username, password, nickname, role, phone) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '系统管理员', 'ADMIN', '13800000001'),
('kitchen01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '后厨小王', 'KITCHEN', '13800000002');

-- 初始化桌台
INSERT INTO dining_table (table_no, seats, status) VALUES
('A01', 2, 'IDLE'), ('A02', 2, 'IDLE'), ('A03', 4, 'IDLE'), ('A04', 4, 'IDLE'),
('B01', 6, 'IDLE'), ('B02', 6, 'IDLE'), ('B03', 8, 'IDLE'),
('C01', 10, 'IDLE'), ('C02', 10, 'IDLE');

-- 初始化菜品分类
INSERT INTO category (name, sort_order, icon) VALUES
('热销推荐', 1, 'hot'),
('招牌凉菜', 2, 'cold'),
('经典热菜', 3, 'hot_dish'),
('汤品', 4, 'soup'),
('主食', 5, 'staple'),
('饮品', 6, 'drink');

-- 初始化菜品
INSERT INTO dish (category_id, name, description, price, stock, recommend) VALUES
(1, '麻辣水煮鱼', '精选新鲜草鱼，麻辣鲜香，回味无穷', 68.00, 50, 1),
(1, '干锅花菜', '新鲜花菜配五花肉，咸香下饭', 38.00, 100, 1),
(1, '宫保鸡丁', '经典川菜，鸡肉鲜嫩，花生酥脆', 42.00, 80, 1),
(2, '口水鸡', '麻辣鲜香，皮爽肉嫩', 45.00, 30, 0),
(2, '凉拌黄瓜', '清爽开胃，解腻必备', 18.00, 100, 0),
(2, '皮蛋豆腐', '经典凉菜，嫩滑爽口', 22.00, 50, 0),
(3, '红烧肉', '肥而不腻，入口即化', 58.00, 40, 1),
(3, '鱼香肉丝', '酸甜适口，经典家常菜', 38.00, 80, 0),
(3, '麻婆豆腐', '麻辣鲜香，豆腐嫩滑', 28.00, 100, 0),
(3, '回锅肉', '肥而不腻，香辣可口', 48.00, 60, 1),
(4, '酸辣汤', '酸爽开胃，暖胃暖心', 18.00, 100, 0),
(4, '紫菜蛋花汤', '清淡鲜美，营养丰富', 15.00, 100, 0),
(5, '米饭', '东北优质大米，粒粒分明', 3.00, 999, 0),
(5, '葱油拌面', '葱香浓郁，简单美味', 15.00, 100, 0),
(5, '炒饭', '配料丰富，色香味俱全', 22.00, 80, 0),
(6, '可乐', '冰镇可乐，畅爽解渴', 8.00, 200, 0),
(6, '鲜榨橙汁', '新鲜橙子现榨，维C满满', 18.00, 50, 0),
(6, '酸梅汤', '酸甜解暑，消食解腻', 12.00, 100, 0);
