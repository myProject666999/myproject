const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
require('dotenv').config();

const db = require('./config/database');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({
    message: '高尔夫练习场预约系统API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '服务运行正常' });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    res.json({ 
      status: 'success', 
      message: '数据库连接正常',
      result: rows[0].result
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: '数据库连接失败',
      error: error.message
    });
  }
});

app.get('/api/bays', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM hitting_bays ORDER BY bay_number');
    res.json({ 
      status: 'success', 
      data: rows,
      total: rows.length
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: '获取打位列表失败',
      error: error.message
    });
  }
});

app.get('/api/bays/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM hitting_bays WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: '打位不存在' });
    }
    res.json({ status: 'success', data: rows[0] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '获取打位失败', error: error.message });
  }
});

app.post('/api/bays', async (req, res) => {
  try {
    const { bay_number, bay_type, floor, position_x, position_y, has_sensor, status, price_per_hour, description } = req.body;
    const [result] = await db.query(
      'INSERT INTO hitting_bays (bay_number, bay_type, floor, position_x, position_y, has_sensor, status, price_per_hour, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [bay_number, bay_type, floor, position_x || 0, position_y || 0, has_sensor ? 1 : 0, status, price_per_hour, description]
    );
    res.json({ 
      status: 'success', 
      message: '新增成功', 
      data: { id: result.insertId } 
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '新增失败', error: error.message });
  }
});

app.put('/api/bays/:id', async (req, res) => {
  try {
    const { bay_number, bay_type, floor, position_x, position_y, has_sensor, status, price_per_hour, description } = req.body;
    await db.query(
      'UPDATE hitting_bays SET bay_number=?, bay_type=?, floor=?, position_x=?, position_y=?, has_sensor=?, status=?, price_per_hour=?, description=? WHERE id=?',
      [bay_number, bay_type, floor, position_x || 0, position_y || 0, has_sensor ? 1 : 0, status, price_per_hour, description, req.params.id]
    );
    res.json({ status: 'success', message: '更新成功' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '更新失败', error: error.message });
  }
});

app.delete('/api/bays/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM hitting_bays WHERE id = ?', [req.params.id]);
    res.json({ status: 'success', message: '删除成功' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '删除失败', error: error.message });
  }
});

app.get('/api/coaches', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM coaches ORDER BY id');
    res.json({ 
      status: 'success', 
      data: rows,
      total: rows.length
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: '获取教练列表失败',
      error: error.message
    });
  }
});

app.get('/api/coaches/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM coaches WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: '教练不存在' });
    }
    res.json({ status: 'success', data: rows[0] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '获取教练失败', error: error.message });
  }
});

app.post('/api/coaches', async (req, res) => {
  try {
    const { coach_name, phone, title, specialty, avatar, price_per_hour, status, description } = req.body;
    const [result] = await db.query(
      'INSERT INTO coaches (coach_name, phone, title, specialty, avatar, price_per_hour, status, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [coach_name, phone, title, specialty, avatar, price_per_hour, status ? 1 : 0, description]
    );
    res.json({ 
      status: 'success', 
      message: '新增成功', 
      data: { id: result.insertId } 
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '新增失败', error: error.message });
  }
});

app.put('/api/coaches/:id', async (req, res) => {
  try {
    const { coach_name, phone, title, specialty, avatar, price_per_hour, status, description } = req.body;
    await db.query(
      'UPDATE coaches SET coach_name=?, phone=?, title=?, specialty=?, avatar=?, price_per_hour=?, status=?, description=? WHERE id=?',
      [coach_name, phone, title, specialty, avatar, price_per_hour, status ? 1 : 0, description, req.params.id]
    );
    res.json({ status: 'success', message: '更新成功' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '更新失败', error: error.message });
  }
});

app.delete('/api/coaches/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM coaches WHERE id = ?', [req.params.id]);
    res.json({ status: 'success', message: '删除成功' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '删除失败', error: error.message });
  }
});

app.get('/api/equipment', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.*, c.category_name 
      FROM equipment e 
      LEFT JOIN equipment_categories c ON e.category_id = c.id 
      ORDER BY e.id
    `);
    res.json({ 
      status: 'success', 
      data: rows,
      total: rows.length
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: '获取球具列表失败',
      error: error.message
    });
  }
});

app.get('/api/equipment-categories', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM equipment_categories ORDER BY id');
    res.json({ status: 'success', data: rows });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '获取分类失败', error: error.message });
  }
});

app.post('/api/equipment', async (req, res) => {
  try {
    const { category_id, equipment_name, equipment_code, brand, specs, rental_price, total_quantity, available_quantity, status, description, image } = req.body;
    const [result] = await db.query(
      'INSERT INTO equipment (category_id, equipment_name, equipment_code, brand, specs, rental_price, total_quantity, available_quantity, status, description, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [category_id, equipment_name, equipment_code, brand, specs, rental_price, total_quantity, available_quantity || total_quantity, status ? 1 : 0, description, image]
    );
    res.json({ 
      status: 'success', 
      message: '新增成功', 
      data: { id: result.insertId } 
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '新增失败', error: error.message });
  }
});

app.put('/api/equipment/:id', async (req, res) => {
  try {
    const { category_id, equipment_name, equipment_code, brand, specs, rental_price, total_quantity, available_quantity, status, description, image } = req.body;
    await db.query(
      'UPDATE equipment SET category_id=?, equipment_name=?, equipment_code=?, brand=?, specs=?, rental_price=?, total_quantity=?, available_quantity=?, status=?, description=?, image=? WHERE id=?',
      [category_id, equipment_name, equipment_code, brand, specs, rental_price, total_quantity, available_quantity, status ? 1 : 0, description, image, req.params.id]
    );
    res.json({ status: 'success', message: '更新成功' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '更新失败', error: error.message });
  }
});

app.delete('/api/equipment/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM equipment WHERE id = ?', [req.params.id]);
    res.json({ status: 'success', message: '删除成功' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '删除失败', error: error.message });
  }
});

app.get('/api/card-types', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM card_types ORDER BY price');
    res.json({ 
      status: 'success', 
      data: rows,
      total: rows.length
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: '获取卡类型失败',
      error: error.message
    });
  }
});

app.post('/api/card-types', async (req, res) => {
  try {
    const { card_name, card_type, duration_days, duration_hours, price, discount, status, description } = req.body;
    const [result] = await db.query(
      'INSERT INTO card_types (card_name, card_type, duration_days, duration_hours, price, discount, status, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [card_name, card_type, duration_days, duration_hours, price, discount || 100, status ? 1 : 0, description]
    );
    res.json({ 
      status: 'success', 
      message: '新增成功', 
      data: { id: result.insertId } 
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '新增失败', error: error.message });
  }
});

app.put('/api/card-types/:id', async (req, res) => {
  try {
    const { card_name, card_type, duration_days, duration_hours, price, discount, status, description } = req.body;
    await db.query(
      'UPDATE card_types SET card_name=?, card_type=?, duration_days=?, duration_hours=?, price=?, discount=?, status=?, description=? WHERE id=?',
      [card_name, card_type, duration_days, duration_hours, price, discount || 100, status ? 1 : 0, description, req.params.id]
    );
    res.json({ status: 'success', message: '更新成功' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '更新失败', error: error.message });
  }
});

app.delete('/api/card-types/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM card_types WHERE id = ?', [req.params.id]);
    res.json({ status: 'success', message: '删除成功' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '删除失败', error: error.message });
  }
});

app.get('/api/members', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, u.real_name, u.phone 
      FROM members m 
      LEFT JOIN users u ON m.user_id = u.id 
      ORDER BY m.id DESC
    `);
    res.json({ 
      status: 'success', 
      data: rows,
      total: rows.length
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: '获取会员列表失败',
      error: error.message
    });
  }
});

app.post('/api/members', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { username, password, real_name, phone, member_no, balance, remaining_hours, join_date, expire_date } = req.body;
    
    const [userResult] = await connection.query(
      'INSERT INTO users (username, password, real_name, phone, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [username, password || '$2b$10$EixZaYb1j9LbFQE8wH6t9eB7hN3vX5eP7Y9Q1R3T5U7V9W2X4Z6Y8', real_name, phone, 'member', 1]
    );
    
    const [memberResult] = await connection.query(
      'INSERT INTO members (user_id, member_no, balance, remaining_hours, join_date, expire_date) VALUES (?, ?, ?, ?, ?, ?)',
      [userResult.insertId, member_no, balance || 0, remaining_hours || 0, join_date, expire_date]
    );
    
    await connection.commit();
    res.json({ 
      status: 'success', 
      message: '新增成功', 
      data: { id: memberResult.insertId } 
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ status: 'error', message: '新增失败', error: error.message });
  } finally {
    connection.release();
  }
});

app.put('/api/members/:id', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { real_name, phone, member_no, balance, remaining_hours, join_date, expire_date } = req.body;
    
    const [memberRows] = await connection.query('SELECT user_id FROM members WHERE id = ?', [req.params.id]);
    if (memberRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ status: 'error', message: '会员不存在' });
    }
    
    await connection.query(
      'UPDATE users SET real_name=?, phone=? WHERE id=?',
      [real_name, phone, memberRows[0].user_id]
    );
    
    await connection.query(
      'UPDATE members SET member_no=?, balance=?, remaining_hours=?, join_date=?, expire_date=? WHERE id=?',
      [member_no, balance, remaining_hours, join_date, expire_date, req.params.id]
    );
    
    await connection.commit();
    res.json({ status: 'success', message: '更新成功' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ status: 'error', message: '更新失败', error: error.message });
  } finally {
    connection.release();
  }
});

app.delete('/api/members/:id', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const [memberRows] = await connection.query('SELECT user_id FROM members WHERE id = ?', [req.params.id]);
    if (memberRows.length > 0) {
      await connection.query('DELETE FROM members WHERE id = ?', [req.params.id]);
      await connection.query('DELETE FROM users WHERE id = ?', [memberRows[0].user_id]);
    }
    
    await connection.commit();
    res.json({ status: 'success', message: '删除成功' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ status: 'error', message: '删除失败', error: error.message });
  } finally {
    connection.release();
  }
});

app.get('/api/reservations', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, h.bay_number, c.coach_name, m.member_no, u.real_name as member_name
      FROM reservations r
      LEFT JOIN hitting_bays h ON r.bay_id = h.id
      LEFT JOIN coaches c ON r.coach_id = c.id
      LEFT JOIN members m ON r.member_id = m.id
      LEFT JOIN users u ON m.user_id = u.id
      ORDER BY r.reservation_date DESC, r.start_time DESC
    `);
    res.json({ 
      status: 'success', 
      data: rows,
      total: rows.length
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: '获取预约列表失败',
      error: error.message
    });
  }
});

app.get('/api/reservations/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, h.bay_number, c.coach_name, m.member_no, u.real_name as member_name
      FROM reservations r
      LEFT JOIN hitting_bays h ON r.bay_id = h.id
      LEFT JOIN coaches c ON r.coach_id = c.id
      LEFT JOIN members m ON r.member_id = m.id
      LEFT JOIN users u ON m.user_id = u.id
      WHERE r.id = ?
    `, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: '预约不存在' });
    }
    res.json({ status: 'success', data: rows[0] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '获取预约失败', error: error.message });
  }
});

app.post('/api/reservations', async (req, res) => {
  try {
    const { 
      member_id, customer_name, customer_phone, bay_id, reservation_date, 
      start_time, end_time, coach_id, balls_count, status, payment_method, 
      total_amount, paid_amount, remark 
    } = req.body;
    
    const reservation_no = 'R' + Date.now().toString();
    
    const [result] = await db.query(
      `INSERT INTO reservations 
       (reservation_no, member_id, customer_name, customer_phone, bay_id, reservation_date, 
        start_time, end_time, coach_id, balls_count, status, payment_method, 
        total_amount, paid_amount, remark) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [reservation_no, member_id || null, customer_name, customer_phone, bay_id, reservation_date, 
       start_time, end_time, coach_id || null, balls_count || 0, status || 'pending', payment_method, 
       total_amount || 0, paid_amount || 0, remark]
    );
    
    res.json({ 
      status: 'success', 
      message: '预约成功', 
      data: { id: result.insertId, reservation_no } 
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '预约失败', error: error.message });
  }
});

app.put('/api/reservations/:id', async (req, res) => {
  try {
    const { 
      member_id, customer_name, customer_phone, bay_id, reservation_date, 
      start_time, end_time, coach_id, balls_count, status, payment_method, 
      total_amount, paid_amount, remark 
    } = req.body;
    
    await db.query(
      `UPDATE reservations 
       SET member_id=?, customer_name=?, customer_phone=?, bay_id=?, reservation_date=?, 
           start_time=?, end_time=?, coach_id=?, balls_count=?, status=?, payment_method=?, 
           total_amount=?, paid_amount=?, remark=? 
       WHERE id=?`,
      [member_id || null, customer_name, customer_phone, bay_id, reservation_date, 
       start_time, end_time, coach_id || null, balls_count || 0, status, payment_method, 
       total_amount || 0, paid_amount || 0, remark, req.params.id]
    );
    res.json({ status: 'success', message: '更新成功' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '更新失败', error: error.message });
  }
});

app.put('/api/reservations/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE reservations SET status=? WHERE id=?', [status, req.params.id]);
    res.json({ status: 'success', message: '状态更新成功' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '状态更新失败', error: error.message });
  }
});

app.delete('/api/reservations/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM reservations WHERE id = ?', [req.params.id]);
    res.json({ status: 'success', message: '删除成功' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '删除失败', error: error.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

module.exports = app;
