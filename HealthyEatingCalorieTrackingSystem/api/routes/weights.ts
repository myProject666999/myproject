import { Router } from 'express';
import { getWeights, addWeight } from '../controllers/weightController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, getWeights);
router.post('/', authMiddleware, addWeight);

export default router;
