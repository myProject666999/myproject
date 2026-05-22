'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import WallpaperCard from '@/components/WallpaperCard';
import type { Wallpaper, WallpaperSize } from '@/lib/types';
import { formatFileSize, formatDate, getAspectRatio } from '@/lib/utils';

export default function WallpaperDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string);

  const [wallpaper, setWallpaper] = useState<Wallpaper | null>(null);
  const [related, setRelated] = useState<Wallpaper[]>([]);
  const [selectedSize, setSelectedSize] = useState<WallpaperSize | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchWallpaper = async () => {
      try {
        const res = await fetch(`/api/wallpapers/${id}`);
        const data = await res.json();

        if (data.success) {
          setWallpaper(data.data);
          if (data.data.sizes && data.data.sizes.length > 0) {
            setSelectedSize(data.data.sizes[0]);
          }

          const favRes = await fetch(`/api/favorites/${id}`);
          const favData = await favRes.json();
          if (favData.success) {
            setIsFavorited(favData.data.is_favorited);
          }

          if (data.data.categories && data.data.categories.length > 0) {
            const catId = data.data.categories[0].id;
            const relatedRes = await fetch(
              `/api/wallpapers?categoryId=${catId}&sort=random&pageSize=6`
            );
            const relatedData = await relatedRes.json();
            if (relatedData.success) {
              setRelated(relatedData.data.filter((w: Wallpaper) => w.id !== id));
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch wallpaper:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWallpaper();
  }, [id]);

  const handleDownload = async () => {
    if (!selectedSize) return;

    setIsDownloading(true);
    try {
      const res = await fetch(
        `/api/download/${id}?resolution=${selectedSize.resolution_label}`
      );
      const data = await res.json();

      if (data.success) {
        const link = document.createElement('a');
        link.href = data.data.url;
        link.download = data.data.fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorited) {
        const res = await fetch(`/api/favorites/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          setIsFavorited(false);
        }
      } else {
        const res = await fetch(`/api/favorites/${id}`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          setIsFavorited(true);
        }
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-96 bg-slate-200 rounded-2xl mb-6" />
          <div className="h-8 bg-slate-200 rounded-lg w-1/3 mb-4" />
          <div className="h-4 bg-slate-200 rounded-lg w-2/3" />
        </div>
      </div>
    );
  }

  if (!wallpaper) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <span className="text-6xl mb-4 block">🔍</span>
          <p className="text-slate-500">壁纸不存在</p>
          <Link
            href="/"
            className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-blue-600">首页</Link>
        <span className="mx-2">/</span>
        <Link href="/category" className="hover:text-blue-600">分类</Link>
        {wallpaper.categories && wallpaper.categories.length > 0 && (
          <>
            <span className="mx-2">/</span>
            <Link
              href={`/category/${wallpaper.categories[0].slug}`}
              className="hover:text-blue-600"
            >
              {wallpaper.categories[0].name}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-slate-700">{wallpaper.title}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
            <div className="relative bg-slate-100">
              <img
                src={selectedSize?.url || wallpaper.original_url}
                alt={wallpaper.title}
                className="w-full h-auto"
                style={{ maxHeight: '600px', objectFit: 'contain' }}
              />
              {wallpaper.is_featured && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                  ⭐ 精选壁纸
                </div>
              )}
            </div>
          </div>

          {/* Wallpaper Info */}
          <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              {wallpaper.title}
            </h1>
            {wallpaper.description && (
              <p className="text-slate-600 mb-4">{wallpaper.description}</p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{wallpaper.views}</p>
                <p className="text-xs text-slate-500">浏览次数</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{wallpaper.downloads}</p>
                <p className="text-xs text-slate-500">下载次数</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{wallpaper.likes}</p>
                <p className="text-xs text-slate-500">收藏数</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {getAspectRatio(wallpaper.original_width, wallpaper.original_height)}
                </p>
                <p className="text-xs text-slate-500">宽高比</p>
              </div>
            </div>

            {/* Categories */}
            {wallpaper.categories && wallpaper.categories.length > 0 && (
              <div className="mb-6">
                <p className="text-sm text-slate-500 mb-2">📂 分类</p>
                <div className="flex flex-wrap gap-2">
                  {wallpaper.categories.map(cat => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 transition-colors"
                    >
                      {cat.icon} {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
              {wallpaper.author && (
                <span>作者: {wallpaper.author}</span>
              )}
              {wallpaper.source && (
                <span>来源: {wallpaper.source}</span>
              )}
              <span>上传时间: {formatDate(wallpaper.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Download Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              📥 下载壁纸
            </h3>

            {/* Size Selection */}
            {wallpaper.sizes && wallpaper.sizes.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-slate-500 mb-2">选择分辨率</p>
                <div className="grid grid-cols-2 gap-2">
                  {wallpaper.sizes.map(size => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedSize?.id === size.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {size.resolution_label}
                      <span className="block text-xs opacity-70">
                        {formatFileSize(size.file_size)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Size Info */}
            {selectedSize && (
              <div className="p-3 bg-slate-50 rounded-lg mb-4">
                <p className="text-sm">
                  <span className="text-slate-500">当前选择:</span>{' '}
                  <span className="font-semibold text-slate-800">
                    {selectedSize.width} × {selectedSize.height}
                  </span>
                </p>
                <p className="text-sm text-slate-500">
                  文件大小: {formatFileSize(selectedSize.file_size)}
                </p>
              </div>
            )}

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isDownloading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  下载中...
                </>
              ) : (
                <>
                  📥 下载壁纸
                </>
              )}
            </button>

            {/* Original Size */}
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = wallpaper.original_url;
                link.download = `${wallpaper.title}_original.${wallpaper.file_format}`;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                fetch(`/api/download/${id}`);
              }}
              className="w-full py-3 mt-3 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
            >
              下载原图 ({wallpaper.original_width}×{wallpaper.original_height})
            </button>
          </div>

          {/* Favorite Button */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <button
              onClick={toggleFavorite}
              className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                isFavorited
                  ? 'bg-rose-500 text-white hover:bg-rose-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isFavorited ? '❤️ 已收藏' : '🤍 收藏壁纸'}
            </button>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              <strong>💡 提示：</strong>
              选择适合您屏幕的分辨率下载，获得最佳显示效果。
              4K 分辨率适合大屏显示器，1080P 适合笔记本。
            </p>
          </div>
        </div>
      </div>

      {/* Related Wallpapers */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            🔗 相关壁纸
          </h2>
          <div className="wallpaper-grid">
            {related.map(wp => (
              <WallpaperCard key={wp.id} wallpaper={wp} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
