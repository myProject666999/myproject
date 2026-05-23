import { useState } from 'react'
import { CATEGORIES, SHAPE_DEFS } from '@/lib/shapeDefs'
import type { ShapeType } from '@/types'
import { useCanvas } from '@/store/canvas'
import { shapePath } from '@/lib/shapes'

export default function ShapePalette() {
  const [cat, setCat] = useState<string>('basic')
  const addNode = useCanvas((s) => s.addNode)

  return (
    <aside className="w-60 shrink-0 h-full bg-white border-r border-slate-200 flex flex-col">
      <div className="p-3 border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-800">形状</h3>
        <p className="text-xs text-slate-500 mt-1">点击或拖拽到画布</p>
      </div>
      <div className="flex flex-wrap gap-1 p-2 border-b border-slate-200">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCat(c.key)}
            className={`px-2 py-1 text-xs rounded-md transition-colors ${
              cat === c.key ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto p-2 grid grid-cols-2 gap-2">
        {SHAPE_DEFS.filter((s) => s.category === cat).map((s) => (
          <button
            key={s.type}
            onClick={() => addNode(s.type as ShapeType, 80, 80)}
            onDragStart={(e) => {
              e.dataTransfer.setData('text/shape', s.type)
              e.dataTransfer.effectAllowed = 'copy'
            }}
            draggable
            className="flex flex-col items-center gap-1 p-2 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
          >
            <svg width={48} height={36} viewBox="0 0 48 36">
              <path
                d={shapePath(s.type as ShapeType, 48, 36)}
                fill="#EEF2FF"
                stroke="#4F46E5"
                strokeWidth={1.5}
              />
            </svg>
            <span className="text-[11px] text-slate-600">{s.label}</span>
          </button>
        ))}
      </div>
    </aside>
  )
}
