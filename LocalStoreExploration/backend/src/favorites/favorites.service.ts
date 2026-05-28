import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite, TargetType, ListType } from '../entities/favorite.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
  ) {}

  async findByUser(userId: number, listType?: ListType) {
    const where: any = { userId };
    if (listType) {
      where.listType = listType;
    }
    return this.favoriteRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async add(userId: number, targetId: number, targetType: TargetType, listType: ListType = 'want') {
    const existing = await this.favoriteRepository.findOne({
      where: { userId, targetId, targetType },
    });
    
    if (existing) {
      existing.listType = listType;
      return this.favoriteRepository.save(existing);
    }

    const favorite = this.favoriteRepository.create({
      userId,
      targetId,
      targetType,
      listType,
    });
    return this.favoriteRepository.save(favorite);
  }

  async remove(userId: number, targetId: number, targetType: TargetType) {
    return this.favoriteRepository.delete({ userId, targetId, targetType });
  }

  async checkIsFavorite(userId: number, targetId: number, targetType: TargetType) {
    const favorite = await this.favoriteRepository.findOne({
      where: { userId, targetId, targetType },
    });
    return !!favorite;
  }
}
