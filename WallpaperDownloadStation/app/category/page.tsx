'use client';

import { useEffect, useState, useCallback } from 'react';
import WallpaperCard from '@/components/WallpaperCard';
import CategoryNav from '@/components/CategoryNav';
import ResolutionFilter from '@/components/ResolutionFilter';
import SortSelect from '@/components/SortSelect';
import Pagination from '@/components/Pagination';
import type { Wallpaper } from '@/lib/types';

export default function CategoryPage() {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [resolution, setResolution] = useState('');
  const [sort, setSort] = useState('latest');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchWallpapers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        sort,
      });
      if (resolution) params.set('resolution', resolution);
      if (search) params.set('search', search);

      const res = await fetch(`/api/wallpapers?${params}`);
      const data = await res.json();

      if (data.success) {
        setWallpapers(data.data);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch wallpapers:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, resolution, sort, search]);

  useEffect(() => {
    fetchWallpapers();
  }, [fetchWallpapers]);

  const handleResolutionChange = (newResolution: string) => {
    setResolution(newResolution);
    setPage(1);
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">📂 壁纸分类</h1>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="搜索壁纸..."
            className="w-full px-4 py-3 pl-10 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="mb-6">
        <CategoryNav />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-sm text-slate-500 mb-2">📐 按分辨率筛选</p>
          <ResolutionFilter
            selectedResolution={resolution}
            onResolutionChange={handleResolutionChange}
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">排序:</span>
          <SortSelect currentSort={sort} onSortChange={handleSortChange} />
        </div>
      </div>

      {/* Results Info */}
      <div className="mb-4">
        <p className="text-sm text-slate-600">
          共找到 <span className="font-semibold text-blue-600">{total}</span> 张壁纸
        </p>
      </div>

      {/* Wallpaper Grid */}
      {isLoading ? (
        <div className="wallpaper-grid">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="wallpaper-item">
              <div className="h-60 bg-slate-200 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      ) : wallpapers.length > 0 ? (
        <>
          <div className="wallpaper-grid">
            {wallpapers.map(wp => (
              <WallpaperCard key={wp.id} wallpaper={wp} />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <div className="text-center py-16">
          <span className="text-6xl mb-4 block">🔍</span>
          <p className="text-slate-500">没有找到相关壁纸</p>
          <button
            onClick={() => {
              setResolution('');
              setSearch('');
              setPage(1);
            }}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            清除筛选条件
          </button>
        </div>
      )}
    </div>
  );
}
