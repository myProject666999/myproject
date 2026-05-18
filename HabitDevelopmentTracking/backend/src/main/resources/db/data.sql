-- 插入默认用户
INSERT IGNORE INTO `user` (`id`, `username`, `nickname`) VALUES (1, 'admin', '管理员');

-- 插入默认习惯
INSERT IGNORE INTO `habit` (`id`, `user_id`, `name`, `icon`, `color`, `description`, `target_days`, `sort_order`) VALUES 
(1, 1, '喝水', '💧', '#1890ff', '每天喝8杯水', 30, 1),
(2, 1, '阅读', '📚', '#52c41a', '每天阅读30分钟', 21, 2),
(3, 1, '运动', '🏃', '#fa8c16', '每天运动30分钟', 30, 3),
(4, 1, '早睡', '😴', '#722ed1', '每天23点前睡觉', 21, 4);
