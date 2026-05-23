import { FeedItem, SourceType } from '@/types';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

export function normalizeItem(
  sourceId: string,
  sourceType: SourceType,
  raw: Record<string, any>
): FeedItem {
  const now = new Date().toISOString();
  
  return {
    id: raw.id || generateId(),
    sourceId,
    sourceType,
    title: raw.title || '无标题',
    content: raw.content || raw.description || '',
    summary: raw.summary || raw.description || (raw.content || '').slice(0, 200),
    url: raw.url || raw.link || '#',
    author: raw.author || raw.creator || '未知作者',
    authorUrl: raw.authorUrl,
    coverImage: raw.coverImage || raw.image || raw.thumbnail,
    publishedAt: raw.publishedAt || raw.pubDate || raw.created_at || now,
    tags: raw.tags || raw.categories || [],
    rawData: raw,
    readLater: false,
    fetchedAt: now
  };
}

export function parseDate(dateStr: string | undefined | null): string {
  if (!dateStr) return new Date().toISOString();
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}
