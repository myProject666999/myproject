import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdSpace } from '../entities/ad-space.entity';
import { AdSpaceController } from './ad-space.controller';
import { AdSpaceService } from './ad-space.service';

@Module({
  imports: [TypeOrmModule.forFeature([AdSpace])],
  controllers: [AdSpaceController],
  providers: [AdSpaceService],
  exports: [AdSpaceService],
})
export class AdSpaceModule {}
