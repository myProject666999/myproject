'use client';

import { useState } from 'react';
import { Palette, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import TemplateSelector from '@/components/TemplateSelector';
import { Category } from '@/store/editorStore';

const categories: { key: Category | 'all'; label: string; icon: React.ReactNode }[] = [
  { key: 'all', label: '全部', icon: <Sparkles size={16} /> },
  { key: 'border', label: '边框模板', icon: <Palette size={16} /> },
  { key: 'festival', label: '节日皮肤', icon: <Sparkles size={16} /> },
];

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <header className="mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 w-fit"
          >
            <ArrowLeft size={18} />
            返回编辑器
          </Link>
          <h1 className="text-2xl font-bold text-gradient mb-2">模板库</h1>
          <p className="text-gray-400">浏览和选择精美的边框与节日皮肤</p>
        </header>
        
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                activeCategory === cat.key
                  ? 'bg-accent text-white'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>
        
        <div className="bg-secondary/50 rounded-2xl p-6 backdrop-blur-sm">
          {activeCategory === 'all' ? (
            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-medium text-gray-300 mb-4">边框模板</h2>
                <TemplateSelector category="border" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-300 mb-4">节日皮肤</h2>
                <TemplateSelector category="festival" />
              </div>
            </div>
          ) : (
            <TemplateSelector category={activeCategory} />
          )}
        </div>
      </div>
    </div>
  );
}
