const express = require('express');
const router = express.Router();
const photoController = require('../controllers/photoController');
const { authenticate } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.get('/', authenticate, photoController.list);
router.post('/upload', authenticate, upload.array('photos', 100), photoController.upload);
router.post('/select', authenticate, photoController.selectPhotos);
router.put('/:id/remark', authenticate, photoController.updatePhotoRemark);
router.put('/:id', authenticate, photoController.update);
router.delete('/:id', authenticate, photoController.remove);

module.exports = router;
