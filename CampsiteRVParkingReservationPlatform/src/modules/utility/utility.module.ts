import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilityPole, UtilityUsage } from './utility.entity';
import { UtilityService } from './utility.service';
import { UtilityController } from './utility.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UtilityPole, UtilityUsage])],
  providers: [UtilityService],
  controllers: [UtilityController],
  exports: [UtilityService],
})
export class UtilityModule {}
