const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const photoController = require('../controllers/photoController');
const { authMiddleware } = require('../middlewares/auth');

router.post('/', authMiddleware, bookingController.createBooking);
router.get('/', authMiddleware, bookingController.getBookings);
router.get('/worker', authMiddleware, bookingController.getWorkerBookings);
router.get('/:id', authMiddleware, bookingController.getBookingDetail);
router.put('/:id/status', authMiddleware, bookingController.updateBookingStatus);

router.get('/:bookingId/photos', authMiddleware, photoController.getBookingPhotos);
router.post('/:bookingId/photos/before', authMiddleware, photoController.uploadBeforePhoto);
router.post('/:bookingId/photos/after', authMiddleware, photoController.uploadAfterPhoto);

module.exports = router;
