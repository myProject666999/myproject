const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  fs.mkdirSync(path.join(uploadPath, 'covers'), { recursive: true });
  fs.mkdirSync(path.join(uploadPath, 'chapters'), { recursive: true });
  fs.mkdirSync(path.join(uploadPath, 'avatars'), { recursive: true });
}

app.use('/uploads', express.static(uploadPath));

app.use('/api/users', require('./routes/users'));
app.use('/api/comics', require('./routes/comics'));
app.use('/api/chapters', require('./routes/chapters'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/favorites', require('./routes/favorites'));

app.get('/api', (req, res) => {
  res.json({ message: '漫画连载平台 API 服务已启动', version: '1.0.0' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误', message: err.message });
});

app.listen(PORT, () => {
  console.log(`漫画连载平台服务已启动: http://localhost:${PORT}`);
});
