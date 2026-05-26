import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdSpace } from '../entities/ad-space.entity';

@Injectable()
export class AdSpaceService {
  constructor(
    @InjectRepository(AdSpace)
    private adSpaceRepository: Repository<AdSpace>,
  ) {}

  async findAll(): Promise<AdSpace[]> {
    return this.adSpaceRepository.find();
  }

  async findOne(id: number): Promise<AdSpace> {
    return this.adSpaceRepository.findOne({ where: { id } });
  }

  async create(data: Partial<AdSpace>): Promise<AdSpace> {
    const adSpace = this.adSpaceRepository.create(data);
    return this.adSpaceRepository.save(adSpace);
  }

  async update(id: number, data: Partial<AdSpace>): Promise<AdSpace> {
    await this.adSpaceRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.adSpaceRepository.delete(id);
  }
}
