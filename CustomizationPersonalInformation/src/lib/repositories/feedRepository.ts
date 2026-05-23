import { getDb } from '../db';
import { Source, SourceType, SourceConfig, FeedQueryParams, FeedResponse, FeedItem } from '@/types';
import { generateId } from '../normalizer';

export function getAllSources(): Source[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM sources ORDER BY created_at DESC').all() as any[];
  return rows.map(row => mapSource(row));
}

export function getEnabledSources(): Source[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM sources WHERE enabled = 1 ORDER BY created_at DESC').all() as any[];
  return rows.map(row => mapSource(row));
}

export function getSourceById(id: string): Source | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM sources WHERE id = ?').get(id) as any;
  return row ? mapSource(row) : null;
}

export function createSource(name: string, type: SourceType, config: SourceConfig): Source {
  const db = getDb();
  const id = generateId();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO sources (id, name, type, config, enabled, last_fetched_at, item_count, created_at)
    VALUES (?, ?, ?, ?, 1, ?, 0, ?)
  `).run(id, name, type, JSON.stringify(config), null, now);

  return getSourceById(id)!;
}

export function updateSource(id: string, data: { name?: string; config?: SourceConfig; enabled?: boolean }): Source | null {
  const db = getDb();
  const source = getSourceById(id);
  if (!source) return null;

  const updatedName = data.name || source.name;
  const updatedConfig = data.config ? JSON.stringify(data.config) : JSON.stringify(source.config);
  const updatedEnabled = data.enabled !== undefined ? (data.enabled ? 1 : 0) : (source.enabled ? 1 : 0);

  db.prepare(`
    UPDATE sources SET name = ?, config = ?, enabled = ? WHERE id = ?
  `).run(updatedName, updatedConfig, updatedEnabled, id);

  return getSourceById(id);
}

export function deleteSource(id: string): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM sources WHERE id = ?').run(id);
  return result.changes > 0;
}

export function updateSourceStats(sourceId: string, itemCount: number): void {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare('UPDATE sources SET last_fetched_at = ?, item_count = ? WHERE id = ?')
    .run(now, itemCount, sourceId);
}

function mapSource(row: any): Source {
  return {
    id: row.id,
    name: row.name,
    type: row.type as SourceType,
    config: JSON.parse(row.config || '{}'),
    enabled: row.enabled === 1,
    lastFetchedAt: row.last_fetched_at,
    itemCount: row.item_count,
    createdAt: row.created_at
  };
}

export function getFeedItems(params: FeedQueryParams): FeedResponse {
  const db = getDb();
  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const offset = (page - 1) * pageSize;

  const conditions: string[] = [];
  const queryParams: any[] = [];

  if (params.sourceType && params.sourceType.length > 0) {
    conditions.push(`source_type IN (${params.sourceType.map(() => '?').join(',')})`);
    queryParams.push(...params.sourceType);
  }

  if (params.search) {
    conditions.push('(title LIKE ? OR summary LIKE ? OR content LIKE ?)');
    const searchTerm = `%${params.search}%`;
    queryParams.push(searchTerm, searchTerm, searchTerm);
  }

  if (params.readLaterOnly) {
    conditions.push('read_later = 1');
    queryParams.push(1);
  }

  const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

  let orderBy = 'published_at DESC';
  if (params.sortBy === 'publishedAt_asc') {
    orderBy = 'published_at ASC';
  } else if (params.sortBy === 'sourceType') {
    orderBy = 'source_type, published_at DESC';
  }

  const countRow = db.prepare(
    `SELECT COUNT(*) as total FROM feed_items ${whereClause}`
  ).get(...queryParams) as { total: number };

  const items = db.prepare(
    `SELECT * FROM feed_items ${whereClause} ORDER BY ${orderBy} LIMIT ? OFFSET ?`
  ).all(...queryParams, pageSize, offset) as any[];

  return {
    items: items.map(mapFeedItem),
    total: countRow.total,
    page,
    pageSize
  };
}

export function insertFeedItems(sourceId: string, items: FeedItem[]): number {
  const db = getDb();
  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO feed_items 
    (id, source_id, source_type, title, content, summary, url, author, author_url, 
     cover_image, published_at, tags, raw_data, read_later, read_at, fetched_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction((items: FeedItem[]) => {
    for (const item of items) {
      insertStmt.run(
        item.id,
        item.sourceId,
        item.sourceType,
        item.title,
        item.content,
        item.summary,
        item.url,
        item.author,
        item.authorUrl || null,
        item.coverImage || null,
        item.publishedAt,
        JSON.stringify(item.tags),
        JSON.stringify(item.rawData),
        item.readLater ? 1 : 0,
        item.readAt || null,
        item.fetchedAt
      );
    }
    return items.length;
  });

  return transaction(items);
}

export function toggleReadLater(itemId: string, readLater: boolean): void {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare('UPDATE feed_items SET read_later = ?, read_at = ? WHERE id = ?')
    .run(readLater ? 1 : 0, readLater ? now : null, itemId);
}

export function getReadLaterItems(): FeedItem[] {
  const db = getDb();
  const rows = db.prepare(
    'SELECT * FROM feed_items WHERE read_later = 1 ORDER BY read_at DESC'
  ).all() as any[];
  return rows.map(mapFeedItem);
}

function mapFeedItem(row: any): FeedItem {
  return {
    id: row.id,
    sourceId: row.source_id,
    sourceType: row.source_type as FeedItem['sourceType'],
    title: row.title,
    content: row.content,
    summary: row.summary,
    url: row.url,
    author: row.author,
    authorUrl: row.author_url,
    coverImage: row.cover_image,
    publishedAt: row.published_at,
    tags: JSON.parse(row.tags || '[]'),
    rawData: JSON.parse(row.raw_data || '{}'),
    readLater: row.read_later === 1,
    readAt: row.read_at,
    fetchedAt: row.fetched_at
  };
}
