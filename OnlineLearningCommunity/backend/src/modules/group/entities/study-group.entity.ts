import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { GroupMember } from './group-member.entity';
import { Checkin } from '../../checkin/entities/checkin.entity';
import { Post } from '../../post/entities/post.entity';

@Entity('study_groups')
export class StudyGroup {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true, length: 500 })
  avatar: string;

  @Column({ length: 50, default: '学习' })
  category: string;

  @Column({ name: 'max_members', unsigned: true, default: 30 })
  maxMembers: number;

  @Column({ name: 'member_count', unsigned: true, default: 0 })
  memberCount: number;

  @Column({ name: 'is_private', type: 'tinyint', default: 0 })
  isPrivate: boolean;

  @Column({ name: 'owner_id', type: 'bigint', unsigned: true })
  ownerId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => GroupMember, (member) => member.group)
  members: GroupMember[];

  @OneToMany(() => Checkin, (checkin) => checkin.group)
  checkins: Checkin[];

  @OneToMany(() => Post, (post) => post.group)
  posts: Post[];
}
