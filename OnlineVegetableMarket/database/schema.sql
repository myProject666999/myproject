-- =============================================
-- 在线菜市场/生鲜配送 数据库脚本
-- 数据库: MySQL 8.0+
-- =============================================

CREATE DATABASE IF NOT EXISTS `vegetable_market`
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE `vegetable_market`;

-- =============================================
-- 用户表
-- =============================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    `password` VARCHAR(255) NOT NULL COMMENT '密码(加密)',
    `phone` VARCHAR(20) NOT NULL COMMENT '手机号',
    `address` VARCHAR(500) DEFAULT NULL COMMENT '默认收货地址',
    `role` ENUM('customer', 'merchant', 'admin') NOT NULL DEFAULT 'customer' COMMENT '角色',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- =============================================
-- 商品分类表
-- =============================================
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
    `name` VARCHAR(50) NOT NULL UNIQUE COMMENT '分类名称',
    `icon` VARCHAR(255) DEFAULT NULL COMMENT '分类图标URL',
    `sort` INT DEFAULT 0 COMMENT '排序权重',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品分类表';

-- =============================================
-- 商品表
-- =============================================
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '商品ID',
    `category_id` BIGINT UNSIGNED NOT NULL COMMENT '分类ID',
    `name` VARCHAR(100) NOT NULL COMMENT '商品名称',
    `description` TEXT DEFAULT NULL COMMENT '商品描述',
    `image_url` VARCHAR(500) DEFAULT NULL COMMENT '商品图片URL',
    `price_unit` ENUM('weight', 'piece') NOT NULL DEFAULT 'weight' COMMENT '计价单位: weight=按重量, piece=按份',
    `price` DECIMAL(10,2) NOT NULL COMMENT '单价(元/kg 或 元/份)',
    `unit_weight` DECIMAL(10,2) DEFAULT NULL COMMENT '每份重量(kg), 仅 piece 时有效',
    `origin` VARCHAR(100) DEFAULT NULL COMMENT '产地',
    `status` ENUM('on_sale', 'off_shelf', 'sold_out') NOT NULL DEFAULT 'on_sale' COMMENT '状态',
    `sort` INT DEFAULT 0 COMMENT '排序权重',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_category` (`category_id`),
    INDEX `idx_status` (`status`),
    CONSTRAINT `fk_product_category` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品表';

-- =============================================
-- 每日库存表
-- =============================================
DROP TABLE IF EXISTS `daily_inventory`;
CREATE TABLE `daily_inventory` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '库存ID',
    `product_id` BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
    `inventory_date` DATE NOT NULL COMMENT '库存日期',
    `total_quantity` DECIMAL(10,2) NOT NULL COMMENT '总库存(kg 或 份)',
    `remaining_quantity` DECIMAL(10,2) NOT NULL COMMENT '剩余库存(kg 或 份)',
    `version` INT DEFAULT 0 COMMENT '乐观锁版本号',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY `uk_product_date` (`product_id`, `inventory_date`),
    INDEX `idx_date` (`inventory_date`),
    CONSTRAINT `fk_inventory_product` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='每日库存表';

-- =============================================
-- 配送时段表
-- =============================================
DROP TABLE IF EXISTS `delivery_slots`;
CREATE TABLE `delivery_slots` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '时段ID',
    `slot_date` DATE NOT NULL COMMENT '配送日期',
    `start_time` TIME NOT NULL COMMENT '开始时间',
    `end_time` TIME NOT NULL COMMENT '结束时间',
    `max_orders` INT NOT NULL DEFAULT 20 COMMENT '该时段最大订单数',
    `current_orders` INT NOT NULL DEFAULT 0 COMMENT '当前已预约订单数',
    `status` ENUM('available', 'full', 'disabled') NOT NULL DEFAULT 'available' COMMENT '状态',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_date` (`slot_date`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='配送时段表';

-- =============================================
-- 购物车表
-- =============================================
DROP TABLE IF EXISTS `cart_items`;
CREATE TABLE `cart_items` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '购物车项ID',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `product_id` BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
    `quantity` DECIMAL(10,2) NOT NULL COMMENT '数量(kg 或 份)',
    `selected` TINYINT(1) DEFAULT 1 COMMENT '是否选中: 1=选中, 0=未选',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY `uk_user_product` (`user_id`, `product_id`),
    INDEX `idx_user` (`user_id`),
    CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_cart_product` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='购物车表';

-- =============================================
-- 订单表
-- =============================================
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '订单ID',
    `order_no` VARCHAR(32) NOT NULL UNIQUE COMMENT '订单编号',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `total_amount` DECIMAL(12,2) NOT NULL COMMENT '订单总金额',
    `delivery_fee` DECIMAL(10,2) DEFAULT 0 COMMENT '配送费',
    `discount_amount` DECIMAL(10,2) DEFAULT 0 COMMENT '优惠金额',
    `payable_amount` DECIMAL(12,2) NOT NULL COMMENT '应付金额',
    `delivery_address` VARCHAR(500) NOT NULL COMMENT '配送地址',
    `delivery_slot_id` BIGINT UNSIGNED NOT NULL COMMENT '配送时段ID',
    `contact_name` VARCHAR(50) NOT NULL COMMENT '联系人姓名',
    `contact_phone` VARCHAR(20) NOT NULL COMMENT '联系人电话',
    `remark` VARCHAR(500) DEFAULT NULL COMMENT '订单备注',
    `status` ENUM('pending', 'paid', 'preparing', 'delivering', 'completed', 'cancelled', 'refunded')
        NOT NULL DEFAULT 'pending' COMMENT '订单状态',
    `payment_status` ENUM('unpaid', 'paid', 'refunded') NOT NULL DEFAULT 'unpaid' COMMENT '支付状态',
    `delivery_status` ENUM('pending', 'picked_up', 'delivering', 'delivered', 'failed')
        NOT NULL DEFAULT 'pending' COMMENT '配送状态',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '下单时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `paid_at` TIMESTAMP NULL DEFAULT NULL COMMENT '支付时间',
    `delivered_at` TIMESTAMP NULL DEFAULT NULL COMMENT '送达时间',
    INDEX `idx_user` (`user_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_created_at` (`created_at`),
    CONSTRAINT `fk_order_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_order_slot` FOREIGN KEY (`delivery_slot_id`) REFERENCES `delivery_slots`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- =============================================
-- 订单明细表
-- =============================================
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '明细ID',
    `order_id` BIGINT UNSIGNED NOT NULL COMMENT '订单ID',
    `product_id` BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
    `product_name` VARCHAR(100) NOT NULL COMMENT '商品名称(下单时快照)',
    `product_image` VARCHAR(500) DEFAULT NULL COMMENT '商品图片(下单时快照)',
    `price_unit` ENUM('weight', 'piece') NOT NULL COMMENT '计价单位快照',
    `unit_price` DECIMAL(10,2) NOT NULL COMMENT '单价快照',
    `quantity` DECIMAL(10,2) NOT NULL COMMENT '数量(kg 或 份)',
    `subtotal` DECIMAL(12,2) NOT NULL COMMENT '小计金额',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX `idx_order` (`order_id`),
    CONSTRAINT `fk_item_order` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_item_product` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单明细表';

-- =============================================
-- 配送记录表
-- =============================================
DROP TABLE IF EXISTS `delivery_records`;
CREATE TABLE `delivery_records` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
    `order_id` BIGINT UNSIGNED NOT NULL COMMENT '订单ID',
    `action` ENUM('assigned', 'picked_up', 'en_route', 'delivered', 'failed') NOT NULL COMMENT '配送动作',
    `description` VARCHAR(500) DEFAULT NULL COMMENT '描述',
    `operator` VARCHAR(50) DEFAULT NULL COMMENT '操作人',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    INDEX `idx_order` (`order_id`),
    CONSTRAINT `fk_delivery_order` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='配送记录表';

-- =============================================
-- 初始化数据
-- =============================================

-- 默认管理员用户 (密码: 123456, 使用 bcrypt hash)
INSERT INTO `users` (`username`, `password`, `phone`, `address`, `role`) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '13800000000', '系统默认', 'admin'),
('merchant', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '13800000001', '商家后台', 'merchant'),
('customer', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '13800000002', '北京市朝阳区xxx街道xxx小区', 'customer');

-- 商品分类
INSERT INTO `categories` (`name`, `icon`, `sort`) VALUES
('叶菜类', 'leaf', 1),
('根茎类', 'root', 2),
('瓜果类', 'melon', 3),
('豆荚类', 'bean', 4),
('菌菇类', 'mushroom', 5),
('水果类', 'fruit', 6),
('肉类', 'meat', 7),
('禽蛋类', 'egg', 8);

-- 商品数据
INSERT INTO `products` (`category_id`, `name`, `description`, `image_url`, `price_unit`, `price`, `unit_weight`, `origin`, `status`) VALUES
(1, '有机菠菜', '新鲜有机菠菜，无农药残留', '/images/spinach.jpg', 'weight', 8.50, NULL, '山东寿光', 'on_sale'),
(1, '上海青', '翠绿上海青，口感清甜', '/images/shanghai_qing.jpg', 'weight', 6.00, NULL, '北京', 'on_sale'),
(1, '油麦菜', '鲜嫩油麦菜', '/images/youmai.jpg', 'weight', 7.50, NULL, '河北', 'on_sale'),
(2, '胡萝卜', '新鲜胡萝卜，富含维生素', '/images/carrot.jpg', 'weight', 5.00, NULL, '内蒙古', 'on_sale'),
(2, '土豆', '精选土豆，粉质细腻', '/images/potato.jpg', 'weight', 4.00, NULL, '甘肃', 'on_sale'),
(2, '白萝卜', '脆嫩白萝卜', '/images/radish.jpg', 'weight', 3.50, NULL, '山东', 'on_sale'),
(3, '西红柿', '自然成熟西红柿', '/images/tomato.jpg', 'weight', 7.00, NULL, '新疆', 'on_sale'),
(3, '黄瓜', '脆嫩黄瓜', '/images/cucumber.jpg', 'weight', 6.50, NULL, '山东', 'on_sale'),
(3, '茄子', '新鲜紫茄子', '/images/eggplant.jpg', 'weight', 5.50, NULL, '河北', 'on_sale'),
(4, '四季豆', '鲜嫩四季豆', '/images/bean.jpg', 'weight', 9.00, NULL, '云南', 'on_sale'),
(4, '豌豆', '新鲜豌豆', '/images/pea.jpg', 'weight', 12.00, NULL, '甘肃', 'on_sale'),
(5, '香菇', '优质香菇，肉厚味鲜', '/images/mushroom.jpg', 'weight', 15.00, NULL, '福建', 'on_sale'),
(5, '金针菇', '鲜嫩金针菇', '/images/enoki.jpg', 'weight', 8.00, NULL, '河北', 'on_sale'),
(6, '红富士苹果', '脆甜红富士苹果', '/images/apple.jpg', 'piece', 3.50, 0.25, '陕西', 'on_sale'),
(6, '香蕉', '进口香蕉', '/images/banana.jpg', 'weight', 6.00, NULL, '菲律宾', 'on_sale'),
(6, '橙子', '新鲜橙子', '/images/orange.jpg', 'piece', 4.00, 0.20, '江西', 'on_sale'),
(7, '五花肉', '新鲜五花肉', '/images/pork.jpg', 'weight', 35.00, NULL, '本地', 'on_sale'),
(7, '牛肉', '精选牛肉', '/images/beef.jpg', 'weight', 68.00, NULL, '内蒙古', 'on_sale'),
(8, '鸡蛋', '土鸡蛋，30枚/盒', '/images/egg.jpg', 'piece', 45.00, 1.50, '本地农场', 'on_sale'),
(8, '鸡胸肉', '新鲜鸡胸肉', '/images/chicken.jpg', 'weight', 22.00, NULL, '本地', 'on_sale');

-- 今日配送时段
INSERT INTO `delivery_slots` (`slot_date`, `start_time`, `end_time`, `max_orders`, `current_orders`, `status`) VALUES
(CURDATE(), '08:00:00', '10:00:00', 20, 0, 'available'),
(CURDATE(), '10:00:00', '12:00:00', 20, 0, 'available'),
(CURDATE(), '14:00:00', '16:00:00', 20, 0, 'available'),
(CURDATE(), '16:00:00', '18:00:00', 20, 0, 'available'),
(CURDATE(), '18:00:00', '20:00:00', 20, 0, 'available');

-- 未来3天配送时段
INSERT INTO `delivery_slots` (`slot_date`, `start_time`, `end_time`, `max_orders`, `current_orders`, `status`) VALUES
(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '08:00:00', '10:00:00', 20, 0, 'available'),
(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:00:00', '12:00:00', 20, 0, 'available'),
(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:00:00', '16:00:00', 20, 0, 'available'),
(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '16:00:00', '18:00:00', 20, 0, 'available'),
(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '18:00:00', '20:00:00', 20, 0, 'available'),
(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '08:00:00', '10:00:00', 20, 0, 'available'),
(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '10:00:00', '12:00:00', 20, 0, 'available'),
(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '14:00:00', '16:00:00', 20, 0, 'available'),
(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '16:00:00', '18:00:00', 20, 0, 'available'),
(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '18:00:00', '20:00:00', 20, 0, 'available');

-- 今日商品库存
INSERT INTO `daily_inventory` (`product_id`, `inventory_date`, `total_quantity`, `remaining_quantity`) VALUES
(1, CURDATE(), 50.00, 50.00),
(2, CURDATE(), 80.00, 80.00),
(3, CURDATE(), 60.00, 60.00),
(4, CURDATE(), 100.00, 100.00),
(5, CURDATE(), 150.00, 150.00),
(6, CURDATE(), 70.00, 70.00),
(7, CURDATE(), 90.00, 90.00),
(8, CURDATE(), 85.00, 85.00),
(9, CURDATE(), 65.00, 65.00),
(10, CURDATE(), 40.00, 40.00),
(11, CURDATE(), 30.00, 30.00),
(12, CURDATE(), 25.00, 25.00),
(13, CURDATE(), 35.00, 35.00),
(14, CURDATE(), 100, 100),
(15, CURDATE(), 80.00, 80.00),
(16, CURDATE(), 120, 120),
(17, CURDATE(), 40.00, 40.00),
(18, CURDATE(), 25.00, 25.00),
(19, CURDATE(), 50, 50),
(20, CURDATE(), 45.00, 45.00);
