import Redis from 'ioredis';
import { config } from './index.js';

class RedisCache {
  private client: Redis | null = null;
  private memoryCache = new Map<string, { value: string; expiresAt?: number }>();
  private connected = false;
  private initialized = false;

  init() {
    if (this.initialized) return;
    this.initialized = true;

    try {
      const redisOptions: Redis.RedisOptions = {
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password || undefined,
        retryDelayOnFailover: 100,
        retryDelay: (times: number) => Math.min(times * 50, 2000),
        enableOfflineQueue: false,
        connectTimeout: 2000,
        commandTimeout: 1000,
      };

      this.client = new Redis(redisOptions);

      this.client.on('connect', () => {
        this.connected = true;
        console.log('Redis connected');
      });

      this.client.on('error', (err) => {
        this.connected = false;
        console.warn('Redis connection error, using memory cache fallback:', err.message);
      });

      this.client.on('close', () => {
        this.connected = false;
      });

      this.client.on('end', () => {
        this.connected = false;
      });
    } catch (err) {
      console.warn('Redis initialization failed, using memory cache');
      this.connected = false;
    }
  }

  private isAvailable(): boolean {
    return this.connected && this.client !== null;
  }

  private cleanupMemory() {
    const now = Date.now();
    for (const [key, val] of this.memoryCache.entries()) {
      if (val.expiresAt && val.expiresAt < now) {
        this.memoryCache.delete(key);
      }
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.isAvailable()) {
      try {
        return await this.client!.get(key);
      } catch {
        // fall through to memory cache
      }
    }
    this.cleanupMemory();
    const val = this.memoryCache.get(key);
    if (val && (!val.expiresAt || val.expiresAt > Date.now())) {
      return val.value;
    }
    return null;
  }

  async set(key: string, value: string, mode?: 'EX' | 'PX', duration?: number): Promise<'OK'> {
    if (this.isAvailable()) {
      try {
        if (mode && duration) {
          return await this.client!.set(key, value, mode, duration) as 'OK';
        }
        return await this.client!.set(key, value) as 'OK';
      } catch {
        // fall through to memory cache
      }
    }
    this.memoryCache.set(key, {
      value,
      expiresAt: mode === 'EX' && duration ? Date.now() + duration * 1000 : mode === 'PX' && duration ? Date.now() + duration : undefined,
    });
    return 'OK';
  }

  async del(...keys: string[]): Promise<number> {
    if (this.isAvailable()) {
      try {
        return await this.client!.del(...keys);
      } catch {
        // fall through to memory cache
      }
    }
    let count = 0;
    for (const key of keys) {
      if (this.memoryCache.has(key)) {
        this.memoryCache.delete(key);
        count++;
      }
    }
    return count;
  }

  async exists(key: string): Promise<number> {
    if (this.isAvailable()) {
      try {
        return await this.client!.exists(key);
      } catch {
        // fall through to memory cache
      }
    }
    this.cleanupMemory();
    const val = this.memoryCache.get(key);
    return val && (!val.expiresAt || val.expiresAt > Date.now()) ? 1 : 0;
  }

  async incr(key: string): Promise<number> {
    if (this.isAvailable()) {
      try {
        return await this.client!.incr(key);
      } catch {
        // fall through to memory cache
      }
    }
    this.cleanupMemory();
    const val = this.memoryCache.get(key);
    const current = val && (!val.expiresAt || val.expiresAt > Date.now()) ? parseInt(val.value, 10) || 0 : 0;
    const next = current + 1;
    this.memoryCache.set(key, { value: String(next), expiresAt: val?.expiresAt });
    return next;
  }

  async expire(key: string, seconds: number): Promise<number> {
    if (this.isAvailable()) {
      try {
        return await this.client!.expire(key, seconds);
      } catch {
        // fall through to memory cache
      }
    }
    this.cleanupMemory();
    const val = this.memoryCache.get(key);
    if (val && (!val.expiresAt || val.expiresAt > Date.now())) {
      val.expiresAt = Date.now() + seconds * 1000;
      return 1;
    }
    return 0;
  }

  async zincrby(key: string, increment: number, member: string): Promise<string> {
    if (this.isAvailable()) {
      try {
        return String(await this.client!.zincrby(key, increment, member));
      } catch {
        // fall through to memory cache
      }
    }
    const cacheKey = `zset:${key}`;
    this.cleanupMemory();
    const zsetVal = this.memoryCache.get(cacheKey);
    let zset: Map<string, number>;
    if (zsetVal && (!zsetVal.expiresAt || zsetVal.expiresAt > Date.now())) {
      zset = new Map(JSON.parse(zsetVal.value));
    } else {
      zset = new Map();
    }
    const current = zset.get(member) || 0;
    const next = current + increment;
    zset.set(member, next);
    this.memoryCache.set(cacheKey, { value: JSON.stringify([...zset.entries()]) });
    return String(next);
  }

  async zrevrange(key: string, start: number, stop: number): Promise<string[]> {
    if (this.isAvailable()) {
      try {
        return await this.client!.zrevrange(key, start, stop);
      } catch {
        // fall through to memory cache
      }
    }
    const cacheKey = `zset:${key}`;
    this.cleanupMemory();
    const zsetVal = this.memoryCache.get(cacheKey);
    if (!zsetVal || (zsetVal.expiresAt && zsetVal.expiresAt <= Date.now())) {
      return [];
    }
    const zset: [string, number][] = JSON.parse(zsetVal.value);
    zset.sort((a, b) => b[1] - a[1]);
    const end = stop === -1 ? zset.length : stop + 1;
    return zset.slice(start, end).map(([member]) => member);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    if (this.isAvailable()) {
      try {
        return await this.client!.hgetall(key);
      } catch {
        // fall through to memory cache
      }
    }
    const cacheKey = `hash:${key}`;
    this.cleanupMemory();
    const hashVal = this.memoryCache.get(cacheKey);
    if (hashVal && (!hashVal.expiresAt || hashVal.expiresAt > Date.now())) {
      return JSON.parse(hashVal.value);
    }
    return {};
  }

  async hset(key: string, ...args: (string | number)[]): Promise<number> {
    if (this.isAvailable()) {
      try {
        return await this.client!.hset(key, ...args);
      } catch {
        // fall through to memory cache
      }
    }
    const cacheKey = `hash:${key}`;
    this.cleanupMemory();
    const hashVal = this.memoryCache.get(cacheKey);
    let hash: Record<string, string>;
    if (hashVal && (!hashVal.expiresAt || hashVal.expiresAt > Date.now())) {
      hash = JSON.parse(hashVal.value);
    } else {
      hash = {};
    }
    for (let i = 0; i < args.length; i += 2) {
      hash[String(args[i])] = String(args[i + 1]);
    }
    this.memoryCache.set(cacheKey, { value: JSON.stringify(hash) });
    return args.length / 2;
  }

  async keys(pattern: string): Promise<string[]> {
    if (this.isAvailable()) {
      try {
        return await this.client!.keys(pattern);
      } catch {
        // fall through to memory cache
      }
    }
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    this.cleanupMemory();
    const result: string[] = [];
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        result.push(key);
      }
    }
    return result;
  }
}

export const redis = new RedisCache();
redis.init();

export const cacheKeys = {
  articleHot: 'article:hot',
  articleView: (id: number) => `article:view:${id}`,
  articleDetail: (id: number) => `article:detail:${id}`,
  categoryList: 'category:list',
  tagCloud: 'tag:cloud',
  statsOverview: 'stats:overview',
  rateLimit: (ip: string) => `rate_limit:${ip}`,
};
