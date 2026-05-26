const express = require('express');
const router = express.Router();
const Article = require('../models/Article');

router.get('/', async (req, res) => {
  try {
    const { category, page = 1, pageSize = 10 } = req.query;
    const pageNum = parseInt(page);
    const size = parseInt(pageSize);
    
    let result;
    if (category) {
      result = await Article.getByCategory(category, pageNum, size);
    } else {
      result = await Article.getAll(pageNum, size);
    }
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取文章列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取文章列表失败'
    });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const categories = await Article.getCategories();
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('获取文章分类失败:', error);
    res.status(500).json({
      success: false,
      message: '获取文章分类失败'
    });
  }
});

router.get('/popular', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const articles = await Article.getPopular(parseInt(limit));
    res.json({
      success: true,
      data: articles
    });
  } catch (error) {
    console.error('获取热门文章失败:', error);
    res.status(500).json({
      success: false,
      message: '获取热门文章失败'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const article = await Article.getById(req.params.id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }
    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('获取文章详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取文章详情失败'
    });
  }
});

module.exports = router;
