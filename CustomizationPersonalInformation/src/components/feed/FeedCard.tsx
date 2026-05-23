'use client';

import { FeedItem, SourceType } from '@/types';
import { Bookmark, BookmarkCheck, ExternalLink, Rss, Youtube, Github, FileText, User, Clock } from 'lucide-react';
import { useFeedStore } from '@/store/feedStore';

const sourceTypeConfig: Record<SourceType, { label: string; icon: any; color: string; bgColor: string }> = {
  rss: { label: 'RSS', icon: Rss, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  bilibili: { label: 'B站', icon: Youtube, color: 'text-pink-600', bgColor: 'bg-pink-100' },
  github: { label: 'GitHub', icon: Github, color: 'text-gray-800', bgColor: 'bg-gray-100' },
  blog: { label: '博客', icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-100' }
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 7) return `${days} 天前`;
  
  return date.toLocaleDateString('zh-CN');
}

export default function FeedCard({ item }: { item: FeedItem }) {
  const toggleReadLater = useFeedStore(state => state.toggleReadLater);
  const config = sourceTypeConfig[item.sourceType];
  const TypeIcon = config.icon;

  const handleToggleReadLater = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleReadLater(item.id, !item.readLater);
  };

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-xl border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
    >
      {item.coverImage && (
        <div className="relative aspect-video overflow-hidden bg-gray-100">
          <img
            src={item.coverImage}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md ${config.bgColor}`}>
            <TypeIcon className={`w-3 h-3 ${config.color}`} />
            <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
          </div>
          <button
            onClick={handleToggleReadLater}
            className={`p-1.5 rounded-md transition-colors ${
              item.readLater
                ? 'text-amber-gold bg-amber-gold/10 hover:bg-amber-gold/20'
                : 'text-gray-400 hover:text-amber-gold hover:bg-gray-100'
            }`}
            title={item.readLater ? '取消稍后读' : '添加到稍后读'}
          >
            {item.readLater ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        </div>

        <h3 className="font-serif text-lg font-semibold text-ink-dark mb-2 line-clamp-2 group-hover:text-deep-blue transition-colors">
          {item.title}
        </h3>

        {item.summary && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {item.summary}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-3">
            {item.author && (
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span className="truncate max-w-[120px]">{item.author}</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formatDate(item.publishedAt)}</span>
            </div>
          </div>
          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </a>
  );
}
