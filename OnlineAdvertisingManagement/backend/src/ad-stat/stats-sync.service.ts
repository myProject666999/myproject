import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RedisService } from '../common/redis.service';
import { AdStatService } from './ad-stat.service';

@Injectable()
export class StatsSyncService {
  private readonly logger = new Logger(StatsSyncService.name);

  constructor(
    private redisService: RedisService,
    private adStatService: AdStatService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async syncStatsFromRedis() {
    this.logger.log('开始同步 Redis 统计数据到数据库...');

    try {
      const impressionKeys = await this.redisService.getKeysByPattern('ad:impression:*');
      
      for (const key of impressionKeys) {
        const parts = key.split(':');
        const scheduleId = parseInt(parts[2]);
        const date = parts[3];

        const impressions = await this.redisService.getImpressionCount(scheduleId, date);
        const clicks = await this.redisService.getClickCount(scheduleId, date);

        await this.adStatService.upsertStat({
          scheduleId,
          statDate: new Date(date),
          impressions,
          clicks,
        });
      }

      this.logger.log(`同步完成，共处理 ${impressionKeys.length} 条记录`);
    } catch (error) {
      this.logger.error('同步统计数据失败:', error);
    }
  }
}
