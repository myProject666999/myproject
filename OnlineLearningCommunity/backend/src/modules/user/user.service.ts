import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  async findByUsername(username: string): Promise<User> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'username', 'nickname', 'avatar', 'bio', 'totalCheckins', 'maxStreak', 'currentStreak', 'createdAt'],
    });
  }

  async updateProfile(id: number, updateData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, updateData);
    return this.findById(id);
  }

  async getUserStats(userId: number): Promise<any> {
    const user = await this.findById(userId);
    return {
      totalCheckins: user.totalCheckins,
      currentStreak: user.currentStreak,
      maxStreak: user.maxStreak,
      lastCheckinAt: user.lastCheckinAt,
    };
  }

  async updateUserStats(userId: number, stats: Partial<User>): Promise<void> {
    await this.userRepository.update(userId, stats);
  }

  async deleteUser(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
