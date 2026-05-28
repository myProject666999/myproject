import { db } from '../config/database.js';
import { BaseRepository } from './BaseRepository.js';
import type { Category } from '../../shared/types.js';

export class CategoryRepository extends BaseRepository<Category> {
  constructor() {
    super('categories');
  }

  protected rowToEntity(row: Record<string, unknown>): Category {
    return {
      id: row.id as number,
      name: row.name as string,
      slug: row.slug as string,
      description: row.description as string | undefined,
      articleCount: (row.article_count as number) ?? 0,
      createdAt: row.created_at as Date,
    };
  }

  async findAllWithCount(): Promise<Category[]> {
    const rows = db.prepare('SELECT * FROM categories ORDER BY article_count DESC').all() as Record<string, unknown>[];
    return this.rowsToEntities(rows);
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const row = db.prepare('SELECT * FROM categories WHERE slug = ?').get(slug) as Record<string, unknown> | undefined;
    return row ? this.rowToEntity(row) : null;
  }

  async findByName(name: string): Promise<Category | null> {
    const row = db.prepare('SELECT * FROM categories WHERE name = ?').get(name) as Record<string, unknown> | undefined;
    return row ? this.rowToEntity(row) : null;
  }

  async incrementArticleCount(id: number, delta = 1): Promise<void> {
    db.prepare('UPDATE categories SET article_count = article_count + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(delta, id);
  }
}