import { BaseRepository } from './BaseRepository.js';
import { VisitLog } from '../entities/VisitLog.js';
import dayjs from 'dayjs';

export class VisitLogRepository extends BaseRepository<VisitLog> {
  constructor() {
    super(VisitLog);
  }

  async countToday(): Promise<number> {
    const startOfDay = dayjs().startOf('day').toDate();
    return this.repository
      .createQueryBuilder('visit_log')
      .where('visit_log.created_at >= :startOfDay', { startOfDay })
      .getCount();
  }

  async getTrend(days = 7): Promise<{ date: string; count: number }[]> {
    const startDate = dayjs().subtract(days - 1, 'day').startOf('day').toDate();

    const result = await this.repository
      .createQueryBuilder('visit_log')
      .select("DATE(visit_log.created_at) as date")
      .addSelect('COUNT(*) as count')
      .where('visit_log.created_at >= :startDate', { startDate })
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();

    const dataMap = new Map<string, number>();
    result.forEach((r) => dataMap.set(r.date, r.count));

    const trend: { date: string; count: number }[] = [];
    for (let i = 0; i < days; i++) {
      const date = dayjs().subtract(days - 1 - i, 'day').format('YYYY-MM-DD');
      trend.push({
        date,
        count: dataMap.get(date) || 0,
      });
    }

    return trend;
  }
}
