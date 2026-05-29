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
import { RedisModule } from './config/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: databaseConfig,
      inject: [ConfigService],
    }),
    RedisModule,
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
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
