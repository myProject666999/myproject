import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Pet } from '../pet/pet.entity';
import { Service } from '../service/service.entity';
import { Vehicle } from '../vehicle/vehicle.entity';

@Entity('appointments')
export class Appointment extends BaseEntity {
  @Column({ name: 'pet_id' })
  petId: string;

  @ManyToOne(() => Pet)
  @JoinColumn({ name: 'pet_id' })
  pet: Pet;

  @Column({ name: 'service_id' })
  serviceId: string;

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column({ type: 'datetime', name: 'appointment_time', comment: '预约时间' })
  appointmentTime: Date;

  @Column({ length: 20, comment: '预约类型: in_store/home_service' })
  type: string;

  @Column({ length: 500, nullable: true, comment: '上门地址(上门服务时)' })
  address: string;

  @Column({ name: 'vehicle_id', nullable: true })
  vehicleId: string;

  @ManyToOne(() => Vehicle, { nullable: true })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({ length: 50, comment: '状态: pending/confirmed/in_progress/completed/cancelled' })
  status: string;

  @Column({ type: 'text', nullable: true, comment: '预约备注' })
  notes: string;

  @Column({ type: 'datetime', nullable: true, name: 'check_in_time', comment: '实际到店/接宠时间' })
  checkInTime: Date;

  @Column({ type: 'datetime', nullable: true, name: 'check_out_time', comment: '实际结束时间' })
  checkOutTime: Date;
}
