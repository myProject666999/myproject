const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const serve = require('koa-static');
const cors = require('@koa/cors');
const path = require('path');
const config = require('../config/default');
const db = require('./db');
const routes = require('./routes');
const scheduler = require('./services/scheduler');

async function bootstrap() {
  db.init();
  const app = new Koa();
  app.use(cors({ origin: '*' }));
  app.use(bodyParser({ jsonLimit: '20mb', textLimit: '20mb' }));
  app.use(serve(path.resolve(__dirname, '../../client/dist')));
  app.use(routes.routes());
  app.use(routes.allowedMethods());
  app.listen(config.port, () => {
    console.log(`[server] listening on http://127.0.0.1:${config.port}`);
  });
  scheduler.start();
}

bootstrap().catch(console.error);
