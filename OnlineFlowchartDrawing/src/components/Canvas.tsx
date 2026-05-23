import { useEffect, useRef, useState } from 'react'
import { useCanvas } from '@/store/canvas'
import ShapeItem from './ShapeItem'
import EdgeLine from './EdgeLine'
import type { ShapeType, ShapeNode, PortPosition } from '@/types'
import { getPortPosition } from '@/lib/ports'

interface Props {
  onSave: () => void
  onExportSvg: () => void
  onExportPng: () => void
  onOpenTemplates: () => void
}

export default function Canvas({ onSave, onExportSvg, onExportPng, onOpenTemplates }: Props) {
  const nodes = useCanvas((s) => s.nodes)
  const edges = useCanvas((s) => s.edges)
  const selectedIds = useCanvas((s) => s.selectedIds)
  const select = useCanvas((s) => s.select)
  const addNode = useCanvas((s) => s.addNode)
  const updateNode = useCanvas((s) => s.updateNode)
  const deleteNode = useCanvas((s) => s.deleteNode)
  const deleteEdge = useCanvas((s) => s.deleteEdge)
  const updateEdge = useCanvas((s) => s.updateEdge)
  const undo = useCanvas((s) => s.undo)
  const redo = useCanvas((s) => s.redo)
  const pushHistory = useCanvas((s) => s.pushHistory)
  const startEdge = useCanvas((s) => s.startEdge)
  const moveEdgeDraft = useCanvas((s) => s.moveEdgeDraft)
  const finishEdge = useCanvas((s) => s.finishEdge)
  const startEdgeDrag = useCanvas((s) => s.startEdgeDrag)
  const moveEdgeDrag = useCanvas((s) => s.moveEdgeDrag)
  const finishEdgeDrag = useCanvas((s) => s.finishEdgeDrag)
  const draft = useCanvas((s) => s.draft)
  const edgeDrag = useCanvas((s) => s.edgeDrag)
  const projectName = useCanvas((s) => s.projectName)
  const setProjectName = useCanvas((s) => s.setProjectName)

  const containerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const dragRef = useRef<{ id: string; offX: number; offY: number } | null>(null)
  const panningRef = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null)

  const toLocal = (clientX: number, clientY: number) => {
    const rect = containerRef.current!.getBoundingClientRect()
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top - pan.y) / zoom,
    }
  }

  const handlePointerDownNode = (e: React.PointerEvent, id: string) => {
    e.stopPropagation()
    const node = nodes.find((n) => n.id === id)!
    const { x, y } = toLocal(e.clientX, e.clientY)
    dragRef.current = { id, offX: x - node.x, offY: y - node.y }
    select([id])
    ;(e.target as Element).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    const { x, y } = toLocal(e.clientX, e.clientY)
    if (dragRef.current) {
      const { id, offX, offY } = dragRef.current
      updateNode(id, { x: x - offX, y: y - offY })
    } else if (panningRef.current) {
      const dx = e.clientX - panningRef.current.startX
      const dy = e.clientY - panningRef.current.startY
      setPan({ x: panningRef.current.x + dx, y: panningRef.current.y + dy })
    }
    if (draft) moveEdgeDraft(x, y)
    if (edgeDrag) moveEdgeDrag(x, y)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragRef.current) {
      dragRef.current = null
      pushHistory()
    }
    if (panningRef.current) panningRef.current = null
    
    if (draft) {
      const { x, y } = toLocal(e.clientX, e.clientY)
      const targetNode = findNodeAtPosition(x, y)
      if (targetNode) {
        const targetPort = findNearestPort(targetNode, x, y)
        finishEdge(targetNode.id, targetPort)
      } else {
        finishEdge(null, null)
      }
    }
    
    if (edgeDrag) {
      const { x, y } = toLocal(e.clientX, e.clientY)
      const targetNode = findNodeAtPosition(x, y)
      if (targetNode) {
        const targetPort = findNearestPort(targetNode, x, y)
        finishEdgeDrag(targetNode.id, targetPort)
      } else {
        finishEdgeDrag(null, null)
      }
    }
    
    ;(e.target as Element).releasePointerCapture?.(e.pointerId)
  }

  const findNodeAtPosition = (x: number, y: number): ShapeNode | null => {
    const hitRadius = 20
    for (const node of nodes) {
      if (
        x >= node.x - hitRadius &&
        x <= node.x + node.width + hitRadius &&
        y >= node.y - hitRadius &&
        y <= node.y + node.height + hitRadius
      ) {
        return node
      }
    }
    return null
  }

  const findNearestPort = (node: ShapeNode, x: number, y: number): PortPosition => {
    const ports: { port: PortPosition; pos: { x: number; y: number } }[] = [
      { port: 'top', pos: getPortPosition(node, 'top') },
      { port: 'right', pos: getPortPosition(node, 'right') },
      { port: 'bottom', pos: getPortPosition(node, 'bottom') },
      { port: 'left', pos: getPortPosition(node, 'left') },
    ]
    
    let nearestPort: PortPosition = 'top'
    let minDist = Infinity
    
    for (const p of ports) {
      const dist = Math.sqrt((p.pos.x - x) ** 2 + (p.pos.y - y) ** 2)
      if (dist < minDist) {
        minDist = dist
        nearestPort = p.port
      }
    }
    
    return nearestPort
  }

  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      panningRef.current = { x: pan.x, y: pan.y, startX: e.clientX, startY: e.clientY }
      return
    }
    if ((e.target as Element).tagName === 'svg' || (e.target as Element).classList.contains('canvas-bg')) {
      select([])
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const type = e.dataTransfer.getData('text/shape') as ShapeType
    if (!type) return
    const { x, y } = toLocal(e.clientX, e.clientY)
    addNode(type, x - 80, y - 30)
  }

  const handleEdgeStart = (sourceId: string, sourcePort: PortPosition, e: React.PointerEvent) => {
    e.stopPropagation()
    const { x, y } = toLocal(e.clientX, e.clientY)
    startEdge(sourceId, sourcePort, x, y)
    ;(e.target as Element).setPointerCapture(e.pointerId)
  }

  const handleEdgeStartDrag = (edgeId: string, isSource: boolean, x: number, y: number) => {
    startEdgeDrag(edgeId, isSource, x, y)
  }

  const handleEdgeDragMove = (clientX: number, clientY: number) => {
    const { x, y } = toLocal(clientX, clientY)
    moveEdgeDrag(x, y)
  }

  const handleEdgeEndDrag = (targetNodeId: string | null, targetPort: string | null) => {
    finishEdgeDrag(targetNodeId, targetPort as PortPosition | null)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        redo()
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        selectedIds.forEach((id) => {
          if (nodes.find((n) => n.id === id)) deleteNode(id)
          else if (edges.find((ed) => ed.id === id)) deleteEdge(id)
        })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedIds, nodes, edges, deleteNode, deleteEdge, undo, redo])

  const getDraftStartPoint = () => {
    if (!draft?.sourceId) return { x: 0, y: 0 }
    const sourceNode = nodes.find((n) => n.id === draft.sourceId)
    if (!sourceNode) return { x: 0, y: 0 }
    const sourcePort = draft.sourcePort || 'bottom'
    return getPortPosition(sourceNode, sourcePort)
  }

  const getEdgeDragLine = () => {
    if (!edgeDrag) return null
    const edge = edges.find((e) => e.id === edgeDrag.edgeId)
    if (!edge) return null

    const sourceNode = nodes.find((n) => n.id === edge.source)
    const targetNode = nodes.find((n) => n.id === edge.target)
    if (!sourceNode || !targetNode) return null

    const sourcePort = edge.sourcePort || 'bottom'
    const targetPort = edge.targetPort || 'top'

    const srcPos = getPortPosition(sourceNode, sourcePort)
    const tgtPos = getPortPosition(targetNode, targetPort)

    if (edgeDrag.isSource) {
      return {
        x1: edgeDrag.mouseX,
        y1: edgeDrag.mouseY,
        x2: tgtPos.x,
        y2: tgtPos.y,
      }
    } else {
      return {
        x1: srcPos.x,
        y1: srcPos.y,
        x2: edgeDrag.mouseX,
        y2: edgeDrag.mouseY,
      }
    }
  }

  const draftStart = getDraftStartPoint()
  const edgeDragLine = getEdgeDragLine()

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-w-0">
      <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-slate-200">
        <input
          className="text-sm font-medium text-slate-800 px-2 py-1 rounded border border-transparent hover:border-slate-200 focus:border-indigo-400 focus:outline-none bg-transparent"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
        <div className="flex-1" />
        <button onClick={onOpenTemplates} className="px-3 py-1.5 text-sm rounded border border-slate-200 hover:bg-slate-50 text-slate-700">模板库</button>
        <button onClick={onExportSvg} className="px-3 py-1.5 text-sm rounded border border-slate-200 hover:bg-slate-50 text-slate-700">导出 SVG</button>
        <button onClick={onExportPng} className="px-3 py-1.5 text-sm rounded border border-slate-200 hover:bg-slate-50 text-slate-700">导出 PNG</button>
        <button onClick={onSave} className="px-3 py-1.5 text-sm rounded bg-indigo-600 hover:bg-indigo-700 text-white">保存</button>
        <div className="flex items-center gap-1 ml-2">
          <button onClick={() => setZoom((z) => Math.max(0.2, z - 0.1))} className="px-2 py-1 text-sm rounded border border-slate-200 hover:bg-slate-50">−</button>
          <span className="text-xs text-slate-500 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(3, z + 0.1))} className="px-2 py-1 text-sm rounded border border-slate-200 hover:bg-slate-50">+</button>
        </div>
      </div>
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden relative"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <svg
          className="w-full h-full canvas-bg"
          style={{ background: '#F8FAFC' }}
        >
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" strokeWidth="0.5" />
            </pattern>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#0F172A" />
            </marker>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
            {edges.map((edge) => (
              <EdgeLine
                key={edge.id}
                edge={edge}
                nodes={nodes}
                selected={selectedIds.includes(edge.id)}
                onSelect={(id) => select([id])}
                onDelete={deleteEdge}
                onLabelChange={(id, label) => updateEdge(id, { label })}
                onStartDrag={handleEdgeStartDrag}
                onEndDrag={handleEdgeEndDrag}
                onDragMove={handleEdgeDragMove}
                isDragging={edgeDrag?.edgeId === edge.id}
                dragMouseX={edgeDrag?.mouseX || 0}
                dragMouseY={edgeDrag?.mouseY || 0}
              />
            ))}
            
            {edgeDragLine && (
              <line
                x1={edgeDragLine.x1}
                y1={edgeDragLine.y1}
                x2={edgeDragLine.x2}
                y2={edgeDragLine.y2}
                stroke="#06B6D4"
                strokeWidth={2}
                strokeDasharray="4 4"
              />
            )}
            
            {draft && (
              <line
                x1={draftStart.x}
                y1={draftStart.y}
                x2={draft.mouseX}
                y2={draft.mouseY}
                stroke="#06B6D4"
                strokeWidth={2}
                strokeDasharray="4 4"
              />
            )}
            
            {nodes.map((node) => (
              <ShapeItem
                key={node.id}
                node={node}
                selected={selectedIds.includes(node.id)}
                onPointerDown={handlePointerDownNode}
                onDoubleClick={(id) => {
                  const n = nodes.find((x) => x.id === id)!
                  const text = prompt('编辑文字', n.text)
                  if (text !== null) updateNode(id, { text })
                }}
                onEdgeStart={handleEdgeStart}
              />
            ))}
          </g>
        </svg>
      </div>
    </div>
  )
}
