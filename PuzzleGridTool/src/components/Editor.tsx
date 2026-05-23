'use client';

import React, { useState } from 'react';
import { ImageItem, Layout, LayoutSlot, PuzzleConfig } from '@/types';
import { getDefaultLayout } from '@/config/layouts';
import ImageUploader from '@/components/ImageUploader';
import LayoutSelector from '@/components/LayoutSelector';
import SettingsPanel from '@/components/SettingsPanel';
import PuzzlePreview from '@/components/PuzzlePreview';

const defaultConfig: PuzzleConfig = {
  layoutType: 'grid_3x3',
  gap: 10,
  borderWidth: 0,
  borderColor: '#FFFFFF',
  backgroundColor: '#FFFFFF',
  canvasWidth: 1080,
  canvasHeight: 1080,
  text: {
    content: '',
    color: '#000000',
    fontSize: 36,
    position: { x: 0.5, y: 0.95 },
    fontFamily: 'sans-serif',
  },
};

export default function Editor() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [layout, setLayout] = useState<Layout>(getDefaultLayout());
  const [config, setConfig] = useState<PuzzleConfig>(defaultConfig);
  const [activeTab, setActiveTab] = useState<'upload' | 'layout' | 'settings'>('upload');

  const handleLayoutChange = (newLayout: Layout) => {
    setLayout(newLayout);
    setConfig(prev => ({ ...prev, layoutType: newLayout.id }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">九宫格拼图工具</h1>
              <p className="text-sm text-gray-500">制作朋友圈拼图</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            支持等比例拼接 · 自定义布局 · 文字水印
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="border-b border-gray-200">
            <div className="flex">
              {[
                { id: 'upload', label: '图片上传', icon: '📷' },
                { id: 'layout', label: '布局选择', icon: '🔲' },
                { id: 'settings', label: '参数设置', icon: '⚙️' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-1 py-3 px-2 text-sm font-medium transition-colors
                    ${activeTab === tab.id
                      ? 'text-primary-600 border-b-2 border-primary-500 bg-primary-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <span className="mr-1">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'upload' && (
              <ImageUploader images={images} onImagesChange={setImages} />
            )}
            {activeTab === 'layout' && (
              <LayoutSelector selectedLayout={layout} onLayoutChange={handleLayoutChange} />
            )}
            {activeTab === 'settings' && (
              <SettingsPanel config={config} onConfigChange={setConfig} />
            )}
          </div>
        </aside>

        <section className="flex-1 p-6 overflow-auto">
          <PuzzlePreview
            layout={layout}
            images={images}
            config={config}
          />
        </section>
      </main>
    </div>
  );
}
