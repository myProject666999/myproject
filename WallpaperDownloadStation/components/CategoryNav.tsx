'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Category } from '@/lib/types';

export default function CategoryNav() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCategories(data.data);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 h-10 w-24 bg-slate-200 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
      <Link
        href="/category"
        className="flex-shrink-0 px-4 py-2 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 transition-colors text-sm font-medium"
      >
        🌐 全部
      </Link>
      {categories.map(cat => (
        <Link
          key={cat.id}
          href={`/category/${cat.slug}`}
          className="flex-shrink-0 px-4 py-2 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 transition-colors text-sm font-medium flex items-center gap-1"
        >
          <span>{cat.icon}</span>
          <span>{cat.name}</span>
          {cat.count != null && cat.count > 0 && (
            <span className="text-xs text-slate-400">({cat.count})</span>
          )}
        </Link>
      ))}
    </div>
  );
}
