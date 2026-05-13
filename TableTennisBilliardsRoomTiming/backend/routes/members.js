const express = require('express');
const pool = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const { keyword } = req.query;
    let sql = `
      SELECT * FROM members WHERE status = 'active'
    `;
    let params = [];
    
    if (keyword) {
      sql += ' AND (name LIKE ? OR phone LIKE ? OR member_no LIKE ?)';
      const search = `%${keyword}%`;
      params.push(search, search, search);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const [members] = await pool.query(sql, params);
    res.json(members);
  } catch (error) {
    console.error('获取会员列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { name, phone, gender, initialRecharge, paymentMethod } = req.body;
    
    const memberNo = 'M' + Date.now().toString().slice(-10);
    
    const [result] = await connection.query(`
      INSERT INTO members (member_no, name, phone, gender, balance, total_recharge)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [memberNo, name, phone, gender, initialRecharge || 0, initialRecharge || 0]);
    
    if (initialRecharge && initialRecharge > 0) {
      await connection.query(`
        INSERT INTO member_recharge_records (member_id, recharge_amount, gift_amount, payment_method, operator_id)
        VALUES (?, ?, 0, ?, ?)
      `, [result.insertId, initialRecharge, paymentMethod || 'cash', req.user.id]);
    }
    
    await connection.commit();
    
    res.json({ 
      id: result.insertId, 
      memberNo,
      message: '会员添加成功' 
    });
  } catch (error) {
    await connection.rollback();
    console.error('添加会员错误:', error);
    res.status(500).json({ error: '服务器错误' });
  } finally {
    connection.release();
  }
});

router.post('/:id/recharge', verifyToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const { amount, giftAmount = 0, paymentMethod = 'cash' } = req.body;
    
    await connection.query(`
      UPDATE members 
      SET balance = balance + ?, total_recharge = total_recharge + ?
      WHERE id = ?
    `, [amount + giftAmount, amount, id]);
    
    await connection.query(`
      INSERT INTO member_recharge_records (member_id, recharge_amount, gift_amount, payment_method, operator_id)
      VALUES (?, ?, ?, ?, ?)
    `, [id, amount, giftAmount, paymentMethod, req.user.id]);
    
    await connection.commit();
    
    res.json({ message: '充值成功' });
  } catch (error) {
    await connection.rollback();
    console.error('会员充值错误:', error);
    res.status(500).json({ error: '服务器错误' });
  } finally {
    connection.release();
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [members] = await pool.query('SELECT * FROM members WHERE id = ?', [id]);
    
    if (members.length === 0) {
      return res.status(404).json({ error: '会员不存在' });
    }
    
    const [rechargeRecords] = await pool.query(`
      SELECT r.*, u.real_name as operator_name
      FROM member_recharge_records r
      LEFT JOIN users u ON r.operator_id = u.id
      WHERE r.member_id = ?
      ORDER BY r.created_at DESC
      LIMIT 20
    `, [id]);
    
    res.json({
      member: members[0],
      rechargeRecords
    });
  } catch (error) {
    console.error('获取会员详情错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;
