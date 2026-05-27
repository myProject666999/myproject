const Database = require('better-sqlite3');
const path = require('path');

let db;

function initDB() {
  const dbPath = path.join(__dirname, '..', 'weather.db');
  db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS cities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      country TEXT NOT NULL,
      lat REAL NOT NULL,
      lon REAL NOT NULL,
      state TEXT,
      UNIQUE(name, country, state)
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
      UNIQUE(city_id)
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      severity TEXT NOT NULL,
      expiry DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT
    );
  `);

  seedCities();

  return db;
}

function seedCities() {
  const count = db.prepare('SELECT COUNT(*) as count FROM cities').get().count;
  if (count > 0) return;

  const cities = [
    { name: '北京', country: 'CN', lat: 39.9042, lon: 116.4074, state: 'Beijing' },
    { name: '上海', country: 'CN', lat: 31.2304, lon: 121.4737, state: 'Shanghai' },
    { name: '广州', country: 'CN', lat: 23.1291, lon: 113.2644, state: 'Guangdong' },
    { name: '深圳', country: 'CN', lat: 22.5431, lon: 114.0579, state: 'Guangdong' },
    { name: '成都', country: 'CN', lat: 30.5728, lon: 104.0668, state: 'Sichuan' },
    { name: '杭州', country: 'CN', lat: 30.2741, lon: 120.1551, state: 'Zhejiang' },
    { name: '武汉', country: 'CN', lat: 30.5928, lon: 114.3055, state: 'Hubei' },
    { name: '西安', country: 'CN', lat: 34.3416, lon: 108.9398, state: 'Shaanxi' },
    { name: '南京', country: 'CN', lat: 32.0603, lon: 118.7969, state: 'Jiangsu' },
    { name: '重庆', country: 'CN', lat: 29.4316, lon: 106.9123, state: 'Chongqing' },
    { name: 'Tokyo', country: 'JP', lat: 35.6762, lon: 139.6503, state: null },
    { name: 'New York', country: 'US', lat: 40.7128, lon: -74.0060, state: 'NY' },
    { name: 'London', country: 'GB', lat: 51.5074, lon: -0.1278, state: null },
    { name: 'Paris', country: 'FR', lat: 48.8566, lon: 2.3522, state: null },
    { name: 'Sydney', country: 'AU', lat: -33.8688, lon: 151.2093, state: 'NSW' }
  ];

  const insert = db.prepare(
    'INSERT OR IGNORE INTO cities (name, country, lat, lon, state) VALUES (?, ?, ?, ?, ?)'
  );

  const transaction = db.transaction((cities) => {
    for (const city of cities) {
      insert.run(city.name, city.country, city.lat, city.lon, city.state);
    }
  });

  transaction(cities);
}

function getDB() {
  if (!db) throw new Error('Database not initialized. Call initDB() first.');
  return db;
}

module.exports = { initDB, getDB };
