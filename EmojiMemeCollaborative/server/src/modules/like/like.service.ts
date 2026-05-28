import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { Like } from './entities/like.entity';
import { Meme } from '../meme/entities/meme.entity';

@Injectable()
export class LikeService {
  private readonly RATE_LIMIT_WINDOW = 60;
  private readonly RATE_LIMIT_MAX = 10;
  private readonly DAILY_LIMIT = 50;
  private readonly IP_RATE_LIMIT_WINDOW = 3600;
  private readonly IP_RATE_LIMIT_MAX = 100;

  constructor(
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
    @InjectRepository(Meme)
    private memeRepository: Repository<Meme>,
    @InjectRedis() private redis: Redis,
  ) {}

  async toggleLike(memeId: number, userId: number, type: 'like' | 'favorite', ip: string) {
    await this.checkRateLimit(userId, ip);

    const meme = await this.memeRepository.findOne({ where: { id: memeId } });
    if (!meme) {
      throw new BadRequestException('Meme not found');
    }

    const existing = await this.likeRepository.findOne({
      where: { user_id: userId, meme_id: memeId, type },
    });

    if (existing) {
      throw new BadRequestException(`Already ${type}d this meme`);
    }

    const like = this.likeRepository.create({
      user_id: userId,
      meme_id: memeId,
      type,
    });
    await this.likeRepository.save(like);

    if (type === 'like') {
      await this.memeRepository.increment({ id: memeId }, 'like_count', 1);
    } else {
      await this.memeRepository.increment({ id: memeId }, 'favorite_count', 1);
    }

    const score = type === 'like' ? 3 : 5;
    await this.updateHotlistScore(memeId, score);

    return { action: type, meme_id: memeId };
  }

  async removeLike(memeId: number, userId: number, type: 'like' | 'favorite') {
    const existing = await this.likeRepository.findOne({
      where: { user_id: userId, meme_id: memeId, type },
    });

    if (!existing) {
      throw new BadRequestException(`Haven't ${type}d this meme`);
    }

    await this.likeRepository.remove(existing);

    if (type === 'like') {
      await this.memeRepository.decrement({ id: memeId }, 'like_count', 1);
    } else {
      await this.memeRepository.decrement({ id: memeId }, 'favorite_count', 1);
    }

    const score = type === 'like' ? -3 : -5;
    await this.updateHotlistScore(memeId, score);

    return { action: `un${type}`, meme_id: memeId };
  }

  async getLikeStatus(memeId: number, userId: number) {
    const [liked, favorited] = await Promise.all([
      this.likeRepository.findOne({ where: { user_id: userId, meme_id: memeId, type: 'like' } }),
      this.likeRepository.findOne({ where: { user_id: userId, meme_id: memeId, type: 'favorite' } }),
    ]);

    return {
      liked: !!liked,
      favorited: !!favorited,
    };
  }

  private async checkRateLimit(userId: number, ip: string) {
    const userMinuteKey = `ratelimit:user:${userId}:minute`;
    const userMinuteCount = await this.redis.incr(userMinuteKey);
    if (userMinuteCount === 1) {
      await this.redis.expire(userMinuteKey, this.RATE_LIMIT_WINDOW);
    }
    if (userMinuteCount > this.RATE_LIMIT_MAX) {
      throw new ForbiddenException('Too many actions, please try again later');
    }

    const userDailyKey = `ratelimit:user:${userId}:daily`;
    const userDailyCount = await this.redis.incr(userDailyKey);
    const today = new Date();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const ttlSeconds = Math.floor((endOfDay.getTime() - today.getTime()) / 1000);
    if (userDailyCount === 1) {
      await this.redis.expire(userDailyKey, ttlSeconds);
    }
    if (userDailyCount > this.DAILY_LIMIT) {
      throw new ForbiddenException('Daily action limit exceeded');
    }

    const ipKey = `ratelimit:ip:${ip}:hour`;
    const ipCount = await this.redis.incr(ipKey);
    if (ipCount === 1) {
      await this.redis.expire(ipKey, this.IP_RATE_LIMIT_WINDOW);
    }
    if (ipCount > this.IP_RATE_LIMIT_MAX) {
      throw new ForbiddenException('Too many actions from this IP');
    }
  }

  private async updateHotlistScore(memeId: number, score: number) {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const weekStart = this.getWeekStart(today);
    const weekStr = weekStart.toISOString().split('T')[0];
    const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    const pipeline = this.redis.pipeline();
    pipeline.zincrby(`hotlist:daily:${dateStr}`, score, String(memeId));
    pipeline.zincrby(`hotlist:weekly:${weekStr}`, score, String(memeId));
    pipeline.zincrby(`hotlist:monthly:${monthStr}`, score, String(memeId));
    await pipeline.exec();
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }
}
