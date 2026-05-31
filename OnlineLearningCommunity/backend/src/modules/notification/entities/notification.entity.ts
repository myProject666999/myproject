import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId: number;

  @Column({ type: 'enum', enum: ['checkin_reminder', 'like', 'comment', 'new_member', 'group_invite', 'system'] })
  type: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ name: 'related_id', type: 'bigint', unsigned: true, nullable: true })
  relatedId: number;

  @Column({ name: 'is_read', type: 'tinyint', default: 0 })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
