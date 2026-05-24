CREATE TABLE IF NOT EXISTS folders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  parent_id INTEGER,
  sort INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  folder_id INTEGER,
  status INTEGER NOT NULL DEFAULT 1,
  last_check_at TEXT,
  last_status_code INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_folder ON bookmarks(folder_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_status ON bookmarks(status);

CREATE TABLE IF NOT EXISTS bookmark_tags (
  bookmark_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (bookmark_id, tag_id),
  FOREIGN KEY (bookmark_id) REFERENCES bookmarks(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO folders (id, name, parent_id, sort) VALUES (1, '未分类', NULL, 0);
