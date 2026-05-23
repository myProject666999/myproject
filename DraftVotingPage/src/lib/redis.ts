import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";

let client: Redis | null = null;

export function getRedis(): Redis {
  if (!client) {
    client = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
    });
  }
  return client;
}

export async function incrWithLimit(
  key: string,
  windowSec: number,
  limit: number
): Promise<{ ok: boolean; current: number }> {
  const r = getRedis();
  const current = await r.incr(key);
  if (current === 1) {
    await r.expire(key, windowSec);
  }
  if (current > limit) {
    return { ok: false, current };
  }
  return { ok: true, current };
}
