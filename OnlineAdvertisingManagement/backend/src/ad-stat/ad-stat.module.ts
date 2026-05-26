import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AdStat } from '../entities/ad-stat.entity';
import { AdStatController } from './ad-stat.controller';
import { AdStatService } from './ad-stat.service';
import { StatsSyncService } from './stats-sync.service';
import { RedisService } from '../common/redis.service';

@Module({
  imports: [TypeOrmModule.forFeature([AdStat]), ScheduleModule.forRoot()],
  controllers: [AdStatController],
  providers: [AdStatService, StatsSyncService, RedisService],
  exports: [AdStatService],
})
export class AdStatModule {}
