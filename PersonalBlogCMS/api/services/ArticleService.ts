import { ArticleRepository } from '../repositories/ArticleRepository.js';
import { TagRepository } from '../repositories/TagRepository.js';
import { CategoryRepository } from '../repositories/CategoryRepository.js';
import { markdownToHtml } from '../utils/markdown.js';
import { redis, cacheKeys } from '../config/redis.js';
import type {
  Article,
  ArticleListQuery,
  PaginatedResult,
  CreateArticleRequest,
  UpdateArticleRequest,
  ArticleStatus,
} from '../../shared/types.js';

export class ArticleService {
  private articleRepository: ArticleRepository;
  private tagRepository: TagRepository;
  private categoryRepository: CategoryRepository;

  constructor() {
    this.articleRepository = new ArticleRepository();
    this.tagRepository = new TagRepository();
    this.categoryRepository = new CategoryRepository();
  }

  async getPublishedArticles(query: ArticleListQuery): Promise<PaginatedResult<Article>> {
    return this.articleRepository.findPublished(query);
  }

  async getAllArticles(query: ArticleListQuery): Promise<PaginatedResult<Article>> {
    return this.articleRepository.findAllAdmin(query);
  }

  async getArticleDetail(id: number): Promise<{
    article: Article | null;
    prev: Article | null;
    next: Article | null;
  }> {
    const cacheKey = cacheKeys.articleDetail(id);
    const cached = await redis.hgetall(cacheKey);

    if (cached && Object.keys(cached).length > 0) {
      const article = JSON.parse(cached.article) as Article;
      const prev = cached.prev ? JSON.parse(cached.prev) : null;
      const next = cached.next ? JSON.parse(cached.next) : null;
      return { article, prev, next };
    }

    const article = await this.articleRepository.findDetailById(id);
    if (!article) {
      return { article: null, prev: null, next: null };
    }

    const { prev, next } = await this.articleRepository.findAdjacent(id);

    const viewCacheKey = cacheKeys.articleView(id);
    const cachedViews = await redis.get(viewCacheKey);
    if (cachedViews) {
      article.viewCount = parseInt(cachedViews, 10);
    }

    await redis.hset(
      cacheKey,
      'article',
      JSON.stringify(article),
      'prev',
      prev ? JSON.stringify(prev) : '',
      'next',
      next ? JSON.stringify(next) : ''
    );
    await redis.expire(cacheKey, 600);

    return { article, prev, next };
  }

  async getAdminArticleDetail(id: number): Promise<Article | null> {
    return this.articleRepository.findDetailById(id, true);
  }

  async incrementViewCount(id: number, ip: string, userAgent: string, referer?: string): Promise<void> {
    const cacheKey = cacheKeys.articleView(id);
    const current = await redis.incr(cacheKey);

    if (current % 10 === 0) {
      this.articleRepository.incrementViewCount(id);
    }

    const { VisitLogRepository } = await import('../repositories/VisitLogRepository.js');
    const visitLogRepo = new VisitLogRepository();
    visitLogRepo.create({
      articleId: id,
      ipAddress: ip,
      userAgent,
      referer,
    });

    await redis.zincrby(cacheKeys.articleHot, 1, String(id));
    await redis.expire(cacheKeys.articleHot, 3600);
  }

  async getHotArticles(limit = 10): Promise<Article[]> {
    const cached = await redis.zrevrange(cacheKeys.articleHot, 0, limit - 1);
    if (cached && cached.length > 0) {
      const articles: Article[] = [];
      for (const id of cached) {
        const article = await this.articleRepository.findById(parseInt(id, 10));
        if (article && article.status === 'published') {
          articles.push(article);
        }
      }
      if (articles.length > 0) {
        return articles;
      }
    }

    return this.articleRepository.findHot(limit);
  }

  async createArticle(
    request: CreateArticleRequest,
    userId: number
  ): Promise<Article> {
    const contentHtml = markdownToHtml(request.contentMd || '');
    const tags = await this.tagRepository.findByIds(request.tagIds || []);

    const articleData = {
      title: request.title,
      summary: request.summary,
      contentMd: request.contentMd,
      contentHtml,
      coverImage: request.coverImage,
      categoryId: request.categoryId,
      userId,
      status: request.status,
      publishedAt: request.status === 'published' ? new Date() : undefined,
    };

    const article = await this.articleRepository.create(articleData);

    if (request.tagIds && request.tagIds.length > 0) {
      await this.articleRepository.setArticleTags(article.id, request.tagIds);
    }

    if (request.categoryId) {
      await this.categoryRepository.incrementArticleCount(request.categoryId);
    }
    if (tags.length > 0) {
      await this.tagRepository.updateArticleCountBatch(tags.map((t) => t.id));
    }

    await this.invalidateCache();
    return article;
  }

  async updateArticle(request: UpdateArticleRequest): Promise<Article | null> {
    const existing = await this.articleRepository.findById(request.id);
    if (!existing) return null;

    const oldCategoryId = existing.categoryId;
    const oldTagIds = existing.tags ? existing.tags.map((t) => t.id) : [];

    const contentHtml = request.contentMd
      ? markdownToHtml(request.contentMd)
      : existing.contentHtml;
    const tags = request.tagIds
      ? await this.tagRepository.findByIds(request.tagIds)
      : existing.tags;

    const updateData: Partial<Article> & Record<string, unknown> = {
      title: request.title || existing.title,
      summary: request.summary !== undefined ? request.summary : existing.summary,
      contentMd: request.contentMd || existing.contentMd,
      contentHtml,
      coverImage: request.coverImage !== undefined ? request.coverImage : existing.coverImage,
      categoryId: request.categoryId !== undefined ? request.categoryId : existing.categoryId,
      status: request.status || existing.status,
      publishedAt:
        request.status === 'published' && !existing.publishedAt
          ? new Date()
          : existing.publishedAt,
    };

    const article = await this.articleRepository.update(request.id, updateData);

    if (request.tagIds) {
      await this.articleRepository.setArticleTags(request.id, request.tagIds);
    }

    if (oldCategoryId !== updateData.categoryId) {
      if (oldCategoryId) {
        await this.categoryRepository.incrementArticleCount(oldCategoryId, -1);
      }
      if (updateData.categoryId) {
        await this.categoryRepository.incrementArticleCount(updateData.categoryId);
      }
    }

    const newTagIds = tags ? tags.map((t) => t.id) : [];
    const changedTagIds = [...new Set([...oldTagIds, ...newTagIds])];
    if (changedTagIds.length > 0) {
      await this.tagRepository.updateArticleCountBatch(changedTagIds);
    }

    await this.invalidateCache();
    return article;
  }

  async deleteArticle(id: number): Promise<boolean> {
    const article = await this.articleRepository.findById(id);
    if (!article) return false;

    const categoryId = article.categoryId;
    const tagIds = article.tags ? article.tags.map((t) => t.id) : [];

    const success = await this.articleRepository.delete(id);

    if (success && categoryId) {
      await this.categoryRepository.incrementArticleCount(categoryId, -1);
    }
    if (success && tagIds.length > 0) {
      await this.tagRepository.updateArticleCountBatch(tagIds);
    }

    await this.invalidateCache();
    return success;
  }

  async getArchive(): Promise<{ year: number; month: number; count: number }[]> {
    return this.articleRepository.getArchive();
  }

  async search(keyword: string, page = 1, pageSize = 10): Promise<PaginatedResult<Article>> {
    return this.articleRepository.findPublished({ keyword, page, pageSize });
  }

  private async invalidateCache(): Promise<void> {
    await redis.del(cacheKeys.articleHot);
    await redis.del(cacheKeys.categoryList);
    await redis.del(cacheKeys.tagCloud);
    await redis.del(cacheKeys.statsOverview);

    const keys = await redis.keys('article:detail:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}
