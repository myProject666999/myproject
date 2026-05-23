import { v4 as uuidv4 } from 'uuid'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ShapePalette from '@/components/ShapePalette'
import Canvas from '@/components/Canvas'
import PropertyPanel from '@/components/PropertyPanel'
import { useCanvas } from '@/store/canvas'
import { shapePath } from '@/lib/shapes'
import { getPortPosition } from '@/lib/ports'

export default function CanvasPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const setProject = useCanvas((s) => s.setProject)
  const nodes = useCanvas((s) => s.nodes)
  const edges = useCanvas((s) => s.edges)
  const projectName = useCanvas((s) => s.projectName)
  const projectId = useCanvas((s) => s.projectId)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const id = params.get('id')
    if (id) {
      fetch(`/api/projects/${id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            setProject(data.data.id, data.data.name, data.data.nodes, data.data.edges)
          }
        })
    } else {
      const newId = uuidv4()
      setProject(newId, '未命名项目', [], [])
    }
  }, [params])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const onSave = async () => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: projectId || uuidv4(), name: projectName, nodes, edges }),
    })
    const data = await res.json()
    if (data.success) showToast('已保存')
    else showToast('保存失败: ' + (data.error || ''))
  }

  const buildSvgString = () => {
    const minX = nodes.length ? Math.min(...nodes.map((n) => n.x)) - 40 : 0
    const minY = nodes.length ? Math.min(...nodes.map((n) => n.y)) - 40 : 0
    const maxX = nodes.length ? Math.max(...nodes.map((n) => n.x + n.width)) + 40 : 800
    const maxY = nodes.length ? Math.max(...nodes.map((n) => n.y + n.height)) + 40 : 600
    const width = maxX - minX
    const height = maxY - minY
    const svgNS = 'http://www.w3.org/2000/svg'
    const svg = document.createElementNS(svgNS, 'svg')
    svg.setAttribute('xmlns', svgNS)
    svg.setAttribute('width', String(width))
    svg.setAttribute('height', String(height))
    svg.setAttribute('viewBox', `${minX} ${minY} ${width} ${height}`)

    const bg = document.createElementNS(svgNS, 'rect')
    bg.setAttribute('x', String(minX))
    bg.setAttribute('y', String(minY))
    bg.setAttribute('width', String(width))
    bg.setAttribute('height', String(height))
    bg.setAttribute('fill', '#ffffff')
    svg.appendChild(bg)

    const defs = document.createElementNS(svgNS, 'defs')
    defs.innerHTML =
      '<marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#0F172A" /></marker>'
    svg.appendChild(defs)

    for (const edge of edges) {
      const src = nodes.find((n) => n.id === edge.source)
      const tgt = nodes.find((n) => n.id === edge.target)
      if (!src || !tgt) continue
      
      const sourcePort = edge.sourcePort || 'bottom'
      const targetPort = edge.targetPort || 'top'
      const srcPos = getPortPosition(src, sourcePort)
      const tgtPos = getPortPosition(tgt, targetPort)
      
      const line = document.createElementNS(svgNS, 'line')
      line.setAttribute('x1', String(srcPos.x))
      line.setAttribute('y1', String(srcPos.y))
      line.setAttribute('x2', String(tgtPos.x))
      line.setAttribute('y2', String(tgtPos.y))
      line.setAttribute('stroke', '#0F172A')
      line.setAttribute('stroke-width', '1.8')
      if (edge.style === 'dashed') line.setAttribute('stroke-dasharray', '6 4')
      line.setAttribute('marker-end', 'url(#arrow)')
      svg.appendChild(line)
      if (edge.label) {
        const mx = (srcPos.x + tgtPos.x) / 2
        const my = (srcPos.y + tgtPos.y) / 2
        const bg2 = document.createElementNS(svgNS, 'rect')
        bg2.setAttribute('x', String(mx - edge.label.length * 4 - 6))
        bg2.setAttribute('y', String(my - 10))
        bg2.setAttribute('width', String(edge.label.length * 8 + 12))
        bg2.setAttribute('height', '20')
        bg2.setAttribute('fill', '#ffffff')
        bg2.setAttribute('stroke', '#CBD5E1')
        bg2.setAttribute('rx', '4')
        svg.appendChild(bg2)
        const t = document.createElementNS(svgNS, 'text')
        t.setAttribute('x', String(mx))
        t.setAttribute('y', String(my))
        t.setAttribute('text-anchor', 'middle')
        t.setAttribute('dominant-baseline', 'middle')
        t.setAttribute('font-size', '12')
        t.setAttribute('fill', '#334155')
        t.textContent = edge.label
        svg.appendChild(t)
      }
    }
    for (const node of nodes) {
      const g = document.createElementNS(svgNS, 'g')
      g.setAttribute('transform', `translate(${node.x},${node.y})`)
      const path = document.createElementNS(svgNS, 'path')
      path.setAttribute('d', shapePath(node.type, node.width, node.height))
      path.setAttribute('fill', node.fill)
      path.setAttribute('stroke', node.stroke)
      path.setAttribute('stroke-width', String(node.strokeWidth))
      g.appendChild(path)
      const textY = node.type === 'actor' ? node.height - 10 : node.height / 2
      const t = document.createElementNS(svgNS, 'text')
      t.setAttribute('x', String(node.width / 2))
      t.setAttribute('y', String(textY))
      t.setAttribute('text-anchor', 'middle')
      t.setAttribute('dominant-baseline', 'middle')
      t.setAttribute('font-size', String(node.fontSize))
      t.setAttribute('fill', node.color)
      ;(node.text || '').split('\\n').forEach((line, i) => {
        const ts = document.createElementNS(svgNS, 'tspan')
        ts.setAttribute('x', String(node.width / 2))
        ts.setAttribute('dy', String(i === 0 ? 0 : node.fontSize * 1.3))
        ts.textContent = line
        t.appendChild(ts)
      })
      g.appendChild(t)
      svg.appendChild(g)
    }
    return new XMLSerializer().serializeToString(svg)
  }

  const onExportSvg = () => {
    const svg = buildSvgString()
    if (!svg) return
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectName || 'diagram'}.svg`
    a.click()
    URL.revokeObjectURL(url)
    showToast('SVG 已导出')
  }

  const onExportPng = () => {
    const svg = buildSvgString()
    if (!svg) return
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const scale = 2
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.scale(scale, scale)
      ctx.drawImage(img, 0, 0)
      canvas.toBlob((b) => {
        if (!b) return
        const u = URL.createObjectURL(b)
        const a = document.createElement('a')
        a.href = u
        a.download = `${projectName || 'diagram'}.png`
        a.click()
        URL.revokeObjectURL(u)
      })
      URL.revokeObjectURL(url)
      showToast('PNG 已导出')
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      showToast('导出失败')
    }
    img.src = url
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50">
      <header className="h-12 flex items-center px-4 bg-white border-b border-slate-200">
        <button onClick={() => navigate('/')} className="text-sm font-semibold text-slate-800 hover:text-indigo-600">
          ⟵ 在线流程图
        </button>
      </header>
      <div className="flex-1 flex min-h-0">
        <ShapePalette />
        <Canvas
          onSave={onSave}
          onExportSvg={onExportSvg}
          onExportPng={onExportPng}
          onOpenTemplates={() => navigate('/templates')}
        />
        <PropertyPanel />
      </div>
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900 text-white text-sm rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}
