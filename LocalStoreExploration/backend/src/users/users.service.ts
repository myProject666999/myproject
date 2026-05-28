import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (user) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async findAll(page: number = 1, limit: number = 20) {
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { followersCount: 'DESC' },
    });
    return {
      list: users.map(u => { const { password, ...rest } = u; return rest; }),
      total,
      page,
      limit,
    };
  }
}
