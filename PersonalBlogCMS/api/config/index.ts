import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  database: {
    path: process.env.DB_PATH || './backend/data/blog.db',
  },
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
  },
  upload: {
    dir: process.env.UPLOAD_DIR || './backend/uploads',
    maxSize: 5 * 1024 * 1024,
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  rateLimit: {
    commentWindowMs: 60 * 1000,
    commentMaxPerWindow: 1,
  },
};
