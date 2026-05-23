'use client';

import { SourceType, SourceConfig, Source } from '@/types';
import { useSourceStore } from '@/store/sourceStore';
import { Rss, Youtube, Github, FileText, X, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

const sourceTypeOptions: { type: SourceType; label: string; icon: any; description: string }[] = [
  { type: 'rss', label: 'RSS 订阅', icon: Rss, description: '通过 RSS 链接订阅博客和新闻' },
  { type: 'bilibili', label: 'B 站', icon: Youtube, description: '追踪 B 站 UP 主的视频动态' },
  { type: 'github', label: 'GitHub', icon: Github, description: '追踪 GitHub 用户的公开活动' },
  { type: 'blog', label: '博客', icon: FileText, description: '订阅自定义博客内容' }
];

interface TestResult {
  valid: boolean;
  message?: string;
}

export default function SourceForm() {
  const { showForm, editingSource, setShowForm, setEditingSource, createSource, updateSource, testConnection } = useSourceStore();
  
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState<SourceType>('rss');
  const [config, setConfig] = useState<SourceConfig>({});
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [testing, setTesting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingSource) {
      setName(editingSource.name);
      setSelectedType(editingSource.type);
      setConfig(editingSource.config);
    } else {
      resetForm();
    }
  }, [editingSource, showForm]);

  const resetForm = () => {
    setName('');
    setSelectedType('rss');
    setConfig({});
    setTestResult(null);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingSource(null);
    resetForm();
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    
    const result = await testConnection(selectedType, config);
    setTestResult(result);
    setTesting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    setSubmitting(true);
    
    try {
      if (editingSource) {
        await updateSource(editingSource.id, { name, config });
      } else {
        await createSource(name, selectedType, config);
      }
      handleClose();
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!showForm) return null;

  const renderConfigFields = () => {
    switch (selectedType) {
      case 'rss':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">RSS 源 URL</label>
            <input
              type="url"
              value={config.feedUrl || ''}
              onChange={(e) => setConfig({ ...config, feedUrl: e.target.value })}
              placeholder="https://example.com/feed.xml"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue focus:border-transparent"
            />
          </div>
        );

      case 'bilibili':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">B 站 UID</label>
            <input
              type="text"
              value={config.bilibiliUid || ''}
              onChange={(e) => setConfig({ ...config, bilibiliUid: e.target.value })}
              placeholder="12345678"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">在 B 站个人主页 URL 中可以找到 UID</p>
          </div>
        );

      case 'github':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GitHub 用户名</label>
            <input
              type="text"
              value={config.githubUsername || ''}
              onChange={(e) => setConfig({ ...config, githubUsername: e.target.value })}
              placeholder="octocat"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue focus:border-transparent"
            />
          </div>
        );

      case 'blog':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">博客 URL</label>
              <input
                type="url"
                value={config.blogUrl || ''}
                onChange={(e) => setConfig({ ...config, blogUrl: e.target.value })}
                placeholder="https://blog.example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">RSS 源 URL (可选)</label>
              <input
                type="url"
                value={config.feedUrl || ''}
                onChange={(e) => setConfig({ ...config, feedUrl: e.target.value })}
                placeholder="https://blog.example.com/feed.xml"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue focus:border-transparent"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-serif text-xl font-bold text-ink-dark">
            {editingSource ? '编辑信息源' : '添加信息源'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">源类型</label>
            <div className="grid grid-cols-2 gap-2">
              {sourceTypeOptions.map(({ type, label, icon: Icon, description }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setSelectedType(type);
                    setConfig({});
                    setTestResult(null);
                  }}
                  disabled={!!editingSource}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedType === type
                      ? 'border-deep-blue bg-deep-blue/5'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${editingSource ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <Icon className="w-4 h-4 text-deep-blue" />
                    <span className="font-medium text-sm">{label}</span>
                  </div>
                  <p className="text-xs text-gray-500">{description}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="给这个信息源起个名字"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue focus:border-transparent"
              required
            />
          </div>

          {renderConfigFields()}

          {testResult && (
            <div className={`p-3 rounded-lg flex items-center space-x-2 ${
              testResult.valid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {testResult.valid ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              <span className="text-sm">{testResult.message}</span>
            </div>
          )}

          <div className="flex items-center space-x-3 pt-2">
            {!editingSource && (
              <button
                type="button"
                onClick={handleTest}
                disabled={testing}
                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 flex items-center space-x-2"
              >
                {testing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                <span>测试连接</span>
              </button>
            )}
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="flex-1 px-4 py-2 text-sm text-white bg-deep-blue rounded-lg hover:bg-deep-blue-light disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              <span>{editingSource ? '保存修改' : '添加源'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
