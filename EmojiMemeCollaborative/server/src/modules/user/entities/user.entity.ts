import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 30 })
  username: string;

  @Column({ name: 'password_hash', length: 255 })
  password_hash: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ length: 50, nullable: true })
  nickname: string;

  @Column({ length: 255, nullable: true })
  avatar: string;

  @Column({ type: 'enum', enum: ['admin', 'user', 'reviewer'], default: 'user' })
  role: 'admin' | 'user' | 'reviewer';

  @Column({ type: 'enum', enum: ['active', 'banned'], default: 'active' })
  status: 'active' | 'banned';

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
