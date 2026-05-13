const express = require('express');
const pool = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.get('/today', verifyToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const [revenueStats] = await pool.query(`
      SELECT 
        COUNT(*) as totalOrders,
        SUM(total_amount) as totalRevenue,
        SUM(actual_amount) as netRevenue,
        SUM(table_fee) as tableRevenue,
        SUM(product_total) as productRevenue
      FROM orders 
      WHERE DATE(created_at) = ? AND status = 'paid'
    `, [today]);
    
    const [paymentStats] = await pool.query(`
      SELECT 
        payment_method,
        COUNT(*) as count,
        SUM(actual_amount) as total
      FROM orders 
      WHERE DATE(created_at) = ? AND status = 'paid'
      GROUP BY payment_method
    `, [today]);
    
    const [topProducts] = await pool.query(`
      SELECT 
        oi.product_name,
        SUM(oi.quantity) as totalQuantity,
        SUM(oi.subtotal) as totalAmount
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE DATE(o.created_at) = ? AND o.status = 'paid'
      GROUP BY oi.product_id
      ORDER BY totalQuantity DESC
      LIMIT 10
    `, [today]);
    
    const [memberCount] = await pool.query(`
      SELECT COUNT(*) as count FROM members WHERE DATE(created_at) = ?
    `, [today]);
    
    const [rechargeStats] = await pool.query(`
      SELECT 
        SUM(recharge_amount) as totalRecharge,
        SUM(gift_amount) as totalGift
      FROM member_recharge_records 
      WHERE DATE(created_at) = ?
    `, [today]);
    
    res.json({
      date: today,
      revenue: revenueStats[0],
      paymentMethods: paymentStats,
      topProducts,
      newMemberCount: memberCount[0].count,
      memberRecharge: {
        totalRecharge: rechargeStats[0].totalRecharge || 0,
        totalGift: rechargeStats[0].totalGift || 0
      }
    });
  } catch (error) {
    console.error('获取今日营收错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.get('/statistics', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateCondition = '1=1';
    let params = [];
    
    if (startDate) {
      dateCondition += ' AND DATE(o.created_at) >= ?';
      params.push(startDate);
    }
    if (endDate) {
      dateCondition += ' AND DATE(o.created_at) <= ?';
      params.push(endDate);
    }
    
    const [revenueStats] = await pool.query(`
      SELECT 
        DATE(o.created_at) as date,
        COUNT(*) as totalOrders,
        SUM(o.total_amount) as totalRevenue,
        SUM(o.actual_amount) as netRevenue,
        SUM(o.table_fee) as tableRevenue,
        SUM(o.product_total) as productRevenue
      FROM orders o
      WHERE ${dateCondition} AND o.status = 'paid'
      GROUP BY DATE(o.created_at)
      ORDER BY date DESC
      LIMIT 30
    `, params);
    
    res.json(revenueStats);
  } catch (error) {
    console.error('获取统计数据错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;
