export type SourceType = 'rss' | 'bilibili' | 'github' | 'blog';

export interface SourceConfig {
  feedUrl?: string;
  bilibiliUid?: string;
  githubUsername?: string;
  blogUrl?: string;
  blogSelector?: string;
}

export interface Source {
  id: string;
  name: string;
  type: SourceType;
  config: SourceConfig;
  enabled: boolean;
  lastFetchedAt?: string;
  itemCount: number;
  createdAt: string;
}

export interface FeedItem {
  id: string;
  sourceId: string;
  sourceType: SourceType;
  title: string;
  content: string;
  summary: string;
  url: string;
  author: string;
  authorUrl?: string;
  coverImage?: string;
  publishedAt: string;
  tags: string[];
  rawData: Record<string, any>;
  readLater: boolean;
  readAt?: string;
  fetchedAt: string;
}

export interface FeedQueryParams {
  sourceType?: SourceType[];
  search?: string;
  sortBy?: 'publishedAt_desc' | 'publishedAt_asc' | 'sourceType';
  page?: number;
  pageSize?: number;
  readLaterOnly?: boolean;
}

export interface FeedResponse {
  items: FeedItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
