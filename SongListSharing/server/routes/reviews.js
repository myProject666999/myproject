const express = require('express');
const pool = require('../db/pool');
const { authRequired } = require('../utils/auth');

const router = express.Router();

router.get('/song/:songId', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, u.username, u.nickname, u.avatar
       FROM reviews r LEFT JOIN users u ON r.user_id = u.id
       WHERE r.song_id = ? ORDER BY r.created_at DESC`,
      [req.params.songId]
    );
    res.json({ code: 0, data: rows });
  } catch (e) { next(e); }
});

router.post('/', authRequired, async (req, res, next) => {
  try {
    const { song_id, content, rating } = req.body;
    if (!song_id || !content) return res.status(400).json({ code: 400, message: '歌曲和内容不能为空' });
    const [result] = await pool.query(
      'INSERT INTO reviews (song_id, user_id, content, rating) VALUES (?, ?, ?, ?)',
      [song_id, req.user.id, content, rating || null]
    );
    res.json({ code: 0, message: '点评成功', data: { id: result.insertId } });
  } catch (e) { next(e); }
});

router.delete('/:id', authRequired, async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT user_id FROM reviews WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ code: 404, message: '点评不存在' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ code: 403, message: '无权限' });
    await pool.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    res.json({ code: 0, message: '删除成功' });
  } catch (e) { next(e); }
});

module.exports = router;
