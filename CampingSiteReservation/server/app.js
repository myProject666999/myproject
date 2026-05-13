const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '露营地营位预订平台API服务已启动',
    database: process.env.DB_NAME || 'camping'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`数据库连接: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
});
