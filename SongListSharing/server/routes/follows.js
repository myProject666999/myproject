const express = require('express');
const pool = require('../db/pool');
const { authRequired } = require('../utils/auth');

const router = express.Router();

router.post('/:userId', authRequired, async (req, res, next) => {
  try {
    const followingId = req.params.userId;
    if (Number(followingId) === req.user.id) return res.status(400).json({ code: 400, message: '不能关注自己' });
    await pool.query(
      'INSERT IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)',
      [req.user.id, followingId]
    );
    res.json({ code: 0, message: '关注成功' });
  } catch (e) { next(e); }
});

router.delete('/:userId', authRequired, async (req, res, next) => {
  try {
    await pool.query(
      'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
      [req.user.id, req.params.userId]
    );
    res.json({ code: 0, message: '取消关注成功' });
  } catch (e) { next(e); }
});

router.get('/:userId/followers', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.nickname, u.avatar
       FROM follows f JOIN users u ON f.follower_id = u.id
       WHERE f.following_id = ? ORDER BY f.created_at DESC`,
      [req.params.userId]
    );
    res.json({ code: 0, data: rows });
  } catch (e) { next(e); }
});

router.get('/:userId/following', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.nickname, u.avatar
       FROM follows f JOIN users u ON f.following_id = u.id
       WHERE f.follower_id = ? ORDER BY f.created_at DESC`,
      [req.params.userId]
    );
    res.json({ code: 0, data: rows });
  } catch (e) { next(e); }
});

router.get('/check/:userId', authRequired, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?',
      [req.user.id, req.params.userId]
    );
    res.json({ code: 0, data: { followed: rows.length > 0 } });
  } catch (e) { next(e); }
});

module.exports = router;
