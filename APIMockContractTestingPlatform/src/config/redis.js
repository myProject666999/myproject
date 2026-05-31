const redis = require('redis');
require('dotenv').config();

const client = redis.createClient({
  url: `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`,
  password: process.env.REDIS_PASSWORD || undefined
});

client.on('error', (error) => {
  console.error('Redis连接错误:', error.message);
});

client.on('connect', () => {
  console.log('Redis连接成功');
});

async function connect() {
  try {
    await client.connect();
    return true;
  } catch (error) {
    console.error('Redis连接失败:', error.message);
    return false;
  }
}

async function get(key) {
  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Redis GET错误:', error.message);
    return null;
  }
}

async function set(key, value, ttl = null) {
  try {
    if (ttl) {
      await client.setEx(key, ttl, JSON.stringify(value));
    } else {
      await client.set(key, JSON.stringify(value));
    }
    return true;
  } catch (error) {
    console.error('Redis SET错误:', error.message);
    return false;
  }
}

async function del(key) {
  try {
    await client.del(key);
    return true;
  } catch (error) {
    console.error('Redis DEL错误:', error.message);
    return false;
  }
}

async function exists(key) {
  try {
    return await client.exists(key);
  } catch (error) {
    console.error('Redis EXISTS错误:', error.message);
    return false;
  }
}

module.exports = {
  client,
  connect,
  get,
  set,
  del,
  exists
};
