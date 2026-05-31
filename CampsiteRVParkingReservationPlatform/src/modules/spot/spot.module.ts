import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Spot, SpotType } from './spot.entity';
import { SpotService } from './spot.service';
import { SpotController } from './spot.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Spot, SpotType])],
  providers: [SpotService],
  controllers: [SpotController],
  exports: [SpotService],
})
export class SpotModule {}
