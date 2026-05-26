import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdSchedule } from '../entities/ad-schedule.entity';
import { AdScheduleController } from './ad-schedule.controller';
import { AdScheduleService } from './ad-schedule.service';
import { RedisService } from '../common/redis.service';

@Module({
  imports: [TypeOrmModule.forFeature([AdSchedule])],
  controllers: [AdScheduleController],
  providers: [AdScheduleService, RedisService],
  exports: [AdScheduleService],
})
export class AdScheduleModule {}
