const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const pool = require('../config/database');

router.post('/generate', async (req, res) => {
  try {
    const { data, width = 200 } = req.body;
    const qrCodeUrl = await QRCode.toDataURL(data, { width });
    res.json({ code: 200, data: qrCodeUrl });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.get('/asset/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM assets WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '资产不存在' });
    }
    
    const asset = rows[0];
    if (asset.qr_code) {
      res.json({ code: 200, data: asset.qr_code });
    } else {
      const qrCodeData = `ASSET:${asset.id}:${asset.asset_code}`;
      const qrCodeUrl = await QRCode.toDataURL(qrCodeData, { width: 200 });
      
      await pool.query('UPDATE assets SET qr_code = ? WHERE id = ?', [qrCodeUrl, asset.id]);
      
      res.json({ code: 200, data: qrCodeUrl });
    }
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.post('/decode', async (req, res) => {
  try {
    const { qr_data } = req.body;
    
    if (!qr_data || !qr_data.startsWith('ASSET:')) {
      return res.status(400).json({ code: 400, message: '无效的二维码数据' });
    }
    
    const parts = qr_data.split(':');
    const assetId = parts[1];
    
    const [rows] = await pool.query(
      `SELECT a.*, c.name as category_name, u.name as current_user_name, d.name as current_department_name
       FROM assets a
       LEFT JOIN asset_categories c ON a.category_id = c.id
       LEFT JOIN users u ON a.current_user_id = u.id
       LEFT JOIN departments d ON a.current_department_id = d.id
       WHERE a.id = ?`,
      [assetId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '资产不存在' });
    }
    
    res.json({ code: 200, data: rows[0] });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

module.exports = router;
