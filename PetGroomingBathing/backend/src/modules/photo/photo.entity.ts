import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Appointment } from '../appointment/appointment.entity';

@Entity('photos')
export class Photo extends BaseEntity {
  @Column({ name: 'appointment_id' })
  appointmentId: string;

  @ManyToOne(() => Appointment)
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @Column({ length: 20, comment: '照片类型: before/after' })
  type: string;

  @Column({ length: 255, name: 'file_path', comment: '文件路径' })
  filePath: string;

  @Column({ length: 100, nullable: true, name: 'file_name', comment: '原始文件名' })
  fileName: string;

  @Column({ type: 'text', nullable: true, comment: '描述' })
  description: string;
}
