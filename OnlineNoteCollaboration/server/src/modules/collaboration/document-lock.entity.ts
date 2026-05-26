import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('document_locks')
export class DocumentLock {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true, unique: true })
  document_id: number;

  @Column({ type: 'bigint', unsigned: true })
  user_id: number;

  @Column({ type: 'tinyint', default: 1 })
  lock_type: number;

  @CreateDateColumn({ type: 'timestamp' })
  acquired_at: Date;

  @Column({ type: 'datetime', nullable: true })
  expire_at: Date;
}
