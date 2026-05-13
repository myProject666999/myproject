
DROP DATABASE IF EXISTS ktv_booking_system;
CREATE DATABASE ktv_booking_system DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ktv_booking_system;

-- 1. 用户表 (管理员、会员、员工)
CREATE TABLE `user` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码',
  `phone` VARCHAR(20) COMMENT '手机号',
  `real_name` VARCHAR(50) COMMENT '真实姓名',
  `role` VARCHAR(20) NOT NULL DEFAULT 'MEMBER' COMMENT '角色: ADMIN-管理员, STAFF-员工, MEMBER-会员',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-正常, 0-禁用',
  `member_level` VARCHAR(20) COMMENT '会员等级: NORMAL-普通, SILVER-银卡, GOLD-金卡, DIAMOND-钻石',
  `balance` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '余额',
  `points` INT NOT NULL DEFAULT 0 COMMENT '积分',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_phone` (`phone`),
  INDEX `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 2. 包厢类型表
CREATE TABLE `room_type` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '类型ID',
  `name` VARCHAR(50) NOT NULL COMMENT '类型名称: 小包、中包、大包、VIP包',
  `capacity` INT NOT NULL COMMENT '容纳人数',
  `description` VARCHAR(255) COMMENT '描述',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='包厢类型表';

-- 3. 时段表
CREATE TABLE `time_slot` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '时段ID',
  `name` VARCHAR(50) NOT NULL COMMENT '时段名称: 早场、午场、晚场、夜场',
  `start_time` TIME NOT NULL COMMENT '开始时间',
  `end_time` TIME NOT NULL COMMENT '结束时间',
  `description` VARCHAR(255) COMMENT '描述',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='时段表';

-- 4. 包厢价格表 (包厢类型 + 时段 = 价格)
CREATE TABLE `room_price` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '价格ID',
  `room_type_id` BIGINT NOT NULL COMMENT '包厢类型ID',
  `time_slot_id` BIGINT NOT NULL COMMENT '时段ID',
  `price_per_hour` DECIMAL(10,2) NOT NULL COMMENT '每小时价格',
  `deposit_amount` DECIMAL(10,2) NOT NULL COMMENT '押金金额',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-启用, 0-禁用',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_room_type` (`room_type_id`),
  INDEX `idx_time_slot` (`time_slot_id`),
  FOREIGN KEY (`room_type_id`) REFERENCES `room_type`(`id`),
  FOREIGN KEY (`time_slot_id`) REFERENCES `time_slot`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='包厢价格表';

-- 5. 包厢表
CREATE TABLE `room` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '包厢ID',
  `room_no` VARCHAR(20) NOT NULL UNIQUE COMMENT '包厢号',
  `room_type_id` BIGINT NOT NULL COMMENT '包厢类型ID',
  `status` VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' COMMENT '状态: AVAILABLE-可用, OCCUPIED-使用中, MAINTENANCE-维护中',
  `equipment` VARCHAR(255) COMMENT '设备描述',
  `description` VARCHAR(255) COMMENT '描述',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_room_type` (`room_type_id`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`room_type_id`) REFERENCES `room_type`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='包厢表';

-- 6. 预订表
CREATE TABLE `booking` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '预订ID',
  `booking_no` VARCHAR(32) NOT NULL UNIQUE COMMENT '预订编号',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `room_id` BIGINT NOT NULL COMMENT '包厢ID',
  `room_type_id` BIGINT NOT NULL COMMENT '包厢类型ID',
  `time_slot_id` BIGINT NOT NULL COMMENT '时段ID',
  `booking_date` DATE NOT NULL COMMENT '预订日期',
  `start_time` TIME NOT NULL COMMENT '开始时间',
  `end_time` TIME NOT NULL COMMENT '结束时间',
  `hours` INT NOT NULL COMMENT '预订时长(小时)',
  `deposit_amount` DECIMAL(10,2) NOT NULL COMMENT '押金金额',
  `room_fee` DECIMAL(10,2) NOT NULL COMMENT '包厢费用',
  `total_amount` DECIMAL(10,2) NOT NULL COMMENT '总金额(押金+包厢费)',
  `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '状态: PENDING-待确认, CONFIRMED-已确认, CHECKED_IN-已入住, COMPLETED-已完成, CANCELLED-已取消',
  `remark` VARCHAR(255) COMMENT '备注',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_room_id` (`room_id`),
  INDEX `idx_booking_date` (`booking_date`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
  FOREIGN KEY (`room_id`) REFERENCES `room`(`id`),
  FOREIGN KEY (`room_type_id`) REFERENCES `room_type`(`id`),
  FOREIGN KEY (`time_slot_id`) REFERENCES `time_slot`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预订表';

-- 7. 酒水类别表
CREATE TABLE `drink_category` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '类别ID',
  `name` VARCHAR(50) NOT NULL COMMENT '类别名称',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='酒水类别表';

-- 8. 酒水表
CREATE TABLE `drink` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '酒水ID',
  `category_id` BIGINT NOT NULL COMMENT '类别ID',
  `name` VARCHAR(100) NOT NULL COMMENT '酒水名称',
  `price` DECIMAL(10,2) NOT NULL COMMENT '价格',
  `unit` VARCHAR(20) NOT NULL COMMENT '单位: 瓶、杯、听',
  `stock` INT NOT NULL DEFAULT 0 COMMENT '库存',
  `description` VARCHAR(255) COMMENT '描述',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-上架, 0-下架',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_category_id` (`category_id`),
  FOREIGN KEY (`category_id`) REFERENCES `drink_category`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='酒水表';

-- 9. 点单表
CREATE TABLE `order` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '订单ID',
  `order_no` VARCHAR(32) NOT NULL UNIQUE COMMENT '订单编号',
  `booking_id` BIGINT COMMENT '预订ID(可为空，现场点单)',
  `room_id` BIGINT COMMENT '包厢ID',
  `user_id` BIGINT COMMENT '用户ID',
  `total_amount` DECIMAL(10,2) NOT NULL COMMENT '总金额',
  `discount_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '优惠金额',
  `payment_amount` DECIMAL(10,2) NOT NULL COMMENT '实付金额',
  `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '状态: PENDING-待支付, PAID-已支付, DELIVERING-配送中, COMPLETED-已完成, CANCELLED-已取消',
  `remark` VARCHAR(255) COMMENT '备注',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_booking_id` (`booking_id`),
  INDEX `idx_room_id` (`room_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`booking_id`) REFERENCES `booking`(`id`),
  FOREIGN KEY (`room_id`) REFERENCES `room`(`id`),
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='点单表';

-- 10. 点单明细表
CREATE TABLE `order_detail` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '明细ID',
  `order_id` BIGINT NOT NULL COMMENT '订单ID',
  `drink_id` BIGINT NOT NULL COMMENT '酒水ID',
  `drink_name` VARCHAR(100) NOT NULL COMMENT '酒水名称快照',
  `price` DECIMAL(10,2) NOT NULL COMMENT '单价快照',
  `quantity` INT NOT NULL COMMENT '数量',
  `subtotal` DECIMAL(10,2) NOT NULL COMMENT '小计',
  `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '状态: PENDING-待配送, DELIVERING-配送中, DELIVERED-已送达',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_drink_id` (`drink_id`),
  FOREIGN KEY (`order_id`) REFERENCES `order`(`id`),
  FOREIGN KEY (`drink_id`) REFERENCES `drink`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='点单明细表';

-- 11. 歌曲库表
CREATE TABLE `song` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '歌曲ID',
  `name` VARCHAR(100) NOT NULL COMMENT '歌曲名称',
  `singer` VARCHAR(100) COMMENT '歌手',
  `album` VARCHAR(100) COMMENT '专辑',
  `language` VARCHAR(20) COMMENT '语言',
  `genre` VARCHAR(50) COMMENT '类型',
  `duration` INT COMMENT '时长(秒)',
  `play_count` INT NOT NULL DEFAULT 0 COMMENT '播放次数',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-可用, 0-下架',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_name` (`name`),
  INDEX `idx_singer` (`singer`),
  INDEX `idx_language` (`language`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='歌曲库表';

-- 12. 点歌队列表
CREATE TABLE `song_queue` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '队列ID',
  `room_id` BIGINT NOT NULL COMMENT '包厢ID',
  `song_id` BIGINT NOT NULL COMMENT '歌曲ID',
  `user_id` BIGINT COMMENT '点歌用户ID',
  `queue_order` INT NOT NULL COMMENT '队列顺序',
  `status` VARCHAR(20) NOT NULL DEFAULT 'QUEUED' COMMENT '状态: QUEUED-已点歌, PLAYING-正在播放, PLAYED-已播放, SKIPPED-已跳过',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '点歌时间',
  `play_time` DATETIME COMMENT '开始播放时间',
  INDEX `idx_room_id` (`room_id`),
  INDEX `idx_song_id` (`song_id`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`room_id`) REFERENCES `room`(`id`),
  FOREIGN KEY (`song_id`) REFERENCES `song`(`id`),
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='点歌队列表';

-- 13. 结账记录表
CREATE TABLE `checkout` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '结账ID',
  `checkout_no` VARCHAR(32) NOT NULL UNIQUE COMMENT '结账编号',
  `booking_id` BIGINT NOT NULL COMMENT '预订ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `room_fee` DECIMAL(10,2) NOT NULL COMMENT '包厢费用',
  `drink_total` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '酒水费用',
  `other_fee` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '其他费用',
  `total_amount` DECIMAL(10,2) NOT NULL COMMENT '总费用',
  `discount_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '优惠金额',
  `deposit_return` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '退还押金',
  `payment_amount` DECIMAL(10,2) NOT NULL COMMENT '实付金额',
  `payment_method` VARCHAR(20) COMMENT '支付方式: CASH-现金, WECHAT-微信, ALIPAY-支付宝, CARD-刷卡',
  `member_discount_rate` DECIMAL(3,2) COMMENT '会员折扣率',
  `status` VARCHAR(20) NOT NULL DEFAULT 'COMPLETED' COMMENT '状态: COMPLETED-已完成, REFUNDED-已退款',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '结账时间',
  INDEX `idx_booking_id` (`booking_id`),
  INDEX `idx_user_id` (`user_id`),
  FOREIGN KEY (`booking_id`) REFERENCES `booking`(`id`),
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='结账记录表';

-- 14. 支付记录表
CREATE TABLE `payment` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '支付ID',
  `payment_no` VARCHAR(32) NOT NULL UNIQUE COMMENT '支付流水号',
  `order_no` VARCHAR(32) COMMENT '关联订单号(预订或点单)',
  `user_id` BIGINT COMMENT '用户ID',
  `amount` DECIMAL(10,2) NOT NULL COMMENT '支付金额',
  `payment_method` VARCHAR(20) NOT NULL COMMENT '支付方式',
  `status` VARCHAR(20) NOT NULL DEFAULT 'SUCCESS' COMMENT '状态: PENDING-支付中, SUCCESS-成功, FAILED-失败, REFUNDED-已退款',
  `transaction_id` VARCHAR(100) COMMENT '第三方交易号',
  `remark` VARCHAR(255) COMMENT '备注',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '支付时间',
  INDEX `idx_order_no` (`order_no`),
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='支付记录表';

-- 15. 会员等级折扣表
CREATE TABLE `member_discount` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
  `level` VARCHAR(20) NOT NULL UNIQUE COMMENT '会员等级',
  `level_name` VARCHAR(50) NOT NULL COMMENT '等级名称',
  `discount_rate` DECIMAL(3,2) NOT NULL COMMENT '折扣率: 0.95=95折',
  `min_points` INT NOT NULL COMMENT '最低积分',
  `description` VARCHAR(255) COMMENT '描述',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会员等级折扣表';
