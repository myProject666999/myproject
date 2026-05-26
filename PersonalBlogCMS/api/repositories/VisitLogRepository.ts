import { BaseRepository } from './BaseRepository.js';
import { db } from '../config/database.js';

interface VisitLog {
  id: number;
  articleId?: number;
  ipAddress?: string;
  userAgent?: string;
  referer?: string;
  createdAt: Date;
}

export class VisitLogRepository extends BaseRepository<VisitLog> {
  constructor() {
    super('visit_logs');
  }

  protected rowToEntity(row: Record<string, unknown>): VisitLog {
    return {
      id: row.id as number,
      articleId: row.article_id as number | undefined,
      ipAddress: row.ip_address as string | undefined,
      userAgent: row.user_agent as string | undefined,
      referer: row.referer as string | undefined,
      createdAt: new Date(row.created_at as string),
    };
  }

  async countToday(): Promise<number> {
    const row = db
      .prepare(`SELECT COUNT(*) as cnt FROM ${this.tableName} WHERE created_at >= datetime('now','start of day')`)
      .get() as { cnt: number };
    return row?.cnt || 0;
  }

  async getTrend(days = 7): Promise<{ date: string; count: number }[]> {
    const modifier = `-${days - 1} days`;
    const sql = `SELECT DATE(created_at) as date, COUNT(*) as count FROM ${this.tableName} WHERE created_at >= datetime('now', ?) GROUP BY date ORDER BY date ASC`;
    const rows = db.prepare(sql).all(modifier) as { date: string; count: number }[];

    const dataMap = new Map<string, number>();
    rows.forEach((r) => dataMap.set(r.date, r.count));

    const trend: { date: string; count: number }[] = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      trend.push({
        date: dateStr,
        count: dataMap.get(dateStr) || 0,
      });
    }

    return trend;
  }
}