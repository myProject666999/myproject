import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

export interface Collaborator {
  userId: string;
  nickname: string;
  joinedAt: string;
}

export interface OperationRecord {
  id: string;
  operation: any;
  version: number;
  userId: number;
  timestamp: number;
}

@Injectable()
export class CollaborationService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger('CollaborationService');
  private redis: Redis;

  onModuleInit() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      db: Number(process.env.REDIS_DB) || 0,
      lazyConnect: false,
      enableOfflineQueue: true,
      retryStrategy: (times) => {
        if (times > 10) {
          this.logger.error('Redis 连接失败，超过重试次数');
          return null;
        }
        return Math.min(times * 500, 3000);
      },
    });
    this.redis.on('error', (err) => {
      this.logger.error(`Redis 错误: ${err.message}`);
    });
    this.redis.on('connect', () => {
      this.logger.log('Redis 连接成功');
    });
  }

  onModuleDestroy() {
    if (this.redis) {
      this.redis.disconnect();
    }
  }

  async joinDocument(
    documentId: string,
    userId: number,
    nickname?: string,
  ): Promise<Collaborator[]> {
    const key = `document:online:${documentId}`;
    const userKey = `document:collaborator:${documentId}:${userId}`;
    try {
      await this.redis.sadd(key, String(userId));
      await this.redis.hset(userKey, {
        userId: String(userId),
        nickname: nickname ?? `用户${userId}`,
        joinedAt: new Date().toISOString(),
      });
      await this.redis.expire(userKey, 3600);
      await this.redis.expire(key, 3600);
      return this.listOnline(documentId);
    } catch (err) {
      this.logger.error('加入文档失败', err);
      return [];
    }
  }

  async leaveDocument(
    documentId: string,
    userId: number,
  ): Promise<Collaborator[]> {
    const key = `document:online:${documentId}`;
    const userKey = `document:collaborator:${documentId}:${userId}`;
    try {
      await this.redis.srem(key, String(userId));
      await this.redis.del(userKey);
      return this.listOnline(documentId);
    } catch (err) {
      this.logger.error('离开文档失败', err);
      return [];
    }
  }

  async getOnlineUsers(documentId: string): Promise<Collaborator[]> {
    try {
      return this.listOnline(documentId);
    } catch {
      return [];
    }
  }

  private async listOnline(documentId: string): Promise<Collaborator[]> {
    const key = `document:online:${documentId}`;
    const users = await this.redis.smembers(key);
    const list: Collaborator[] = [];
    for (const uid of users) {
      const info = await this.redis.hgetall(
        `document:collaborator:${documentId}:${uid}`,
      );
      if (info && info.userId) {
        list.push(info as unknown as Collaborator);
      }
    }
    return list;
  }

  async saveOperation(
    documentId: string,
    operation: any,
    version: number,
    userId: number,
  ): Promise<OperationRecord> {
    const key = `document:ops:${documentId}`;
    const op: OperationRecord = {
      id: uuidv4(),
      operation,
      version,
      userId,
      timestamp: Date.now(),
    };
    try {
      await this.redis.lpush(key, JSON.stringify(op));
      await this.redis.ltrim(key, 0, 999);
      await this.redis.expire(key, 3600);
    } catch (err) {
      this.logger.error('保存操作失败', err);
    }
    return op;
  }

  async getOperations(
    documentId: string,
    start = 0,
    end = 99,
  ): Promise<OperationRecord[]> {
    const key = `document:ops:${documentId}`;
    try {
      const raw = await this.redis.lrange(key, start, end);
      return raw
        .map((r) => {
          try {
            return JSON.parse(r) as OperationRecord;
          } catch {
            return null;
          }
        })
        .filter((x): x is OperationRecord => x !== null);
    } catch {
      return [];
    }
  }

  async acquireLock(
    documentId: string,
    userId: number,
    ttl = 5000,
  ): Promise<boolean> {
    const key = `document:lock:${documentId}`;
    try {
      const result = await this.redis.set(
        key,
        String(userId),
        'PX',
        ttl,
        'NX',
      );
      return result === 'OK';
    } catch {
      return false;
    }
  }

  async releaseLock(documentId: string) {
    try {
      await this.redis.del(`document:lock:${documentId}`);
    } catch {
      /* ignore */
    }
  }
}
