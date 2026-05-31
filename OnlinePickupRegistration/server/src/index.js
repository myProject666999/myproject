const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const router = require('./routes');
const errorHandler = require('./middleware/error');
const { getJielongById } = require('./db/jielong');
const { getParticipants } = require('./db/participant');
const eventBus = require('./eventBus');

const app = new Koa();

app.use(errorHandler);
app.use(cors());
app.use(bodyParser());

app.use(async (ctx, next) => {
  const match = ctx.path.match(/^\/api\/jielong\/(\d+)\/stream$/);
  if (!match) return next();

  const jielongId = match[1];
  ctx.respond = false;

  ctx.res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  const jielong = getJielongById(jielongId);
  const participants = getParticipants(jielongId);
  ctx.res.write(
    `data: ${JSON.stringify({ type: 'init', data: participants, jielong })}\n\n`
  );

  const onParticipantsChanged = (changedId) => {
    if (String(changedId) !== String(jielongId)) return;
    const updated = getParticipants(jielongId);
    const updatedJielong = getJielongById(jielongId);
    ctx.res.write(
      `data: ${JSON.stringify({ type: 'update', data: updated, jielong: updatedJielong })}\n\n`
    );
  };

  eventBus.on('participants-changed', onParticipantsChanged);

  const heartbeat = setInterval(() => {
    ctx.res.write(`: heartbeat\n\n`);
  }, 30000);

  ctx.req.on('close', () => {
    clearInterval(heartbeat);
    eventBus.removeListener('participants-changed', onParticipantsChanged);
  });

  ctx.req.on('aborted', () => {
    clearInterval(heartbeat);
    eventBus.removeListener('participants-changed', onParticipantsChanged);
  });
});

app.use(router.routes());
app.use(router.allowedMethods());

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
