const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const { sequelize } = require('./config/database');
const { setupAssociations } = require('./models/associations');

setupAssociations();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const authRoutes = require('./routes/auth');
const coachRoutes = require('./routes/coaches');
const courseRoutes = require('./routes/courses');
const bookingRoutes = require('./routes/bookings');
const checkinRoutes = require('./routes/checkins');
const trainingRoutes = require('./routes/trainings');
const bodyTestRoutes = require('./routes/bodyTests');
const communityRoutes = require('./routes/community');

app.use('/api/auth', authRoutes);
app.use('/api/coaches', coachRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/trainings', trainingRoutes);
app.use('/api/body-tests', bodyTestRoutes);
app.use('/api/community', communityRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

startServer();
