const express = require('express');
const router = express.Router();
const workerController = require('../controllers/workerController');
const bookingController = require('../controllers/bookingController');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth');

router.get('/', workerController.getWorkers);
router.get('/:id', workerController.getWorkerDetail);
router.get('/:workerId/slots', bookingController.getWorkerAvailableSlots);
router.get('/:workerId/certificates', workerController.getWorkerCertificates);

router.post('/', authMiddleware, roleMiddleware('admin'), workerController.createWorker);
router.put('/:id', authMiddleware, roleMiddleware('admin'), workerController.updateWorker);
router.post('/:workerId/certificates', authMiddleware, roleMiddleware('admin'), workerController.addWorkerCertificate);
router.put('/certificates/:id', authMiddleware, roleMiddleware('admin'), workerController.updateWorkerCertificate);

module.exports = router;
