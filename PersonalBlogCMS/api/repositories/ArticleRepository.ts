import { BaseRepository } from './BaseRepository.js';
import { db } from '../config/database.js';
import type { Article, Tag, Category, ArticleListQuery, PaginatedResult } from '../../shared/types.js';

export class ArticleRepository extends BaseRepository<Article> {
  constructor() {
    super('articles');
  }

  protected override rowToEntity(row: Record<string, unknown>): Article {
    return {
      id: row.id as number,
      title: row.title as string,
      summary: (row.summary as string) ?? '',
      contentMd: (row.content_md as string) ?? '',
      contentHtml: (row.content_html as string) ?? '',
      coverImage: row.cover_image as string | undefined,
      categoryId: row.category_id as number | undefined,
      status: row.status as 'draft' | 'published',
      viewCount: (row.view_count as number) ?? 0,
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
      publishedAt: row.published_at ? new Date(row.published_at as string) : undefined,
      tags: [],
    };
  }

  private enrichArticles(articles: Article[]): Article[] {
    if (articles.length === 0) return articles;

    const ids = articles.map(a => a.id);
    const placeholders = ids.map(() => '?').join(',');

    const tagRows = db.prepare(`
      SELECT at.article_id, t.* FROM article_tags at
      JOIN tags t ON at.tag_id = t.id
      WHERE at.article_id IN (${placeholders})
    `).all(...ids) as Record<string, unknown>[];

    const tagMap = new Map<number, Tag[]>();
    for (const row of tagRows) {
      const articleId = row.article_id as number;
      if (!tagMap.has(articleId)) tagMap.set(articleId, []);
      tagMap.get(articleId)!.push({
        id: row.id as number,
        name: row.name as string,
        slug: row.slug as string,
        color: (row.color as string) ?? '#10b981',
        articleCount: (row.article_count as number) ?? 0,
        createdAt: new Date(row.created_at as string),
      });
    }

    const categoryIds = [...new Set(articles.map(a => a.categoryId).filter(Boolean))] as number[];
    if (categoryIds.length > 0) {
      const catPlaceholders = categoryIds.map(() => '?').join(',');
      const catRows = db.prepare(`SELECT * FROM categories WHERE id IN (${catPlaceholders})`).all(...categoryIds) as Record<string, unknown>[];
      const categoryMap = new Map<number, Category>();
      for (const row of catRows) {
        categoryMap.set(row.id as number, {
          id: row.id as number,
          name: row.name as string,
          slug: row.slug as string,
          description: row.description as string | undefined,
          articleCount: (row.article_count as number) ?? 0,
          createdAt: new Date(row.created_at as string),
        });
      }
      for (const article of articles) {
        if (article.categoryId && categoryMap.has(article.categoryId)) {
          article.category = categoryMap.get(article.categoryId);
        }
      }
    }

    for (const article of articles) {
      article.tags = tagMap.get(article.id) ?? [];
    }

    return articles;
  }

  async findPublished(query: ArticleListQuery): Promise<PaginatedResult<Article>> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;

    const conditions: string[] = ['a.status = ?'];
    const params: unknown[] = ['published'];

    if (query.categoryId !== undefined) {
      conditions.push('a.category_id = ?');
      params.push(query.categoryId);
    }

    if (query.tagId !== undefined) {
      conditions.push('EXISTS (SELECT 1 FROM article_tags at WHERE at.article_id = a.id AND at.tag_id = ?)');
      params.push(query.tagId);
    }

    if (query.keyword) {
      conditions.push('EXISTS (SELECT 1 FROM articles_fts fts WHERE fts.rowid = a.id AND articles_fts MATCH ?)');
      params.push(`*${query.keyword}*`);
    }

    const whereClause = conditions.join(' AND ');

    const total = (db.prepare(`SELECT COUNT(*) as cnt FROM articles a WHERE ${whereClause}`).get(...params) as { cnt: number }).cnt;

    const sql = `SELECT a.* FROM articles a WHERE ${whereClause} ORDER BY a.published_at DESC LIMIT ? OFFSET ?`;
    const rows = db.prepare(sql).all(...params, pageSize, (page - 1) * pageSize) as Record<string, unknown>[];
    const articles = this.rowsToEntities(rows);
    const enriched = this.enrichArticles(articles);

    return {
      list: enriched,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findAllAdmin(query: ArticleListQuery): Promise<PaginatedResult<Article>> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (query.status) {
      conditions.push('status = ?');
      params.push(query.status);
    }

    if (query.keyword) {
      conditions.push('title LIKE ?');
      params.push(`%${query.keyword}%`);
    }

    const whereClause = conditions.length > 0 ? conditions.join(' AND ') : '1=1';

    const total = (db.prepare(`SELECT COUNT(*) as cnt FROM articles WHERE ${whereClause}`).get(...params) as { cnt: number }).cnt;

    const sql = `SELECT * FROM articles WHERE ${whereClause} ORDER BY updated_at DESC LIMIT ? OFFSET ?`;
    const rows = db.prepare(sql).all(...params, pageSize, (page - 1) * pageSize) as Record<string, unknown>[];
    const articles = this.rowsToEntities(rows);
    const enriched = this.enrichArticles(articles);

    return {
      list: enriched,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findDetailById(id: number, includeDrafts = false): Promise<Article | null> {
    const statusFilter = includeDrafts ? '' : 'AND a.status = \'published\'';
    const row = db.prepare(`
      SELECT a.*, c.id AS cat_id, c.name AS cat_name, c.slug AS cat_slug,
             c.description AS cat_description, c.article_count AS cat_article_count,
             c.created_at AS cat_created_at
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.id = ? ${statusFilter}
    `).get(id) as Record<string, unknown> | undefined;

    if (!row) return null;

    const article = this.rowToEntity(row);

    if (row.cat_id) {
      article.category = {
        id: row.cat_id as number,
        name: row.cat_name as string,
        slug: row.cat_slug as string,
        description: row.cat_description as string | undefined,
        articleCount: (row.cat_article_count as number) ?? 0,
        createdAt: new Date(row.cat_created_at as string),
      };
    }

    const tagRows = db.prepare(`
      SELECT t.* FROM article_tags at
      JOIN tags t ON at.tag_id = t.id
      WHERE at.article_id = ?
    `).all(id) as Record<string, unknown>[];

    article.tags = tagRows.map(r => ({
      id: r.id as number,
      name: r.name as string,
      slug: r.slug as string,
      color: (r.color as string) ?? '#10b981',
      articleCount: (r.article_count as number) ?? 0,
      createdAt: new Date(r.created_at as string),
    }));

    return article;
  }

  async findHot(limit = 10): Promise<Article[]> {
    const rows = db.prepare(
      'SELECT * FROM articles WHERE status = ? ORDER BY view_count DESC LIMIT ?'
    ).all('published', limit) as Record<string, unknown>[];
    return this.rowsToEntities(rows);
  }

  async findAdjacent(id: number): Promise<{ prev: Article | null; next: Article | null }> {
    const current = await this.findById(id);
    if (!current) return { prev: null, next: null };

    const publishedAtStr = current.publishedAt
      ? current.publishedAt.toISOString().replace('T', ' ').slice(0, 19)
      : '';

    const prevRow = db.prepare(`
      SELECT * FROM articles WHERE status = 'published' AND published_at < ? AND id != ?
      ORDER BY published_at DESC LIMIT 1
    `).get(publishedAtStr, id) as Record<string, unknown> | undefined;

    const nextRow = db.prepare(`
      SELECT * FROM articles WHERE status = 'published' AND published_at > ? AND id != ?
      ORDER BY published_at ASC LIMIT 1
    `).get(publishedAtStr, id) as Record<string, unknown> | undefined;

    return {
      prev: prevRow ? this.rowToEntity(prevRow) : null,
      next: nextRow ? this.rowToEntity(nextRow) : null,
    };
  }

  async incrementViewCount(id: number): Promise<void> {
    db.prepare('UPDATE articles SET view_count = view_count + 1 WHERE id = ?').run(id);
  }

  async getArchive(): Promise<{ year: number; month: number; count: number }[]> {
    const rows = db.prepare(`
      SELECT strftime('%Y', published_at) AS year, strftime('%m', published_at) AS month, COUNT(*) AS count
      FROM articles
      WHERE status = 'published'
      GROUP BY year, month
      ORDER BY year DESC, month DESC
    `).all() as Record<string, unknown>[];

    return rows.map(r => ({
      year: parseInt(r.year as string, 10),
      month: parseInt(r.month as string, 10),
      count: r.count as number,
    }));
  }

  async setArticleTags(articleId: number, tagIds: number[]): Promise<void> {
    const deleteStmt = db.prepare('DELETE FROM article_tags WHERE article_id = ?');
    const insertStmt = db.prepare('INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)');

    const transaction = db.transaction((articleId: number, tagIds: number[]) => {
      deleteStmt.run(articleId);
      for (const tagId of tagIds) {
        insertStmt.run(articleId, tagId);
      }
    });

    transaction(articleId, tagIds);
  }
}