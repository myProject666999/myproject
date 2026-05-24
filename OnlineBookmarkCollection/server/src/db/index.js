const mysql = require('mysql2/promise');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const config = require('../../config/default');

let pool;
let sqliteDb;

function initMysql() {
  pool = mysql.createPool(config.db.mysql);
  return pool;
}

function initSqlite() {
  const dbPath = path.resolve(config.db.sqlite.file);
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  sqliteDb = new Database(dbPath);
  sqliteDb.pragma('journal_mode = WAL');
  sqliteDb.pragma('foreign_keys = ON');
  return sqliteDb;
}

function init() {
  if (config.db.type === 'sqlite') return initSqlite();
  return initMysql();
}

async function execute(sql, params = []) {
  if (config.db.type === 'sqlite') {
    const stmt = sqliteDb.prepare(sql);
    const upper = sql.trimStart().split(/\s+/)[0].toUpperCase();
    if (upper === 'SELECT' || upper === 'PRAGMA' || upper === 'WITH' || upper === 'EXPLAIN') {
      return stmt.all(...params);
    }
    const info = stmt.run(...params);
    return { insertId: info.lastInsertRowid, changedRows: info.changes };
  }
  const [rows] = await pool.execute(sql, params);
  return rows;
}

module.exports = { init, execute, get pool() { return pool; }, get sqliteDb() { return sqliteDb; } };
