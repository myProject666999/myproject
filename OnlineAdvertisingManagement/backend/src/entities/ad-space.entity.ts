import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('ad_spaces')
export class AdSpace {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50, unique: true })
  code: string;

  @Column()
  width: number;

  @Column()
  height: number;

  @Column({ length: 50 })
  position: string;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
