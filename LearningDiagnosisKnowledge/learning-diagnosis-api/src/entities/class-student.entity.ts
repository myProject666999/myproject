import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { ClassEntity } from './class.entity';
import { User } from './user.entity';

@Entity('class_students')
export class ClassStudent extends BaseEntity {
  @Column({ name: 'class_id', type: 'bigint', unsigned: true })
  classId: number;

  @Column({ name: 'student_id', type: 'bigint', unsigned: true })
  studentId: number;

  @Column({ name: 'join_date', type: 'date' })
  joinDate: Date;

  @Column({ name: 'leave_date', type: 'date', nullable: true })
  leaveDate?: Date;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: number;

  @ManyToOne(() => ClassEntity, (cls) => cls.classStudents)
  class: ClassEntity;

  @ManyToOne(() => User, (user) => user.classStudents)
  student: User;
}
