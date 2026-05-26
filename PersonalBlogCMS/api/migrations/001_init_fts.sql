-- 全文搜索索引 (SQLite FTS5)
CREATE VIRTUAL TABLE IF NOT EXISTS articles_fts USING fts5(
    title, content_md, summary, content='articles', content_rowid='id'
);

-- 触发器自动更新FTS索引
CREATE TRIGGER IF NOT EXISTS articles_ai AFTER INSERT ON articles BEGIN
    INSERT INTO articles_fts(rowid, title, content_md, summary)
    VALUES (new.id, new.title, new.content_md, new.summary);
END;

CREATE TRIGGER IF NOT EXISTS articles_ad AFTER DELETE ON articles BEGIN
    INSERT INTO articles_fts(articles_fts, rowid, title, content_md, summary)
    VALUES ('delete', old.id, old.title, old.content_md, old.summary);
END;

CREATE TRIGGER IF NOT EXISTS articles_au AFTER UPDATE ON articles BEGIN
    INSERT INTO articles_fts(articles_fts, rowid, title, content_md, summary)
    VALUES ('delete', old.id, old.title, old.content_md, old.summary);
    INSERT INTO articles_fts(rowid, title, content_md, summary)
    VALUES (new.id, new.title, new.content_md, new.summary);
END;
