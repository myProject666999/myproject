require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const packageRoutes = require('./routes/packageRoutes');
const workerRoutes = require('./routes/workerRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const salaryRoutes = require('./routes/salaryRoutes');
const couponRoutes = require('./routes/couponRoutes');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

app.get('/api/health', (req, res) => {
  res.json({ code: 0, message: 'ok', data: { timestamp: Date.now() } });
});

app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/coupons', couponRoutes);

app.use(notFound);
app.use(errorHandler);

async function startServer() {
  try {
    require('./models/associations');
    await sequelize.authenticate();
    console.log('[DB] Database connected successfully.');

    await sequelize.sync({ alter: true });
    console.log('[DB] Models synchronized.');

    app.listen(PORT, () => {
      console.log(`[Server] Running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[Startup Error]', err);
    process.exit(1);
  }
}

startServer();

module.exports = app;
