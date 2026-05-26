import { Router } from 'express';
import { authRouter } from './auth.js';
import { articleRouter } from './articles.js';
import { categoryRouter } from './categories.js';
import { commentRouter } from './comments.js';
import { statsRouter } from './stats.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    code: 0,
    message: 'OK',
    data: {
      status: 'running',
      timestamp: new Date().toISOString(),
    },
  });
});

router.use('/auth', authRouter);
router.use('/articles', articleRouter);
router.use('/categories', categoryRouter);
router.use('/comments', commentRouter);
router.use('/stats', statsRouter);

export { router as apiRouter };
