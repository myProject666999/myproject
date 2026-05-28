import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RankingService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private redisService: RedisService,
  ) {}

  async getDarenRanking(limit: number = 20) {
    const users = await this.userRepository.find({
      where: { isVerified: 1 },
      order: { followersCount: 'DESC', notesCount: 'DESC' },
      take: limit,
    });

    return users.map((user, index) => {
      const hotScore = this.calculateHotScore(user);
      return {
        rank: index + 1,
        userId: user.id,
        hotScore,
        user: this.sanitizeUser(user),
      };
    });
  }

  private calculateHotScore(user: User): number {
    return user.notesCount * 10 + user.followersCount * 2;
  }

  private sanitizeUser(user: User) {
    const { password, ...result } = user;
    return result;
  }
}
