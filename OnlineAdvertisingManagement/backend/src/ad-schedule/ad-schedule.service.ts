import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AdSchedule } from '../entities/ad-schedule.entity';
import { RedisService } from '../common/redis.service';

@Injectable()
export class AdScheduleService {
  constructor(
    @InjectRepository(AdSchedule)
    private adScheduleRepository: Repository<AdSchedule>,
    private redisService: RedisService,
  ) {}

  async findAll(): Promise<AdSchedule[]> {
    return this.adScheduleRepository.find({ relations: ['adSpace', 'material'] });
  }

  async findOne(id: number): Promise<AdSchedule> {
    return this.adScheduleRepository.findOne({ where: { id }, relations: ['adSpace', 'material'] });
  }

  async checkConflict(adSpaceId: number, startTime: Date, endTime: Date, excludeId?: number): Promise<boolean> {
    const query = this.adScheduleRepository
      .createQueryBuilder('schedule')
      .where('schedule.ad_space_id = :adSpaceId', { adSpaceId })
      .andWhere('schedule.status = 1')
      .andWhere('(:startTime < schedule.end_time AND :endTime > schedule.start_time)', {
        startTime,
        endTime,
      });

    if (excludeId) {
      query.andWhere('schedule.id != :excludeId', { excludeId });
    }

    const count = await query.getCount();
    return count > 0;
  }

  async create(data: Partial<AdSchedule>): Promise<AdSchedule> {
    const hasConflict = await this.checkConflict(
      data.adSpaceId,
      data.startTime,
      data.endTime,
    );

    if (hasConflict) {
      throw new BadRequestException('该广告位在所选时间段内已有排期，请选择其他时间');
    }

    const schedule = this.adScheduleRepository.create(data);
    return this.adScheduleRepository.save(schedule);
  }

  async update(id: number, data: Partial<AdSchedule>): Promise<AdSchedule> {
    const schedule = await this.findOne(id);
    const hasConflict = await this.checkConflict(
      data.adSpaceId || schedule.adSpaceId,
      data.startTime || schedule.startTime,
      data.endTime || schedule.endTime,
      id,
    );

    if (hasConflict) {
      throw new BadRequestException('该广告位在所选时间段内已有排期，请选择其他时间');
    }

    await this.adScheduleRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.adScheduleRepository.delete(id);
  }

  async getCurrentSchedules(adSpaceCode?: string): Promise<AdSchedule[]> {
    const now = new Date();
    const query = this.adScheduleRepository
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.adSpace', 'adSpace')
      .leftJoinAndSelect('schedule.material', 'material')
      .where('schedule.status = 1')
      .andWhere('schedule.start_time <= :now', { now })
      .andWhere('schedule.end_time >= :now', { now })
      .orderBy('schedule.priority', 'DESC');

    if (adSpaceCode) {
      query.andWhere('adSpace.code = :adSpaceCode', { adSpaceCode });
    }

    return query.getMany();
  }

  async recordImpression(scheduleId: number): Promise<void> {
    await this.redisService.incrImpression(scheduleId);
  }

  async recordClick(scheduleId: number): Promise<void> {
    await this.redisService.incrClick(scheduleId);
  }
}
