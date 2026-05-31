import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';

import configuration from './config/configuration';
import { getTypeOrmConfig } from './config/typeorm.config';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

import { RedisService } from './common/services/redis.service';
import { AuditService } from './common/services/audit.service';
import { MasteryCalculatorService } from './common/services/mastery-calculator.service';

import { AuthModule } from './modules/auth/auth.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { QuestionModule } from './modules/question/question.module';
import { AnswerModule } from './modules/answer/answer.module';
import { MasteryModule } from './modules/mastery/mastery.module';
import { RecommendationModule } from './modules/recommendation/recommendation.module';
import { ReportModule } from './modules/report/report.module';
import { ClassModule } from './modules/class/class.module';
import { ExportModule } from './modules/export/export.module';

import { AuditLog } from './entities/audit-log.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => getTypeOrmConfig(configService),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([AuditLog]),
    ScheduleModule.forRoot(),
    AuthModule,
    KnowledgeModule,
    QuestionModule,
    AnswerModule,
    MasteryModule,
    RecommendationModule,
    ReportModule,
    ClassModule,
    ExportModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RedisService,
    AuditService,
    MasteryCalculatorService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
  exports: [RedisService, AuditService, MasteryCalculatorService],
})
export class AppModule {}
