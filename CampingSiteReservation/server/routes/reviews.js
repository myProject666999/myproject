const express = require('express');
const pool = require('../config/database');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalAuthMiddleware, async (req, res, next) => {
  try {
    const { campsite_id, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let sql = `SELECT r.*, u.nickname, u.avatar, c.name as campsite_name
               FROM reviews r
               LEFT JOIN users u ON r.user_id = u.id
               LEFT JOIN campsites c ON r.campsite_id = c.id
               WHERE 1=1`;
    const params = [];

    if (campsite_id) {
      sql += ' AND r.campsite_id = ?';
      params.push(campsite_id);
    }

    sql += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [reviews] = await pool.query(sql, params);

    for (const review of reviews) {
      const [photos] = await pool.query(
        'SELECT * FROM review_photos WHERE review_id = ? ORDER BY sort_order',
        [review.id]
      );
      review.photos = photos;
    }

    const countParams = [];
    let countSql = 'SELECT COUNT(*) as total FROM reviews WHERE 1=1';
    
    if (campsite_id) {
      countSql += ' AND campsite_id = ?';
      countParams.push(campsite_id);
    }

    const [countResult] = await pool.query(countSql, countParams);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', optionalAuthMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const [reviews] = await pool.query(
      `SELECT r.*, u.nickname, u.avatar, c.name as campsite_name
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       LEFT JOIN campsites c ON r.campsite_id = c.id
       WHERE r.id = ?`,
      [id]
    );

    if (reviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: '评价不存在'
      });
    }

    const review = reviews[0];

    const [photos] = await pool.query(
      'SELECT * FROM review_photos WHERE review_id = ? ORDER BY sort_order',
      [id]
    );
    review.photos = photos;

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', authMiddleware, async (req, res, next) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { reservation_id, campsite_id, rating, content, photos = [] } = req.body;

    if (!campsite_id || !rating || !content) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: '请填写完整的评价信息'
      });
    }

    if (reservation_id) {
      const [reservations] = await connection.query(
        'SELECT id FROM reservations WHERE id = ? AND user_id = ? AND status = "checked_out"',
        [reservation_id, req.user.id]
      );

      if (reservations.length === 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: '只能对已完成的订单进行评价'
        });
      }

      const [existingReviews] = await connection.query(
        'SELECT id FROM reviews WHERE reservation_id = ?',
        [reservation_id]
      );

      if (existingReviews.length > 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: '该订单已评价过'
        });
      }
    }

    const [result] = await connection.query(
      `INSERT INTO reviews 
       (user_id, reservation_id, campsite_id, rating, content)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, reservation_id || null, campsite_id, rating, content]
    );

    const reviewId = result.insertId;

    for (let i = 0; i < photos.length; i++) {
      await connection.query(
        'INSERT INTO review_photos (review_id, photo_url, sort_order) VALUES (?, ?, ?)',
        [reviewId, photos[i], i]
      );
    }

    await connection.commit();

    res.json({
      success: true,
      message: '评价成功',
      data: {
        review_id: reviewId
      }
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

module.exports = router;
