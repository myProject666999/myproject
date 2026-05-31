require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/database');
const redis = require('./config/redis');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const routes = require('./routes');
const mockRoutes = require('./routes/mock');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(express.static(path.join(__dirname, '../public')));

app.use('/mock', mockRoutes);
app.use('/api', routes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use(notFound);
app.use(errorHandler);

async function startServer() {
  try {
    await db.testConnection();
    await redis.connect();

    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   API Mock与契约测试平台已启动                              ║
║                                                            ║
║   管理界面: http://localhost:${PORT}                        ║
║   API地址:  http://localhost:${PORT}/api                    ║
║   Mock地址: http://localhost:${PORT}/mock                   ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
}

startServer();
