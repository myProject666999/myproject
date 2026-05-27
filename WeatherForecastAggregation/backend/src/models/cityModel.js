const { getDB } = require('../config/database');

const cityModel = {
  searchCities(query) {
    const db = getDB();
    const likeQuery = `%${query}%`;
    return db.prepare(`
      SELECT id, name, country, lat, lon, state
      FROM cities
      WHERE name LIKE ? OR country LIKE ? OR state LIKE ?
      ORDER BY name ASC
      LIMIT 20
    `).all(likeQuery, likeQuery, likeQuery);
  },

  getAllCities() {
    const db = getDB();
    return db.prepare(`
      SELECT id, name, country, lat, lon, state
      FROM cities
      ORDER BY name ASC
    `).all();
  },

  getCityById(id) {
    const db = getDB();
    return db.prepare(`
      SELECT id, name, country, lat, lon, state
      FROM cities
      WHERE id = ?
    `).get(id);
  },

  getFavorites() {
    const db = getDB();
    return db.prepare(`
      SELECT c.id, c.name, c.country, c.lat, c.lon, c.state, f.created_at
      FROM favorites f
      JOIN cities c ON f.city_id = c.id
      ORDER BY f.created_at DESC
    `).all();
  },

  isFavorite(cityId) {
    const db = getDB();
    const result = db.prepare('SELECT id FROM favorites WHERE city_id = ?').get(cityId);
    return !!result;
  },

  addFavorite(cityId) {
    const db = getDB();
    const existing = db.prepare('SELECT id FROM favorites WHERE city_id = ?').get(cityId);
    if (existing) return { id: existing.id, city_id: cityId, created_at: existing.created_at };

    const result = db.prepare('INSERT INTO favorites (city_id) VALUES (?)').run(cityId);
    return db.prepare('SELECT * FROM favorites WHERE id = ?').get(result.lastInsertRowid);
  },

  removeFavorite(cityId) {
    const db = getDB();
    return db.prepare('DELETE FROM favorites WHERE city_id = ?').run(cityId);
  },

  getSettings() {
    const db = getDB();
    const rows = db.prepare('SELECT key, value FROM settings').all();
    const settings = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return settings;
  },

  updateSetting(key, value) {
    const db = getDB();
    db.prepare(`
      INSERT INTO settings (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).run(key, value);
    return { key, value };
  }
};

module.exports = cityModel;
