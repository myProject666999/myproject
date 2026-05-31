import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Note } from './note.entity';
import { Shop } from './shop.entity';

export enum TargetType {
  NOTE = 'note',
  SHOP = 'shop',
}

export enum ListType {
  WANT = 'want',
  VISITED = 'visited',
}

@Entity('favorites')
export class Favorite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'target_id' })
  targetId: number;

  @Column({ name: 'target_type', type: 'enum', enum: TargetType })
  targetType: TargetType;

  @Column({ name: 'list_type', type: 'enum', enum: ListType, default: ListType.WANT })
  listType: ListType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, user => user.favorites)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
