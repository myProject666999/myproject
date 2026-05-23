'use client';

import { Plus, Rss, Youtube, Github, FileText } from 'lucide-react';

interface EmptyStateProps {
  onAddSource?: () => void;
  title?: string;
  description?: string;
}

export default function EmptyState({ onAddSource, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-24 h-24 bg-gradient-to-br from-deep-blue to-deep-blue-light rounded-full flex items-center justify-center mb-6">
        <div className="flex space-x-1">
          <Rss className="w-6 h-6 text-amber-gold" />
          <Github className="w-6 h-6 text-amber-gold" />
          <Youtube className="w-6 h-6 text-amber-gold" />
        </div>
      </div>
      
      <h3 className="font-serif text-2xl font-bold text-ink-dark mb-2">
        {title || '开始你的信息流之旅'}
      </h3>
      <p className="text-gray-500 text-center max-w-md mb-8">
        {description || '添加你感兴趣的信息源，聚合博客、RSS、B站、GitHub等多平台动态'}
      </p>

      {onAddSource && (
        <button
          onClick={onAddSource}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-deep-blue text-white rounded-lg hover:bg-deep-blue-light transition-colors shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          <span>添加信息源</span>
        </button>
      )}

      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl">
        <div className="p-4 bg-gray-50 rounded-xl text-center">
          <Rss className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600">RSS 订阅</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl text-center">
          <Youtube className="w-8 h-8 text-pink-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600">B 站动态</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl text-center">
          <Github className="w-8 h-8 text-gray-800 mx-auto mb-2" />
          <p className="text-sm text-gray-600">GitHub 活动</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl text-center">
          <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600">博客文章</p>
        </div>
      </div>
    </div>
  );
}
