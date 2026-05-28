/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import mockDataMiddleware from './middleware/mockData.js'
import authRoutes from './routes/auth.js'
import foodRoutes from './routes/foods.js'
import mealRoutes from './routes/meals.js'
import exerciseRoutes from './routes/exercises.js'
import weightRoutes from './routes/weights.js'
import goalRoutes from './routes/goals.js'
import statsRoutes from './routes/stats.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

/**
 * Mock Data Middleware (for demo purposes)
 * 使用 mock 数据，即使没有数据库连接也能正常运行
 */
app.use('/api', mockDataMiddleware)

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)
app.use('/api/foods', foodRoutes)
app.use('/api/meals', mealRoutes)
app.use('/api/exercises', exerciseRoutes)
app.use('/api/weights', weightRoutes)
app.use('/api/goals', goalRoutes)
app.use('/api/stats', statsRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
