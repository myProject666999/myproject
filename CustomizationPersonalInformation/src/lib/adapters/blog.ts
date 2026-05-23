import { FeedItem, SourceConfig } from '@/types';
import { normalizeItem, parseDate, stripHtml, generateId } from '../normalizer';

export async function fetchBlogItems(config: SourceConfig, sourceId: string, limit: number = 20): Promise<FeedItem[]> {
  if (!config.blogUrl) return [];

  try {
    const response = await fetch(config.blogUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = await response.text();
    const items: FeedItem[] = [];

    if (config.feedUrl) {
      const Parser = require('rss-parser');
      const parser = new Parser({ timeout: 10000 });
      const feed = await parser.parseURL(config.feedUrl);

      for (const item of feed.items.slice(0, limit)) {
        const rawData: Record<string, any> = {
          id: item.guid || item.link || generateId(),
          title: item.title,
          content: item.content || item.description || '',
          description: item.description || item.contentSnippet || '',
          url: item.link,
          author: item.creator || item.author || '',
          pubDate: item.pubDate || item.isoDate,
          categories: item.categories || []
        };

        const normalized = normalizeItem(sourceId, 'blog', rawData);
        normalized.content = stripHtml(normalized.content);
        normalized.summary = stripHtml(normalized.summary).slice(0, 200);
        items.push(normalized);
      }
    } else {
      const rawData: Record<string, any> = {
        id: generateId(),
        title: extractMetaContent(html, 'og:title') || extractTitle(html) || config.blogUrl,
        description: extractMetaContent(html, 'og:description') || extractMetaContent(html, 'description') || '',
        url: config.blogUrl,
        author: extractMetaContent(html, 'author') || '',
        pubDate: new Date().toISOString(),
        image: extractMetaContent(html, 'og:image')
      };

      items.push(normalizeItem(sourceId, 'blog', rawData));
    }

    return items;
  } catch (error) {
    console.error('Blog fetch error:', error);
    return [];
  }
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : '';
}

function extractMetaContent(html: string, property: string): string | undefined {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`, 'i')
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }

  return undefined;
}

export async function testBlogConnection(config: SourceConfig): Promise<{ valid: boolean; message?: string }> {
  if (!config.blogUrl) {
    return { valid: false, message: '请填写博客 URL' };
  }

  try {
    const response = await fetch(config.blogUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (response.ok) {
      return {
        valid: true,
        message: '成功连接到博客'
      };
    }

    return {
      valid: false,
      message: `连接失败: HTTP ${response.status}`
    };
  } catch (error: any) {
    return {
      valid: false,
      message: `连接失败: ${error.message}`
    };
  }
}
