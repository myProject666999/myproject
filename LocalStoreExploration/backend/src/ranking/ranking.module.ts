import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { RankingController } from './ranking.controller';
import { RankingService } from './ranking.service';
import { RedisService } from '../redis/redis.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [RankingController],
  providers: [RankingService, RedisService],
  exports: [RankingService],
})
export class RankingModule {}
