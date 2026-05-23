import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  Unique,
} from 'typeorm';

@Entity('document_versions')
@Unique(['documentId', 'version'])
export class DocumentVersion {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Index()
  @Column({ type: 'bigint', unsigned: true, name: 'document_id' })
  documentId: number;

  @Column({ type: 'int' })
  version: number;

  @Column({ type: 'longtext' })
  content: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'change_summary' })
  changeSummary: string | null;

  @Column({ type: 'bigint', unsigned: true, name: 'created_by' })
  createdBy: number;

  @Index()
  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
