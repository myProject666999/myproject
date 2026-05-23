const express = require('express');
const pool = require('../db/pool');
const { authRequired } = require('../utils/auth');

const router = express.Router();

router.get('/playlist/:playlistId', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM songs WHERE playlist_id = ? ORDER BY sort_order ASC, id ASC',
      [req.params.playlistId]
    );
    res.json({ code: 0, data: rows });
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM songs WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ code: 404, message: '歌曲不存在' });
    res.json({ code: 0, data: rows[0] });
  } catch (e) { next(e); }
});

router.post('/', authRequired, async (req, res, next) => {
  try {
    const { playlist_id, title, artist = '', audio_url = '', audio_path = '', sort_order = 0 } = req.body;
    if (!playlist_id || !title) return res.status(400).json({ code: 400, message: '歌单和标题不能为空' });
    const [pl] = await pool.query('SELECT user_id FROM playlists WHERE id = ?', [playlist_id]);
    if (pl.length === 0) return res.status(404).json({ code: 404, message: '歌单不存在' });
    if (pl[0].user_id !== req.user.id) return res.status(403).json({ code: 403, message: '无权限' });
    const [result] = await pool.query(
      'INSERT INTO songs (playlist_id, title, artist, audio_url, audio_path, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      [playlist_id, title, artist, audio_url, audio_path, sort_order]
    );
    res.json({ code: 0, message: '添加成功', data: { id: result.insertId } });
  } catch (e) { next(e); }
});

router.put('/:id', authRequired, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT p.user_id FROM songs s JOIN playlists p ON s.playlist_id = p.id WHERE s.id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ code: 404, message: '歌曲不存在' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ code: 403, message: '无权限' });
    const { title, artist, audio_url, audio_path, sort_order } = req.body;
    const sets = []; const vals = [];
    if (title !== undefined) { sets.push('title = ?'); vals.push(title); }
    if (artist !== undefined) { sets.push('artist = ?'); vals.push(artist); }
    if (audio_url !== undefined) { sets.push('audio_url = ?'); vals.push(audio_url); }
    if (audio_path !== undefined) { sets.push('audio_path = ?'); vals.push(audio_path); }
    if (sort_order !== undefined) { sets.push('sort_order = ?'); vals.push(sort_order); }
    if (sets.length === 0) return res.json({ code: 0, message: '无更新' });
    vals.push(req.params.id);
    await pool.query(`UPDATE songs SET ${sets.join(',')} WHERE id = ?`, vals);
    res.json({ code: 0, message: '更新成功' });
  } catch (e) { next(e); }
});

router.delete('/:id', authRequired, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT p.user_id FROM songs s JOIN playlists p ON s.playlist_id = p.id WHERE s.id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ code: 404, message: '歌曲不存在' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ code: 403, message: '无权限' });
    await pool.query('DELETE FROM songs WHERE id = ?', [req.params.id]);
    res.json({ code: 0, message: '删除成功' });
  } catch (e) { next(e); }
});

module.exports = router;
