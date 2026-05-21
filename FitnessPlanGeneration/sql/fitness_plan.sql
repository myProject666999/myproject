CREATE DATABASE IF NOT EXISTS fitness_plan DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE fitness_plan;

DROP TABLE IF EXISTS `check_in_record`;
DROP TABLE IF EXISTS `adjustment_suggestion`;
DROP TABLE IF EXISTS `daily_plan`;
DROP TABLE IF EXISTS `weekly_plan`;
DROP TABLE IF EXISTS `exercise`;
DROP TABLE IF EXISTS `questionnaire`;
DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(100) NOT NULL,
  `nickname` VARCHAR(50),
  `gender` TINYINT COMMENT '1-男 2-女',
  `age` INT,
  `height` DECIMAL(5,2) COMMENT '身高(cm)',
  `weight` DECIMAL(5,2) COMMENT '体重(kg)',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `questionnaire` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `goal` TINYINT NOT NULL COMMENT '1-增肌 2-减脂',
  `fitness_level` TINYINT NOT NULL COMMENT '1-初级 2-中级 3-高级',
  `training_days_per_week` INT NOT NULL COMMENT '每周训练天数',
  `training_duration_per_session` INT NOT NULL COMMENT '每次训练时长(分钟)',
  `has_injury` TINYINT DEFAULT 0 COMMENT '0-无伤病 1-有伤病',
  `injury_details` VARCHAR(500) COMMENT '伤病详情',
  `equipment_available` VARCHAR(200) COMMENT '可用器材',
  `preferred_exercises` VARCHAR(500) COMMENT '偏好动作',
  `disliked_exercises` VARCHAR(500) COMMENT '不喜欢的动作',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `exercise` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `category` VARCHAR(50) NOT NULL COMMENT '动作分类：胸部、背部、肩部、手臂、核心、腿部、有氧',
  `muscle_group` VARCHAR(50) COMMENT '目标肌群',
  `difficulty` TINYINT NOT NULL COMMENT '1-初级 2-中级 3-高级',
  `equipment` VARCHAR(100) COMMENT '所需器材',
  `description` TEXT COMMENT '动作描述',
  `target_reps_min` INT COMMENT '目标次数最小值',
  `target_reps_max` INT COMMENT '目标次数最大值',
  `target_sets` INT COMMENT '目标组数',
  `rest_seconds` INT COMMENT '组间休息时间(秒)',
  `calories_per_set` DECIMAL(8,2) COMMENT '每组消耗热量',
  `suitable_for_goal` VARCHAR(20) COMMENT '适合的目标：MUSCLE-增肌 FAT-减脂 ALL-全部',
  `video_url` VARCHAR(500) COMMENT '教学视频地址',
  `image_url` VARCHAR(500) COMMENT '动作图片地址',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `weekly_plan` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `questionnaire_id` BIGINT NOT NULL,
  `week_start_date` DATE NOT NULL COMMENT '周开始日期',
  `week_end_date` DATE NOT NULL COMMENT '周结束日期',
  `goal` TINYINT NOT NULL COMMENT '1-增肌 2-减脂',
  `total_training_days` INT NOT NULL COMMENT '本周训练天数',
  `status` TINYINT DEFAULT 0 COMMENT '0-进行中 1-已完成 2-已取消',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
  FOREIGN KEY (`questionnaire_id`) REFERENCES `questionnaire`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `daily_plan` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `weekly_plan_id` BIGINT NOT NULL,
  `plan_date` DATE NOT NULL COMMENT '计划日期',
  `day_of_week` TINYINT NOT NULL COMMENT '1-周一 7-周日',
  `is_rest_day` TINYINT DEFAULT 0 COMMENT '0-训练日 1-休息日',
  `training_focus` VARCHAR(50) COMMENT '训练重点：推/拉/腿/全身/HIIT等',
  `total_duration` INT COMMENT '总时长(分钟)',
  `total_calories` DECIMAL(10,2) COMMENT '预计消耗热量',
  `status` TINYINT DEFAULT 0 COMMENT '0-未开始 1-进行中 2-已完成 3-已跳过',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`weekly_plan_id`) REFERENCES `weekly_plan`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `daily_plan_exercise` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `daily_plan_id` BIGINT NOT NULL,
  `exercise_id` BIGINT NOT NULL,
  `exercise_order` INT NOT NULL COMMENT '动作顺序',
  `target_sets` INT NOT NULL COMMENT '目标组数',
  `target_reps` VARCHAR(50) NOT NULL COMMENT '目标次数',
  `rest_seconds` INT COMMENT '组间休息时间(秒)',
  `completed_sets` INT DEFAULT 0 COMMENT '已完成组数',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`daily_plan_id`) REFERENCES `daily_plan`(`id`),
  FOREIGN KEY (`exercise_id`) REFERENCES `exercise`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `check_in_record` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `daily_plan_id` BIGINT NOT NULL,
  `check_in_date` DATE NOT NULL,
  `weight` DECIMAL(5,2) COMMENT '当日体重',
  `body_fat` DECIMAL(4,1) COMMENT '体脂率',
  `mood` TINYINT COMMENT '心情：1-差 2-一般 3-好',
  `energy_level` TINYINT COMMENT '精力：1-低 2-中 3-高',
  `actual_duration` INT COMMENT '实际训练时长(分钟)',
  `actual_calories` DECIMAL(10,2) COMMENT '实际消耗热量',
  `notes` VARCHAR(1000) COMMENT '训练备注',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
  FOREIGN KEY (`daily_plan_id`) REFERENCES `daily_plan`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `adjustment_suggestion` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `weekly_plan_id` BIGINT,
  `daily_plan_id` BIGINT,
  `suggestion_type` VARCHAR(50) NOT NULL COMMENT '建议类型：LOAD-负荷调整 EXERCISE-动作更换 REST-休息调整 NUTRITION-营养建议',
  `suggestion_content` TEXT NOT NULL COMMENT '建议内容',
  `reason` VARCHAR(500) COMMENT '建议原因',
  `is_applied` TINYINT DEFAULT 0 COMMENT '0-未采纳 1-已采纳',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
  FOREIGN KEY (`weekly_plan_id`) REFERENCES `weekly_plan`(`id`),
  FOREIGN KEY (`daily_plan_id`) REFERENCES `daily_plan`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `exercise` (`name`, `category`, `muscle_group`, `difficulty`, `equipment`, `description`, `target_reps_min`, `target_reps_max`, `target_sets`, `rest_seconds`, `calories_per_set`, `suitable_for_goal`) VALUES
('杠铃卧推', '胸部', '胸大肌、肱三头肌', 2, '杠铃、卧推凳', '平躺在卧推凳上，双手握杠铃，下放至胸部，然后推起', 8, 12, 4, 90, 45.0, 'MUSCLE'),
('哑铃卧推', '胸部', '胸大肌、肱三头肌', 1, '哑铃、卧推凳', '平躺在卧推凳上，双手持哑铃，下放至胸部两侧，然后推起', 10, 15, 3, 60, 35.0, 'ALL'),
('上斜哑铃卧推', '胸部', '上胸肌、肱三头肌', 2, '哑铃、可调节卧推凳', '仰卧在上斜30-45度的卧推凳上，双手持哑铃推起', 8, 12, 4, 90, 40.0, 'MUSCLE'),
('双杠臂屈伸', '胸部', '下胸肌、肱三头肌', 2, '双杠', '双手握杠，身体前倾，屈肘下降然后推起', 8, 12, 3, 60, 30.0, 'ALL'),
('俯卧撑', '胸部', '胸大肌、肱三头肌、核心', 1, '无', '双手撑地，身体呈一条直线，屈肘下降然后推起', 12, 20, 3, 45, 25.0, 'ALL'),

('引体向上', '背部', '背阔肌、肱二头肌', 3, '单杠', '双手握杠，身体自然下垂，用背部力量拉起身体至下巴过杠', 6, 10, 4, 90, 50.0, 'MUSCLE'),
('高位下拉', '背部', '背阔肌、肱二头肌', 1, '高位下拉器', '坐在器械上，双手握杆，下拉至胸前，感受背部收缩', 10, 15, 4, 90, 40.0, 'ALL'),
('杠铃划船', '背部', '背阔肌、中背部', 2, '杠铃', '屈膝俯身，双手握杠铃，沿大腿拉起杠铃至腹部', 8, 12, 4, 90, 45.0, 'MUSCLE'),
('哑铃划船', '背部', '背阔肌、中背部', 1, '哑铃、卧推凳', '单膝跪在卧推凳上，同侧手撑凳，另一手持哑铃拉起', 10, 12, 3, 60, 35.0, 'ALL'),
('坐姿划船', '背部', '中背部、菱形肌', 1, '划船机', '坐在器械上，双手握把手，向后拉至腹部，挤压肩胛骨', 12, 15, 4, 60, 35.0, 'ALL'),
('硬拉', '背部', '下背部、腘绳肌、臀部', 3, '杠铃', '双脚与肩同宽，双手握杠铃，从地面拉起至身体直立', 5, 8, 4, 120, 80.0, 'MUSCLE'),

('杠铃推举', '肩部', '三角肌前束、中束', 2, '杠铃', '坐姿或站姿，双手握杠铃于肩前，向上推起至手臂伸直', 8, 12, 4, 90, 45.0, 'MUSCLE'),
('哑铃侧平举', '肩部', '三角肌中束', 1, '哑铃', '双手持哑铃，身体直立，向两侧举起至与肩平行', 12, 15, 4, 60, 20.0, 'ALL'),
('哑铃前平举', '肩部', '三角肌前束', 1, '哑铃', '双手持哑铃，身体直立，向前举起至与肩平行', 12, 15, 3, 60, 20.0, 'ALL'),
('俯身哑铃飞鸟', '肩部', '三角肌后束', 2, '哑铃', '俯身，背部平直，双手持哑铃向两侧抬起', 12, 15, 4, 60, 25.0, 'ALL'),
('面拉', '肩部', '三角肌后束、上背部', 2, '龙门架、绳索', '面向器械，双手握绳索，向面部方向拉动', 12, 15, 4, 60, 25.0, 'ALL'),

('杠铃弯举', '手臂', '肱二头肌', 2, '杠铃', '身体直立，双手握杠铃，弯举杠铃至胸前', 8, 12, 4, 60, 25.0, 'MUSCLE'),
('哑铃弯举', '手臂', '肱二头肌', 1, '哑铃', '身体直立，双手持哑铃，交替弯举', 10, 15, 3, 60, 20.0, 'ALL'),
('锤式弯举', '手臂', '肱肌、前臂', 1, '哑铃', '身体直立，双手持哑铃，掌心相对，弯举', 10, 15, 3, 60, 20.0, 'ALL'),
('绳索下压', '手臂', '肱三头肌', 1, '龙门架、绳索', '面向器械，双手握绳索，向下压至手臂伸直', 12, 15, 4, 60, 20.0, 'ALL'),
('仰卧臂屈伸', '手臂', '肱三头肌', 2, '杠铃、卧推凳', '仰卧在卧推凳上，双手握杠铃于头上，屈肘下放然后伸直', 10, 12, 4, 60, 25.0, 'MUSCLE'),

('深蹲', '腿部', '股四头肌、臀部', 2, '杠铃', '双脚与肩同宽，双手握杠铃于颈后，下蹲至大腿平行地面', 8, 12, 4, 120, 70.0, 'MUSCLE'),
('腿举', '腿部', '股四头肌、臀部', 1, '腿举机', '坐在器械上，双脚蹬踏板，伸腿然后缓慢收回', 10, 15, 4, 90, 55.0, 'ALL'),
('腿屈伸', '腿部', '股四头肌', 1, '腿屈伸器', '坐在器械上，小腿勾住挡垫，伸小腿然后缓慢收回', 12, 15, 4, 60, 30.0, 'ALL'),
('腿弯举', '腿部', '腘绳肌', 1, '腿弯举器', '俯卧在器械上，小腿勾住挡垫，弯小腿然后缓慢放下', 12, 15, 4, 60, 30.0, 'ALL'),
('箭步蹲', '腿部', '股四头肌、臀部、腘绳肌', 1, '哑铃或无', '双脚前后开立，下蹲至前后腿均成90度', 10, 12, 3, 60, 35.0, 'ALL'),
('提踵', '腿部', '小腿腓肠肌', 1, '提踵器或无', '站立，脚跟抬起至最高点，缓慢放下', 15, 20, 4, 45, 15.0, 'ALL'),
('臀桥', '腿部', '臀部、腘绳肌', 1, '杠铃或无', '仰卧，屈膝，臀部抬起至身体呈一条直线', 12, 15, 4, 45, 25.0, 'ALL'),

('平板支撑', '核心', '核心肌群', 1, '无', '双肘撑地，身体呈一条直线，保持', 30, 60, 3, 30, 10.0, 'ALL'),
('卷腹', '核心', '腹直肌上部', 1, '无', '仰卧，屈膝，上身卷起至肩胛骨离地', 15, 25, 4, 30, 15.0, 'ALL'),
('反向卷腹', '核心', '腹直肌下部', 1, '无', '仰卧，双腿抬起，下半身卷起', 12, 20, 4, 30, 15.0, 'ALL'),
('俄罗斯转体', '核心', '腹斜肌', 1, '哑铃或无', '坐姿，上身后仰，双手持重物左右转体', 15, 20, 4, 30, 20.0, 'ALL'),
('登山跑', '核心', '核心、心肺', 1, '无', '俯卧撑姿势，交替快速提膝', 30, 60, 3, 30, 25.0, 'ALL'),
('悬垂举腿', '核心', '腹直肌下部、髂腰肌', 2, '单杠', '双手握杠，身体自然下垂，抬腿至与地面平行', 10, 15, 4, 60, 30.0, 'ALL'),

('跑步机慢跑', '有氧', '心肺、全身', 1, '跑步机', '在跑步机上以中等速度慢跑，保持均匀呼吸', 600, 1800, 1, 0, 8.0, 'FAT'),
('动感单车', '有氧', '心肺、下肢', 1, '动感单车', '在动感单车上进行中等强度骑行', 600, 1800, 1, 0, 10.0, 'FAT'),
('椭圆机', '有氧', '心肺、全身', 1, '椭圆机', '在椭圆机上进行有氧训练', 600, 1800, 1, 0, 7.0, 'FAT'),
('游泳', '有氧', '心肺、全身', 2, '游泳池', '进行自由泳、蛙泳等游泳训练', 600, 1800, 1, 0, 12.0, 'FAT'),
('跳绳', '有氧', '心肺、小腿', 1, '跳绳', '连续跳绳训练', 300, 600, 1, 0, 15.0, 'FAT'),
('HIIT训练', '有氧', '心肺、全身', 3, '无或少量', '高强度间歇训练，如20秒全力冲刺+40秒休息，循环', 1200, 1800, 1, 0, 15.0, 'FAT'),
('开合跳', '有氧', '心肺、全身', 1, '无', '双脚开合跳，配合手臂上举', 60, 120, 3, 30, 5.0, 'FAT');

INSERT INTO `user` (`username`, `password`, `nickname`, `gender`, `age`, `height`, `weight`) VALUES
('demo', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVE', '健身达人', 1, 28, 175.00, 70.00);
