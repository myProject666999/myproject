import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, ILike } from 'typeorm';
import { Project } from './entities/project.entity';
import { RewardTier } from './entities/reward-tier.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);

  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(RewardTier)
    private readonly tierRepo: Repository<RewardTier>,
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
  ) {}

  async create(userId: number, dto: CreateProjectDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const project = queryRunner.manager.create(Project, {
        userId,
        title: dto.title,
        subtitle: dto.subtitle,
        coverImage: dto.cover_image,
        description: dto.description,
        category: dto.category,
        goalAmount: dto.goal_amount,
        startAt: new Date(dto.start_at),
        endAt: new Date(dto.end_at),
        status: 0,
      });
      const saved = await queryRunner.manager.save(project);

      const tiers = dto.tiers.map(t =>
        queryRunner.manager.create(RewardTier, {
          projectId: saved.id,
          tierName: t.tier_name,
          amount: t.amount,
          description: t.description,
          stock: t.stock,
          soldCount: 0,
          deliverAt: t.deliver_at ? new Date(t.deliver_at) : null,
        }),
      );
      await queryRunner.manager.save(tiers);

      await queryRunner.commitTransaction();
      return { ...saved, tiers };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: {
    keyword?: string;
    status?: number;
    page?: number;
    pageSize?: number;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 12));
    const where: any = {};
    if (query.keyword) {
      where.title = ILike(`%${query.keyword}%`);
    }
    if (query.status !== undefined && query.status !== null) {
      where.status = Number(query.status);
    }
    const [list, total] = await this.projectRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { list, total, page, pageSize };
  }

  async findById(id: number) {
    const project = await this.projectRepo.findOne({ where: { id } });
    if (!project) throw new NotFoundException('项目不存在');
    const tiers = await this.tierRepo.find({
      where: { projectId: id },
      order: { amount: 'ASC' },
    });
    return { ...project, tiers };
  }

  async getProgress(id: number) {
    const cacheKey = `progress:${id}`;
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      this.logger.debug(`Redis cache read failed for ${cacheKey}: ${err.message}`);
    }

    const project = await this.projectRepo.findOne({ where: { id } });
    if (!project) throw new NotFoundException('项目不存在');
    const progress = {
      id: project.id,
      goalAmount: project.goalAmount,
      raisedAmount: project.raisedAmount,
      backerCount: project.backerCount,
      percent: project.goalAmount > 0
        ? Math.min(100, +((project.raisedAmount / project.goalAmount) * 100).toFixed(2))
        : 0,
      status: project.status,
      endAt: project.endAt,
    };

    try {
      await this.redisService.set(cacheKey, JSON.stringify(progress), 30);
    } catch (err) {
      this.logger.debug(`Redis cache write failed for ${cacheKey}: ${err.message}`);
    }

    return progress;
  }
}
