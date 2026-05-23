import { Router, type Request, type Response } from 'express'
import pool from '../db.js'

const router = Router()

router.get('/', async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, category, thumbnail, created_at FROM template ORDER BY category, name'
    )
    res.json({ success: true, data: rows })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, category, nodes_json, edges_json FROM template WHERE id = ?',
      [req.params.id]
    )
    const tpl = (rows as any[])[0]
    if (!tpl) return res.status(404).json({ success: false, error: 'Not found' })
    
    const nodes = typeof tpl.nodes_json === 'string' ? JSON.parse(tpl.nodes_json) : tpl.nodes_json
    const edges = typeof tpl.edges_json === 'string' ? JSON.parse(tpl.edges_json) : tpl.edges_json
    
    res.json({
      success: true,
      data: {
        id: tpl.id,
        name: tpl.name,
        category: tpl.category,
        nodes,
        edges,
      },
    })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const { id, name, category, nodes = [], edges = [], thumbnail } = req.body as any
    if (!id || !name || !category) {
      return res.status(400).json({ success: false, error: 'Missing fields' })
    }
    await pool.query(
      'INSERT INTO template (id, name, category, thumbnail, nodes_json, edges_json) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, category, thumbnail || null, JSON.stringify(nodes), JSON.stringify(edges)]
    )
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
