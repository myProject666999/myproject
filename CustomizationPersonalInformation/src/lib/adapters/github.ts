import { FeedItem, SourceConfig } from '@/types';
import { normalizeItem, generateId } from '../normalizer';

const GITHUB_API = 'https://api.github.com';

export async function fetchGithubItems(config: SourceConfig, sourceId: string, limit: number = 20): Promise<FeedItem[]> {
  if (!config.githubUsername) return [];

  try {
    const eventsResponse = await fetch(
      `${GITHUB_API}/users/${config.githubUsername}/events/public?per_page=${limit}`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'PersonalInfoFlow/1.0'
        }
      }
    );

    if (!eventsResponse.ok) {
      return [];
    }

    const events = await eventsResponse.json();
    const items: FeedItem[] = [];

    for (const event of events.slice(0, limit)) {
      const rawData = parseGithubEvent(event, config.githubUsername!);
      if (rawData) {
        items.push(normalizeItem(sourceId, 'github', rawData));
      }
    }

    return items;
  } catch (error) {
    console.error('GitHub fetch error:', error);
    return [];
  }
}

function parseGithubEvent(event: any, username: string): Record<string, any> | null {
  const baseData: Record<string, any> = {
    id: event.id || generateId(),
    url: `https://github.com/${event.repo?.name}`,
    author: username,
    authorUrl: `https://github.com/${username}`,
    pubDate: event.created_at,
    categories: [event.type],
    image: `https://github.com/${username}.png`
  };

  switch (event.type) {
    case 'PushEvent':
      const commits = event.payload?.commits || [];
      return {
        ...baseData,
        title: `推送 ${commits.length} 个提交到 ${event.repo.name}`,
        description: commits.slice(0, 3).map((c: any) => c.message).join('\n'),
        url: `https://github.com/${event.repo.name}`
      };

    case 'CreateEvent':
      return {
        ...baseData,
        title: `创建 ${event.payload.ref_type}: ${event.payload.ref || event.repo.name}`,
        description: event.payload.description || '',
        url: `https://github.com/${event.repo.name}`
      };

    case 'PullRequestEvent':
      return {
        ...baseData,
        title: `${event.payload.action === 'opened' ? '创建' : event.payload.action} PR: ${event.payload.pull_request?.title}`,
        description: event.payload.pull_request?.body || '',
        url: event.payload.pull_request?.html_url
      };

    case 'IssuesEvent':
      return {
        ...baseData,
        title: `${event.payload.action === 'opened' ? '创建' : event.payload.action} Issue: ${event.payload.issue?.title}`,
        description: event.payload.issue?.body || '',
        url: event.payload.issue?.html_url
      };

    case 'WatchEvent':
      return {
        ...baseData,
        title: `Starred: ${event.repo.name}`,
        description: '',
        url: `https://github.com/${event.repo.name}`
      };

    case 'ForkEvent':
      return {
        ...baseData,
        title: `Forked: ${event.repo.name}`,
        description: '',
        url: event.payload.forkee?.html_url
      };

    case 'ReleaseEvent':
      return {
        ...baseData,
        title: `发布: ${event.payload.release?.tag_name} - ${event.repo.name}`,
        description: event.payload.release?.body || '',
        url: event.payload.release?.html_url
      };

    default:
      return {
        ...baseData,
        title: `${event.type}: ${event.repo.name}`,
        description: ''
      };
  }
}

export async function testGithubConnection(config: SourceConfig): Promise<{ valid: boolean; message?: string }> {
  if (!config.githubUsername) {
    return { valid: false, message: '请填写 GitHub 用户名' };
  }

  try {
    const response = await fetch(
      `${GITHUB_API}/users/${config.githubUsername}`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'PersonalInfoFlow/1.0'
        }
      }
    );

    if (response.ok) {
      const user = await response.json();
      return {
        valid: true,
        message: `成功连接到用户: ${user.name || user.login}`
      };
    }

    return {
      valid: false,
      message: '用户不存在'
    };
  } catch (error: any) {
    return {
      valid: false,
      message: `连接失败: ${error.message}`
    };
  }
}
