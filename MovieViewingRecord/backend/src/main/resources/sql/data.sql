USE movie_viewing_record;

-- 插入示例电影数据
INSERT INTO movie (title, original_title, type, year, poster, description, director, actors, genre, duration, douban_id) VALUES
('盗梦空间', 'Inception', 'movie', 2010, 'https://img1.doubanio.com/view/photo/s_ratio_poster/public/p513344864.jpg', '道姆·柯布是一位经验老道的窃贼，他在这一行业中算得上是最厉害的，因为他能够潜入人们精神最为脆弱的梦境中，窃取潜意识中有价值的秘密。', '克里斯托弗·诺兰', '莱昂纳多·迪卡普里奥 / 约瑟夫·高登-莱维特', '科幻 / 悬疑 / 冒险', 148, '3541415'),
('星际穿越', 'Interstellar', 'movie', 2014, 'https://img2.doubanio.com/view/photo/s_ratio_poster/public/p2614988097.jpg', '在不远的未来，随着地球自然环境的恶化，人类面临着无法生存的威胁。这时科学家们在土星附近发现了一个虫洞出口，通往遥远的银河系。', '克里斯托弗·诺兰', '马修·麦康纳 / 安妮·海瑟薇', '科幻 / 剧情 / 冒险', 169, '1889243'),
('肖申克的救赎', 'The Shawshank Redemption', 'movie', 1994, 'https://img2.doubanio.com/view/photo/s_ratio_poster/public/p480747492.jpg', '一场谋杀案使银行家安迪蒙冤入狱，谋杀妻子及其情人的指控将囚禁他终生。在肖申克监狱的首次现身就让监狱“大哥”瑞德对他另眼相看。', '弗兰克·德拉邦特', '蒂姆·罗宾斯 / 摩根·弗里曼', '犯罪 / 剧情', 142, '1292052'),
('霸王别姬', 'Farewell My Concubine', 'movie', 1993, 'https://img2.doubanio.com/view/photo/s_ratio_poster/public/p2561716440.jpg', '段小楼与程蝶衣是一对从小一起长大的师兄弟，一个生，一个旦，配合天衣无缝，一出《霸王别姬》誉满京城，两人约定要演一辈子《霸王别姬》。', '陈凯歌', '张国荣 / 张丰毅 / 巩俐', '剧情 / 爱情', 171, '1291546'),
('千与千寻', '千と千尋の神隠し', 'movie', 2001, 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2557573348.jpg', '千寻和爸爸妈妈一同驱车前往新家，在郊外的小路上不慎进入了神秘的隧道——他们去到了另外一个诡异世界—一个中世纪的小镇。', '宫崎骏', '柊瑠美 / 入野自由', '剧情 / 动画 / 奇幻', 125, '1291561'),
('泰坦尼克号', 'Titanic', 'movie', 1997, 'https://img2.doubanio.com/view/photo/s_ratio_poster/public/p457760035.jpg', '1912年4月10日，号称 “世界工业史上的奇迹”的豪华客轮泰坦尼克号开始了自己的处女航，从英国的南安普顿出发驶往美国纽约。', '詹姆斯·卡梅隆', '莱昂纳多·迪卡普里奥 / 凯特·温斯莱特', '剧情 / 爱情 / 灾难', 194, '1292722'),
('疯狂动物城', 'Zootopia', 'movie', 2016, 'https://img1.doubanio.com/view/photo/s_ratio_poster/public/p2322896471.jpg', '故事发生在一个所有哺乳类动物和谐共存的美好世界中，兔子朱迪从小就梦想着能够成为一名惩恶扬善的刑警，凭借着努力和智慧，朱迪成功的从警校中毕业进入了疯狂动物城警察局。', '拜伦·霍华德', '金妮弗·古德温 / 杰森·贝特曼', '喜剧 / 动画 / 冒险', 108, '25662329'),
('摔跤吧！爸爸', 'Dangal', 'movie', 2016, 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2455050536.jpg', '马哈维亚曾经是一名前途无量的摔跤运动员，在放弃了职业生涯后，他最大的遗憾就是没有能够替国家赢得金牌。', '涅提·蒂瓦里', '阿米尔·汗 / 法缇玛·萨那·纱卡', '剧情 / 传记 / 运动', 161, '26387939'),
('寻梦环游记', 'Coco', 'movie', 2017, 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2502806253.jpg', '一个鞋匠家庭出身的12岁墨西哥小男孩米格，自幼有一个音乐梦，但音乐却是被家庭所禁止的，他们认为自己被音乐诅咒了。', '李·昂克里奇', '安东尼·冈萨雷斯 / 盖尔·加西亚·贝纳尔', '喜剧 / 动画 / 奇幻', 105, '26806112'),
('我不是药神', 'Dying to Survive', 'movie', 2018, 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2561304761.jpg', '普通中年男子程勇经营着一家保健品店，失意又失婚。不速之客吕受益的到来，让他开辟了一条去印度买药做“代购”的新事业。', '文牧野', '徐峥 / 周一围 / 王传君', '剧情 / 喜剧', 117, '26752088'),
('权力的游戏', 'Game of Thrones', 'tv', 2011, 'https://img2.doubanio.com/view/photo/s_ratio_poster/public/p1910824951.jpg', '《权力的游戏》是一部中世纪史诗奇幻题材的电视连续剧，该剧以美国作家乔治·R·R·马丁的奇幻巨作《冰与火之歌》七部曲为基础改编创作。', '阿兰·泰勒', '艾米莉亚·克拉克 / 基特·哈灵顿', '剧情 / 奇幻 / 冒险', 60, '3016187'),
('绝命毒师', 'Breaking Bad', 'tv', 2008, 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2676303759.jpg', '新墨西哥州的高中化学老师沃尔特·H·怀特是拮据家庭的唯一经济来源。他大半生安分守己，兢兢业业，却在50岁生日之际突然得知自己罹患肺癌晚期的噩耗。', '亚当·伯恩斯坦', '布莱恩·克兰斯顿 / 亚伦·保尔', '剧情 / 犯罪', 45, '3034693'),
('老友记', 'Friends', 'tv', 1994, 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2554847529.jpg', '莫妮卡、瑞秋、菲比、乔伊、钱德勒和罗斯是住在纽约曼哈顿的六个老友。他们互相扶持，共同经历了生活、爱情、事业的种种波折。', '凯文·布赖特', '詹妮弗·安妮斯顿 / 柯特妮·考克斯', '喜剧 / 爱情', 22, '1393012'),
('请回答1988', '응답하라 1988', 'tv', 2015, 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2564783231.jpg', '《请回答1988》为韩国tvN自2015年10月30日起播出的金土连续剧，由《请回答1997》、《请回答1994》制作班底申元浩导演和李祐汀作家再度携手合作。', '申元浩', '成东日 / 李一花 / 罗美兰', '剧情 / 喜剧 / 爱情', 60, '26302615'),
('庆余年', 'Qing Yu Nian', 'tv', 2019, 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2581364817.jpg', '范闲因一场意外穿越成为庆国范府的私生子，自小跟随奶奶生活在海边小城澹州。随着一位老师的突然造访，他看似平静的生活开始直面重重的危机与考验。', '孙皓', '张若昀 / 李沁 / 陈道明', '剧情 / 古装', 45, '30374303')
ON DUPLICATE KEY UPDATE updated_at=CURRENT_TIMESTAMP;

-- 插入示例观影记录
INSERT INTO viewing_record (user_id, movie_id, status, rating, review, watch_date) VALUES
(1, 1, 'watched', 9.5, '诺兰的神作，梦境层层递进，最后陀螺到底停没停？', '2024-01-15'),
(1, 2, 'watched', 9.8, '看完泪流满面，父爱和科学的完美结合', '2024-02-20'),
(1, 3, 'watched', 10.0, '希望是个好东西，也许是最好的东西，好东西永远不会消逝', '2024-03-10'),
(1, 4, 'watched', 9.7, '不疯魔不成活，哥哥之后再无程蝶衣', '2024-03-25'),
(1, 5, 'watched', 9.4, '宫崎骏的魔法世界，千寻的成长令人感动', '2024-04-05'),
(1, 6, 'watched', 9.5, '经典中的经典，You jump I jump', '2024-04-18'),
(1, 7, 'watched', 9.2, '兔子警官的励志故事，迪士尼的诚意之作', '2024-05-01'),
(1, 8, 'watched', 9.0, '阿米尔汗又一力作，女性励志的好榜样', '2024-05-15'),
(1, 9, 'watched', 9.6, '死亡不是终点，遗忘才是。Remember me', '2024-06-01'),
(1, 10, 'watched', 9.0, '直击社会痛点，国产电影的突破之作', '2024-06-20'),
(1, 11, 'watching', 9.3, '权游yyds，虽然烂尾但前四季封神', '2024-07-10'),
(1, 12, 'watched', 9.5, '老白的黑化之路，绝命毒师名不虚传', '2024-08-05'),
(1, 13, 'watched', 9.8, '永远的老友记，陪伴了无数人的青春', '2024-08-20'),
(1, 14, 'want', NULL, '听说很好看，一直想看还没看', NULL),
(1, 15, 'want', NULL, '国产古装剧的良心之作', NULL)
ON DUPLICATE KEY UPDATE updated_at=CURRENT_TIMESTAMP;

-- 插入年度Top10
INSERT INTO year_top (user_id, year, movie_id, `rank`) VALUES
(1, 2024, 3, 1),
(1, 2024, 2, 2),
(1, 2024, 4, 3),
(1, 2024, 9, 4),
(1, 2024, 1, 5),
(1, 2024, 6, 6),
(1, 2024, 5, 7),
(1, 2024, 12, 8),
(1, 2024, 7, 9),
(1, 2024, 10, 10)
ON DUPLICATE KEY UPDATE movie_id=VALUES(movie_id);
