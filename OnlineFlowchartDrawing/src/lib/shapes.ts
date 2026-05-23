import type { ShapeNode } from '@/types'

export function shapePath(type: ShapeNode['type'], w: number, h: number): string {
  switch (type) {
    case 'rect':
    case 'note':
    case 'entity':
      return `M0 0 H${w} V${h} H0 Z`
    case 'ellipse':
    case 'usecase':
      return `M${w / 2} 0 A${w / 2} ${h / 2} 0 1 0 ${w / 2} ${h} A${w / 2} ${h / 2} 0 1 0 ${w / 2} 0 Z`
    case 'diamond':
      return `M${w / 2} 0 L${w} ${h / 2} L${w / 2} ${h} L0 ${h / 2} Z`
    case 'parallelogram':
      return `M${w * 0.2} 0 H${w} L${w * 0.8} ${h} H0 Z`
    case 'hexagon':
      return `M${w * 0.25} 0 H${w * 0.75} L${w} ${h / 2} L${w * 0.75} ${h} H${w * 0.25} L0 ${h / 2} Z`
    case 'document':
      return `M0 0 H${w} L${w - 10} 8 H10 L0 0 Z M0 0 V${h} H${w} V8 M0 ${h * 0.85} H${w}`
    case 'database':
      return `M0 ${h * 0.2} A${w / 2} ${h * 0.2} 0 0 0 ${w} ${h * 0.2} V${h * 0.8} A${w / 2} ${h * 0.2} 0 0 1 0 ${h * 0.8} Z M0 ${h * 0.2} A${w / 2} ${h * 0.2} 0 0 1 ${w} ${h * 0.2}`
    case 'actor':
      return `M${w / 2} ${h * 0.15} m-${w * 0.1} 0 a${w * 0.1} ${h * 0.1} 0 1 0 ${w * 0.2} 0 a${w * 0.1} ${h * 0.1} 0 1 0 -${w * 0.2} 0 M${w / 2} ${h * 0.3} L${w / 2} ${h * 0.7} M${w * 0.2} ${h * 0.5} L${w * 0.8} ${h * 0.5} M${w / 2} ${h * 0.7} L${w * 0.3} ${h} M${w / 2} ${h * 0.7} L${w * 0.7} ${h}`
    default:
      return `M0 0 H${w} V${h} H0 Z`
  }
}
