import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('recycle_bin')
export class RecycleBin {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true })
  document_id: number;

  @Column({ type: 'bigint', unsigned: true })
  space_id: number;

  @Column({ type: 'varchar', length: 200 })
  original_title: string;

  @Column({ type: 'longtext', nullable: true })
  original_content: string;

  @Column({ type: 'bigint', unsigned: true })
  deleted_by: number;

  @Column({ type: 'datetime', nullable: true })
  expire_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
