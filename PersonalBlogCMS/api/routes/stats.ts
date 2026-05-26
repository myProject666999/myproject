import { Router } from 'express';
import { StatsController } from '../controllers/StatsController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const statsController = new StatsController();

router.get('/overview', authMiddleware, (req, res) => statsController.getOverview(req, res));
router.get('/visits', authMiddleware, (req, res) => statsController.getVisitTrend(req, res));
router.get('/popular', authMiddleware, (req, res) => statsController.getPopularArticles(req, res));
router.get('/categories', authMiddleware, (req, res) => statsController.getCategoryStats(req, res));

export { router as statsRouter };
