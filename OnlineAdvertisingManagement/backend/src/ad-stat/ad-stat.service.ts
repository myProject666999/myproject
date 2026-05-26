import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AdStat } from '../entities/ad-stat.entity';

@Injectable()
export class AdStatService {
  constructor(
    @InjectRepository(AdStat)
    private adStatRepository: Repository<AdStat>,
  ) {}

  async findAll(startDate?: string, endDate?: string): Promise<AdStat[]> {
    const where: any = {};
    if (startDate && endDate) {
      where.statDate = Between(new Date(startDate), new Date(endDate));
    }
    return this.adStatRepository.find({ where, relations: ['schedule', 'adSpace', 'material'], order: { statDate: 'DESC' } });
  }

  async findBySchedule(scheduleId: number, startDate?: string, endDate?: string): Promise<AdStat[]> {
    const where: any = { scheduleId };
    if (startDate && endDate) {
      where.statDate = Between(new Date(startDate), new Date(endDate));
    }
    return this.adStatRepository.find({ where, order: { statDate: 'DESC' } });
  }

  async getSummary(startDate?: string, endDate?: string): Promise<any> {
    const query = this.adStatRepository
      .createQueryBuilder('stat')
      .select('SUM(stat.impressions)', 'totalImpressions')
      .addSelect('SUM(stat.clicks)', 'totalClicks')
      .addSelect('CASE WHEN SUM(stat.impressions) > 0 THEN SUM(stat.clicks) / SUM(stat.impressions) ELSE 0 END', 'avgCtr');

    if (startDate && endDate) {
      query.where('stat.stat_date BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    const result = await query.getRawOne();
    return {
      totalImpressions: parseInt(result.totalImpressions || '0'),
      totalClicks: parseInt(result.totalClicks || '0'),
      avgCtr: parseFloat(result.avgCtr || '0'),
    };
  }

  async upsertStat(data: Partial<AdStat>): Promise<AdStat> {
    const existing = await this.adStatRepository.findOne({
      where: { scheduleId: data.scheduleId, statDate: data.statDate },
    });

    if (existing) {
      existing.impressions = data.impressions;
      existing.clicks = data.clicks;
      existing.ctr = data.impressions > 0 ? data.clicks / data.impressions : 0;
      return this.adStatRepository.save(existing);
    } else {
      const stat = this.adStatRepository.create({
        ...data,
        ctr: data.impressions > 0 ? data.clicks / data.impressions : 0,
      });
      return this.adStatRepository.save(stat);
    }
  }
}
