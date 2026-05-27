-- 服装电商个性化推荐系统数据库脚本
-- 创建日期: 2026-05-27
-- 数据库: clothing_ecommerce

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 创建数据库
DROP DATABASE IF EXISTS clothing_ecommerce;
CREATE DATABASE clothing_ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE clothing_ecommerce;

-- 1. 用户表
DROP TABLE IF EXISTS user;
CREATE TABLE user (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  password VARCHAR(255) NOT NULL COMMENT '密码(加密)',
  
ickname VARCHAR(50) COMMENT '昵称',
  vatar VARCHAR(255) COMMENT '头像URL',
  gender TINYINT DEFAULT 0 COMMENT '性别:0未知1男2女',
  phone VARCHAR(20) COMMENT '手机号',
  email VARCHAR(100) COMMENT '邮箱',
  status TINYINT DEFAULT 1 COMMENT '状态:0禁用1正常',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  KEY idx_username (username),
  KEY idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 2. 商品分类表
DROP TABLE IF EXISTS category;
CREATE TABLE category (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  
ame VARCHAR(50) NOT NULL COMMENT '分类名称',
  parent_id BIGINT DEFAULT 0 COMMENT '父分类ID',
  level TINYINT DEFAULT 1 COMMENT '分类层级',
  icon VARCHAR(255) COMMENT '分类图标',
  sort INT DEFAULT 0 COMMENT '排序',
  status TINYINT DEFAULT 1 COMMENT '状态:0禁用1启用',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  KEY idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品分类表';

-- 3. 商品标签表
DROP TABLE IF EXISTS 	ag;
CREATE TABLE 	ag (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '标签ID',
  
ame VARCHAR(50) NOT NULL UNIQUE COMMENT '标签名称',
  	ype VARCHAR(20) DEFAULT 'style' COMMENT '标签类型:style风格,material材质,scene场景',
  sort INT DEFAULT 0 COMMENT '排序',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品标签表';

-- 4. 商品表
DROP TABLE IF EXISTS product;
CREATE TABLE product (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '商品ID',
  
ame VARCHAR(200) NOT NULL COMMENT '商品名称',
  subtitle VARCHAR(500) COMMENT '商品副标题',
  category_id BIGINT NOT NULL COMMENT '分类ID',
  rand VARCHAR(100) COMMENT '品牌',
  main_image VARCHAR(255) COMMENT '主图URL',
  images TEXT COMMENT '商品图片列表(JSON数组)',
  description TEXT COMMENT '商品详情描述',
  price DECIMAL(10,2) NOT NULL COMMENT '商品价格(展示价)',
  original_price DECIMAL(10,2) COMMENT '原价',
  sales_count INT DEFAULT 0 COMMENT '销量',
  eview_count INT DEFAULT 0 COMMENT '评价数',
  ating_avg DECIMAL(3,2) DEFAULT 5.00 COMMENT '平均评分',
  status TINYINT DEFAULT 1 COMMENT '状态:0下架1上架',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  KEY idx_category_id (category_id),
  KEY idx_status (status),
  KEY idx_sales_count (sales_count),
  FULLTEXT KEY t_name (
ame)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- 5. 商品标签关联表
DROP TABLE IF EXISTS product_tag;
CREATE TABLE product_tag (
  id BIGINT NOT NULL AUTO_INCREMENT,
  product_id BIGINT NOT NULL COMMENT '商品ID',
  	ag_id BIGINT NOT NULL COMMENT '标签ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_product_tag (product_id, 	ag_id),
  KEY idx_product_id (product_id),
  KEY idx_tag_id (	ag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品标签关联表';

-- 6. SKU规格表
DROP TABLE IF EXISTS sku_spec;
CREATE TABLE sku_spec (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '规格ID',
  product_id BIGINT NOT NULL COMMENT '商品ID',
  spec_name VARCHAR(50) NOT NULL COMMENT '规格名称:颜色,尺码',
  spec_value VARCHAR(100) NOT NULL COMMENT '规格值',
  spec_image VARCHAR(255) COMMENT '规格图片',
  sort INT DEFAULT 0 COMMENT '排序',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='SKU规格表';

-- 7. SKU表
DROP TABLE IF EXISTS sku;
CREATE TABLE sku (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'SKU ID',
  product_id BIGINT NOT NULL COMMENT '商品ID',
  sku_code VARCHAR(100) UNIQUE COMMENT 'SKU编码',
  specs VARCHAR(500) NOT NULL COMMENT '规格组合(JSON)',
  spec_ids VARCHAR(200) COMMENT '规格ID组合',
  price DECIMAL(10,2) NOT NULL COMMENT 'SKU价格',
  original_price DECIMAL(10,2) COMMENT 'SKU原价',
  stock INT DEFAULT 0 COMMENT '库存数量',
  image VARCHAR(255) COMMENT 'SKU图片',
  status TINYINT DEFAULT 1 COMMENT '状态:0禁用1启用',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_product_id (product_id),
  KEY idx_sku_code (sku_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='SKU库存表';

-- 8. 购物车表
DROP TABLE IF EXISTS cart;
CREATE TABLE cart (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '购物车ID',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  sku_id BIGINT NOT NULL COMMENT 'SKU ID',
  product_id BIGINT NOT NULL COMMENT '商品ID',
  quantity INT DEFAULT 1 COMMENT '数量',
  selected TINYINT DEFAULT 1 COMMENT '是否选中',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_sku (user_id, sku_id),
  KEY idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='购物车表';

-- 9. 用户收货地址表
DROP TABLE IF EXISTS user_address;
CREATE TABLE user_address (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '地址ID',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  eceiver VARCHAR(50) NOT NULL COMMENT '收货人',
  phone VARCHAR(20) NOT NULL COMMENT '手机号',
  province VARCHAR(50) NOT NULL COMMENT '省份',
  city VARCHAR(50) NOT NULL COMMENT '城市',
  district VARCHAR(50) NOT NULL COMMENT '区县',
  detail VARCHAR(500) NOT NULL COMMENT '详细地址',
  is_default TINYINT DEFAULT 0 COMMENT '是否默认',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户收货地址表';

-- 10. 订单表
DROP TABLE IF EXISTS order;
CREATE TABLE order (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  order_no VARCHAR(64) NOT NULL UNIQUE COMMENT '订单号',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  	otal_amount DECIMAL(10,2) NOT NULL COMMENT '订单总金额',
  pay_amount DECIMAL(10,2) NOT NULL COMMENT '实付金额',
  reight_amount DECIMAL(10,2) DEFAULT 0 COMMENT '运费',
  discount_amount DECIMAL(10,2) DEFAULT 0 COMMENT '优惠金额',
  status TINYINT DEFAULT 0 COMMENT '订单状态',
  pay_type TINYINT COMMENT '支付方式',
  pay_time DATETIME COMMENT '支付时间',
  ship_time DATETIME COMMENT '发货时间',
  inish_time DATETIME COMMENT '完成时间',
  cancel_time DATETIME COMMENT '取消时间',
  eceiver_name VARCHAR(50) COMMENT '收货人姓名',
  eceiver_phone VARCHAR(20) COMMENT '收货人电话',
  eceiver_address VARCHAR(500) COMMENT '收货地址',
  emark VARCHAR(500) COMMENT '订单备注',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_id (user_id),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 11. 订单明细表
DROP TABLE IF EXISTS order_item;
CREATE TABLE order_item (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '明细ID',
  order_id BIGINT NOT NULL COMMENT '订单ID',
  order_no VARCHAR(64) NOT NULL COMMENT '订单号',
  product_id BIGINT NOT NULL COMMENT '商品ID',
  sku_id BIGINT NOT NULL COMMENT 'SKU ID',
  product_name VARCHAR(200) NOT NULL COMMENT '商品名称',
  sku_specs VARCHAR(500) COMMENT 'SKU规格',
  product_image VARCHAR(255) COMMENT '商品图片',
  price DECIMAL(10,2) NOT NULL COMMENT '单价',
  quantity INT NOT NULL COMMENT '数量',
  	otal_price DECIMAL(10,2) NOT NULL COMMENT '小计金额',
  eview_status TINYINT DEFAULT 0 COMMENT '评价状态',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_order_id (order_id),
  KEY idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单明细表';

-- 12. 用户行为日志表
DROP TABLE IF EXISTS user_behavior;
CREATE TABLE user_behavior (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  device_id VARCHAR(100) COMMENT '设备ID',
  ehavior_type TINYINT NOT NULL COMMENT '行为类型:1浏览2收藏3加购4购买5评价',
  product_id BIGINT NOT NULL COMMENT '商品ID',
  sku_id BIGINT COMMENT 'SKU ID',
  duration INT COMMENT '停留时长',
  extra_data TEXT COMMENT '扩展数据',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  date DATE COMMENT '日期',
  PRIMARY KEY (id),
  KEY idx_user_id (user_id, ehavior_type),
  KEY idx_product_id (product_id),
  KEY idx_created_at (created_at),
  KEY idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户行为日志表';

-- 13. 用户收藏表
DROP TABLE IF EXISTS avorite;
CREATE TABLE avorite (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '收藏ID',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  product_id BIGINT NOT NULL COMMENT '商品ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_product (user_id, product_id),
  KEY idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户收藏表';

-- 14. 商品评价表
DROP TABLE IF EXISTS eview;
CREATE TABLE eview (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '评价ID',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  order_item_id BIGINT NOT NULL COMMENT '订单明细ID',
  product_id BIGINT NOT NULL COMMENT '商品ID',
  sku_id BIGINT COMMENT 'SKU ID',
  ating TINYINT NOT NULL COMMENT '评分:1-5星',
  content TEXT COMMENT '评价内容',
  images TEXT COMMENT '评价图片',
  likes INT DEFAULT 0 COMMENT '点赞数',
  status TINYINT DEFAULT 1 COMMENT '状态',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_product_id (product_id),
  KEY idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品评价表';

-- 15. 推荐结果缓存表
DROP TABLE IF EXISTS ecommendation;
CREATE TABLE ecommendation (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL COMMENT '用户ID',
  ec_type VARCHAR(50) NOT NULL COMMENT '推荐类型',
  product_ids TEXT NOT NULL COMMENT '推荐商品ID列表',
  expire_time DATETIME NOT NULL COMMENT '过期时间',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_type (user_id, ec_type),
  KEY idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='推荐结果缓存表';

-- 16. 商品相似度表
DROP TABLE IF EXISTS product_similarity;
CREATE TABLE product_similarity (
  id BIGINT NOT NULL AUTO_INCREMENT,
  product_id BIGINT NOT NULL COMMENT '商品ID',
  similar_product_id BIGINT NOT NULL COMMENT '相似商品ID',
  similarity DECIMAL(6,5) NOT NULL COMMENT '相似度0-1',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_product_similar (product_id, similar_product_id),
  KEY idx_product_id (product_id),
  KEY idx_similarity (similarity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品相似度表';

SET FOREIGN_KEY_CHECKS = 1;
