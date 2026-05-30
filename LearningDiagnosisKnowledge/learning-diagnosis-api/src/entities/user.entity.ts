import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { UserRole } from '../common/types';
import { ClassEntity } from './class.entity';
import { ClassStudent } from './class-student.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ name: 'real_name', type: 'varchar', length: 50 })
  realName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role: UserRole;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @Column({ name: 'last_login_at', type: 'datetime', nullable: true })
  lastLoginAt?: Date;

  @OneToMany(() => ClassEntity, (cls) => cls.teacher)
  classesTaught: ClassEntity[];

  @OneToMany(() => ClassStudent, (cs) => cs.student)
  classStudents: ClassStudent[];
}
