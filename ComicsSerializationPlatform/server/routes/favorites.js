const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { auth } = require('../middleware/auth');

router.post('/toggle', auth, favoriteController.toggleFavorite);
router.get('/', auth, favoriteController.getFavorites);
router.get('/check/:comicId', auth, favoriteController.checkFavorite);

module.exports = router;
