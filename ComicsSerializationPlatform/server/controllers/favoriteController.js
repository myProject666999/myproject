const { query } = require('../config/database');

async function toggleFavorite(req, res) {
  try {
    const { comicId } = req.body;
    const userId = req.user.id;
    
    const existing = await query(
      'SELECT id FROM favorites WHERE user_id = ? AND comic_id = ?',
      [userId, comicId]
    );
    
    if (existing.length > 0) {
      await query('DELETE FROM favorites WHERE user_id = ? AND comic_id = ?', [userId, comicId]);
      await query('UPDATE comics SET likes = likes - 1 WHERE id = ?', [comicId]);
      res.json({ message: '已取消收藏', favorited: false });
    } else {
      await query('INSERT INTO favorites (user_id, comic_id) VALUES (?, ?)', [userId, comicId]);
      await query('UPDATE comics SET likes = likes + 1 WHERE id = ?', [comicId]);
      res.json({ message: '收藏成功', favorited: true });
    }
  } catch (error) {
    res.status(500).json({ error: '操作失败', message: error.message });
  }
}

async function getFavorites(req, res) {
  try {
    const userId = req.user.id;
    
    const favorites = await query(
      `SELECT f.*, c.title, c.cover, c.description, c.status
       FROM favorites f
       JOIN comics c ON f.comic_id = c.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [userId]
    );
    
    res.json({ favorites });
  } catch (error) {
    res.status(500).json({ error: '获取收藏列表失败', message: error.message });
  }
}

async function checkFavorite(req, res) {
  try {
    const { comicId } = req.params;
    const userId = req.user.id;
    
    const existing = await query(
      'SELECT id FROM favorites WHERE user_id = ? AND comic_id = ?',
      [userId, comicId]
    );
    
    res.json({ favorited: existing.length > 0 });
  } catch (error) {
    res.status(500).json({ error: '检查收藏状态失败', message: error.message });
  }
}

module.exports = { toggleFavorite, getFavorites, checkFavorite };
