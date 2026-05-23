'use client';

import { Source, SourceType } from '@/types';
import { useSourceStore } from '@/store/sourceStore';
import { Rss, Youtube, Github, FileText, Pencil, Trash2, Power, PowerOff, RefreshCw } from 'lucide-react';
import { useState } from 'react';

const sourceTypeConfig: Record<SourceType, { label: string; icon: any; color: string; bgColor: string }> = {
  rss: { label: 'RSS', icon: Rss, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  bilibili: { label: 'B站', icon: Youtube, color: 'text-pink-600', bgColor: 'bg-pink-100' },
  github: { label: 'GitHub', icon: Github, color: 'text-gray-800', bgColor: 'bg-gray-100' },
  blog: { label: '博客', icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-100' }
};

function formatLastFetched(dateStr?: string): string {
  if (!dateStr) return '从未拉取';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN');
}

export default function SourceList() {
  const { sources, loading, updateSource, deleteSource, setEditingSource } = useSourceStore();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleToggleEnabled = (source: Source) => {
    updateSource(source.id, { enabled: !source.enabled });
  };

  const handleDelete = (id: string) => {
    deleteSource(id);
    setConfirmDelete(null);
  };

  if (loading && sources.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (sources.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Rss className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500">还没有配置任何信息源</p>
        <p className="text-sm text-gray-400 mt-1">点击上方按钮添加你的第一个信息源</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sources.map(source => {
        const config = sourceTypeConfig[source.type];
        const TypeIcon = config.icon;
        const isConfirming = confirmDelete === source.id;

        return (
          <div
            key={source.id}
            className={`bg-white rounded-xl border p-4 transition-all ${
              source.enabled ? 'border-gray-200' : 'border-gray-100 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                  <TypeIcon className={`w-5 h-5 ${config.color}`} />
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-ink-dark">{source.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded ${config.bgColor} ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                    <span>{source.itemCount} 条内容</span>
                    <span>上次拉取: {formatLastFetched(source.lastFetchedAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {isConfirming ? (
                  <>
                    <span className="text-xs text-red-500">确认删除?</span>
                    <button
                      onClick={() => handleDelete(source.id)}
                      className="px-3 py-1.5 text-xs text-white bg-red-500 rounded-md hover:bg-red-600"
                    >
                      删除
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="px-3 py-1.5 text-xs text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      取消
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleToggleEnabled(source)}
                      className={`p-2 rounded-lg transition-colors ${
                        source.enabled
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={source.enabled ? '禁用' : '启用'}
                    >
                      {source.enabled ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => setEditingSource(source)}
                      className="p-2 text-gray-500 hover:text-deep-blue hover:bg-gray-100 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setConfirmDelete(source.id)}
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
