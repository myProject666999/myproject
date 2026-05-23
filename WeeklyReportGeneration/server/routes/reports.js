const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/', reportController.getAllReports);
router.get('/:id', reportController.getReportById);
router.get('/week/:weekStart/:weekEnd', reportController.getReportsByWeek);
router.post('/', reportController.createReport);
router.put('/:id', reportController.updateReport);
router.delete('/:id', reportController.deleteReport);
router.post('/:id/publish', reportController.publishReport);
router.post('/:id/archive', reportController.archiveReport);
router.post('/:id/export', reportController.exportReport);
router.post('/:id/ai-polish', reportController.aiPolishReport);

module.exports = router;
