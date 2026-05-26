const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;
    
    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM inventory_checks');
    
    const [rows] = await pool.query(
      `SELECT ic.*, u.name as operator_name
       FROM inventory_checks ic
       LEFT JOIN users u ON ic.operator_id = u.id
       ORDER BY ic.id DESC
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

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ic.*, u.name as operator_name
       FROM inventory_checks ic
       LEFT JOIN users u ON ic.operator_id = u.id
       WHERE ic.id = ?`,
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '盘点单不存在' });
    }
    
    res.json({ code: 200, data: rows[0] });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.get('/:id/details', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id.*, a.name as asset_name, a.asset_code, a.location, a.status as asset_status, u.name as operator_name, c.name as category_name
       FROM inventory_details id
       LEFT JOIN assets a ON id.asset_id = a.id
       LEFT JOIN asset_categories c ON a.category_id = c.id
       LEFT JOIN users u ON id.check_operator_id = u.id
       WHERE id.check_id = ?
       ORDER BY id.id`,
      [req.params.id]
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
    
    const { name, check_date, operator_id, remarks } = req.body;
    
    const [countRows] = await connection.query('SELECT MAX(id) as max_id FROM inventory_checks');
    const nextId = (countRows[0].max_id || 0) + 1;
    const check_code = `INV-${String(nextId).padStart(4, '0')}`;
    
    const [result] = await connection.query(
      `INSERT INTO inventory_checks (check_code, name, check_date, operator_id, remarks, status)
       VALUES (?, ?, ?, ?, ?, 'DRAFT')`,
      [check_code, name, check_date, operator_id, remarks]
    );
    
    const checkId = result.insertId;
    
    const [assets] = await connection.query(
      "SELECT id FROM assets WHERE status NOT IN ('SCRAPPED', 'LOST')"
    );
    
    for (const asset of assets) {
      await connection.query(
        'INSERT INTO inventory_details (check_id, asset_id, check_status) VALUES (?, ?, ?)',
        [checkId, asset.id, 'NOT_FOUND']
      );
    }
    
    await connection.query(
      'UPDATE inventory_checks SET total_count = ? WHERE id = ?',
      [assets.length, checkId]
    );
    
    await connection.commit();
    res.json({ code: 200, message: '创建成功', data: { id: checkId, check_code } });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ code: 500, message: error.message });
  } finally {
    connection.release();
  }
});

router.put('/:id/start', async (req, res) => {
  try {
    await pool.query(
      "UPDATE inventory_checks SET status = 'PROCESSING' WHERE id = ?",
      [req.params.id]
    );
    res.json({ code: 200, message: '盘点已开始' });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.put('/:id/complete', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const [details] = await connection.query(
      'SELECT check_status FROM inventory_details WHERE check_id = ?',
      [req.params.id]
    );
    
    const checkedCount = details.filter(d => d.check_status !== 'NOT_FOUND').length;
    const normalCount = details.filter(d => d.check_status === 'NORMAL').length;
    const abnormalCount = details.filter(d => ['MISSING', 'DAMAGED'].includes(d.check_status)).length;
    
    await connection.query(
      `UPDATE inventory_checks SET status = 'COMPLETED', checked_count = ?, normal_count = ?, abnormal_count = ?
       WHERE id = ?`,
      [checkedCount, normalCount, abnormalCount, req.params.id]
    );
    
    await connection.commit();
    res.json({ code: 200, message: '盘点已完成' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ code: 500, message: error.message });
  } finally {
    connection.release();
  }
});

router.post('/:id/scan', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { asset_id, check_status, location_actual, remarks, check_operator_id } = req.body;
    const checkId = req.params.id;
    
    await connection.query(
      `UPDATE inventory_details 
       SET check_status = ?, check_time = NOW(), check_operator_id = ?, location_actual = ?, remarks = ?
       WHERE check_id = ? AND asset_id = ?`,
      [check_status, check_operator_id, location_actual, remarks, checkId, asset_id]
    );
    
    const [details] = await connection.query(
      'SELECT check_status FROM inventory_details WHERE check_id = ?',
      [checkId]
    );
    
    const checkedCount = details.filter(d => d.check_status !== 'NOT_FOUND').length;
    const normalCount = details.filter(d => d.check_status === 'NORMAL').length;
    const abnormalCount = details.filter(d => ['MISSING', 'DAMAGED'].includes(d.check_status)).length;
    
    await connection.query(
      `UPDATE inventory_checks SET checked_count = ?, normal_count = ?, abnormal_count = ?
       WHERE id = ?`,
      [checkedCount, normalCount, abnormalCount, checkId]
    );
    
    await connection.commit();
    res.json({ code: 200, message: '盘点成功' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ code: 500, message: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
