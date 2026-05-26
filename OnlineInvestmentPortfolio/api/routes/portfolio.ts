import { Router, Response } from 'express';
import pool from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const [positions] = await pool.query(
      `SELECT p.id, p.symbol, p.shares, p.avg_cost, 
              s.name, s.price, s.price_change as \`change\`, s.change_percent
       FROM positions p
       LEFT JOIN stocks s ON p.symbol = s.symbol
       WHERE p.user_id = ? AND p.shares > 0
       ORDER BY p.updated_at DESC`,
      [userId]
    ) as any;

    const positionsWithProfit = positions.map((pos: any) => {
      const marketValue = pos.shares * pos.price;
      const costValue = pos.shares * pos.avg_cost;
      const profit = marketValue - costValue;
      const profitPercent = costValue > 0 ? (profit / costValue) * 100 : 0;

      return {
        ...pos,
        marketValue,
        profit,
        profitPercent
      };
    });

    const [userData] = await pool.query(
      'SELECT balance FROM users WHERE id = ?',
      [userId]
    ) as any;

    const balance = userData[0]?.balance || 0;
    const totalMarketValue = positionsWithProfit.reduce(
      (sum: number, pos: any) => sum + pos.marketValue,
      0
    );
    const totalAssets = balance + totalMarketValue;

    res.json({
      balance,
      totalMarketValue,
      totalAssets,
      positions: positionsWithProfit
    });
  } catch (error) {
    console.error('获取持仓列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/buy', authMiddleware, async (req: AuthRequest, res: Response) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const userId = req.user!.id;
    const { symbol, shares, price } = req.body;

    if (!symbol || !shares || !price) {
      return res.status(400).json({ message: '请填写完整信息' });
    }

    if (shares <= 0) {
      return res.status(400).json({ message: '购买数量必须大于0' });
    }

    const total = shares * price;

    const [userData] = await connection.query(
      'SELECT balance FROM users WHERE id = ? FOR UPDATE',
      [userId]
    ) as any;

    const balance = userData[0]?.balance || 0;

    if (balance < total) {
      await connection.rollback();
      return res.status(400).json({ message: '余额不足' });
    }

    await connection.query(
      'UPDATE users SET balance = balance - ? WHERE id = ?',
      [total, userId]
    );

    const [existingPositions] = await connection.query(
      'SELECT id, shares, avg_cost FROM positions WHERE user_id = ? AND symbol = ? FOR UPDATE',
      [userId, symbol]
    ) as any;

    if (existingPositions.length > 0) {
      const existing = existingPositions[0];
      const newShares = existing.shares + shares;
      const newAvgCost = (existing.shares * existing.avg_cost + total) / newShares;

      await connection.query(
        'UPDATE positions SET shares = ?, avg_cost = ? WHERE id = ?',
        [newShares, newAvgCost, existing.id]
      );
    } else {
      await connection.query(
        'INSERT INTO positions (user_id, symbol, shares, avg_cost) VALUES (?, ?, ?, ?)',
        [userId, symbol, shares, price]
      );
    }

    await connection.query(
      'INSERT INTO transactions (user_id, symbol, type, shares, price, total) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, symbol, 'buy', shares, price, total]
    );

    await connection.commit();

    res.json({ message: '买入成功' });
  } catch (error) {
    await connection.rollback();
    console.error('买入股票错误:', error);
    res.status(500).json({ message: '服务器错误' });
  } finally {
    connection.release();
  }
});

router.post('/sell', authMiddleware, async (req: AuthRequest, res: Response) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const userId = req.user!.id;
    const { symbol, shares, price } = req.body;

    if (!symbol || !shares || !price) {
      return res.status(400).json({ message: '请填写完整信息' });
    }

    if (shares <= 0) {
      return res.status(400).json({ message: '卖出数量必须大于0' });
    }

    const [existingPositions] = await connection.query(
      'SELECT id, shares, avg_cost FROM positions WHERE user_id = ? AND symbol = ? FOR UPDATE',
      [userId, symbol]
    ) as any;

    if (existingPositions.length === 0 || existingPositions[0].shares < shares) {
      await connection.rollback();
      return res.status(400).json({ message: '持仓不足' });
    }

    const total = shares * price;
    const existing = existingPositions[0];
    const newShares = existing.shares - shares;

    if (newShares === 0) {
      await connection.query('DELETE FROM positions WHERE id = ?', [existing.id]);
    } else {
      await connection.query(
        'UPDATE positions SET shares = ? WHERE id = ?',
        [newShares, existing.id]
      );
    }

    await connection.query(
      'UPDATE users SET balance = balance + ? WHERE id = ?',
      [total, userId]
    );

    await connection.query(
      'INSERT INTO transactions (user_id, symbol, type, shares, price, total) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, symbol, 'sell', shares, price, total]
    );

    await connection.commit();

    res.json({ message: '卖出成功' });
  } catch (error) {
    await connection.rollback();
    console.error('卖出股票错误:', error);
    res.status(500).json({ message: '服务器错误' });
  } finally {
    connection.release();
  }
});

router.get('/transactions', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { page = 1, pageSize = 20 } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(pageSize as string);

    const [transactions] = await pool.query(
      `SELECT t.id, t.symbol, t.type, t.shares, t.price, t.total, t.created_at, s.name
       FROM transactions t
       LEFT JOIN stocks s ON t.symbol = s.symbol
       WHERE t.user_id = ?
       ORDER BY t.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, parseInt(pageSize as string), offset]
    ) as any;

    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM transactions WHERE user_id = ?',
      [userId]
    ) as any;

    res.json({
      transactions,
      total: countResult[0].total,
      page: parseInt(page as string),
      pageSize: parseInt(pageSize as string)
    });
  } catch (error) {
    console.error('获取交易记录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

export default router;
