const express = require('express');
const router = express.Router();
const comicController = require('../controllers/comicController');
const { auth, optionalAuth, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', comicController.getComics);
router.get('/my', auth, requireRole('author', 'admin'), comicController.getUserComics);
router.get('/:id', optionalAuth, comicController.getComicById);
router.post('/', auth, requireRole('author', 'admin'), upload.cover.single('cover'), comicController.createComic);
router.put('/:id', auth, requireRole('author', 'admin'), upload.cover.single('cover'), comicController.updateComic);
router.delete('/:id', auth, requireRole('author', 'admin'), comicController.deleteComic);

module.exports = router;
