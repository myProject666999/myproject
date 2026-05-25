import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { Project } from '../project/entities/project.entity';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Project) private readonly projectRepo: Repository<Project>,
    private readonly redisService: RedisService,
  ) {}

  @Cron('*/60 * * * * *')
  async handleCloseProjects() {
    const now = new Date();
    const projects = await this.projectRepo.find({
      where: { status: 0, endAt: LessThanOrEqual(now) },
    });
    for (const project of projects) {
      project.status = project.raisedAmount >= project.goalAmount ? 1 : 2;
      await this.projectRepo.save(project);
      await this.redisService.del(`progress:${project.id}`);
    }
  }
}
