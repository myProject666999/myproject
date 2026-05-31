import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampsiteModule } from './modules/campsite/campsite.module';
import { SpotModule } from './modules/spot/spot.module';
import { ReservationModule } from './modules/reservation/reservation.module';
import { RentalModule } from './modules/rental/rental.module';
import { UtilityModule } from './modules/utility/utility.module';
import { CheckinModule } from './modules/checkin/checkin.module';
import { ReviewModule } from './modules/review/review.module';
import { UserModule } from './modules/user/user.module';
import { DatabaseConfigService } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfigService,
    }),
    UserModule,
    CampsiteModule,
    SpotModule,
    ReservationModule,
    RentalModule,
    UtilityModule,
    CheckinModule,
    ReviewModule,
  ],
})
export class AppModule {}
