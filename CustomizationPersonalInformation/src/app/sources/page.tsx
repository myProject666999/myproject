'use client';

import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import SourceList from '@/components/sources/SourceList';
import SourceForm from '@/components/sources/SourceForm';
import { useSourceStore } from '@/store/sourceStore';
import { Plus, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SourcesPage() {
  const router = useRouter();
  const { fetchSources, setShowForm } = useSourceStore();

  useEffect(() => {
    fetchSources();
  }, []);

  return (
    <div className="min-h-screen bg-warm-white">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 text-gray-500 hover:text-deep-blue hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-serif text-2xl font-bold text-ink-dark">源管理</h1>
              <p className="text-sm text-gray-500 mt-1">配置和管理你的信息源</p>
            </div>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-deep-blue text-white rounded-lg hover:bg-deep-blue-light transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>添加源</span>
          </button>
        </div>

        <SourceList />
      </main>

      <SourceForm />
    </div>
  );
}
