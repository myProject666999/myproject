const Redis = require('ioredis');

let redis = null;
let memoryCache = new Map();

function initRedis(url) {
  try {
    redis = new Redis(url || process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      connectTimeout: 2000,
      lazyConnect: true,
      retryStrategy(times) {
        if (times > 3) {
          console.warn('[Redis] Redis unavailable, using memory cache fallback');
          return null;
        }
        return Math.min(times * 200, 2000);
      }
    });

    redis.on('connect', () => {
      console.log('[Redis] Connected successfully');
      memoryCache.clear();
    });

    redis.on('error', (err) => {
      if (err.code !== 'ECONNREFUSED') {
        console.warn('[Redis] Connection error:', err.message);
      }
    });

    redis.on('close', () => {
      console.log('[Redis] Connection closed, using memory cache');
    });

    redis.connect().catch(() => {
      console.warn('[Redis] Initial connection failed, using memory cache fallback');
      redis = null;
    });
  } catch (err) {
    console.warn('[Redis] Initialization failed, using memory cache fallback');
    redis = null;
  }

  return redis;
}

function isRedisAvailable() {
  return redis && redis.status === 'ready';
}

function getRedis() {
  return redis;
}

async function cacheGet(key) {
  if (isRedisAvailable()) {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.warn('[Redis] GET error, falling back to memory cache');
    }
  }

  const cached = memoryCache.get(key);
  if (cached) {
    if (cached.expiry && cached.expiry < Date.now()) {
      memoryCache.delete(key);
      return null;
    }
    return cached.value;
  }
  return null;
}

async function cacheSet(key, value, ttl = 1800) {
  const expiresAt = Date.now() + ttl * 1000;

  if (isRedisAvailable()) {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (err) {
      console.warn('[Redis] SET error, falling back to memory cache');
    }
  }

  memoryCache.set(key, { value, expiry: expiresAt });
  
  if (memoryCache.size > 1000) {
    const now = Date.now();
    for (const [k, v] of memoryCache) {
      if (v.expiry && v.expiry < now) {
        memoryCache.delete(k);
      }
    }
  }
  
  return true;
}

async function cacheDel(key) {
  if (isRedisAvailable()) {
    try {
      await redis.del(key);
    } catch (err) {
      console.warn('[Redis] DEL error');
    }
  }

  memoryCache.delete(key);
  return true;
}

module.exports = { initRedis, getRedis, cacheGet, cacheSet, cacheDel, isRedisAvailable };
