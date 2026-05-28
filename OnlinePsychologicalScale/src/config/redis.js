const { createClient } = require("redis");
const config = require("../config");

let redisClient = null;
let redisAvailable = false;

async function getRedisClient() {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  try {
    redisClient = createClient({
      socket: {
        host: config.redis.host,
        port: config.redis.port,
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.warn("[Redis] 重连次数过多，暂时禁用Redis");
            redisAvailable = false;
            return new Error("Redis reconnect limit reached");
          }
          return Math.min(retries * 100, 3000);
        },
      },
      password: config.redis.password || undefined,
      database: config.redis.db,
    });

    redisClient.on("error", (err) => {
      console.warn("[Redis] 错误:", err.message);
      redisAvailable = false;
    });

    redisClient.on("connect", () => {
      console.log("[Redis] 连接成功");
      redisAvailable = true;
    });

    redisClient.on("ready", () => {
      redisAvailable = true;
    });

    await redisClient.connect();
    return redisClient;
  } catch (err) {
    console.warn("[Redis] 连接失败，将降级运行:", err.message);
    redisAvailable = false;
    return null;
  }
}

async function initRedis() {
  try {
    await getRedisClient();
  } catch (e) {
    console.warn("[Redis] 初始化失败，继续降级运行");
  }
}

async function setCache(key, value, expireSeconds = 3600) {
  if (!redisAvailable) return;
  try {
    const client = await getRedisClient();
    if (client) {
      await client.set(key, JSON.stringify(value), { EX: expireSeconds });
    }
  } catch (e) {
    console.warn("[Redis] setCache 失败:", e.message);
  }
}

async function getCache(key) {
  if (!redisAvailable) return null;
  try {
    const client = await getRedisClient();
    if (client) {
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    }
  } catch (e) {
    console.warn("[Redis] getCache 失败:", e.message);
  }
  return null;
}

async function delCache(key) {
  if (!redisAvailable) return;
  try {
    const client = await getRedisClient();
    if (client) {
      await client.del(key);
    }
  } catch (e) {
    console.warn("[Redis] delCache 失败:", e.message);
  }
}

const memoryAutoSave = new Map();

async function setAutoSave(sessionId, answers, expireSeconds = 7200) {
  if (!redisAvailable) {
    memoryAutoSave.set(sessionId, {
      answers,
      expireAt: Date.now() + expireSeconds * 1000,
    });
    return;
  }
  try {
    const client = await getRedisClient();
    if (client) {
      await client.set(`autosave:${sessionId}`, JSON.stringify(answers), {
        EX: expireSeconds,
      });
    }
  } catch (e) {
    console.warn("[Redis] setAutoSave 失败:", e.message);
    memoryAutoSave.set(sessionId, {
      answers,
      expireAt: Date.now() + expireSeconds * 1000,
    });
  }
}

async function getAutoSave(sessionId) {
  if (!redisAvailable) {
    const data = memoryAutoSave.get(sessionId);
    if (data && data.expireAt > Date.now()) {
      return data.answers;
    }
    memoryAutoSave.delete(sessionId);
    return null;
  }
  try {
    const client = await getRedisClient();
    if (client) {
      const data = await client.get(`autosave:${sessionId}`);
      return data ? JSON.parse(data) : null;
    }
  } catch (e) {
    console.warn("[Redis] getAutoSave 失败:", e.message);
    const data = memoryAutoSave.get(sessionId);
    if (data && data.expireAt > Date.now()) {
      return data.answers;
    }
  }
  return null;
}

async function delAutoSave(sessionId) {
  memoryAutoSave.delete(sessionId);
  if (!redisAvailable) return;
  try {
    const client = await getRedisClient();
    if (client) {
      await client.del(`autosave:${sessionId}`);
    }
  } catch (e) {
    console.warn("[Redis] delAutoSave 失败:", e.message);
  }
}

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of memoryAutoSave.entries()) {
    if (value.expireAt < now) {
      memoryAutoSave.delete(key);
    }
  }
}, 60000);

module.exports = {
  getRedisClient,
  initRedis,
  setCache,
  getCache,
  delCache,
  setAutoSave,
  getAutoSave,
  delAutoSave,
};
