const Router = require('@koa/router');
const {
  createJielong,
  getJielongById,
  getJielongList,
  updateJielongStatus,
  deleteJielong,
} = require('../db/jielong');
const {
  addParticipant,
  getParticipants,
  deleteParticipant,
} = require('../db/participant');

const router = new Router({ prefix: '/api' });

router.get('/jielong', async (ctx) => {
  const { creator, status } = ctx.query;
  const list = getJielongList({ creator, status });
  ctx.body = { code: 0, data: list };
});

router.get('/jielong/:id', async (ctx) => {
  const jielong = getJielongById(ctx.params.id);
  if (!jielong) {
    ctx.status = 404;
    ctx.body = { code: 1, message: '接龙不存在' };
    return;
  }
  ctx.body = { code: 0, data: jielong };
});

router.post('/jielong', async (ctx) => {
  const { title, description, fields, creator, deadline } = ctx.request.body;
  if (!title || !fields || !Array.isArray(fields) || fields.length === 0) {
    ctx.status = 400;
    ctx.body = { code: 1, message: '标题和字段不能为空' };
    return;
  }
  const jielong = createJielong({
    title,
    description,
    fields,
    creator: creator || '匿名',
    deadline,
  });
  ctx.body = { code: 0, data: jielong };
});

router.put('/jielong/:id/close', async (ctx) => {
  updateJielongStatus(ctx.params.id, 'closed');
  ctx.body = { code: 0, message: '接龙已截止' };
});

router.delete('/jielong/:id', async (ctx) => {
  deleteJielong(ctx.params.id);
  ctx.body = { code: 0, message: '删除成功' };
});

router.get('/jielong/:id/participants', async (ctx) => {
  const participants = getParticipants(ctx.params.id);
  ctx.body = { code: 0, data: participants };
});

router.post('/jielong/:id/participants', async (ctx) => {
  const data = ctx.request.body;
  try {
    const participant = addParticipant(ctx.params.id, data);
    ctx.body = { code: 0, data: participant };
  } catch (err) {
    ctx.status = 400;
    ctx.body = { code: 1, message: err.message };
  }
});

router.delete('/participant/:id', async (ctx) => {
  deleteParticipant(ctx.params.id);
  ctx.body = { code: 0, message: '删除成功' };
});

router.get('/jielong/:id/export', async (ctx) => {
  const jielong = getJielongById(ctx.params.id);
  if (!jielong) {
    ctx.status = 404;
    ctx.body = { code: 1, message: '接龙不存在' };
    return;
  }
  const participants = getParticipants(ctx.params.id);
  const fields = jielong.fields;
  const header = ['序号', ...fields.map((f) => f.label)];
  const rows = participants.map((p) => [
    p.seq_no,
    ...fields.map((f) => p.data[f.key] || ''),
  ]);
  const csvContent = [header, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    )
    .join('\n');
  ctx.set('Content-Type', 'text/csv; charset=utf-8-sig');
  ctx.set(
    'Content-Disposition',
    `attachment; filename="${encodeURIComponent(jielong.title)}.csv"`
  );
  ctx.body = '\uFEFF' + csvContent;
});

module.exports = router;
