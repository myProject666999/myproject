import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  onModuleInit() {
    this.client = new Redis({
      host: '127.0.0.1',
      port: 6379,
    });
  }

  onModuleDestroy() {
    this.client.disconnect();
  }

  getClient(): Redis {
    return this.client;
  }

  async geoAdd(key: string, longitude: number, latitude: number, member: string) {
    return this.client.geoadd(key, longitude, latitude, member);
  }

  async geoRadius(key: string, longitude: number, latitude: number, radius: number, unit: string = 'km') {
    return this.client.georadius(key, longitude, latitude, radius, unit, 'WITHDIST', 'WITHCOORD');
  }

  async zAdd(key: string, score: number, member: string) {
    return this.client.zadd(key, score, member);
  }

  async zRevRange(key: string, start: number, stop: number, withScores: boolean = true) {
    if (withScores) {
      return this.client.zrevrange(key, start, stop, 'WITHSCORES');
    }
    return this.client.zrevrange(key, start, stop);
  }

  async zIncrBy(key: string, increment: number, member: string) {
    return this.client.zincrby(key, increment, member);
  }

  async set(key: string, value: string, ttl?: number) {
    if (ttl) {
      return this.client.set(key, value, 'EX', ttl);
    }
    return this.client.set(key, value);
  }

  async get(key: string) {
    return this.client.get(key);
  }

  async del(key: string) {
    return this.client.del(key);
  }

  async exists(key: string) {
    return this.client.exists(key);
  }
}
