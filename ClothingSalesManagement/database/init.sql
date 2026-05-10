-- 服装销售管理系统数据库初始化脚本
CREATE DATABASE IF NOT EXISTS clothingsales DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE clothingsales;

-- 创建默认管理员账号（密码: admin123，会在后端启动时自动创建）

-- 插入示例分类
INSERT INTO category (name, parent_id, sort_order, status, created_at, updated_at) VALUES
('男装', NULL, 1, 1, NOW(), NOW()),
('女装', NULL, 2, 1, NOW(), NOW()),
('童装', NULL, 3, 1, NOW(), NOW()),
('鞋靴', NULL, 4, 1, NOW(), NOW()),
('配饰', NULL, 5, 1, NOW(), NOW());

INSERT INTO category (name, parent_id, sort_order, status, created_at, updated_at) VALUES
('T恤', 1, 1, 1, NOW(), NOW()),
('衬衫', 1, 2, 1, NOW(), NOW()),
('外套', 1, 3, 1, NOW(), NOW()),
('裤子', 1, 4, 1, NOW(), NOW()),
('连衣裙', 2, 1, 1, NOW(), NOW()),
('上衣', 2, 2, 1, NOW(), NOW()),
('裙子', 2, 3, 1, NOW(), NOW()),
('套装', 2, 4, 1, NOW(), NOW());

-- 插入示例商品
INSERT INTO product (name, description, price, original_price, stock, sales, category_id, status, created_at, updated_at) VALUES
('简约纯棉T恤', '舒适透气，百搭款式', 99.00, 129.00, 100, 50, 6, 1, NOW(), NOW()),
('商务休闲衬衫', '优质面料，修身版型', 199.00, 259.00, 80, 30, 7, 1, NOW(), NOW()),
('时尚夹克外套', '秋冬新款，保暖防风', 399.00, 499.00, 50, 20, 8, 1, NOW(), NOW()),
('休闲牛仔裤', '经典款式，舒适耐穿', 299.00, 359.00, 120, 60, 9, 1, NOW(), NOW()),
('优雅连衣裙', '夏季新款，清新优雅', 299.00, 399.00, 80, 45, 10, 1, NOW(), NOW()),
('甜美雪纺上衣', '轻盈飘逸，仙气十足', 159.00, 199.00, 100, 35, 11, 1, NOW(), NOW()),
('A字半身裙', '显瘦百搭，多色可选', 199.00, 249.00, 90, 40, 12, 1, NOW(), NOW()),
('职业套装', '商务首选，干练气质', 499.00, 599.00, 60, 25, 13, 1, NOW(), NOW());

-- 插入示例轮播图
INSERT INTO banner (title, image, link, sort_order, status, created_at, updated_at) VALUES
('夏季新品上市', 'https://picsum.photos/1200/300?random=1', '/products', 1, 1, NOW(), NOW()),
('限时特惠', 'https://picsum.photos/1200/300?random=2', '/products', 2, 1, NOW(), NOW()),
('会员专享', 'https://picsum.photos/1200/300?random=3', '/products', 3, 1, NOW(), NOW());

-- 插入示例热销商品配置
INSERT INTO hot_product (product_id, sort_order, status, created_at) VALUES
(1, 1, 1, NOW()),
(2, 2, 1, NOW()),
(3, 3, 1, NOW()),
(4, 4, 1, NOW());

-- 插入示例新品配置
INSERT INTO new_product (product_id, sort_order, status, created_at) VALUES
(5, 1, 1, NOW()),
(6, 2, 1, NOW()),
(7, 3, 1, NOW()),
(8, 4, 1, NOW());

-- 插入示例推荐商品配置
INSERT INTO recommend_product (product_id, sort_order, status, created_at) VALUES
(1, 1, 1, NOW()),
(5, 2, 1, NOW()),
(3, 3, 1, NOW()),
(8, 4, 1, NOW());
