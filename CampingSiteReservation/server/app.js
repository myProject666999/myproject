const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const usersRoute = require('./routes/users');
const campsitesRoute = require('./routes/campsites');
const equipmentsRoute = require('./routes/equipments');
const activitiesRoute = require('./routes/activities');
const reservationsRoute = require('./routes/reservations');
const reviewsRoute = require('./routes/reviews');

const { errorHandler, notFoundHandler } = require('./middleware/error');

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

app.use('/api/users', usersRoute);
app.use('/api/campsites', campsitesRoute);
app.use('/api/equipments', equipmentsRoute);
app.use('/api/activities', activitiesRoute);
app.use('/api/reservations', reservationsRoute);
app.use('/api/reviews', reviewsRoute);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`数据库连接: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
  console.log(`API端点:`);
  console.log(`  POST /api/users/register  - 用户注册`);
  console.log(`  POST /api/users/login     - 用户登录`);
  console.log(`  GET  /api/users/me        - 获取用户信息`);
  console.log(`  GET  /api/campsites       - 获取营位列表`);
  console.log(`  GET  /api/equipments      - 获取装备列表`);
  console.log(`  GET  /api/activities      - 获取活动列表`);
  console.log(`  GET  /api/reservations    - 获取预订列表（需登录）`);
  console.log(`  POST /api/reservations    - 创建预订（需登录）`);
  console.log(`  GET  /api/reviews         - 获取评价列表`);
});
