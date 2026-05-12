const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth');

router.get('/available', couponController.getAvailableCoupons);
router.post('/claim', authMiddleware, couponController.claimCoupon);
router.get('/my', authMiddleware, couponController.getMyCoupons);
router.get('/usable', authMiddleware, couponController.getUsableCoupons);

router.post('/', authMiddleware, roleMiddleware('admin'), couponController.createCoupon);

module.exports = router;
