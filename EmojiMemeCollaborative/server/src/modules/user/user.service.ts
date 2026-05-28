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

  async findById(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password_hash, ...result } = user;
    return result;
  }

  async updateProfile(id: number, data: Partial<Pick<User, 'nickname' | 'avatar' | 'email'>>) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (data.nickname !== undefined) user.nickname = data.nickname;
    if (data.avatar !== undefined) user.avatar = data.avatar;
    if (data.email !== undefined) user.email = data.email;
    await this.userRepository.save(user);
    const { password_hash, ...result } = user;
    return result;
  }
}
