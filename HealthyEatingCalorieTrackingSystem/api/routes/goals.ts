import { Router } from 'express';
import { getGoal, updateGoal } from '../controllers/goalController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, getGoal);
router.put('/', authMiddleware, updateGoal);

export default router;
