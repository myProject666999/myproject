const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

const assetRoutes = require('./routes/assets');
const categoryRoutes = require('./routes/categories');
const userRoutes = require('./routes/users');
const departmentRoutes = require('./routes/departments');
const borrowRoutes = require('./routes/borrows');
const maintenanceRoutes = require('./routes/maintenance');
const scrapRoutes = require('./routes/scraps');
const inventoryRoutes = require('./routes/inventory');
const transferRoutes = require('./routes/transfers');
const qrcodeRoutes = require('./routes/qrcode');
const statsRoutes = require('./routes/stats');

app.use('/api/assets', assetRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/borrows', borrowRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/scraps', scrapRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/qrcode', qrcodeRoutes);
app.use('/api/stats', statsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '设备资产管理系统API运行正常' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ code: 500, message: err.message || '服务器内部错误' });
});

const server = app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

server.on('error', (err) => {
  console.error('服务器启动失败:', err);
});
