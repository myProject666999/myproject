const express = require('express');
const router = express.Router();
const Disease = require('../models/Disease');

router.get('/', async (req, res) => {
  try {
    const diseases = await Disease.getAll();
    res.json({
      success: true,
      data: diseases
    });
  } catch (error) {
    console.error('获取疾病列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取疾病列表失败'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const disease = await Disease.getById(req.params.id);
    if (!disease) {
      return res.status(404).json({
        success: false,
        message: '疾病不存在'
      });
    }
    res.json({
      success: true,
      data: disease
    });
  } catch (error) {
    console.error('获取疾病详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取疾病详情失败'
    });
  }
});

module.exports = router;
