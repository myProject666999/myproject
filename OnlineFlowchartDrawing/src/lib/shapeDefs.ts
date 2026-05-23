import type { ShapeType } from '@/types'

export interface ShapeDef {
  type: ShapeType
  label: string
  icon: string
  category: 'flow' | 'uml' | 'er' | 'basic'
}

export const SHAPE_DEFS: ShapeDef[] = [
  { type: 'rect', label: '矩形', icon: '▭', category: 'basic' },
  { type: 'ellipse', label: '椭圆', icon: '◯', category: 'basic' },
  { type: 'diamond', label: '菱形', icon: '◈', category: 'flow' },
  { type: 'parallelogram', label: '平行四边形', icon: '▰', category: 'flow' },
  { type: 'hexagon', label: '六边形', icon: '⬡', category: 'basic' },
  { type: 'note', label: '便签', icon: '📝', category: 'basic' },
  { type: 'document', label: '文档', icon: '📄', category: 'flow' },
  { type: 'database', label: '数据库', icon: '🗄️', category: 'er' },
  { type: 'actor', label: '参与者', icon: '👤', category: 'uml' },
  { type: 'usecase', label: '用例', icon: '◯', category: 'uml' },
  { type: 'entity', label: '实体', icon: '▭', category: 'er' },
]

export const CATEGORIES = [
  { key: 'basic', label: '基础' },
  { key: 'flow', label: '流程' },
  { key: 'uml', label: 'UML' },
  { key: 'er', label: 'ER' },
] as const
