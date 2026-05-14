const express = require('express');
const pool = require('../config/database');
const { optionalAuthMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalAuthMiddleware, async (req, res, next) => {
  try {
    const { category, status } = req.query;
    let sql = 'SELECT * FROM equipments WHERE 1=1';
    const params = [];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';

    const [equipments] = await pool.query(sql, params);

    res.json({
      success: true,
      data: equipments
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', optionalAuthMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const [equipments] = await pool.query(
      'SELECT * FROM equipments WHERE id = ?',
      [id]
    );

    if (equipments.length === 0) {
      return res.status(404).json({
        success: false,
        message: '装备不存在'
      });
    }

    res.json({
      success: true,
      data: equipments[0]
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
