import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('recycle_bin')
export class RecycleBin {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Index()
  @Column({ type: 'bigint', unsigned: true, name: 'document_id' })
  documentId: number;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Index()
  @Column({ type: 'bigint', unsigned: true, name: 'owner_id' })
  ownerId: number;

  @Column({ type: 'bigint', unsigned: true, name: 'deleted_by' })
  deletedBy: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime', nullable: true, name: 'expires_at' })
  expiresAt: Date | null;
}
