const config = require('../../config/default');
const { fetchMeta, checkUrl } = require('./fetcher');
const db = require('../db');

async function runAll() {
  try {
    const sql = 'SELECT id, url FROM bookmarks';
    const rows = await db.execute(sql);
    for (const row of rows) {
      try {
        const r = await checkUrl(row.url);
        const status = r.ok ? 1 : (r.statusCode && r.statusCode >= 400 ? 3 : 2);
        await db.execute(
          'UPDATE bookmarks SET status = ?, last_check_at = NOW(), last_status_code = ? WHERE id = ?',
          [status, r.statusCode || 0, row.id]
        );
      } catch (_) {
        await db.execute(
          'UPDATE bookmarks SET status = 3, last_check_at = NOW() WHERE id = ?',
          [row.id]
        );
      }
    }
  } catch (err) {
    console.error('[scheduler] check failed', err.message);
  }
}

function start() {
  const cron = require('node-cron');
  cron.schedule(config.scheduler.checkInterval, () => {
    runAll().catch(console.error);
  });
  console.log('[scheduler] started');
}

module.exports = { start, runAll };
