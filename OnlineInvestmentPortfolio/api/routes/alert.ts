import { Router, Response } from 'express';
import pool from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const [alerts] = await pool.query(
      `SELECT a.id, a.symbol, a.type, a.threshold, a.enabled, a.triggered, a.created_at, s.name, s.price
       FROM alerts a
       LEFT JOIN stocks s ON a.symbol = s.symbol
       WHERE a.user_id = ?
       ORDER BY a.created_at DESC`,
      [userId]
    ) as any;

    res.json(alerts);
  } catch (error) {
    console.error('获取提醒列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { symbol, type, threshold } = req.body;

    if (!symbol || !type || threshold === undefined) {
      return res.status(400).json({ message: '请填写完整信息' });
    }

    if (!['price_above', 'price_below', 'change_percent'].includes(type)) {
      return res.status(400).json({ message: '无效的提醒类型' });
    }

    await pool.query(
      'INSERT INTO alerts (user_id, symbol, type, threshold, enabled, triggered) VALUES (?, ?, ?, ?, 1, 0)',
      [userId, symbol, type, threshold]
    );

    res.status(201).json({ message: '提醒创建成功' });
  } catch (error) {
    console.error('创建提醒错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const alertId = req.params.id;
    const { enabled, threshold } = req.body;

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (enabled !== undefined) {
      updateFields.push('enabled = ?');
      updateValues.push(enabled ? 1 : 0);
    }

    if (threshold !== undefined) {
      updateFields.push('threshold = ?');
      updateValues.push(threshold);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: '没有需要更新的字段' });
    }

    updateValues.push(userId, alertId);

    const [result] = await pool.query(
      `UPDATE alerts SET ${updateFields.join(', ')} WHERE user_id = ? AND id = ?`,
      updateValues
    ) as any;

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '未找到该提醒' });
    }

    res.json({ message: '提醒更新成功' });
  } catch (error) {
    console.error('更新提醒错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const alertId = req.params.id;

    const [result] = await pool.query(
      'DELETE FROM alerts WHERE user_id = ? AND id = ?',
      [userId, alertId]
    ) as any;

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '未找到该提醒' });
    }

    res.json({ message: '提醒删除成功' });
  } catch (error) {
    console.error('删除提醒错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

export default router;
