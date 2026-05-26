import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import type { LoginRequest, LoginResponse } from '../../shared/types';

export class AuthService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async login(request: LoginRequest): Promise<LoginResponse | null> {
    const user = await this.userRepository.findOneBy({ username: request.username });
    if (!user) return null;

    const isValid = await bcrypt.compare(request.password, user.passwordHash);
    if (!isValid) return null;

    const token = jwt.sign(
      { id: user.id, username: user.username },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    };
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<boolean> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) return false;

    const isValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isValid) return false;

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);
    return true;
  }
}
