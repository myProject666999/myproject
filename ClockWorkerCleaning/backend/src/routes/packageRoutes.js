const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth');

router.get('/', packageController.getPackages);
router.get('/:id', packageController.getPackageDetail);

router.post('/', authMiddleware, roleMiddleware('admin'), packageController.createPackage);
router.put('/:id', authMiddleware, roleMiddleware('admin'), packageController.updatePackage);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), packageController.deletePackage);

module.exports = router;
