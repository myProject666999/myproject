'use client';

import React, { useRef, useEffect, useState } from 'react';
import { ImageItem, Layout, LayoutSlot, PuzzleConfig } from '@/types';
import { createSlots, renderPuzzle, downloadCanvas } from '@/lib/puzzle';

interface PuzzlePreviewProps {
  layout: Layout;
  images: ImageItem[];
  config: PuzzleConfig;
  onSlotsChange?: (slots: LayoutSlot[]) => void;
}

export default function PuzzlePreview({ layout, images, config, onSlotsChange }: PuzzlePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [slots, setSlots] = useState<LayoutSlot[]>([]);
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    const newSlots = createSlots(layout);
    images.forEach((image, index) => {
      if (newSlots[index]) {
        newSlots[index].image = image;
      }
    });
    setSlots(newSlots);
    onSlotsChange?.(newSlots);
  }, [layout, images.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const render = async () => {
      setIsRendering(true);
      try {
        await renderPuzzle(canvas, slots, config);
      } catch (error) {
        console.error('Error rendering puzzle:', error);
      } finally {
        setIsRendering(false);
      }
    };

    if (slots.length > 0) {
      render();
    }
  }, [slots, config]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    downloadCanvas(canvas, `puzzle-${Date.now()}.png`);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-center justify-center p-4 bg-gray-100 rounded-lg overflow-auto">
        <div className="relative max-w-full max-h-full">
          {isRendering && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
              <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
            </div>
          )}
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-full shadow-lg"
            style={{ maxHeight: 'calc(100vh - 200px)' }}
          />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {slots.filter(s => s.image).length} / {slots.length} 张图片
        </div>
        <button
          onClick={handleDownload}
          disabled={slots.filter(s => s.image).length === 0}
          className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          下载拼图
        </button>
      </div>
    </div>
  );
}
