import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type LikeTargetType = 'note' | 'comment';

@Entity('likes')
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'target_id' })
  targetId: number;

  @Column({ name: 'target_type', type: 'enum', enum: ['note', 'comment'] })
  targetType: LikeTargetType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
