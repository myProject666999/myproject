import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Meme } from '../../meme/entities/meme.entity';

@Entity('likes')
@Unique(['user_id', 'meme_id', 'type'])
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'meme_id' })
  meme_id: number;

  @ManyToOne(() => Meme)
  @JoinColumn({ name: 'meme_id' })
  meme: Meme;

  @Column({ type: 'enum', enum: ['like', 'favorite'] })
  type: 'like' | 'favorite';

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
