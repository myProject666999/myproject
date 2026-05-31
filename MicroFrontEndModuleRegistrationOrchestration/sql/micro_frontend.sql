-- =====================================================
-- 微前端模块注册与编排中心 数据库脚本
-- Database: MySQL 8.0+
-- Created: 2026-05-30
-- =====================================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `micro_frontend`
DEFAULT CHARACTER SET utf8mb4
DEFAULT COLLATE utf8mb4_unicode_ci;

USE `micro_frontend`;

-- =====================================================
-- 1. 微应用注册表 - micro_app
-- =====================================================
DROP TABLE IF EXISTS `micro_app`;
CREATE TABLE `micro_app` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `app_code` VARCHAR(64) NOT NULL COMMENT '应用编码(唯一标识)',
    `app_name` VARCHAR(128) NOT NULL COMMENT '应用名称',
    `description` VARCHAR(512) DEFAULT NULL COMMENT '应用描述',
    `current_version` VARCHAR(32) DEFAULT NULL COMMENT '当前线上版本',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0-下线 1-正常 2-灰度中',
    `owner` VARCHAR(64) DEFAULT NULL COMMENT '负责人',
    `owner_email` VARCHAR(128) DEFAULT NULL COMMENT '负责人邮箱',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除: 0-未删除 1-已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_app_code` (`app_code`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='微应用注册表';

-- =====================================================
-- 2. 应用版本表 - app_version
-- =====================================================
DROP TABLE IF EXISTS `app_version`;
CREATE TABLE `app_version` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `app_id` BIGINT NOT NULL COMMENT '关联微应用ID',
    `app_code` VARCHAR(64) NOT NULL COMMENT '应用编码',
    `version` VARCHAR(32) NOT NULL COMMENT '版本号 (语义化: x.y.z)',
    `entry_url` VARCHAR(512) NOT NULL COMMENT '应用入口地址',
    `change_log` TEXT COMMENT '版本变更日志',
    `is_active` TINYINT NOT NULL DEFAULT 0 COMMENT '是否激活: 0-未激活 1-当前线上版本',
    `compatible_framework` VARCHAR(64) DEFAULT NULL COMMENT '兼容的框架版本 (vue@3.2.0)',
    `package_size` BIGINT DEFAULT NULL COMMENT '包大小(字节)',
    `publish_time` DATETIME DEFAULT NULL COMMENT '发布时间',
    `publisher` VARCHAR(64) DEFAULT NULL COMMENT '发布人',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_app_version` (`app_id`, `version`),
    KEY `idx_app_code` (`app_code`),
    KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='应用版本表';

-- =====================================================
-- 3. 路由配置表 - route_config
-- =====================================================
DROP TABLE IF EXISTS `route_config`;
CREATE TABLE `route_config` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `route_path` VARCHAR(256) NOT NULL COMMENT '路由路径 (如: /user/list)',
    `route_name` VARCHAR(64) NOT NULL COMMENT '路由名称',
    `app_id` BIGINT NOT NULL COMMENT '关联微应用ID',
    `app_code` VARCHAR(64) NOT NULL COMMENT '应用编码',
    `menu_name` VARCHAR(64) DEFAULT NULL COMMENT '菜单名称',
    `menu_icon` VARCHAR(64) DEFAULT NULL COMMENT '菜单图标',
    `parent_id` BIGINT DEFAULT 0 COMMENT '父级路由ID (0表示顶级)',
    `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序号 (越小越靠前)',
    `is_visible` TINYINT NOT NULL DEFAULT 1 COMMENT '是否显示在菜单: 0-隐藏 1-显示',
    `is_cache` TINYINT NOT NULL DEFAULT 0 COMMENT '是否缓存页面: 0-不缓存 1-缓存',
    `permission_code` VARCHAR(128) DEFAULT NULL COMMENT '权限标识',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用 1-启用',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_route_path` (`route_path`),
    KEY `idx_app_id` (`app_id`),
    KEY `idx_parent_id` (`parent_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='路由配置表';

-- =====================================================
-- 4. 运行时配置表 - runtime_config
-- =====================================================
DROP TABLE IF EXISTS `runtime_config`;
CREATE TABLE `runtime_config` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `config_key` VARCHAR(128) NOT NULL COMMENT '配置键',
    `config_value` TEXT NOT NULL COMMENT '配置值',
    `config_type` VARCHAR(32) NOT NULL DEFAULT 'string' COMMENT '配置类型: string/json/number/boolean',
    `description` VARCHAR(512) DEFAULT NULL COMMENT '配置描述',
    `app_id` BIGINT DEFAULT NULL COMMENT '关联应用ID (NULL表示全局配置)',
    `app_code` VARCHAR(64) DEFAULT NULL COMMENT '应用编码',
    `is_global` TINYINT NOT NULL DEFAULT 0 COMMENT '是否全局配置: 0-应用级 1-全局',
    `version` INT NOT NULL DEFAULT 1 COMMENT '配置版本号 (乐观锁)',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用 1-启用',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `updated_by` VARCHAR(64) DEFAULT NULL COMMENT '更新人',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_key_app` (`config_key`, `app_code`),
    KEY `idx_app_id` (`app_id`),
    KEY `idx_is_global` (`is_global`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='运行时配置表';

-- =====================================================
-- 5. 配置发布记录表 - config_publish
-- =====================================================
DROP TABLE IF EXISTS `config_publish`;
CREATE TABLE `config_publish` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `publish_no` VARCHAR(64) NOT NULL COMMENT '发布单号',
    `app_id` BIGINT DEFAULT NULL COMMENT '关联应用ID',
    `app_code` VARCHAR(64) DEFAULT NULL COMMENT '应用编码',
    `config_snapshot` LONGTEXT NOT NULL COMMENT '配置快照(JSON格式)',
    `publish_type` VARCHAR(32) NOT NULL COMMENT '发布类型: full-全量 increment-增量',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0-待发布 1-发布中 2-发布成功 3-发布失败',
    `push_status` TINYINT NOT NULL DEFAULT 0 COMMENT '推送状态: 0-未推送 1-推送中 2-推送完成 3-部分失败',
    `affected_clients` INT DEFAULT 0 COMMENT '受影响客户端数量',
    `publisher` VARCHAR(64) DEFAULT NULL COMMENT '发布人',
    `publish_time` DATETIME DEFAULT NULL COMMENT '发布时间',
    `remark` VARCHAR(512) DEFAULT NULL COMMENT '发布备注',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_publish_no` (`publish_no`),
    KEY `idx_app_id` (`app_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='配置发布记录表';

-- =====================================================
-- 6. 灰度发布表 - gray_release
-- =====================================================
DROP TABLE IF EXISTS `gray_release`;
CREATE TABLE `gray_release` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `gray_no` VARCHAR(64) NOT NULL COMMENT '灰度单号',
    `app_id` BIGINT NOT NULL COMMENT '关联微应用ID',
    `app_code` VARCHAR(64) NOT NULL COMMENT '应用编码',
    `target_version_id` BIGINT NOT NULL COMMENT '目标版本ID',
    `target_version` VARCHAR(32) NOT NULL COMMENT '目标版本号',
    `base_version_id` BIGINT NOT NULL COMMENT '基准版本ID',
    `base_version` VARCHAR(32) NOT NULL COMMENT '基准版本号',
    `gray_type` VARCHAR(32) NOT NULL COMMENT '灰度类型: USER-按用户 PROPORTION-按比例',
    `gray_value` VARCHAR(256) NOT NULL COMMENT '灰度值: 用户ID列表/百分比(0-100)',
    `gray_rule` TEXT COMMENT '灰度规则 (JSON格式, 支持复杂条件)',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0-待开始 1-灰度中 2-已暂停 3-已全量 4-已回滚',
    `start_time` DATETIME DEFAULT NULL COMMENT '开始时间',
    `end_time` DATETIME DEFAULT NULL COMMENT '结束时间',
    `hit_count` BIGINT NOT NULL DEFAULT 0 COMMENT '命中次数',
    `total_count` BIGINT NOT NULL DEFAULT 0 COMMENT '总访问次数',
    `creator` VARCHAR(64) DEFAULT NULL COMMENT '创建人',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_gray_no` (`gray_no`),
    KEY `idx_app_id` (`app_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='灰度发布表';

-- =====================================================
-- 7. 灰度用户表 - gray_user
-- =====================================================
DROP TABLE IF EXISTS `gray_user`;
CREATE TABLE `gray_user` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `gray_release_id` BIGINT NOT NULL COMMENT '关联灰度发布ID',
    `user_id` VARCHAR(64) NOT NULL COMMENT '用户ID',
    `user_name` VARCHAR(64) DEFAULT NULL COMMENT '用户名称',
    `user_type` VARCHAR(32) DEFAULT 'NORMAL' COMMENT '用户类型: INNER-内部员工 NORMAL-普通用户 VIP-VIP用户',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_gray_user` (`gray_release_id`, `user_id`),
    KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='灰度用户表';

-- =====================================================
-- 8. 应用依赖表 - app_dependency
-- =====================================================
DROP TABLE IF EXISTS `app_dependency`;
CREATE TABLE `app_dependency` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `app_id` BIGINT NOT NULL COMMENT '当前应用ID',
    `app_code` VARCHAR(64) NOT NULL COMMENT '当前应用编码',
    `app_version_id` BIGINT NOT NULL COMMENT '当前应用版本ID',
    `app_version` VARCHAR(32) NOT NULL COMMENT '当前应用版本',
    `dependency_type` VARCHAR(32) NOT NULL DEFAULT 'APP' COMMENT '依赖类型: APP-应用依赖 LIB-库依赖',
    `dependency_code` VARCHAR(64) NOT NULL COMMENT '依赖项编码 (应用编码/库名称)',
    `dependency_name` VARCHAR(128) DEFAULT NULL COMMENT '依赖项名称',
    `min_version` VARCHAR(32) DEFAULT NULL COMMENT '最小兼容版本',
    `max_version` VARCHAR(32) DEFAULT NULL COMMENT '最大兼容版本',
    `is_required` TINYINT NOT NULL DEFAULT 1 COMMENT '是否必填: 0-可选 1-必填',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_app_id` (`app_id`),
    KEY `idx_dependency_code` (`dependency_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='应用依赖表';

-- =====================================================
-- 9. 健康检查表 - health_check
-- =====================================================
DROP TABLE IF EXISTS `health_check`;
CREATE TABLE `health_check` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `app_id` BIGINT NOT NULL COMMENT '关联应用ID',
    `app_code` VARCHAR(64) NOT NULL COMMENT '应用编码',
    `check_url` VARCHAR(512) NOT NULL COMMENT '健康检查URL',
    `check_interval` INT NOT NULL DEFAULT 60 COMMENT '检查间隔(秒)',
    `timeout` INT NOT NULL DEFAULT 10 COMMENT '超时时间(秒)',
    `success_threshold` INT NOT NULL DEFAULT 3 COMMENT '连续成功多少次标记为健康',
    `fail_threshold` INT NOT NULL DEFAULT 3 COMMENT '连续失败多少次标记为异常',
    `auto_offline` TINYINT NOT NULL DEFAULT 1 COMMENT '异常时是否自动下线: 0-否 1-是',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0-未启用 1-启用',
    `health_status` TINYINT NOT NULL DEFAULT 1 COMMENT '健康状态: 0-异常 1-健康 2-未知',
    `last_check_time` DATETIME DEFAULT NULL COMMENT '最后检查时间',
    `last_check_result` TEXT COMMENT '最后检查结果',
    `last_response_time` INT DEFAULT NULL COMMENT '最后响应时间(毫秒)',
    `consecutive_success` INT NOT NULL DEFAULT 0 COMMENT '连续成功次数',
    `consecutive_fail` INT NOT NULL DEFAULT 0 COMMENT '连续失败次数',
    `last_offline_time` DATETIME DEFAULT NULL COMMENT '最后下线时间',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_app_id` (`app_id`),
    KEY `idx_health_status` (`health_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='健康检查表';

-- =====================================================
-- 10. 健康检查历史表 - health_check_history
-- =====================================================
DROP TABLE IF EXISTS `health_check_history`;
CREATE TABLE `health_check_history` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `app_id` BIGINT NOT NULL COMMENT '关联应用ID',
    `app_code` VARCHAR(64) NOT NULL COMMENT '应用编码',
    `check_time` DATETIME NOT NULL COMMENT '检查时间',
    `check_result` TINYINT NOT NULL COMMENT '检查结果: 0-失败 1-成功',
    `response_time` INT DEFAULT NULL COMMENT '响应时间(毫秒)',
    `error_message` VARCHAR(1024) DEFAULT NULL COMMENT '错误信息',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_app_id` (`app_id`),
    KEY `idx_check_time` (`check_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='健康检查历史表';

-- =====================================================
-- 11. 变更审计表 - audit_log
-- =====================================================
DROP TABLE IF EXISTS `audit_log`;
CREATE TABLE `audit_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `audit_no` VARCHAR(64) NOT NULL COMMENT '审计流水号',
    `operation_type` VARCHAR(32) NOT NULL COMMENT '操作类型: CREATE-新增 UPDATE-修改 DELETE-删除 PUBLISH-发布 ROLLBACK-回滚',
    `module` VARCHAR(64) NOT NULL COMMENT '操作模块: APP-应用 ROUTE-路由 CONFIG-配置 GRAY-灰度 HEALTH-健康检查',
    `target_table` VARCHAR(64) DEFAULT NULL COMMENT '目标表名',
    `target_id` BIGINT DEFAULT NULL COMMENT '目标记录ID',
    `target_key` VARCHAR(128) DEFAULT NULL COMMENT '目标业务标识',
    `operator` VARCHAR(64) DEFAULT NULL COMMENT '操作人',
    `operator_ip` VARCHAR(64) DEFAULT NULL COMMENT '操作人IP',
    `old_value` LONGTEXT COMMENT '变更前值 (JSON格式)',
    `new_value` LONGTEXT COMMENT '变更后值 (JSON格式)',
    `change_summary` VARCHAR(512) DEFAULT NULL COMMENT '变更摘要',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_audit_no` (`audit_no`),
    KEY `idx_module` (`module`),
    KEY `idx_operation_type` (`operation_type`),
    KEY `idx_target` (`target_table`, `target_id`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='变更审计表';

-- =====================================================
-- 12. 客户端注册表 - client_registry
-- =====================================================
DROP TABLE IF EXISTS `client_registry`;
CREATE TABLE `client_registry` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `client_id` VARCHAR(64) NOT NULL COMMENT '客户端唯一标识',
    `client_type` VARCHAR(32) DEFAULT NULL COMMENT '客户端类型: BROWSER-浏览器 MOBILE-移动端',
    `app_code` VARCHAR(64) DEFAULT NULL COMMENT '当前加载的应用编码',
    `app_version` VARCHAR(32) DEFAULT NULL COMMENT '当前加载的应用版本',
    `config_version` INT DEFAULT NULL COMMENT '当前配置版本',
    `ip_address` VARCHAR(64) DEFAULT NULL COMMENT '客户端IP',
    `user_agent` VARCHAR(512) DEFAULT NULL COMMENT 'User-Agent',
    `user_id` VARCHAR(64) DEFAULT NULL COMMENT '登录用户ID',
    `last_heartbeat` DATETIME DEFAULT NULL COMMENT '最后心跳时间',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0-离线 1-在线',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_client_id` (`client_id`),
    KEY `idx_app_code` (`app_code`),
    KEY `idx_status` (`status`),
    KEY `idx_last_heartbeat` (`last_heartbeat`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客户端注册表';

-- =====================================================
-- 初始化数据
-- =====================================================

-- 初始化示例微应用
INSERT INTO `micro_app` (`app_code`, `app_name`, `description`, `current_version`, `status`, `owner`, `owner_email`) VALUES
('app-user', '用户中心', '用户管理、权限控制、个人中心等功能', '1.0.0', 1, '张三', 'zhangsan@example.com'),
('app-order', '订单中心', '订单管理、支付、退款等功能', '2.1.0', 1, '李四', 'lisi@example.com'),
('app-product', '商品中心', '商品管理、库存、类目等功能', '1.2.0', 1, '王五', 'wangwu@example.com'),
('app-dashboard', '数据看板', '数据可视化、报表统计等功能', '3.0.0', 1, '赵六', 'zhaoliu@example.com'),
('app-setting', '系统设置', '系统参数配置、字典管理等功能', '1.0.0', 1, '钱七', 'qianqi@example.com');

-- 初始化应用版本
INSERT INTO `app_version` (`app_id`, `app_code`, `version`, `entry_url`, `change_log`, `is_active`, `compatible_framework`, `publish_time`, `publisher`) VALUES
(1, 'app-user', '1.0.0', 'http://localhost:8081/app-user/remoteEntry.js', '初始版本，包含用户列表、用户详情、角色管理功能', 1, 'vue@3.2.0', NOW(), 'admin'),
(2, 'app-order', '2.0.0', 'http://localhost:8082/app-order/remoteEntry.js', '重构版本，优化订单查询性能', 0, 'vue@3.2.0', '2026-05-01 10:00:00', 'admin'),
(2, 'app-order', '2.1.0', 'http://localhost:8082/app-order/remoteEntry.js', '新增退款审批流程，修复已知bug', 1, 'vue@3.2.0', '2026-05-15 14:30:00', 'admin'),
(3, 'app-product', '1.2.0', 'http://localhost:8083/app-product/remoteEntry.js', '新增库存预警功能', 1, 'vue@3.2.0', NOW(), 'admin'),
(4, 'app-dashboard', '3.0.0', 'http://localhost:8084/app-dashboard/remoteEntry.js', '大版本升级，全新UI设计，支持自定义看板', 1, 'vue@3.2.0', NOW(), 'admin'),
(5, 'app-setting', '1.0.0', 'http://localhost:8085/app-setting/remoteEntry.js', '初始版本，系统设置功能', 1, 'vue@3.2.0', NOW(), 'admin');

-- 初始化路由配置
INSERT INTO `route_config` (`route_path`, `route_name`, `app_id`, `app_code`, `menu_name`, `menu_icon`, `parent_id`, `sort_order`, `is_visible`, `permission_code`) VALUES
('/dashboard', 'Dashboard', 4, 'app-dashboard', '数据看板', 'Dashboard', 0, 1, 1, 'dashboard:view'),
('/user', 'User', 1, 'app-user', '用户中心', 'User', 0, 2, 1, 'user:view'),
('/user/list', 'UserList', 1, 'app-user', '用户列表', 'List', 2, 1, 1, 'user:list'),
('/user/role', 'RoleManage', 1, 'app-user', '角色管理', 'Setting', 2, 2, 1, 'user:role'),
('/product', 'Product', 3, 'app-product', '商品中心', 'Goods', 0, 3, 1, 'product:view'),
('/product/list', 'ProductList', 3, 'app-product', '商品列表', 'List', 5, 1, 1, 'product:list'),
('/product/category', 'Category', 3, 'app-product', '商品类目', 'Menu', 5, 2, 1, 'product:category'),
('/order', 'Order', 2, 'app-order', '订单中心', 'Tickets', 0, 4, 1, 'order:view'),
('/order/list', 'OrderList', 2, 'app-order', '订单列表', 'List', 8, 1, 1, 'order:list'),
('/order/refund', 'Refund', 2, 'app-order', '退款管理', 'Money', 8, 2, 1, 'order:refund'),
('/setting', 'Setting', 5, 'app-setting', '系统设置', 'Tools', 0, 99, 1, 'setting:view');

-- 初始化全局配置
INSERT INTO `runtime_config` (`config_key`, `config_value`, `config_type`, `description`, `is_global`, `status`, `updated_by`) VALUES
('system.title', '微前端管理平台', 'string', '系统标题', 1, 1, 'admin'),
('system.logo', '/logo.png', 'string', '系统Logo地址', 1, 1, 'admin'),
('system.theme', '{"primaryColor":"#1890ff","layout":"side"}', 'json', '系统主题配置', 1, 1, 'admin'),
('system.timeout', '30000', 'number', '请求超时时间(毫秒)', 1, 1, 'admin'),
('feature.grayMode', 'true', 'boolean', '是否开启灰度模式', 1, 1, 'admin');

-- 初始化应用级配置
INSERT INTO `runtime_config` (`config_key`, `config_value`, `config_type`, `description`, `app_id`, `app_code`, `is_global`, `status`, `updated_by`) VALUES
('user.pageSize', '20', 'number', '用户列表默认分页大小', 1, 'app-user', 0, 1, 'admin'),
('user.allowDelete', 'true', 'boolean', '是否允许删除用户', 1, 'app-user', 0, 1, 'admin'),
('order.autoCancelTime', '1800', 'number', '订单自动取消时间(秒)', 2, 'app-order', 0, 1, 'admin'),
('product.warningStock', '10', 'number', '库存预警阈值', 3, 'app-product', 0, 1, 'admin');

-- 初始化健康检查配置
INSERT INTO `health_check` (`app_id`, `app_code`, `check_url`, `check_interval`, `timeout`, `success_threshold`, `fail_threshold`, `auto_offline`, `status`) VALUES
(1, 'app-user', 'http://localhost:8081/health', 30, 10, 3, 3, 1, 1),
(2, 'app-order', 'http://localhost:8082/health', 30, 10, 3, 3, 1, 1),
(3, 'app-product', 'http://localhost:8083/health', 30, 10, 3, 3, 1, 1),
(4, 'app-dashboard', 'http://localhost:8084/health', 30, 10, 3, 3, 1, 1),
(5, 'app-setting', 'http://localhost:8085/health', 30, 10, 3, 3, 1, 1);

-- 初始化依赖关系
INSERT INTO `app_dependency` (`app_id`, `app_code`, `app_version_id`, `app_version`, `dependency_type`, `dependency_code`, `dependency_name`, `min_version`, `max_version`, `is_required`) VALUES
(2, 'app-order', 3, '2.1.0', 'APP', 'app-user', '用户中心', '1.0.0', NULL, 1),
(2, 'app-order', 3, '2.1.0', 'APP', 'app-product', '商品中心', '1.0.0', NULL, 1),
(3, 'app-product', 4, '1.2.0', 'LIB', 'element-plus', 'Element Plus', '2.0.0', '3.0.0', 1),
(4, 'app-dashboard', 5, '3.0.0', 'LIB', 'echarts', 'ECharts', '5.0.0', NULL, 1);

-- =====================================================
-- 结束
-- =====================================================
