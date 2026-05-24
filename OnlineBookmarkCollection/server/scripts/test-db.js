const db = require('./src/db');

async function main() {
  db.init();
  const sqls = [
    'SELECT COUNT(*) AS c FROM bookmarks',
    'SELECT COUNT(*) AS c FROM bookmarks WHERE status=1',
    'SELECT COUNT(*) AS c FROM folders',
    'SELECT COUNT(*) AS c FROM tags'
  ];
  for (const sql of sqls) {
    try {
      const r = await db.execute(sql);
      console.log('OK', sql, '=>', JSON.stringify(r));
    } catch (e) {
      console.error('ERR', sql, '=>', e.message);
    }
  }
  process.exit(0);
}

main();
