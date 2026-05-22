const { query } = require('../config/database');
const path = require('path');
const fs = require('fs');

async function getChapters(req, res) {
  try {
    const { comicId } = req.params;
    
    const chapters = await query(
      'SELECT id, title, chapter_number, views, created_at, status FROM chapters WHERE comic_id = ? ORDER BY chapter_number ASC',
      [comicId]
    );
    
    res.json({ chapters });
  } catch (error) {
    res.status(500).json({ error: '获取章节列表失败', message: error.message });
  }
}

async function getChapter(req, res) {
  try {
    const { comicId, chapterId } = req.params;
    
    const chapters = await query(
      'SELECT * FROM chapters WHERE id = ? AND comic_id = ?',
      [chapterId, comicId]
    );
    
    if (chapters.length === 0) {
      return res.status(404).json({ error: '章节不存在' });
    }
    
    const chapter = chapters[0];
    
    if (chapter.status === 'draft' && req.user?.role !== 'admin') {
      const comics = await query('SELECT author_id FROM comics WHERE id = ?', [comicId]);
      if (comics[0]?.author_id !== req.user?.id) {
        return res.status(403).json({ error: '该章节尚未发布' });
      }
    }
    
    let images = chapter.images;
    if (typeof images === 'string') {
      try {
        images = JSON.parse(images);
      } catch (e) {
        images = [];
      }
    }
    
    await query('UPDATE chapters SET views = views + 1 WHERE id = ?', [chapterId]);
    
    const allChapters = await query(
      'SELECT id, chapter_number FROM chapters WHERE comic_id = ? ORDER BY chapter_number',
      [comicId]
    );
    
    const currentIndex = allChapters.findIndex(c => c.id === parseInt(chapterId));
    const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
    const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;
    
    if (req.user) {
      await query(
        'INSERT INTO reading_history (user_id, comic_id, chapter_id) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE read_at = CURRENT_TIMESTAMP',
        [req.user.id, comicId, chapterId]
      );
      
      await query(
        'UPDATE subscriptions SET last_read_chapter = ? WHERE user_id = ? AND comic_id = ?',
        [chapter.chapter_number, req.user.id, comicId]
      );
    }
    
    await query('UPDATE comics SET views = views + 1 WHERE id = ?', [comicId]);
    
    res.json({
      chapter: {
        ...chapter,
        images,
        prev_chapter: prevChapter,
        next_chapter: nextChapter
      }
    });
  } catch (error) {
    res.status(500).json({ error: '获取章节内容失败', message: error.message });
  }
}

async function createChapter(req, res) {
  try {
    const { comicId } = req.params;
    const { title, chapterNumber, status = 'published' } = req.body;
    
    const comics = await query('SELECT * FROM comics WHERE id = ?', [comicId]);
    
    if (comics.length === 0) {
      return res.status(404).json({ error: '漫画不存在' });
    }
    
    if (comics[0].author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限添加章节' });
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: '请上传漫画图片' });
    }
    
    const chapterDir = path.join(__dirname, '..', 'uploads', 'chapters', comicId.toString());
    if (!fs.existsSync(chapterDir)) {
      fs.mkdirSync(chapterDir, { recursive: true });
    }
    
    const images = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const newFilename = `${i + 1}${path.extname(file.originalname)}`;
      const newPath = path.join(chapterDir, newFilename);
      
      fs.renameSync(file.path, newPath);
      images.push(`/uploads/chapters/${comicId}/${newFilename}`);
    }
    
    const result = await query(
      'INSERT INTO chapters (comic_id, title, chapter_number, images, status) VALUES (?, ?, ?, ?, ?)',
      [comicId, title, chapterNumber, JSON.stringify(images), status]
    );
    
    if (status === 'published') {
      await query(
        'UPDATE comics SET total_chapters = (SELECT COUNT(*) FROM chapters WHERE comic_id = ? AND status = "published") WHERE id = ?',
        [comicId, comicId]
      );
    }
    
    res.status(201).json({ 
      message: '章节创建成功', 
      chapterId: result.insertId 
    });
  } catch (error) {
    res.status(500).json({ error: '创建章节失败', message: error.message });
  }
}

async function updateChapter(req, res) {
  try {
    const { chapterId } = req.params;
    const { title, status } = req.body;
    
    const chapters = await query('SELECT * FROM chapters WHERE id = ?', [chapterId]);
    
    if (chapters.length === 0) {
      return res.status(404).json({ error: '章节不存在' });
    }
    
    const comics = await query('SELECT * FROM comics WHERE id = ?', [chapters[0].comic_id]);
    
    if (comics[0].author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限修改' });
    }
    
    const updates = [];
    const params = [];
    
    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    
    if (updates.length > 0) {
      params.push(chapterId);
      await query(`UPDATE chapters SET ${updates.join(', ')} WHERE id = ?`, params);
    }
    
    if (req.files && req.files.length > 0) {
      const comicId = chapters[0].comic_id;
      const chapterDir = path.join(__dirname, '..', 'uploads', 'chapters', comicId.toString());
      
      if (fs.existsSync(chapterDir)) {
        fs.readdirSync(chapterDir).forEach(f => {
          fs.unlinkSync(path.join(chapterDir, f));
        });
      } else {
        fs.mkdirSync(chapterDir, { recursive: true });
      }
      
      const images = [];
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const newFilename = `${i + 1}${path.extname(file.originalname)}`;
        const newPath = path.join(chapterDir, newFilename);
        
        fs.renameSync(file.path, newPath);
        images.push(`/uploads/chapters/${comicId}/${newFilename}`);
      }
      
      await query('UPDATE chapters SET images = ? WHERE id = ?', [JSON.stringify(images), chapterId]);
    }
    
    res.json({ message: '更新成功' });
  } catch (error) {
    res.status(500).json({ error: '更新章节失败', message: error.message });
  }
}

async function deleteChapter(req, res) {
  try {
    const { chapterId } = req.params;
    
    const chapters = await query('SELECT * FROM chapters WHERE id = ?', [chapterId]);
    
    if (chapters.length === 0) {
      return res.status(404).json({ error: '章节不存在' });
    }
    
    const comics = await query('SELECT * FROM comics WHERE id = ?', [chapters[0].comic_id]);
    
    if (comics[0].author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权限删除' });
    }
    
    await query('DELETE FROM chapters WHERE id = ?', [chapterId]);
    
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除章节失败', message: error.message });
  }
}

module.exports = { getChapters, getChapter, createChapter, updateChapter, deleteChapter };
