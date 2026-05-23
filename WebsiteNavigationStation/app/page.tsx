'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import type { Category, WebsiteWithCategory } from '@/lib/types';

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [websites, setWebsites] = useState<WebsiteWithCategory[]>([]);
  const [featuredWebsites, setFeaturedWebsites] = useState<WebsiteWithCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<WebsiteWithCategory[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showPrivate, setShowPrivate] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [catsRes, websRes, featuredRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/websites'),
        fetch('/api/websites?featured=true&limit=8'),
      ]);
      const [catsData, websData, featuredData] = await Promise.all([
        catsRes.json(),
        websRes.json(),
        featuredRes.json(),
      ]);
      setCategories(catsData);
      setWebsites(websData);
      setFeaturedWebsites(featuredData);
    } catch (error) {
      console.error('获取数据失败:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/websites?search=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSearchResults(data);
      setIsSearching(true);
    } catch (error) {
      console.error('搜索失败:', error);
    }
  }, [searchQuery]);

  const handleWebsiteClick = useCallback(async (websiteId: number, url: string) => {
    try {
      await fetch(`/api/websites/${websiteId}/view`, { method: 'POST' });
    } catch (error) {
      console.error('更新浏览量失败:', error);
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const filteredWebsites = websites.filter(
    (w) => (showPrivate ? true : w.is_private === 0)
  );

  const websitesByCategory = categories.map((cat) => ({
    category: cat,
    websites: filteredWebsites.filter((w) => w.category_id === cat.id),
  }));

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800">🌐 网址导航站</h1>
              <span className="text-sm text-gray-500">分类整理，轻松访问</span>
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

          <form onSubmit={handleSearch} className="mt-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索网站名称、URL或描述..."
                className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearching(false);
                    setSearchResults([]);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </form>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {isSearching ? (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              搜索结果 ({searchResults.length})
            </h2>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {searchResults.map((website) => (
                  <WebsiteCard
                    key={website.id}
                    website={website}
                    onClick={handleWebsiteClick}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                未找到相关网站
              </div>
            )}
          </div>
        ) : (
          <>
            {featuredWebsites.length > 0 && (
              <section className="mb-10">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span>🔥 热门推荐</span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                  {featuredWebsites.map((website) => (
                    <FeaturedCard
                      key={website.id}
                      website={website}
                      onClick={handleWebsiteClick}
                    />
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <span>📂 分类导航</span>
              </h2>
              <div className="space-y-8">
                {websitesByCategory.map(({ category, websites: catWebsites }) => (
                  <div key={category.id}>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">{category.icon}</span>
                      <h3 className="text-lg font-semibold text-gray-700">
                        {category.name}
                      </h3>
                      <span className="text-sm text-gray-400">({catWebsites.length})</span>
                      <Link
                        href={`/category/${category.id}`}
                        className="ml-auto text-sm text-primary-600 hover:text-primary-700"
                      >
                        查看更多 →
                      </Link>
                    </div>
                    {catWebsites.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {catWebsites.slice(0, 8).map((website) => (
                          <WebsiteCard
                            key={website.id}
                            website={website}
                            onClick={handleWebsiteClick}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-sm py-4">暂无网站</div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="border-t bg-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          © 2024 网址导航站 - 分类整理，轻松访问
        </div>
      </footer>
    </div>
  );
}

function WebsiteCard({
  website,
  onClick,
}: {
  website: WebsiteWithCategory;
  onClick: (id: number, url: string) => void;
}) {
  return (
    <div
      onClick={() => onClick(website.id, website.url)}
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
  );
}

function FeaturedCard({
  website,
  onClick,
}: {
  website: WebsiteWithCategory;
  onClick: (id: number, url: string) => void;
}) {
  return (
    <div
      onClick={() => onClick(website.id, website.url)}
      className="website-card bg-white rounded-xl p-3 cursor-pointer border border-gray-100 hover:border-orange-200 text-center"
    >
      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-2 overflow-hidden">
        {website.favicon_url ? (
          <img
            src={website.favicon_url}
            alt={website.name}
            className="w-8 h-8"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${new URL(website.url).hostname}&sz=64`;
            }}
          />
        ) : (
          <span className="text-2xl">🌐</span>
        )}
      </div>
      <h4 className="text-sm font-medium text-gray-800 truncate">{website.name}</h4>
    </div>
  );
}
