import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import rateLimit from 'express-rate-limit'

import authRoutes from './routes/auth.js'
import stockRoutes from './routes/stock.js'
import watchlistRoutes from './routes/watchlist.js'
import portfolioRoutes from './routes/portfolio.js'
import performanceRoutes from './routes/performance.js'
import alertRoutes from './routes/alert.js'
import { startAlertCron } from './services/alertCron.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app: express.Application = express()

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { message: '请求过于频繁，请稍后再试' }
})
app.use('/api', limiter)

const stockLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { message: '行情查询过于频繁，请稍后再试' }
})

app.use('/api/auth', authRoutes)
app.use('/api/stock', stockLimiter, stockRoutes)
app.use('/api/watchlist', watchlistRoutes)
app.use('/api/portfolio', portfolioRoutes)
app.use('/api/performance', performanceRoutes)
app.use('/api/alerts', alertRoutes)

app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', error)
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

startAlertCron()

export default app
