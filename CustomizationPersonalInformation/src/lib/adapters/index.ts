import { FeedItem, SourceConfig, SourceType } from '@/types';
import { fetchRssItems, testRssConnection } from './rss';
import { fetchBilibiliItems, testBilibiliConnection } from './bilibili';
import { fetchGithubItems, testGithubConnection } from './github';
import { fetchBlogItems, testBlogConnection } from './blog';

export async function fetchItems(
  type: SourceType,
  config: SourceConfig,
  sourceId: string,
  limit: number = 20
): Promise<FeedItem[]> {
  switch (type) {
    case 'rss':
      return fetchRssItems(config, sourceId, limit);
    case 'bilibili':
      return fetchBilibiliItems(config, sourceId, limit);
    case 'github':
      return fetchGithubItems(config, sourceId, limit);
    case 'blog':
      return fetchBlogItems(config, sourceId, limit);
    default:
      return [];
  }
}

export async function testConnection(
  type: SourceType,
  config: SourceConfig
): Promise<{ valid: boolean; message?: string }> {
  switch (type) {
    case 'rss':
      return testRssConnection(config);
    case 'bilibili':
      return testBilibiliConnection(config);
    case 'github':
      return testGithubConnection(config);
    case 'blog':
      return testBlogConnection(config);
    default:
      return { valid: false, message: '未知的源类型' };
  }
}
