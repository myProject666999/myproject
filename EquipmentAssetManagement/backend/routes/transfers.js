const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;
    
    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM transfer_records');
    
    const [rows] = await pool.query(
      `SELECT tr.*, a.name as asset_name, a.asset_code, 
       u1.name as from_user_name, u2.name as to_user_name,
       d1.name as from_department_name, d2.name as to_department_name,
       u3.name as operator_name
       FROM transfer_records tr
       LEFT JOIN assets a ON tr.asset_id = a.id
       LEFT JOIN users u1 ON tr.from_user_id = u1.id
       LEFT JOIN users u2 ON tr.to_user_id = u2.id
       LEFT JOIN departments d1 ON tr.from_department_id = d1.id
       LEFT JOIN departments d2 ON tr.to_department_id = d2.id
       LEFT JOIN users u3 ON tr.operator_id = u3.id
       ORDER BY tr.id DESC
       LIMIT ? OFFSET ?`,
      [parseInt(pageSize), parseInt(offset)]
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
      `SELECT tr.*, u1.name as from_user_name, u2.name as to_user_name,
       d1.name as from_department_name, d2.name as to_department_name
       FROM transfer_records tr
       LEFT JOIN users u1 ON tr.from_user_id = u1.id
       LEFT JOIN users u2 ON tr.to_user_id = u2.id
       LEFT JOIN departments d1 ON tr.from_department_id = d1.id
       LEFT JOIN departments d2 ON tr.to_department_id = d2.id
       WHERE tr.asset_id = ?
       ORDER BY tr.id DESC`,
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
    
    const { asset_id, to_user_id, to_department_id, transfer_date, reason, operator_id, remarks } = req.body;
    
    const [assetRows] = await connection.query('SELECT current_user_id, current_department_id FROM assets WHERE id = ?', [asset_id]);
    if (assetRows.length === 0) {
      throw new Error('资产不存在');
    }
    
    const from_user_id = assetRows[0].current_user_id;
    const from_department_id = assetRows[0].current_department_id;
    
    const [result] = await connection.query(
      `INSERT INTO transfer_records (asset_id, from_user_id, to_user_id, from_department_id, to_department_id, transfer_date, reason, operator_id, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [asset_id, from_user_id, to_user_id, from_department_id, to_department_id, transfer_date, reason, operator_id, remarks]
    );
    
    await connection.query(
      'UPDATE assets SET current_user_id = ?, current_department_id = ? WHERE id = ?',
      [to_user_id, to_department_id, asset_id]
    );
    
    await connection.commit();
    res.json({ code: 200, message: '调拨成功', data: { id: result.insertId } });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ code: 500, message: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
