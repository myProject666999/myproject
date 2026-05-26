import { Entity, Column } from 'typeorm';
import { Base } from './Base.js';

@Entity('tags')
export class Tag extends Base {
  @Column({ unique: true, length: 50 })
  name: string;

  @Column({ unique: true, length: 100 })
  slug: string;

  @Column({ length: 20, default: '#10b981' })
  color: string;

  @Column({ name: 'article_count', default: 0 })
  articleCount: number;
}
