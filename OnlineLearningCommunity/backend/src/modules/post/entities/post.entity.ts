import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { StudyGroup } from '../../group/entities/study-group.entity';
import { Comment } from './comment.entity';
import { Like } from './like.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId: number;

  @Column({ name: 'group_id', type: 'bigint', unsigned: true, nullable: true })
  groupId: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'json', nullable: true })
  images: string[];

  @Column({ name: 'like_count', unsigned: true, default: 0 })
  likeCount: number;

  @Column({ name: 'comment_count', unsigned: true, default: 0 })
  commentCount: number;

  @Column({ name: 'is_public', type: 'tinyint', default: 1 })
  isPublic: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => StudyGroup, (group) => group.posts, { nullable: true })
  @JoinColumn({ name: 'group_id' })
  group: StudyGroup;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.post)
  likes: Like[];
}
