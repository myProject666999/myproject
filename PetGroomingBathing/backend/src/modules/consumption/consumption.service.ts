import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Consumption } from './consumption.entity';
import { CreateConsumptionDto } from './dto/create-consumption.dto';
import { UpdateConsumptionDto } from './dto/update-consumption.dto';

@Injectable()
export class ConsumptionService {
  constructor(
    @InjectRepository(Consumption)
    private consumptionRepository: Repository<Consumption>,
  ) {}

  async create(createConsumptionDto: CreateConsumptionDto): Promise<Consumption> {
    const consumption = this.consumptionRepository.create({
      ...createConsumptionDto,
      consumptionTime: createConsumptionDto.consumptionTime
        ? new Date(createConsumptionDto.consumptionTime)
        : new Date(),
    });
    return this.consumptionRepository.save(consumption);
  }

  async findAll(
    petId?: string,
    startDate?: string,
    endDate?: string,
    paymentMethod?: string,
  ): Promise<Consumption[]> {
    const where: any = {};
    if (petId) where.petId = petId;
    if (paymentMethod) where.paymentMethod = paymentMethod;

    const query: any = {
      where,
      order: { consumptionTime: 'DESC' },
      relations: ['pet', 'service', 'appointment'],
    };

    if (startDate && endDate) {
      query.where = {
        ...where,
        consumptionTime: Between(new Date(startDate), new Date(endDate)),
      };
    }

    return this.consumptionRepository.find(query);
  }

  async findOne(id: string): Promise<Consumption> {
    const consumption = await this.consumptionRepository.findOne({
      where: { id },
      relations: ['pet', 'service', 'appointment'],
    });
    if (!consumption) {
      throw new NotFoundException('消费记录不存在');
    }
    return consumption;
  }

  async update(id: string, updateConsumptionDto: UpdateConsumptionDto): Promise<Consumption> {
    const consumption = await this.findOne(id);
    Object.assign(consumption, updateConsumptionDto);
    return this.consumptionRepository.save(consumption);
  }

  async remove(id: string): Promise<void> {
    const result = await this.consumptionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('消费记录不存在');
    }
  }

  async getStatistics(startDate: string, endDate: string): Promise<any> {
    const consumptions = await this.consumptionRepository.find({
      where: {
        consumptionTime: Between(new Date(startDate), new Date(endDate)),
      },
    });

    const totalAmount = consumptions.reduce((sum, item) => sum + parseFloat(String(item.amount)), 0);
    const totalActual = consumptions.reduce((sum, item) => sum + parseFloat(String(item.actualAmount)), 0);
    const totalDiscount = consumptions.reduce((sum, item) => sum + parseFloat(String(item.discount)), 0);

    const paymentMethods: any = {};
    consumptions.forEach((item) => {
      if (!paymentMethods[item.paymentMethod]) {
        paymentMethods[item.paymentMethod] = 0;
      }
      paymentMethods[item.paymentMethod] += parseFloat(String(item.actualAmount));
    });

    return {
      totalCount: consumptions.length,
      totalAmount,
      totalActual,
      totalDiscount,
      paymentMethods,
    };
  }

  async getByPet(petId: string): Promise<Consumption[]> {
    return this.consumptionRepository.find({
      where: { petId },
      order: { consumptionTime: 'DESC' },
      relations: ['service'],
    });
  }
}
