import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meme } from './entities/meme.entity';
import { MemeService } from './meme.service';
import { MemeController } from './meme.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Meme])],
  controllers: [MemeController],
  providers: [MemeService],
  exports: [MemeService],
})
export class MemeModule {}
