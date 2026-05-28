import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Note } from './note.entity';
import { Shop } from './shop.entity';

export type TargetType = 'note' | 'shop';
export type ListType = 'want' | 'visited';

@Entity('favorites')
export class Favorite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'target_id' })
  targetId: number;

  @Column({ name: 'target_type', type: 'enum', enum: ['note', 'shop'] })
  targetType: TargetType;

  @Column({ name: 'list_type', type: 'enum', enum: ['want', 'visited'], default: 'want' })
  listType: ListType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, user => user.favorites)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
