'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Wallpaper } from '@/lib/types';
import { formatFileSize, formatDate } from '@/lib/utils';

interface WallpaperCardProps {
  wallpaper: Wallpaper;
}

export default function WallpaperCard({ wallpaper }: WallpaperCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  const aspectRatio = wallpaper.original_width / wallpaper.original_height;
  const height = 300 / aspectRatio;

  return (
    <div className="wallpaper-item group">
      <Link
        href={`/wallpaper/${wallpaper.id}`}
        className="block relative overflow-hidden rounded-xl bg-slate-200 shadow-md hover:shadow-xl transition-all duration-300"
        style={{ height: `${height}px` }}
      >
        {isLoading && !imgError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse">
            <span className="text-4xl">🖼️</span>
          </div>
        )}

        {!imgError ? (
          <img
            src={wallpaper.thumbnail_url || wallpaper.original_url}
            alt={wallpaper.title}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setImgError(true);
              setIsLoading(false);
            }}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-300 to-slate-400">
            <span className="text-4xl">🖼️</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-medium truncate">{wallpaper.title}</h3>
            <div className="flex items-center gap-3 mt-2 text-white/80 text-sm">
              <span className="flex items-center gap-1">
                <span>📥</span>
                {wallpaper.downloads}
              </span>
              <span className="flex items-center gap-1">
                <span>👁️</span>
                {wallpaper.views}
              </span>
              <span>{wallpaper.original_width}x{wallpaper.original_height}</span>
            </div>
          </div>
        </div>

        {wallpaper.is_featured && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            ⭐ 精选
          </div>
        )}
      </Link>
    </div>
  );
}
