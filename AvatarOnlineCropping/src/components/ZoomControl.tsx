'use client';

import { ZoomIn, ZoomOut } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';

export default function ZoomControl() {
  const { zoom, setZoom } = useEditorStore();
  
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-300">缩放</h3>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setZoom(zoom - 0.1)}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          <ZoomOut size={18} className="text-gray-300" />
        </button>
        <input
          type="range"
          min="0.5"
          max="3"
          step="0.1"
          value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
          className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent"
        />
        <button
          onClick={() => setZoom(zoom + 0.1)}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          <ZoomIn size={18} className="text-gray-300" />
        </button>
      </div>
      <p className="text-xs text-gray-500 text-center">{(zoom * 100).toFixed(0)}%</p>
    </div>
  );
}
