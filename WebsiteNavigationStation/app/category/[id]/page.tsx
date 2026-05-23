'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import type { Category, WebsiteWithCategory } from '@/lib/types';

export default function CategoryPage({ params }: { params: { id: string } }) {
  const [category, setCategory] = useState<Category | null>(null);
  const [websites, setWebsites] = useState<WebsiteWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPrivate, setShowPrivate] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [catRes, webRes] = await Promise.all([
        fetch('/api/categories'),
        fetch(`/api/websites?category=${params.id}`),
      ]);
      const [cats, webs] = await Promise.all([catRes.json(), webRes.json()]);
      const cat = cats.find((c: Category) => c.id === parseInt(params.id));
      setCategory(cat || null);
      setWebsites(webs);
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleWebsiteClick = useCallback(async (websiteId: number, url: string) => {
    try {
      await fetch(`/api/websites/${websiteId}/view`, { method: 'POST' });
    } catch (error) {
      console.error('更新浏览量失败:', error);
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const filteredWebsites = websites.filter((w) => {
    const matchesPrivate = showPrivate ? true : w.is_private === 0;
    const matchesSearch = searchQuery
      ? w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (w.description && w.description.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchesPrivate && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-gray-500 mb-4">分类不存在</div>
        <Link href="/" className="text-primary-600 hover:text-primary-700">
          返回首页
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                ← 返回
              </Link>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span>{category.icon}</span>
                {category.name}
              </h1>
              <span className="text-sm text-gray-500">({filteredWebsites.length} 个网站)</span>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPrivate}
                  onChange={(e) => setShowPrivate(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600">显示私人</span>
              </label>
              <Link
                href="/admin"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                管理后台
              </Link>
            </div>
          </div>

          <div className="mt-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="在当前分类中搜索..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {filteredWebsites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredWebsites.map((website) => (
              <div
                key={website.id}
                onClick={() => handleWebsiteClick(website.id, website.url)}
                className="website-card bg-white rounded-xl p-4 cursor-pointer border border-gray-100 hover:border-primary-200"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {website.favicon_url ? (
                      <img
                        src={website.favicon_url}
                        alt={website.name}
                        className="w-6 h-6"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${new URL(website.url).hostname}&sz=64`;
                        }}
                      />
                    ) : (
                      <span className="text-lg">🌐</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-800 truncate">{website.name}</h4>
                      {website.is_private === 1 && (
                        <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">
                          私人
                        </span>
                      )}
                      {website.is_featured === 1 && (
                        <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">
                          热门
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-0.5">{website.url}</p>
                    {website.description && (
                      <p className="text-xs text-gray-400 truncate mt-1">{website.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>👁 {website.view_count}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            {searchQuery ? '未找到匹配的网站' : '该分类下暂无网站'}
          </div>
        )}
      </main>
    </div>
  );
}
