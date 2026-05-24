const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '123456',
    multipleStatements: true
  });
  const schema = fs.readFileSync(path.resolve(__dirname, '../db/schema.sql'), 'utf8');
  const statements = schema
    .split(/;\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  for (const sql of statements) {
    try {
      await conn.query(sql);
      console.log('[ok]', sql.split('\n')[0].slice(0, 80));
    } catch (err) {
      console.error('[fail]', sql.split('\n')[0].slice(0, 80), err.message);
    }
  }
  await conn.end();
  console.log('done');
}

main().catch((err) => { console.error(err); process.exit(1); });
