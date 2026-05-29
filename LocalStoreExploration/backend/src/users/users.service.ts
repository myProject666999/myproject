import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { instanceToPlain } from 'class-transformer';
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
      const plain = instanceToPlain(user) as any;
      const { password, ...result } = plain;
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
      list: users.map(u => {
        const plain = instanceToPlain(u) as any;
        const { password, ...rest } = plain;
        return rest;
      }),
      total,
      page,
      limit,
    };
  }
}
