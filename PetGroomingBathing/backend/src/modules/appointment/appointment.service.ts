import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Appointment } from './appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    const appointment = this.appointmentRepository.create({
      ...createAppointmentDto,
      status: 'pending',
    });
    return this.appointmentRepository.save(appointment);
  }

  async findAll(type?: string, status?: string, petId?: string, startDate?: string, endDate?: string): Promise<Appointment[]> {
    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (petId) where.petId = petId;

    const query: any = {
      where,
      order: { appointmentTime: 'DESC' },
      relations: ['pet', 'service', 'vehicle'],
    };

    if (startDate && endDate) {
      query.where = {
        ...where,
        appointmentTime: Between(new Date(startDate), new Date(endDate)),
      };
    }

    return this.appointmentRepository.find(query);
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['pet', 'service', 'vehicle'],
    });
    if (!appointment) {
      throw new NotFoundException('预约不存在');
    }
    return appointment;
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.findOne(id);
    Object.assign(appointment, updateAppointmentDto);
    return this.appointmentRepository.save(appointment);
  }

  async remove(id: string): Promise<void> {
    const result = await this.appointmentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('预约不存在');
    }
  }
}
