-- 创建数据库
CREATE DATABASE IF NOT EXISTS billiards_room DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE billiards_room;

-- 用户表（员工/管理员）
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  real_name VARCHAR(50) NOT NULL,
  role ENUM('admin', 'staff') DEFAULT 'staff',
  phone VARCHAR(20),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 球台类型表
CREATE TABLE IF NOT EXISTS table_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  hourly_rate DECIMAL(10, 2) NOT NULL COMMENT '每小时费用',
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 球台表
CREATE TABLE IF NOT EXISTS tables (
  id INT PRIMARY KEY AUTO_INCREMENT,
  table_number VARCHAR(20) UNIQUE NOT NULL,
  type_id INT NOT NULL,
  status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available',
  position VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (type_id) REFERENCES table_types(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 商品类别表
CREATE TABLE IF NOT EXISTS product_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 商品表
CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  category_id INT,
  price DECIMAL(10, 2) NOT NULL,
  cost_price DECIMAL(10, 2),
  stock INT DEFAULT 0,
  unit VARCHAR(20) DEFAULT '个',
  barcode VARCHAR(50),
  description TEXT,
  is_active TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES product_categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 会员表
CREATE TABLE IF NOT EXISTS members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  member_no VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(50) NOT NULL,
  phone VARCHAR(20) UNIQUE,
  gender ENUM('male', 'female', 'other'),
  balance DECIMAL(10, 2) DEFAULT 0,
  total_recharge DECIMAL(10, 2) DEFAULT 0,
  total_consumption DECIMAL(10, 2) DEFAULT 0,
  level INT DEFAULT 1 COMMENT '会员等级',
  status ENUM('active', 'inactive', 'frozen') DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 会员充值记录表
CREATE TABLE IF NOT EXISTS member_recharge_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  member_id INT NOT NULL,
  recharge_amount DECIMAL(10, 2) NOT NULL,
  gift_amount DECIMAL(10, 2) DEFAULT 0,
  payment_method ENUM('cash', 'wechat', 'alipay', 'card', 'other') DEFAULT 'cash',
  operator_id INT,
  remark TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id),
  FOREIGN KEY (operator_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 订单主表
CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_no VARCHAR(50) UNIQUE NOT NULL,
  table_id INT,
  member_id INT,
  order_type ENUM('table', 'product', 'combo') DEFAULT 'combo',
  table_duration DECIMAL(10, 2) DEFAULT 0 COMMENT '球台使用时长(分钟)',
  table_fee DECIMAL(10, 2) DEFAULT 0,
  product_total DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  actual_amount DECIMAL(10, 2) NOT NULL,
  payment_method ENUM('cash', 'wechat', 'alipay', 'member', 'other') DEFAULT 'cash',
  status ENUM('pending', 'paid', 'cancelled', 'refunded') DEFAULT 'pending',
  operator_id INT,
  remark TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (table_id) REFERENCES tables(id),
  FOREIGN KEY (member_id) REFERENCES members(id),
  FOREIGN KEY (operator_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 球台使用记录表
CREATE TABLE IF NOT EXISTS table_usage_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  table_id INT NOT NULL,
  order_id INT,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  duration_minutes INT DEFAULT 0,
  hourly_rate DECIMAL(10, 2) NOT NULL,
  status ENUM('playing', 'paused', 'completed') DEFAULT 'playing',
  pause_count INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (table_id) REFERENCES tables(id),
  FOREIGN KEY (order_id) REFERENCES orders(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 订单商品明细表
CREATE TABLE IF NOT EXISTS order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT,
  product_name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 设备维护记录表
CREATE TABLE IF NOT EXISTS maintenance_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  table_id INT,
  equipment_name VARCHAR(100) NOT NULL,
  issue_description TEXT NOT NULL,
  repair_description TEXT,
  cost DECIMAL(10, 2) DEFAULT 0,
  status ENUM('pending', 'repairing', 'completed') DEFAULT 'pending',
  operator_id INT,
  handler_id INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (table_id) REFERENCES tables(id),
  FOREIGN KEY (operator_id) REFERENCES users(id),
  FOREIGN KEY (handler_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 球杆出租表
CREATE TABLE IF NOT EXISTS cue_rentals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT,
  cue_id VARCHAR(50) NOT NULL,
  customer_name VARCHAR(50),
  phone VARCHAR(20),
  deposit DECIMAL(10, 2) NOT NULL,
  rental_hourly_rate DECIMAL(10, 2) NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  duration DECIMAL(10, 2) DEFAULT 0,
  rental_fee DECIMAL(10, 2) DEFAULT 0,
  actual_returned TINYINT DEFAULT 0,
  status ENUM('rented', 'returned', 'overdue') DEFAULT 'rented',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入初始数据
-- 插入球台类型
INSERT INTO table_types (name, hourly_rate, description) VALUES
('斯诺克', 38.00, '斯诺克球台'),
('中式八球', 28.00, '中式八球球台'),
('九球', 32.00, '九球球台');

-- 插入球台
INSERT INTO tables (table_number, type_id, status, position) VALUES
('T001', 1, 'available', '一号区域'),
('T002', 1, 'available', '一号区域'),
('T003', 2, 'available', '二号区域'),
('T004', 2, 'available', '二号区域'),
('T005', 2, 'available', '二号区域'),
('T006', 3, 'available', '三号区域');

-- 插入商品类别
INSERT INTO product_categories (name, description) VALUES
('饮料', '各类饮料饮品'),
('香烟', '各类香烟'),
('零食', '各类零食小吃'),
('其他', '其他商品');

-- 插入商品
INSERT INTO products (name, category_id, price, cost_price, stock, unit) VALUES
('矿泉水', 1, 3.00, 1.50, 50, '瓶'),
('可乐', 1, 5.00, 3.00, 40, '瓶'),
('雪碧', 1, 5.00, 3.00, 40, '瓶'),
('脉动', 1, 6.00, 4.00, 30, '瓶'),
('红茶', 1, 5.00, 3.00, 30, '瓶'),
('中华(软)', 2, 70.00, 65.00, 20, '包'),
('玉溪', 2, 25.00, 23.00, 30, '包'),
('芙蓉王', 2, 26.00, 24.00, 30, '包'),
('薯片', 3, 8.00, 5.00, 25, '袋'),
('瓜子', 3, 10.00, 6.00, 20, '袋');

-- 插入管理员账号（密码: 123456，需要在应用中bcrypt加密）
INSERT INTO users (username, password, real_name, role, phone) VALUES
('admin', '123456', '系统管理员', 'admin', '13800138000'),
('staff01', '123456', '员工张三', 'staff', '13800138001');
