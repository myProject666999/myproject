import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Raw } from 'typeorm';
import { Reminder } from './reminder.entity';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';

@Injectable()
export class ReminderService {
  constructor(
    @InjectRepository(Reminder)
    private reminderRepository: Repository<Reminder>,
  ) {}

  async create(createReminderDto: CreateReminderDto): Promise<Reminder> {
    const reminder = this.reminderRepository.create({
      ...createReminderDto,
      status: 'pending',
    });
    return this.reminderRepository.save(reminder);
  }

  async findAll(status?: string, type?: string, today?: boolean): Promise<Reminder[]> {
    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (today) {
      const todayStr = new Date().toISOString().split('T')[0];
      where.reminderDate = todayStr;
    }
    return this.reminderRepository.find({
      where,
      order: { reminderDate: 'ASC' },
      relations: ['pet'],
    });
  }

  async findUpcoming(days: number = 7): Promise<Reminder[]> {
    const today = new Date();
    const future = new Date();
    future.setDate(today.getDate() + days);
    
    const todayStr = today.toISOString().split('T')[0];
    const futureStr = future.toISOString().split('T')[0];

    return this.reminderRepository.find({
      where: {
        status: 'pending',
        reminderDate: Raw((alias) => `${alias} >= :start AND ${alias} <= :end`, {
          start: todayStr,
          end: futureStr,
        }),
      },
      order: { reminderDate: 'ASC' },
      relations: ['pet'],
    });
  }

  async findOne(id: string): Promise<Reminder> {
    const reminder = await this.reminderRepository.findOne({
      where: { id },
      relations: ['pet'],
    });
    if (!reminder) {
      throw new NotFoundException('提醒不存在');
    }
    return reminder;
  }

  async update(id: string, updateReminderDto: UpdateReminderDto): Promise<Reminder> {
    const reminder = await this.findOne(id);
    Object.assign(reminder, updateReminderDto);
    return this.reminderRepository.save(reminder);
  }

  async remove(id: string): Promise<void> {
    const result = await this.reminderRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('提醒不存在');
    }
  }

  async getByPet(petId: string): Promise<Reminder[]> {
    return this.reminderRepository.find({
      where: { petId },
      order: { reminderDate: 'DESC' },
    });
  }
}
