'use client';

import React from 'react';
import { Layout } from '@/types';
import { layouts } from '@/config/layouts';

interface LayoutSelectorProps {
  selectedLayout: Layout;
  onLayoutChange: (layout: Layout) => void;
}

export default function LayoutSelector({ selectedLayout, onLayoutChange }: LayoutSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700">布局选择</h3>
      <div className="grid grid-cols-3 gap-2">
        {layouts.map((layout) => (
          <button
            key={layout.id}
            onClick={() => onLayoutChange(layout)}
            className={`relative p-2 rounded-lg border-2 transition-all
              ${selectedLayout.id === layout.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            <div className="aspect-square bg-gray-100 rounded overflow-hidden">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {layout.slots.map((slot, index) => (
                  <rect
                    key={index}
                    x={slot.x * 100 + 1}
                    y={slot.y * 100 + 1}
                    width={slot.width * 100 - 2}
                    height={slot.height * 100 - 2}
                    fill={selectedLayout.id === layout.id ? '#e0f2fe' : '#e5e7eb'}
                    stroke={selectedLayout.id === layout.id ? '#0ea5e9' : '#d1d5db'}
                    strokeWidth="1"
                  />
                ))}
              </svg>
            </div>
            <p className="text-xs text-center mt-1 text-gray-600 truncate">{layout.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
