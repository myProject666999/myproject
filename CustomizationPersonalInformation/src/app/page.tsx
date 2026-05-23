'use client';

import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import FeedList from '@/components/feed/FeedList';
import FilterSidebar from '@/components/feed/FilterSidebar';
import SortSelector from '@/components/feed/SortSelector';
import EmptyState from '@/components/layout/EmptyState';
import { useFeedStore } from '@/store/feedStore';
import { useSourceStore } from '@/store/sourceStore';
import { useRouter } from 'next/navigation';
import { RefreshCw, Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { items, loading, fetchItems, setQueryParams } = useFeedStore();
  const { sources, fetchSources, setShowForm } = useSourceStore();

  useEffect(() => {
    fetchSources();
    fetchItems();
  }, []);

  const enabledSources = sources.filter(s => s.enabled);

  const handleSearch = (term: string) => {
    setQueryParams({ search: term || undefined, page: 1 });
    fetchItems();
  };

  const handleRefresh = () => {
    fetchItems();
  };

  return (
    <div className="min-h-screen bg-warm-white">
      <Header onSearch={handleSearch} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {enabledSources.length === 0 && items.length === 0 ? (
          <EmptyState onAddSource={() => router.push('/sources')} />
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <aside className="w-full lg:w-56 flex-shrink-0">
              <FilterSidebar />
            </aside>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h2 className="font-serif text-xl font-bold text-ink-dark">信息流</h2>
                  {loading && (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="p-2 text-gray-500 hover:text-deep-blue hover:bg-gray-100 rounded-lg disabled:opacity-50"
                    title="刷新"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                  <SortSelector />
                </div>
              </div>

              <FeedList items={items} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
