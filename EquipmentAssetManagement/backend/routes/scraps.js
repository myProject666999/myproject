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
      whereClause += ' AND sr.status = ?';
      params.push(status);
    }
    
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM scrap_records sr ${whereClause}`,
      params
    );
    
    const [rows] = await pool.query(
      `SELECT sr.*, a.name as asset_name, a.asset_code, u1.name as applicant_name, u2.name as approver_name
       FROM scrap_records sr
       LEFT JOIN assets a ON sr.asset_id = a.id
       LEFT JOIN users u1 ON sr.applicant_id = u1.id
       LEFT JOIN users u2 ON sr.approver_id = u2.id
       ${whereClause}
       ORDER BY sr.id DESC
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

router.post('/', async (req, res) => {
  try {
    const { asset_id, scrap_reason, scrap_date, applicant_id, scrap_value, remarks } = req.body;
    
    const [result] = await pool.query(
      `INSERT INTO scrap_records (asset_id, scrap_reason, scrap_date, applicant_id, scrap_value, remarks)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [asset_id, scrap_reason, scrap_date, applicant_id, scrap_value, remarks]
    );
    
    res.json({ code: 200, message: '申请成功', data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.put('/:id/approve', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { approver_id, remarks } = req.body;
    
    const [scrapRows] = await connection.query('SELECT * FROM scrap_records WHERE id = ?', [req.params.id]);
    if (scrapRows.length === 0) {
      throw new Error('报废记录不存在');
    }
    
    await connection.query(
      'UPDATE scrap_records SET status = ?, approver_id = ?, remarks = ? WHERE id = ?',
      ['APPROVED', approver_id, remarks, req.params.id]
    );
    
    await connection.query(
      'UPDATE assets SET status = ? WHERE id = ?',
      ['SCRAPPED', scrapRows[0].asset_id]
    );
    
    await connection.commit();
    res.json({ code: 200, message: '审批通过' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ code: 500, message: error.message });
  } finally {
    connection.release();
  }
});

router.put('/:id/reject', async (req, res) => {
  try {
    const { approver_id, remarks } = req.body;
    
    await pool.query(
      'UPDATE scrap_records SET status = ?, approver_id = ?, remarks = ? WHERE id = ?',
      ['REJECTED', approver_id, remarks, req.params.id]
    );
    
    res.json({ code: 200, message: '已拒绝' });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

module.exports = router;
