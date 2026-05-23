import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'feed.db');
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  initializeDatabase(db);

  return db;
}

function initializeDatabase(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sources (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('rss', 'bilibili', 'github', 'blog')),
      config TEXT NOT NULL DEFAULT '{}',
      enabled INTEGER NOT NULL DEFAULT 1,
      last_fetched_at TEXT,
      item_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS feed_items (
      id TEXT PRIMARY KEY,
      source_id TEXT NOT NULL,
      source_type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      summary TEXT NOT NULL DEFAULT '',
      url TEXT NOT NULL,
      author TEXT NOT NULL DEFAULT '',
      author_url TEXT,
      cover_image TEXT,
      published_at TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '[]',
      raw_data TEXT NOT NULL DEFAULT '{}',
      read_later INTEGER NOT NULL DEFAULT 0,
      read_at TEXT,
      fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_feed_items_source_id ON feed_items(source_id);
    CREATE INDEX IF NOT EXISTS idx_feed_items_published_at ON feed_items(published_at DESC);
    CREATE INDEX IF NOT EXISTS idx_feed_items_read_later ON feed_items(read_later);
    CREATE INDEX IF NOT EXISTS idx_feed_items_source_type ON feed_items(source_type);
    CREATE INDEX IF NOT EXISTS idx_sources_type ON sources(type);
  `);

  const count = db.prepare('SELECT COUNT(*) as count FROM sources').get() as { count: number };
  if (count.count === 0) {
    const insertStmt = db.prepare(`
      INSERT INTO sources (id, name, type, config, enabled)
      VALUES (?, ?, ?, ?, 0)
    `);
    insertStmt.run('demo-rss', 'Hacker News', 'rss', JSON.stringify({ feedUrl: 'https://hnrss.org/frontpage' }));
    insertStmt.run('demo-github', 'GitHub Trending', 'github', JSON.stringify({ githubUsername: 'trending' }));
  }
}

export default getDb;
