require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');

const { initDB, getDB } = require('./config/database');
const { initRedis, cacheDel } = require('./config/redis');
const weatherService = require('./services/weatherService');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use((err, req, res, next) => {
  console.error('[Server] Unhandled error:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

async function refreshFavoritesWeather() {
  try {
    const db = getDB();
    const favorites = db.prepare(`
      SELECT c.id, c.name, c.country, c.lat, c.lon
      FROM favorites f
      JOIN cities c ON f.city_id = c.id
    `).all();

    if (favorites.length === 0) {
      console.log('[Cron] No favorites to refresh');
      return;
    }

    console.log(`[Cron] Refreshing weather for ${favorites.length} favorite cities`);

    for (const city of favorites) {
      const current = await weatherService.generateCurrentWeather(city);
      const forecast = await weatherService.generateForecast(city, 7);
      const indices = await weatherService.generateIndices(city, current.current.temp);
      const alerts = await weatherService.generateAlerts(city);

      await weatherService.setCachedWeather(city.id, 'current', current);
      await weatherService.setCachedWeather(city.id, 'forecast:7', forecast);
      await weatherService.setCachedWeather(city.id, 'indices', indices);
      await weatherService.setCachedWeather(city.id, 'alerts', alerts);

      console.log(`[Cron] Weather refreshed for ${city.name}`);
    }

    console.log('[Cron] Weather refresh completed');
  } catch (err) {
    console.error('[Cron] Weather refresh failed:', err.message);
  }
}

function initScheduledTasks() {
  cron.schedule('0 */30 * * * *', () => {
    console.log('[Cron] Running scheduled weather refresh');
    refreshFavoritesWeather();
  });

  console.log('[Cron] Scheduled weather refresh initialized (every 30 minutes)');
}

async function start() {
  try {
    console.log('[Server] Initializing database...');
    initDB();
    console.log('[Server] Database initialized successfully');

    console.log('[Server] Connecting to Redis...');
    initRedis();

    initScheduledTasks();

    app.listen(PORT, () => {
      console.log(`[Server] Weather Forecast Aggregation backend is running on port ${PORT}`);
      console.log(`[Server] API Base: http://localhost:${PORT}/api`);
      console.log(`[Server] Health Check: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
  }
}

process.on('exit', (code) => {
  console.log(`[Server] Process exiting with code: ${code}`);
});

process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[Server] SIGINT received');
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  console.error('[Server] Uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server] Unhandled rejection:', reason);
});

start();
