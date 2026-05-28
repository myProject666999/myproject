-- 创建数据库
CREATE DATABASE IF NOT EXISTS school_cafeteria DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE school_cafeteria;

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    `password` VARCHAR(100) NOT NULL COMMENT '密码',
    `real_name` VARCHAR(50) NOT NULL COMMENT '真实姓名',
    `phone` VARCHAR(20) COMMENT '手机号',
    `role` VARCHAR(20) NOT NULL COMMENT '角色：ADMIN-管理员, STAFF-食堂工作人员, PARENT-家长',
    `class_name` VARCHAR(50) COMMENT '班级（家长用）',
    `student_name` VARCHAR(50) COMMENT '学生姓名（家长用）',
    `status` TINYINT DEFAULT 1 COMMENT '状态：1-正常, 0-禁用',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_role (`role`),
    INDEX idx_username (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 菜谱表
CREATE TABLE IF NOT EXISTS `menu` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '菜谱ID',
    `menu_date` DATE NOT NULL COMMENT '菜谱日期',
    `meal_type` VARCHAR(20) NOT NULL COMMENT '餐次：BREAKFAST-早餐, LUNCH-午餐, DINNER-晚餐',
    `dish_name` VARCHAR(100) NOT NULL COMMENT '菜品名称',
    `dish_type` VARCHAR(50) COMMENT '菜品类型：主食、热菜、凉菜、汤、水果',
    `ingredients` TEXT COMMENT '主要食材',
    `image_url` VARCHAR(255) COMMENT '菜品图片',
    `description` TEXT COMMENT '菜品描述',
    `create_by` BIGINT COMMENT '创建人ID',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_menu_date (`menu_date`),
    INDEX idx_meal_type (`meal_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='每日菜谱表';

-- 食材供应商表
CREATE TABLE IF NOT EXISTS `supplier` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '供应商ID',
    `supplier_name` VARCHAR(100) NOT NULL COMMENT '供应商名称',
    `contact_person` VARCHAR(50) COMMENT '联系人',
    `phone` VARCHAR(20) COMMENT '联系电话',
    `address` VARCHAR(255) COMMENT '地址',
    `business_license` VARCHAR(100) COMMENT '营业执照号',
    `qualification` VARCHAR(255) COMMENT '资质证明',
    `status` TINYINT DEFAULT 1 COMMENT '状态：1-正常, 0-停用',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_supplier_name (`supplier_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='食材供应商表';

-- 食材进货溯源表
CREATE TABLE IF NOT EXISTS `ingredient_trace` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '溯源ID',
    `batch_no` VARCHAR(50) NOT NULL UNIQUE COMMENT '批次号',
    `ingredient_name` VARCHAR(100) NOT NULL COMMENT '食材名称',
    `supplier_id` BIGINT NOT NULL COMMENT '供应商ID',
    `quantity` DECIMAL(10,2) NOT NULL COMMENT '数量',
    `unit` VARCHAR(20) COMMENT '单位',
    `purchase_date` DATE NOT NULL COMMENT '进货日期',
    `production_date` DATE COMMENT '生产日期',
    `expiry_date` DATE COMMENT '保质期至',
    `quality_certificate` VARCHAR(255) COMMENT '质检证明',
    `inspection_result` VARCHAR(20) COMMENT '检验结果：PASS-合格, FAIL-不合格',
    `inspector` VARCHAR(50) COMMENT '验收人',
    `remark` TEXT COMMENT '备注',
    `create_by` BIGINT COMMENT '创建人ID',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_batch_no (`batch_no`),
    INDEX idx_ingredient_name (`ingredient_name`),
    INDEX idx_purchase_date (`purchase_date`),
    FOREIGN KEY (`supplier_id`) REFERENCES `supplier`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='食材进货溯源表';

-- 留样记录表
CREATE TABLE IF NOT EXISTS `sample_record` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '留样ID',
    `sample_no` VARCHAR(50) NOT NULL UNIQUE COMMENT '留样编号',
    `menu_id` BIGINT COMMENT '关联菜谱ID',
    `dish_name` VARCHAR(100) NOT NULL COMMENT '菜品名称',
    `sample_date` DATE NOT NULL COMMENT '留样日期',
    `sample_time` TIME NOT NULL COMMENT '留样时间',
    `sample_weight` DECIMAL(10,2) COMMENT '留样重量(g)',
    `storage_location` VARCHAR(100) COMMENT '存放位置',
    `image_url` VARCHAR(255) NOT NULL COMMENT '留样照片',
    `sampler` VARCHAR(50) NOT NULL COMMENT '留样人',
    `remark` TEXT COMMENT '备注',
    `disposal_time` DATETIME COMMENT '销毁时间',
    `disposal_person` VARCHAR(50) COMMENT '销毁人',
    `disposal_image` VARCHAR(255) COMMENT '销毁照片',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_sample_date (`sample_date`),
    INDEX idx_sample_no (`sample_no`),
    FOREIGN KEY (`menu_id`) REFERENCES `menu`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='留样记录表';

-- 陪餐登记表
CREATE TABLE IF NOT EXISTS `accompany_meal` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '陪餐ID',
    `meal_date` DATE NOT NULL COMMENT '陪餐日期',
    `meal_type` VARCHAR(20) NOT NULL COMMENT '餐次：BREAKFAST-早餐, LUNCH-午餐, DINNER-晚餐',
    `accompany_type` VARCHAR(20) NOT NULL COMMENT '陪餐类型：LEADER-领导陪餐, PARENT-家长陪餐',
    `accompany_person` VARCHAR(50) NOT NULL COMMENT '陪餐人姓名',
    `user_id` BIGINT COMMENT '关联用户ID（家长陪餐时关联家长账号）',
    `class_name` VARCHAR(50) COMMENT '班级（家长陪餐用）',
    `arrival_time` DATETIME COMMENT '到达时间',
    `departure_time` DATETIME COMMENT '离开时间',
    `signature_image` VARCHAR(255) COMMENT '签字图片',
    `remark` TEXT COMMENT '备注',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_meal_date (`meal_date`),
    INDEX idx_accompany_type (`accompany_type`),
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='陪餐登记表';

-- 陪餐评价表
CREATE TABLE IF NOT EXISTS `meal_evaluation` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '评价ID',
    `accompany_meal_id` BIGINT NOT NULL COMMENT '关联陪餐ID',
    `taste_score` INT NOT NULL COMMENT '口味评分：1-5分',
    `hygiene_score` INT NOT NULL COMMENT '卫生评分：1-5分',
    `service_score` INT NOT NULL COMMENT '服务评分：1-5分',
    `overall_score` DECIMAL(3,2) NOT NULL COMMENT '综合评分',
    `taste_comment` TEXT COMMENT '口味评价',
    `hygiene_comment` TEXT COMMENT '卫生评价',
    `service_comment` TEXT COMMENT '服务评价',
    `suggestion` TEXT COMMENT '改进建议',
    `images` TEXT COMMENT '评价图片（多个用逗号分隔）',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (`accompany_meal_id`) REFERENCES `accompany_meal`(`id`),
    INDEX idx_accompany_meal_id (`accompany_meal_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='陪餐评价表';

-- 卫生检查表
CREATE TABLE IF NOT EXISTS `health_inspection` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '检查ID',
    `inspection_no` VARCHAR(50) NOT NULL UNIQUE COMMENT '检查编号',
    `inspection_date` DATE NOT NULL COMMENT '检查日期',
    `inspection_type` VARCHAR(50) NOT NULL COMMENT '检查类型：DAILY-日常检查, WEEKLY-周检, MONTHLY-月检, SPECIAL-专项检查',
    `inspector` VARCHAR(50) NOT NULL COMMENT '检查人',
    `check_items` TEXT NOT NULL COMMENT '检查项（JSON格式存储）',
    `overall_result` VARCHAR(20) NOT NULL COMMENT '整体结果：PASS-合格, NEED_RECTIFY-需整改',
    `total_score` DECIMAL(5,2) COMMENT '总分',
    `issue_description` TEXT COMMENT '问题描述',
    `images` TEXT COMMENT '检查图片（多个用逗号分隔）',
    `rectify_deadline` DATE COMMENT '整改期限',
    `rectify_status` VARCHAR(20) DEFAULT 'PENDING' COMMENT '整改状态：PENDING-待整改, IN_PROGRESS-整改中, COMPLETED-已完成, VERIFIED-已复核',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_inspection_date (`inspection_date`),
    INDEX idx_rectify_status (`rectify_status`),
    INDEX idx_inspection_no (`inspection_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='卫生检查表';

-- 整改记录表（卫生检查整改闭环）
CREATE TABLE IF NOT EXISTS `rectification` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '整改ID',
    `inspection_id` BIGINT NOT NULL COMMENT '关联检查ID',
    `rectify_person` VARCHAR(50) NOT NULL COMMENT '整改责任人',
    `rectify_measure` TEXT NOT NULL COMMENT '整改措施',
    `rectify_start_date` DATE COMMENT '整改开始日期',
    `rectify_end_date` DATE COMMENT '整改完成日期',
    `rectify_images` TEXT COMMENT '整改后图片（多个用逗号分隔）',
    `rectify_description` TEXT COMMENT '整改说明',
    `verify_person` VARCHAR(50) COMMENT '复核人',
    `verify_date` DATE COMMENT '复核日期',
    `verify_result` VARCHAR(20) COMMENT '复核结果：PASS-通过, FAIL-不通过',
    `verify_comment` TEXT COMMENT '复核意见',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (`inspection_id`) REFERENCES `health_inspection`(`id`),
    INDEX idx_inspection_id (`inspection_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='整改记录表';

-- 家长监督反馈表
CREATE TABLE IF NOT EXISTS `parent_feedback` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '反馈ID',
    `parent_id` BIGINT COMMENT '家长用户ID',
    `parent_name` VARCHAR(50) NOT NULL COMMENT '家长姓名',
    `phone` VARCHAR(20) COMMENT '联系电话',
    `class_name` VARCHAR(50) COMMENT '班级',
    `student_name` VARCHAR(50) COMMENT '学生姓名',
    `feedback_type` VARCHAR(50) NOT NULL COMMENT '反馈类型：SUGGESTION-建议, COMPLAINT-投诉, PRAISE-表扬, QUESTION-咨询',
    `title` VARCHAR(200) NOT NULL COMMENT '反馈标题',
    `content` TEXT NOT NULL COMMENT '反馈内容',
    `images` TEXT COMMENT '反馈图片（多个用逗号分隔）',
    `status` VARCHAR(20) DEFAULT 'PENDING' COMMENT '状态：PENDING-待处理, PROCESSING-处理中, REPLIED-已回复, CLOSED-已关闭',
    `reply_content` TEXT COMMENT '回复内容',
    `reply_time` DATETIME COMMENT '回复时间',
    `reply_person` VARCHAR(50) COMMENT '回复人',
    `is_public` TINYINT DEFAULT 0 COMMENT '是否公开：1-是, 0-否',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_parent_id (`parent_id`),
    INDEX idx_status (`status`),
    INDEX idx_feedback_type (`feedback_type`),
    FOREIGN KEY (`parent_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='家长监督反馈表';

-- 系统公告表
CREATE TABLE IF NOT EXISTS `announcement` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '公告ID',
    `title` VARCHAR(200) NOT NULL COMMENT '公告标题',
    `content` TEXT NOT NULL COMMENT '公告内容',
    `type` VARCHAR(50) DEFAULT 'NORMAL' COMMENT '公告类型：NORMAL-普通通知, IMPORTANT-重要通知',
    `publisher` VARCHAR(50) NOT NULL COMMENT '发布人',
    `publish_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
    `is_top` TINYINT DEFAULT 0 COMMENT '是否置顶：1-是, 0-否',
    `status` TINYINT DEFAULT 1 COMMENT '状态：1-发布, 0-下架',
    `view_count` INT DEFAULT 0 COMMENT '浏览次数',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_publish_time (`publish_time`),
    INDEX idx_is_top (`is_top`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统公告表';

-- 插入初始数据
-- 初始用户（密码都是123456，BCrypt加密）
INSERT INTO `user` (`username`, `password`, `real_name`, `phone`, `role`, `status`) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '系统管理员', '13800138000', 'ADMIN', 1),
('staff01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '张厨师', '13800138001', 'STAFF', 1),
('parent01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '李家长', '13800138002', 'PARENT', 1);

-- 初始供应商
INSERT INTO `supplier` (`supplier_name`, `contact_person`, `phone`, `address`, `business_license`, `status`) VALUES
('绿源蔬菜配送中心', '王经理', '13900139001', '北京市朝阳区蔬菜批发市场A区12号', '91110101MA001ABC12', 1),
('鲜肉食品有限公司', '刘经理', '13900139002', '北京市丰台区肉类加工园区B区5号', '91110102MA002DEF34', 1),
('优质大米粮油店', '陈老板', '13900139003', '北京市海淀区粮油市场C区8号', '91110103MA003GHI56', 1);
