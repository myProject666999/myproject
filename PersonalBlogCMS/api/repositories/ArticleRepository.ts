import { BaseRepository } from './BaseRepository.js';
import { Article } from '../entities/Article.js';
import type { ArticleListQuery, PaginatedResult } from '../../shared/types';

export class ArticleRepository extends BaseRepository<Article> {
  constructor() {
    super(Article);
  }

  async findPublished(query: ArticleListQuery): Promise<PaginatedResult<Article>> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;

    const qb = this.repository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.category', 'category')
      .leftJoinAndSelect('article.tags', 'tag')
      .where('article.status = :status', { status: 'published' });

    if (query.categoryId) {
      qb.andWhere('article.category_id = :categoryId', { categoryId: query.categoryId });
    }

    if (query.tagId) {
      qb.innerJoin('article.tags', 'filter_tag', 'filter_tag.id = :tagId', { tagId: query.tagId });
    }

    if (query.keyword) {
      qb.innerJoin(
        'articles_fts',
        'fts',
        'fts.rowid = article.id AND articles_fts MATCH :keyword',
        { keyword: `*${query.keyword}*` }
      );
    }

    qb.orderBy('article.published_at', 'DESC');

    const [list, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findAllAdmin(query: ArticleListQuery): Promise<PaginatedResult<Article>> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;

    const qb = this.repository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.category', 'category')
      .leftJoinAndSelect('article.tags', 'tag');

    if (query.status) {
      qb.where('article.status = :status', { status: query.status });
    }

    if (query.keyword) {
      qb.andWhere('article.title LIKE :keyword', { keyword: `%${query.keyword}%` });
    }

    qb.orderBy('article.updated_at', 'DESC');

    const [list, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findDetailById(id: number): Promise<Article | null> {
    return this.repository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.category', 'category')
      .leftJoinAndSelect('article.tags', 'tag')
      .where('article.id = :id', { id })
      .andWhere('article.status = :status', { status: 'published' })
      .getOne();
  }

  async findHot(limit = 10): Promise<Article[]> {
    return this.repository
      .createQueryBuilder('article')
      .where('article.status = :status', { status: 'published' })
      .orderBy('article.view_count', 'DESC')
      .take(limit)
      .getMany();
  }

  async findAdjacent(id: number): Promise<{ prev: Article | null; next: Article | null }> {
    const current = await this.findById(id);
    if (!current) return { prev: null, next: null };

    const prev = await this.repository
      .createQueryBuilder('article')
      .where('article.status = :status', { status: 'published' })
      .andWhere('article.published_at > :publishedAt', { publishedAt: current.publishedAt })
      .orderBy('article.published_at', 'ASC')
      .take(1)
      .getOne();

    const next = await this.repository
      .createQueryBuilder('article')
      .where('article.status = :status', { status: 'published' })
      .andWhere('article.published_at < :publishedAt', { publishedAt: current.publishedAt })
      .orderBy('article.published_at', 'DESC')
      .take(1)
      .getOne();

    return { prev, next };
  }

  async incrementViewCount(id: number): Promise<void> {
    await this.repository.increment({ id }, 'viewCount', 1);
  }

  async getArchive(): Promise<{ year: number; month: number; count: number }[]> {
    const result = await this.repository
      .createQueryBuilder('article')
      .select("strftime('%Y', article.published_at) as year")
      .addSelect("strftime('%m', article.published_at) as month")
      .addSelect('COUNT(*) as count')
      .where('article.status = :status', { status: 'published' })
      .groupBy('year, month')
      .orderBy('year, month', 'DESC')
      .getRawMany();

    return result.map((r) => ({
      year: parseInt(r.year, 10),
      month: parseInt(r.month, 10),
      count: r.count,
    }));
  }
}
