import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const categoryController = new CategoryController();

router.get('/', (req, res) => categoryController.getCategories(req, res));
router.post('/admin', authMiddleware, (req, res) => categoryController.createCategory(req, res));
router.put('/admin/:id', authMiddleware, (req, res) => categoryController.updateCategory(req, res));
router.delete('/admin/:id', authMiddleware, (req, res) => categoryController.deleteCategory(req, res));

router.get('/tags', (req, res) => categoryController.getTags(req, res));
router.post('/admin/tags', authMiddleware, (req, res) => categoryController.createTag(req, res));
router.put('/admin/tags/:id', authMiddleware, (req, res) => categoryController.updateTag(req, res));
router.delete('/admin/tags/:id', authMiddleware, (req, res) => categoryController.deleteTag(req, res));

export { router as categoryRouter };
