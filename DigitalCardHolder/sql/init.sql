CREATE DATABASE IF NOT EXISTS digital_card_holder DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE digital_card_holder;

DROP TABLE IF EXISTS `card`;
DROP TABLE IF EXISTS `card_group`;
DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password` VARCHAR(100) NOT NULL COMMENT '密码',
  `nickname` VARCHAR(50) DEFAULT NULL COMMENT '昵称',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

CREATE TABLE `card_group` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '分组ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `name` VARCHAR(50) NOT NULL COMMENT '分组名称',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_group_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='名片分组表';

CREATE TABLE `card` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '名片ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `group_id` BIGINT DEFAULT NULL COMMENT '分组ID',
  `name` VARCHAR(50) NOT NULL COMMENT '姓名',
  `title` VARCHAR(100) DEFAULT NULL COMMENT '职位',
  `company` VARCHAR(100) DEFAULT NULL COMMENT '公司',
  `department` VARCHAR(100) DEFAULT NULL COMMENT '部门',
  `mobile` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '座机',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  `website` VARCHAR(255) DEFAULT NULL COMMENT '网站',
  `address` VARCHAR(255) DEFAULT NULL COMMENT '地址',
  `fax` VARCHAR(20) DEFAULT NULL COMMENT '传真',
  `wechat` VARCHAR(50) DEFAULT NULL COMMENT '微信',
  `qq` VARCHAR(20) DEFAULT NULL COMMENT 'QQ',
  `remark` TEXT DEFAULT NULL COMMENT '备注',
  `front_image` VARCHAR(255) DEFAULT NULL COMMENT '名片正面图片',
  `back_image` VARCHAR(255) DEFAULT NULL COMMENT '名片背面图片',
  `is_favorite` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否收藏 0-否 1-是',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_group_id` (`group_id`),
  KEY `idx_name` (`name`),
  KEY `idx_company` (`company`),
  CONSTRAINT `fk_card_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_card_group` FOREIGN KEY (`group_id`) REFERENCES `card_group` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='名片表';

INSERT INTO `user` (`username`, `password`, `nickname`) VALUES 
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '管理员');

INSERT INTO `card_group` (`user_id`, `name`, `sort_order`) VALUES 
(1, '默认分组', 1),
(1, '客户', 2),
(1, '同事', 3),
(1, '朋友', 4);

INSERT INTO `card` (`user_id`, `group_id`, `name`, `title`, `company`, `department`, `mobile`, `phone`, `email`, `address`, `is_favorite`) VALUES 
(1, 1, '张三', '产品经理', '科技有限公司', '产品部', '13800138001', '010-12345678', 'zhangsan@example.com', '北京市朝阳区科技园区1号楼', 1),
(1, 2, '李四', '销售总监', '贸易有限公司', '销售部', '13800138002', '021-87654321', 'lisi@example.com', '上海市浦东新区贸易大厦', 0),
(1, 3, '王五', '工程师', '软件公司', '研发部', '13800138003', '0755-11112222', 'wangwu@example.com', '深圳市南山区科技园', 0);
