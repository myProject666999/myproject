import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { Meme } from '../meme/entities/meme.entity';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Like, Meme])],
  controllers: [LikeController],
  providers: [LikeService],
  exports: [LikeService],
})
export class LikeModule {}
