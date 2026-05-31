import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Post } from './post.entity';
import { Comment } from './comment.entity';

@Entity('likes')
@Unique(['userId', 'postId'])
export class Like {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId: number;

  @Column({ name: 'post_id', type: 'bigint', unsigned: true, nullable: true })
  postId: number;

  @Column({ name: 'comment_id', type: 'bigint', unsigned: true, nullable: true })
  commentId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Post, (post) => post.likes, { nullable: true })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(() => Comment, { nullable: true })
  @JoinColumn({ name: 'comment_id' })
  comment: Comment;
}
