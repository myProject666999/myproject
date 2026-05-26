import { Entity, Column } from 'typeorm';
import { Base } from './Base.js';

@Entity('categories')
export class Category extends Base {
  @Column({ unique: true, length: 50 })
  name: string;

  @Column({ unique: true, length: 100 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'article_count', default: 0 })
  articleCount: number;
}
