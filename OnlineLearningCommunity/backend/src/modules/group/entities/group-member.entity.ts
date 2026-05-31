import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { StudyGroup } from './study-group.entity';

@Entity('group_members')
@Unique(['groupId', 'userId'])
export class GroupMember {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'group_id', type: 'bigint', unsigned: true })
  groupId: number;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId: number;

  @Column({ type: 'enum', enum: ['owner', 'admin', 'member'], default: 'member' })
  role: string;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;

  @Column({ name: 'group_streak', unsigned: true, default: 0 })
  groupStreak: number;

  @Column({ name: 'group_checkins', unsigned: true, default: 0 })
  groupCheckins: number;

  @ManyToOne(() => StudyGroup, (group) => group.members)
  @JoinColumn({ name: 'group_id' })
  group: StudyGroup;

  @ManyToOne(() => User, (user) => user.groupMembers)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
