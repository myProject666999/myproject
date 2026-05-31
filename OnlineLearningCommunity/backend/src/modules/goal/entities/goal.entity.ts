import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { StudyGroup } from '../../group/entities/study-group.entity';

@Entity('goals')
export class Goal {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId: number;

  @Column({ name: 'group_id', type: 'bigint', unsigned: true })
  groupId: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'target_value', unsigned: true, default: 0 })
  targetValue: number;

  @Column({ name: 'current_value', unsigned: true, default: 0 })
  currentValue: number;

  @Column({ length: 20, default: '天' })
  unit: string;

  @Column({ type: 'date', nullable: true })
  deadline: string;

  @Column({ type: 'enum', enum: ['active', 'completed', 'abandoned'], default: 'active' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => StudyGroup)
  @JoinColumn({ name: 'group_id' })
  group: StudyGroup;
}
