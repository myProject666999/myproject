import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.setGlobalPrefix('api', {
    exclude: ['/'],
  });

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: false,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  app.useStaticAssets(join(__dirname, '..', 'exports'), {
    prefix: '/exports/',
  });

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('学情诊断与知识点掌握图谱 API')
    .setDescription('基于知识点图谱的智能学情诊断系统，提供掌握度分析、薄弱点识别、智能推荐等功能')
    .setVersion('1.0.0')
    .addTag('认证', '用户登录、注册、权限管理')
    .addTag('学科', '学科管理')
    .addTag('知识点', '知识点图谱、层级关系、可视化')
    .addTag('知识点关系', '知识点关联关系管理')
    .addTag('题库', '题目管理、知识点关联、批量导入')
    .addTag('练习', '练习/试卷管理')
    .addTag('答题', '答题记录、错题本、练习会话')
    .addTag('掌握度', '知识点掌握度诊断、趋势分析')
    .addTag('薄弱点', '薄弱知识点识别与管理')
    .addTag('推荐练习', '智能推荐、薄弱点专项练习')
    .addTag('学情报告', '个人/班级学情报告、诊断报告')
    .addTag('班级', '班级管理、学情统计、对比分析')
    .addTag('导出', '报告导出、数据导出')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: '学情诊断 API 文档',
  });

  const port = configService.get('port') || 3000;
  const nodeEnv = configService.get('nodeEnv') || 'development';

  await app.listen(port, () => {
    console.log(`\n`);
    console.log(`🚀 学情诊断与知识点掌握图谱系统启动成功!`);
    console.log(`\n`);
    console.log(`📡 服务地址: http://127.0.0.1:${port}`);
    console.log(`📚 API 文档: http://127.0.0.1:${port}/api/docs`);
    console.log(`🔧 环境: ${nodeEnv}`);
    console.log(`\n`);
    console.log(`📊 数据库: ${configService.get('database.host')}:${configService.get('database.port')}/${configService.get('database.database')}`);
    console.log(`💾 Redis: ${configService.get('redis.host')}:${configService.get('redis.port')}`);
    console.log(`\n`);
    console.log(`👤 测试账号:`);
    console.log(`   管理员: admin / 123456`);
    console.log(`   老师: teacher1 / 123456`);
    console.log(`   学生: student1 / 123456`);
    console.log(`\n`);
  });
}

bootstrap();
