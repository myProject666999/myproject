import { ArticleRepository } from '../repositories/ArticleRepository.js';
import { CommentRepository } from '../repositories/CommentRepository.js';
import { VisitLogRepository } from '../repositories/VisitLogRepository.js';
import { redis, cacheKeys } from '../config/redis.js';
import type { StatsOverview, VisitTrendItem } from '../../shared/types.js';

export class StatsService {
  private articleRepository: ArticleRepository;
  private commentRepository: CommentRepository;
  private visitLogRepository: VisitLogRepository;

  constructor() {
    this.articleRepository = new ArticleRepository();
    this.commentRepository = new CommentRepository();
    this.visitLogRepository = new VisitLogRepository();
  }

  async getOverview(): Promise<StatsOverview> {
    const cached = await redis.hgetall(cacheKeys.statsOverview);
    if (cached && Object.keys(cached).length > 0) {
      try {
        return {
          totalArticles: parseInt(cached.totalArticles || '0', 10),
          totalComments: parseInt(cached.totalComments || '0', 10),
          totalViews: parseInt(cached.totalViews || '0', 10),
          todayViews: parseInt(cached.todayViews || '0', 10),
          pendingComments: parseInt(cached.pendingComments || '0', 10),
        };
      } catch {
        // 缓存数据损坏，忽略缓存
      }
    }

    const [
      totalArticles,
      totalComments,
      pendingComments,
      todayViews,
    ] = await Promise.all([
      this.articleRepository.count('status = ?', ['published']),
      this.commentRepository.count('status = ?', ['approved']),
      this.commentRepository.count('status = ?', ['pending']),
      this.visitLogRepository.countToday(),
    ]);

    const articles = await this.articleRepository.findAll('status = ?', ['published']);
    const totalViews = articles.reduce((sum, a) => sum + (a.viewCount || 0), 0);

    const result: StatsOverview = {
      totalArticles,
      totalComments,
      totalViews,
      todayViews,
      pendingComments,
    };

    await redis.hset(
      cacheKeys.statsOverview,
      'totalArticles',
      result.totalArticles.toString(),
      'totalComments',
      result.totalComments.toString(),
      'totalViews',
      result.totalViews.toString(),
      'todayViews',
      result.todayViews.toString(),
      'pendingComments',
      result.pendingComments.toString()
    );
    await redis.expire(cacheKeys.statsOverview, 300);

    return result;
  }

  async getVisitTrend(days = 7): Promise<VisitTrendItem[]> {
    return this.visitLogRepository.getTrend(days);
  }

  async getPopularArticles(limit = 5) {
    const articles = await this.articleRepository.findHot(limit);
    return articles.map((a) => ({
      id: a.id,
      title: a.title,
      viewCount: a.viewCount,
    }));
  }

  async getCategoryStats() {
    const { CategoryRepository } = await import('../repositories/CategoryRepository.js');
    const categoryRepo = new CategoryRepository();
    const categories = await categoryRepo.findAllWithCount();
    return categories.map((c) => ({
      name: c.name,
      value: c.articleCount,
    }));
  }
}
