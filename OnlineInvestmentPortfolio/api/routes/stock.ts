import { Router, Response } from 'express';
import pool from '../config/database';
import redis from '../config/redis';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const CACHE_TTL = 30;

router.get('/search', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ message: '请提供搜索关键词' });
    }

    const [stocks] = await pool.query(
      'SELECT symbol, name, price FROM stocks WHERE symbol LIKE ? OR name LIKE ? LIMIT 20',
      [`%${q}%`, `%${q}%`]
    ) as any;

    res.json(stocks);
  } catch (error) {
    console.error('搜索股票错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/:symbol', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { symbol } = req.params;
    const cacheKey = `stock:quote:${symbol}`;

    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    const [stocks] = await pool.query(
      'SELECT symbol, name, price, price_change as `change`, change_percent, volume, market_cap, pe_ratio FROM stocks WHERE symbol = ?',
      [symbol]
    ) as any;

    if (stocks.length === 0) {
      return res.status(404).json({ message: '未找到该股票' });
    }

    const stock = stocks[0];
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(stock));

    res.json(stock);
  } catch (error) {
    console.error('获取股票详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/:symbol/history', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { symbol } = req.params;
    const { days = 30 } = req.query;
    const cacheKey = `stock:history:${symbol}:${days}`;

    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    const [stockData] = await pool.query(
      'SELECT price FROM stocks WHERE symbol = ?',
      [symbol]
    ) as any;

    if (stockData.length === 0) {
      return res.status(404).json({ message: '未找到该股票' });
    }

    const basePrice = stockData[0].price;
    const history = [];
    const numDays = parseInt(days as string) || 30;

    for (let i = numDays; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const volatility = 0.02;
      const randomChange = (Math.random() - 0.5) * 2 * volatility;
      const trendFactor = (numDays - i) / numDays * 0.1;
      const price = basePrice * (1 + randomChange + trendFactor - 0.05);

      history.push({
        date: date.toISOString().split('T')[0],
        open: parseFloat((price * (1 - Math.random() * 0.01)).toFixed(2)),
        high: parseFloat((price * (1 + Math.random() * 0.02)).toFixed(2)),
        low: parseFloat((price * (1 - Math.random() * 0.02)).toFixed(2)),
        close: parseFloat(price.toFixed(2)),
        volume: Math.floor(Math.random() * 10000000) + 1000000
      });
    }

    await redis.setex(cacheKey, CACHE_TTL * 10, JSON.stringify(history));

    res.json(history);
  } catch (error) {
    console.error('获取股票历史数据错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

export default router;
