const { query } = require('../config/database');

async function getComics(req, res) {
  try {
    const { page = 1, limit = 12, category, keyword, sort = 'latest' } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE is_published = TRUE';
    const params = [];
    
    if (category) {
      whereClause += ' AND category = ?';
      params.push(category);
    }
    
    if (keyword) {
      whereClause += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    
    let orderBy = 'ORDER BY created_at DESC';
    if (sort === 'popular') {
      orderBy = 'ORDER BY views DESC';
    } else if (sort === 'likes') {
      orderBy = 'ORDER BY likes DESC';
    }
    
    const comics = await query(
      `SELECT * FROM comics ${whereClause} ${orderBy} LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    
    const countResult = await query(
      `SELECT COUNT(*) as total FROM comics ${whereClause}`,
      params
    );
    
    res.json({
      comics,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: '获取漫画列表失败', message: error.message });
  }
}

async function getComicById(req, res) {
  try {
    const { id } = req.params;
    
    const comics = await query(
      `SELECT c.*, 
        (SELECT COUNT(*) FROM chapters WHERE comic_id = c.id) as chapter_count
       FROM comics c WHERE c.id = ?`,
      [id]
    );
    
    if (comics.length === 0) {
      return res.status(404).json({ error: '漫画不存在' });
    }
    
    const userId = req.user?.id;
    let isSubscribed = false;
    let isFavorited = false;
    
    if (userId) {
      const subs = await query('SELECT id FROM subscriptions WHERE user_id = ? AND comic_id = ?', [userId, id]);
      const favs = await query('SELECT id FROM favorites WHERE user_id = ? AND comic_id = ?', [userId, id]);
      isSubscribed = subs.length > 0;
      isFavorited = favs.length > 0;
    }
    
    res.json({ 
      comic: { 
        ...comics[0], 
        chapter_count: comics[0].chapter_count,
        is_subscribed: isSubscribed,
        is_favorited: isFavorited
      } 
    });
  } catch (error) {
    res.status(500).json({ error: '获取漫画详情失败', message: error.message });
  }
}

async function createComic(req, res) {
  try {
    const { title, description, category } = req.body;
    const authorId = req.user.id;
    const cover = req.file ? `/uploads/covers/${req.file.filename}` : '/uploads/covers/default.jpg';
    
    const result = await query(
      'INSERT INTO comics (title, author_id, author_name, cover, description, category) VALUES (?, ?, ?, ?, ?, ?)',
      [title, authorId, req.user.username, cover, description, category]
    );
    
    res.status(201).json({ 
      message: '创建成功', 
      comicId: result.insertId 
    });
  } catch (error) {
    res.status(500).json({ error: '创建漫画失败', message: error.message });
  }
}

async function updateComic(req, res) {
  try {
    const { id } = req.params;
    const { title, description, category, status } = req.body;
    
    const comics = await query('SELECT * FROM comics WHERE id = ?', [id]);
    
    if (comics.length === 0) {
      return res.status(404).json({ error: '漫画不存在' });
    }
    
    if (comics[0].author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限修改' });
    }
    
    const updates = [];
    const params = [];
    
    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (category !== undefined) {
      updates.push('category = ?');
      params.push(category);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    if (req.file) {
      updates.push('cover = ?');
      params.push(`/uploads/covers/${req.file.filename}`);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: '没有需要更新的内容' });
    }
    
    params.push(id);
    await query(`UPDATE comics SET ${updates.join(', ')} WHERE id = ?`, params);
    
    res.json({ message: '更新成功' });
  } catch (error) {
    res.status(500).json({ error: '更新漫画失败', message: error.message });
  }
}

async function deleteComic(req, res) {
  try {
    const { id } = req.params;
    
    const comics = await query('SELECT * FROM comics WHERE id = ?', [id]);
    
    if (comics.length === 0) {
      return res.status(404).json({ error: '漫画不存在' });
    }
    
    if (comics[0].author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限删除' });
    }
    
    await query('DELETE FROM comics WHERE id = ?', [id]);
    
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除漫画失败', message: error.message });
  }
}

async function getUserComics(req, res) {
  try {
    const authorId = req.user.id;
    const comics = await query(
      'SELECT * FROM comics WHERE author_id = ? ORDER BY created_at DESC',
      [authorId]
    );
    
    res.json({ comics });
  } catch (error) {
    res.status(500).json({ error: '获取漫画列表失败', message: error.message });
  }
}

module.exports = { getComics, getComicById, createComic, updateComic, deleteComic, getUserComics };
