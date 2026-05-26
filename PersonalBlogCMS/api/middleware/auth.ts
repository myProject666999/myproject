import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { unauthorized } from '../utils/response.js';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    unauthorized(res);
    return;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: number; username: string };
    req.user = decoded;
    next();
  } catch (err) {
    unauthorized(res, 'Token无效或已过期');
  }
}
