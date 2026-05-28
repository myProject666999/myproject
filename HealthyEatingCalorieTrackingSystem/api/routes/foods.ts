import { Router } from 'express';
import { getFoods, getFoodById } from '../controllers/foodController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, getFoods);
router.get('/:id', authMiddleware, getFoodById);

export default router;
