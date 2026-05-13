const express = require('express');
const pool = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const [tables] = await pool.query(`
      SELECT t.*, tt.name as type_name, tt.hourly_rate
      FROM tables t
      LEFT JOIN table_types tt ON t.type_id = tt.id
      ORDER BY t.table_number
    `);
    res.json(tables);
  } catch (error) {
    console.error('获取球台列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.get('/types', verifyToken, async (req, res) => {
  try {
    const [types] = await pool.query('SELECT * FROM table_types ORDER BY id');
    res.json(types);
  } catch (error) {
    console.error('获取球台类型错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.post('/:id/open', verifyToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const tableId = req.params.id;
    const { memberId } = req.body;
    
    const [tables] = await connection.query(
      `SELECT t.*, tt.hourly_rate FROM tables t 
       LEFT JOIN table_types tt ON t.type_id = tt.id 
       WHERE t.id = ? AND t.status = 'available'`,
      [tableId]
    );
    
    if (tables.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: '球台不可用' });
    }
    
    const table = tables[0];
    
    await connection.query(
      "UPDATE tables SET status = 'occupied' WHERE id = ?",
      [tableId]
    );
    
    const [usageResult] = await connection.query(`
      INSERT INTO table_usage_records (table_id, start_time, hourly_rate, status)
      VALUES (?, NOW(), ?, 'playing')
    `, [tableId, table.hourly_rate]);
    
    await connection.commit();
    
    res.json({
      message: '开台成功',
      usageId: usageResult.insertId,
      table: table
    });
  } catch (error) {
    await connection.rollback();
    console.error('开台错误:', error);
    res.status(500).json({ error: '服务器错误' });
  } finally {
    connection.release();
  }
});

router.post('/:id/close', verifyToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const tableId = req.params.id;
    
    const [usageRecords] = await connection.query(`
      SELECT * FROM table_usage_records 
      WHERE table_id = ? AND status IN ('playing', 'paused')
      ORDER BY start_time DESC LIMIT 1
    `, [tableId]);
    
    if (usageRecords.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: '球台未在使用中' });
    }
    
    const usage = usageRecords[0];
    const now = new Date();
    const startTime = new Date(usage.start_time);
    const duration = Math.ceil((now - startTime) / (1000 * 60));
    const hours = duration / 60;
    const fee = hours * usage.hourly_rate;
    
    await connection.query(`
      UPDATE table_usage_records 
      SET end_time = NOW(), duration_minutes = ?, status = 'completed'
      WHERE id = ?
    `, [duration, usage.id]);
    
    await connection.query(
      "UPDATE tables SET status = 'available' WHERE id = ?",
      [tableId]
    );
    
    await connection.commit();
    
    res.json({
      message: '结账成功',
      duration,
      hourlyRate: usage.hourly_rate,
      fee: fee.toFixed(2)
    });
  } catch (error) {
    await connection.rollback();
    console.error('结账错误:', error);
    res.status(500).json({ error: '服务器错误' });
  } finally {
    connection.release();
  }
});

module.exports = router;
