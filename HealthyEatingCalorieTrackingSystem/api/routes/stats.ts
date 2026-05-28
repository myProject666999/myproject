import { Router } from 'express';
import { getDailyStats, getTrendStats } from '../controllers/statsController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/daily', authMiddleware, getDailyStats);
router.get('/trend', authMiddleware, getTrendStats);

export default router;
