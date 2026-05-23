'use client';

import { create } from 'zustand';
import { Source, SourceType, SourceConfig, ApiResponse } from '@/types';

interface SourceState {
  sources: Source[];
  loading: boolean;
  error: string | null;
  showForm: boolean;
  editingSource: Source | null;
  
  fetchSources: () => Promise<void>;
  createSource: (name: string, type: SourceType, config: SourceConfig) => Promise<boolean>;
  updateSource: (id: string, data: { name?: string; config?: SourceConfig; enabled?: boolean }) => Promise<void>;
  deleteSource: (id: string) => Promise<void>;
  testConnection: (type: SourceType, config: SourceConfig) => Promise<{ valid: boolean; message?: string }>;
  setShowForm: (show: boolean) => void;
  setEditingSource: (source: Source | null) => void;
}

export const useSourceStore = create<SourceState>((set, get) => ({
  sources: [],
  loading: false,
  error: null,
  showForm: false,
  editingSource: null,

  fetchSources: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/sources');
      const data: ApiResponse<Source[]> = await res.json();
      
      if (data.success && data.data) {
        set({ sources: data.data });
      } else {
        set({ error: data.error || '获取源列表失败' });
      }
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  createSource: async (name: string, type: SourceType, config: SourceConfig) => {
    try {
      const res = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, config })
      });
      const data = await res.json();
      
      if (data.success) {
        get().fetchSources();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  updateSource: async (id: string, data: { name?: string; config?: SourceConfig; enabled?: boolean }) => {
    try {
      const res = await fetch(`/api/sources/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      
      if (result.success) {
        get().fetchSources();
      }
    } catch (error) {
      console.error('更新源失败:', error);
    }
  },

  deleteSource: async (id: string) => {
    try {
      const res = await fetch(`/api/sources/${id}`, {
        method: 'DELETE'
      });
      const result = await res.json();
      
      if (result.success) {
        get().fetchSources();
      }
    } catch (error) {
      console.error('删除源失败:', error);
    }
  },

  testConnection: async (type: SourceType, config: SourceConfig) => {
    try {
      const res = await fetch('/api/sources/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, config })
      });
      const data = await res.json();
      
      if (data.success && data.data) {
        return data.data;
      }
      return { valid: false, message: '测试失败' };
    } catch {
      return { valid: false, message: '网络错误' };
    }
  },

  setShowForm: (show: boolean) => {
    set({ showForm: show, editingSource: null });
  },

  setEditingSource: (source: Source | null) => {
    set({ editingSource: source, showForm: source !== null });
  }
}));
