'use client';

import { useEffect, useState } from 'react';
import { useEditorStore, Template } from '@/store/editorStore';

interface TemplateSelectorProps {
  category?: 'border' | 'festival';
}

const mockTemplates: Template[] = [
  { id: 1, name: '简约白边', category: 'border', style: 'simple', image_url: '', border_width: 10, border_color: '#ffffff' },
  { id: 2, name: '简约黑边', category: 'border', style: 'simple', image_url: '', border_width: 10, border_color: '#000000' },
  { id: 3, name: '复古金边', category: 'border', style: 'vintage', image_url: '', border_width: 15, border_color: '#ffd700' },
  { id: 4, name: '复古铜边', category: 'border', style: 'vintage', image_url: '', border_width: 15, border_color: '#cd7f32' },
  { id: 5, name: '卡通粉边', category: 'border', style: 'cartoon', image_url: '', border_width: 12, border_color: '#ffb6c1' },
  { id: 6, name: '卡通蓝边', category: 'border', style: 'cartoon', image_url: '', border_width: 12, border_color: '#87ceeb' },
  { id: 7, name: '春节红边', category: 'festival', style: 'spring', image_url: '', border_width: 20, border_color: '#dc143c' },
  { id: 8, name: '春节金色', category: 'festival', style: 'spring', image_url: '', border_width: 20, border_color: '#ffd700' },
  { id: 9, name: '圣诞红绿', category: 'festival', style: 'christmas', image_url: '', border_width: 18, border_color: '#228b22' },
  { id: 10, name: '生日彩边', category: 'festival', style: 'birthday', image_url: '', border_width: 15, border_color: '#ff69b4' },
];

export default function TemplateSelector({ category }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const { selectedTemplate, setSelectedTemplate } = useEditorStore();
  
  useEffect(() => {
    const filtered = category 
      ? mockTemplates.filter(t => t.category === category)
      : mockTemplates;
    setTemplates(filtered);
  }, [category]);
  
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-300">
        {category === 'border' ? '边框模板' : category === 'festival' ? '节日皮肤' : '全部模板'}
      </h3>
      <div className="grid grid-cols-5 gap-2">
        <button
          onClick={() => setSelectedTemplate(null)}
          className={`aspect-square rounded-lg border-2 transition-all ${
            !selectedTemplate
              ? 'border-accent bg-accent/20'
              : 'border-gray-600 bg-white/5 hover:bg-white/10'
          }`}
        >
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            无
          </div>
        </button>
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => setSelectedTemplate(template)}
            className={`aspect-square rounded-lg border-2 transition-all ${
              selectedTemplate?.id === template.id
                ? 'border-accent bg-accent/20'
                : 'border-gray-600 bg-white/5 hover:bg-white/10'
            }`}
            title={template.name}
          >
            <div
              className="w-full h-full rounded-lg"
              style={{
                border: `${template.border_width / 3}px solid ${template.border_color}`,
                background: 'rgba(255,255,255,0.1)',
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
