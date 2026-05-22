const { query } = require('../config/database');

async function getComments(req, res) {
  try {
    const { comicId, chapterId } = req.query;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE c.comic_id = ?';
    const params = [comicId];
    
    if (chapterId) {
      whereClause += ' AND c.chapter_id = ?';
      params.push(chapterId);
    } else {
      whereClause += ' AND c.chapter_id IS NULL';
    }
    
    const comments = await query(
      `SELECT c.*, u.username, u.avatar
       FROM comments c
       JOIN users u ON c.user_id = u.id
       ${whereClause}
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    
    const countResult = await query(
      `SELECT COUNT(*) as total FROM comments c ${whereClause}`,
      params
    );
    
    res.json({
      comments,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: '获取评论失败', message: error.message });
  }
}

async function createComment(req, res) {
  try {
    const { comicId, chapterId, content, parentId } = req.body;
    const userId = req.user.id;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: '评论内容不能为空' });
    }
    
    const result = await query(
      'INSERT INTO comments (user_id, comic_id, chapter_id, content, parent_id) VALUES (?, ?, ?, ?, ?)',
      [userId, comicId, chapterId || null, content, parentId || null]
    );
    
    const comments = await query(
      `SELECT c.*, u.username, u.avatar
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [result.insertId]
    );
    
    res.status(201).json({ 
      message: '评论成功', 
      comment: comments[0] 
    });
  } catch (error) {
    res.status(500).json({ error: '评论失败', message: error.message });
  }
}

async function deleteComment(req, res) {
  try {
    const { id } = req.params;
    
    const comments = await query('SELECT * FROM comments WHERE id = ?', [id]);
    
    if (comments.length === 0) {
      return res.status(404).json({ error: '评论不存在' });
    }
    
    if (comments[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限删除' });
    }
    
    await query('DELETE FROM comments WHERE id = ? OR parent_id = ?', [id, id]);
    
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除评论失败', message: error.message });
  }
}

async function likeComment(req, res) {
  try {
    const { id } = req.params;
    
    await query('UPDATE comments SET likes = likes + 1 WHERE id = ?', [id]);
    
    const comments = await query('SELECT likes FROM comments WHERE id = ?', [id]);
    
    res.json({ likes: comments[0].likes });
  } catch (error) {
    res.status(500).json({ error: '点赞失败', message: error.message });
  }
}

module.exports = { getComments, createComment, deleteComment, likeComment };
