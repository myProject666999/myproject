require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const sequelize = require('./config/database');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const packageRoutes = require('./routes/packages');
const costumeRoutes = require('./routes/costumes');
const customerRoutes = require('./routes/customers');
const appointmentRoutes = require('./routes/appointments');
const scheduleRoutes = require('./routes/schedules');
const photoRoutes = require('./routes/photos');
const workOrderRoutes = require('./routes/workOrders');
const deliveryRoutes = require('./routes/deliveries');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/costumes', costumeRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/work-orders', workOrderRoutes);
app.use('/api/deliveries', deliveryRoutes);

app.use('/', (req, res) => {
  res.json({ message: '摄影工作室约拍排期管理系统 API' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '服务器内部错误' });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');

    await sequelize.sync({ alter: true });
    console.log('数据库同步完成');

    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('启动失败:', error);
  }
};

startServer();
