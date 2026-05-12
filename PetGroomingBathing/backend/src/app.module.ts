import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetModule } from './modules/pet/pet.module';
import { ServiceModule } from './modules/service/service.module';
import { AppointmentModule } from './modules/appointment/appointment.module';
import { VehicleModule } from './modules/vehicle/vehicle.module';
import { PhotoModule } from './modules/photo/photo.module';
import { ReminderModule } from './modules/reminder/reminder.module';
import { ConsumptionModule } from './modules/consumption/consumption.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: parseInt(configService.get('DB_PORT', '3306'), 10),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', '123456'),
        database: configService.get('DB_DATABASE', 'pet_grooming'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        charset: 'utf8mb4',
      }),
      inject: [ConfigService],
    }),
    PetModule,
    ServiceModule,
    AppointmentModule,
    VehicleModule,
    PhotoModule,
    ReminderModule,
    ConsumptionModule,
  ],
})
export class AppModule {}
