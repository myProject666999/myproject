USE `online_judge`;

INSERT IGNORE INTO `user` (`id`, `username`, `password`, `nickname`, `email`, `role`, `status`)
VALUES (1, 'admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '超级管理员', 'admin@oj.com', 1, 1);

INSERT IGNORE INTO `tag` (`id`, `name`) VALUES
(1, '入门'), (2, '模拟'), (3, '数学'), (4, '字符串'), (5, '数组'),
(6, '链表'), (7, '栈'), (8, '队列'), (9, '哈希表'), (10, '双指针'),
(11, '二分查找'), (12, '排序'), (13, '动态规划'), (14, '贪心'), (15, '图论'),
(16, '树'), (17, 'DFS'), (18, 'BFS'), (19, '回溯'), (20, '分治'), (21, '位运算');

INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`) VALUES
('site_name', '在线编程评测系统', '站点名称'),
('default_time_limit', '1000', '默认时间限制(ms)'),
('default_memory_limit', '256', '默认内存限制(MB)'),
('max_code_length', '65536', '最大代码长度(Bytes)'),
('judge_concurrency', '2', '判题并发数');

INSERT IGNORE INTO `problem` (`id`, `title`, `description`, `input_desc`, `output_desc`, `sample_input`, `sample_output`, `difficulty`, `time_limit`, `memory_limit`, `status`) VALUES
(1, 'A + B', '计算两个整数A和B的和。', '输入包含两个整数A和B,范围为[-10^9, 10^9]。', '输出一个整数,即A+B的结果。', '1 2', '3', 1, 1000, 256, 1),
(2, 'Hello World', '请输出"Hello World!"。', '无输入。', '输出一行"Hello World!"。', '', 'Hello World!', 1, 1000, 256, 1);

INSERT IGNORE INTO `problem_case` (`id`, `problem_id`, `input`, `output`, `is_sample`) VALUES
(1, 1, '1 2', '3', 1),
(2, 1, '1000000000 1000000000', '2000000000', 0),
(3, 1, '-5 7', '2', 0),
(4, 1, '0 0', '0', 0),
(5, 2, '', 'Hello World!', 1);

INSERT IGNORE INTO `problem_tag` (`problem_id`, `tag_id`) VALUES
(1, 1), (1, 3),
(2, 1);

INSERT IGNORE INTO `announcement` (`id`, `title`, `content`, `priority`) VALUES
(1, '欢迎使用在线编程评测系统', '本系统支持C/C++/Java/Python多种语言，欢迎开始你的编程之旅！', 1),
(2, '系统更新说明', '新增竞赛功能与排行榜。', 0);
