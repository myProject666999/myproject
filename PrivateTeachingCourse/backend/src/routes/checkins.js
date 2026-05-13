const express = require('express');
const {
  generateCheckinQR,
  scanCheckin,
  getMyCheckins
} = require('../controllers/checkinController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', getMyCheckins);
router.get('/qr/:bookingId', generateCheckinQR);
router.post('/scan', requireRole(['coach', 'admin']), scanCheckin);

module.exports = router;
