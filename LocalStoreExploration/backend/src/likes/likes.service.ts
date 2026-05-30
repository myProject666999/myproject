import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like, LikeTargetType } from '../entities/like.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
  ) {}

  async toggle(userId: number, targetId: number, targetType: LikeTargetType) {
    const existing = await this.likeRepository.findOne({
      where: { userId, targetId, targetType },
    });

    if (existing) {
      await this.likeRepository.delete(existing.id);
      return { liked: false };
    }

    const like = this.likeRepository.create({
      userId,
      targetId,
      targetType,
    });
    await this.likeRepository.save(like);
    return { liked: true };
  }

  async checkIsLiked(userId: number, targetId: number, targetType: LikeTargetType) {
    const like = await this.likeRepository.findOne({
      where: { userId, targetId, targetType },
    });
    return !!like;
  }

  async getLikeCount(targetId: number, targetType: LikeTargetType) {
    return this.likeRepository.count({
      where: { targetId, targetType },
    });
  }
}
