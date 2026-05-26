import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Base } from './Base.js';
import { Article } from './Article.js';
import type { CommentStatus } from '../../../shared/types.js';

@Entity('comments')
export class Comment extends Base {
  @Column({ name: 'article_id' })
  articleId: number;

  @ManyToOne(() => Article, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'article_id' })
  article: Article;

  @Column({ name: 'parent_id', nullable: true })
  parentId: number;

  @ManyToOne(() => Comment, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Comment;

  @OneToMany(() => Comment, (comment) => comment.parent)
  replies: Comment[];

  @Column({ name: 'author_name', length: 100 })
  authorName: string;

  @Column({ name: 'author_email', length: 100, nullable: true })
  authorEmail: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ length: 20, default: 'pending' })
  status: CommentStatus;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string;
}
