-- =============================================
-- 在线问诊/症状自查系统 数据库脚本
-- =============================================

CREATE DATABASE IF NOT EXISTS `online_consultation` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `online_consultation`;

-- =============================================
-- 1. 症状表
-- =============================================
DROP TABLE IF EXISTS `symptoms`;
CREATE TABLE `symptoms` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT '症状名称',
  `description` TEXT COMMENT '症状描述',
  `category` VARCHAR(50) NOT NULL COMMENT '症状分类（如：呼吸系统、消化系统等）',
  `icon` VARCHAR(255) COMMENT '症状图标',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='症状表';

-- =============================================
-- 2. 疾病表
-- =============================================
DROP TABLE IF EXISTS `diseases`;
CREATE TABLE `diseases` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT '疾病名称',
  `description` TEXT COMMENT '疾病描述',
  `symptoms_summary` TEXT COMMENT '常见症状汇总',
  `severity` TINYINT NOT NULL DEFAULT 1 COMMENT '严重程度：1-轻度，2-中度，3-重度',
  `department` VARCHAR(100) NOT NULL COMMENT '建议就诊科室',
  `medical_advice` TEXT COMMENT '就医建议',
  `treatment_suggestion` TEXT COMMENT '常规治疗建议',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_severity` (`severity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='疾病表';

-- =============================================
-- 3. 症状-疾病关联表（规则引擎权重）
-- =============================================
DROP TABLE IF EXISTS `symptom_disease_rules`;
CREATE TABLE `symptom_disease_rules` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `symptom_id` INT NOT NULL COMMENT '症状ID',
  `disease_id` INT NOT NULL COMMENT '疾病ID',
  `weight` DECIMAL(5,2) NOT NULL DEFAULT 1.00 COMMENT '关联权重（0.00-5.00）',
  `is_required` TINYINT DEFAULT 0 COMMENT '是否为必要症状：0-否，1-是',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_symptom` (`symptom_id`),
  KEY `idx_disease` (`disease_id`),
  CONSTRAINT `fk_rule_symptom` FOREIGN KEY (`symptom_id`) REFERENCES `symptoms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rule_disease` FOREIGN KEY (`disease_id`) REFERENCES `diseases` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='症状疾病关联规则表';

-- =============================================
-- 4. 决策树问题表（问答式自查）
-- =============================================
DROP TABLE IF EXISTS `decision_questions`;
CREATE TABLE `decision_questions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `question_text` TEXT NOT NULL COMMENT '问题内容',
  `parent_id` INT DEFAULT NULL COMMENT '父问题ID（根节点为NULL）',
  `parent_answer` VARCHAR(100) DEFAULT NULL COMMENT '触发当前问题的父问题答案',
  `is_leaf` TINYINT DEFAULT 0 COMMENT '是否为叶子节点：0-否，1-是',
  `result_disease_ids` VARCHAR(255) DEFAULT NULL COMMENT '叶子节点关联的疾病ID列表（逗号分隔）',
  `result_description` TEXT DEFAULT NULL COMMENT '结果说明',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_parent` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='决策树问题表';

-- =============================================
-- 5. 健康知识文章表
-- =============================================
DROP TABLE IF EXISTS `health_articles`;
CREATE TABLE `health_articles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL COMMENT '文章标题',
  `summary` VARCHAR(500) DEFAULT NULL COMMENT '文章摘要',
  `content` LONGTEXT NOT NULL COMMENT '文章内容',
  `author` VARCHAR(100) DEFAULT NULL COMMENT '作者',
  `category` VARCHAR(50) NOT NULL COMMENT '文章分类',
  `cover_image` VARCHAR(255) DEFAULT NULL COMMENT '封面图片',
  `view_count` INT DEFAULT 0 COMMENT '浏览次数',
  `publish_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_publish_time` (`publish_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='健康知识文章表';

-- =============================================
-- 6. 自查历史记录表
-- =============================================
DROP TABLE IF EXISTS `consultation_history`;
CREATE TABLE `consultation_history` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` VARCHAR(100) NOT NULL COMMENT '用户标识（可用cookie生成）',
  `symptoms_selected` TEXT COMMENT '选择的症状（JSON格式）',
  `question_answers` TEXT COMMENT '问答过程（JSON格式）',
  `result_diseases` TEXT COMMENT '结果疾病列表（JSON格式）',
  `advice_given` TEXT COMMENT '给出的建议',
  `consultation_type` VARCHAR(20) NOT NULL DEFAULT 'symptom' COMMENT '自查类型：symptom-症状选择，qa-问答式',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='自查历史记录表';

-- =============================================
-- 初始化数据
-- =============================================

-- 症状数据
INSERT INTO `symptoms` (`name`, `description`, `category`, `icon`) VALUES
('发热', '体温升高，超过正常范围', '全身症状', '🤒'),
('头痛', '头部疼痛不适', '神经系统', '🤕'),
('咳嗽', '呼吸道受刺激引发的反射动作', '呼吸系统', '😷'),
('腹痛', '腹部疼痛不适', '消化系统', '🤢'),
('腹泻', '排便次数增多，粪便稀薄', '消化系统', '💩'),
('恶心呕吐', '胃部不适，有呕吐感或呕吐', '消化系统', '🤮'),
('喉咙痛', '咽喉部疼痛不适', '呼吸系统', '😣'),
('鼻塞', '鼻腔通气不畅', '呼吸系统', '👃'),
('流鼻涕', '鼻腔分泌物增多', '呼吸系统', '🤧'),
('胸闷', '胸部闷胀不适', '循环系统', '❤️'),
('胸痛', '胸部疼痛', '循环系统', '💔'),
('心悸', '心跳加快或不规律', '循环系统', '💓'),
('皮疹', '皮肤出现异常斑点或疙瘩', '皮肤系统', '🟤'),
('皮肤瘙痒', '皮肤发痒不适', '皮肤系统', '🔴'),
('关节疼痛', '关节部位疼痛', '运动系统', '🦴'),
('肌肉酸痛', '肌肉酸胀疼痛', '运动系统', '💪'),
('疲劳', '身体疲乏无力', '全身症状', '😴'),
('头晕', '头昏眼花，站立不稳', '神经系统', '😵'),
('失眠', '睡眠困难', '神经系统', '🌙'),
('尿频', '排尿次数增多', '泌尿系统', '🚽'),
('尿急', '突然有强烈的排尿欲望', '泌尿系统', '🚻'),
('尿痛', '排尿时疼痛', '泌尿系统', '🔥'),
('食欲减退', '对食物缺乏兴趣', '消化系统', '🍽️'),
('体重下降', '体重不明原因减轻', '全身症状', '⚖️');

-- 疾病数据
INSERT INTO `diseases` (`name`, `description`, `symptoms_summary`, `severity`, `department`, `medical_advice`, `treatment_suggestion`) VALUES
('普通感冒', '由病毒引起的上呼吸道感染，通常具有自限性。', '鼻塞、流鼻涕、喉咙痛、咳嗽、轻微发热、头痛、疲劳', 1, '呼吸内科', '如症状持续超过7天或加重，请及时就医。孕妇、老年人和慢性病患者应尽早就医。', '多休息，多饮水，保持室内空气流通。可使用解热镇痛药缓解发热和疼痛，抗组胺药缓解鼻塞流涕。'),
('流行性感冒', '由流感病毒引起的急性呼吸道传染病，症状较重。', '高热、头痛、肌肉酸痛、疲劳、咳嗽、喉咙痛、鼻塞', 2, '呼吸内科', '发病48小时内就医效果最佳。如出现呼吸困难、胸痛、意识模糊等危险信号，请立即就医。', '尽早使用抗病毒药物，对症治疗发热和疼痛，充分休息，补充水分。'),
('急性胃肠炎', '胃肠道黏膜的急性炎症，多由细菌或病毒感染引起。', '恶心、呕吐、腹痛、腹泻、发热、食欲减退', 2, '消化内科', '如持续呕吐、腹泻超过2天，出现脱水症状（口干、尿少、头晕），请立即就医。', '多饮水防止脱水，严重时需静脉补液。对症使用止吐、止泻药物，细菌感染时使用抗生素。'),
('急性支气管炎', '支气管黏膜的急性炎症，常由病毒或细菌感染引起。', '咳嗽、咳痰、胸闷、轻微发热、喉咙痛', 2, '呼吸内科', '如咳嗽持续超过2周，或伴有高热、呼吸困难、胸痛，请及时就医。', '多休息，多饮水。细菌感染时使用抗生素，对症使用止咳祛痰药物。'),
('肺炎', '肺部组织的感染性炎症，可由细菌、病毒或其他病原体引起。', '高热、咳嗽、咳痰（可能带血）、胸痛、胸闷、呼吸急促、疲劳', 3, '呼吸内科', '立即就医！肺炎需要及时诊断和治疗，以免病情恶化。', '根据病原体类型使用抗生素或抗病毒药物，吸氧治疗（必要时），充分休息，对症治疗。'),
('高血压', '以体循环动脉血压持续升高为特征的慢性病。', '头痛、头晕、心悸、耳鸣、视力模糊、鼻出血（严重时）', 2, '心血管内科', '定期监测血压，如血压持续高于140/90mmHg，请及时就医。', '改变生活方式（低盐饮食、规律运动、戒烟限酒），必要时服用降压药物。'),
('糖尿病', '以高血糖为特征的代谢性疾病。', '多饮、多尿、多食、体重下降、疲劳、视力模糊、伤口愈合缓慢', 2, '内分泌科', '如出现上述症状，请及时检查血糖。确诊后需长期管理。', '控制饮食，规律运动，监测血糖，必要时使用降糖药物或胰岛素治疗。'),
('过敏性鼻炎', '鼻黏膜接触过敏原后发生的炎症反应。', '阵发性喷嚏、清水样鼻涕、鼻塞、鼻痒、眼睛发痒', 1, '耳鼻喉科', '如症状严重影响生活质量，请就医确诊过敏原。', '避免接触过敏原，使用抗组胺药和鼻用糖皮质激素，必要时进行脱敏治疗。'),
('荨麻疹', '皮肤黏膜小血管扩张及渗透性增加出现的局限性水肿反应。', '皮肤瘙痒、红色或苍白色风团、皮疹此起彼伏、可伴有腹痛', 1, '皮肤科', '如出现呼吸困难、喉头水肿、血压下降等严重过敏反应，立即急救！', '寻找并避免诱因，使用抗组胺药物治疗，严重时短期使用糖皮质激素。'),
('尿路感染', '泌尿系统的细菌感染，以膀胱炎和肾盂肾炎多见。', '尿频、尿急、尿痛、下腹部不适、腰痛、发热（严重时）', 2, '泌尿外科/肾内科', '请及时就医治疗，以免感染上行导致肾盂肾炎或败血症。', '多饮水，勤排尿。根据尿培养结果选用敏感抗生素治疗，疗程要足。');

-- 症状-疾病关联规则
INSERT INTO `symptom_disease_rules` (`symptom_id`, `disease_id`, `weight`, `is_required`) VALUES
-- 普通感冒关联
(3, 1, 2.5, 0), (7, 1, 2.0, 0), (8, 1, 3.0, 0), (9, 1, 3.0, 0), (1, 1, 1.5, 0), (2, 1, 1.5, 0), (17, 1, 1.5, 0),
-- 流感关联
(1, 2, 3.5, 1), (2, 2, 2.5, 0), (16, 2, 3.0, 1), (17, 2, 2.5, 0), (3, 2, 2.0, 0), (7, 2, 2.0, 0), (8, 2, 1.5, 0),
-- 急性胃肠炎关联
(4, 3, 3.5, 0), (5, 3, 4.0, 1), (6, 3, 3.5, 0), (1, 3, 1.5, 0), (23, 3, 2.0, 0),
-- 急性支气管炎关联
(3, 4, 4.0, 1), (10, 4, 2.0, 0), (1, 4, 1.5, 0), (7, 4, 1.5, 0),
-- 肺炎关联
(1, 5, 3.0, 1), (3, 5, 3.0, 1), (11, 5, 3.5, 0), (10, 5, 3.0, 0), (17, 5, 2.0, 0),
-- 高血压关联
(2, 6, 2.5, 0), (18, 6, 2.0, 0), (12, 6, 2.5, 0),
-- 糖尿病关联
(20, 7, 2.5, 0), (21, 7, 2.0, 0), (24, 7, 3.0, 0), (17, 7, 1.5, 0),
-- 过敏性鼻炎关联
(8, 8, 3.0, 1), (9, 8, 3.0, 1), (7, 8, 2.0, 0), (14, 8, 2.5, 0),
-- 荨麻疹关联
(13, 9, 4.0, 1), (14, 9, 3.5, 1), (4, 9, 1.5, 0),
-- 尿路感染关联
(20, 10, 3.5, 1), (21, 10, 3.5, 1), (22, 10, 3.5, 1), (4, 10, 2.0, 0), (1, 10, 1.5, 0);

-- 决策树问题数据
INSERT INTO `decision_questions` (`id`, `question_text`, `parent_id`, `parent_answer`, `is_leaf`, `result_disease_ids`, `result_description`) VALUES
(1, '请问您的主要症状属于哪个系统？', NULL, NULL, 0, NULL, NULL),
(2, '您是否有发热（体温超过37.3℃）？', 1, '呼吸系统', 0, NULL, NULL),
(3, '您的咳嗽是否伴有咳痰？', 2, '是', 0, NULL, NULL),
(4, '痰的颜色是什么？', 3, '是', 0, NULL, NULL),
(5, '根据您的症状，可能是普通感冒或流行性感冒。', 4, '白色清痰', 1, '1,2', '建议多休息，多饮水，如症状加重或持续超过3天，请及时就医。'),
(6, '您的症状提示可能存在细菌感染，如肺炎或支气管炎。', 4, '黄色/绿色脓痰', 1, '4,5', '请尽快就医检查，可能需要抗生素治疗。'),
(7, '您是否有头痛、肌肉酸痛等全身症状？', 2, '是', 0, NULL, NULL),
(8, '您的症状符合流行性感冒的表现。', 7, '是', 1, '2', '建议发病48小时内就医，可使用抗病毒药物治疗。'),
(9, '您的症状可能是普通感冒。', 7, '否', 1, '1', '注意休息，多饮水，对症处理即可。'),
(10, '您是否有鼻塞、流鼻涕、打喷嚏？', 2, '否', 0, NULL, NULL),
(11, '您的症状可能是过敏性鼻炎。', 10, '是', 1, '8', '建议就医检查过敏原，避免接触过敏原。'),
(12, '您主要是咽喉痛吗？', 10, '否', 0, NULL, NULL),
(13, '您的症状可能是急性咽炎或扁桃体炎。', 12, '是', 1, '1', '多饮水，避免刺激性食物，如加重请就医。'),
(14, '您的主要症状是腹痛或腹泻吗？', 1, '消化系统', 0, NULL, NULL),
(15, '您是否有呕吐？', 14, '是', 0, NULL, NULL),
(16, '您的症状符合急性胃肠炎。', 15, '是', 1, '3', '多饮水防止脱水，如持续呕吐腹泻请就医。'),
(17, '您的症状可能是急性肠炎。', 15, '否', 1, '3', '注意饮食卫生，多饮水，必要时就医。'),
(18, '您是否有尿频、尿急、尿痛？', 1, '泌尿系统', 0, NULL, NULL),
(19, '您的症状提示尿路感染。', 18, '是', 1, '10', '请及时就医检查尿常规，需要抗生素治疗。'),
(20, '您是否有皮肤瘙痒或皮疹？', 1, '皮肤系统', 0, NULL, NULL),
(21, '您的症状可能是荨麻疹或其他过敏性皮肤病。', 20, '是', 1, '9', '如出现呼吸困难请立即就医，否则可先服用抗组胺药。'),
(22, '您是否有头痛、头晕等症状？', 1, '神经系统/全身', 0, NULL, NULL),
(23, '您的血压是否正常？', 22, '是', 0, NULL, NULL),
(24, '您的症状可能与高血压有关。', 23, '偏高', 1, '6', '请定期监测血压，如持续偏高请就医。'),
(25, '您是否有体重下降、多饮多尿？', 22, '是', 0, NULL, NULL),
(26, '您的症状提示可能有糖尿病。', 25, '是', 1, '7', '请尽快检查血糖，明确诊断。');

-- 健康知识文章数据
INSERT INTO `health_articles` (`title`, `summary`, `content`, `author`, `category`, `view_count`) VALUES
('如何正确区分普通感冒和流感', '普通感冒和流感虽然症状相似，但严重程度和治疗方法有很大区别。本文将帮助您正确区分这两种疾病。', '## 普通感冒 vs 流感\n\n普通感冒和流感都是呼吸道疾病，但由不同的病毒引起。\n\n### 普通感冒的特点\n- 症状通常较轻，发展较慢\n- 主要表现为鼻塞、流涕、喉咙痛\n- 发热一般不超过38.5℃\n- 病程约5-7天，具有自限性\n\n### 流感的特点\n- 起病急骤，症状较重\n- 高热可达39-40℃\n- 全身症状明显：头痛、肌肉酸痛、乏力\n- 可能引发严重并发症，如肺炎\n\n### 何时需要就医\n- 发热持续3天以上不退\n- 呼吸困难或胸痛\n- 剧烈咳嗽伴有脓痰\n- 意识模糊或精神状态差\n\n> 免责声明：本文仅供科普参考，不能替代专业医疗诊断。如有不适，请及时就医。', '张医生', '呼吸健康', 1250),
('胃肠道疾病的预防与护理', '急性胃肠炎是夏季常见病，了解如何预防和护理非常重要。本文为您详细介绍。', '## 急性胃肠炎的预防\n\n### 注意饮食卫生\n- 勤洗手，尤其是饭前便后\n- 食物要彻底加热煮熟\n- 避免食用过期或变质食物\n- 生熟食物要分开存放和处理\n\n### 急性胃肠炎的家庭护理\n1. **补充水分**：多喝温开水或口服补液盐，防止脱水\n2. **饮食调整**：先进食流质食物，逐渐过渡到正常饮食\n3. **休息充分**：保证充足的休息时间\n4. **观察病情**：注意体温、排便情况，如有加重及时就医\n\n### 需要立即就医的情况\n- 持续呕吐超过24小时\n- 腹泻超过2天\n- 出现脱水症状：口干、尿少、皮肤弹性差\n- 腹痛剧烈或便血\n\n> 免责声明：本文仅供科普参考，不能替代专业医疗诊断。如有不适，请及时就医。', '李医生', '消化健康', 980),
('高血压患者的日常管理', '高血压是常见的慢性病，良好的日常管理对于控制血压、预防并发症至关重要。', '## 高血压的诊断标准\n\n在未使用降压药物的情况下，非同日3次测量诊室血压，收缩压≥140mmHg和/或舒张压≥90mmHg，可诊断为高血压。\n\n## 日常生活管理\n\n### 饮食调整\n- **低盐饮食**：每日食盐摄入量不超过5克\n- **低脂饮食**：减少动物脂肪和胆固醇摄入\n- **增加蔬果**：多吃新鲜蔬菜和水果\n- **限制饮酒**：最好戒酒，如饮酒应少量\n\n### 运动管理\n- 每周进行150分钟中等强度有氧运动\n- 可选择快走、慢跑、游泳、骑车等\n- 避免剧烈运动和竞技性运动\n\n### 血压监测\n- 建议家庭自备电子血压计\n- 每天固定时间测量并记录\n- 定期到医院进行专业检查\n\n> 免责声明：本文仅供科普参考，不能替代专业医疗诊断。如有不适，请及时就医。', '王医生', '心血管', 2100),
('糖尿病的早期信号与筛查', '糖尿病的早期症状往往不明显，了解早期信号有助于及早发现和治疗。', '## 糖尿病的典型症状\n\n### \"三多一少\"\n1. **多饮**：经常感到口渴，饮水量明显增加\n2. **多尿**：排尿次数和尿量增多\n3. **多食**：经常感到饥饿，食量增加\n4. **体重下降**：不明原因的体重减轻\n\n### 其他早期信号\n- 疲劳乏力\n- 视力模糊\n- 伤口愈合缓慢\n- 皮肤瘙痒\n- 反复感染\n\n## 糖尿病的筛查\n\n建议以下人群定期筛查血糖：\n- 年龄超过40岁\n- 超重或肥胖\n- 有糖尿病家族史\n- 高血压或高血脂患者\n- 多囊卵巢综合征患者\n\n筛查项目包括：\n- 空腹血糖\n- 餐后2小时血糖\n- 糖化血红蛋白（HbA1c）\n\n> 免责声明：本文仅供科普参考，不能替代专业医疗诊断。如有不适，请及时就医。', '赵医生', '内分泌', 1560),
('常见过敏性疾病的防治', '过敏性疾病影响着全球约20%的人口，了解如何预防和治疗非常重要。', '## 常见的过敏性疾病\n\n### 1. 过敏性鼻炎\n- **症状**：阵发性喷嚏、清水样鼻涕、鼻塞、鼻痒\n- **常见过敏原**：花粉、尘螨、动物皮屑、霉菌\n- **治疗**：抗组胺药、鼻用糖皮质激素、脱敏治疗\n\n### 2. 荨麻疹\n- **症状**：皮肤瘙痒、红色风团、此起彼伏\n- **诱因**：食物、药物、感染、物理因素\n- **治疗**：抗组胺药、糖皮质激素（严重时）\n\n### 3. 过敏性皮炎\n- **症状**：皮肤红斑、丘疹、水疱、瘙痒\n- **诱因**：接触过敏原、食物过敏\n- **治疗**：避免过敏原、外用糖皮质激素、口服抗组胺药\n\n## 预防措施\n1. 明确过敏原并避免接触\n2. 保持室内清洁，减少尘螨\n3. 花粉季节减少外出，外出戴口罩\n4. 增强体质，规律作息\n\n> 免责声明：本文仅供科普参考，不能替代专业医疗诊断。如有不适，请及时就医。', '刘医生', '皮肤健康', 1890);

-- =============================================
-- 免责声明说明
-- =============================================
-- 本系统提供的诊断结果仅供参考，不能替代专业医疗诊断。
-- 如有身体不适，请及时到正规医疗机构就诊。
