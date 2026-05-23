const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const sequelize = require('./config/database');
const { authMiddleware, requireAuth } = require('./middleware/auth');

const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const menuRoutes = require('./routes/menuRoutes');

const app = new Koa();
const router = new Router();

app.use(cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(bodyParser({
  jsonLimit: '10mb',
  formLimit: '10mb'
}));

app.use(authMiddleware);

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    console.error('Error:', error);
    ctx.status = error.status || 500;
    ctx.body = {
      message: error.message || '服务器内部错误'
    };
  }
});

router.get('/', async (ctx) => {
  ctx.body = {
    message: '食谱分享与菜单规划 API',
    version: '1.0.0'
  };
});

router.use('/api/auth', authRoutes.routes(), authRoutes.allowedMethods());
router.use('/api/recipes', recipeRoutes.routes(), recipeRoutes.allowedMethods());
router.use('/api/menu', requireAuth, menuRoutes.routes(), menuRoutes.allowedMethods());

app.use(router.routes());
app.use(router.allowedMethods());

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');

    await sequelize.sync({ alter: false });
    console.log('数据库表同步完成');

    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();
