import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckinRecord } from './checkin.entity';
import { CheckinService } from './checkin.service';
import { CheckinController } from './checkin.controller';
import { ReservationModule } from '../reservation/reservation.module';

@Module({
  imports: [TypeOrmModule.forFeature([CheckinRecord]), ReservationModule],
  providers: [CheckinService],
  controllers: [CheckinController],
  exports: [CheckinService],
})
export class CheckinModule {}
