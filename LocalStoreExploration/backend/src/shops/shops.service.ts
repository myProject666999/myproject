import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from '../entities/shop.entity';

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(Shop)
    private shopRepository: Repository<Shop>,
  ) {}

  async findById(id: number) {
    return this.shopRepository.findOne({ where: { id } });
  }

  async findAll(page: number = 1, limit: number = 20, category?: string) {
    const where: any = {};
    if (category) {
      where.category = category;
    }
    
    const [shops, total] = await this.shopRepository.findAndCount({
      where,
      order: { rating: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { list: shops, total, page, limit };
  }

  async search(keyword: string) {
    return this.shopRepository
      .createQueryBuilder('shop')
      .where('shop.name LIKE :keyword', { keyword: `%${keyword}%` })
      .orWhere('shop.address LIKE :keyword', { keyword: `%${keyword}%` })
      .take(20)
      .getMany();
  }
}
