import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  Unique,
} from 'typeorm';

@Entity('document_permissions')
@Unique(['documentId', 'userId'])
export class DocumentPermission {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true, name: 'document_id' })
  documentId: number;

  @Index()
  @Column({ type: 'bigint', unsigned: true, name: 'user_id' })
  userId: number;

  @Column({ type: 'tinyint', default: 1, name: 'permission_type' })
  permissionType: number;

  @Column({ type: 'tinyint', default: 1 })
  source: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
