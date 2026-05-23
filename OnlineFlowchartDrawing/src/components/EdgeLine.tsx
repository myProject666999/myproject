import type { Edge, ShapeNode } from '@/types'
import { getPortPosition } from '@/lib/ports'

interface Props {
  edge: Edge
  nodes: ShapeNode[]
  selected: boolean
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onLabelChange: (id: string, label: string) => void
  onStartDrag: (edgeId: string, isSource: boolean, x: number, y: number) => void
  onEndDrag: (targetNodeId: string | null, targetPort: string | null) => void
  onDragMove: (x: number, y: number) => void
  isDragging: boolean
  dragMouseX: number
  dragMouseY: number
}

export default function EdgeLine({
  edge,
  nodes,
  selected,
  onSelect,
  onDelete,
  onLabelChange,
  onStartDrag,
  onEndDrag,
  onDragMove,
  isDragging,
  dragMouseX,
  dragMouseY,
}: Props) {
  const src = nodes.find((n) => n.id === edge.source)
  const tgt = nodes.find((n) => n.id === edge.target)
  if (!src || !tgt) return null

  const sourcePort = edge.sourcePort || 'bottom'
  const targetPort = edge.targetPort || 'top'

  const srcPos = getPortPosition(src, sourcePort)
  const tgtPos = getPortPosition(tgt, targetPort)

  let sx = srcPos.x
  let sy = srcPos.y
  let tx = tgtPos.x
  let ty = tgtPos.y

  if (isDragging) {
    if (edge.id && onStartDrag) {
    }
  }

  const mx = (sx + tx) / 2
  const my = (sy + ty) / 2
  const dx = tx - sx
  const dy = ty - sy
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI

  const showSourceDrag = isDragging
  const showTargetDrag = isDragging

  return (
    <g
      onPointerDown={(e) => {
        e.stopPropagation()
        onSelect(edge.id)
      }}
      onDoubleClick={(e) => {
        e.stopPropagation()
        const label = prompt('连线标签', edge.label || '')
        if (label !== null) onLabelChange(edge.id, label)
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        if (confirm('删除连线?')) onDelete(edge.id)
      }}
    >
      <line
        x1={sx}
        y1={sy}
        x2={tx}
        y2={ty}
        stroke={selected ? '#4F46E5' : '#0F172A'}
        strokeWidth={selected ? 2.5 : 1.8}
        strokeDasharray={edge.style === 'dashed' ? '6 4' : undefined}
        markerEnd="url(#arrow)"
      />
      
      {selected && (
        <g>
          <circle
            cx={sx}
            cy={sy}
            r={7}
            fill="#06B6D4"
            stroke="#fff"
            strokeWidth={2}
            onPointerDown={(e) => {
              e.stopPropagation()
              onStartDrag(edge.id, true, sx, sy)
            }}
            onPointerMove={(e) => {
              if (isDragging && e.buttons === 1) {
                onDragMove(e.clientX, e.clientY)
              }
            }}
            onPointerUp={(e) => {
              e.stopPropagation()
              onEndDrag(null, null)
            }}
            style={{ cursor: 'grab' }}
          />
          
          <circle
            cx={tx}
            cy={ty}
            r={7}
            fill="#06B6D4"
            stroke="#fff"
            strokeWidth={2}
            onPointerDown={(e) => {
              e.stopPropagation()
              onStartDrag(edge.id, false, tx, ty)
            }}
            onPointerMove={(e) => {
              if (isDragging && e.buttons === 1) {
                onDragMove(e.clientX, e.clientY)
              }
            }}
            onPointerUp={(e) => {
              e.stopPropagation()
              onEndDrag(null, null)
            }}
            style={{ cursor: 'grab' }}
          />
        </g>
      )}
      
      {edge.label ? (
        <g transform={`translate(${mx},${my}) rotate(${angle})`}>
          <rect
            x={-edge.label.length * 4 - 6}
            y={-10}
            width={edge.label.length * 8 + 12}
            height={20}
            fill="#ffffff"
            stroke="#CBD5E1"
            rx={4}
          />
          <text
            x={0}
            y={0}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={12}
            fill="#334155"
            transform={`rotate(${-angle})`}
          >
            {edge.label}
          </text>
        </g>
      ) : null}
    </g>
  )
}
