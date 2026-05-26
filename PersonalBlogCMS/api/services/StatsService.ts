import { ArticleRepository } from '../repositories/ArticleRepository';
import { CommentRepository } from '../repositories/CommentRepository';
import { VisitLogRepository } from '../repositories/VisitLogRepository';
import { redis, cacheKeys } from '../config/redis';
import type { StatsOverview, VisitTrendItem } from '../../shared/types';

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
      return {
        totalArticles: parseInt(cached.totalArticles || '0', 10),
        totalComments: parseInt(cached.totalComments || '0', 10),
        totalViews: parseInt(cached.totalViews || '0', 10),
        todayViews: parseInt(cached.todayViews || '0', 10),
        pendingComments: parseInt(cached.pendingComments || '0', 10),
      };
    }

    const [
      totalArticles,
      totalComments,
      pendingComments,
      todayViews,
    ] = await Promise.all([
      this.articleRepository.count({ status: 'published' } as any),
      this.commentRepository.count({ status: 'approved' } as any),
      this.commentRepository.count({ status: 'pending' } as any),
      this.visitLogRepository.countToday(),
    ]);

    const articles = await this.articleRepository.findAll({
      where: { status: 'published' } as any,
    });
    const totalViews = articles.reduce((sum, a) => sum + a.viewCount, 0);

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
    const CategoryRepository = (await import('../repositories/CategoryRepository')).CategoryRepository;
    const categoryRepo = new CategoryRepository();
    const categories = await categoryRepo.findAllWithCount();
    return categories.map((c) => ({
      name: c.name,
      value: c.articleCount,
    }));
  }
}
