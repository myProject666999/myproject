'use client';

import { useState, useEffect } from 'react';
import {
  History,
  Trash2,
  Eye,
  RefreshCw,
  Copy,
  Check,
  FileJson,
  AlertCircle,
} from 'lucide-react';
import { HistoryItem } from '@/lib/types';

export default function HistoryPage() {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/history');
      if (response.ok) {
        const data = await response.json();
        setHistoryItems(data);
      }
    } catch (error) {
      console.error('获取历史记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条记录吗？')) return;

    try {
      setDeleting(id);
      const response = await fetch(`/api/history/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setHistoryItems((prev) => prev.filter((item) => item.id !== id));
        if (selectedItem?.id === id) {
          setSelectedItem(null);
        }
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败');
    } finally {
      setDeleting(null);
    }
  };

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRestore = (item: HistoryItem) => {
    sessionStorage.setItem('jsonContent', item.content);
    window.location.href = '/';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <History className="w-7 h-7 text-primary" />
          历史记录
        </h1>
        <button
          onClick={fetchHistory}
          className="btn btn-secondary text-sm"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : historyItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
          <AlertCircle className="w-16 h-16 mb-4 opacity-50" />
          <p className="text-lg">暂无历史记录</p>
          <p className="text-sm mt-2">在编辑器中保存JSON数据后，记录将显示在这里</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {historyItems.map((item) => (
              <div key={item.id} className="card group">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary truncate">
                      {item.title}
                    </h3>
                    <p className="text-sm text-text-secondary mt-1 font-mono truncate">
                      {truncateContent(item.content)}
                    </p>
                    <p className="text-xs text-text-secondary mt-2">
                      {formatDate(item.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="p-2 rounded-lg hover:bg-surface-light text-text-secondary hover:text-text-primary transition-colors"
                      title="查看详情"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCopy(item.content)}
                      className="p-2 rounded-lg hover:bg-surface-light text-text-secondary hover:text-text-primary transition-colors"
                      title="复制内容"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-lg hover:bg-danger/20 text-text-secondary hover:text-danger transition-colors disabled:opacity-50"
                      title="删除"
                      disabled={deleting === item.id}
                    >
                      {deleting === item.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-danger"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedItem && (
            <div className="card h-fit sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-text-primary flex items-center gap-2">
                  <FileJson className="w-5 h-5 text-primary" />
                  详情
                </h3>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-text-secondary hover:text-text-primary"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-text-secondary">标题</label>
                  <p className="text-text-primary font-medium mt-1">
                    {selectedItem.title}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-text-secondary">创建时间</label>
                  <p className="text-text-primary mt-1">
                    {formatDate(selectedItem.created_at)}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-text-secondary">内容</label>
                  <pre className="bg-surface-light rounded-lg p-4 mt-2 overflow-auto max-h-[300px] font-mono text-sm text-text-primary">
                    {selectedItem.content}
                  </pre>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleRestore(selectedItem)}
                    className="btn btn-primary flex-1"
                  >
                    恢复到编辑器
                  </button>
                  <button
                    onClick={() => handleCopy(selectedItem.content)}
                    className="btn btn-secondary"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        复制
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
