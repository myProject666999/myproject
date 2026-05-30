import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';

@Entity('audit_logs')
export class AuditLog extends BaseEntity {
  @Column({ name: 'user_id', type: 'bigint', unsigned: true, nullable: true })
  userId?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  username?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  role?: string;

  @Column({ type: 'varchar', length: 100 })
  action: string;

  @Column({ name: 'resource_type', type: 'varchar', length: 50 })
  resourceType: string;

  @Column({
    name: 'resource_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  resourceId?: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', type: 'varchar', length: 500, nullable: true })
  userAgent?: string;

  @Column({ name: 'request_data', type: 'json', nullable: true })
  requestData?: any;

  @Column({ name: 'response_data', type: 'json', nullable: true })
  responseData?: any;

  @Column({ type: 'tinyint', default: 1 })
  status: number;
}
