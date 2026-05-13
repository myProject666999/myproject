const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function initDatabase() {
  console.log('开始初始化数据库...');
  
  // 第一步：连接到 MySQL 服务器（不指定数据库）
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true
  });
  
  console.log('连接 MySQL 服务器成功');
  
  try {
    // 创建数据库
    await connection.query(`
      CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` 
      DEFAULT CHARACTER SET utf8mb4 
      COLLATE utf8mb4_unicode_ci
    `);
    console.log(`数据库 ${process.env.DB_NAME} 创建成功`);
    
    // 连接到指定数据库
    await connection.query(`USE \`${process.env.DB_NAME}\``);
    
    // 执行建表语句
    console.log('开始创建数据表...');
    
    // 用户表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        real_name VARCHAR(50) NOT NULL,
        role ENUM('admin', 'staff') DEFAULT 'staff',
        phone VARCHAR(20),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    // 球台类型表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS table_types (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL,
        hourly_rate DECIMAL(10, 2) NOT NULL COMMENT '每小时费用',
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    // 球台表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tables (
        id INT PRIMARY KEY AUTO_INCREMENT,
        table_number VARCHAR(20) UNIQUE NOT NULL,
        type_id INT NOT NULL,
        status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available',
        position VARCHAR(100),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (type_id) REFERENCES table_types(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    // 商品类别表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    // 商品表
    await connection.query(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    // 会员表
    await connection.query(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    // 会员充值记录表
    await connection.query(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    // 订单主表
    await connection.query(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    // 球台使用记录表
    await connection.query(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    // 订单商品明细表
    await connection.query(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    // 设备维护记录表
    await connection.query(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    // 球杆出租表
    await connection.query(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    console.log('数据表创建完成');
    
    // 插入初始数据
    console.log('开始插入初始数据...');
    
    // 球台类型
    const [tableTypes] = await connection.query('SELECT COUNT(*) as count FROM table_types');
    if (tableTypes[0].count === 0) {
      await connection.query(`
        INSERT INTO table_types (name, hourly_rate, description) VALUES
        ('斯诺克', 38.00, '斯诺克球台'),
        ('中式八球', 28.00, '中式八球球台'),
        ('九球', 32.00, '九球球台')
      `);
      console.log('球台类型数据插入完成');
    }
    
    // 球台
    const [tables] = await connection.query('SELECT COUNT(*) as count FROM tables');
    if (tables[0].count === 0) {
      await connection.query(`
        INSERT INTO tables (table_number, type_id, status, position) VALUES
        ('T001', 1, 'available', '一号区域'),
        ('T002', 1, 'available', '一号区域'),
        ('T003', 2, 'available', '二号区域'),
        ('T004', 2, 'available', '二号区域'),
        ('T005', 2, 'available', '二号区域'),
        ('T006', 3, 'available', '三号区域')
      `);
      console.log('球台数据插入完成');
    }
    
    // 商品类别
    const [categories] = await connection.query('SELECT COUNT(*) as count FROM product_categories');
    if (categories[0].count === 0) {
      await connection.query(`
        INSERT INTO product_categories (name, description) VALUES
        ('饮料', '各类饮料饮品'),
        ('香烟', '各类香烟'),
        ('零食', '各类零食小吃'),
        ('其他', '其他商品')
      `);
      console.log('商品类别数据插入完成');
    }
    
    // 商品
    const [products] = await connection.query('SELECT COUNT(*) as count FROM products');
    if (products[0].count === 0) {
      await connection.query(`
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
        ('瓜子', 3, 10.00, 6.00, 20, '袋')
      `);
      console.log('商品数据插入完成');
    }
    
    // 用户（管理员账号）
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
    if (users[0].count === 0) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      await connection.query(`
        INSERT INTO users (username, password, real_name, role, phone) VALUES
        ('admin', ?, '系统管理员', 'admin', '13800138000'),
        ('staff01', ?, '员工张三', 'staff', '13800138001')
      `, [hashedPassword, hashedPassword]);
      console.log('用户数据插入完成');
      console.log('  - 管理员账号: admin / 123456');
      console.log('  - 员工账号: staff01 / 123456');
    }
    
    console.log('\n数据库初始化完成！');
    console.log(`数据库名: ${process.env.DB_NAME}`);
    console.log(`数据库连接: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    
  } catch (error) {
    console.error('数据库初始化失败:', error.message);
    throw error;
  } finally {
    await connection.end();
    console.log('数据库连接已关闭');
  }
}

initDatabase().catch((err) => {
  console.error(err);
  process.exit(1);
});
