import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { User } from './user.entity';
import { ExportType, ExportFormat } from '../common/types';

@Entity('export_records')
export class ExportRecord extends BaseEntity {
  @Column({ name: 'requester_id', type: 'bigint', unsigned: true })
  requesterId: number;

  @Column({
    type: 'enum',
    enum: ExportType,
  })
  type: ExportType;

  @Column({
    type: 'enum',
    enum: ExportFormat,
  })
  format: ExportFormat;

  @Column({ type: 'json', nullable: true })
  parameters?: any;

  @Column({ name: 'file_name', type: 'varchar', length: 255, nullable: true })
  fileName?: string;

  @Column({ name: 'file_path', type: 'varchar', length: 500, nullable: true })
  filePath?: string;

  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  fileSize?: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  })
  status: string;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ name: 'expires_at', type: 'datetime', nullable: true })
  expiresAt?: Date;

  @Column({ name: 'download_count', type: 'int', default: 0 })
  downloadCount: number;

  @Column({ name: 'completed_at', type: 'datetime', nullable: true })
  completedAt?: Date;

  @ManyToOne(() => User)
  requester: User;
}
