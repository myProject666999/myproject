const express = require('express');
const {
  getMyBookings,
  getBookingById,
  createBooking,
  cancelBooking
} = require('../controllers/bookingController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', getMyBookings);
router.get('/:id', getBookingById);
router.post('/', createBooking);
router.post('/:id/cancel', cancelBooking);

module.exports = router;
