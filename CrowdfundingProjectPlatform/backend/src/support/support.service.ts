import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { SupportOrder } from './entities/support-order.entity';
import { SupportDto } from './dto/support.dto';
import { RedisService } from '../redis/redis.service';
import { Project } from '../project/entities/project.entity';
import { RewardTier } from '../project/entities/reward-tier.entity';

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);

  constructor(
    @InjectRepository(SupportOrder)
    private readonly supportOrderRepo: Repository<SupportOrder>,
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
  ) {}

  async create(userId: number, dto: SupportDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const projectRepo = queryRunner.manager.getRepository(Project);
      const tierRepo = queryRunner.manager.getRepository(RewardTier);
      const orderRepo = queryRunner.manager.getRepository(SupportOrder);

      const project = await projectRepo.findOne({
        where: { id: dto.projectId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!project) {
        throw new NotFoundException('项目不存在');
      }
      const now = new Date();
      if (project.status !== 0) {
        throw new BadRequestException('项目不在筹款中');
      }
      if (!project.endAt || new Date(project.endAt) <= now) {
        throw new BadRequestException('项目筹款已结束');
      }

      const tier = await tierRepo.findOne({
        where: { id: dto.tierId, projectId: dto.projectId },
      });
      if (!tier) {
        throw new NotFoundException('档位不存在');
      }

      if (tier.stock > 0 && tier.soldCount + dto.quantity > tier.stock) {
        throw new BadRequestException('档位库存不足');
      }

      tier.soldCount += dto.quantity;
      await tierRepo.save(tier);

      const unitPrice = parseFloat(tier.amount as any);
      const amount = +(unitPrice * dto.quantity).toFixed(2);

      const orderNo =
        'S' +
        Date.now().toString() +
        Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, '0');

      const order = orderRepo.create({
        orderNo,
        userId,
        projectId: dto.projectId,
        tierId: dto.tierId,
        amount,
        quantity: dto.quantity,
        status: 1,
        remark: dto.remark,
      });
      await orderRepo.save(order);

      const newRaised = parseFloat(project.raisedAmount as any) + amount;
      project.raisedAmount = newRaised as any;
      project.backerCount += 1;
      if (newRaised >= parseFloat(project.goalAmount as any)) {
        project.status = 1;
      }
      await projectRepo.save(project);

      await queryRunner.commitTransaction();

      await this.redisService.del(`progress:${dto.projectId}`);

      return { orderNo, amount, quantity: dto.quantity };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Support create failed: ${err.message}`, err.stack);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findMyOrders(userId: number) {
    return this.supportOrderRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
