import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private readonly logger = new Logger(RedisService.name);
  private connected = false;

  onModuleInit() {
    try {
      this.client = new Redis({
        host: '127.0.0.1',
        port: 6379,
        maxRetriesPerRequest: 3,
        enableReadyCheck: false,
        lazyConnect: false,
        retryStrategy: (times) => {
          if (times > 5) return null;
          return Math.min(times * 200, 2000);
        },
      });

      this.client.on('connect', () => {
        this.connected = true;
        this.logger.log('Redis connected');
      });

      this.client.on('error', (err) => {
        this.connected = false;
        this.logger.warn(`Redis connection error: ${err.message}`);
      });

      this.client.on('close', () => {
        this.connected = false;
      });
    } catch (err) {
      this.logger.warn(`Redis init failed: ${err.message}`);
      this.connected = false;
    }
  }

  onModuleDestroy() {
    try {
      if (this.client) this.client.disconnect();
    } catch {}
  }

  private isAvailable(): boolean {
    return this.connected && this.client?.status === 'ready';
  }

  async get(key: string): Promise<string | null> {
    if (!this.isAvailable()) return null;
    try {
      return await this.client.get(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    if (!this.isAvailable()) return false;
    try {
      if (ttl) {
        await this.client.set(key, value, 'EX', ttl);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch {
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.isAvailable()) return false;
    try {
      await this.client.del(key);
      return true;
    } catch {
      return false;
    }
  }

  async incrby(key: string, increment: number): Promise<number | null> {
    if (!this.isAvailable()) return null;
    try {
      return await this.client.incrby(key, increment);
    } catch {
      return null;
    }
  }
}
