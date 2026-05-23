import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 200, default: '未命名文档' })
  title: string;

  @Column({ type: 'longtext', nullable: true })
  content: string | null;

  @Column({ type: 'int', default: 0, name: 'content_version' })
  contentVersion: number;

  @Index()
  @Column({ type: 'bigint', unsigned: true, default: 0, name: 'folder_id' })
  folderId: number;

  @Index()
  @Column({ type: 'bigint', unsigned: true, name: 'owner_id' })
  ownerId: number;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true, name: 'share_token' })
  shareToken: string | null;

  @Column({ type: 'tinyint', default: 0, name: 'share_type' })
  shareType: number;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @Index()
  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @Index()
  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt: Date | null;
}
