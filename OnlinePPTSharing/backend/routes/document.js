const express = require('express');
const DocumentController = require('../controllers/DocumentController');
const { auth, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', DocumentController.getList);
router.get('/search', DocumentController.search);
router.get('/my', auth, DocumentController.getMyDocuments);
router.get('/my/favorites', auth, DocumentController.getMyFavorites);
router.get('/:id', optionalAuth, DocumentController.getDetail);
router.post('/', auth, upload.single('file'), DocumentController.upload);
router.put('/:id', auth, DocumentController.update);
router.delete('/:id', auth, DocumentController.delete);
router.get('/:id/download', optionalAuth, DocumentController.download);
router.post('/:id/like', auth, DocumentController.like);
router.post('/:id/favorite', auth, DocumentController.favorite);
router.post('/:id/share', optionalAuth, DocumentController.share);
router.get('/:id/comments', DocumentController.getComments);
router.post('/:id/comments', auth, DocumentController.addComment);

module.exports = router;
