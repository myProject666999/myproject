import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Consumption } from './consumption.entity';
import { ConsumptionService } from './consumption.service';
import { ConsumptionController } from './consumption.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Consumption])],
  controllers: [ConsumptionController],
  providers: [ConsumptionService],
  exports: [ConsumptionService],
})
export class ConsumptionModule {}
