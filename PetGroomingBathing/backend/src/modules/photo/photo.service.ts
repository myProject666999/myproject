import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photo } from './photo.entity';
import { CreatePhotoDto } from './dto/create-photo.dto';

@Injectable()
export class PhotoService {
  constructor(
    @InjectRepository(Photo)
    private photoRepository: Repository<Photo>,
  ) {}

  async create(createPhotoDto: CreatePhotoDto): Promise<Photo> {
    const photo = this.photoRepository.create(createPhotoDto);
    return this.photoRepository.save(photo);
  }

  async findAll(appointmentId?: string): Promise<Photo[]> {
    const where: any = {};
    if (appointmentId) where.appointmentId = appointmentId;
    return this.photoRepository.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['appointment'],
    });
  }

  async findOne(id: string): Promise<Photo> {
    const photo = await this.photoRepository.findOne({
      where: { id },
      relations: ['appointment'],
    });
    if (!photo) {
      throw new NotFoundException('照片不存在');
    }
    return photo;
  }

  async remove(id: string): Promise<void> {
    const result = await this.photoRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('照片不存在');
    }
  }

  async getByAppointment(appointmentId: string): Promise<Photo[]> {
    return this.photoRepository.find({
      where: { appointmentId },
      order: { createdAt: 'DESC' },
    });
  }
}
