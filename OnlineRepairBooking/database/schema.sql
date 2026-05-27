-- 在线维修预约平台数据库设计
CREATE DATABASE IF NOT EXISTS `online_repair_booking` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `online_repair_booking`;

-- 用户表（包含普通用户和师傅）
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `phone` VARCHAR(20) NOT NULL COMMENT '手机号',
  `password` VARCHAR(255) NOT NULL COMMENT '密码（加密）',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  `role` TINYINT NOT NULL DEFAULT 1 COMMENT '角色：1-普通用户 2-师傅 3-管理员',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用 1-正常',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_phone` (`phone`),
  KEY `idx_role` (`role`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 用户地址表
CREATE TABLE IF NOT EXISTS `addresses` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `name` VARCHAR(50) NOT NULL COMMENT '联系人姓名',
  `phone` VARCHAR(20) NOT NULL COMMENT '联系人电话',
  `province` VARCHAR(50) NOT NULL COMMENT '省份',
  `city` VARCHAR(50) NOT NULL COMMENT '城市',
  `district` VARCHAR(50) NOT NULL COMMENT '区县',
  `detail` VARCHAR(255) NOT NULL COMMENT '详细地址',
  `full_address` VARCHAR(600) DEFAULT NULL COMMENT '完整地址',
  `longitude` DECIMAL(10,7) DEFAULT NULL COMMENT '经度',
  `latitude` DECIMAL(10,7) DEFAULT NULL COMMENT '纬度',
  `is_default` TINYINT NOT NULL DEFAULT 0 COMMENT '是否默认：0-否 1-是',
  `tag` VARCHAR(20) DEFAULT NULL COMMENT '标签：家/公司/其他',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_address_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户地址表';

-- 服务分类表
CREATE TABLE IF NOT EXISTS `service_categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
  `icon` VARCHAR(255) DEFAULT NULL COMMENT '分类图标',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '分类描述',
  `parent_id` BIGINT UNSIGNED DEFAULT 0 COMMENT '父分类ID，0表示一级分类',
  `sort` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用 1-启用',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_sort` (`sort`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='服务分类表';

-- 服务项目表
CREATE TABLE IF NOT EXISTS `services` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` BIGINT UNSIGNED NOT NULL COMMENT '分类ID',
  `name` VARCHAR(100) NOT NULL COMMENT '服务名称',
  `description` TEXT COMMENT '服务描述',
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '基础价格',
  `price_unit` VARCHAR(20) NOT NULL DEFAULT '次' COMMENT '价格单位：次/小时/件',
  `image` VARCHAR(255) DEFAULT NULL COMMENT '服务图片',
  `duration` INT NOT NULL DEFAULT 60 COMMENT '预计时长（分钟）',
  `sort` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-下架 1-上架',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_sort` (`sort`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_service_category` FOREIGN KEY (`category_id`) REFERENCES `service_categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='服务项目表';

-- 师傅信息表
CREATE TABLE IF NOT EXISTS `workers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '关联用户ID',
  `real_name` VARCHAR(50) NOT NULL COMMENT '真实姓名',
  `id_card` VARCHAR(20) NOT NULL COMMENT '身份证号',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像',
  `phone` VARCHAR(20) NOT NULL COMMENT '联系电话',
  `province` VARCHAR(50) NOT NULL COMMENT '服务省份',
  `city` VARCHAR(50) NOT NULL COMMENT '服务城市',
  `district` VARCHAR(255) DEFAULT NULL COMMENT '服务区县（多个用逗号分隔）',
  `introduction` TEXT COMMENT '个人简介',
  `skills` VARCHAR(255) DEFAULT NULL COMMENT '技能标签（多个用逗号分隔）',
  `years_of_experience` INT NOT NULL DEFAULT 0 COMMENT '工作年限',
  `rating` DECIMAL(2,1) NOT NULL DEFAULT 5.0 COMMENT '评分（0-5）',
  `order_count` INT NOT NULL DEFAULT 0 COMMENT '完成订单数',
  `level` TINYINT NOT NULL DEFAULT 1 COMMENT '等级：1-初级 2-中级 3-高级',
  `is_certified` TINYINT NOT NULL DEFAULT 0 COMMENT '是否认证：0-否 1-是',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用 1-接单中 2-休息中',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_id` (`user_id`),
  KEY `idx_city` (`city`),
  KEY `idx_rating` (`rating`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_worker_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='师傅信息表';

-- 师傅技能关联表
CREATE TABLE IF NOT EXISTS `worker_skills` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `worker_id` BIGINT UNSIGNED NOT NULL COMMENT '师傅ID',
  `category_id` BIGINT UNSIGNED NOT NULL COMMENT '服务分类ID',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_worker_category` (`worker_id`, `category_id`),
  KEY `idx_worker_id` (`worker_id`),
  KEY `idx_category_id` (`category_id`),
  CONSTRAINT `fk_skill_worker` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_skill_category` FOREIGN KEY (`category_id`) REFERENCES `service_categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='师傅技能关联表';

-- 订单表
CREATE TABLE IF NOT EXISTS `orders` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_no` VARCHAR(32) NOT NULL COMMENT '订单编号',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '下单用户ID',
  `service_id` BIGINT UNSIGNED NOT NULL COMMENT '服务ID',
  `worker_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '接单师傅ID',
  `address_id` BIGINT UNSIGNED NOT NULL COMMENT '地址ID',
  `address_snapshot` TEXT NOT NULL COMMENT '地址快照（JSON格式）',
  `service_name` VARCHAR(100) NOT NULL COMMENT '服务名称快照',
  `service_price` DECIMAL(10,2) NOT NULL COMMENT '服务单价',
  `quantity` INT NOT NULL DEFAULT 1 COMMENT '数量',
  `total_amount` DECIMAL(10,2) NOT NULL COMMENT '订单总金额',
  `discount_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '优惠金额',
  `pay_amount` DECIMAL(10,2) NOT NULL COMMENT '实付金额',
  `appointment_date` DATE NOT NULL COMMENT '预约日期',
  `appointment_time` VARCHAR(20) NOT NULL COMMENT '预约时段（如 09:00-11:00）',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '用户备注',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '订单状态：0-待接单 1-待服务 2-服务中 3-待评价 4-已完成 5-已取消',
  `dispatch_type` TINYINT NOT NULL DEFAULT 0 COMMENT '派单方式：0-抢单 1-系统派单',
  `paid_at` TIMESTAMP NULL DEFAULT NULL COMMENT '支付时间',
  `accepted_at` TIMESTAMP NULL DEFAULT NULL COMMENT '接单时间',
  `started_at` TIMESTAMP NULL DEFAULT NULL COMMENT '开始服务时间',
  `completed_at` TIMESTAMP NULL DEFAULT NULL COMMENT '完成时间',
  `cancelled_at` TIMESTAMP NULL DEFAULT NULL COMMENT '取消时间',
  `cancel_reason` VARCHAR(255) DEFAULT NULL COMMENT '取消原因',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_worker_id` (`worker_id`),
  KEY `idx_service_id` (`service_id`),
  KEY `idx_status` (`status`),
  KEY `idx_appointment` (`appointment_date`, `appointment_time`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_order_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_order_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`),
  CONSTRAINT `fk_order_worker` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`),
  CONSTRAINT `fk_order_address` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- 订单状态历史表
CREATE TABLE IF NOT EXISTS `order_status_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL COMMENT '订单ID',
  `old_status` TINYINT NOT NULL COMMENT '原状态',
  `new_status` TINYINT NOT NULL COMMENT '新状态',
  `operator_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '操作人ID',
  `operator_type` TINYINT NOT NULL DEFAULT 1 COMMENT '操作人类型：1-用户 2-师傅 3-系统',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_log_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单状态历史表';

-- 订单抢单表
CREATE TABLE IF NOT EXISTS `order_bids` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL COMMENT '订单ID',
  `worker_id` BIGINT UNSIGNED NOT NULL COMMENT '抢单师傅ID',
  `bid_price` DECIMAL(10,2) DEFAULT NULL COMMENT '报价（可选，默认使用订单价格）',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '抢单备注',
  `is_winner` TINYINT NOT NULL DEFAULT 0 COMMENT '是否中标：0-否 1-是',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_worker` (`order_id`, `worker_id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_worker_id` (`worker_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_bid_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bid_worker` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单抢单表';

-- 评价表
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL COMMENT '订单ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '评价用户ID',
  `worker_id` BIGINT UNSIGNED NOT NULL COMMENT '被评价师傅ID',
  `service_id` BIGINT UNSIGNED NOT NULL COMMENT '服务ID',
  `rating` TINYINT UNSIGNED NOT NULL COMMENT '评分：1-5星',
  `content` VARCHAR(1000) DEFAULT NULL COMMENT '评价内容',
  `images` VARCHAR(500) DEFAULT NULL COMMENT '评价图片（多个用逗号分隔）',
  `is_anonymous` TINYINT NOT NULL DEFAULT 0 COMMENT '是否匿名：0-否 1-是',
  `reply_content` VARCHAR(1000) DEFAULT NULL COMMENT '师傅回复',
  `reply_at` TIMESTAMP NULL DEFAULT NULL COMMENT '回复时间',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_id` (`order_id`),
  KEY `idx_worker_id` (`worker_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_rating` (`rating`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_review_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_review_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_review_worker` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`),
  CONSTRAINT `fk_review_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评价表';

-- 支付记录表
CREATE TABLE IF NOT EXISTS `payments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL COMMENT '订单ID',
  `payment_no` VARCHAR(64) NOT NULL COMMENT '支付流水号',
  `amount` DECIMAL(10,2) NOT NULL COMMENT '支付金额',
  `payment_method` TINYINT NOT NULL COMMENT '支付方式：1-微信 2-支付宝 3-银行卡',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '支付状态：0-待支付 1-支付成功 2-支付失败 3-已退款',
  `paid_at` TIMESTAMP NULL DEFAULT NULL COMMENT '支付完成时间',
  `transaction_id` VARCHAR(64) DEFAULT NULL COMMENT '第三方交易号',
  `refund_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '退款金额',
  `refund_at` TIMESTAMP NULL DEFAULT NULL COMMENT '退款时间',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_payment_no` (`payment_no`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_payment_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支付记录表';

-- 时段配置表
CREATE TABLE IF NOT EXISTS `time_slots` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `start_time` VARCHAR(10) NOT NULL COMMENT '开始时间 HH:mm',
  `end_time` VARCHAR(10) NOT NULL COMMENT '结束时间 HH:mm',
  `sort` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用 1-启用',
  PRIMARY KEY (`id`),
  KEY `idx_sort` (`sort`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='时段配置表';

-- ========================================
-- 插入初始数据
-- ========================================

-- 插入管理员账户（密码：123456，bcrypt加密）
INSERT INTO `users` (`username`, `phone`, `password`, `role`, `status`) VALUES
('admin', '13800000000', '$2a$10$ipG2513cfWuwoVOIf2mPQORpOFr6hbzQn91IWJkZ/9iW5CdadP.YS', 3, 1);

-- 插入测试普通用户（密码：123456）
INSERT INTO `users` (`username`, `phone`, `password`, `role`, `status`) VALUES
('张三', '13800000001', '$2a$10$ipG2513cfWuwoVOIf2mPQORpOFr6hbzQn91IWJkZ/9iW5CdadP.YS', 1, 1),
('李四', '13800000002', '$2a$10$ipG2513cfWuwoVOIf2mPQORpOFr6hbzQn91IWJkZ/9iW5CdadP.YS', 1, 1);

-- 插入测试师傅用户
INSERT INTO `users` (`username`, `phone`, `password`, `role`, `status`) VALUES
('王师傅', '13900000001', '$2a$10$ipG2513cfWuwoVOIf2mPQORpOFr6hbzQn91IWJkZ/9iW5CdadP.YS', 2, 1),
('李师傅', '13900000002', '$2a$10$ipG2513cfWuwoVOIf2mPQORpOFr6hbzQn91IWJkZ/9iW5CdadP.YS', 2, 1),
('张师傅', '13900000003', '$2a$10$ipG2513cfWuwoVOIf2mPQORpOFr6hbzQn91IWJkZ/9iW5CdadP.YS', 2, 1);

-- 插入用户地址
INSERT INTO `addresses` (`user_id`, `name`, `phone`, `province`, `city`, `district`, `detail`, `is_default`) VALUES
(2, '张三', '13800000001', '广东省', '深圳市', '南山区', '科技园南区XX大厦1501室', 1),
(2, '张三', '13800000001', '广东省', '深圳市', '福田区', '华强北XX小区A栋302', 0),
(3, '李四', '13800000002', '广东省', '广州市', '天河区', '珠江新城XX花园B座2001', 1);

-- 插入服务分类
INSERT INTO `service_categories` (`name`, `icon`, `description`, `parent_id`, `sort`, `status`) VALUES
('家电维修', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=appliance%20repair%20icon&image_size=square', '各类家电设备维修服务', 0, 1, 1),
('家政服务', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=housekeeping%20icon&image_size=square', '家庭清洁与家政服务', 0, 2, 1),
('水电维修', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=plumbing%20electrical%20icon&image_size=square', '水电安装与维修服务', 0, 3, 1),
('家具安装', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=furniture%20installation%20icon&image_size=square', '家具组装与安装服务', 0, 4, 1),
('空调维修', NULL, '空调安装、维修、清洗', 1, 1, 1),
('冰箱维修', NULL, '冰箱故障检测与维修', 1, 2, 1),
('洗衣机维修', NULL, '洗衣机维修服务', 1, 3, 1),
('日常保洁', NULL, '家庭日常清洁服务', 2, 1, 1),
('深度保洁', NULL, '家庭深度清洁服务', 2, 2, 1),
('水电维修', NULL, '水电故障维修', 3, 1, 1),
('家具组装', NULL, '各类家具组装服务', 4, 1, 1);

-- 插入服务项目
INSERT INTO `services` (`category_id`, `name`, `description`, `price`, `price_unit`, `image`, `duration`, `sort`, `status`) VALUES
(5, '空调清洗', '专业空调内机清洗、外机除尘、滤网更换', 99.00, '次', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=air%20conditioner%20cleaning%20service&image_size=square', 60, 1, 1),
(5, '空调加氟', '空调制冷剂补充，适用于不制冷情况', 150.00, '次', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=air%20conditioner%20refill%20service&image_size=square', 45, 2, 1),
(5, '空调安装', '家用空调挂机、柜机安装服务', 200.00, '次', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=air%20conditioner%20installation%20service&image_size=square', 90, 3, 1),
(5, '空调维修', '空调故障检测与维修，上门费包含检测', 80.00, '次', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=air%20conditioner%20repair%20service&image_size=square', 60, 4, 1),
(6, '冰箱维修', '冰箱不制冷、异响等故障检测与维修', 80.00, '次', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=refrigerator%20repair%20service&image_size=square', 60, 1, 1),
(7, '洗衣机维修', '洗衣机不进水、不脱水等故障维修', 80.00, '次', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=washing%20machine%20repair%20service&image_size=square', 60, 1, 1),
(8, '日常保洁', '2小时日常家庭清洁，不含擦玻璃', 120.00, '次', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=daily%20house%20cleaning%20service&image_size=square', 120, 1, 1),
(8, '日常保洁（4小时）', '4小时日常家庭清洁', 220.00, '次', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=daily%20house%20cleaning%20service%204%20hours&image_size=square', 240, 2, 1),
(9, '深度保洁', '全屋深度清洁，包含厨房、卫生间重点区域', 399.00, '次', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=deep%20house%20cleaning%20service&image_size=square', 240, 1, 1),
(10, '水电维修', '水电故障上门检测维修', 60.00, '次', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=plumbing%20electrical%20repair%20service&image_size=square', 60, 1, 1),
(10, '灯具安装', '吸顶灯、吊灯等各类灯具安装', 50.00, '次', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=light%20fixture%20installation%20service&image_size=square', 45, 2, 1),
(11, '家具组装', '衣柜、书桌等板式家具组装', 100.00, '次', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=furniture%20assembly%20service&image_size=square', 90, 1, 1);

-- 插入师傅信息
INSERT INTO `workers` (`user_id`, `real_name`, `id_card`, `phone`, `province`, `city`, `district`, `introduction`, `skills`, `years_of_experience`, `rating`, `order_count`, `level`, `is_certified`, `status`) VALUES
(4, '王建国', '440101198501010001', '13900000001', '广东省', '深圳市', '南山区,福田区,罗湖区', '10年家电维修经验，专业空调维修师傅，持有高级制冷维修证书。', '空调维修,冰箱维修,洗衣机维修', 10, 4.8, 156, 3, 1, 1),
(5, '李志强', '440101199002020002', '13900000002', '广东省', '深圳市', '南山区,宝安区,龙华区', '8年家政服务经验，专业保洁与家具安装师傅，工作认真负责。', '日常保洁,深度保洁,家具组装', 8, 4.9, 203, 3, 1, 1),
(6, '张卫国', '440101198803030003', '13900000003', '广东省', '深圳市', '南山区,福田区,宝安区', '12年水电维修经验，持证上岗，专业解决各种水电疑难问题。', '水电维修,灯具安装', 12, 4.7, 178, 3, 1, 1);

-- 插入师傅技能关联
INSERT INTO `worker_skills` (`worker_id`, `category_id`) VALUES
(1, 5), (1, 6), (1, 7),
(2, 8), (2, 9), (2, 11),
(3, 10);

-- 插入时段配置
INSERT INTO `time_slots` (`start_time`, `end_time`, `sort`, `status`) VALUES
('08:00', '09:00', 1, 1),
('09:00', '10:00', 2, 1),
('10:00', '11:00', 3, 1),
('11:00', '12:00', 4, 1),
('14:00', '15:00', 5, 1),
('15:00', '16:00', 6, 1),
('16:00', '17:00', 7, 1),
('17:00', '18:00', 8, 1),
('18:00', '19:00', 9, 1),
('19:00', '20:00', 10, 1),
('20:00', '21:00', 11, 1);
