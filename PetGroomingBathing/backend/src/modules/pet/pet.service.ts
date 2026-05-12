import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Pet } from './pet.entity';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';

@Injectable()
export class PetService {
  constructor(
    @InjectRepository(Pet)
    private petRepository: Repository<Pet>,
  ) {}

  async create(createPetDto: CreatePetDto): Promise<Pet> {
    const pet = this.petRepository.create({
      ...createPetDto,
      status: 1,
    });
    return this.petRepository.save(pet);
  }

  async findAll(keyword?: string): Promise<Pet[]> {
    const where: any = { status: 1 };
    if (keyword) {
      return this.petRepository.find({
        where: [
          { ...where, name: Like(`%${keyword}%`) },
          { ...where, breed: Like(`%${keyword}%`) },
          { ...where, ownerName: Like(`%${keyword}%`) },
          { ...where, ownerPhone: Like(`%${keyword}%`) },
        ],
        order: { createdAt: 'DESC' },
      });
    }
    return this.petRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Pet> {
    const pet = await this.petRepository.findOne({ where: { id } });
    if (!pet || pet.status === 0) {
      throw new NotFoundException('宠物档案不存在');
    }
    return pet;
  }

  async update(id: string, updatePetDto: UpdatePetDto): Promise<Pet> {
    const pet = await this.findOne(id);
    Object.assign(pet, updatePetDto);
    return this.petRepository.save(pet);
  }

  async remove(id: string): Promise<void> {
    const pet = await this.findOne(id);
    pet.status = 0;
    await this.petRepository.save(pet);
  }
}
