'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import WallpaperCard from '@/components/WallpaperCard';
import CategoryNav from '@/components/CategoryNav';
import ResolutionFilter from '@/components/ResolutionFilter';
import SortSelect from '@/components/SortSelect';
import Pagination from '@/components/Pagination';
import type { Wallpaper, Category } from '@/lib/types';

export default function CategorySlugPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [resolution, setResolution] = useState('');
  const [sort, setSort] = useState('latest');
  const [isLoading, setIsLoading] = useState(true);
  const [categoryId, setCategoryId] = useState<number | null>(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await fetch(`/api/categories`);
        const data = await res.json();
        if (data.success) {
          const found = data.data.find((c: Category) => c.slug === slug);
          if (found) {
            setCategory(found);
            setCategoryId(found.id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch category:', error);
      }
    };

    fetchCategory();
  }, [slug]);

  const fetchWallpapers = useCallback(async () => {
    if (!categoryId) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        sort,
        categoryId: String(categoryId),
      });
      if (resolution) params.set('resolution', resolution);

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
  }, [categoryId, page, pageSize, resolution, sort]);

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

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <span className="text-6xl mb-4 block">🔍</span>
          <p className="text-slate-500">分类不存在</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Category Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">{category.icon}</span>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{category.name}</h1>
          {category.description && (
            <p className="text-slate-500 text-sm mt-1">{category.description}</p>
          )}
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
          <p className="text-slate-500">该分类下暂无壁纸</p>
        </div>
      )}
    </div>
  );
}
