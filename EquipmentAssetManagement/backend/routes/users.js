const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.*, d.name as department_name 
       FROM users u 
       LEFT JOIN departments d ON u.department_id = d.id 
       ORDER BY u.id`
    );
    res.json({ code: 200, data: rows });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { username, name, department_id, phone, email } = req.body;
    const [result] = await pool.query(
      'INSERT INTO users (username, name, department_id, phone, email) VALUES (?, ?, ?, ?, ?)',
      [username, name, department_id, phone, email]
    );
    res.json({ code: 200, message: '创建成功', data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { username, name, department_id, phone, email } = req.body;
    await pool.query(
      'UPDATE users SET username = ?, name = ?, department_id = ?, phone = ?, email = ? WHERE id = ?',
      [username, name, department_id, phone, email, req.params.id]
    );
    res.json({ code: 200, message: '更新成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

module.exports = router;
