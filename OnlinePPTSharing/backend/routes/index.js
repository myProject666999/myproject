const express = require('express');
const userRoutes = require('./user');
const documentRoutes = require('./document');
const categoryRoutes = require('./category');

const router = express.Router();

router.use('/users', userRoutes);
router.use('/documents', documentRoutes);
router.use('/categories', categoryRoutes);

router.get('/health', (req, res) => {
  res.json({
    code: 200,
    message: '服务运行正常',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
