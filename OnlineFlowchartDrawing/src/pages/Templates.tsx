import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import type { ShapeNode } from '@/types'
import { shapePath } from '@/lib/shapes'

interface TemplateMeta {
  id: string
  name: string
  category: 'flowchart' | 'uml' | 'er'
  thumbnail?: string
  created_at: string
}

export default function Templates() {
  const navigate = useNavigate()
  const [list, setList] = useState<TemplateMeta[]>([])
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState<'all' | 'flowchart' | 'uml' | 'er'>('all')

  useEffect(() => {
    fetch('/api/templates')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setList(d.data || [])
      })
  }, [])

  const filtered = list.filter((t) => {
    const matchCat = cat === 'all' || t.category === cat
    const matchQ = !query || t.name.toLowerCase().includes(query.toLowerCase())
    return matchCat && matchQ
  })

  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const useTemplate = async (id: string) => {
    try {
      setLoadingId(id)
      setError(null)
      
      const res = await fetch(`/api/templates/${id}`)
      if (!res.ok) throw new Error('获取模板失败')
      
      const data = await res.json()
      if (!data.success) throw new Error(data.error || '获取模板失败')
      
      const newId = uuidv4()
      const saveRes = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newId,
          name: data.data.name + ' 副本',
          nodes: data.data.nodes,
          edges: data.data.edges,
        }),
      })
      
      if (!saveRes.ok) throw new Error('创建项目失败')
      const saveData = await saveRes.json()
      if (!saveData.success) throw new Error(saveData.error || '创建项目失败')
      
      navigate(`/canvas?id=${newId}`)
    } catch (err: any) {
      setError(err.message || '操作失败')
      console.error('使用模板失败:', err)
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-slate-200 sticky top-0 z-10">
        <Link to="/" className="text-sm font-semibold text-slate-800 hover:text-indigo-600">
          ⟵ 在线流程图
        </Link>
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索模板…"
            className="px-3 py-1.5 text-sm rounded-md border border-slate-200 focus:border-indigo-400 focus:outline-none w-64"
          />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-800">模板库</h1>
        
        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <div className="mt-4 flex gap-2">
          {(['all', 'flowchart', 'uml', 'er'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                cat === c ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {c === 'all' ? '全部' : c === 'flowchart' ? '流程图' : c === 'uml' ? 'UML' : 'ER'}
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <div key={t.id} className="bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition overflow-hidden flex flex-col">
              <div className="h-40 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-3">
                <TemplateThumb id={t.id} />
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-800 truncate">{t.name}</h3>
                  <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-indigo-50 text-indigo-600">
                    {t.category}
                  </span>
                </div>
                <button
                  onClick={() => useTemplate(t.id)}
                  disabled={loadingId === t.id}
                  className="mt-3 w-full px-3 py-1.5 text-sm rounded-md bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingId === t.id ? '加载中...' : '使用模板'}
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center text-slate-500 py-16">未找到匹配的模板</div>
          )}
        </div>
      </main>
    </div>
  )
}

function TemplateThumb({ id }: { id: string }) {
  const [nodes, setNodes] = useState<ShapeNode[] | null>(null)
  useEffect(() => {
    fetch(`/api/templates/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setNodes(d.data.nodes as ShapeNode[])
      })
  }, [id])
  if (!nodes) return <div className="text-xs text-slate-400">loading…</div>
  const minX = Math.min(...nodes.map((n) => n.x))
  const minY = Math.min(...nodes.map((n) => n.y))
  const maxX = Math.max(...nodes.map((n) => n.x + n.width))
  const maxY = Math.max(...nodes.map((n) => n.y + n.height))
  const w = maxX - minX + 40
  const h = maxY - minY + 40
  const scale = Math.min(240 / w, 140 / h, 1)
  return (
    <svg width={w * scale} height={h * scale} viewBox={`${minX - 20} ${minY - 20} ${w} ${h}`}>
      {nodes.map((n) => (
        <g key={n.id} transform={`translate(${n.x},${n.y})`}>
          <path d={shapePath(n.type, n.width, n.height)} fill={n.fill} stroke={n.stroke} strokeWidth={n.strokeWidth} />
          <text
            x={n.width / 2}
            y={n.height / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={n.fontSize}
            fill={n.color}
            style={{ pointerEvents: 'none' }}
          >
            {(n.text || '').split('\\n').map((line, i) => (
              <tspan key={i} x={n.width / 2} dy={i === 0 ? 0 : n.fontSize * 1.3}>
                {line}
              </tspan>
            ))}
          </text>
        </g>
      ))}
    </svg>
  )
}
