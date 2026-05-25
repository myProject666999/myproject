const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const routes = require('./routes');

require('dotenv').config();
require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({
  crossOriginResourcePolicy: false
}));

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const uploadDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

const convertedDir = path.join(__dirname, process.env.CONVERT_DIR || 'converted');
if (!fs.existsSync(convertedDir)) {
  fs.mkdirSync(convertedDir, { recursive: true });
}
app.use('/uploads/converted', express.static(convertedDir));

app.use('/api', routes);

app.use((err, req, res, next) => {
  console.error('错误:', err);
  if (err.name === 'MulterError') {
    return res.status(400).json({ code: 400, message: '文件上传错误: ' + err.message });
  }
  res.status(err.status || 500).json({
    code: err.status || 500,
    message: err.message || '服务器内部错误'
  });
});

app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`  在线PPT分享系统 - 后端服务已启动`);
  console.log(`  服务地址: http://localhost:${PORT}`);
  console.log(`  API地址:  http://localhost:${PORT}/api`);
  console.log(`========================================\n`);
});

module.exports = app;
