const express = require('express');
const router = express.Router();
const chapterController = require('../controllers/chapterController');
const { auth, optionalAuth, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/comic/:comicId', chapterController.getChapters);
router.get('/comic/:comicId/chapter/:chapterId', optionalAuth, chapterController.getChapter);
router.post('/comic/:comicId', auth, requireRole('author', 'admin'), upload.chapter.array('images', 50), chapterController.createChapter);
router.put('/:chapterId', auth, requireRole('author', 'admin'), upload.chapter.array('images', 50), chapterController.updateChapter);
router.delete('/:chapterId', auth, requireRole('author', 'admin'), chapterController.deleteChapter);

module.exports = router;
