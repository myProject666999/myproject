import { Router, type Request, type Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import pool from '../db.js'

const router = Router()

router.get('/', async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, created_at, updated_at FROM project ORDER BY updated_at DESC'
    )
    res.json({ success: true, data: rows })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const [projects] = await pool.query(
      'SELECT id, name, created_at, updated_at FROM project WHERE id = ?',
      [id]
    )
    const project = (projects as any[])[0]
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' })
    }
    const [shapes] = await pool.query(
      'SELECT id, kind, x, y, width, height, text, fill, stroke, stroke_width, font_size, color, z_index FROM shape WHERE project_id = ? ORDER BY z_index, id',
      [id]
    )
    const [edges] = await pool.query(
      'SELECT id, source_id, target_id, label, style FROM edge WHERE project_id = ?',
      [id]
    )
    res.json({
      success: true,
      data: {
        ...project,
        nodes: (shapes as any[]).map((s) => ({
          id: s.id,
          type: s.kind,
          x: s.x,
          y: s.y,
          width: s.width,
          height: s.height,
          text: s.text,
          fill: s.fill,
          stroke: s.stroke,
          strokeWidth: s.stroke_width,
          fontSize: s.font_size,
          color: s.color,
          zIndex: s.z_index,
        })),
        edges: (edges as any[]).map((e) => ({
          id: e.id,
          source: e.source_id,
          target: e.target_id,
          label: e.label,
          style: e.style,
        })),
      },
    })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.post('/', async (req: Request, res: Response) => {
  const conn = await pool.getConnection()
  try {
    const { id, name, nodes = [], edges = [] } = req.body as any
    if (!id || !name) {
      return res.status(400).json({ success: false, error: 'id and name are required' })
    }
    await conn.beginTransaction()
    const [existing] = await conn.query('SELECT id FROM project WHERE id = ?', [id])
    if ((existing as any[]).length > 0) {
      await conn.query('UPDATE project SET name = ? WHERE id = ?', [name, id])
      await conn.query('DELETE FROM shape WHERE project_id = ?', [id])
      await conn.query('DELETE FROM edge WHERE project_id = ?', [id])
    } else {
      await conn.query('INSERT INTO project (id, name) VALUES (?, ?)', [id, name])
    }
    
    // 为节点生成新的唯一 ID，避免主键冲突
    const idMap: Record<string, string> = {}
    const nodesWithNewIds = nodes.map((n: any) => {
      const newId = uuidv4()
      idMap[n.id] = newId
      return {
        ...n,
        id: newId
      }
    })
    
    for (const n of nodesWithNewIds) {
      await conn.query(
        'INSERT INTO shape (id, project_id, kind, x, y, width, height, text, fill, stroke, stroke_width, font_size, color, z_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          n.id,
          id,
          n.type || 'rect',
          n.x,
          n.y,
          n.width,
          n.height,
          n.text || '',
          n.fill || '#FFFFFF',
          n.stroke || '#000000',
          n.strokeWidth ?? 1.5,
          n.fontSize ?? 14,
          n.color || '#111111',
          n.zIndex ?? 0,
        ]
      )
    }
    
    // 更新连线中的节点引用
    const edgesWithNewIds = edges.map((e: any) => ({
      ...e,
      id: uuidv4(), // 为连线也生成新的 ID
      source: idMap[e.source] || e.source,
      target: idMap[e.target] || e.target
    }))
    
    for (const e of edgesWithNewIds) {
      await conn.query(
        'INSERT INTO edge (id, project_id, source_id, target_id, label, style) VALUES (?, ?, ?, ?, ?, ?)',
        [e.id, id, e.source, e.target, e.label || '', e.style || 'solid']
      )
    }
    
    await conn.commit()
    res.json({ success: true, data: { id } })
  } catch (err: any) {
    await conn.rollback()
    res.status(500).json({ success: false, error: err.message })
  } finally {
    conn.release()
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await pool.query('DELETE FROM project WHERE id = ?', [req.params.id])
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
