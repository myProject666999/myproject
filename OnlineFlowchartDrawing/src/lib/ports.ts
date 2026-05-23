import type { ShapeNode, PortPosition } from '@/types'

export function getPortPosition(node: ShapeNode, port: PortPosition): { x: number; y: number } {
  const cx = node.x + node.width / 2
  const cy = node.y + node.height / 2

  switch (port) {
    case 'top':
      return { x: cx, y: node.y }
    case 'bottom':
      return { x: cx, y: node.y + node.height }
    case 'left':
      return { x: node.x, y: cy }
    case 'right':
      return { x: node.x + node.width, y: cy }
    default:
      return { x: cx, y: node.y + node.height }
  }
}

export function getDefaultPorts(
  source: ShapeNode,
  target: ShapeNode
): { sourcePort: PortPosition; targetPort: PortPosition } {
  const sx = source.x + source.width / 2
  const sy = source.y + source.height / 2
  const tx = target.x + target.width / 2
  const ty = target.y + target.height / 2

  const dx = tx - sx
  const dy = ty - sy

  if (Math.abs(dx) > Math.abs(dy)) {
    return {
      sourcePort: dx > 0 ? 'right' : 'left',
      targetPort: dx > 0 ? 'left' : 'right',
    }
  } else {
    return {
      sourcePort: dy > 0 ? 'bottom' : 'top',
      targetPort: dy > 0 ? 'top' : 'bottom',
    }
  }
}

export const ALL_PORTS: PortPosition[] = ['top', 'right', 'bottom', 'left']
