import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('online_users')
export class OnlineUser {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true, unique: true })
  user_id: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  space_id: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  document_id: number;

  @CreateDateColumn({ type: 'timestamp' })
  last_active: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  connection_id: string;
}
