import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Pet } from '../pet/pet.entity';

@Entity('reminders')
export class Reminder extends BaseEntity {
  @Column({ name: 'pet_id' })
  petId: string;

  @ManyToOne(() => Pet)
  @JoinColumn({ name: 'pet_id' })
  pet: Pet;

  @Column({ length: 50, comment: '提醒类型: vaccine/grooming/custom' })
  type: string;

  @Column({ length: 200, comment: '提醒标题' })
  title: string;

  @Column({ type: 'text', nullable: true, comment: '提醒详情' })
  description: string;

  @Column({ type: 'date', name: 'reminder_date', comment: '提醒日期' })
  reminderDate: string;

  @Column({ type: 'date', nullable: true, name: 'due_date', comment: '到期日期' })
  dueDate: string;

  @Column({ length: 20, comment: '状态: pending/reminded/dismissed' })
  status: string;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  notes: string;
}
