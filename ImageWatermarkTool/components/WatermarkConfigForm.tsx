'use client';

import React, { useState } from 'react';
import PositionSelect from './PositionSelect';
import { WatermarkPosition } from '@/lib/watermark';

interface WatermarkConfigFormProps {
  config: {
    type: 'text' | 'logo';
    text: string;
    logoPath?: string;
    position: WatermarkPosition;
    opacity: number;
    fontSize: number;
    fontColor: string;
    margin: number;
  };
  onChange: (config: any) => void;
  onProcess: () => void;
  isProcessing: boolean;
  onSaveTemplate: () => void;
  templateName: string;
  onTemplateNameChange: (name: string) => void;
}

export default function WatermarkConfigForm({
  config,
  onChange,
  onProcess,
  isProcessing,
  onSaveTemplate,
  templateName,
  onTemplateNameChange,
}: WatermarkConfigFormProps) {
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);

  const handleChange = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">水印配置</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">水印类型</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  value="text"
                  checked={config.type === 'text'}
                  onChange={() => handleChange('type', 'text')}
                  className="w-4 h-4 text-primary-600"
                />
                <span>文字水印</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  value="logo"
                  checked={config.type === 'logo'}
                  onChange={() => handleChange('type', 'logo')}
                  className="w-4 h-4 text-primary-600"
                />
                <span>Logo水印</span>
              </label>
            </div>
          </div>

          {config.type === 'text' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">水印文字</label>
              <input
                type="text"
                value={config.text}
                onChange={(e) => handleChange('text', e.target.value)}
                placeholder="输入水印文字"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo路径</label>
              <input
                type="text"
                value={config.logoPath || ''}
                onChange={(e) => handleChange('logoPath', e.target.value)}
                placeholder="输入Logo文件路径"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          )}

          {config.type === 'text' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">字体大小</label>
                <input
                  type="number"
                  value={config.fontSize}
                  onChange={(e) => handleChange('fontSize', parseInt(e.target.value) || 24)}
                  min="12"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">字体颜色</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value="#ffffff"
                    onChange={(e) => handleChange('fontColor', e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.fontColor}
                    onChange={(e) => handleChange('fontColor', e.target.value)}
                    placeholder="rgba(255, 255, 255, 0.8)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </>
          )}

          <PositionSelect
            value={config.position}
            onChange={(pos) => handleChange('position', pos)}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              透明度: {Math.round(config.opacity * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={config.opacity * 100}
              onChange={(e) => handleChange('opacity', parseInt(e.target.value) / 100)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">边距 (像素)</label>
            <input
              type="number"
              value={config.margin}
              onChange={(e) => handleChange('margin', parseInt(e.target.value) || 20)}
              min="0"
              max="200"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onProcess}
          disabled={isProcessing}
          className="btn btn-primary flex-1"
        >
          {isProcessing ? '处理中...' : '开始处理'}
        </button>
        <button
          onClick={() => setShowSaveTemplate(!showSaveTemplate)}
          className="btn btn-secondary"
        >
          保存模板
        </button>
      </div>

      {showSaveTemplate && (
        <div className="card space-y-3">
          <h4 className="font-medium">保存为模板</h4>
          <input
            type="text"
            value={templateName}
            onChange={(e) => onTemplateNameChange(e.target.value)}
            placeholder="输入模板名称"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <button
            onClick={onSaveTemplate}
            className="btn btn-primary w-full"
            disabled={!templateName.trim()}
          >
            保存模板
          </button>
        </div>
      )}
    </div>
  );
}
