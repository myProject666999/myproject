import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { apiRouter } from './routes/index.js';
import { error as errorResponse } from './utils/response.js';
import { config } from './config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app: express.Application = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  },
}));

app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, '../backend/uploads')));

app.use('/api', apiRouter);

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', error);
  errorResponse(res, '服务器内部错误', 500, 500);
});

app.use((req: Request, res: Response) => {
  errorResponse(res, 'API不存在', 404, 404);
});

export default app;
