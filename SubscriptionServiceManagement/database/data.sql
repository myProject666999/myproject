USE subscription_management;

INSERT INTO exchange_rates (currency_from, currency_to, rate) VALUES
('CNY', 'CNY', 1.000000),
('USD', 'CNY', 7.250000),
('EUR', 'CNY', 7.850000),
('GBP', 'CNY', 9.200000),
('JPY', 'CNY', 0.048000),
('HKD', 'CNY', 0.928000),
('TWD', 'CNY', 0.230000)
ON DUPLICATE KEY UPDATE rate = VALUES(rate);

INSERT INTO subscriptions (name, description, category, price, currency, cycle_type, cycle_days, start_date, next_renewal_date, is_active, reminder_days, payment_method, account) VALUES
('Netflix', '网飞高级会员，支持4K', '视频', 15.99, 'USD', 'MONTHLY', NULL, '2026-01-15', '2026-06-15', 1, 7, '支付宝', 'user@example.com'),
('iCloud+', '200GB云存储', '云存储', 21.00, 'CNY', 'MONTHLY', NULL, '2026-02-01', '2026-06-01', 1, 7, 'Apple Pay', 'apple@id.com'),
('腾讯视频VIP', '腾讯视频会员', '视频', 258.00, 'CNY', 'YEARLY', NULL, '2025-08-20', '2026-08-20', 1, 15, '微信支付', 'wechat_user'),
('Spotify', '音乐流媒体', '音乐', 9.99, 'USD', 'MONTHLY', NULL, '2026-03-10', '2026-06-10', 1, 7, 'PayPal', 'spotify@music.com'),
('Adobe Creative Cloud', '创意设计软件套装', '工具', 888.00, 'CNY', 'YEARLY', NULL, '2025-12-01', '2026-12-01', 1, 30, '信用卡', 'adobe@design.com'),
('百度网盘超级会员', '2TB云存储', '云存储', 263.00, 'CNY', 'YEARLY', NULL, '2026-01-20', '2027-01-20', 1, 15, '支付宝', 'baidu@pan.com'),
('YouTube Premium', '无广告视频+音乐', '视频', 11.99, 'USD', 'MONTHLY', NULL, '2026-04-05', '2026-06-05', 1, 7, '信用卡', 'youtube@gmail.com'),
('阿里云服务器', 'ECS云服务器', '云服务', 99.00, 'CNY', 'MONTHLY', NULL, '2026-02-14', '2026-06-14', 1, 7, '支付宝', 'aliyun@cloud.com'),
('网易云音乐黑胶VIP', '音乐会员', '音乐', 158.00, 'CNY', 'YEARLY', NULL, '2025-11-11', '2026-11-11', 1, 15, '微信支付', 'netease@music.com'),
('Notion Plus', '笔记协作工具', '工具', 8.00, 'USD', 'MONTHLY', NULL, '2026-03-01', '2026-06-01', 1, 7, '信用卡', 'notion@work.com');
