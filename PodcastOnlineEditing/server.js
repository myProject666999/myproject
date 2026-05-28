require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./src/models/db');

const audioRoutes = require('./src/routes/audio');
const editRoutes = require('./src/routes/edit');
const publishRoutes = require('./src/routes/publish');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

app.use('/api/audio', audioRoutes);
app.use('/api/edit', editRoutes);
app.use('/api', publishRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/workbench/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'workbench.html'));
});

app.get('/chapters/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'chapters.html'));
});

app.get('/shownotes/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'shownotes.html'));
});

app.get('/publish/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'publish.html'));
});

app.get('/episodes', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'episodes.html'));
});

async function startServer() {
    try {
        console.log('正在初始化数据库...');
        await db.initDatabase();
        
        app.listen(PORT, () => {
            console.log(`
============================================
  播客在线剪辑与章节标记工坊
============================================
  服务器已启动: http://localhost:${PORT}
  
  主要页面:
  - 首页/节目列表: http://localhost:${PORT}
  - 音频工作台: http://localhost:${PORT}/workbench/1
  - 章节编辑: http://localhost:${PORT}/chapters/1
  - Show Notes: http://localhost:${PORT}/shownotes/1
  - 发布设置: http://localhost:${PORT}/publish/1
  
  API 文档:
  - POST /api/audio/upload - 音频上传
  - GET  /api/audio/episodes - 获取音频列表
  - GET  /api/audio/episodes/:id - 获取音频详情
  - POST /api/edit/chapters - 添加章节
  - POST /api/edit/edits - 记录剪辑操作
  - POST /api/export - 导出音频
  - POST /api/publish - 发布音频
  - GET  /api/rss/:podcastId - RSS 订阅
============================================
            `);
        });
    } catch (err) {
        console.error('启动失败:', err);
        process.exit(1);
    }
}

startServer();
