const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const QRCode = require('qrcode');

router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, category_id, status } = req.query;
    const offset = (page - 1) * pageSize;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (keyword) {
      whereClause += ' AND (a.name LIKE ? OR a.asset_code LIKE ? OR a.brand LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }
    if (category_id) {
      whereClause += ' AND a.category_id = ?';
      params.push(category_id);
    }
    if (status) {
      whereClause += ' AND a.status = ?';
      params.push(status);
    }
    
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM assets a ${whereClause}`,
      params
    );
    
    const [rows] = await pool.query(
      `SELECT a.*, c.name as category_name, u.name as current_user_name, d.name as current_department_name
       FROM assets a
       LEFT JOIN asset_categories c ON a.category_id = c.id
       LEFT JOIN users u ON a.current_user_id = u.id
       LEFT JOIN departments d ON a.current_department_id = d.id
       ${whereClause}
       ORDER BY a.id DESC
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

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, c.name as category_name, u.name as current_user_name, d.name as current_department_name
       FROM assets a
       LEFT JOIN asset_categories c ON a.category_id = c.id
       LEFT JOIN users u ON a.current_user_id = u.id
       LEFT JOIN departments d ON a.current_department_id = d.id
       WHERE a.id = ?`,
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '资产不存在' });
    }
    
    res.json({ code: 200, data: rows[0] });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { asset_code, name, category_id, specification, brand, serial_number, purchase_date, purchase_price, supplier, location, description } = req.body;
    
    const [result] = await connection.query(
      `INSERT INTO assets (asset_code, name, category_id, specification, brand, serial_number, purchase_date, purchase_price, supplier, location, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [asset_code, name, category_id, specification, brand, serial_number, purchase_date, purchase_price, supplier, location, description]
    );
    
    const assetId = result.insertId;
    const qrCodeData = `ASSET:${assetId}:${asset_code}`;
    const qrCodeUrl = await QRCode.toDataURL(qrCodeData);
    
    await connection.query(
      'UPDATE assets SET qr_code = ? WHERE id = ?',
      [qrCodeUrl, assetId]
    );
    
    await connection.commit();
    
    res.json({ code: 200, message: '创建成功', data: { id: assetId, qr_code: qrCodeUrl } });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ code: 500, message: error.message });
  } finally {
    connection.release();
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { asset_code, name, category_id, specification, brand, serial_number, purchase_date, purchase_price, supplier, location, description, status } = req.body;
    
    await pool.query(
      `UPDATE assets SET asset_code = ?, name = ?, category_id = ?, specification = ?, brand = ?, serial_number = ?, 
       purchase_date = ?, purchase_price = ?, supplier = ?, location = ?, description = ?, status = ? WHERE id = ?`,
      [asset_code, name, category_id, specification, brand, serial_number, purchase_date, purchase_price, supplier, location, description, status, req.params.id]
    );
    
    res.json({ code: 200, message: '更新成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM assets WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.get('/code/generate', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT MAX(id) as max_id FROM assets');
    const nextId = (rows[0].max_id || 0) + 1;
    const assetCode = `AST-${String(nextId).padStart(3, '0')}`;
    res.json({ code: 200, data: assetCode });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

module.exports = router;
