import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Space } from './space.entity';
import { User } from '../users/user.entity';

@Entity('space_members')
export class SpaceMember {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true })
  space_id: number;

  @Column({ type: 'bigint', unsigned: true })
  user_id: number;

  @Column({ type: 'tinyint', default: 2 })
  role: number;

  @CreateDateColumn({ type: 'timestamp' })
  joined_at: Date;

  @ManyToOne(() => Space, (space) => space.members)
  @JoinColumn({ name: 'space_id' })
  space: Space;

  @ManyToOne(() => User, (user) => user.space_members)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
