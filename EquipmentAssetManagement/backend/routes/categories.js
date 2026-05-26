const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM asset_categories ORDER BY id');
    res.json({ code: 200, data: rows });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, parent_id, description } = req.body;
    const [result] = await pool.query(
      'INSERT INTO asset_categories (name, parent_id, description) VALUES (?, ?, ?)',
      [name, parent_id || 0, description]
    );
    res.json({ code: 200, message: '创建成功', data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, parent_id, description } = req.body;
    await pool.query(
      'UPDATE asset_categories SET name = ?, parent_id = ?, description = ? WHERE id = ?',
      [name, parent_id || 0, description, req.params.id]
    );
    res.json({ code: 200, message: '更新成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM asset_categories WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

module.exports = router;
