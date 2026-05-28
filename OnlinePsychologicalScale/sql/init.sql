CREATE DATABASE IF NOT EXISTS psych_scale
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE psych_scale;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS answer_details;
DROP TABLE IF EXISTS answer_sessions;
DROP TABLE IF EXISTS scale_scoring_rules;
DROP TABLE IF EXISTS scale_interpretations;
DROP TABLE IF EXISTS scale_questions;
DROP TABLE IF EXISTS scale_options;
DROP TABLE IF EXISTS scales;
DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS resource_categories;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nickname VARCHAR(50) DEFAULT '',
  email VARCHAR(100) DEFAULT '',
  phone VARCHAR(20) DEFAULT '',
  avatar_url VARCHAR(500) DEFAULT '',
  is_active TINYINT(1) DEFAULT 1,
  last_login_at DATETIME DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

CREATE TABLE scales (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  short_name VARCHAR(50) DEFAULT '',
  description TEXT,
  instructions TEXT,
  category VARCHAR(50) DEFAULT '',
  min_score INT DEFAULT 0,
  max_score INT DEFAULT 0,
  estimated_minutes INT DEFAULT 5,
  `version` VARCHAR(20) DEFAULT '1.0',
  source VARCHAR(255) DEFAULT '',
  reference VARCHAR(500) DEFAULT '',
  is_active TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_is_active (is_active),
  INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='量表主表';

CREATE TABLE scale_questions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  scale_id INT UNSIGNED NOT NULL,
  question_number INT NOT NULL,
  question_text TEXT NOT NULL,
  question_hint TEXT,
  is_required TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (scale_id) REFERENCES scales(id) ON DELETE CASCADE,
  INDEX idx_scale_id (scale_id),
  INDEX idx_sort_order (scale_id, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='量表题目表';

CREATE TABLE scale_options (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  question_id INT UNSIGNED NOT NULL,
  option_value INT NOT NULL,
  option_text VARCHAR(200) NOT NULL,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (question_id) REFERENCES scale_questions(id) ON DELETE CASCADE,
  INDEX idx_question_id (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='量表选项表';

CREATE TABLE scale_scoring_rules (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  scale_id INT UNSIGNED NOT NULL,
  rule_name VARCHAR(100) NOT NULL,
  rule_type ENUM('total', 'subscale', 'special') DEFAULT 'total',
  subscale_name VARCHAR(100) DEFAULT '',
  calculation_method ENUM('sum', 'average', 'weighted_sum', 'count') DEFAULT 'sum',
  included_questions VARCHAR(255) DEFAULT '',
  weight_formula VARCHAR(500) DEFAULT '',
  description TEXT,
  source VARCHAR(500) DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (scale_id) REFERENCES scales(id) ON DELETE CASCADE,
  INDEX idx_scale_id (scale_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='计分规则表';

CREATE TABLE scale_interpretations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  scale_id INT UNSIGNED NOT NULL,
  rule_id INT UNSIGNED DEFAULT NULL,
  min_score DECIMAL(8,2) NOT NULL,
  max_score DECIMAL(8,2) NOT NULL,
  severity_level VARCHAR(50) NOT NULL,
  severity_color VARCHAR(20) DEFAULT '#52c41a',
  interpretation TEXT NOT NULL,
  suggestion TEXT,
  is_high_risk TINYINT(1) DEFAULT 0,
  referral_prompt TEXT,
  disclaimer TEXT,
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (scale_id) REFERENCES scales(id) ON DELETE CASCADE,
  FOREIGN KEY (rule_id) REFERENCES scale_scoring_rules(id) ON DELETE SET NULL,
  INDEX idx_scale_id (scale_id),
  INDEX idx_score_range (scale_id, min_score, max_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='量表结果解读表';

CREATE TABLE answer_sessions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_uuid CHAR(36) NOT NULL UNIQUE,
  user_id INT UNSIGNED DEFAULT NULL,
  scale_id INT UNSIGNED NOT NULL,
  status ENUM('in_progress', 'completed', 'abandoned') DEFAULT 'in_progress',
  total_score DECIMAL(8,2) DEFAULT NULL,
  severity_level VARCHAR(50) DEFAULT '',
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME DEFAULT NULL,
  duration_seconds INT DEFAULT 0,
  ip_address VARCHAR(45) DEFAULT '',
  user_agent VARCHAR(500) DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (scale_id) REFERENCES scales(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_scale_id (scale_id),
  INDEX idx_session_uuid (session_uuid),
  INDEX idx_status (status),
  INDEX idx_completed_at (completed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='作答会话表';

CREATE TABLE answer_details (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id INT UNSIGNED NOT NULL,
  question_id INT UNSIGNED NOT NULL,
  option_id INT UNSIGNED DEFAULT NULL,
  option_value INT DEFAULT NULL,
  answer_text TEXT,
  answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES answer_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES scale_questions(id) ON DELETE CASCADE,
  FOREIGN KEY (option_id) REFERENCES scale_options(id) ON DELETE SET NULL,
  UNIQUE KEY uk_session_question (session_id, question_id),
  INDEX idx_session_id (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='作答详情表';

CREATE TABLE resource_categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(100) DEFAULT '',
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='资源分类表';

CREATE TABLE resources (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id INT UNSIGNED DEFAULT NULL,
  title VARCHAR(200) NOT NULL,
  summary TEXT,
  content TEXT,
  resource_type ENUM('article', 'video', 'audio', 'link', 'hotline') DEFAULT 'article',
  cover_image VARCHAR(500) DEFAULT '',
  external_url VARCHAR(500) DEFAULT '',
  phone_number VARCHAR(50) DEFAULT '',
  tags VARCHAR(500) DEFAULT '',
  author VARCHAR(100) DEFAULT '',
  source VARCHAR(200) DEFAULT '',
  view_count INT UNSIGNED DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  published_at DATETIME DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES resource_categories(id) ON DELETE SET NULL,
  INDEX idx_category (category_id),
  INDEX idx_type (resource_type),
  INDEX idx_is_active (is_active),
  INDEX idx_published_at (published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='科普资源表';

INSERT INTO scales (code, name, short_name, description, instructions, category, min_score, max_score, estimated_minutes, version, source, reference, is_active, sort_order) VALUES
('PHQ-9', '患者健康问卷抑郁量表', 'PHQ-9',
 'PHQ-9是由Kroenke等人于2001年开发的自评量表，用于筛查和评估抑郁症状的严重程度。该量表基于DSM-IV抑郁诊断标准，共9个条目，广泛用于临床和科研。',
 '在过去两个星期内，您有多少时候受到以下问题的困扰？请选择最符合您情况的选项。',
 '抑郁', 0, 27, 3, '1.0',
 'Kroenke K, Spitzer RL, Williams JBW',
 'Kroenke K, Spitzer RL, Williams JBW. The PHQ-9: validity of a brief depression severity measure. J Gen Intern Med. 2001;16(9):606-613.',
 1, 1),

('GAD-7', '广泛性焦虑量表', 'GAD-7',
 'GAD-7是由Spitzer等人于2006年开发的自评量表，用于筛查和评估广泛性焦虑症状的严重程度。共7个条目，具有良好的信效度。',
 '在过去两个星期内，您有多少时候受到以下问题的困扰？请选择最符合您情况的选项。',
 '焦虑', 0, 21, 3, '1.0',
 'Spitzer RL, Kroenke K, Williams JBW, Löwe B',
 'Spitzer RL, Kroenke K, Williams JBW, Löwe B. A brief measure for assessing generalized anxiety disorder: the GAD-7. Arch Intern Med. 2006;166(10):1092-1097.',
 1, 2),

('PHQ-15', '患者健康问卷躯体症状量表', 'PHQ-15',
 'PHQ-15用于评估躯体症状的严重程度，涵盖15个常见躯体症状，广泛用于初级保健和心身医学领域。',
 '在过去一个月内，您是否受到以下症状的困扰？请选择最符合您情况的选项。',
 '躯体症状', 0, 30, 5, '1.0',
 'Kroenke K, Spitzer RL, Williams JBW',
 'Kroenke K, Spitzer RL, Williams JBW. The PHQ-15: validity of a brief symptom severity measure. Psychosom Med. 2002;64(2):258-266.',
 1, 3),

('PSQI', '匹兹堡睡眠质量指数', 'PSQI',
 'PSQI由Buysse等人于1989年开发，用于评估过去一个月的睡眠质量，包含7个因子，广泛用于睡眠障碍筛查。',
 '请根据您过去一个月的实际情况回答以下问题。',
 '睡眠', 0, 21, 10, '1.0',
 'Buysse DJ, Reynolds CF, Monk TH, Berman SR, Kupfer DJ',
 'Buysse DJ, et al. The Pittsburgh Sleep Quality Index: a new instrument for psychiatric practice and research. Psychiatry Res. 1989;28(2):193-213.',
 1, 4),

('PSS-10', '知觉压力量表', 'PSS-10',
 'PSS-10由Cohen等人于1983年开发，用于评估个体对生活压力的主观感受，共10个条目，是全球最常用的压力评估工具之一。',
 '请根据您过去一个月的感受，回答以下问题。',
 '压力', 0, 40, 5, '1.0',
 'Cohen S, Kamarck T, Mermelstein R',
 'Cohen S, Kamarck T, Mermelstein R. A global measure of perceived stress. J Health Soc Behav. 1983;24(4):385-396.',
 1, 5),

('ISI', '失眠严重指数', 'ISI',
 'ISI由Morin等人于2011年开发，用于评估失眠症状的严重程度，共7个条目，简短高效，适合临床快速筛查。',
 '请根据您过去两周的情况回答以下问题。',
 '睡眠', 0, 28, 3, '1.0',
 'Morin CM, Belleville G, Bélanger L, Ivers H',
 'Morin CM, et al. The Insomnia Severity Index: psychometric indicators to detect insomnia cases and evaluate treatment response. Sleep. 2011;34(5):601-608.',
 1, 6);

-- PHQ-9 题目
INSERT INTO scale_questions (scale_id, question_number, question_text, sort_order) VALUES
(1, 1, '做事时提不起劲或没有兴趣', 1),
(1, 2, '感到心情低落、沮丧或绝望', 2),
(1, 3, '入睡困难、睡不安稳或睡眠过多', 3),
(1, 4, '感觉疲倦或没有活力', 4),
(1, 5, '食欲不振或吃太多', 5),
(1, 6, '觉得自己很糟，或觉得自己很失败，或让自己和家人失望', 6),
(1, 7, '对事物专注有困难，例如看报纸或看电视', 7),
(1, 8, '动作或说话速度缓慢到别人已经察觉，或正好相反——烦躁不安、动来动去的情况更胜于平常', 8),
(1, 9, '有不如死掉或用某种方式伤害自己的念头', 9);

-- PHQ-9 选项（每题相同：0=完全不会，1=好几天，2=超过一半的天数，3=几乎每天）
INSERT INTO scale_options (question_id, option_value, option_text, sort_order) VALUES
(1, 0, '完全不会', 0), (1, 1, '好几天', 1), (1, 2, '超过一半的天数', 2), (1, 3, '几乎每天', 3),
(2, 0, '完全不会', 0), (2, 1, '好几天', 1), (2, 2, '超过一半的天数', 2), (2, 3, '几乎每天', 3),
(3, 0, '完全不会', 0), (3, 1, '好几天', 1), (3, 2, '超过一半的天数', 2), (3, 3, '几乎每天', 3),
(4, 0, '完全不会', 0), (4, 1, '好几天', 1), (4, 2, '超过一半的天数', 2), (4, 3, '几乎每天', 3),
(5, 0, '完全不会', 0), (5, 1, '好几天', 1), (5, 2, '超过一半的天数', 2), (5, 3, '几乎每天', 3),
(6, 0, '完全不会', 0), (6, 1, '好几天', 1), (6, 2, '超过一半的天数', 2), (6, 3, '几乎每天', 3),
(7, 0, '完全不会', 0), (7, 1, '好几天', 1), (7, 2, '超过一半的天数', 2), (7, 3, '几乎每天', 3),
(8, 0, '完全不会', 0), (8, 1, '好几天', 1), (8, 2, '超过一半的天数', 2), (8, 3, '几乎每天', 3),
(9, 0, '完全不会', 0), (9, 1, '好几天', 1), (9, 2, '超过一半的天数', 2), (9, 3, '几乎每天', 3);

-- GAD-7 题目
INSERT INTO scale_questions (scale_id, question_number, question_text, sort_order) VALUES
(2, 1, '感到紧张、不安或急切', 1),
(2, 2, '不能够停止或控制担忧', 2),
(2, 3, '对各种各样的事情担忧过多', 3),
(2, 4, '很难放松下来', 4),
(2, 5, '由于不安而无法静坐', 5),
(2, 6, '变得容易烦恼或急躁', 6),
(2, 7, '感到似乎将有可怕的事情发生而害怕', 7);

-- GAD-7 选项
INSERT INTO scale_options (question_id, option_value, option_text, sort_order) VALUES
(10, 0, '完全不会', 0), (10, 1, '好几天', 1), (10, 2, '超过一半的天数', 2), (10, 3, '几乎每天', 3),
(11, 0, '完全不会', 0), (11, 1, '好几天', 1), (11, 2, '超过一半的天数', 2), (11, 3, '几乎每天', 3),
(12, 0, '完全不会', 0), (12, 1, '好几天', 1), (12, 2, '超过一半的天数', 2), (12, 3, '几乎每天', 3),
(13, 0, '完全不会', 0), (13, 1, '好几天', 1), (13, 2, '超过一半的天数', 2), (13, 3, '几乎每天', 3),
(14, 0, '完全不会', 0), (14, 1, '好几天', 1), (14, 2, '超过一半的天数', 2), (14, 3, '几乎每天', 3),
(15, 0, '完全不会', 0), (15, 1, '好几天', 1), (15, 2, '超过一半的天数', 2), (15, 3, '几乎每天', 3),
(16, 0, '完全不会', 0), (16, 1, '好几天', 1), (16, 2, '超过一半的天数', 2), (16, 3, '几乎每天', 3);

-- PHQ-15 题目
INSERT INTO scale_questions (scale_id, question_number, question_text, sort_order) VALUES
(3, 1, '胃痛', 1),
(3, 2, '背痛', 2),
(3, 3, '手臂、腿或关节疼痛（风湿性关节炎除外）', 3),
(3, 4, '月经疼痛或相关问题（女性填写）', 4),
(3, 5, '胸痛', 5),
(3, 6, '头晕', 6),
(3, 7, '晕厥发作', 7),
(3, 8, '心脏扑动或跳动加速', 8),
(3, 9, '呼吸急促', 9),
(3, 10, '性欲减退或性交疼痛', 10),
(3, 11, '便秘或肠道不适', 11),
(3, 12, '恶心、排气或消化不良', 12),
(3, 13, '感觉疲倦或精力不足', 13),
(3, 14, '睡眠障碍', 14),
(3, 15, '头痛', 15);

-- PHQ-15 选项
INSERT INTO scale_options (question_id, option_value, option_text, sort_order)
SELECT q.id, v, t, v
FROM (
  SELECT 3 as sid, 1 as qn UNION SELECT 3,2 UNION SELECT 3,3 UNION SELECT 3,4 UNION
  SELECT 3,5 UNION SELECT 3,6 UNION SELECT 3,7 UNION SELECT 3,8 UNION
  SELECT 3,9 UNION SELECT 3,10 UNION SELECT 3,11 UNION SELECT 3,12 UNION
  SELECT 3,13 UNION SELECT 3,14 UNION SELECT 3,15
) nums
JOIN scale_questions q ON q.scale_id = nums.sid AND q.question_number = nums.qn
CROSS JOIN (
  SELECT 0 as v, '没有困扰' as t UNION
  SELECT 1, '有一点困扰' UNION
  SELECT 2, '很受困扰'
) opts;

-- PSQI 题目（匹兹堡睡眠质量指数，共19题，其中5-19项计分）
INSERT INTO scale_questions (scale_id, question_number, question_text, question_hint, sort_order) VALUES
(4, 1, '近一个月，您通常几点上床睡觉？', '请填写时间，如：22:30', 1),
(4, 2, '近一个月，您通常需要多长时间才能入睡？', '请填写分钟数，如：30', 2),
(4, 3, '近一个月，您通常几点起床？', '请填写时间，如：7:00', 3),
(4, 4, '近一个月，您每晚实际睡眠时间有多少小时？', '请填写小时数，如：6.5', 4),
(4, 5, '近一个月，您因为入睡困难（30分钟内不能入睡）而影响睡眠的频率是？', '', 5),
(4, 6, '近一个月，您因为半夜醒来而影响睡眠的频率是？', '', 6),
(4, 7, '近一个月，您因为早上起得太早而影响睡眠的频率是？', '', 7),
(4, 8, '近一个月，您因为睡眠质量不好（如睡眠不深、多梦）而影响睡眠的频率是？', '', 8),
(4, 9, '近一个月，您因为咳嗽、打鼾而影响睡眠的频率是？', '', 9),
(4, 10, '近一个月，您因为感觉寒冷而影响睡眠的频率是？', '', 10),
(4, 11, '近一个月，您因为感觉燥热而影响睡眠的频率是？', '', 11),
(4, 12, '近一个月，您因为做噩梦而影响睡眠的频率是？', '', 12),
(4, 13, '近一个月，您因为疼痛而影响睡眠的频率是？', '', 13),
(4, 14, '近一个月，您因为其他原因（请注明）而影响睡眠的频率是？', '如有请说明', 14),
(4, 15, '近一个月，您对自己的睡眠质量总体评价如何？', '', 15),
(4, 16, '近一个月，您服用安眠药物（包括医嘱和自行服用）的频率是？', '', 16),
(4, 17, '近一个月，您在白天感到困倦、想睡觉的频率是？', '', 17),
(4, 18, '近一个月，您在白天做事时精力不足的频率是？', '', 18),
(4, 19, '近一个月，您在开车或吃饭等日常活动中难以保持清醒的频率是？', '', 19);

-- PSQI 选项（第5-19题使用0-3分选项，第1-4题为填空题不计入选项表）
INSERT INTO scale_options (question_id, option_value, option_text, sort_order)
SELECT q.id, v, t, v
FROM (
  SELECT 4 as sid, 5 as qn UNION SELECT 4,6 UNION SELECT 4,7 UNION SELECT 4,8 UNION
  SELECT 4,9 UNION SELECT 4,10 UNION SELECT 4,11 UNION SELECT 4,12 UNION
  SELECT 4,13 UNION SELECT 4,14 UNION SELECT 4,15 UNION SELECT 4,16 UNION
  SELECT 4,17 UNION SELECT 4,18 UNION SELECT 4,19
) nums
JOIN scale_questions q ON q.scale_id = nums.sid AND q.question_number = nums.qn
CROSS JOIN (
  SELECT 0 as v, '无' as t UNION
  SELECT 1, '每周少于1次' UNION
  SELECT 2, '每周1-2次' UNION
  SELECT 3, '每周3次或以上'
) opts
WHERE nums.qn NOT IN (15)
UNION ALL
SELECT q.id, v, t, v
FROM scale_questions q
CROSS JOIN (
  SELECT 0 as v, '很好' as t UNION
  SELECT 1, '较好' UNION
  SELECT 2, '较差' UNION
  SELECT 3, '很差'
) opts
WHERE q.scale_id = 4 AND q.question_number = 15;

-- PSS-10 题目
INSERT INTO scale_questions (scale_id, question_number, question_text, sort_order) VALUES
(5, 1, '因为意外发生的事情而感到心烦意乱', 1),
(5, 2, '感觉无法控制生活中重要的事情', 2),
(5, 3, '感到紧张和压力', 3),
(5, 4, '对处理个人事务的能力感到有信心', 4),
(5, 5, '觉得事情进展顺利', 5),
(5, 6, '发现自己无法应付所有必须要做的事情', 6),
(5, 7, '能够控制生活中的恼人事件', 7),
(5, 8, '觉得一切尽在掌握', 8),
(5, 9, '因为超出自己控制的事情而生气', 9),
(5, 10, '觉得困难堆积如山无法克服', 10);

-- PSS-10 选项
INSERT INTO scale_options (question_id, option_value, option_text, sort_order)
SELECT q.id, v, t, v
FROM (
  SELECT 5 as sid, 1 as qn UNION SELECT 5,2 UNION SELECT 5,3 UNION SELECT 5,4 UNION
  SELECT 5,5 UNION SELECT 5,6 UNION SELECT 5,7 UNION SELECT 5,8 UNION
  SELECT 5,9 UNION SELECT 5,10
) nums
JOIN scale_questions q ON q.scale_id = nums.sid AND q.question_number = nums.qn
CROSS JOIN (
  SELECT 0 as v, '从不' as t UNION
  SELECT 1, '偶尔' UNION
  SELECT 2, '有时' UNION
  SELECT 3, '经常' UNION
  SELECT 4, '总是'
) opts;

-- ISI 题目
INSERT INTO scale_questions (scale_id, question_number, question_text, sort_order) VALUES
(6, 1, '描述您当前失眠问题的严重程度：入睡困难', 1),
(6, 2, '描述您当前失眠问题的严重程度：维持睡眠困难', 2),
(6, 3, '描述您当前失眠问题的严重程度：早醒', 3),
(6, 4, '您对目前睡眠模式的满意程度如何？', 4),
(6, 5, '您的睡眠问题在多大程度上影响了您的日间功能？', 5),
(6, 6, '与其他人相比，您的睡眠问题对生活质量的影响程度如何？', 6),
(6, 7, '您对自己睡眠问题的担忧程度如何？', 7);

-- ISI 选项
INSERT INTO scale_options (question_id, option_value, option_text, sort_order)
SELECT q.id, v, t, v
FROM (
  SELECT 6 as sid, 1 as qn UNION SELECT 6,2 UNION SELECT 6,3 UNION SELECT 6,4 UNION
  SELECT 6,5 UNION SELECT 6,6 UNION SELECT 6,7
) nums
JOIN scale_questions q ON q.scale_id = nums.sid AND q.question_number = nums.qn
CROSS JOIN (
  SELECT 0 as v, '无' as t UNION
  SELECT 1, '轻度' UNION
  SELECT 2, '中度' UNION
  SELECT 3, '重度'
) opts;

-- PHQ-9 计分规则
INSERT INTO scale_scoring_rules (scale_id, rule_name, rule_type, calculation_method, included_questions, description, source) VALUES
(1, '总分', 'total', 'sum', '1,2,3,4,5,6,7,8,9', '将9个条目的得分相加，总分范围0-27分。第9题（自伤意念）不计入总分但需单独评估风险。', 'Kroenke K, et al. J Gen Intern Med. 2001'),
(1, '自伤风险评估', 'special', 'count', '9', '第9题如有任何得分（≥1分），需特别关注自伤/自杀风险。', 'Kroenke K, et al. J Gen Intern Med. 2001');

-- GAD-7 计分规则
INSERT INTO scale_scoring_rules (scale_id, rule_name, rule_type, calculation_method, included_questions, description, source) VALUES
(2, '总分', 'total', 'sum', '1,2,3,4,5,6,7', '将7个条目的得分相加，总分范围0-21分。', 'Spitzer RL, et al. Arch Intern Med. 2006');

-- PHQ-15 计分规则
INSERT INTO scale_scoring_rules (scale_id, rule_name, rule_type, calculation_method, included_questions, description, source) VALUES
(3, '总分', 'total', 'sum', '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15', '将15个条目得分相加，总分范围0-30分。第4题（月经问题）男性选择"没有困扰"计0分。', 'Kroenke K, et al. Psychosom Med. 2002');

-- PSQI 计分规则
INSERT INTO scale_scoring_rules (scale_id, rule_name, rule_type, calculation_method, included_questions, description, source) VALUES
(4, '总分', 'total', 'sum', '5,6,7,8,9,10,11,12,13,14,15,16,17,18,19', 'PSQI共7个因子，总分范围0-21分。因子1睡眠质量（第15题）、因子2入睡时间（第2、5题）、因子3睡眠时间（第4题）、因子4睡眠效率（第1、3、4题计算）、因子5睡眠障碍（第6-14题）、因子6催眠药物（第16题）、因子7日间功能障碍（第17-19题）。', 'Buysse DJ, et al. Psychiatry Res. 1989');

-- PSS-10 计分规则
INSERT INTO scale_scoring_rules (scale_id, rule_name, rule_type, calculation_method, included_questions, description, source) VALUES
(5, '总分', 'total', 'sum', '1,2,3,4,5,6,7,8,9,10', '将10个条目得分相加。第4、5、7、8题为反向计分（4=原始分0，3=1，2=2，1=3，0=4）。总分范围0-40分。', 'Cohen S, et al. J Health Soc Behav. 1983');

-- ISI 计分规则
INSERT INTO scale_scoring_rules (scale_id, rule_name, rule_type, calculation_method, included_questions, description, source) VALUES
(6, '总分', 'total', 'sum', '1,2,3,4,5,6,7', '将7个条目得分相加，总分范围0-28分。', 'Morin CM, et al. Sleep. 2011');

-- PHQ-9 结果解读
INSERT INTO scale_interpretations (scale_id, min_score, max_score, severity_level, severity_color, interpretation, suggestion, is_high_risk, referral_prompt, disclaimer, sort_order) VALUES
(1, 0, 4, '无抑郁', '#52c41a',
 '您的得分表明目前没有明显的抑郁症状，或者抑郁症状非常轻微。',
 '继续保持良好的生活习惯，定期进行心理健康自检。如果感到不适，及时寻求帮助。',
 0, NULL, NULL, 1),

(1, 5, 9, '轻度抑郁', '#faad14',
 '您的得分提示可能存在轻度抑郁症状，这些症状可能对日常生活有一定影响。',
 '建议：1）保持规律作息和适度运动；2）与亲友保持沟通；3）尝试放松训练或正念冥想；4）2周后重新评估；5）如症状持续或加重，建议咨询专业人士。',
 0, NULL, NULL, 2),

(1, 10, 14, '中度抑郁', '#fa8c16',
 '您的得分提示可能存在中度抑郁症状，这些症状可能已对日常功能产生明显影响。',
 '建议：1）尽快咨询心理健康专业人士；2）保持规律作息；3）坚持适度运动；4）避免酒精和药物滥用；5）告知信任的人您的状况。',
 0, '您的抑郁评分达到中度水平，建议您尽快寻求专业心理咨询或精神科医生的帮助。', NULL, 3),

(1, 15, 19, '中重度抑郁', '#f5222d',
 '您的得分提示可能存在中重度抑郁症状，这些症状已对生活造成较大影响。',
 '建议：1）强烈建议尽快就诊精神科或心理科；2）告知家人或朋友您的状况；3）坚持治疗计划；4）避免独自承受。',
 1, '您的抑郁评分达到中重度水平，强烈建议您尽快寻求专业精神科医生的帮助。您可以拨打24小时心理援助热线：400-161-9995 或 010-82951332。',
 '本评估结果仅供参考，不构成医学诊断。如有紧急情况，请立即拨打120或前往最近医院急诊科。', 4),

(1, 20, 27, '重度抑郁', '#cf1322',
 '您的得分提示可能存在重度抑郁症状，这些症状已严重影响日常生活。',
 '建议：1）请立即寻求专业精神科医生帮助；2）告知家人或朋友；3）如出现自伤或自杀想法，请立即拨打危机干预热线；4）不要独自面对。',
 1, '您的抑郁评分达到重度水平，请立即寻求专业帮助！24小时心理危机干预热线：400-161-9995；北京心理危机研究与干预中心：010-82951332；全国卫生热线：12320。',
 '⚠️ 免责声明：本评估结果仅为筛查参考，不能替代专业医学诊断。如果您有自伤或自杀的想法，请立即拨打危机干预热线或前往最近医院急诊科。', 5);

-- GAD-7 结果解读
INSERT INTO scale_interpretations (scale_id, min_score, max_score, severity_level, severity_color, interpretation, suggestion, is_high_risk, referral_prompt, disclaimer, sort_order) VALUES
(2, 0, 4, '无焦虑', '#52c41a',
 '您的得分表明目前没有明显的焦虑症状，或者焦虑症状非常轻微。',
 '继续保持良好的生活习惯，定期进行心理健康自检。',
 0, NULL, NULL, 1),

(2, 5, 9, '轻度焦虑', '#faad14',
 '您的得分提示可能存在轻度焦虑症状，这些症状可能偶尔影响日常生活。',
 '建议：1）学习放松技巧，如深呼吸、渐进性肌肉放松；2）保持规律运动；3）减少咖啡因摄入；4）2周后重新评估。',
 0, NULL, NULL, 2),

(2, 10, 14, '中度焦虑', '#fa8c16',
 '您的得分提示可能存在中度焦虑症状，这些症状可能已对日常功能产生明显影响。',
 '建议：1）建议咨询心理健康专业人士；2）尝试认知行为疗法相关自助资源；3）保持规律作息和运动；4）练习正念冥想。',
 0, '您的焦虑评分达到中度水平，建议您寻求专业心理咨询帮助。', NULL, 3),

(2, 15, 21, '重度焦虑', '#f5222d',
 '您的得分提示可能存在重度焦虑症状，这些症状已严重影响日常生活。',
 '建议：1）请尽快就诊精神科或心理科；2）告知家人或朋友；3）坚持治疗计划；4）避免独自承受。',
 1, '您的焦虑评分达到重度水平，强烈建议您尽快寻求专业精神科医生的帮助。24小时心理援助热线：400-161-9995；全国卫生热线：12320。',
 '⚠️ 免责声明：本评估结果仅为筛查参考，不能替代专业医学诊断。如有紧急情况，请立即拨打120或前往最近医院急诊科。', 4);

-- PHQ-15 结果解读
INSERT INTO scale_interpretations (scale_id, min_score, max_score, severity_level, severity_color, interpretation, suggestion, is_high_risk, referral_prompt, disclaimer, sort_order) VALUES
(3, 0, 4, '无/轻微躯体症状', '#52c41a',
 '您的得分表明躯体症状很少或非常轻微。',
 '保持健康生活方式，定期体检。如有不适，及时就医。',
 0, NULL, NULL, 1),

(3, 5, 9, '轻度躯体症状', '#faad14',
 '您的得分提示可能存在轻度躯体症状。',
 '建议关注身体状况，保持规律作息和运动。如症状持续，建议就医检查。',
 0, NULL, NULL, 2),

(3, 10, 14, '中度躯体症状', '#fa8c16',
 '您的得分提示可能存在中度躯体症状，建议进一步评估。',
 '建议就医进行详细检查，排除器质性疾病。同时关注心理健康，躯体症状可能与心理因素相关。',
 0, '您的躯体症状评分达到中度水平，建议就医检查并考虑心理因素影响。', NULL, 3),

(3, 15, 30, '重度躯体症状', '#f5222d',
 '您的得分提示可能存在重度躯体症状，需要认真关注。',
 '请尽快就医进行详细检查。躯体症状可能与心理因素密切相关，建议同时进行心理健康评估。',
 1, '您的躯体症状评分达到重度水平，建议尽快就医并接受心理健康评估。',
 '⚠️ 免责声明：本评估结果仅为筛查参考，不能替代专业医学诊断。', 4);

-- PSS-10 结果解读
INSERT INTO scale_interpretations (scale_id, min_score, max_score, severity_level, severity_color, interpretation, suggestion, is_high_risk, referral_prompt, disclaimer, sort_order) VALUES
(5, 0, 13, '低压力', '#52c41a',
 '您的得分表明感知到的压力水平较低，日常应对状况良好。',
 '继续保持良好的压力管理习惯，保持社交和运动。',
 0, NULL, NULL, 1),

(5, 14, 26, '中等压力', '#faad14',
 '您的得分表明存在中等程度的压力，可能需要关注压力管理。',
 '建议：1）识别压力来源；2）学习时间管理；3）增加休闲活动；4）练习放松技巧；5）与信任的人交流。',
 0, NULL, NULL, 2),

(5, 27, 40, '高压力', '#f5222d',
 '您的得分表明感知到的压力水平较高，可能已对身心健康产生影响。',
 '建议：1）认真考虑寻求专业帮助；2）调整生活节奏；3）保证充足睡眠；4）规律运动；5）减少不必要的压力源。',
 0, '您的压力水平较高，建议寻求专业心理咨询帮助，学习更有效的压力应对策略。',
 '⚠️ 免责声明：本评估结果仅为筛查参考，不能替代专业医学诊断。', 3);

-- ISI 结果解读
INSERT INTO scale_interpretations (scale_id, min_score, max_score, severity_level, severity_color, interpretation, suggestion, is_high_risk, referral_prompt, disclaimer, sort_order) VALUES
(6, 0, 7, '无临床失眠', '#52c41a',
 '您的得分表明不存在显著的临床失眠问题。',
 '保持良好的睡眠卫生习惯，规律作息。',
 0, NULL, NULL, 1),

(6, 8, 14, '亚临床失眠', '#faad14',
 '您的得分提示可能存在亚临床失眠，睡眠质量有一定影响。',
 '建议：1）建立规律作息；2）避免睡前使用电子设备；3）创造舒适睡眠环境；4）限制咖啡因和酒精摄入。',
 0, NULL, NULL, 2),

(6, 15, 21, '临床失眠（中度）', '#fa8c16',
 '您的得分提示可能存在中度临床失眠，建议进一步评估。',
 '建议咨询睡眠专科或心理科，进行专业评估和治疗。认知行为治疗对失眠有良好效果。',
 0, '您的失眠评分达到中度临床水平，建议寻求专业帮助。', NULL, 3),

(6, 22, 28, '临床失眠（重度）', '#f5222d',
 '您的得分提示可能存在重度临床失眠，严重影响日间功能。',
 '请尽快就诊睡眠专科或精神心理科，进行系统评估和治疗。',
 1, '您的失眠评分达到重度临床水平，强烈建议尽快就诊。',
 '⚠️ 免责声明：本评估结果仅为筛查参考，不能替代专业医学诊断。', 4);

-- PSQI 结果解读
INSERT INTO scale_interpretations (scale_id, min_score, max_score, severity_level, severity_color, interpretation, suggestion, is_high_risk, referral_prompt, disclaimer, sort_order) VALUES
(4, 0, 5, '睡眠质量很好', '#52c41a',
 '您的得分表明睡眠质量良好，睡眠各方面功能正常。',
 '继续保持良好的睡眠卫生习惯，规律作息。',
 0, NULL, NULL, 1),

(4, 6, 10, '睡眠质量较好', '#73d13d',
 '您的得分提示睡眠质量尚可，可能存在轻微的睡眠问题。',
 '建议保持规律作息，注意睡前放松，避免咖啡因等刺激物。',
 0, NULL, NULL, 2),

(4, 11, 15, '睡眠质量一般', '#faad14',
 '您的得分提示睡眠质量一般，可能存在中度睡眠问题，对日间功能有一定影响。',
 '建议：1）建立规律作息；2）改善睡眠环境；3）学习放松技巧；4）减少睡前电子设备使用；5）如症状持续，建议咨询专业人士。',
 0, NULL, NULL, 3),

(4, 16, 21, '睡眠质量很差', '#f5222d',
 '您的得分提示存在严重的睡眠问题，睡眠质量差，可能已明显影响日间功能和生活质量。',
 '建议：1）强烈建议尽快就诊睡眠专科或精神心理科；2）进行专业的睡眠评估；3）排查可能的躯体或心理原因；4）家人给予理解和支持。',
 1, '您的睡眠质量评分达到严重程度，强烈建议尽快就诊睡眠专科或精神心理科进行专业评估和治疗。',
 '⚠️ 免责声明：本评估结果仅为筛查参考，不能替代专业医学诊断。如有严重睡眠问题，请及时就医。', 4);

-- 资源分类
INSERT INTO resource_categories (name, description, icon, sort_order) VALUES
('危机干预', '紧急心理援助热线与危机干预资源', 'phone', 1),
('心理健康科普', '心理健康知识与自我调节方法', 'book', 2),
('专业机构', '心理咨询与治疗机构信息', 'hospital', 3),
('自助工具', '冥想、放松训练等自助工具与App推荐', 'tool', 4),
('推荐阅读', '心理健康相关书籍与文章推荐', 'read', 5);

-- 科普资源
INSERT INTO resources (category_id, title, summary, content, resource_type, external_url, phone_number, tags, author, source, view_count, is_active, sort_order, published_at) VALUES
(1, '全国24小时心理援助热线', '全国心理援助热线，提供7×24小时免费心理咨询服务', '如果您或您身边的人正在经历心理危机，请立即拨打以下热线：\n\n全国24小时心理危机干预热线：400-161-9995\n北京心理危机研究与干预中心：010-82951332\n全国卫生热线：12320\n生命热线：400-821-1215\n\n所有热线均由专业心理咨询师接听，完全免费保密。', 'hotline', '', '400-161-9995', '热线,危机干预,24小时', '', '国家卫健委', 0, 1, 1, NOW()),

(1, '北京心理危机研究与干预中心', '提供专业的心理危机干预服务', '北京心理危机研究与干预中心是全国最早成立的心理危机干预机构之一，提供电话咨询、面询等服务。\n\n热线电话：010-82951332\n服务时间：24小时\n地址：北京市', 'hotline', 'http://www.crisis.org.cn', '010-82951332', '北京,危机干预,专业机构', '', '北京心理危机研究与干预中心', 0, 1, 2, NOW()),

(2, '了解抑郁：症状、原因与应对', '全面介绍抑郁症的基本知识，帮助您识别和应对抑郁', '抑郁症是最常见的心理障碍之一。本文将从症状表现、常见原因、自我调节方法等方面为您详细介绍。\n\n【什么是抑郁症】\n抑郁症不仅仅是"心情不好"，而是一种持续的情绪障碍，通常表现为持续两周以上的情绪低落、兴趣减退、精力不足等。\n\n【常见症状】\n- 持续的悲伤、空虚或绝望感\n- 对以前喜欢的活动失去兴趣\n- 睡眠障碍（失眠或嗜睡）\n- 食欲和体重变化\n- 疲劳和精力不足\n- 注意力难以集中\n- 无价值感或过度内疚\n- 反复出现死亡或自杀的想法\n\n【自我调节建议】\n1. 保持规律作息\n2. 适度运动\n3. 与亲友保持联系\n4. 设定可实现的小目标\n5. 避免酒精和药物\n6. 寻求专业帮助', 'article', '', '', '抑郁,症状,自我调节,科普', '心理健康教育团队', '本平台', 0, 1, 1, NOW()),

(2, '焦虑管理：从认识焦虑到有效应对', '帮助您了解焦虑的本质，学习科学有效的焦虑管理策略', '焦虑是一种常见的情绪反应，适度的焦虑有助于提高警觉性，但过度的焦虑会影响日常生活。\n\n【焦虑的正常与异常】\n正常焦虑：面对压力时的短暂紧张不安\n异常焦虑：持续过度担忧，影响日常功能\n\n【焦虑的身体信号】\n- 心跳加速\n- 呼吸急促\n- 肌肉紧张\n- 出汗\n- 手抖\n- 胃部不适\n\n【有效的焦虑管理方法】\n1. 腹式呼吸法\n2. 渐进性肌肉放松\n3. 正念冥想\n4. 认知重构\n5. 规律运动\n6. 限制咖啡因摄入\n7. 充足睡眠', 'article', '', '', '焦虑,管理,放松,正念', '心理健康教育团队', '本平台', 0, 1, 2, NOW()),

(2, '睡眠卫生指南：改善睡眠的10个建议', '科学实用的睡眠改善建议，帮助您建立良好的睡眠习惯', '良好的睡眠是身心健康的基石。以下是改善睡眠质量的10个科学建议：\n\n1. 保持规律作息：每天同一时间上床和起床\n2. 创造舒适环境：安静、黑暗、凉爽的卧室\n3. 限制床上活动：床只用于睡眠\n4. 睡前放松仪式：温水澡、轻音乐、阅读\n5. 避免刺激物：下午后避免咖啡因\n6. 限制午睡：不超过30分钟\n7. 规律运动：但避免睡前3小时内剧烈运动\n8. 管理担忧：睡前写下烦恼和明日计划\n9. 不要强迫入睡：20分钟未入睡则起床\n10. 减少屏幕时间：睡前1小时远离电子设备', 'article', '', '', '睡眠,失眠,睡眠卫生,自助', '心理健康教育团队', '本平台', 0, 1, 3, NOW()),

(3, '如何选择心理咨询师', '选择合适心理咨询师的实用指南', '选择心理咨询师是迈向心理健康的重要一步。以下是选择咨询师时需要考虑的因素：\n\n【专业资质】\n- 心理咨询师资格证\n- 心理治疗师资格证\n- 精神科医师执业证\n\n【咨询流派】\n- 认知行为治疗（CBT）\n- 精神分析/动力取向\n- 人本主义取向\n- 家庭系统治疗\n\n【选择建议】\n1. 确认咨询师的专业资质\n2. 了解咨询师的受训背景和经验\n3. 初次咨询感受是否舒适\n4. 咨询目标和方式是否匹配\n5. 费用是否在可承受范围内', 'article', '', '', '心理咨询,选择咨询师,专业机构', '心理健康教育团队', '本平台', 0, 1, 1, NOW()),

(4, '正念冥想入门指南', '适合初学者的正念冥想方法介绍', '正念冥想是一种经过科学验证的心理调节方法，适合日常练习。\n\n【什么是正念】\n正念是有意识地将注意力集中在当下，不加评判地观察自己的想法、感受和身体感觉。\n\n【基础练习】\n1. 呼吸冥想（5分钟）\n   - 找安静处舒适坐下\n   - 闭眼，关注呼吸\n   - 吸气时感受腹部膨胀\n   - 呼气时感受腹部收缩\n   - 思绪游走时轻轻拉回\n\n2. 身体扫描（10分钟）\n   - 从头顶开始\n   - 逐步关注身体各部位\n   - 感受但不评判\n   - 直至脚底\n\n【推荐App】\n- 潮汐\n- 冥想\n- 小睡眠', 'article', '', '', '正念,冥想,放松,自助工具', '心理健康教育团队', '本平台', 0, 1, 1, NOW()),

(5, '《伯恩斯新情绪疗法》', '认知行为疗法经典自助读物', '作者：大卫·伯恩斯\n\n本书是认知行为疗法（CBT）领域的经典自助读物，被全球数百万读者验证有效。\n\n【核心内容】\n- 认知扭曲的10种类型\n- 情绪日记法\n- 认知重构技术\n- 行为激活方法\n\n【适合人群】\n- 轻中度抑郁或焦虑者\n- 想要学习情绪管理的人\n- 对CBT感兴趣的心理健康爱好者\n\n本书提供了大量实用的练习和工作表，适合自我练习使用。', 'article', '', '', '书籍,认知行为疗法,自助,推荐阅读', '心理健康教育团队', '本平台', 0, 1, 1, NOW());
