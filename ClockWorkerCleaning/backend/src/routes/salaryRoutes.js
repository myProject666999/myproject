const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salaryController');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth');

router.get('/hours', authMiddleware, salaryController.getWorkerWorkHours);
router.post('/hours/record', authMiddleware, salaryController.recordWorkHour);
router.get('/salaries', authMiddleware, salaryController.getWorkerSalaries);
router.get('/statistics', authMiddleware, salaryController.getSalaryStatistics);
router.post('/salaries/:id/confirm', authMiddleware, salaryController.confirmSalary);

router.post('/settle', authMiddleware, roleMiddleware('admin'), salaryController.settleSalary);

module.exports = router;
