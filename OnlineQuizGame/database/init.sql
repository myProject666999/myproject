CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    nickname VARCHAR(50) NOT NULL,
    avatar VARCHAR(255) DEFAULT '',
    total_score INT DEFAULT 0,
    total_games INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_total_score (total_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    icon VARCHAR(255) DEFAULT '',
    description VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    question_text TEXT NOT NULL,
    option_a VARCHAR(500) NOT NULL,
    option_b VARCHAR(500) NOT NULL,
    option_c VARCHAR(500) NOT NULL,
    option_d VARCHAR(500) NOT NULL,
    correct_answer CHAR(1) NOT NULL,
    explanation TEXT,
    difficulty TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category_id (category_id),
    INDEX idx_difficulty (difficulty),
    CONSTRAINT chk_correct_answer CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
    CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS game_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category_id INT DEFAULT NULL,
    total_questions INT DEFAULT 0,
    correct_count INT DEFAULT 0,
    score INT DEFAULT 0,
    max_combo INT DEFAULT 0,
    start_time TIMESTAMP NULL,
    end_time TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_score (score),
    CONSTRAINT fk_game_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_game_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS answer_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    game_record_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    user_answer CHAR(1) DEFAULT NULL,
    is_correct TINYINT DEFAULT 0,
    time_spent INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_game_record_id (game_record_id),
    INDEX idx_question_id (question_id),
    CONSTRAINT fk_detail_game FOREIGN KEY (game_record_id) REFERENCES game_records(id) ON DELETE CASCADE,
    CONSTRAINT fk_detail_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    CONSTRAINT chk_user_answer CHECK (user_answer IS NULL OR user_answer IN ('A', 'B', 'C', 'D'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO categories (name, icon, description) VALUES
('科学知识', '🔬', '涵盖物理、化学、生物等科学领域'),
('历史文化', '📜', '中国及世界历史文化知识'),
('地理常识', '🌍', '地理知识与自然奇观'),
('文学艺术', '🎨', '文学作品与艺术常识'),
('体育竞技', '⚽', '体育运动与竞技知识'),
('生活百科', '🏠', '日常生活小常识');

INSERT INTO questions (category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty) VALUES
(1, '水的化学式是什么？', 'H2O', 'CO2', 'NaCl', 'O2', 'A', '水是由两个氢原子和一个氧原子组成的，化学式为H2O。', 1),
(1, '地球围绕什么天体运转？', '月亮', '太阳', '火星', '银河系中心', 'B', '地球是太阳系的行星之一，围绕太阳公转。', 1),
(1, '光在真空中的传播速度约为多少？', '3×10⁵ km/s', '3×10⁸ km/s', '3×10⁵ m/s', '3×10⁸ m/s', 'D', '光在真空中的传播速度约为每秒30万公里，即3×10⁸米/秒。', 2),
(1, '人体最大的器官是什么？', '心脏', '肝脏', '皮肤', '大脑', 'C', '皮肤是人体最大的器官，成年人的皮肤面积约为1.5-2平方米。', 1),
(1, 'DNA的全称是什么？', '脱氧核糖核酸', '核糖核酸', '氨基酸', '蛋白质', 'A', 'DNA是脱氧核糖核酸的英文缩写，是遗传信息的载体。', 2),
(2, '中国历史上第一个统一的封建王朝是？', '商朝', '周朝', '秦朝', '汉朝', 'C', '公元前221年，秦始皇统一六国，建立了中国历史上第一个统一的封建王朝——秦朝。', 1),
(2, '《红楼梦》的作者是谁？', '施耐庵', '罗贯中', '吴承恩', '曹雪芹', 'D', '《红楼梦》是清代作家曹雪芹创作的长篇小说，是中国古典四大名著之首。', 1),
(2, '唐朝的开国皇帝是谁？', '李世民', '李渊', '李隆基', '李治', 'B', '唐朝的开国皇帝是李渊，他于公元618年建立唐朝，定都长安。', 2),
(2, '四大发明不包括以下哪一项？', '造纸术', '印刷术', '火药', '地动仪', 'D', '中国古代四大发明是：造纸术、印刷术、火药和指南针。', 1),
(2, '故宫是哪个朝代开始建造的？', '宋朝', '元朝', '明朝', '清朝', 'C', '故宫又称紫禁城，始建于明朝永乐年间（1406年），历时14年建成。', 2),
(3, '世界上最大的海洋是？', '大西洋', '印度洋', '太平洋', '北冰洋', 'C', '太平洋是世界上最大、最深的海洋，面积约1.65亿平方公里。', 1),
(3, '世界上最长的河流是？', '长江', '尼罗河', '亚马逊河', '密西西比河', 'B', '尼罗河是世界上最长的河流，全长约6650公里，流经非洲11个国家。', 1),
(3, '珠穆朗玛峰的海拔约为多少米？', '8848米', '8844米', '8888米', '8800米', 'A', '珠穆朗玛峰是世界最高峰，海拔约8848.86米（2020年中国测量数据）。', 1),
(3, '中国最大的淡水湖是？', '洞庭湖', '鄱阳湖', '太湖', '洪泽湖', 'B', '鄱阳湖是中国最大的淡水湖，位于江西省北部，面积约3150平方公里。', 2),
(3, '世界上最大的沙漠是？', '戈壁沙漠', '撒哈拉沙漠', '阿拉伯沙漠', '塔克拉玛干沙漠', 'B', '撒哈拉沙漠是世界上最大的热带荒漠，面积约906万平方公里。', 1),
(4, '《蒙娜丽莎》的作者是谁？', '梵高', '毕加索', '达芬奇', '米开朗基罗', 'C', '《蒙娜丽莎》是意大利文艺复兴时期画家列奥纳多·达·芬奇的代表作。', 1),
(4, '中国第一部诗歌总集是？', '《诗经》', '《楚辞》', '《唐诗三百首》', '《乐府诗集》', 'A', '《诗经》是中国第一部诗歌总集，收录了西周至春秋时期的诗歌305篇。', 1),
(4, '床前明月光的下一句是？', '举头望明月', '低头思故乡', '疑是地上霜', '月是故乡明', 'C', '这是李白《静夜思》的诗句：床前明月光，疑是地上霜。举头望明月，低头思故乡。', 1),
(4, '交响乐通常由几个乐章组成？', '两个', '三个', '四个', '五个', 'C', '古典交响曲通常由四个乐章组成，这一形式由海顿确立并完善。', 2),
(4, '京剧的四大行当不包括以下哪一项？', '生', '旦', '净', '武', 'D', '京剧四大行当是：生（男性角色）、旦（女性角色）、净（花脸）、丑（喜剧角色）。', 2),
(5, '现代足球起源于哪个国家？', '中国', '英国', '巴西', '意大利', 'B', '现代足球起源于19世纪中叶的英国，1863年英格兰足球协会成立标志着现代足球的诞生。', 2),
(5, '奥运会多少年举办一届？', '2年', '3年', '4年', '5年', 'C', '现代奥运会自1896年起，每4年举办一届（因两次世界大战曾中断）。', 1),
(5, 'NBA单场得分纪录由谁保持？', '乔丹', '科比', '张伯伦', '詹姆斯', 'C', 'NBA单场得分纪录由威尔特·张伯伦保持，他在1962年3月2日得到100分。', 2),
(5, '乒乓球是从哪个国家传入中国的？', '美国', '英国', '日本', '法国', 'C', '乒乓球于1904年由日本传入中国，最初在上海等地流行。', 2),
(5, '世界上第一个举办现代奥运会的城市是？', '巴黎', '伦敦', '雅典', '罗马', 'C', '第一届现代奥林匹克运动会于1896年在希腊雅典举行。', 1),
(6, '煮鸡蛋时，鸡蛋煮多久最合适？', '3-5分钟', '5-7分钟', '8-10分钟', '12-15分钟', 'C', '煮鸡蛋一般8-10分钟为宜，这样蛋黄凝固但不过硬，营养保留较好。', 1),
(6, '手机电池充满后继续充电会怎样？', '损坏电池', '电池爆炸', '自动停止充电', '耗电更快', 'C', '现代手机都有智能充电管理系统，电池充满后会自动停止充电，不会造成损害。', 1),
(6, '下列哪种食物富含维生素C？', '鸡蛋', '牛奶', '橙子', '米饭', 'C', '橙子等柑橘类水果富含维生素C，是补充维生素C的良好来源。', 1),
(6, '正常成年人每天应该喝多少水？', '500-1000毫升', '1000-1500毫升', '1500-2000毫升', '3000毫升以上', 'C', '正常成年人每天建议饮水量为1500-2000毫升，约8杯水。', 1),
(6, '睡觉前不宜做以下哪件事？', '阅读', '听轻音乐', '剧烈运动', '冥想', 'C', '睡前剧烈运动会使身体兴奋，影响睡眠质量，建议睡前1-2小时避免剧烈运动。', 1);

INSERT INTO users (username, nickname, avatar, total_score, total_games) VALUES
('player001', '答题达人', 'https://api.dicebear.com/7.x/avataaars/svg?seed=player001', 2850, 15),
('player002', '学霸', 'https://api.dicebear.com/7.x/avataaars/svg?seed=player002', 2300, 12),
('player003', '知识王者', 'https://api.dicebear.com/7.x/avataaars/svg?seed=player003', 1980, 10),
('player004', '挑战者', 'https://api.dicebear.com/7.x/avataaars/svg?seed=player004', 1560, 8),
('player005', '新秀', 'https://api.dicebear.com/7.x/avataaars/svg?seed=player005', 890, 5);
