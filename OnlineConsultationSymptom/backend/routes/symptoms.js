const express = require('express');
const router = express.Router();
const Symptom = require('../models/Symptom');

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let symptoms;
    
    if (category) {
      symptoms = await Symptom.getByCategory(category);
    } else {
      symptoms = await Symptom.getAll();
    }
    
    const categories = await Symptom.getCategories();
    
    const groupedSymptoms = categories.map(cat => ({
      category: cat,
      symptoms: symptoms.filter(s => s.category === cat)
    }));
    
    res.json({
      success: true,
      data: groupedSymptoms
    });
  } catch (error) {
    console.error('获取症状列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取症状列表失败'
    });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const categories = await Symptom.getCategories();
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('获取症状分类失败:', error);
    res.status(500).json({
      success: false,
      message: '获取症状分类失败'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const symptom = await Symptom.getById(req.params.id);
    if (!symptom) {
      return res.status(404).json({
        success: false,
        message: '症状不存在'
      });
    }
    res.json({
      success: true,
      data: symptom
    });
  } catch (error) {
    console.error('获取症状详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取症状详情失败'
    });
  }
});

module.exports = router;
