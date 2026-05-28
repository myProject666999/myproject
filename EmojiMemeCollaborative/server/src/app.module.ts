import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { TemplateModule } from './modules/template/template.module';
import { StickerModule } from './modules/sticker/sticker.module';
import { MemeModule } from './modules/meme/meme.module';
import { LikeModule } from './modules/like/like.module';
import { HotlistModule } from './modules/hotlist/hotlist.module';
import { ReviewModule } from './modules/review/review.module';
import { databaseConfig } from './config/database.config';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { Redis } from 'ioredis';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: databaseConfig,
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    TemplateModule,
    StickerModule,
    MemeModule,
    LikeModule,
    HotlistModule,
    ReviewModule,
  ],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get<string>('REDIS_HOST', '127.0.0.1'),
          port: configService.get<number>('REDIS_PORT', 6379),
          db: 0,
        });
      },
      inject: [ConfigService],
    },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
  exports: ['REDIS_CLIENT'],
})
export class AppModule {}
