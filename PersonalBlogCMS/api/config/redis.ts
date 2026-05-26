import Redis from 'ioredis';
import { config } from './index.js';

const redisOptions: Redis.RedisOptions = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password || undefined,
  retryDelayOnFailover: 100,
  retryDelay: (times: number) => Math.min(times * 50, 2000),
};

export const redis = new Redis(redisOptions);

redis.on('connect', () => {
  console.log('Redis connected');
});

redis.on('error', (err) => {
  console.warn('Redis connection error:', err.message);
});

export const cacheKeys = {
  articleHot: 'article:hot',
  articleView: (id: number) => `article:view:${id}`,
  articleDetail: (id: number) => `article:detail:${id}`,
  categoryList: 'category:list',
  tagCloud: 'tag:cloud',
  statsOverview: 'stats:overview',
  rateLimit: (ip: string) => `rate_limit:${ip}`,
};
