import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sticker } from './entities/sticker.entity';

@Injectable()
export class StickerService {
  constructor(
    @InjectRepository(Sticker)
    private stickerRepository: Repository<Sticker>,
  ) {}

  async create(data: Partial<Sticker>, userId: number) {
    const sticker = this.stickerRepository.create({
      ...data,
      created_by: userId,
    });
    return this.stickerRepository.save(sticker);
  }

  async findAll(category?: string, page: number = 1, limit: number = 20) {
    const where: any = {};
    if (category) where.category = category;
    const [items, total] = await this.stickerRepository.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }
}
