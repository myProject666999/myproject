const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../models/db');
const audioProcessor = require('../utils/audioProcessor');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../public/uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-m4a'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('不支持的音频格式'), false);
        }
    },
    limits: {
        fileSize: 500 * 1024 * 1024
    }
});

router.post('/upload', upload.single('audio'), async (req, res) => {
    try {
        const { podcastId, title } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ error: '未找到音频文件' });
        }

        const filePath = req.file.path;
        const fileName = req.file.filename;

        const audioInfo = await audioProcessor.getAudioInfo(filePath);

        const [result] = await db.query(
            `INSERT INTO episodes (podcast_id, title, original_file, duration, file_size, sample_rate, channels, bitrate, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'processing')`,
            [podcastId || 1, title || req.file.originalname, fileName, audioInfo.duration, audioInfo.fileSize, 
             audioInfo.sampleRate, audioInfo.channels, audioInfo.bitrate]
        );

        const episodeId = result.insertId;

        setImmediate(async () => {
            try {
                const waveformPath = path.join(__dirname, `../../public/waveforms/${episodeId}.json`);
                await audioProcessor.generateWaveform(filePath, waveformPath);

                await db.query(
                    `UPDATE episodes SET waveform_file = ?, status = 'ready' WHERE id = ?`,
                    [`${episodeId}.json`, episodeId]
                );
            } catch (err) {
                console.error('波形生成失败:', err);
                await db.query(`UPDATE episodes SET status = 'ready' WHERE id = ?`, [episodeId]);
            }
        });

        res.json({
            success: true,
            episodeId: episodeId,
            fileName: fileName,
            audioInfo: audioInfo
        });
    } catch (err) {
        console.error('上传失败:', err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/episodes', async (req, res) => {
    try {
        const { podcastId, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let sql = `SELECT * FROM episodes WHERE 1=1`;
        const params = [];

        if (podcastId) {
            sql += ` AND podcast_id = ?`;
            params.push(podcastId);
        }

        sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), offset);

        const episodes = await db.query(sql, params);

        const [countResult] = await db.query(
            `SELECT COUNT(*) as total FROM episodes WHERE podcast_id = ?`,
            [podcastId || 1]
        );

        res.json({
            success: true,
            episodes: episodes,
            total: countResult.total,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (err) {
        console.error('获取列表失败:', err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/episodes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const episodes = await db.query(`SELECT * FROM episodes WHERE id = ?`, [id]);
        
        if (episodes.length === 0) {
            return res.status(404).json({ error: '音频不存在' });
        }

        const episode = episodes[0];
        
        const chapters = await db.query(
            `SELECT * FROM chapters WHERE episode_id = ? ORDER BY start_time ASC`,
            [id]
        );

        const edits = await db.query(
            `SELECT * FROM edits WHERE episode_id = ? ORDER BY created_at ASC`,
            [id]
        );

        const showNotes = await db.query(
            `SELECT * FROM show_notes WHERE episode_id = ?`,
            [id]
        );

        res.json({
            success: true,
            episode: episode,
            chapters: chapters,
            edits: edits,
            showNotes: showNotes[0] || null
        });
    } catch (err) {
        console.error('获取音频详情失败:', err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/waveform/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const waveformPath = path.join(__dirname, `../../public/waveforms/${id}.json`);
        
        if (fs.existsSync(waveformPath)) {
            const waveformData = JSON.parse(fs.readFileSync(waveformPath, 'utf8'));
            res.json({ success: true, waveform: waveformData });
        } else {
            res.json({ success: true, waveform: [] });
        }
    } catch (err) {
        console.error('获取波形失败:', err);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/episodes/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const episodes = await db.query(`SELECT * FROM episodes WHERE id = ?`, [id]);
        if (episodes.length === 0) {
            return res.status(404).json({ error: '音频不存在' });
        }

        const episode = episodes[0];

        const originalPath = path.join(__dirname, '../../public/uploads', episode.original_file);
        if (fs.existsSync(originalPath)) {
            fs.unlinkSync(originalPath);
        }

        const waveformPath = path.join(__dirname, `../../public/waveforms/${id}.json`);
        if (fs.existsSync(waveformPath)) {
            fs.unlinkSync(waveformPath);
        }

        await db.query(`DELETE FROM episodes WHERE id = ?`, [id]);

        res.json({ success: true, message: '删除成功' });
    } catch (err) {
        console.error('删除失败:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
