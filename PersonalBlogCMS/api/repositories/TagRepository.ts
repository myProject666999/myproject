import { db } from '../config/database.js';
import { BaseRepository } from './BaseRepository.js';
import type { Tag } from '../../shared/types.js';

export class TagRepository extends BaseRepository<Tag> {
  constructor() {
    super('tags');
  }

  protected rowToEntity(row: Record<string, unknown>): Tag {
    return {
      id: row.id as number,
      name: row.name as string,
      slug: row.slug as string,
      color: (row.color as string) ?? '#10b981',
      articleCount: (row.article_count as number) ?? 0,
      createdAt: new Date(row.created_at as string),
    };
  }

  async findAllWithCount(): Promise<Tag[]> {
    const rows = db.prepare('SELECT * FROM tags ORDER BY article_count DESC').all() as Record<string, unknown>[];
    return this.rowsToEntities(rows);
  }

  async findBySlug(slug: string): Promise<Tag | null> {
    const row = db.prepare('SELECT * FROM tags WHERE slug = ?').get(slug) as Record<string, unknown> | undefined;
    return row ? this.rowToEntity(row) : null;
  }

  async findByName(name: string): Promise<Tag | null> {
    const row = db.prepare('SELECT * FROM tags WHERE name = ?').get(name) as Record<string, unknown> | undefined;
    return row ? this.rowToEntity(row) : null;
  }

  async findByIds(ids: number[]): Promise<Tag[]> {
    if (!ids || ids.length === 0) return [];
    const placeholders = ids.map(() => '?').join(', ');
    const rows = db.prepare(`SELECT * FROM tags WHERE id IN (${placeholders})`).all(...ids) as Record<string, unknown>[];
    return this.rowsToEntities(rows);
  }

  async incrementArticleCount(id: number, delta = 1): Promise<void> {
    db.prepare(
      'UPDATE tags SET article_count = article_count + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(delta, id);
  }

  async updateArticleCountBatch(ids: number[]): Promise<void> {
    if (!ids || ids.length === 0) return;
    const countStmt = db.prepare(
      `SELECT COUNT(*) as cnt FROM article_tags at
       INNER JOIN articles a ON a.id = at.article_id
       WHERE at.tag_id = ? AND a.status = ?`
    );
    const updateStmt = db.prepare(
      'UPDATE tags SET article_count = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    );
    for (const id of ids) {
      const row = countStmt.get(id, 'published') as { cnt: number };
      const count = row?.cnt ?? 0;
      updateStmt.run(count, id);
    }
  }
}
