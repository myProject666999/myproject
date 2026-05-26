import type { Request, Response } from 'express';
import { StatsService } from '../services/StatsService.js';
import { success, error } from '../utils/response.js';
import type { AuthRequest } from '../middleware/auth.js';

export class StatsController {
  private statsService: StatsService;

  constructor() {
    this.statsService = new StatsService();
  }

  async getOverview(req: AuthRequest, res: Response): Promise<void> {
    try {
      const stats = await this.statsService.getOverview();
      success(res, stats);
    } catch (err) {
      error(res, '获取统计数据失败', 500, 500);
    }
  }

  async getVisitTrend(req: AuthRequest, res: Response): Promise<void> {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const trend = await this.statsService.getVisitTrend(days);
      success(res, trend);
    } catch (err) {
      error(res, '获取访问趋势失败', 500, 500);
    }
  }

  async getPopularArticles(req: AuthRequest, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const articles = await this.statsService.getPopularArticles(limit);
      success(res, articles);
    } catch (err) {
      error(res, '获取热门文章失败', 500, 500);
    }
  }

  async getCategoryStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const stats = await this.statsService.getCategoryStats();
      success(res, stats);
    } catch (err) {
      error(res, '获取分类统计失败', 500, 500);
    }
  }
}
