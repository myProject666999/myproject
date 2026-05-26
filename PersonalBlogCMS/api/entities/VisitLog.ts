import { Entity, Column } from 'typeorm';
import { Base } from './Base.js';

@Entity('visit_logs')
export class VisitLog extends Base {
  @Column({ name: 'article_id', nullable: true })
  articleId: number;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ length: 255, nullable: true })
  referer: string;
}
