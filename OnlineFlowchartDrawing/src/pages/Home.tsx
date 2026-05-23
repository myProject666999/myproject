import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

interface ProjectMeta {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export default function Home() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<ProjectMeta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setProjects(d.data || [])
      })
      .finally(() => setLoading(false))
  }, [])

  const startBlank = () => {
    const id = uuidv4()
    navigate(`/canvas?id=${id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-cyan-50">
      <header className="h-16 flex items-center justify-between px-8 bg-white/70 backdrop-blur border-b border-slate-200/60 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold">
            F
          </div>
          <span className="font-semibold text-slate-800">在线流程图绘制</span>
        </div>
        <nav className="flex items-center gap-6 text-sm text-slate-600">
          <Link to="/templates" className="hover:text-indigo-600">模板库</Link>
          <a href="#features" className="hover:text-indigo-600">功能</a>
        </nav>
      </header>

      <section className="max-w-6xl mx-auto px-8 py-20 text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent leading-tight">
          让流程、UML、ER 图<br/>轻松可视化
        </h1>
        <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
          拖拽即画、实时编辑、一键导出。丰富的模板库助力你快速开始，专业的画布交互让复杂设计也得心应手。
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={startBlank}
            className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition"
          >
            开始绘制
          </button>
          <Link
            to="/templates"
            className="px-6 py-3 rounded-lg bg-white text-slate-800 font-medium border border-slate-200 hover:bg-slate-50 transition"
          >
            浏览模板
          </Link>
        </div>
      </section>

      <section id="features" className="max-w-6xl mx-auto px-8 pb-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: '拖拽即用', desc: '从左侧面板拖入形状，点击连接点拉出连线，流畅自然。' },
          { title: '丰富模板', desc: '流程图、UML、ER 图模板一键载入，秒速开启创作。' },
          { title: '导出随心', desc: '支持 SVG 与 PNG 高清导出，用于文档、PPT、博客。' },
        ].map((f) => (
          <div key={f.title} className="p-6 rounded-2xl bg-white/70 backdrop-blur border border-white shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800">{f.title}</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="max-w-6xl mx-auto px-8 pb-24">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-800">最近项目</h2>
          <Link to="/canvas" className="text-sm text-indigo-600 hover:underline">新建</Link>
        </div>
        {loading ? (
          <div className="text-slate-500 text-sm">加载中…</div>
        ) : projects.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white/70 border border-dashed border-slate-300 text-center">
            <p className="text-slate-500">还没有项目，点击"开始绘制"创建第一个吧！</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projects.map((p) => (
              <Link
                key={p.id}
                to={`/canvas?id=${p.id}`}
                className="p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition block"
              >
                <div className="text-base font-medium text-slate-800 truncate">{p.name}</div>
                <div className="text-xs text-slate-500 mt-1">
                  更新于 {new Date(p.updated_at).toLocaleString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
