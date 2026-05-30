const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const db = require('../models/db');
const audioProcessor = require('../utils/audioProcessor');
const rssGenerator = require('../utils/rssGenerator');

router.post('/export', async (req, res) => {
    try {
        const { episodeId, format = 'mp3', quality = 'standard', includeChapters = true } = req.body;

        if (!episodeId) {
            return res.status(400).json({ error: '缺少必要参数' });
        }

        const episodes = await db.query(`SELECT * FROM episodes WHERE id = ?`, [episodeId]);
        if (episodes.length === 0) {
            return res.status(404).json({ error: '音频不存在' });
        }

        const episode = episodes[0];

        const taskResult = await db.query(
            `INSERT INTO export_tasks (episode_id, task_type, format, quality, status)
             VALUES (?, 'audio', ?, ?, 'pending')`,
            [episodeId, format, quality]
        );

        const taskId = taskResult.insertId;

        res.json({
            success: true,
            taskId: taskId,
            message: '导出任务已创建，正在处理...'
        });

        setImmediate(async () => {
            try {
                await db.query(
                    `UPDATE export_tasks SET status = 'processing', progress = 10, started_at = NOW() WHERE id = ?`,
                    [taskId]
                );

                const inputPath = path.join(__dirname, '../../public/uploads', episode.original_file);
                const outputFileName = `${episodeId}.${format}`;
                const outputPath = path.join(__dirname, '../../public/exports', outputFileName);

                const exportDir = path.dirname(outputPath);
                if (!fs.existsSync(exportDir)) {
                    fs.mkdirSync(exportDir, { recursive: true });
                }

                await db.query(`UPDATE export_tasks SET progress = 30 WHERE id = ?`, [taskId]);

                if (includeChapters) {
                    const chapters = await db.query(
                        `SELECT * FROM chapters WHERE episode_id = ? ORDER BY start_time ASC`,
                        [episodeId]
                    );

                    if (chapters.length > 0) {
                        await audioProcessor.exportWithChapters(inputPath, outputPath, chapters);
                    } else {
                        fs.copyFileSync(inputPath, outputPath);
                    }
                } else {
                    fs.copyFileSync(inputPath, outputPath);
                }

                await db.query(`UPDATE export_tasks SET progress = 80 WHERE id = ?`, [taskId]);

                const stats = fs.statSync(outputPath);

                await db.query(
                    `UPDATE export_tasks SET status = 'completed', progress = 100, output_file = ?, completed_at = NOW() WHERE id = ?`,
                    [outputFileName, taskId]
                );

                await db.query(`UPDATE episodes SET status = 'ready' WHERE id = ?`, [episodeId]);

            } catch (err) {
                console.error('导出任务失败:', err);
                await db.query(
                    `UPDATE export_tasks SET status = 'failed', error_message = ? WHERE id = ?`,
                    [err.message, taskId]
                );
            }
        });

    } catch (err) {
        console.error('创建导出任务失败:', err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/export/tasks/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;

        const tasks = await db.query(`SELECT * FROM export_tasks WHERE id = ?`, [taskId]);

        if (tasks.length === 0) {
            return res.status(404).json({ error: '任务不存在' });
        }

        res.json({
            success: true,
            task: tasks[0]
        });
    } catch (err) {
        console.error('获取任务状态失败:', err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/export/episodes/:episodeId/tasks', async (req, res) => {
    try {
        const { episodeId } = req.params;

        const tasks = await db.query(
            `SELECT * FROM export_tasks WHERE episode_id = ? ORDER BY created_at DESC LIMIT 10`,
            [episodeId]
        );

        res.json({
            success: true,
            tasks: tasks
        });
    } catch (err) {
        console.error('获取导出任务列表失败:', err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/publish', async (req, res) => {
    try {
        const { episodeId } = req.body;

        if (!episodeId) {
            return res.status(400).json({ error: '缺少必要参数' });
        }

        const episodes = await db.query(`SELECT * FROM episodes WHERE id = ?`, [episodeId]);
        if (episodes.length === 0) {
            return res.status(404).json({ error: '音频不存在' });
        }

        const exportFile = `${episodeId}.mp3`;
        const exportPath = path.join(__dirname, '../../public/exports', exportFile);

        if (!fs.existsSync(exportPath)) {
            return res.status(400).json({ error: '请先导出音频文件' });
        }

        await db.query(
            `UPDATE episodes SET status = 'published', is_public = 1, published_at = NOW() WHERE id = ?`,
            [episodeId]
        );

        res.json({
            success: true,
            message: '发布成功'
        });
    } catch (err) {
        console.error('发布失败:', err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/rss/:podcastId', async (req, res) => {
    try {
        const { podcastId } = req.params;
        const baseUrl = `${req.protocol}://${req.get('host')}`;

        const podcasts = await db.query(`SELECT * FROM podcasts WHERE id = ?`, [podcastId]);
        if (podcasts.length === 0) {
            return res.status(404).json({ error: '播客不存在' });
        }

        const podcast = podcasts[0];

        const episodes = await db.query(
            `SELECT * FROM episodes WHERE podcast_id = ? AND status = 'published' ORDER BY published_at DESC`,
            [podcastId]
        );

        const rssFeed = rssGenerator.generateFeed(podcast, episodes, baseUrl);

        res.set('Content-Type', 'application/rss+xml; charset=utf-8');
        res.send(rssFeed);
    } catch (err) {
        console.error('生成 RSS 失败:', err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/podcasts', async (req, res) => {
    try {
        const { userId = 1, title, description, author, category, coverImage, website } = req.body;

        if (!title) {
            return res.status(400).json({ error: '标题不能为空' });
        }

        const result = await db.query(
            `INSERT INTO podcasts (user_id, title, description, author, category, cover_image, website)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, title, description ?? null, author ?? null, category ?? null, coverImage ?? null, website ?? null]
        );

        const podcastId = result.insertId;

        await db.query(
            `INSERT INTO rss_feeds (podcast_id, is_active) VALUES (?, 1)`,
            [podcastId]
        );

        res.json({
            success: true,
            podcastId: podcastId,
            message: '播客创建成功'
        });
    } catch (err) {
        console.error('创建播客失败:', err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/podcasts', async (req, res) => {
    try {
        const { userId = 1 } = req.query;

        const podcasts = await db.query(
            `SELECT p.*, 
                (SELECT COUNT(*) FROM episodes WHERE podcast_id = p.id) as episode_count,
                (SELECT COUNT(*) FROM episodes WHERE podcast_id = p.id AND status = 'published') as published_count
             FROM podcasts p WHERE p.user_id = ? ORDER BY p.created_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            podcasts: podcasts
        });
    } catch (err) {
        console.error('获取播客列表失败:', err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/podcasts/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const podcasts = await db.query(`SELECT * FROM podcasts WHERE id = ?`, [id]);
        if (podcasts.length === 0) {
            return res.status(404).json({ error: '播客不存在' });
        }

        const rssFeeds = await db.query(`SELECT * FROM rss_feeds WHERE podcast_id = ?`, [id]);

        res.json({
            success: true,
            podcast: podcasts[0],
            rssFeed: rssFeeds[0] || null
        });
    } catch (err) {
        console.error('获取播客详情失败:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
