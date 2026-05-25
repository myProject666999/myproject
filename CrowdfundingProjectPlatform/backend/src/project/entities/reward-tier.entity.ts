import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('reward_tier')
export class RewardTier {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'project_id', type: 'bigint', unsigned: true })
  projectId: number;

  @Column({ name: 'tier_name', length: 100 })
  tierName: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ length: 500 })
  description: string;

  @Column({ type: 'int', unsigned: true, default: 0 })
  stock: number;

  @Column({ name: 'sold_count', type: 'int', unsigned: true, default: 0 })
  soldCount: number;

  @Column({ name: 'deliver_at', type: 'date', nullable: true })
  deliverAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
