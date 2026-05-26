import { Router } from 'express';
import { authRouter } from './auth';
import { articleRouter } from './articles';
import { categoryRouter } from './categories';
import { commentRouter } from './comments';
import { statsRouter } from './stats';

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
