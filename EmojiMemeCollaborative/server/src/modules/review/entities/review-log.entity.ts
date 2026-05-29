import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('review_logs')
export class ReviewLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'target_type', type: 'enum', enum: ['meme', 'template'] })
  target_type: 'meme' | 'template';

  @Column({ name: 'target_id' })
  target_id: number;

  @Column({ name: 'reviewer_id' })
  reviewer_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: User;

  @Column({ type: 'enum', enum: ['approve', 'reject'] })
  action: 'approve' | 'reject';

  @Column({ type: 'varchar', length: 500, nullable: true })
  reason: string | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
