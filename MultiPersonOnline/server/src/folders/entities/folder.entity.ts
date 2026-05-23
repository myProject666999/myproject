import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

@Entity('folders')
export class Folder {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Index()
  @Column({ type: 'bigint', unsigned: true, default: 0, name: 'parent_id' })
  parentId: number;

  @Index()
  @Column({ type: 'bigint', unsigned: true, name: 'owner_id' })
  ownerId: number;

  @Column({ type: 'int', default: 0, name: 'sort_order' })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt: Date | null;
}
