import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private client: Redis;

  async onModuleInit() {
    this.client = new Redis({
      host: '127.0.0.1',
      port: 6379,
    });
  }

  getClient(): Redis {
    return this.client;
  }

  async incrImpression(scheduleId: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const key = `ad:impression:${scheduleId}:${today}`;
    await this.client.incr(key);
  }

  async incrClick(scheduleId: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const key = `ad:click:${scheduleId}:${today}`;
    await this.client.incr(key);
  }

  async getImpressionCount(scheduleId: number, date: string): Promise<number> {
    const key = `ad:impression:${scheduleId}:${date}`;
    const count = await this.client.get(key);
    return parseInt(count || '0');
  }

  async getClickCount(scheduleId: number, date: string): Promise<number> {
    const key = `ad:click:${scheduleId}:${date}`;
    const count = await this.client.get(key);
    return parseInt(count || '0');
  }

  async getKeysByPattern(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
}
