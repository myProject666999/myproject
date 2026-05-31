import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { GroupModule } from './modules/group/group.module';
import { CheckinModule } from './modules/checkin/checkin.module';
import { PostModule } from './modules/post/post.module';
import { GoalModule } from './modules/goal/goal.module';
import { RankingModule } from './modules/ranking/ranking.module';
import { NotificationModule } from './modules/notification/notification.module';
import { RedisModule } from './modules/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '123456',
      database: process.env.DB_DATABASE || 'online_learning_community',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
      logging: false,
      timezone: '+08:00',
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'online-learning-community-secret-key',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    }),
    RedisModule,
    AuthModule,
    UserModule,
    GroupModule,
    CheckinModule,
    PostModule,
    GoalModule,
    RankingModule,
    NotificationModule,
  ],
})
export class AppModule {}
