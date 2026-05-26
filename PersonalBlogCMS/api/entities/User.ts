import { Entity, Column } from 'typeorm';
import { Base } from './Base.js';

@Entity('users')
export class User extends Base {
  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ length: 100, nullable: true })
  nickname: string;

  @Column({ length: 255, nullable: true })
  avatar: string;
}
