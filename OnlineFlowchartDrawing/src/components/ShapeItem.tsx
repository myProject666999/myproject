import type { ShapeNode, PortPosition } from '@/types'
import { shapePath } from '@/lib/shapes'

interface Props {
  node: ShapeNode
  selected: boolean
  onPointerDown: (e: React.PointerEvent, id: string) => void
  onDoubleClick: (id: string) => void
  onEdgeStart: (id: string, port: PortPosition, e: React.PointerEvent) => void
}

const portPositions: { port: PortPosition; x: number; y: number; offsetX: number; offsetY: number }[] = [
  { port: 'top', x: 0.5, y: 0, offsetX: 0, offsetY: -16 },
  { port: 'right', x: 1, y: 0.5, offsetX: 16, offsetY: 0 },
  { port: 'bottom', x: 0.5, y: 1, offsetX: 0, offsetY: 16 },
  { port: 'left', x: 0, y: 0.5, offsetX: -16, offsetY: 0 },
]

export default function ShapeItem({
  node,
  selected,
  onPointerDown,
  onDoubleClick,
  onEdgeStart,
}: Props) {
  const textY = node.type === 'actor' ? node.height - 10 : node.height / 2
  
  const getPortCoords = (port: PortPosition) => {
    const pos = portPositions.find((p) => p.port === port)!
    return {
      cx: node.width * pos.x,
      cy: node.height * pos.y,
    }
  }

  return (
    <g
      transform={`translate(${node.x},${node.y})`}
      onPointerDown={(e) => onPointerDown(e, node.id)}
      onDoubleClick={() => onDoubleClick(node.id)}
      style={{ cursor: 'move' }}
    >
      <path
        d={shapePath(node.type, node.width, node.height)}
        fill={node.fill}
        stroke={selected ? '#4F46E5' : node.stroke}
        strokeWidth={selected ? Math.max(2.5, node.strokeWidth) : node.strokeWidth}
      />
      <text
        x={node.width / 2}
        y={textY}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={node.fontSize}
        fill={node.color}
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      >
        {(node.text || '').split('\\n').map((line, i) => (
          <tspan key={i} x={node.width / 2} dy={i === 0 ? 0 : node.fontSize * 1.3}>
            {line}
          </tspan>
        ))}
      </text>
      {selected && (
        <g>
          {[
            [0, 0],
            [node.width, 0],
            [node.width, node.height],
            [0, node.height],
          ].map(([x, y], i) => (
            <rect
              key={i}
              x={x - 4}
              y={y - 4}
              width={8}
              height={8}
              fill="#4F46E5"
              stroke="#fff"
              strokeWidth={1.5}
            />
          ))}
          
          {portPositions.map((pos) => {
            const { cx, cy } = getPortCoords(pos.port)
            return (
              <g key={pos.port}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={8}
                  fill="#06B6D4"
                  stroke="#fff"
                  strokeWidth={2}
                  onPointerDown={(e) => {
                    e.stopPropagation()
                    onEdgeStart(node.id, pos.port, e)
                  }}
                  style={{ cursor: 'crosshair' }}
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={3}
                  fill="#fff"
                  style={{ pointerEvents: 'none' }}
                />
              </g>
            )
          })}
        </g>
      )}
    </g>
  )
}
