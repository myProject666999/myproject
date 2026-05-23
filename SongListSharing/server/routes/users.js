const express = require('express');
const pool = require('../db/pool');
const { authRequired } = require('../utils/auth');

const router = express.Router();

router.get('/me', authRequired, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, nickname, avatar, bio, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ code: 404, message: '用户不存在' });
    res.json({ code: 0, data: rows[0] });
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, nickname, avatar, bio, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ code: 404, message: '用户不存在' });
    res.json({ code: 0, data: rows[0] });
  } catch (e) { next(e); }
});

router.get('/:id/playlists', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, title, description, cover, like_count, view_count, created_at FROM playlists WHERE user_id = ? AND is_public = 1 ORDER BY created_at DESC',
      [req.params.id]
    );
    res.json({ code: 0, data: rows });
  } catch (e) { next(e); }
});

module.exports = router;
