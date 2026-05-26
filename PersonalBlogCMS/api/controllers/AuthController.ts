import type { Request, Response } from 'express';
import { AuthService } from '../services/AuthService.js';
import { success, error, unauthorized } from '../utils/response.js';
import type { AuthRequest } from '../middleware/auth.js';
import type { LoginRequest } from '../../shared/types.js';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body as LoginRequest;

      if (!username || !password) {
        error(res, '用户名和密码不能为空');
        return;
      }

      const result = await this.authService.login({ username, password });

      if (!result) {
        unauthorized(res, '用户名或密码错误');
        return;
      }

      success(res, result, '登录成功');
    } catch (err) {
      error(res, '登录失败', 500, 500);
    }
  }

  async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        unauthorized(res);
        return;
      }

      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) {
        error(res, '旧密码和新密码不能为空');
        return;
      }

      if (newPassword.length < 6) {
        error(res, '新密码长度不能少于6位');
        return;
      }

      const success = await this.authService.changePassword(userId, oldPassword, newPassword);
      if (success) {
        success(res, null, '密码修改成功');
      } else {
        error(res, '旧密码错误');
      }
    } catch (err) {
      error(res, '修改密码失败', 500, 500);
    }
  }
}
