const express = require('express');
const pool = require('../db/pool');
const { authRequired } = require('../utils/auth');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, sort = 'hot', keyword = '' } = req.query;
    const offset = (page - 1) * pageSize;
    let where = 'p.is_public = 1';
    const params = [];
    if (keyword) {
      where += ' AND (p.title LIKE ? OR p.description LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    const order = sort === 'new' ? 'p.created_at DESC' : 'p.like_count DESC, p.view_count DESC';
    const [rows] = await pool.query(
      `SELECT p.id, p.title, p.description, p.cover, p.like_count, p.view_count, p.created_at,
              u.id AS user_id, u.username, u.nickname, u.avatar
       FROM playlists p LEFT JOIN users u ON p.user_id = u.id
       WHERE ${where} ORDER BY ${order} LIMIT ? OFFSET ?`,
      [...params, Number(pageSize), Number(offset)]
    );
    const [countRow] = await pool.query(
      `SELECT COUNT(*) AS total FROM playlists p WHERE ${where}`, params
    );
    res.json({ code: 0, data: { list: rows, total: countRow[0].total, page: Number(page), pageSize: Number(pageSize) } });
  } catch (e) { next(e); }
});

router.get('/recommend', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.title, p.description, p.cover, p.like_count, p.view_count, p.created_at,
              u.id AS user_id, u.username, u.nickname, u.avatar
       FROM playlists p LEFT JOIN users u ON p.user_id = u.id
       WHERE p.is_public = 1 ORDER BY p.like_count DESC, p.view_count DESC LIMIT 6`
    );
    res.json({ code: 0, data: rows });
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, u.username, u.nickname, u.avatar
       FROM playlists p LEFT JOIN users u ON p.user_id = u.id WHERE p.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ code: 404, message: '歌单不存在' });
    await pool.query('UPDATE playlists SET view_count = view_count + 1 WHERE id = ?', [req.params.id]);
    rows[0].view_count += 1;
    res.json({ code: 0, data: rows[0] });
  } catch (e) { next(e); }
});

router.post('/', authRequired, async (req, res, next) => {
  try {
    const { title, description = '', cover = '', is_public = 1 } = req.body;
    if (!title) return res.status(400).json({ code: 400, message: '标题不能为空' });
    const [result] = await pool.query(
      'INSERT INTO playlists (user_id, title, description, cover, is_public) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, title, description, cover, is_public]
    );
    res.json({ code: 0, message: '创建成功', data: { id: result.insertId } });
  } catch (e) { next(e); }
});

router.put('/:id', authRequired, async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT user_id FROM playlists WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ code: 404, message: '歌单不存在' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ code: 403, message: '无权限' });
    const { title, description, cover, is_public } = req.body;
    const sets = []; const vals = [];
    if (title !== undefined) { sets.push('title = ?'); vals.push(title); }
    if (description !== undefined) { sets.push('description = ?'); vals.push(description); }
    if (cover !== undefined) { sets.push('cover = ?'); vals.push(cover); }
    if (is_public !== undefined) { sets.push('is_public = ?'); vals.push(is_public); }
    if (sets.length === 0) return res.json({ code: 0, message: '无更新' });
    vals.push(req.params.id);
    await pool.query(`UPDATE playlists SET ${sets.join(',')} WHERE id = ?`, vals);
    res.json({ code: 0, message: '更新成功' });
  } catch (e) { next(e); }
});

router.delete('/:id', authRequired, async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT user_id FROM playlists WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ code: 404, message: '歌单不存在' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ code: 403, message: '无权限' });
    await pool.query('DELETE FROM playlists WHERE id = ?', [req.params.id]);
    res.json({ code: 0, message: '删除成功' });
  } catch (e) { next(e); }
});

router.post('/:id/like', authRequired, async (req, res, next) => {
  try {
    await pool.query('UPDATE playlists SET like_count = like_count + 1 WHERE id = ?', [req.params.id]);
    res.json({ code: 0, message: '点赞成功' });
  } catch (e) { next(e); }
});

module.exports = router;
