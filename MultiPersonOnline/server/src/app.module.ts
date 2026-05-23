import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FoldersModule } from './folders/folders.module';
import { DocumentsModule } from './documents/documents.module';
import { PermissionsModule } from './permissions/permissions.module';
import { VersionsModule } from './versions/versions.module';
import { RecycleBinModule } from './recycle-bin/recycle-bin.module';
import { CollaborationModule } from './collaboration/collaboration.module';
import { CommonModule } from './common/common.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingMiddleware } from './common/middlewares/logging.middleware';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      username: 'root',
      password: '123456',
      database: 'multi_person_online',
      autoLoadEntities: true,
      synchronize: false,
      logging: process.env.NODE_ENV !== 'production',
      timezone: '+08:00',
      extra: {
        connectionLimit: 20,
      },
    }),
    AuthModule,
    UsersModule,
    FoldersModule,
    DocumentsModule,
    PermissionsModule,
    VersionsModule,
    RecycleBinModule,
    CollaborationModule,
    CommonModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
