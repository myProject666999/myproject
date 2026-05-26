import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

router.post('/login', (req, res) => authController.login(req, res));
router.put('/password', authMiddleware, (req, res) => authController.changePassword(req, res));

export { router as authRouter };
