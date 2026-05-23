const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');

router.get('/', templateController.getAllTemplates);
router.get('/:id', templateController.getTemplateById);
router.post('/', templateController.createTemplate);
router.put('/:id', templateController.updateTemplate);
router.delete('/:id', templateController.deleteTemplate);
router.post('/:id/render', templateController.renderTemplate);

module.exports = router;
