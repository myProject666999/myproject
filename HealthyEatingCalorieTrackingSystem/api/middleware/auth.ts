import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt';
import { User } from '../models';

interface AuthRequest extends Request {
  userId?: number;
  user?: any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: '未提供认证令牌',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在',
      });
    }

    req.userId = decoded.userId;
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '认证令牌无效或已过期',
    });
  }
};

export default authMiddleware;
