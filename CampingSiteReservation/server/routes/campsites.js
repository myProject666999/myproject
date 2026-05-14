const express = require('express');
const pool = require('../config/database');
const { optionalAuthMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalAuthMiddleware, async (req, res, next) => {
  try {
    const { type, status } = req.query;
    let sql = 'SELECT * FROM campsites WHERE 1=1';
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

    const [campsites] = await pool.query(sql, params);

    res.json({
      success: true,
      data: campsites
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', optionalAuthMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const [campsites] = await pool.query(
      'SELECT * FROM campsites WHERE id = ?',
      [id]
    );

    if (campsites.length === 0) {
      return res.status(404).json({
        success: false,
        message: '营位不存在'
      });
    }

    res.json({
      success: true,
      data: campsites[0]
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/availability', optionalAuthMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: '请提供开始日期和结束日期'
      });
    }

    const [conflicts] = await pool.query(
      `SELECT r.* FROM reservations r
       WHERE r.campsite_id = ? 
       AND r.status NOT IN ('cancelled', 'checked_out')
       AND (
         (r.checkin_date <= ? AND r.checkout_date > ?)
         OR (r.checkin_date < ? AND r.checkout_date >= ?)
         OR (r.checkin_date >= ? AND r.checkout_date <= ?)
       )`,
      [id, end_date, start_date, end_date, start_date, start_date, end_date]
    );

    res.json({
      success: true,
      data: {
        available: conflicts.length === 0,
        conflicts: conflicts
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/reviews', optionalAuthMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const [reviews] = await pool.query(
      `SELECT r.*, u.nickname, u.avatar
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.campsite_id = ?
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [id, parseInt(limit), parseInt(offset)]
    );

    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM reviews WHERE campsite_id = ?',
      [id]
    );

    const [stats] = await pool.query(
      `SELECT 
        AVG(rating) as average_rating,
        COUNT(*) as total_reviews
       FROM reviews 
       WHERE campsite_id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total
        },
        stats: stats[0]
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
