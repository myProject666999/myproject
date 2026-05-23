'use client';

import { SourceType } from '@/types';
import { Rss, Youtube, Github, FileText, X } from 'lucide-react';
import { useFeedStore } from '@/store/feedStore';

const sourceTypes: { type: SourceType; label: string; icon: any }[] = [
  { type: 'rss', label: 'RSS 订阅', icon: Rss },
  { type: 'bilibili', label: 'B 站', icon: Youtube },
  { type: 'github', label: 'GitHub', icon: Github },
  { type: 'blog', label: '博客', icon: FileText }
];

export default function FilterSidebar() {
  const queryParams = useFeedStore(state => state.queryParams);
  const setQueryParams = useFeedStore(state => state.setQueryParams);
  const fetchItems = useFeedStore(state => state.fetchItems);

  const toggleSourceType = (type: SourceType) => {
    const currentTypes = queryParams.sourceType || [];
    let newTypes: SourceType[];
    
    if (currentTypes.includes(type)) {
      newTypes = currentTypes.filter(t => t !== type);
    } else {
      newTypes = [...currentTypes, type];
    }

    setQueryParams({
      sourceType: newTypes.length > 0 ? newTypes : undefined,
      page: 1
    });
    fetchItems();
  };

  const clearFilters = () => {
    setQueryParams({
      sourceType: undefined,
      search: undefined,
      page: 1
    });
    fetchItems();
  };

  const hasFilters = (queryParams.sourceType?.length || 0) > 0 || queryParams.search;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-ink-dark">筛选</h3>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-gray-500 hover:text-deep-blue flex items-center space-x-1"
          >
            <X className="w-3 h-3" />
            <span>清除</span>
          </button>
        )}
      </div>

      <div className="space-y-1">
        {sourceTypes.map(({ type, label, icon: Icon }) => {
          const isActive = queryParams.sourceType?.includes(type) || false;
          return (
            <button
              key={type}
              onClick={() => toggleSourceType(type)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                isActive
                  ? 'bg-deep-blue text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
