const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.post('/chapters', async (req, res) => {
    try {
        const { episodeId, title, startTime, endTime, description, linkUrl, imageUrl } = req.body;

        if (!episodeId || !title || startTime === undefined) {
            return res.status(400).json({ error: '缺少必要参数' });
        }

        const [result] = await db.query(
            `INSERT INTO chapters (episode_id, title, start_time, end_time, description, link_url, image_url)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [episodeId, title, startTime, endTime, description, linkUrl, imageUrl]
        );

        res.json({
            success: true,
            chapterId: result.insertId,
            message: '章节添加成功'
        });
    } catch (err) {
        console.error('添加章节失败:', err);
        res.status(500).json({ error: err.message });
    }
});

router.put('/chapters/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, startTime, endTime, description, linkUrl, imageUrl, sortOrder } = req.body;

        const chapters = await db.query(`SELECT * FROM chapters WHERE id = ?`, [id]);
        if (chapters.length === 0) {
            return res.status(404).json({ error: '章节不存在' });
        }

        await db.query(
            `UPDATE chapters SET title = ?, start_time = ?, end_time = ?, description = ?, link_url = ?, image_url = ?, sort_order = ?
             WHERE id = ?`,
            [title, startTime, endTime, description, linkUrl, imageUrl, sortOrder, id]
        );

        res.json({
            success: true,
            message: '章节更新成功'
        });
    } catch (err) {
        console.error('更新章节失败:', err);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/chapters/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const chapters = await db.query(`SELECT * FROM chapters WHERE id = ?`, [id]);
        if (chapters.length === 0) {
            return res.status(404).json({ error: '章节不存在' });
        }

        await db.query(`DELETE FROM chapters WHERE id = ?`, [id]);

        res.json({
            success: true,
            message: '章节删除成功'
        });
    } catch (err) {
        console.error('删除章节失败:', err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/episodes/:episodeId/chapters', async (req, res) => {
    try {
        const { episodeId } = req.params;

        const chapters = await db.query(
            `SELECT * FROM chapters WHERE episode_id = ? ORDER BY start_time ASC, sort_order ASC`,
            [episodeId]
        );

        res.json({
            success: true,
            chapters: chapters
        });
    } catch (err) {
        console.error('获取章节列表失败:', err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/edits', async (req, res) => {
    try {
        const { episodeId, editType, startTime, endTime, parameters } = req.body;

        if (!episodeId || !editType || startTime === undefined) {
            return res.status(400).json({ error: '缺少必要参数' });
        }

        const [result] = await db.query(
            `INSERT INTO edits (episode_id, edit_type, start_time, end_time, parameters)
             VALUES (?, ?, ?, ?, ?)`,
            [episodeId, editType, startTime, endTime, parameters ? JSON.stringify(parameters) : null]
        );

        res.json({
            success: true,
            editId: result.insertId,
            message: '剪辑操作已记录'
        });
    } catch (err) {
        console.error('记录剪辑操作失败:', err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/episodes/:episodeId/edits', async (req, res) => {
    try {
        const { episodeId } = req.params;

        const edits = await db.query(
            `SELECT * FROM edits WHERE episode_id = ? ORDER BY created_at ASC`,
            [episodeId]
        );

        res.json({
            success: true,
            edits: edits
        });
    } catch (err) {
        console.error('获取剪辑操作列表失败:', err);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/edits/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await db.query(`DELETE FROM edits WHERE id = ?`, [id]);

        res.json({
            success: true,
            message: '剪辑操作已删除'
        });
    } catch (err) {
        console.error('删除剪辑操作失败:', err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/shownotes', async (req, res) => {
    try {
        const { episodeId, content, transcription, keywords, summary } = req.body;

        if (!episodeId) {
            return res.status(400).json({ error: '缺少必要参数' });
        }

        const existing = await db.query(`SELECT * FROM show_notes WHERE episode_id = ?`, [episodeId]);

        if (existing.length > 0) {
            await db.query(
                `UPDATE show_notes SET content = ?, transcription = ?, keywords = ?, summary = ?
                 WHERE episode_id = ?`,
                [content, transcription, keywords, summary, episodeId]
            );
            res.json({
                success: true,
                message: 'Show Notes 更新成功'
            });
        } else {
            const [result] = await db.query(
                `INSERT INTO show_notes (episode_id, content, transcription, keywords, summary)
                 VALUES (?, ?, ?, ?, ?)`,
                [episodeId, content, transcription, keywords, summary]
            );
            res.json({
                success: true,
                showNotesId: result.insertId,
                message: 'Show Notes 创建成功'
            });
        }
    } catch (err) {
        console.error('保存 Show Notes 失败:', err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/episodes/:episodeId/shownotes', async (req, res) => {
    try {
        const { episodeId } = req.params;

        const showNotes = await db.query(
            `SELECT * FROM show_notes WHERE episode_id = ?`,
            [episodeId]
        );

        res.json({
            success: true,
            showNotes: showNotes[0] || null
        });
    } catch (err) {
        console.error('获取 Show Notes 失败:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
