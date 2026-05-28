import { Router } from 'express';
import { getExerciseTypes, getExercises, addExercise, updateExercise, deleteExercise } from '../controllers/exerciseController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/types', authMiddleware, getExerciseTypes);
router.get('/', authMiddleware, getExercises);
router.post('/', authMiddleware, addExercise);
router.put('/:id', authMiddleware, updateExercise);
router.delete('/:id', authMiddleware, deleteExercise);

export default router;
