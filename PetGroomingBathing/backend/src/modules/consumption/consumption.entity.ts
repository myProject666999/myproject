import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Pet } from '../pet/pet.entity';
import { Service } from '../service/service.entity';
import { Appointment } from '../appointment/appointment.entity';

@Entity('consumptions')
export class Consumption extends BaseEntity {
  @Column({ name: 'pet_id' })
  petId: string;

  @ManyToOne(() => Pet)
  @JoinColumn({ name: 'pet_id' })
  pet: Pet;

  @Column({ name: 'service_id', nullable: true })
  serviceId: string;

  @ManyToOne(() => Service, { nullable: true })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column({ name: 'appointment_id', nullable: true })
  appointmentId: string;

  @ManyToOne(() => Appointment, { nullable: true })
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @Column({ length: 200, comment: '消费项目名称' })
  itemName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '消费金额' })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '优惠金额' })
  discount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'actual_amount', comment: '实付金额' })
  actualAmount: number;

  @Column({ length: 20, comment: '支付方式: cash/wechat/alipay/card' })
  paymentMethod: string;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  notes: string;

  @Column({ type: 'datetime', name: 'consumption_time', comment: '消费时间' })
  consumptionTime: Date;
}
