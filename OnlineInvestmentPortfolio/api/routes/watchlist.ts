import { Router, Response } from 'express';
import pool from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const [watchlist] = await pool.query(
      `SELECT w.id, w.symbol, w.added_at, s.name, s.price, s.price_change as \`change\`, s.change_percent, s.volume
       FROM watchlist w
       LEFT JOIN stocks s ON w.symbol = s.symbol
       WHERE w.user_id = ?
       ORDER BY w.added_at DESC`,
      [userId]
    ) as any;

    res.json(watchlist);
  } catch (error) {
    console.error('获取自选股列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { symbol } = req.body;

    if (!symbol) {
      return res.status(400).json({ message: '请提供股票代码' });
    }

    const [existing] = await pool.query(
      'SELECT id FROM watchlist WHERE user_id = ? AND symbol = ?',
      [userId, symbol]
    ) as any;

    if (existing.length > 0) {
      return res.status(400).json({ message: '该股票已在自选列表中' });
    }

    await pool.query(
      'INSERT INTO watchlist (user_id, symbol) VALUES (?, ?)',
      [userId, symbol]
    );

    res.status(201).json({ message: '添加成功' });
  } catch (error) {
    console.error('添加自选股错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.delete('/:symbol', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { symbol } = req.params;

    const [result] = await pool.query(
      'DELETE FROM watchlist WHERE user_id = ? AND symbol = ?',
      [userId, symbol]
    ) as any;

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '未找到该自选股' });
    }

    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除自选股错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

export default router;
