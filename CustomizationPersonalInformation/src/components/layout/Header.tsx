'use client';

import { useRouter } from 'next/navigation';
import { Rss, Github, Search, Settings, Bookmark } from 'lucide-react';
import { useState } from 'react';

export default function Header({ onSearch }: { onSearch?: (term: string) => void }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-deep-blue rounded-lg flex items-center justify-center">
              <Rss className="w-5 h-5 text-amber-gold" />
            </div>
            <span className="font-serif text-xl font-bold text-ink-dark">信息流</span>
          </div>

          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索内容..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-deep-blue focus:ring-1 focus:ring-deep-blue"
              />
            </div>
          </form>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => router.push('/read-later')}
              className="p-2 text-gray-500 hover:text-deep-blue hover:bg-gray-100 rounded-lg transition-colors"
              title="稍后读"
            >
              <Bookmark className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push('/sources')}
              className="p-2 text-gray-500 hover:text-deep-blue hover:bg-gray-100 rounded-lg transition-colors"
              title="源管理"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
