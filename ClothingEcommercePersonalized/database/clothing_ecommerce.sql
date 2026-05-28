-- 服装电商个性化推荐系统数据库脚本
-- 创建日期: 2026-05-27
-- 数据库: clothing_ecommerce

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 创建数据库
DROP DATABASE IF EXISTS `clothing_ecommerce`;
CREATE DATABASE `clothing_ecommerce` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `clothing_ecommerce`;

-- 1. 用户表
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码(加密)',
  `nickname` VARCHAR(50) COMMENT '昵称',
  `avatar` VARCHAR(255) COMMENT '头像URL',
  `gender` TINYINT DEFAULT 0 COMMENT '性别:0未知1男2女',
  `phone` VARCHAR(20) COMMENT '手机号',
  `email` VARCHAR(100) COMMENT '邮箱',
  `status` TINYINT DEFAULT 1 COMMENT '状态:0禁用1正常',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_username` (`username`),
  KEY `idx_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 2. 商品分类表
DROP TABLE IF EXISTS `category`;
CREATE TABLE `category` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
  `parent_id` BIGINT DEFAULT 0 COMMENT '父分类ID',
  `level` TINYINT DEFAULT 1 COMMENT '分类层级',
  `icon` VARCHAR(255) COMMENT '分类图标',
  `sort` INT DEFAULT 0 COMMENT '排序',
  `status` TINYINT DEFAULT 1 COMMENT '状态:0禁用1启用',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品分类表';

-- 3. 商品标签表
DROP TABLE IF EXISTS `tag`;
CREATE TABLE `tag` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '标签ID',
  `name` VARCHAR(50) NOT NULL UNIQUE COMMENT '标签名称',
  `type` VARCHAR(20) DEFAULT 'style' COMMENT '标签类型:style风格,material材质,scene场景',
  `sort` INT DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品标签表';

-- 4. 商品表
DROP TABLE IF EXISTS `product`;
CREATE TABLE `product` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '商品ID',
  `name` VARCHAR(200) NOT NULL COMMENT '商品名称',
  `subtitle` VARCHAR(500) COMMENT '商品副标题',
  `category_id` BIGINT NOT NULL COMMENT '分类ID',
  `brand` VARCHAR(100) COMMENT '品牌',
  `main_image` VARCHAR(255) COMMENT '主图URL',
  `images` TEXT COMMENT '商品图片列表(JSON数组)',
  `description` TEXT COMMENT '商品详情描述',
  `price` DECIMAL(10,2) NOT NULL COMMENT '商品价格(展示价)',
  `original_price` DECIMAL(10,2) COMMENT '原价',
  `sales_count` INT DEFAULT 0 COMMENT '销量',
  `review_count` INT DEFAULT 0 COMMENT '评价数',
  `rating_avg` DECIMAL(3,2) DEFAULT 5.00 COMMENT '平均评分',
  `status` TINYINT DEFAULT 1 COMMENT '状态:0下架1上架',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_status` (`status`),
  KEY `idx_sales_count` (`sales_count`),
  FULLTEXT KEY `ft_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- 5. 商品标签关联表
DROP TABLE IF EXISTS `product_tag`;
CREATE TABLE `product_tag` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT NOT NULL COMMENT '商品ID',
  `tag_id` BIGINT NOT NULL COMMENT '标签ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_product_tag` (`product_id`, `tag_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_tag_id` (`tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品标签关联表';

-- 6. SKU规格表(颜色、尺码等)
DROP TABLE IF EXISTS `sku_spec`;
CREATE TABLE `sku_spec` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '规格ID',
  `product_id` BIGINT NOT NULL COMMENT '商品ID',
  `spec_name` VARCHAR(50) NOT NULL COMMENT '规格名称:颜色,尺码',
  `spec_value` VARCHAR(100) NOT NULL COMMENT '规格值',
  `spec_image` VARCHAR(255) COMMENT '规格图片(如颜色对应的图片)',
  `sort` INT DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='SKU规格表';

-- 7. SKU表(库存单元)
DROP TABLE IF EXISTS `sku`;
CREATE TABLE `sku` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'SKU ID',
  `product_id` BIGINT NOT NULL COMMENT '商品ID',
  `sku_code` VARCHAR(100) UNIQUE COMMENT 'SKU编码',
  `specs` VARCHAR(500) NOT NULL COMMENT '规格组合(JSON: {"颜色":"红色","尺码":"M"})',
  `spec_ids` VARCHAR(200) COMMENT '规格ID组合(逗号分隔)',
  `price` DECIMAL(10,2) NOT NULL COMMENT 'SKU价格',
  `original_price` DECIMAL(10,2) COMMENT 'SKU原价',
  `stock` INT DEFAULT 0 COMMENT '库存数量',
  `image` VARCHAR(255) COMMENT 'SKU图片',
  `status` TINYINT DEFAULT 1 COMMENT '状态:0禁用1启用',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_sku_code` (`sku_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='SKU库存表';

-- 8. 购物车表
DROP TABLE IF EXISTS `cart`;
CREATE TABLE `cart` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '购物车ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `sku_id` BIGINT NOT NULL COMMENT 'SKU ID',
  `product_id` BIGINT NOT NULL COMMENT '商品ID',
  `quantity` INT DEFAULT 1 COMMENT '数量',
  `selected` TINYINT DEFAULT 1 COMMENT '是否选中:0否1是',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_sku` (`user_id`, `sku_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='购物车表';

-- 9. 用户收货地址表
DROP TABLE IF EXISTS `user_address`;
CREATE TABLE `user_address` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '地址ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `receiver` VARCHAR(50) NOT NULL COMMENT '收货人',
  `phone` VARCHAR(20) NOT NULL COMMENT '手机号',
  `province` VARCHAR(50) NOT NULL COMMENT '省份',
  `city` VARCHAR(50) NOT NULL COMMENT '城市',
  `district` VARCHAR(50) NOT NULL COMMENT '区县',
  `detail` VARCHAR(500) NOT NULL COMMENT '详细地址',
  `is_default` TINYINT DEFAULT 0 COMMENT '是否默认:0否1是',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户收货地址表';

-- 10. 订单表
DROP TABLE IF EXISTS `order`;
CREATE TABLE `order` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `order_no` VARCHAR(64) NOT NULL UNIQUE COMMENT '订单号',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `total_amount` DECIMAL(10,2) NOT NULL COMMENT '订单总金额',
  `pay_amount` DECIMAL(10,2) NOT NULL COMMENT '实付金额',
  `freight_amount` DECIMAL(10,2) DEFAULT 0 COMMENT '运费',
  `discount_amount` DECIMAL(10,2) DEFAULT 0 COMMENT '优惠金额',
  `status` TINYINT DEFAULT 0 COMMENT '订单状态:0待支付1已支付2已发货3已完成4已取消5已退款',
  `pay_type` TINYINT COMMENT '支付方式:1支付宝2微信',
  `pay_time` DATETIME COMMENT '支付时间',
  `ship_time` DATETIME COMMENT '发货时间',
  `finish_time` DATETIME COMMENT '完成时间',
  `cancel_time` DATETIME COMMENT '取消时间',
  `receiver_name` VARCHAR(50) COMMENT '收货人姓名',
  `receiver_phone` VARCHAR(20) COMMENT '收货人电话',
  `receiver_address` VARCHAR(500) COMMENT '收货地址',
  `remark` VARCHAR(500) COMMENT '订单备注',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 11. 订单明细表
DROP TABLE IF EXISTS `order_item`;
CREATE TABLE `order_item` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '明细ID',
  `order_id` BIGINT NOT NULL COMMENT '订单ID',
  `order_no` VARCHAR(64) NOT NULL COMMENT '订单号',
  `product_id` BIGINT NOT NULL COMMENT '商品ID',
  `sku_id` BIGINT NOT NULL COMMENT 'SKU ID',
  `product_name` VARCHAR(200) NOT NULL COMMENT '商品名称',
  `sku_specs` VARCHAR(500) COMMENT 'SKU规格',
  `product_image` VARCHAR(255) COMMENT '商品图片',
  `price` DECIMAL(10,2) NOT NULL COMMENT '单价',
  `quantity` INT NOT NULL COMMENT '数量',
  `total_price` DECIMAL(10,2) NOT NULL COMMENT '小计金额',
  `review_status` TINYINT DEFAULT 0 COMMENT '评价状态:0未评价1已评价',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_order_no` (`order_no`),
  KEY `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单明细表';

-- 12. 用户行为日志表(用于个性化推荐)
DROP TABLE IF EXISTS `user_behavior`;
CREATE TABLE `user_behavior` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID(未登录用户用设备ID)',
  `device_id` VARCHAR(100) COMMENT '设备ID',
  `behavior_type` TINYINT NOT NULL COMMENT '行为类型:1浏览2收藏3加购4购买5评价',
  `product_id` BIGINT NOT NULL COMMENT '商品ID',
  `sku_id` BIGINT COMMENT 'SKU ID',
  `duration` INT COMMENT '停留时长(秒)',
  `extra_data` TEXT COMMENT '扩展数据(JSON)',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '行为时间',
  `date` DATE COMMENT '日期(用于分区)',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`, `behavior_type`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户行为日志表';

-- 13. 用户收藏表
DROP TABLE IF EXISTS `favorite`;
CREATE TABLE `favorite` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '收藏ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `product_id` BIGINT NOT NULL COMMENT '商品ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_product` (`user_id`, `product_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户收藏表';

-- 14. 商品评价表
DROP TABLE IF EXISTS `review`;
CREATE TABLE `review` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '评价ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `order_item_id` BIGINT NOT NULL COMMENT '订单明细ID',
  `product_id` BIGINT NOT NULL COMMENT '商品ID',
  `sku_id` BIGINT COMMENT 'SKU ID',
  `rating` TINYINT NOT NULL COMMENT '评分:1-5星',
  `content` TEXT COMMENT '评价内容',
  `images` TEXT COMMENT '评价图片(JSON数组)',
  `likes` INT DEFAULT 0 COMMENT '点赞数',
  `status` TINYINT DEFAULT 1 COMMENT '状态:0删除1正常',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品评价表';

-- 15. 推荐结果缓存表
DROP TABLE IF EXISTS `recommendation`;
CREATE TABLE `recommendation` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `rec_type` VARCHAR(50) NOT NULL COMMENT '推荐类型:user_cf用户协同,item_cf商品协同,tag_based标签匹配,hot热门',
  `product_ids` TEXT NOT NULL COMMENT '推荐商品ID列表(逗号分隔)',
  `expire_time` DATETIME NOT NULL COMMENT '过期时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_type` (`user_id`, `rec_type`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='推荐结果缓存表';

-- 16. 商品相似度表(ItemCF预计算)
DROP TABLE IF EXISTS `product_similarity`;
CREATE TABLE `product_similarity` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT NOT NULL COMMENT '商品ID',
  `similar_product_id` BIGINT NOT NULL COMMENT '相似商品ID',
  `similarity` DECIMAL(6,5) NOT NULL COMMENT '相似度0-1',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_product_similar` (`product_id`, `similar_product_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_similarity` (`similarity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品相似度表';

-- ==================== 初始数据 ====================

-- 插入用户数据
INSERT INTO `user` (`username`, `password`, `nickname`, `gender`, `phone`, `email`) VALUES
('test1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iA1', '小明', 1, '13800138001', 'test1@example.com'),
('test2', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iA2', '小红', 2, '13800138002', 'test2@example.com'),
('test3', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iA3', '测试用户3', 0, '13800138003', 'test3@example.com');

-- 插入商品分类
INSERT INTO `category` (`name`, `parent_id`, `level`, `sort`) VALUES
('女装', 0, 1, 1),
('男装', 0, 1, 2),
('童装', 0, 1, 3),
('鞋靴', 0, 1, 4),
('T恤', 1, 2, 1),
('衬衫', 1, 2, 2),
('连衣裙', 1, 2, 3),
('外套', 1, 2, 4),
('T恤', 2, 2, 1),
('衬衫', 2, 2, 2),
('夹克', 2, 2, 3),
('西裤', 2, 2, 4);

-- 插入标签
INSERT INTO `tag` (`name`, `type`, `sort`) VALUES
('韩版', 'style', 1),
('日系', 'style', 2),
('简约', 'style', 3),
('复古', 'style', 4),
('运动', 'style', 5),
('休闲', 'style', 6),
('商务', 'style', 7),
('纯棉', 'material', 1),
('涤纶', 'material', 2),
('羊毛', 'material', 3),
('丝绸', 'material', 4),
('牛仔', 'material', 5),
('日常', 'scene', 1),
('约会', 'scene', 2),
('职场', 'scene', 3),
('运动', 'scene', 4),
('旅行', 'scene', 5);

-- 插入商品数据
INSERT INTO `product` (`name`, `subtitle`, `category_id`, `brand`, `main_image`, `price`, `original_price`, `sales_count`, `description`) VALUES
('纯棉简约圆领T恤', '舒适纯棉 百搭基础款', 5, '优衣库', 'https://example.com/t1.jpg', 99.00, 129.00, 1586, '采用100%精梳棉，柔软透气，经典圆领设计，简约百搭。'),
('韩版宽松衬衫女', '气质通勤 百搭显瘦', 6, '韩都衣舍', 'https://example.com/t2.jpg', 159.00, 199.00, 2341, '韩版设计风格，宽松版型，穿着舒适，适合职场日常穿搭。'),
('碎花连衣裙夏装新款', '浪漫碎花 甜美减龄', 7, 'ZARA', 'https://example.com/t3.jpg', 299.00, 399.00, 892, '浪漫碎花图案，收腰设计，展现优雅气质，适合约会出游。'),
('休闲牛仔外套女', '经典牛仔 百搭时尚', 8, 'Levis', 'https://example.com/t4.jpg', 399.00, 499.00, 567, '经典牛仔面料，修身版型，百搭款式，春秋必备单品。'),
('运动速干T恤男', '透气速干 运动必备', 9, 'Nike', 'https://example.com/m1.jpg', 199.00, 249.00, 2156, '采用速干面料，透气排汗，运动休闲两相宜。'),
('商务休闲衬衫男', '免烫抗皱 商务必备', 10, '雅戈尔', 'https://example.com/m2.jpg', 259.00, 329.00, 1823, '免烫面料，精致做工，职场精英必备。'),
('工装夹克男潮牌', '街头潮流 工装风格', 11, 'Supreme', 'https://example.com/m3.jpg', 599.00, 799.00, 456, '工装设计风格，多口袋实用，街头潮流必备。'),
('修身西裤男', '修身版型 商务正装', 12, 'G2000', 'https://example.com/m4.jpg', 359.00, 459.00, 789, '修身版型，垂感好，适合商务场合穿着。');

-- 商品标签关联
INSERT INTO `product_tag` (`product_id`, `tag_id`) VALUES
(1, 3), (1, 8), (1, 13),
(2, 1), (2, 6), (2, 15),
(3, 1), (3, 14),
(4, 6), (4, 12), (4, 13),
(5, 5), (5, 9), (5, 16),
(6, 7), (6, 15),
(7, 4), (7, 6), (7, 13),
(8, 7), (8, 15);

-- SKU规格-颜色
INSERT INTO `sku_spec` (`product_id`, `spec_name`, `spec_value`, `sort`) VALUES
(1, '颜色', '白色', 1), (1, '颜色', '黑色', 2), (1, '颜色', '灰色', 3),
(2, '颜色', '白色', 1), (2, '颜色', '蓝色', 2), (2, '颜色', '粉色', 3),
(3, '颜色', '粉色', 1), (3, '颜色', '蓝色', 2),
(4, '颜色', '浅蓝色', 1), (4, '颜色', '深蓝色', 2),
(5, '颜色', '白色', 1), (5, '颜色', '黑色', 2), (5, '颜色', '红色', 3),
(6, '颜色', '白色', 1), (6, '颜色', '蓝色', 2), (6, '颜色', '灰色', 3),
(7, '颜色', '卡其色', 1), (7, '颜色', '黑色', 2),
(8, '颜色', '黑色', 1), (8, '颜色', '藏青色', 2);

-- SKU规格-尺码
INSERT INTO `sku_spec` (`product_id`, `spec_name`, `spec_value`, `sort`) VALUES
(1, '尺码', 'S', 1), (1, '尺码', 'M', 2), (1, '尺码', 'L', 3), (1, '尺码', 'XL', 4),
(2, '尺码', 'S', 1), (2, '尺码', 'M', 2), (2, '尺码', 'L', 3), (2, '尺码', 'XL', 4),
(3, '尺码', 'S', 1), (3, '尺码', 'M', 2), (3, '尺码', 'L', 3),
(4, '尺码', 'S', 1), (4, '尺码', 'M', 2), (4, '尺码', 'L', 3), (4, '尺码', 'XL', 4),
(5, '尺码', 'M', 1), (5, '尺码', 'L', 2), (5, '尺码', 'XL', 3), (5, '尺码', 'XXL', 4),
(6, '尺码', 'M', 1), (6, '尺码', 'L', 2), (6, '尺码', 'XL', 3), (6, '尺码', 'XXL', 4),
(7, '尺码', 'M', 1), (7, '尺码', 'L', 2), (7, '尺码', 'XL', 3),
(8, '尺码', 'M', 1), (8, '尺码', 'L', 2), (8, '尺码', 'XL', 3), (8, '尺码', 'XXL', 4);

-- SKU库存数据（示例）
INSERT INTO `sku` (`product_id`, `sku_code`, `specs`, `price`, `stock`) VALUES
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

-- 模拟用户行为数据（用于推荐算法测试）
INSERT INTO `user_behavior` (`user_id`, `behavior_type`, `product_id`, `sku_id`, `date`) VALUES
(1, 1, 1, 2, '2026-05-20'),
(1, 1, 2, 6, '2026-05-20'),
(1, 2, 1, NULL, '2026-05-20'),
(1, 3, 1, 2, '2026-05-21'),
(1, 4, 1, 2, '2026-05-22'),
(1, 1, 3, 8, '2026-05-25'),
(2, 1, 5, 13, '2026-05-21'),
(2, 1, 6, 16, '2026-05-21'),
(2, 3, 5, 13, '2026-05-22'),
(2, 4, 5, 13, '2026-05-23'),
(2, 2, 6, NULL, '2026-05-24'),
(3, 1, 1, 1, '2026-05-22'),
(3, 1, 3, 9, '2026-05-22'),
(3, 2, 3, NULL, '2026-05-23'),
(3, 1, 4, 11, '2026-05-24');

-- 用户收藏
INSERT INTO `favorite` (`user_id`, `product_id`) VALUES
(1, 1), (1, 3),
(2, 5), (2, 6),
(3, 3);

SET FOREIGN_KEY_CHECKS = 1;

-- 完成
SELECT '数据库初始化完成！' AS message;
