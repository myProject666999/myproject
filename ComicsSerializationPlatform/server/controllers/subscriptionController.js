const { query } = require('../config/database');

async function toggleSubscription(req, res) {
  try {
    const { comicId } = req.body;
    const userId = req.user.id;
    
    const existing = await query(
      'SELECT id FROM subscriptions WHERE user_id = ? AND comic_id = ?',
      [userId, comicId]
    );
    
    if (existing.length > 0) {
      await query('DELETE FROM subscriptions WHERE user_id = ? AND comic_id = ?', [userId, comicId]);
      res.json({ message: '已取消订阅', subscribed: false });
    } else {
      await query(
        'INSERT INTO subscriptions (user_id, comic_id) VALUES (?, ?)',
        [userId, comicId]
      );
      res.json({ message: '订阅成功', subscribed: true });
    }
  } catch (error) {
    res.status(500).json({ error: '操作失败', message: error.message });
  }
}

async function getSubscriptions(req, res) {
  try {
    const userId = req.user.id;
    
    const subscriptions = await query(
      `SELECT s.*, c.title, c.cover, c.description, c.status, c.total_chapters,
        (SELECT MAX(chapter_number) FROM chapters WHERE comic_id = c.id AND status = 'published') as latest_chapter
       FROM subscriptions s
       JOIN comics c ON s.comic_id = c.id
       WHERE s.user_id = ?
       ORDER BY s.created_at DESC`,
      [userId]
    );
    
    res.json({ subscriptions });
  } catch (error) {
    res.status(500).json({ error: '获取订阅列表失败', message: error.message });
  }
}

async function checkSubscription(req, res) {
  try {
    const { comicId } = req.params;
    const userId = req.user.id;
    
    const existing = await query(
      'SELECT id FROM subscriptions WHERE user_id = ? AND comic_id = ?',
      [userId, comicId]
    );
    
    res.json({ subscribed: existing.length > 0 });
  } catch (error) {
    res.status(500).json({ error: '检查订阅状态失败', message: error.message });
  }
}

module.exports = { toggleSubscription, getSubscriptions, checkSubscription };
