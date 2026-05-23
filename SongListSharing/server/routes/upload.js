const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authRequired } = require('../utils/auth');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'audio');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!/audio\//.test(file.mimetype)) return cb(new Error('仅支持音频文件'));
    cb(null, true);
  }
});

router.post('/audio', authRequired, upload.single('audio'), (req, res) => {
  if (!req.file) return res.status(400).json({ code: 400, message: '未收到文件' });
  const url = `/uploads/audio/${req.file.filename}`;
  res.json({ code: 0, message: '上传成功', data: { url, filename: req.file.filename } });
});

router.use((err, req, res, next) => {
  res.status(400).json({ code: 400, message: err.message || '上传失败' });
});

module.exports = router;
