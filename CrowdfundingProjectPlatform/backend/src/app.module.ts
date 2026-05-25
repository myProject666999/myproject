import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProjectModule } from './project/project.module';
import { SupportModule } from './support/support.module';
import { UpdateModule } from './update/update.module';
import { CommentModule } from './comment/comment.module';
import { TasksModule } from './tasks/tasks.module';
import { RedisModule } from './redis/redis.module';
import { User } from './user/entities/user.entity';
import { Project } from './project/entities/project.entity';
import { RewardTier } from './project/entities/reward-tier.entity';
import { SupportOrder } from './support/entities/support-order.entity';
import { ProjectUpdate } from './update/entities/project-update.entity';
import { Comment } from './comment/entities/comment.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      username: 'root',
      password: '123456',
      database: 'crowdfunding',
      entities: [User, Project, RewardTier, SupportOrder, ProjectUpdate, Comment],
      synchronize: false,
      timezone: '+08:00',
      logging: false,
    }),
    ScheduleModule.forRoot(),
    RedisModule,
    AuthModule,
    UserModule,
    ProjectModule,
    SupportModule,
    UpdateModule,
    CommentModule,
    TasksModule,
  ],
})
export class AppModule {}
