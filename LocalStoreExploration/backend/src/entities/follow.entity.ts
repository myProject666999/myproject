import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('follows')
export class Follow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'follower_id' })
  followerId: number;

  @Column({ name: 'following_id' })
  followingId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
