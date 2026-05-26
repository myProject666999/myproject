const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status } = req.query;
    const offset = (page - 1) * pageSize;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (status) {
      whereClause += ' AND br.status = ?';
      params.push(status);
    }
    
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM borrow_records br ${whereClause}`,
      params
    );
    
    const [rows] = await pool.query(
      `SELECT br.*, a.name as asset_name, a.asset_code, u.name as user_name, d.name as department_name
       FROM borrow_records br
       LEFT JOIN assets a ON br.asset_id = a.id
       LEFT JOIN users u ON br.user_id = u.id
       LEFT JOIN departments d ON br.department_id = d.id
       ${whereClause}
       ORDER BY br.id DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), parseInt(offset)]
    );
    
    res.json({
      code: 200,
      data: rows,
      total: countResult[0].total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.get('/asset/:assetId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT br.*, u.name as user_name, d.name as department_name
       FROM borrow_records br
       LEFT JOIN users u ON br.user_id = u.id
       LEFT JOIN departments d ON br.department_id = d.id
       WHERE br.asset_id = ?
       ORDER BY br.id DESC`,
      [req.params.assetId]
    );
    res.json({ code: 200, data: rows });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { asset_id, user_id, department_id, borrow_date, expected_return_date, purpose, remarks } = req.body;
    
    const [assetRows] = await connection.query('SELECT status FROM assets WHERE id = ?', [asset_id]);
    if (assetRows.length === 0) {
      throw new Error('资产不存在');
    }
    if (assetRows[0].status !== 'IDLE') {
      throw new Error('资产状态不允许领用');
    }
    
    const [result] = await connection.query(
      `INSERT INTO borrow_records (asset_id, user_id, department_id, borrow_date, expected_return_date, purpose, remarks, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'BORROWED')`,
      [asset_id, user_id, department_id, borrow_date, expected_return_date, purpose, remarks]
    );
    
    await connection.query(
      'UPDATE assets SET status = ?, current_user_id = ?, current_department_id = ? WHERE id = ?',
      ['IN_USE', user_id, department_id, asset_id]
    );
    
    await connection.commit();
    res.json({ code: 200, message: '领用成功', data: { id: result.insertId } });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ code: 500, message: error.message });
  } finally {
    connection.release();
  }
});

router.put('/:id/return', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { actual_return_date, remarks } = req.body;
    
    const [borrowRows] = await connection.query('SELECT * FROM borrow_records WHERE id = ?', [req.params.id]);
    if (borrowRows.length === 0) {
      throw new Error('领用记录不存在');
    }
    if (borrowRows[0].status === 'RETURNED') {
      throw new Error('该资产已归还');
    }
    
    await connection.query(
      'UPDATE borrow_records SET status = ?, actual_return_date = ?, remarks = ? WHERE id = ?',
      ['RETURNED', actual_return_date, remarks, req.params.id]
    );
    
    await connection.query(
      'UPDATE assets SET status = ?, current_user_id = NULL, current_department_id = NULL WHERE id = ?',
      ['IDLE', borrowRows[0].asset_id]
    );
    
    await connection.commit();
    res.json({ code: 200, message: '归还成功' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ code: 500, message: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
