const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

const DB_NAME = process.env.DB_NAME || 'camping';

const createDatabaseSQL = `
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` 
DEFAULT CHARACTER SET utf8mb4 
DEFAULT COLLATE utf8mb4_unicode_ci;

USE \`${DB_NAME}\`;
`;

const tablesSQL = `
CREATE TABLE IF NOT EXISTS campsites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL COMMENT '营位名称',
  type ENUM('tent', 'rv') NOT NULL COMMENT '营位类型：tent帐篷区, rv房车区',
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '平日价格',
  weekend_price DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '周末价格',
  max_capacity INT NOT NULL DEFAULT 2 COMMENT '最大容纳人数',
  description TEXT COMMENT '描述',
  longitude DECIMAL(10,7) COMMENT '经度',
  latitude DECIMAL(10,7) COMMENT '纬度',
  map_position VARCHAR(50) COMMENT '地图位置标识',
  image_url VARCHAR(255) COMMENT '营位图片',
  status ENUM('available', 'maintenance', 'closed') NOT NULL DEFAULT 'available' COMMENT '状态',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT='营位表';

CREATE TABLE IF NOT EXISTS equipments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL COMMENT '装备名称',
  category VARCHAR(50) NOT NULL COMMENT '类别：tent帐篷, chair桌椅等',
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '租赁价格',
  stock INT NOT NULL DEFAULT 0 COMMENT '库存数量',
  description TEXT COMMENT '描述',
  image_url VARCHAR(255) COMMENT '图片',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT='装备表';

CREATE TABLE IF NOT EXISTS activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL COMMENT '活动名称',
  type ENUM('dining', 'bonfire', 'other') NOT NULL COMMENT '类型：dining餐饮, bonfire篝火, other其他',
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '价格',
  max_participants INT NOT NULL DEFAULT 0 COMMENT '最大人数',
  start_time DATETIME COMMENT '开始时间',
  end_time DATETIME COMMENT '结束时间',
  description TEXT COMMENT '描述',
  image_url VARCHAR(255) COMMENT '图片',
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active' COMMENT '状态',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT='活动表';

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone VARCHAR(20) UNIQUE COMMENT '手机号',
  password VARCHAR(255) COMMENT '密码',
  nickname VARCHAR(50) COMMENT '昵称',
  avatar VARCHAR(255) COMMENT '头像',
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active' COMMENT '状态',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT='用户表';

CREATE TABLE IF NOT EXISTS reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_no VARCHAR(50) UNIQUE COMMENT '订单号',
  user_id INT NOT NULL COMMENT '用户ID',
  campsite_id INT NOT NULL COMMENT '营位ID',
  checkin_date DATE NOT NULL COMMENT '入住日期',
  checkout_date DATE NOT NULL COMMENT '离店日期',
  nights INT NOT NULL DEFAULT 1 COMMENT '入住晚数',
  guests INT NOT NULL DEFAULT 2 COMMENT '入住人数',
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '订单总金额',
  contact_name VARCHAR(50) COMMENT '联系人',
  contact_phone VARCHAR(20) COMMENT '联系电话',
  remarks TEXT COMMENT '备注',
  status ENUM('pending', 'paid', 'checked_in', 'checked_out', 'cancelled') NOT NULL DEFAULT 'pending' COMMENT '订单状态',
  checkin_time DATETIME COMMENT '实际签到时间',
  checkout_time DATETIME COMMENT '实际离店时间',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (campsite_id) REFERENCES campsites(id)
) COMMENT='预订订单表';

CREATE TABLE IF NOT EXISTS reservation_equipments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reservation_id INT NOT NULL COMMENT '预订ID',
  equipment_id INT NOT NULL COMMENT '装备ID',
  quantity INT NOT NULL DEFAULT 1 COMMENT '数量',
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '单价',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '小计',
  FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
  FOREIGN KEY (equipment_id) REFERENCES equipments(id)
) COMMENT='预订装备关联表';

CREATE TABLE IF NOT EXISTS reservation_activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reservation_id INT NOT NULL COMMENT '预订ID',
  activity_id INT NOT NULL COMMENT '活动ID',
  participants INT NOT NULL DEFAULT 1 COMMENT '参加人数',
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '单价',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '小计',
  FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
  FOREIGN KEY (activity_id) REFERENCES activities(id)
) COMMENT='预订活动关联表';

CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL COMMENT '用户ID',
  campsite_id INT NOT NULL COMMENT '营位ID',
  reservation_id INT COMMENT '预订ID',
  rating INT NOT NULL DEFAULT 5 COMMENT '评分：1-5',
  content TEXT COMMENT '评价内容',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (campsite_id) REFERENCES campsites(id),
  FOREIGN KEY (reservation_id) REFERENCES reservations(id)
) COMMENT='评价表';

CREATE TABLE IF NOT EXISTS review_photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  review_id INT NOT NULL COMMENT '评价ID',
  photo_url VARCHAR(255) NOT NULL COMMENT '照片URL',
  sort_order INT NOT NULL DEFAULT 0 COMMENT '排序',
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
) COMMENT='评价照片表';
`;

async function getSeedDataSQL() {
  const hashedPassword = await bcrypt.hash('123456', 10);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  const formatDate = (date) => date.toISOString().split('T')[0];

  return `
INSERT INTO campsites (name, type, price, weekend_price, max_capacity, description, longitude, latitude, map_position, status) VALUES
('帐篷区A01', 'tent', 150.00, 200.00, 4, '草坪区域，适合家庭露营，视野开阔', 116.4074, 39.9042, 'A01', 'available'),
('帐篷区A02', 'tent', 150.00, 200.00, 4, '靠近洗手间，位置便利', 116.4075, 39.9043, 'A02', 'available'),
('帐篷区A03', 'tent', 120.00, 160.00, 2, '情侣专属区域，私密性好', 116.4076, 39.9044, 'A03', 'available'),
('房车区B01', 'rv', 300.00, 400.00, 6, '标准房车营位，水电齐全', 116.4080, 39.9050, 'B01', 'available'),
('房车区B02', 'rv', 300.00, 400.00, 6, '标准房车营位', 116.4081, 39.9051, 'B02', 'available'),
('房车区B03', 'rv', 500.00, 650.00, 8, '豪华房车营位，景观绝佳', 116.4082, 39.9052, 'B03', 'available');

INSERT INTO equipments (name, category, price, stock, description) VALUES
('双人帐篷', 'tent', 50.00, 20, '含帐篷杆、地钉、防潮垫'),
('三人帐篷', 'tent', 80.00, 15, '适合家庭使用'),
('户外折叠桌', 'chair', 30.00, 30, '便携式折叠桌'),
('折叠椅', 'chair', 15.00, 50, '轻便舒适'),
('露营灯', 'other', 20.00, 25, 'LED露营灯，续航8小时'),
('睡袋', 'other', 25.00, 40, '舒适保暖');

INSERT INTO activities (name, type, price, max_participants, start_time, end_time, description, status) VALUES
('烧烤套餐', 'dining', 128.00, 20, NULL, NULL, '含食材、烤具、调料，需提前预约', 'active'),
('火锅套餐', 'dining', 98.00, 15, NULL, NULL, '冬季限定，含锅底和食材', 'active'),
('篝火晚会', 'bonfire', 30.00, 50, NULL, NULL, '每周五周六晚8点开始', 'active'),
('户外电影', 'other', 0.00, 100, NULL, NULL, '免费观看，需自带坐垫', 'active');

INSERT INTO users (phone, password, nickname, status) VALUES
('13800138000', '${hashedPassword}', '露营爱好者', 'active'),
('13900139000', '${hashedPassword}', '小明', 'active');

INSERT INTO reservations (order_no, user_id, campsite_id, checkin_date, checkout_date, nights, guests, total_amount, contact_name, contact_phone, status) VALUES
('CS${Date.now()}001', 1, 1, '${formatDate(tomorrow)}', '${formatDate(dayAfter)}', 1, 2, 150.00, '露营爱好者', '13800138000', 'paid'),
('CS${Date.now()}002', 1, 4, '${formatDate(yesterday)}', '${formatDate(today)}', 1, 4, 300.00, '露营爱好者', '13800138000', 'checked_out');

INSERT INTO reviews (user_id, campsite_id, reservation_id, rating, content) VALUES
(1, 1, 2, 5, '营地环境非常好，营位宽敞，服务也很周到。周末来的人比较多，建议提前预订。');

INSERT INTO review_photos (review_id, photo_url, sort_order) VALUES
(1, 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=scenic%20camping%20view%20with%20tent%20at%20sunset&image_size=square', 0),
(1, 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=camping%20tent%20under%20starry%20night%20sky&image_size=square', 1),
(1, 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=morning%20sunrise%20over%20campsite%20with%20mountains&image_size=square', 2);
`;
}

async function initDatabase() {
  let connection;
  try {
    console.log('连接数据库...');
    connection = await mysql.createConnection(config);
    console.log('数据库连接成功！');

    console.log('创建数据库...');
    await connection.query(createDatabaseSQL);
    console.log(`数据库 "${DB_NAME}" 创建成功！`);

    console.log('删除旧数据表...');
    await connection.query(`
      USE \`${DB_NAME}\`;
      SET FOREIGN_KEY_CHECKS = 0;
      DROP TABLE IF EXISTS review_photos;
      DROP TABLE IF EXISTS reviews;
      DROP TABLE IF EXISTS reservation_activities;
      DROP TABLE IF EXISTS reservation_equipments;
      DROP TABLE IF EXISTS reservations;
      DROP TABLE IF EXISTS activities;
      DROP TABLE IF EXISTS equipments;
      DROP TABLE IF EXISTS campsites;
      DROP TABLE IF EXISTS users;
      SET FOREIGN_KEY_CHECKS = 1;
    `);
    console.log('旧数据表已删除！');

    console.log('创建数据表...');
    await connection.query(tablesSQL);
    console.log('数据表创建成功！');

    console.log('生成初始数据...');
    const seedDataSQL = await getSeedDataSQL();
    console.log('插入初始数据...');
    await connection.query(seedDataSQL);
    console.log('初始数据插入成功！');

    console.log('\n数据库初始化完成！');
    console.log(`数据库: ${DB_NAME}`);
    console.log(`主机: ${config.host}:${config.port}`);
    console.log(`用户: ${config.user}`);
    console.log('\n示例用户:');
    console.log('  手机号: 13800138000, 密码: 123456');
    console.log('  手机号: 13900139000, 密码: 123456');
  } catch (err) {
    console.error('数据库初始化失败:', err.message);
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n可能的原因：');
      console.error('1. 数据库用户名或密码错误');
      console.error('2. MySQL服务未启动');
      console.error('3. 用户没有权限');
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('\n连接被拒绝，请确认MySQL服务已启动！');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();
