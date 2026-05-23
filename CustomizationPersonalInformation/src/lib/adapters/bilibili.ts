import { FeedItem, SourceConfig } from '@/types';
import { normalizeItem, generateId } from '../normalizer';

const BILIBILI_API = 'https://api.bilibili.com/x/space/wbi/arc/search';

export async function fetchBilibiliItems(config: SourceConfig, sourceId: string, limit: number = 20): Promise<FeedItem[]> {
  if (!config.bilibiliUid) return [];

  try {
    const response = await fetch(
      `https://api.bilibili.com/x/space/arc/search?mid=${config.bilibiliUid}&ps=${limit}&pn=1`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    const data = await response.json();
    
    if (data.code !== 0 || !data.data?.list?.vlist) {
      return [];
    }

    const items: FeedItem[] = [];

    for (const video of data.data.list.vlist.slice(0, limit)) {
      const rawData: Record<string, any> = {
        id: video.bvid || generateId(),
        title: video.title,
        description: video.description || '',
        url: `https://www.bilibili.com/video/${video.bvid}`,
        author: video.author,
        authorUrl: `https://space.bilibili.com/${config.bilibiliUid}`,
        pubDate: new Date(video.created * 1000).toISOString(),
        categories: ['视频'],
        image: video.pic?.startsWith('//') ? `https:${video.pic}` : video.pic,
        duration: video.length,
        playCount: video.play
      };

      items.push(normalizeItem(sourceId, 'bilibili', rawData));
    }

    return items;
  } catch (error) {
    console.error('Bilibili fetch error:', error);
    return [];
  }
}

export async function testBilibiliConnection(config: SourceConfig): Promise<{ valid: boolean; message?: string }> {
  if (!config.bilibiliUid) {
    return { valid: false, message: '请填写 B 站 UID' };
  }

  try {
    const response = await fetch(
      `https://api.bilibili.com/x/space/acc/info?mid=${config.bilibiliUid}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    const data = await response.json();
    
    if (data.code === 0 && data.data) {
      return {
        valid: true,
        message: `成功连接到用户: ${data.data.name}`
      };
    }

    return {
      valid: false,
      message: data.message || '用户不存在'
    };
  } catch (error: any) {
    return {
      valid: false,
      message: `连接失败: ${error.message}`
    };
  }
}
