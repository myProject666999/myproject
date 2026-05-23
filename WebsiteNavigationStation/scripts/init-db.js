const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'navigation.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    icon TEXT DEFAULT '📁',
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS websites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    category_id INTEGER NOT NULL,
    is_private INTEGER DEFAULT 0,
    is_featured INTEGER DEFAULT 0,
    favicon_url TEXT,
    view_count INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS website_tags (
    website_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (website_id, tag_id),
    FOREIGN KEY (website_id) REFERENCES websites (id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_websites_category ON websites (category_id);
  CREATE INDEX IF NOT EXISTS idx_websites_private ON websites (is_private);
  CREATE INDEX IF NOT EXISTS idx_websites_featured ON websites (is_featured);
  CREATE INDEX IF NOT EXISTS idx_websites_views ON websites (view_count DESC);
`);

const existingCategories = db.prepare('SELECT COUNT(*) as count FROM categories').get();
if (existingCategories.count === 0) {
  const insertCategory = db.prepare('INSERT INTO categories (name, icon, sort_order) VALUES (?, ?, ?)');
  const categories = [
    ['常用工具', '🛠️', 1],
    ['开发相关', '💻', 2],
    ['设计资源', '🎨', 3],
    ['娱乐休闲', '🎮', 4],
    ['学习教育', '📚', 5],
    ['生活服务', '🏠', 6],
  ];
  categories.forEach(([name, icon, sort]) => insertCategory.run(name, icon, sort));
}

const existingWebsites = db.prepare('SELECT COUNT(*) as count FROM websites').get();
if (existingWebsites.count === 0) {
  const insertWebsite = db.prepare(`
    INSERT INTO websites (name, url, description, category_id, is_featured, favicon_url, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const websites = [
    ['Google', 'https://www.google.com', '全球最大的搜索引擎', 1, 1, 'https://www.google.com/favicon.ico', 1],
    ['GitHub', 'https://github.com', '全球最大的代码托管平台', 2, 1, 'https://github.com/favicon.ico', 1],
    ['Stack Overflow', 'https://stackoverflow.com', '程序员问答社区', 2, 0, 'https://stackoverflow.com/favicon.ico', 2],
    ['MDN Web Docs', 'https://developer.mozilla.org', 'Web 开发权威文档', 2, 0, 'https://developer.mozilla.org/favicon.ico', 3],
    ['Figma', 'https://www.figma.com', '在线设计协作工具', 3, 1, 'https://www.figma.com/favicon.ico', 1],
    ['Dribbble', 'https://dribbble.com', '设计师灵感社区', 3, 0, 'https://dribbble.com/favicon.ico', 2],
    ['YouTube', 'https://www.youtube.com', '全球最大的视频分享平台', 4, 1, 'https://www.youtube.com/favicon.ico', 1],
    ['Bilibili', 'https://www.bilibili.com', '哔哩哔哩弹幕视频网', 4, 0, 'https://www.bilibili.com/favicon.ico', 2],
    ['MDN 学习区', 'https://developer.mozilla.org/zh-CN/docs/Learn', 'Web 学习教程', 5, 0, 'https://developer.mozilla.org/favicon.ico', 1],
    ['菜鸟教程', 'https://www.runoob.com', '编程入门教程', 5, 0, 'https://www.runoob.com/favicon.ico', 2],
    ['淘宝', 'https://www.taobao.com', '中国最大的网购零售平台', 6, 1, 'https://www.taobao.com/favicon.ico', 1],
    ['京东', 'https://www.jd.com', '综合网上购物商城', 6, 0, 'https://www.jd.com/favicon.ico', 2],
  ];
  websites.forEach(([name, url, desc, catId, featured, favicon, sort]) =>
    insertWebsite.run(name, url, desc, catId, featured, favicon, sort)
  );
}

console.log('数据库初始化完成！');
console.log(`数据库位置: ${dbPath}`);

db.close();
