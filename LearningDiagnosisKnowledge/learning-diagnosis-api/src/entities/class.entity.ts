import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { User } from './user.entity';
import { ClassStudent } from './class-student.entity';

@Entity('classes')
export class ClassEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  grade: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  subject?: string;

  @Column({
    name: 'teacher_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  teacherId?: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'student_count', type: 'int', default: 0 })
  studentCount: number;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @ManyToOne(() => User, (user) => user.classesTaught)
  teacher: User;

  @OneToMany(() => ClassStudent, (cs) => cs.class)
  classStudents: ClassStudent[];
}
