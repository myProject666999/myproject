import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ProjectUpdate } from './entities/project-update.entity';

@Injectable()
export class UpdateService {
  constructor(
    @InjectRepository(ProjectUpdate)
    private readonly updateRepo: Repository<ProjectUpdate>,
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: number, projectId: number, data: { title: string; content: string }) {
    if (!data?.title || !data?.content) {
      throw new BadRequestException('标题和内容不能为空');
    }
    const project = await this.dataSource.query(
      `SELECT id, user_id FROM project WHERE id = ?`,
      [projectId],
    );
    if (!project || project.length === 0) {
      throw new NotFoundException('项目不存在');
    }
    if (Number(project[0].user_id) !== Number(userId)) {
      throw new ForbiddenException('仅项目发起人可发布动态');
    }
    const update = this.updateRepo.create({
      projectId,
      userId,
      title: data.title,
      content: data.content,
    });
    return this.updateRepo.save(update);
  }

  async findByProject(projectId: number) {
    return this.updateRepo.find({
      where: { projectId },
      order: { createdAt: 'DESC' },
    });
  }
}
