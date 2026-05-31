import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { GroupMember } from '../../group/entities/group-member.entity';
import { Checkin } from '../../checkin/entities/checkin.entity';
import { Post } from '../../post/entities/post.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 50 })
  nickname: string;

  @Column({ nullable: true, length: 500 })
  avatar: string;

  @Column({ nullable: true, length: 500 })
  bio: string;

  @Column({ name: 'total_checkins', unsigned: true, default: 0 })
  totalCheckins: number;

  @Column({ name: 'max_streak', unsigned: true, default: 0 })
  maxStreak: number;

  @Column({ name: 'current_streak', unsigned: true, default: 0 })
  currentStreak: number;

  @Column({ name: 'last_checkin_at', nullable: true, type: 'datetime' })
  lastCheckinAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => GroupMember, (member) => member.user)
  groupMembers: GroupMember[];

  @OneToMany(() => Checkin, (checkin) => checkin.user)
  checkins: Checkin[];

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];
}
