const express = require('express');
const pool = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    let sql = `
      SELECT o.*, t.table_number, m.name as member_name, u.real_name as operator_name
      FROM orders o
      LEFT JOIN tables t ON o.table_id = t.id
      LEFT JOIN members m ON o.member_id = m.id
      LEFT JOIN users u ON o.operator_id = u.id
      WHERE 1=1
    `;
    let params = [];
    
    if (startDate) {
      sql += ' AND DATE(o.created_at) >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND DATE(o.created_at) <= ?';
      params.push(endDate);
    }
    if (status) {
      sql += ' AND o.status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY o.created_at DESC LIMIT 100';
    
    const [orders] = await pool.query(sql, params);
    res.json(orders);
  } catch (error) {
    console.error('获取订单列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { tableId, memberId, tableFee, productItems, paymentMethod, discount = 0 } = req.body;
    
    const orderNo = 'ORD' + Date.now();
    const productTotal = productItems?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
    const totalAmount = (tableFee || 0) + productTotal;
    const actualAmount = totalAmount - discount;
    
    const [orderResult] = await connection.query(`
      INSERT INTO orders (order_no, table_id, member_id, table_fee, product_total, 
                         total_amount, discount, actual_amount, payment_method, status, operator_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'paid', ?)
    `, [orderNo, tableId, memberId, tableFee || 0, productTotal, totalAmount, discount, actualAmount, paymentMethod, req.user.id]);
    
    const orderId = orderResult.insertId;
    
    if (productItems && productItems.length > 0) {
      for (const item of productItems) {
        await connection.query(`
          INSERT INTO order_items (order_id, product_id, product_name, price, quantity, subtotal)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [orderId, item.product_id, item.name, item.price, item.quantity, item.price * item.quantity]);
        
        await connection.query(`
          UPDATE products SET stock = stock - ? WHERE id = ?
        `, [item.quantity, item.product_id]);
      }
    }
    
    if (memberId && paymentMethod === 'member') {
      await connection.query(`
        UPDATE members 
        SET balance = balance - ?, total_consumption = total_consumption + ?
        WHERE id = ?
      `, [actualAmount, actualAmount, memberId]);
    }
    
    await connection.commit();
    
    res.json({ orderId, orderNo, message: '订单创建成功' });
  } catch (error) {
    await connection.rollback();
    console.error('创建订单错误:', error);
    res.status(500).json({ error: '服务器错误' });
  } finally {
    connection.release();
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [orders] = await pool.query(`
      SELECT o.*, t.table_number, m.name as member_name, u.real_name as operator_name
      FROM orders o
      LEFT JOIN tables t ON o.table_id = t.id
      LEFT JOIN members m ON o.member_id = m.id
      LEFT JOIN users u ON o.operator_id = u.id
      WHERE o.id = ?
    `, [id]);
    
    if (orders.length === 0) {
      return res.status(404).json({ error: '订单不存在' });
    }
    
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [id]);
    
    res.json({
      order: orders[0],
      items
    });
  } catch (error) {
    console.error('获取订单详情错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;
