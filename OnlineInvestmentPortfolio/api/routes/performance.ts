import { Router, Response } from 'express';
import pool from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { days = 30 } = req.query;
    const numDays = parseInt(days as string) || 30;

    const [history] = await pool.query(
      `SELECT date, total_value, cash_balance
       FROM performance_history
       WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       ORDER BY date ASC`,
      [userId, numDays]
    ) as any;

    const [portfolioData] = await pool.query(
      `SELECT p.shares, p.avg_cost, s.price
       FROM positions p
       LEFT JOIN stocks s ON p.symbol = s.symbol
       WHERE p.user_id = ? AND p.shares > 0`,
      [userId]
    ) as any;

    const [userData] = await pool.query(
      'SELECT balance FROM users WHERE id = ?',
      [userId]
    ) as any;

    const balance = userData[0]?.balance || 0;
    let totalMarketValue = 0;
    let totalCost = 0;

    portfolioData.forEach((pos: any) => {
      totalMarketValue += pos.shares * pos.price;
      totalCost += pos.shares * pos.avg_cost;
    });

    const currentTotalValue = balance + totalMarketValue;
    const initialInvestment = 100000;
    const totalProfit = currentTotalValue - initialInvestment;
    const totalProfitPercent = (totalProfit / initialInvestment) * 100;

    const performanceData = history.map((item: any) => ({
      date: item.date,
      totalValue: item.total_value,
      cashBalance: item.cash_balance,
      profit: item.total_value - initialInvestment,
      profitPercent: ((item.total_value - initialInvestment) / initialInvestment) * 100
    }));

    const today = new Date().toISOString().split('T')[0];
    if (performanceData.length === 0 || performanceData[performanceData.length - 1].date !== today) {
      performanceData.push({
        date: today,
        totalValue: currentTotalValue,
        cashBalance: balance,
        profit: totalProfit,
        profitPercent: totalProfitPercent
      });
    }

    res.json({
      currentTotalValue,
      balance,
      totalMarketValue,
      totalProfit,
      totalProfitPercent,
      history: performanceData
    });
  } catch (error) {
    console.error('获取收益数据错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

export default router;
