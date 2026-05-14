const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
require('dotenv').config();

const db = require('./config/database');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({
    message: '高尔夫练习场预约系统API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '服务运行正常' });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    res.json({ 
      status: 'success', 
      message: '数据库连接正常',
      result: rows[0].result
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: '数据库连接失败',
      error: error.message
    });
  }
});

app.get('/api/bays', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM hitting_bays ORDER BY bay_number');
    res.json({ 
      status: 'success', 
      data: rows,
      total: rows.length
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: '获取打位列表失败',
      error: error.message
    });
  }
});

app.get('/api/coaches', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM coaches WHERE status = 1 ORDER BY id');
    res.json({ 
      status: 'success', 
      data: rows,
      total: rows.length
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: '获取教练列表失败',
      error: error.message
    });
  }
});

app.get('/api/equipment', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.*, c.category_name 
      FROM equipment e 
      LEFT JOIN equipment_categories c ON e.category_id = c.id 
      WHERE e.status = 1 
      ORDER BY e.id
    `);
    res.json({ 
      status: 'success', 
      data: rows,
      total: rows.length
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: '获取球具列表失败',
      error: error.message
    });
  }
});

app.get('/api/card-types', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM card_types WHERE status = 1 ORDER BY price');
    res.json({ 
      status: 'success', 
      data: rows,
      total: rows.length
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: '获取卡类型失败',
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

module.exports = app;
