const express = require('express');
const router = express.Router();
const History = require('../models/History');

const getUserId = (req) => {
  return req.headers['x-user-id'];
};

router.get('/', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '用户ID缺失'
      });
    }

    const { page = 1, pageSize = 10 } = req.query;
    const result = await History.getByUserId(userId, parseInt(page), parseInt(pageSize));
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取历史记录失败:', error);
    res.status(500).json({
      success: false,
      message: '获取历史记录失败'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '用户ID缺失'
      });
    }

    const record = await History.getById(req.params.id, userId);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: '记录不存在'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('获取历史记录详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取历史记录详情失败'
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '用户ID缺失'
      });
    }

    const deleted = await History.delete(req.params.id, userId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: '记录不存在'
      });
    }
    
    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除历史记录失败:', error);
    res.status(500).json({
      success: false,
      message: '删除历史记录失败'
    });
  }
});

module.exports = router;
