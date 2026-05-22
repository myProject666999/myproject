'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import WallpaperCard from '@/components/WallpaperCard';
import type { Wallpaper } from '@/lib/types';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Wallpaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await fetch('/api/favorites');
        const data = await res.json();
        if (data.success) {
          setFavorites(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="wallpaper-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="wallpaper-item">
              <div className="h-60 bg-slate-200 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        ❤️ 我的收藏
      </h1>

      {favorites.length > 0 ? (
        <div className="wallpaper-grid">
          {favorites.map(wp => (
            <WallpaperCard key={wp.id} wallpaper={wp} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <span className="text-6xl mb-4 block">💔</span>
          <p className="text-slate-500 mb-2">还没有收藏任何壁纸</p>
          <p className="text-slate-400 text-sm mb-6">浏览壁纸并点击收藏按钮</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            开始浏览
          </Link>
        </div>
      )}
    </div>
  );
}
