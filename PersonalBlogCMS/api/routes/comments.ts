import { Router } from 'express';
import { CommentController } from '../controllers/CommentController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const commentController = new CommentController();

router.get('/article/:articleId', (req, res) => commentController.getApprovedComments(req, res));
router.post('/article/:articleId', (req, res) => commentController.createComment(req, res));

router.get('/admin', authMiddleware, (req, res) => commentController.getAllComments(req, res));
router.put('/admin/:id/approve', authMiddleware, (req, res) => commentController.approveComment(req, res));
router.put('/admin/:id/reject', authMiddleware, (req, res) => commentController.rejectComment(req, res));
router.post('/admin/:id/reply', authMiddleware, (req, res) => commentController.replyComment(req, res));
router.delete('/admin/:id', authMiddleware, (req, res) => commentController.deleteComment(req, res));

export { router as commentRouter };
