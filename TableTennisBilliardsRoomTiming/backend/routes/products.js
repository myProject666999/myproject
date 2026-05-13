const express = require('express');
const pool = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const { category } = req.query;
    let sql = `
      SELECT p.*, pc.name as category_name
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      WHERE p.is_active = 1
    `;
    let params = [];
    
    if (category) {
      sql += ' AND p.category_id = ?';
      params.push(category);
    }
    
    sql += ' ORDER BY p.id DESC';
    
    const [products] = await pool.query(sql, params);
    res.json(products);
  } catch (error) {
    console.error('获取商品列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.get('/categories', verifyToken, async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM product_categories ORDER BY id');
    res.json(categories);
  } catch (error) {
    console.error('获取商品类别错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, category_id, price, cost_price, stock, unit, barcode, description } = req.body;
    
    const [result] = await pool.query(`
      INSERT INTO products (name, category_id, price, cost_price, stock, unit, barcode, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, category_id, price, cost_price, stock || 0, unit || '个', barcode, description]);
    
    res.json({ id: result.insertId, message: '商品添加成功' });
  } catch (error) {
    console.error('添加商品错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category_id, price, cost_price, stock, unit, barcode, description, is_active } = req.body;
    
    await pool.query(`
      UPDATE products 
      SET name = ?, category_id = ?, price = ?, cost_price = ?, stock = ?, 
          unit = ?, barcode = ?, description = ?, is_active = ?
      WHERE id = ?
    `, [name, category_id, price, cost_price, stock, unit, barcode, description, is_active, id]);
    
    res.json({ message: '商品更新成功' });
  } catch (error) {
    console.error('更新商品错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE products SET is_active = 0 WHERE id = ?', [id]);
    res.json({ message: '商品已下架' });
  } catch (error) {
    console.error('删除商品错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;
