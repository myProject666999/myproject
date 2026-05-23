'use client';

import { ArrowDownUp, ArrowUp, ArrowDown, Tag } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useFeedStore } from '@/store/feedStore';

type SortOption = 'publishedAt_desc' | 'publishedAt_asc' | 'sourceType';

const sortOptions: { value: SortOption; label: string; icon: any }[] = [
  { value: 'publishedAt_desc', label: '最新', icon: ArrowDown },
  { value: 'publishedAt_asc', label: '最早', icon: ArrowUp },
  { value: 'sourceType', label: '按类型', icon: Tag }
];

export default function SortSelector() {
  const queryParams = useFeedStore(state => state.queryParams);
  const setQueryParams = useFeedStore(state => state.setQueryParams);
  const fetchItems = useFeedStore(state => state.fetchItems);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentSort = sortOptions.find(opt => opt.value === queryParams.sortBy) || sortOptions[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSortChange = (value: SortOption) => {
    setQueryParams({ sortBy: value, page: 1 });
    fetchItems();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-gray-300 transition-colors"
      >
        <ArrowDownUp className="w-4 h-4" />
        <span>{currentSort.label}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
          {sortOptions.map(option => (
            <button
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className={`w-full flex items-center space-x-2 px-3 py-2 text-sm text-left transition-colors ${
                queryParams.sortBy === option.value
                  ? 'bg-deep-blue text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <option.icon className="w-4 h-4" />
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
