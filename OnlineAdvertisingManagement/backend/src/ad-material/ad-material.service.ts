import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdMaterial } from '../entities/ad-material.entity';

@Injectable()
export class AdMaterialService {
  constructor(
    @InjectRepository(AdMaterial)
    private adMaterialRepository: Repository<AdMaterial>,
  ) {}

  async findAll(): Promise<AdMaterial[]> {
    return this.adMaterialRepository.find();
  }

  async findOne(id: number): Promise<AdMaterial> {
    return this.adMaterialRepository.findOne({ where: { id } });
  }

  async create(data: Partial<AdMaterial>): Promise<AdMaterial> {
    const material = this.adMaterialRepository.create(data);
    return this.adMaterialRepository.save(material);
  }

  async update(id: number, data: Partial<AdMaterial>): Promise<AdMaterial> {
    await this.adMaterialRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.adMaterialRepository.delete(id);
  }
}
