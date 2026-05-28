import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Meme } from '../meme/entities/meme.entity';
import { HotlistQueryDto } from './dto/hotlist-query.dto';

@Injectable()
export class HotlistService {
  constructor(
    @InjectRedis() private redis: Redis,
    @InjectRepository(Meme)
    private memeRepository: Repository<Meme>,
  ) {}

  async getDailyRanking(query: HotlistQueryDto) {
    const today = new Date().toISOString().split('T')[0];
    const key = `hotlist:daily:${today}`;
    return this.getRanking(key, query.limit || 50);
  }

  async getWeeklyRanking(query: HotlistQueryDto) {
    const weekStart = this.getWeekStart(new Date());
    const weekStr = weekStart.toISOString().split('T')[0];
    const key = `hotlist:weekly:${weekStr}`;
    return this.getRanking(key, query.limit || 50);
  }

  async getMonthlyRanking(query: HotlistQueryDto) {
    const today = new Date();
    const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const key = `hotlist:monthly:${monthStr}`;
    return this.getRanking(key, query.limit || 50);
  }

  private async getRanking(key: string, limit: number) {
    const results = await this.redis.zrevrange(key, 0, limit - 1, 'WITHSCORES');

    if (results.length === 0) {
      return [];
    }

    const items: { memeId: number; score: number; rank: number }[] = [];
    for (let i = 0; i < results.length; i += 2) {
      items.push({
        memeId: parseInt(results[i], 10),
        score: parseFloat(results[i + 1]),
        rank: Math.floor(i / 2) + 1,
      });
    }

    const memeIds = items.map((item) => item.memeId);
    const memes = await this.memeRepository.find({
      where: { id: In(memeIds) },
      relations: ['creator'],
    });

    const memeMap = new Map(memes.map((m) => [m.id, m]));

    return items.map((item) => ({
      ...item,
      meme: memeMap.get(item.memeId) || null,
    }));
  }

  async recordView(memeId: number) {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const weekStart = this.getWeekStart(today);
    const weekStr = weekStart.toISOString().split('T')[0];
    const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    const pipeline = this.redis.pipeline();
    pipeline.zincrby(`hotlist:daily:${dateStr}`, 1, String(memeId));
    pipeline.zincrby(`hotlist:weekly:${weekStr}`, 1, String(memeId));
    pipeline.zincrby(`hotlist:monthly:${monthStr}`, 1, String(memeId));
    await pipeline.exec();
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }
}
