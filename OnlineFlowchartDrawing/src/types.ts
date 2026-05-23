export type ShapeType =
  | 'rect'
  | 'ellipse'
  | 'diamond'
  | 'parallelogram'
  | 'hexagon'
  | 'note'
  | 'actor'
  | 'entity'
  | 'usecase'
  | 'document'
  | 'database'

export interface ShapeNode {
  id: string
  type: ShapeType
  x: number
  y: number
  width: number
  height: number
  text: string
  fill: string
  stroke: string
  strokeWidth: number
  fontSize: number
  color: string
  zIndex?: number
}

export type PortPosition = 'top' | 'bottom' | 'left' | 'right'

export interface Edge {
  id: string
  source: string
  target: string
  sourcePort?: PortPosition
  targetPort?: PortPosition
  label?: string
  style?: 'solid' | 'dashed'
}

export interface Project {
  id: string
  name: string
  nodes: ShapeNode[]
  edges: Edge[]
  created_at?: string
  updated_at?: string
}

export interface Template {
  id: string
  name: string
  category: 'flowchart' | 'uml' | 'er'
  thumbnail?: string
  nodes: ShapeNode[]
  edges: Edge[]
}
