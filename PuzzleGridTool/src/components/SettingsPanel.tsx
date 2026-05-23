'use client';

import React from 'react';
import { PuzzleConfig } from '@/types';

interface SettingsPanelProps {
  config: PuzzleConfig;
  onConfigChange: (config: PuzzleConfig) => void;
}

export default function SettingsPanel({ config, onConfigChange }: SettingsPanelProps) {
  const updateConfig = (partial: Partial<PuzzleConfig>) => {
    onConfigChange({ ...config, ...partial });
  };

  const updateText = (partial: Partial<PuzzleConfig['text']>) => {
    onConfigChange({
      ...config,
      text: { ...config.text, ...partial },
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">间距设置</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600">图片间距</label>
            <span className="text-sm text-gray-500">{config.gap}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            value={config.gap}
            onChange={(e) => updateConfig({ gap: Number(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">边框设置</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600">边框宽度</label>
            <span className="text-sm text-gray-500">{config.borderWidth}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="20"
            value={config.borderWidth}
            onChange={(e) => updateConfig({ borderWidth: Number(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">边框颜色</label>
          <input
            type="color"
            value={config.borderColor}
            onChange={(e) => updateConfig({ borderColor: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer border border-gray-200"
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">背景设置</h3>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">背景颜色</label>
          <input
            type="color"
            value={config.backgroundColor}
            onChange={(e) => updateConfig({ backgroundColor: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer border border-gray-200"
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">画布尺寸</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-sm text-gray-600">宽度</label>
            <input
              type="number"
              value={config.canvasWidth}
              onChange={(e) => updateConfig({ canvasWidth: Number(e.target.value) })}
              className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">高度</label>
            <input
              type="number"
              value={config.canvasHeight}
              onChange={(e) => updateConfig({ canvasHeight: Number(e.target.value) })}
              className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { w: 750, h: 750, label: '750×750' },
            { w: 1080, h: 1080, label: '1080×1080' },
            { w: 1080, h: 1440, label: '竖屏' },
            { w: 1440, h: 1080, label: '横屏' },
          ].map((size) => (
            <button
              key={size.label}
              onClick={() => updateConfig({ canvasWidth: size.w, canvasHeight: size.h })}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">文字设置</h3>
        <div className="space-y-2">
          <textarea
            value={config.text.content}
            onChange={(e) => updateText({ content: e.target.value })}
            placeholder="输入文字内容..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            rows={2}
          />
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">颜色</label>
              <input
                type="color"
                value={config.text.color}
                onChange={(e) => updateText({ color: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border border-gray-200"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">字号</label>
              <input
                type="number"
                min="12"
                max="120"
                value={config.text.fontSize}
                onChange={(e) => updateText({ fontSize: Number(e.target.value) })}
                className="mt-1 w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600">水平位置</label>
              <span className="text-sm text-gray-500">{Math.round(config.text.position.x * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={config.text.position.x * 100}
              onChange={(e) => updateText({ position: { ...config.text.position, x: Number(e.target.value) / 100 } })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600">垂直位置</label>
              <span className="text-sm text-gray-500">{Math.round(config.text.position.y * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={config.text.position.y * 100}
              onChange={(e) => updateText({ position: { ...config.text.position, y: Number(e.target.value) / 100 } })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
