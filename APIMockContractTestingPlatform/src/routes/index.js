const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const projectController = require('../controllers/projectController');
const apiController = require('../controllers/apiController');
const mockController = require('../controllers/mockController');
const contractController = require('../controllers/contractController');
const logController = require('../controllers/logController');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authenticateToken, authController.getCurrentUser);

router.get('/projects', authenticateToken, projectController.getProjects);
router.get('/projects/:id', authenticateToken, projectController.getProject);
router.post('/projects', authenticateToken, projectController.createProject);
router.put('/projects/:id', authenticateToken, projectController.updateProject);
router.delete('/projects/:id', authenticateToken, projectController.deleteProject);

router.get('/apis', authenticateToken, apiController.getApis);
router.get('/apis/:id', authenticateToken, apiController.getApi);
router.post('/apis', authenticateToken, apiController.createApi);
router.put('/apis/:id', authenticateToken, apiController.updateApi);
router.delete('/apis/:id', authenticateToken, apiController.deleteApi);
router.post('/apis/import/openapi', authenticateToken, upload.single('file'), apiController.importOpenAPI);

router.get('/mock/scenarios', authenticateToken, mockController.getScenarios);
router.post('/mock/scenarios', authenticateToken, mockController.createScenario);
router.post('/mock/scenarios/:id/activate', authenticateToken, mockController.setActiveScenario);

router.get('/mock/rules', authenticateToken, mockController.getRules);
router.post('/mock/rules', authenticateToken, mockController.createRule);
router.put('/mock/rules/:id', authenticateToken, mockController.updateRule);
router.delete('/mock/rules/:id', authenticateToken, mockController.deleteRule);

router.get('/contract/tests', authenticateToken, contractController.getTests);
router.post('/contract/tests', authenticateToken, contractController.createTest);
router.post('/contract/tests/:id/run', authenticateToken, contractController.runTest);
router.get('/contract/reports', authenticateToken, contractController.getReports);
router.get('/contract/reports/:id', authenticateToken, contractController.getReport);

router.get('/logs/access', authenticateToken, logController.getAccessLogs);
router.get('/logs/statistics', authenticateToken, logController.getLogStatistics);

module.exports = router;
