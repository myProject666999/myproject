import { Router } from 'express';
import { getMeals, addMeal, updateMeal, deleteMeal } from '../controllers/mealController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, getMeals);
router.post('/', authMiddleware, addMeal);
router.put('/:id', authMiddleware, updateMeal);
router.delete('/:id', authMiddleware, deleteMeal);

export default router;
