import { fetchItems, testConnection } from '../adapters';
import {
  getAllSources,
  getEnabledSources,
  getSourceById,
  createSource as repoCreateSource,
  updateSource as repoUpdateSource,
  deleteSource as repoDeleteSource,
  updateSourceStats,
  getFeedItems as repoGetFeedItems,
  insertFeedItems,
  toggleReadLater as repoToggleReadLater,
  getReadLaterItems as repoGetReadLaterItems
} from '../repositories/feedRepository';
import { Source, SourceType, SourceConfig, FeedQueryParams, FeedResponse, FeedItem } from '@/types';

export async function createSource(name: string, type: SourceType, config: SourceConfig): Promise<{ source: Source; previewItems: FeedItem[] }> {
  const source = repoCreateSource(name, type, config);
  
  const items = await fetchItems(type, config, source.id, 10);
  if (items.length > 0) {
    insertFeedItems(source.id, items);
    updateSourceStats(source.id, items.length);
  }

  return { source, previewItems: items };
}

export async function refreshSource(sourceId: string): Promise<FeedItem[]> {
  const source = getSourceById(sourceId);
  if (!source) return [];

  const items = await fetchItems(source.type, source.config, source.id, 20);
  if (items.length > 0) {
    insertFeedItems(source.id, items);
    updateSourceStats(source.id, items.length);
  }

  return items;
}

export async function refreshAllSources(): Promise<{ sourceId: string; count: number }[]> {
  const sources = getEnabledSources();
  const results: { sourceId: string; count: number }[] = [];

  for (const source of sources) {
    try {
      const items = await fetchItems(source.type, source.config, source.id, 20);
      if (items.length > 0) {
        insertFeedItems(source.id, items);
        updateSourceStats(source.id, items.length);
      }
      results.push({ sourceId: source.id, count: items.length });
    } catch (error) {
      console.error(`Failed to refresh source ${source.name}:`, error);
      results.push({ sourceId: source.id, count: 0 });
    }
  }

  return results;
}

export {
  getAllSources,
  getEnabledSources,
  getSourceById,
  repoUpdateSource as updateSource,
  repoDeleteSource as deleteSource,
  repoGetFeedItems as getFeedItems,
  repoToggleReadLater as toggleReadLater,
  repoGetReadLaterItems as getReadLaterItems,
  testConnection
};
