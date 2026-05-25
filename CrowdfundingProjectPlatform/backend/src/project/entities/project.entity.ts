import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('project')
export class Project {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId: number;

  @Column({ length: 200 })
  title: string;

  @Column({ length: 300, nullable: true })
  subtitle?: string;

  @Column({ name: 'cover_image', length: 255, nullable: true })
  coverImage?: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ length: 32, nullable: true })
  category?: string;

  @Column({ name: 'goal_amount', type: 'decimal', precision: 15, scale: 2 })
  goalAmount: number;

  @Column({
    name: 'raised_amount',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  raisedAmount: number;

  @Column({ name: 'backer_count', type: 'int', unsigned: true, default: 0 })
  backerCount: number;

  @Column({ type: 'tinyint', default: 0 })
  status: number;

  @Column({ name: 'start_at', type: 'datetime' })
  startAt: Date;

  @Column({ name: 'end_at', type: 'datetime' })
  endAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
