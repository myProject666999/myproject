import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { Project } from '../project/entities/project.entity';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project]),
    RedisModule,
  ],
  providers: [TasksService],
})
export class TasksModule {}
