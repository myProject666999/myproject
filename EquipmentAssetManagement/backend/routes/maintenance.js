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
      whereClause += ' AND mr.status = ?';
      params.push(status);
    }
    
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM maintenance_records mr ${whereClause}`,
      params
    );
    
    const [rows] = await pool.query(
      `SELECT mr.*, a.name as asset_name, a.asset_code, u.name as reporter_name
       FROM maintenance_records mr
       LEFT JOIN assets a ON mr.asset_id = a.id
       LEFT JOIN users u ON mr.reporter_id = u.id
       ${whereClause}
       ORDER BY mr.id DESC
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
      `SELECT mr.*, u.name as reporter_name
       FROM maintenance_records mr
       LEFT JOIN users u ON mr.reporter_id = u.id
       WHERE mr.asset_id = ?
       ORDER BY mr.id DESC`,
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
    
    const { asset_id, fault_description, report_date, reporter_id, maintenance_type, remarks } = req.body;
    
    const [assetRows] = await connection.query('SELECT status FROM assets WHERE id = ?', [asset_id]);
    if (assetRows.length === 0) {
      throw new Error('资产不存在');
    }
    
    const [result] = await connection.query(
      `INSERT INTO maintenance_records (asset_id, fault_description, report_date, reporter_id, maintenance_type, remarks)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [asset_id, fault_description, report_date, reporter_id, maintenance_type, remarks]
    );
    
    await connection.query(
      'UPDATE assets SET status = ? WHERE id = ?',
      ['MAINTENANCE', asset_id]
    );
    
    await connection.commit();
    res.json({ code: 200, message: '报修成功', data: { id: result.insertId } });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ code: 500, message: error.message });
  } finally {
    connection.release();
  }
});

router.put('/:id/process', async (req, res) => {
  try {
    const { maintenance_person, maintenance_date, maintenance_content, maintenance_cost } = req.body;
    
    await pool.query(
      `UPDATE maintenance_records SET status = 'PROCESSING', maintenance_person = ?, maintenance_date = ?, maintenance_content = ?, maintenance_cost = ?
       WHERE id = ?`,
      [maintenance_person, maintenance_date, maintenance_content, maintenance_cost, req.params.id]
    );
    
    res.json({ code: 200, message: '处理成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.put('/:id/complete', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { completed_date, remarks } = req.body;
    
    const [maintenanceRows] = await connection.query('SELECT * FROM maintenance_records WHERE id = ?', [req.params.id]);
    if (maintenanceRows.length === 0) {
      throw new Error('维修记录不存在');
    }
    
    await connection.query(
      'UPDATE maintenance_records SET status = ?, completed_date = ?, remarks = ? WHERE id = ?',
      ['COMPLETED', completed_date, remarks, req.params.id]
    );
    
    await connection.query(
      'UPDATE assets SET status = ? WHERE id = ?',
      ['IDLE', maintenanceRows[0].asset_id]
    );
    
    await connection.commit();
    res.json({ code: 200, message: '维修完成' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ code: 500, message: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
