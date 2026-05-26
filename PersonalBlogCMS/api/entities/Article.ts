import { Entity, Column, ManyToOne, ManyToMany, JoinTable, JoinColumn } from 'typeorm';
import { Base } from './Base.js';
import { Category } from './Category.js';
import { Tag } from './Tag.js';
import { User } from './User.js';
import type { ArticleStatus } from '../../../shared/types.js';

@Entity('articles')
export class Article extends Base {
  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ name: 'content_md', type: 'text', nullable: true })
  contentMd: string;

  @Column({ name: 'content_html', type: 'text', nullable: true })
  contentHtml: string;

  @Column({ name: 'cover_image', length: 255, nullable: true })
  coverImage: string;

  @Column({ name: 'category_id', nullable: true })
  categoryId: number;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'user_id', nullable: true })
  userId: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 20, default: 'draft' })
  status: ArticleStatus;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @Column({ name: 'published_at', nullable: true })
  publishedAt: Date;

  @ManyToMany(() => Tag)
  @JoinTable({
    name: 'article_tags',
    joinColumn: { name: 'article_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: Tag[];
}
