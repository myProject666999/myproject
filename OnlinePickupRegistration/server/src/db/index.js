const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'data.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS jielong (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    fields TEXT NOT NULL,
    creator TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deadline DATETIME
  );

  CREATE TABLE IF NOT EXISTS participant (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    jielong_id INTEGER NOT NULL,
    seq_no INTEGER NOT NULL,
    data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (jielong_id) REFERENCES jielong(id) ON DELETE CASCADE,
    UNIQUE(jielong_id, seq_no)
  );

  CREATE INDEX IF NOT EXISTS idx_participant_jielong ON participant(jielong_id);
`);

module.exports = db;
