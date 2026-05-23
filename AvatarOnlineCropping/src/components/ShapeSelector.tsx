'use client';

import { Circle, Square } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { Shape } from '@/store/editorStore';

export default function ShapeSelector() {
  const { shape, setShape } = useEditorStore();
  
  const shapes: { value: Shape; icon: React.ReactNode; label: string }[] = [
    { value: 'circle', icon: <Circle size={20} />, label: '圆形' },
    { value: 'square', icon: <Square size={20} />, label: '方形' },
  ];
  
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-300">裁剪形状</h3>
      <div className="flex gap-2">
        {shapes.map((s) => (
          <button
            key={s.value}
            onClick={() => setShape(s.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              shape === s.value
                ? 'bg-accent text-white'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            {s.icon}
            <span>{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
