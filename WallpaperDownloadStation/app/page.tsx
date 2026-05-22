'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import WallpaperCard from '@/components/WallpaperCard';
import CategoryNav from '@/components/CategoryNav';
import type { Wallpaper, Category } from '@/lib/types';

export default function Home() {
  const [featured, setFeatured] = useState<Wallpaper[]>([]);
  const [random, setRandom] = useState<Wallpaper[]>([]);
  const [latest, setLatest] = useState<Wallpaper[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, randomRes, latestRes, catRes] = await Promise.all([
          fetch('/api/recommend?type=featured&limit=8').then(r => r.json()),
          fetch('/api/recommend?type=random&limit=6').then(r => r.json()),
          fetch('/api/wallpapers?sort=latest&pageSize=12').then(r => r.json()),
          fetch('/api/categories').then(r => r.json()),
        ]);

        if (featuredRes.success) setFeatured(featuredRes.data);
        if (randomRes.success) setRandom(randomRes.data);
        if (latestRes.success) setLatest(latestRes.data);
        if (catRes.success) setCategories(catRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-64 bg-slate-200 rounded-2xl animate-pulse mb-8" />
        <div className="h-10 bg-slate-200 rounded-lg animate-pulse mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-40 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 p-8 md:p-12 mb-8">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            🖼️ 壁纸下载站
          </h1>
          <p className="text-white/90 text-lg mb-6 max-w-2xl">
            精选高清壁纸，支持 4K、2K、1080P 等多种分辨率下载，
            让你的桌面焕然一新
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/category"
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              浏览全部壁纸
            </Link>
            <Link
              href="/category/nature"
              className="px-6 py-3 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors backdrop-blur-sm"
            >
              🌄 自然风景
            </Link>
          </div>
        </div>
      </section>

      {/* Category Quick Access */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">📂 分类浏览</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {categories.slice(0, 10).map(cat => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="flex flex-col items-center p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <span className="text-3xl mb-2">{cat.icon}</span>
              <span className="text-sm font-medium text-slate-700">{cat.name}</span>
              {cat.count != null && (
                <span className="text-xs text-slate-400 mt-1">{cat.count} 张</span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Category Navigation */}
      <section className="mb-8">
        <CategoryNav />
      </section>

      {/* Featured Wallpapers */}
      {featured.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              ⭐ 精选壁纸
            </h2>
            <Link
              href="/category?sort=latest"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              查看更多 →
            </Link>
          </div>
          <div className="wallpaper-grid">
            {featured.map(wp => (
              <WallpaperCard key={wp.id} wallpaper={wp} />
            ))}
          </div>
        </section>
      )}

      {/* Random Recommendations */}
      {random.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              🎲 随机推荐
            </h2>
            <button
              onClick={() => {
                fetch('/api/recommend?type=random&limit=6')
                  .then(r => r.json())
                  .then(data => {
                    if (data.success) setRandom(data.data);
                  });
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              🔄 换一批
            </button>
          </div>
          <div className="wallpaper-grid">
            {random.map(wp => (
              <WallpaperCard key={wp.id} wallpaper={wp} />
            ))}
          </div>
        </section>
      )}

      {/* Latest Wallpapers */}
      {latest.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              🆕 最新上传
            </h2>
            <Link
              href="/category"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              查看全部 →
            </Link>
          </div>
          <div className="wallpaper-grid">
            {latest.map(wp => (
              <WallpaperCard key={wp.id} wallpaper={wp} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
