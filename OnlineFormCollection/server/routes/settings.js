const express = require('express');
const { getPool } = require('../db/init');

const router = express.Router();

router.get('/', async (req, res) => {
  const pool = getPool();
  const [settings] = await pool.query('SELECT * FROM settings');
  const result = {};
  for (const s of settings) {
    result[s.setting_key] = s.setting_value;
  }
  res.json(result);
});

router.put('/', async (req, res) => {
  const pool = getPool();
  const settings = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const [key, value] of Object.entries(settings)) {
      await conn.query(
        'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
        [key, String(value)]
      );
    }
    await conn.commit();
    res.json({ message: '设置保存成功' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: '设置保存失败' });
  } finally {
    conn.release();
  }
});

module.exports = router;
