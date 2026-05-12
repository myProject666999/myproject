require('dotenv').config();

process.env.DB_STORAGE = ':memory:';

const express = require('express');
const cors = require('cors');
const sequelize = require('../src/config/database');
const authRoutes = require('../src/routes/authRoutes');
const packageRoutes = require('../src/routes/packageRoutes');
const workerRoutes = require('../src/routes/workerRoutes');
const bookingRoutes = require('../src/routes/bookingRoutes');
const salaryRoutes = require('../src/routes/salaryRoutes');
const couponRoutes = require('../src/routes/couponRoutes');
const { errorHandler, notFound } = require('../src/middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/coupons', couponRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = {
  app,
  sequelize,
  async setupTestDB() {
    require('../src/models/associations');
    await sequelize.sync({ force: true });
  },
  async teardownTestDB() {
    await sequelize.close();
  },
};
