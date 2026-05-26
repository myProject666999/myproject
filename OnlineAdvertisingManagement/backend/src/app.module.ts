import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdSpaceModule } from './ad-space/ad-space.module';
import { AdMaterialModule } from './ad-material/ad-material.module';
import { AdScheduleModule } from './ad-schedule/ad-schedule.module';
import { AdStatModule } from './ad-stat/ad-stat.module';
import { AdSpace } from './entities/ad-space.entity';
import { AdMaterial } from './entities/ad-material.entity';
import { AdSchedule } from './entities/ad-schedule.entity';
import { AdStat } from './entities/ad-stat.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      username: 'root',
      password: '123456',
      database: 'ad_management',
      entities: [AdSpace, AdMaterial, AdSchedule, AdStat],
      synchronize: false,
      logging: true,
    }),
    AdSpaceModule,
    AdMaterialModule,
    AdScheduleModule,
    AdStatModule,
  ],
})
export class AppModule {}
