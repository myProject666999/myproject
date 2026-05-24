const Router = require('koa-router');
const db = require('../db');
const { fetchMeta, checkUrl } = require('../services/fetcher');
const { parseBookmarks, exportNetscape } = require('../services/importer');

const router = new Router({ prefix: '/api' });

function ok(ctx, data = null, msg = 'ok') {
  ctx.body = { code: 0, msg, data };
}

function fail(ctx, msg = 'error', code = 1, status = 400) {
  ctx.status = status;
  ctx.body = { code, msg, data: null };
}

router.get('/folders', async (ctx) => {
  const rows = await db.execute('SELECT * FROM folders ORDER BY sort ASC, id ASC');
  ok(ctx, rows);
});

router.post('/folders', async (ctx) => {
  const { name, parent_id, sort } = ctx.request.body || {};
  if (!name) return fail(ctx, 'name required');
  const res = await db.execute(
    'INSERT INTO folders (name, parent_id, sort) VALUES (?, ?, ?)',
    [name, parent_id || null, sort || 0]
  );
  const id = res.insertId;
  const [row] = await db.execute('SELECT * FROM folders WHERE id = ?', [id]);
  ok(ctx, row);
});

router.put('/folders/:id', async (ctx) => {
  const id = ctx.params.id;
  const { name, parent_id, sort } = ctx.request.body || {};
  const fields = [];
  const vals = [];
  if (name !== undefined) { fields.push('name=?'); vals.push(name); }
  if (parent_id !== undefined) { fields.push('parent_id=?'); vals.push(parent_id || null); }
  if (sort !== undefined) { fields.push('sort=?'); vals.push(sort); }
  if (!fields.length) return fail(ctx, 'no fields');
  vals.push(id);
  await db.execute(`UPDATE folders SET ${fields.join(',')} WHERE id = ?`, vals);
  const [row] = await db.execute('SELECT * FROM folders WHERE id = ?', [id]);
  ok(ctx, row);
});

router.del('/folders/:id', async (ctx) => {
  const id = ctx.params.id;
  await db.execute('UPDATE bookmarks SET folder_id = NULL WHERE folder_id = ?', [id]);
  await db.execute('DELETE FROM folders WHERE id = ?', [id]);
  ok(ctx);
});

router.get('/tags', async (ctx) => {
  const rows = await db.execute('SELECT * FROM tags ORDER BY id ASC');
  ok(ctx, rows);
});

router.post('/tags', async (ctx) => {
  const { name } = ctx.request.body || {};
  if (!name) return fail(ctx, 'name required');
  let rows = await db.execute('SELECT * FROM tags WHERE name = ?', [name]);
  if (rows.length) return ok(ctx, rows[0]);
  const res = await db.execute('INSERT INTO tags (name) VALUES (?)', [name]);
  const [row] = await db.execute('SELECT * FROM tags WHERE id = ?', [res.insertId]);
  ok(ctx, row);
});

router.del('/tags/:id', async (ctx) => {
  await db.execute('DELETE FROM tags WHERE id = ?', [ctx.params.id]);
  ok(ctx);
});

async function attachTags(bookmarks) {
  if (!bookmarks.length) return bookmarks;
  const ids = bookmarks.map((b) => b.id);
  const placeholders = ids.map(() => '?').join(',');
  const rows = await db.execute(
    `SELECT bt.bookmark_id, t.id AS tag_id, t.name AS tag_name
     FROM bookmark_tags bt JOIN tags t ON bt.tag_id = t.id
     WHERE bt.bookmark_id IN (${placeholders})`,
    ids
  );
  const map = new Map();
  rows.forEach((r) => {
    if (!map.has(r.bookmark_id)) map.set(r.bookmark_id, []);
    map.get(r.bookmark_id).push({ id: r.tag_id, name: r.tag_name });
  });
  bookmarks.forEach((b) => { b.tags = map.get(b.id) || []; });
  return bookmarks;
}

router.get('/bookmarks', async (ctx) => {
  const { folder_id, tag_id, keyword, status } = ctx.query;
  const where = [];
  const vals = [];
  if (folder_id) { where.push('b.folder_id = ?'); vals.push(folder_id); }
  if (status) { where.push('b.status = ?'); vals.push(status); }
  if (keyword) {
    where.push('(b.title LIKE ? OR b.url LIKE ? OR b.description LIKE ?)');
    const like = `%${keyword}%`;
    vals.push(like, like, like);
  }
  let sql = 'SELECT b.*, f.name AS folder_name FROM bookmarks b LEFT JOIN folders f ON f.id = b.folder_id';
  let joinSql = sql;
  if (tag_id) {
    joinSql = `${sql} JOIN bookmark_tags bt ON bt.bookmark_id = b.id`;
    where.push('bt.tag_id = ?');
    vals.push(tag_id);
  }
  if (where.length) joinSql += ` WHERE ${where.join(' AND ')}`;
  joinSql += ' ORDER BY b.id DESC LIMIT 500';
  const rows = await db.execute(joinSql, vals);
  await attachTags(rows);
  ok(ctx, rows);
});

router.get('/bookmarks/:id', async (ctx) => {
  const [row] = await db.execute('SELECT * FROM bookmarks WHERE id = ?', [ctx.params.id]);
  if (!row) return fail(ctx, 'not found', 1, 404);
  await attachTags([row]);
  ok(ctx, row);
});

router.post('/bookmarks', async (ctx) => {
  const body = ctx.request.body || {};
  const { url, title, icon, description, folder_id, tags, autoFetch = true } = body;
  if (!url) return fail(ctx, 'url required');
  let finalTitle = title || '';
  let finalIcon = icon || '';
  let finalDesc = description || '';
  if (autoFetch) {
    const meta = await fetchMeta(url);
    if (!finalTitle) finalTitle = meta.title || url;
    if (!finalIcon) finalIcon = meta.icon;
    if (!finalDesc) finalDesc = meta.description;
  }
  if (!finalTitle) finalTitle = url;
  const res = await db.execute(
    'INSERT INTO bookmarks (title, url, icon, description, folder_id) VALUES (?, ?, ?, ?, ?)',
    [finalTitle, url, finalIcon, finalDesc, folder_id || null]
  );
  const id = res.insertId;
  if (Array.isArray(tags) && tags.length) {
    for (const tName of tags) {
      if (!tName) continue;
      let rows = await db.execute('SELECT id FROM tags WHERE name = ?', [tName]);
      let tagId = rows[0]?.id;
      if (!tagId) {
        const r = await db.execute('INSERT INTO tags (name) VALUES (?)', [tName]);
        tagId = r.insertId;
      }
      try {
        await db.execute('INSERT INTO bookmark_tags (bookmark_id, tag_id) VALUES (?, ?)', [id, tagId]);
      } catch (_) {}
    }
  }
  const [row] = await db.execute('SELECT * FROM bookmarks WHERE id = ?', [id]);
  await attachTags([row]);
  ok(ctx, row);
});

router.put('/bookmarks/:id', async (ctx) => {
  const id = ctx.params.id;
  const body = ctx.request.body || {};
  const fields = [];
  const vals = [];
  ['title', 'url', 'icon', 'description', 'folder_id', 'status'].forEach((k) => {
    if (body[k] !== undefined) {
      fields.push(`${k}=?`);
      vals.push(body[k] === '' ? null : body[k]);
    }
  });
  if (fields.length) {
    vals.push(id);
    await db.execute(`UPDATE bookmarks SET ${fields.join(',')} WHERE id = ?`, vals);
  }
  if (Array.isArray(body.tags)) {
    await db.execute('DELETE FROM bookmark_tags WHERE bookmark_id = ?', [id]);
    for (const tName of body.tags) {
      if (!tName) continue;
      let rows = await db.execute('SELECT id FROM tags WHERE name = ?', [tName]);
      let tagId = rows[0]?.id;
      if (!tagId) {
        const r = await db.execute('INSERT INTO tags (name) VALUES (?)', [tName]);
        tagId = r.insertId;
      }
      try {
        await db.execute('INSERT INTO bookmark_tags (bookmark_id, tag_id) VALUES (?, ?)', [id, tagId]);
      } catch (_) {}
    }
  }
  const [row] = await db.execute('SELECT * FROM bookmarks WHERE id = ?', [id]);
  await attachTags([row]);
  ok(ctx, row);
});

router.del('/bookmarks/:id', async (ctx) => {
  await db.execute('DELETE FROM bookmarks WHERE id = ?', [ctx.params.id]);
  ok(ctx);
});

router.post('/bookmarks/batch-delete', async (ctx) => {
  const { ids } = ctx.request.body || {};
  if (!Array.isArray(ids) || !ids.length) return fail(ctx, 'ids required');
  const ph = ids.map(() => '?').join(',');
  await db.execute(`DELETE FROM bookmarks WHERE id IN (${ph})`, ids);
  ok(ctx);
});

router.post('/bookmarks/preview', async (ctx) => {
  const { url } = ctx.request.body || {};
  if (!url) return fail(ctx, 'url required');
  const meta = await fetchMeta(url);
  ok(ctx, meta);
});

router.post('/bookmarks/check/:id', async (ctx) => {
  const [row] = await db.execute('SELECT url FROM bookmarks WHERE id = ?', [ctx.params.id]);
  if (!row) return fail(ctx, 'not found', 1, 404);
  const r = await checkUrl(row.url);
  const status = r.ok ? 1 : (r.statusCode && r.statusCode >= 400 ? 3 : 2);
  await db.execute(
    'UPDATE bookmarks SET status = ?, last_check_at = NOW(), last_status_code = ? WHERE id = ?',
    [status, r.statusCode || 0, ctx.params.id]
  );
  ok(ctx, { status, statusCode: r.statusCode });
});

router.post('/import', async (ctx) => {
  const { content, folder_id } = ctx.request.body || {};
  if (!content) return fail(ctx, 'content required');
  const items = parseBookmarks(content);
  const results = [];
  for (const it of items) {
    const res = await db.execute(
      'INSERT INTO bookmarks (title, url, icon, folder_id) VALUES (?, ?, ?, ?)',
      [it.title.slice(0, 255), it.url, it.icon || null, folder_id || null]
    );
    results.push(res.insertId);
  }
  ok(ctx, { imported: results.length, ids: results });
});

router.get('/export', async (ctx) => {
  const rows = await db.execute('SELECT id, title, url, icon, created_at FROM bookmarks ORDER BY id DESC');
  ctx.type = 'text/html; charset=utf-8';
  ctx.set('Content-Disposition', 'attachment; filename="bookmarks.html"');
  ctx.body = exportNetscape(rows);
});

router.get('/stats', async (ctx) => {
  const total = (await db.execute('SELECT COUNT(*) AS c FROM bookmarks'))[0].c;
  const okCount = (await db.execute('SELECT COUNT(*) AS c FROM bookmarks WHERE status=1'))[0].c;
  const fail2 = (await db.execute('SELECT COUNT(*) AS c FROM bookmarks WHERE status=2'))[0].c;
  const fail3 = (await db.execute('SELECT COUNT(*) AS c FROM bookmarks WHERE status=3'))[0].c;
  const folderCount = (await db.execute('SELECT COUNT(*) AS c FROM folders'))[0].c;
  const tagCount = (await db.execute('SELECT COUNT(*) AS c FROM tags'))[0].c;
  ok(ctx, { total, ok: okCount, suspicious: fail2, dead: fail3, folders: folderCount, tags: tagCount });
});

module.exports = router;
