const express = require('express');
const pool = require('../config/database');
const { optionalAuthMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalAuthMiddleware, async (req, res, next) => {
  try {
    const { type, status } = req.query;
    let sql = 'SELECT * FROM activities WHERE 1=1';
    const params = [];

    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';

    const [activities] = await pool.query(sql, params);

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', optionalAuthMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const [activities] = await pool.query(
      'SELECT * FROM activities WHERE id = ?',
      [id]
    );

    if (activities.length === 0) {
      return res.status(404).json({
        success: false,
        message: '活动不存在'
      });
    }

    res.json({
      success: true,
      data: activities[0]
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
