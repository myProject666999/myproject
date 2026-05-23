const express = require('express');
const router = express.Router();
const dataSourceController = require('../controllers/dataSourceController');

router.get('/', dataSourceController.getAllDataSources);
router.get('/:id', dataSourceController.getDataSourceById);
router.get('/week/:weekStart/:weekEnd', dataSourceController.getDataSourcesByWeek);
router.get('/type/:sourceType', dataSourceController.getDataSourcesByType);
router.post('/', dataSourceController.createDataSource);
router.put('/:id', dataSourceController.updateDataSource);
router.delete('/:id', dataSourceController.deleteDataSource);
router.post('/git/import', dataSourceController.importGitCommits);
router.post('/batch', dataSourceController.batchCreateDataSources);

module.exports = router;
