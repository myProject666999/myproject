'use client';

import React from 'react';

interface PositionSelectProps {
  value: string;
  onChange: (position: string) => void;
}

const positions = [
  { id: 'top-left', label: '左上' },
  { id: 'top-center', label: '上中' },
  { id: 'top-right', label: '右上' },
  { id: 'middle-left', label: '左中' },
  { id: 'middle-center', label: '居中' },
  { id: 'middle-right', label: '右中' },
  { id: 'bottom-left', label: '左下' },
  { id: 'bottom-center', label: '下中' },
  { id: 'bottom-right', label: '右下' },
];

export default function PositionSelect({ value, onChange }: PositionSelectProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">水印位置</label>
      <div className="grid grid-cols-3 gap-2">
        {positions.map((pos) => (
          <button
            key={pos.id}
            type="button"
            onClick={() => onChange(pos.id)}
            className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
              value === pos.id
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
            }`}
          >
            {pos.label}
          </button>
        ))}
      </div>
    </div>
  );
}
