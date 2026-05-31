import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { StudyGroup } from '../../group/entities/study-group.entity';

@Entity('check_ins')
@Unique(['userId', 'groupId', 'checkinDate'])
export class Checkin {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId: number;

  @Column({ name: 'group_id', type: 'bigint', unsigned: true })
  groupId: number;

  @Column({ name: 'checkin_date', type: 'date' })
  @Index('idx_group_date')
  checkinDate: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ name: 'study_minutes', unsigned: true, default: 0 })
  studyMinutes: number;

  @Column({ type: 'enum', enum: ['happy', 'neutral', 'tired', 'motivated'], default: 'neutral' })
  mood: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.checkins)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => StudyGroup, (group) => group.checkins)
  @JoinColumn({ name: 'group_id' })
  group: StudyGroup;
}
