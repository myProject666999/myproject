import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from '../entities/follow.entity';

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow)
    private followRepository: Repository<Follow>,
  ) {}

  async toggle(followerId: number, followingId: number) {
    if (followerId === followingId) {
      throw new Error('Cannot follow yourself');
    }

    const existing = await this.followRepository.findOne({
      where: { followerId, followingId },
    });

    if (existing) {
      await this.followRepository.delete(existing.id);
      return { following: false };
    }

    const follow = this.followRepository.create({
      followerId,
      followingId,
    });
    await this.followRepository.save(follow);
    return { following: true };
  }

  async checkIsFollowing(followerId: number, followingId: number) {
    const follow = await this.followRepository.findOne({
      where: { followerId, followingId },
    });
    return !!follow;
  }

  async getFollowers(userId: number) {
    return this.followRepository.find({
      where: { followingId: userId },
    });
  }

  async getFollowing(userId: number) {
    return this.followRepository.find({
      where: { followerId: userId },
    });
  }
}
