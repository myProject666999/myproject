'use client';

import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import FeedList from '@/components/feed/FeedList';
import { useFeedStore } from '@/store/feedStore';
import { ArrowLeft, Bookmark } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ReadLaterPage() {
  const router = useRouter();
  const { items, loading, fetchItems, setQueryParams } = useFeedStore();

  useEffect(() => {
    setQueryParams({ readLaterOnly: true, page: 1 });
    fetchItems();
  }, []);

  const handleBack = () => {
    setQueryParams({ readLaterOnly: false });
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-warm-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={handleBack}
            className="p-2 text-gray-500 hover:text-deep-blue hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2">
            <Bookmark className="w-5 h-5 text-amber-gold" />
            <h1 className="font-serif text-2xl font-bold text-ink-dark">稍后读</h1>
            <span className="text-sm text-gray-500">({items.length})</span>
          </div>
        </div>

        {items.length === 0 && !loading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-amber-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-8 h-8 text-amber-gold" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-ink-dark mb-2">暂无稍后读内容</h3>
            <p className="text-gray-500">在信息流中点击书签按钮即可将内容添加到稍后读</p>
          </div>
        ) : (
          <FeedList items={items} />
        )}
      </main>
    </div>
  );
}
