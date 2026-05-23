import { FeedItem, SourceConfig } from '@/types';
import { normalizeItem, parseDate, stripHtml, generateId } from '../normalizer';
import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; PersonalInfoFlow/1.0)'
  }
});

export async function fetchRssItems(config: SourceConfig, sourceId: string, limit: number = 20): Promise<FeedItem[]> {
  if (!config.feedUrl) return [];

  try {
    const feed = await parser.parseURL(config.feedUrl);
    const items: FeedItem[] = [];

    for (const item of feed.items.slice(0, limit)) {
      const rawData: Record<string, any> = {
        id: item.guid || item.link || generateId(),
        title: item.title,
        content: item.content || item['content:encoded'] || item.description || '',
        description: item.description || item.contentSnippet || '',
        url: item.link,
        author: item.creator || item.author || '',
        pubDate: item.pubDate || item.isoDate,
        categories: item.categories || [],
        image: extractImage(item.content || item.description || '')
      };

      const normalized = normalizeItem(sourceId, 'rss', rawData);
      normalized.content = stripHtml(normalized.content);
      normalized.summary = stripHtml(normalized.summary).slice(0, 200);
      items.push(normalized);
    }

    return items;
  } catch (error) {
    console.error('RSS fetch error:', error);
    return [];
  }
}

function extractImage(html: string): string | undefined {
  const match = html.match(/<img[^>]+src="([^"]+)"/);
  return match ? match[1] : undefined;
}

export async function testRssConnection(config: SourceConfig): Promise<{ valid: boolean; message?: string }> {
  if (!config.feedUrl) {
    return { valid: false, message: '请填写 RSS 源 URL' };
  }

  try {
    const feed = await parser.parseURL(config.feedUrl);
    return {
      valid: true,
      message: `成功连接，共 ${feed.items.length} 条内容`
    };
  } catch (error: any) {
    return {
      valid: false,
      message: `连接失败: ${error.message}`
    };
  }
}
