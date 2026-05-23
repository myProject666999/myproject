import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('operation_logs')
export class OperationLog {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Index()
  @Column({ type: 'bigint', unsigned: true, nullable: true, name: 'document_id' })
  documentId: number | null;

  @Index()
  @Column({ type: 'bigint', unsigned: true, name: 'user_id' })
  userId: number;

  @Column({ type: 'varchar', length: 50 })
  action: string;

  @Column({ type: 'text', nullable: true })
  detail: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'ip_address' })
  ipAddress: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'user_agent' })
  userAgent: string | null;

  @Index()
  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
