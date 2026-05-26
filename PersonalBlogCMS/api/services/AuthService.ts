import { db } from '../config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import type { LoginRequest, LoginResponse } from '../../shared/types.js';

export class AuthService {
  async login(request: LoginRequest): Promise<LoginResponse | null> {
    const row = db
      .prepare('SELECT * FROM users WHERE username = ?')
      .get(request.username) as Record<string, unknown> | undefined;

    if (!row) return null;

    const isValid = await bcrypt.compare(request.password, row.password_hash as string);
    if (!isValid) return null;

    const token = jwt.sign(
      { id: row.id as number, username: row.username as string },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return {
      token,
      user: {
        id: row.id as number,
        username: row.username as string,
        nickname: (row.nickname as string) || '',
        avatar: (row.avatar as string) || undefined,
        createdAt: new Date(row.created_at as string),
      },
    };
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<boolean> {
    const row = db
      .prepare('SELECT * FROM users WHERE id = ?')
      .get(userId) as Record<string, unknown> | undefined;

    if (!row) return false;

    const isValid = await bcrypt.compare(oldPassword, row.password_hash as string);
    if (!isValid) return false;

    const newHash = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newHash, userId);
    return true;
  }
}
