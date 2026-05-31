import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Campsite } from './campsite.entity';

@Injectable()
export class CampsiteService {
  constructor(
    @InjectRepository(Campsite)
    private campsiteRepository: Repository<Campsite>,
  ) {}

  async create(campsiteData: Partial<Campsite>): Promise<Campsite> {
    const campsite = this.campsiteRepository.create(campsiteData);
    return this.campsiteRepository.save(campsite);
  }

  async findAll(params?: {
    city?: string;
    keyword?: string;
    minRating?: number;
    page?: number;
    pageSize?: number;
  }): Promise<{ list: Campsite[]; total: number }> {
    const where: any = { status: 1 };
    
    if (params?.city) {
      where.city = params.city;
    }
    if (params?.keyword) {
      where.name = Like(`%${params.keyword}%`);
    }
    if (params?.minRating) {
      where.rating = Between(params.minRating, 5);
    }

    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;

    const [list, total] = await this.campsiteRepository.findAndCount({
      where,
      relations: ['owner', 'spots'],
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { rating: 'DESC', createdAt: 'DESC' },
    });

    return { list, total };
  }

  async findOne(id: number): Promise<Campsite> {
    return this.campsiteRepository.findOne({
      where: { id },
      relations: ['owner', 'spots', 'rentalItems', 'utilityPoles'],
    });
  }

  async findByOwner(ownerId: number): Promise<Campsite[]> {
    return this.campsiteRepository.find({
      where: { ownerId },
      relations: ['spots'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: number, updateData: Partial<Campsite>): Promise<Campsite> {
    await this.campsiteRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.campsiteRepository.delete(id);
  }

  async updateRating(campsiteId: number): Promise<void> {
    const result = await this.campsiteRepository
      .createQueryBuilder('c')
      .leftJoin('c.reviews', 'r', 'r.status = 1')
      .select('AVG(r.rating)', 'avgRating')
      .addSelect('COUNT(r.id)', 'reviewCount')
      .where('c.id = :id', { id: campsiteId })
      .getRawOne();

    await this.campsiteRepository.update(campsiteId, {
      rating: parseFloat(result.avgRating || 0),
      reviewCount: parseInt(result.reviewCount || 0),
    });
  }
}
