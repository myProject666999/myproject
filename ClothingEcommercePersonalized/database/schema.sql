SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP DATABASE IF EXISTS clothing_ecommerce;
CREATE DATABASE clothing_ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE clothing_ecommerce;

-- 用户表
CREATE TABLE user (
  id BIGINT NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nickname VARCHAR(50),
  avatar VARCHAR(255),
  gender TINYINT DEFAULT 0,
  phone VARCHAR(20),
  email VARCHAR(100),
  status TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 分类表
CREATE TABLE category (
  id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  parent_id BIGINT DEFAULT 0,
  level TINYINT DEFAULT 1,
  icon VARCHAR(255),
  sort INT DEFAULT 0,
  status TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 标签表
CREATE TABLE tag (
  id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  type VARCHAR(20) DEFAULT 'style',
  sort INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 商品表
CREATE TABLE product (
  id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  subtitle VARCHAR(500),
  category_id BIGINT NOT NULL,
  brand VARCHAR(100),
  main_image VARCHAR(255),
  images TEXT,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  sales_count INT DEFAULT 0,
  review_count INT DEFAULT 0,
  rating_avg DECIMAL(3,2) DEFAULT 5.00,
  status TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 商品标签关联
CREATE TABLE product_tag (
  id BIGINT NOT NULL AUTO_INCREMENT,
  product_id BIGINT NOT NULL,
  tag_id BIGINT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_product_tag (product_id, tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- SKU规格表
CREATE TABLE sku_spec (
  id BIGINT NOT NULL AUTO_INCREMENT,
  product_id BIGINT NOT NULL,
  spec_name VARCHAR(50) NOT NULL,
  spec_value VARCHAR(100) NOT NULL,
  spec_image VARCHAR(255),
  sort INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- SKU库存表
CREATE TABLE sku (
  id BIGINT NOT NULL AUTO_INCREMENT,
  product_id BIGINT NOT NULL,
  sku_code VARCHAR(100) UNIQUE,
  specs VARCHAR(500) NOT NULL,
  spec_ids VARCHAR(200),
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  stock INT DEFAULT 0,
  image VARCHAR(255),
  status TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 购物车
CREATE TABLE cart (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  sku_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INT DEFAULT 1,
  selected TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_sku (user_id, sku_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 用户地址
CREATE TABLE user_address (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  receiver VARCHAR(50) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  province VARCHAR(50) NOT NULL,
  city VARCHAR(50) NOT NULL,
  district VARCHAR(50) NOT NULL,
  detail VARCHAR(500) NOT NULL,
  is_default TINYINT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 订单表
CREATE TABLE orders (
  id BIGINT NOT NULL AUTO_INCREMENT,
  order_no VARCHAR(64) NOT NULL UNIQUE,
  user_id BIGINT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  pay_amount DECIMAL(10,2) NOT NULL,
  freight_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  status TINYINT DEFAULT 0,
  pay_type TINYINT,
  pay_time DATETIME,
  ship_time DATETIME,
  finish_time DATETIME,
  cancel_time DATETIME,
  receiver_name VARCHAR(50),
  receiver_phone VARCHAR(20),
  receiver_address VARCHAR(500),
  remark VARCHAR(500),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 订单明细
CREATE TABLE order_item (
  id BIGINT NOT NULL AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  order_no VARCHAR(64) NOT NULL,
  product_id BIGINT NOT NULL,
  sku_id BIGINT NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  sku_specs VARCHAR(500),
  product_image VARCHAR(255),
  price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  review_status TINYINT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 用户行为日志
CREATE TABLE user_behavior (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  device_id VARCHAR(100),
  behavior_type TINYINT NOT NULL,
  product_id BIGINT NOT NULL,
  sku_id BIGINT,
  duration INT,
  extra_data TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  date DATE,
  PRIMARY KEY (id),
  KEY idx_user_behavior (user_id, behavior_type, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 用户收藏
CREATE TABLE favorite (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_product (user_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 商品评价
CREATE TABLE review (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  order_item_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  sku_id BIGINT,
  rating TINYINT NOT NULL,
  content TEXT,
  images TEXT,
  likes INT DEFAULT 0,
  status TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 推荐结果缓存
CREATE TABLE recommendation (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  rec_type VARCHAR(50) NOT NULL,
  product_ids TEXT NOT NULL,
  expire_time DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_type (user_id, rec_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 商品相似度表
CREATE TABLE product_similarity (
  id BIGINT NOT NULL AUTO_INCREMENT,
  product_id BIGINT NOT NULL,
  similar_product_id BIGINT NOT NULL,
  similarity DECIMAL(6,5) NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_product_similar (product_id, similar_product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 初始数据
INSERT INTO user (username, password, nickname, gender, phone) VALUES
('user1', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '小明', 1, '13800138001'),
('user2', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '小红', 2, '13800138002');

INSERT INTO category (name, parent_id, level, sort) VALUES
('女装', 0, 1, 1), ('男装', 0, 1, 2), ('童装', 0, 1, 3), ('鞋靴', 0, 1, 4),
('T恤', 1, 2, 1), ('衬衫', 1, 2, 2), ('连衣裙', 1, 2, 3), ('外套', 1, 2, 4),
('T恤', 2, 2, 1), ('衬衫', 2, 2, 2), ('夹克', 2, 2, 3), ('西裤', 2, 2, 4);

INSERT INTO tag (name, type, sort) VALUES
('韩版', 'style', 1), ('日系', 'style', 2), ('简约', 'style', 3), ('复古', 'style', 4),
('运动', 'style', 5), ('休闲', 'style', 6), ('商务', 'style', 7),
('纯棉', 'material', 1), ('涤纶', 'material', 2), ('羊毛', 'material', 3),
('日常', 'scene', 1), ('约会', 'scene', 2), ('职场', 'scene', 3), ('运动', 'scene', 4);

INSERT INTO product (name, subtitle, category_id, brand, main_image, price, original_price, sales_count, description) VALUES
('纯棉简约圆领T恤', '舒适纯棉 百搭基础款', 5, '优衣库', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 99.00, 129.00, 1586, '采用100%精梳棉，柔软透气，经典圆领设计'),
('韩版宽松衬衫女', '气质通勤 百搭显瘦', 6, '韩都衣舍', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400', 159.00, 199.00, 2341, '韩版设计风格，宽松版型，穿着舒适'),
('碎花连衣裙夏装新款', '浪漫碎花 甜美减龄', 7, 'ZARA', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400', 299.00, 399.00, 892, '浪漫碎花图案，收腰设计，展现优雅气质'),
('休闲牛仔外套女', '经典牛仔 百搭时尚', 8, 'Levis', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400', 399.00, 499.00, 567, '经典牛仔面料，修身版型，百搭款式'),
('运动速干T恤男', '透气速干 运动必备', 9, 'Nike', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400', 199.00, 249.00, 2156, '采用速干面料，透气排汗，运动休闲两相宜'),
('商务休闲衬衫男', '免烫抗皱 商务必备', 10, '雅戈尔', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400', 259.00, 329.00, 1823, '免烫面料，精致做工，职场精英必备'),
('工装夹克男潮牌', '街头潮流 工装风格', 11, 'Supreme', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400', 599.00, 799.00, 456, '工装设计风格，多口袋实用，街头潮流必备'),
('修身西裤男', '修身版型 商务正装', 12, 'G2000', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400', 359.00, 459.00, 789, '修身版型，垂感好，适合商务场合穿着');

INSERT INTO product_tag (product_id, tag_id) VALUES
(1, 3), (1, 8), (1, 11),
(2, 1), (2, 6), (2, 13),
(3, 1), (3, 12),
(4, 6), (4, 11),
(5, 5), (5, 9), (5, 14),
(6, 7), (6, 13),
(7, 4), (7, 6), (7, 11),
(8, 7), (8, 13);

INSERT INTO sku_spec (product_id, spec_name, spec_value, sort) VALUES
(1, '颜色', '白色', 1), (1, '颜色', '黑色', 2), (1, '颜色', '灰色', 3),
(1, '尺码', 'S', 1), (1, '尺码', 'M', 2), (1, '尺码', 'L', 3),
(2, '颜色', '白色', 1), (2, '颜色', '蓝色', 2), (2, '颜色', '粉色', 3),
(2, '尺码', 'S', 1), (2, '尺码', 'M', 2), (2, '尺码', 'L', 3),
(3, '颜色', '粉色', 1), (3, '颜色', '蓝色', 2),
(3, '尺码', 'S', 1), (3, '尺码', 'M', 2), (3, '尺码', 'L', 3),
(4, '颜色', '浅蓝色', 1), (4, '颜色', '深蓝色', 2),
(4, '尺码', 'S', 1), (4, '尺码', 'M', 2), (4, '尺码', 'L', 3),
(5, '颜色', '白色', 1), (5, '颜色', '黑色', 2), (5, '颜色', '红色', 3),
(5, '尺码', 'M', 1), (5, '尺码', 'L', 2), (5, '尺码', 'XL', 3),
(6, '颜色', '白色', 1), (6, '颜色', '蓝色', 2), (6, '颜色', '灰色', 3),
(6, '尺码', 'M', 1), (6, '尺码', 'L', 2), (6, '尺码', 'XL', 3),
(7, '颜色', '卡其色', 1), (7, '颜色', '黑色', 2),
(7, '尺码', 'M', 1), (7, '尺码', 'L', 2), (7, '尺码', 'XL', 3),
(8, '颜色', '黑色', 1), (8, '颜色', '藏青色', 2),
(8, '尺码', 'M', 1), (8, '尺码', 'L', 2), (8, '尺码', 'XL', 3);

INSERT INTO sku (product_id, sku_code, specs, price, stock) VALUES
(1, 'SKU001001', '{"颜色":"白色","尺码":"S"}', 99.00, 100),
(1, 'SKU001002', '{"颜色":"白色","尺码":"M"}', 99.00, 150),
(1, 'SKU001003', '{"颜色":"白色","尺码":"L"}', 99.00, 120),
(1, 'SKU001004', '{"颜色":"黑色","尺码":"M"}', 99.00, 80),
(2, 'SKU002001', '{"颜色":"白色","尺码":"S"}', 159.00, 60),
(2, 'SKU002002', '{"颜色":"白色","尺码":"M"}', 159.00, 90),
(2, 'SKU002003', '{"颜色":"蓝色","尺码":"M"}', 159.00, 70),
(3, 'SKU003001', '{"颜色":"粉色","尺码":"S"}', 299.00, 40),
(3, 'SKU003002', '{"颜色":"粉色","尺码":"M"}', 299.00, 50),
(3, 'SKU003003', '{"颜色":"蓝色","尺码":"M"}', 299.00, 35),
(4, 'SKU004001', '{"颜色":"浅蓝色","尺码":"M"}', 399.00, 30),
(4, 'SKU004002', '{"颜色":"浅蓝色","尺码":"L"}', 399.00, 25),
(5, 'SKU005001', '{"颜色":"白色","尺码":"L"}', 199.00, 80),
(5, 'SKU005002', '{"颜色":"黑色","尺码":"XL"}', 199.00, 60),
(6, 'SKU006001', '{"颜色":"白色","尺码":"L"}', 259.00, 50),
(6, 'SKU006002', '{"颜色":"蓝色","尺码":"XL"}', 259.00, 45),
(7, 'SKU007001', '{"颜色":"卡其色","尺码":"L"}', 599.00, 20),
(8, 'SKU008001', '{"颜色":"黑色","尺码":"L"}', 359.00, 40),
(8, 'SKU008002', '{"颜色":"藏青色","尺码":"XL"}', 359.00, 35);

INSERT INTO user_behavior (user_id, behavior_type, product_id, sku_id, date) VALUES
(1, 1, 1, 2, '2026-05-20'), (1, 1, 2, 6, '2026-05-20'),
(1, 2, 1, NULL, '2026-05-20'), (1, 3, 1, 2, '2026-05-21'),
(1, 4, 1, 2, '2026-05-22'), (1, 1, 3, 8, '2026-05-25'),
(2, 1, 5, 13, '2026-05-21'), (2, 1, 6, 16, '2026-05-21'),
(2, 3, 5, 13, '2026-05-22'), (2, 4, 5, 13, '2026-05-23'),
(2, 2, 6, NULL, '2026-05-24');

INSERT INTO favorite (user_id, product_id) VALUES (1, 1), (1, 3), (2, 5), (2, 6);

SET FOREIGN_KEY_CHECKS = 1;
