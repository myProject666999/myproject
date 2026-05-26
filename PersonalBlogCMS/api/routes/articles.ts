import { Router } from 'express';
import { ArticleController } from '../controllers/ArticleController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const articleController = new ArticleController();

router.get('/', (req, res) => articleController.getPublishedArticles(req, res));
router.get('/hot', (req, res) => articleController.getHotArticles(req, res));
router.get('/search', (req, res) => articleController.searchArticles(req, res));
router.get('/archive', (req, res) => articleController.getArchive(req, res));
router.get('/:id', (req, res) => articleController.getArticleDetail(req, res));

router.get('/admin/all', authMiddleware, (req, res) => articleController.getAllArticles(req, res));
router.get('/admin/:id', authMiddleware, (req, res) => articleController.getAdminArticleDetail(req, res));
router.post('/admin', authMiddleware, (req, res) => articleController.createArticle(req, res));
router.put('/admin/:id', authMiddleware, (req, res) => articleController.updateArticle(req, res));
router.delete('/admin/:id', authMiddleware, (req, res) => articleController.deleteArticle(req, res));

export { router as articleRouter };
