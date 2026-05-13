const express = require('express');
const pool = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT m.*, t.table_number, u1.real_name as operator_name, u2.real_name as handler_name
      FROM maintenance_records m
      LEFT JOIN tables t ON m.table_id = t.id
      LEFT JOIN users u1 ON m.operator_id = u1.id
      LEFT JOIN users u2 ON m.handler_id = u2.id
      WHERE 1=1
    `;
    let params = [];
    
    if (status) {
      sql += ' AND m.status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY m.created_at DESC';
    
    const [records] = await pool.query(sql, params);
    res.json(records);
  } catch (error) {
    console.error('获取维护记录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { tableId, equipmentName, issueDescription } = req.body;
    
    const [result] = await pool.query(`
      INSERT INTO maintenance_records (table_id, equipment_name, issue_description, operator_id, status)
      VALUES (?, ?, ?, ?, 'pending')
    `, [tableId, equipmentName, issueDescription, req.user.id]);
    
    res.json({ id: result.insertId, message: '维护记录创建成功' });
  } catch (error) {
    console.error('创建维护记录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { repairDescription, cost, status, handlerId } = req.body;
    
    await pool.query(`
      UPDATE maintenance_records 
      SET repair_description = ?, cost = ?, status = ?, handler_id = ?
      WHERE id = ?
    `, [repairDescription, cost || 0, status, handlerId || req.user.id, id]);
    
    res.json({ message: '维护记录更新成功' });
  } catch (error) {
    console.error('更新维护记录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;
