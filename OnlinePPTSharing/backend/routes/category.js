const express = require('express');
const CategoryController = require('../controllers/CategoryController');

const router = express.Router();

router.get('/', CategoryController.getList);
router.get('/hot', CategoryController.getHotCategories);

module.exports = router;
