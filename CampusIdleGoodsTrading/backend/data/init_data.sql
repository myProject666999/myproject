-- 初始化管理员账号 (密码: admin123)
INSERT INTO users (username, password, email, nickname, role, status, created_at, updated_at) 
VALUES ('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'admin@campus.com', '管理员', 'admin', 1, NOW(), NOW());

-- 初始化商品分类
INSERT INTO categories (name, description, sort, status, created_at, updated_at) VALUES
('电子产品', '手机、电脑、耳机等电子产品', 1, 1, NOW(), NOW()),
('书籍资料', '教材、参考书、考研资料等', 2, 1, NOW(), NOW()),
('生活用品', '日常用品、小家电等', 3, 1, NOW(), NOW()),
('运动器材', '篮球、羽毛球拍、瑜伽垫等', 4, 1, NOW(), NOW()),
('服装配饰', '衣服、鞋子、包包等', 5, 1, NOW(), NOW()),
('其他', '其他闲置物品', 6, 1, NOW(), NOW());

-- 初始化轮播图
INSERT INTO banners (title, image, link, sort, status, created_at, updated_at) VALUES
('校园闲置交易平台', 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200', '/products', 1, 1, NOW(), NOW()),
('新学期特惠', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200', '/products', 2, 1, NOW(), NOW()),
('限时抢购', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200', '/products', 3, 1, NOW(), NOW());

-- 初始化商品资讯
INSERT INTO news (title, content, author, status, views, created_at, updated_at) VALUES
('校园闲置物品交易平台正式上线！', '欢迎使用校园闲置物品交易平台！在这里，您可以买卖各种闲置物品，让资源得到更好的利用。', '管理员', 1, 100, NOW(), NOW()),
('新学期开学季，闲置物品大促销！', '新学期来了，同学们可以在这里找到各种学习用品和生活用品，价格实惠，品质保证！', '管理员', 1, 85, NOW(), NOW()),
('如何安全交易的小贴士', '为了确保您的交易安全，我们建议您：1. 使用平台进行交易 2. 当面验货 3. 确认商品无误后再付款。', '管理员', 1, 120, NOW(), NOW());

-- 初始化示例商品
INSERT INTO products (name, description, price, original_price, stock, image, category_id, status, sales, created_at, updated_at) VALUES
('iPhone 13 Pro', '95新 iPhone 13 Pro 256GB 黑色，无划痕，配件齐全', 5999.00, 8999.00, 10, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400', 1, 1, 25, NOW(), NOW()),
('高等数学教材', '第七版高等数学上下册，有少量笔记', 30.00, 89.00, 50, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', 2, 1, 100, NOW(), NOW()),
('小米电热水壶', '99新小米电热水壶，1.5L容量，使用次数少', 59.00, 129.00, 20, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', 3, 1, 35, NOW(), NOW()),
('篮球', '斯伯丁篮球，使用过几次，状态良好', 89.00, 199.00, 15, 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=400', 4, 1, 20, NOW(), NOW()),
('运动T恤', '全新运动T恤，L码，透气速干', 49.00, 99.00, 30, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 5, 1, 50, NOW(), NOW()),
('机械键盘', '樱桃红轴机械键盘，9成新，手感极佳', 199.00, 499.00, 8, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400', 1, 1, 15, NOW(), NOW()),
('考研英语真题', '2024考研英语真题解析，黄皮书', 45.00, 88.00, 25, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', 2, 1, 60, NOW(), NOW()),
('瑜伽垫', 'TPE材质瑜伽垫，防滑加厚，183x61cm', 39.00, 99.00, 40, 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400', 4, 1, 45, NOW(), NOW());
