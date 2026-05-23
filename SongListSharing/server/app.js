const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const playlistRoutes = require('./routes/playlists');
const songRoutes = require('./routes/songs');
const reviewRoutes = require('./routes/reviews');
const followRoutes = require('./routes/follows');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/health', (req, res) => {
  res.json({ code: 0, message: 'ok', data: { time: new Date().toISOString() } });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).json({ code: 500, message: err.message || '服务器错误' });
});

app.listen(PORT, () => {
  console.log(`SongList Sharing server running at http://127.0.0.1:${PORT}`);
});
