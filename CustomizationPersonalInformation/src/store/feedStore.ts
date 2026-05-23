'use client';

import { create } from 'zustand';
import { FeedItem, FeedQueryParams, Source, FeedResponse, ApiResponse } from '@/types';

interface FeedState {
  items: FeedItem[];
  total: number;
  loading: boolean;
  error: string | null;
  queryParams: FeedQueryParams;
  
  setQueryParams: (params: Partial<FeedQueryParams>) => void;
  fetchItems: () => Promise<void>;
  toggleReadLater: (itemId: string, readLater: boolean) => Promise<void>;
}

export const useFeedStore = create<FeedState>((set, get) => ({
  items: [],
  total: 0,
  loading: false,
  error: null,
  queryParams: {
    sortBy: 'publishedAt_desc',
    page: 1,
    pageSize: 20
  },

  setQueryParams: (params) => {
    set(state => ({
      queryParams: { ...state.queryParams, ...params }
    }));
  },

  fetchItems: async () => {
    set({ loading: true, error: null });
    try {
      const { queryParams } = get();
      const params = new URLSearchParams();
      
      if (queryParams.sourceType?.length) {
        params.set('sourceType', queryParams.sourceType.join(','));
      }
      if (queryParams.search) {
        params.set('search', queryParams.search);
      }
      if (queryParams.sortBy) {
        params.set('sortBy', queryParams.sortBy);
      }
      if (queryParams.page) {
        params.set('page', queryParams.page.toString());
      }
      if (queryParams.pageSize) {
        params.set('pageSize', queryParams.pageSize.toString());
      }
      if (queryParams.readLaterOnly) {
        params.set('readLaterOnly', 'true');
      }

      const res = await fetch(`/api/feed?${params.toString()}`);
      const data: ApiResponse<FeedResponse> = await res.json();
      
      if (data.success && data.data) {
        set({ items: data.data.items, total: data.data.total });
      } else {
        set({ error: data.error || '获取数据失败' });
      }
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  toggleReadLater: async (itemId: string, readLater: boolean) => {
    try {
      await fetch('/api/read-later', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, readLater })
      });
      
      set(state => ({
        items: state.items.map(item =>
          item.id === itemId ? { ...item, readLater } : item
        )
      }));
    } catch (error) {
      console.error('更新稍后读失败:', error);
    }
  }
}));
