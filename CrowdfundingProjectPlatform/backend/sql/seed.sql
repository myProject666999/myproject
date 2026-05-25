-- 演示项目种子数据
USE crowdfunding;

-- 清理现有数据
DELETE FROM `support_order`;
DELETE FROM `reward_tier`;
DELETE FROM `project_update`;
DELETE FROM `comment`;
DELETE FROM `project`;

-- 重置自增ID
ALTER TABLE `project` AUTO_INCREMENT = 1;
ALTER TABLE `reward_tier` AUTO_INCREMENT = 1;
ALTER TABLE `support_order` AUTO_INCREMENT = 1;
ALTER TABLE `project_update` AUTO_INCREMENT = 1;
ALTER TABLE `comment` AUTO_INCREMENT = 1;

-- 项目1: 开源众筹平台
INSERT INTO `project` (`user_id`, `title`, `subtitle`, `description`, `category`, `goal_amount`, `raised_amount`, `backer_count`, `status`, `start_at`, `end_at`) VALUES
(1, '开源众筹平台 Crowdfunding', '一个基于 NestJS + React 的开源众筹平台', '帮助独立创作者发布众筹项目、管理回报档位、与支持者互动。完整的项目管理、订单、评论、动态功能。', '科技', 50000.00, 28500.00, 42, 0,
 DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY));

-- 项目2: 独立游戏开发
INSERT INTO `project` (`user_id`, `title`, `subtitle`, `description`, `category`, `goal_amount`, `raised_amount`, `backer_count`, `status`, `start_at`, `end_at`) VALUES
(1, '星之旅途 - 独立解谜游戏', '一款太空主题的独立解谜冒险游戏', '我正在开发一款以太空探索为主题的解谜游戏，融合叙事、艺术和创新玩法。支持后将获得游戏本体、原声音乐和限定周边。', '游戏', 30000.00, 12000.00, 18, 0,
 DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 45 DAY));

-- 项目3: 已成功的众筹
INSERT INTO `project` (`user_id`, `title`, `subtitle`, `description`, `category`, `goal_amount`, `raised_amount`, `backer_count`, `status`, `start_at`, `end_at`) VALUES
(1, '独立音乐专辑制作', '一张融合多种风格的原创音乐专辑', '历时两年创作的10首原创歌曲，融合民谣、电子和世界音乐元素。', '音乐', 10000.00, 11500.00, 56, 1,
 DATE_SUB(NOW(), INTERVAL 60 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY));

-- 回报档位 - 项目1
INSERT INTO `reward_tier` (`project_id`, `tier_name`, `amount`, `description`, `stock`, `sold_count`) VALUES
(1, '感谢支持', 10.00, '感谢您的支持！名字将出现在鸣谢名单中', 0, 15),
(1, '早鸟会员', 50.00, '提前体验 alpha 版本 + 专属 Discord 频道', 100, 20),
(1, '众筹支持者', 200.00, '完整产品 + 限量数字徽章 + 鸣谢', 0, 5),
(1, '企业赞助', 5000.00, '企业级赞助，Logo 出现在合作伙伴页面', 10, 2);

-- 回报档位 - 项目2
INSERT INTO `reward_tier` (`project_id`, `tier_name`, `amount`, `description`, `stock`, `sold_count`) VALUES
(2, '数字版游戏', 30.00, '游戏本体 + 数字原声带', 0, 8),
(2, '限定周边套装', 128.00, '游戏 + 原声带 + 限定海报 + 贴纸套装', 200, 6),
(2, '收藏版', 500.00, '游戏 + 原声带 + 周边 + 限定艺术画册 + 开发者签名', 50, 4);

-- 回报档位 - 项目3
INSERT INTO `reward_tier` (`project_id`, `tier_name`, `amount`, `description`, `stock`, `sold_count`) VALUES
(3, '数字专辑', 20.00, '10首原创歌曲 + 数字歌词本', 0, 30),
(3, '实体CD', 80.00, '实体CD + 签名 + 独家花絮视频', 100, 20),
(3, '黑胶唱片', 200.00, '12寸黑胶唱片 + 签名海报', 30, 6);

-- 项目动态 - 项目1
INSERT INTO `project_update` (`project_id`, `user_id`, `title`, `content`) VALUES
(1, 1, '开发进度更新 #1', '已完成用户认证和项目发布核心功能，正在开发支持订单模块。'),
(1, 1, '感谢支持者', '感谢每一位支持我们的朋友！你们的支持是我们前进的动力。');

-- 项目动态 - 项目2
INSERT INTO `project_update` (`project_id`, `user_id`, `title`, `content`) VALUES
(2, 1, '游戏开发日志', '已完成核心玩法原型，正在制作关卡设计和美术资源。');

-- 评论 - 项目1
INSERT INTO `comment` (`project_id`, `user_id`, `type`, `content`) VALUES
(1, 2, 0, '期待这个项目！功能看起来很完整。'),
(1, 2, 1, '请问支持哪些支付方式？'),
(2, 2, 0, '游戏画面太美了！'),
(3, 2, 0, '音乐真的很棒，循环了好几遍。');

SELECT 'Seed data imported successfully.' AS result;
