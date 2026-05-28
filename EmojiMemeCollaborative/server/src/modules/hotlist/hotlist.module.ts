import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meme } from '../meme/entities/meme.entity';
import { HotlistService } from './hotlist.service';
import { HotlistController } from './hotlist.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Meme])],
  controllers: [HotlistController],
  providers: [HotlistService],
  exports: [HotlistService],
})
export class HotlistModule {}
