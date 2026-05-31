import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ClassEntity } from '../../entities/class.entity';
import { ClassStudent } from '../../entities/class-student.entity';
import { User } from '../../entities/user.entity';
import { CreateClassDto, AddStudentDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { QueryClassDto } from './dto/query-class.dto';
import { UserRole } from '../../common/types';
import type { PaginationResult, RequestUser } from '../../common/types';
import { AuditService } from '../../common/services/audit.service';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(ClassEntity)
    private readonly classRepository: Repository<ClassEntity>,
    @InjectRepository(ClassStudent)
    private readonly classStudentRepository: Repository<ClassStudent>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly auditService: AuditService,
  ) {}

  async findAll(
    query: QueryClassDto,
    currentUser: RequestUser,
  ): Promise<PaginationResult<ClassEntity>> {
    const where: any = {};

    if (query.name) {
      where.name = query.name;
    }
    if (query.grade) {
      where.grade = query.grade;
    }
    if (query.subject) {
      where.subject = query.subject;
    }
    if (query.teacherId !== undefined) {
      where.teacherId = query.teacherId;
    }
    if (query.status !== undefined) {
      where.status = query.status;
    } else {
      where.status = 1;
    }

    if (currentUser.role === UserRole.TEACHER) {
      where.teacherId = currentUser.id;
    } else if (currentUser.role === UserRole.STUDENT) {
      const classStudents = await this.classStudentRepository.find({
        where: { studentId: currentUser.id, isActive: 1 },
        select: { classId: true },
      });
      const classIds = classStudents.map((cs) => cs.classId);
      if (classIds.length === 0) {
        return { list: [], total: 0, page: query.page || 1, pageSize: query.pageSize || 20 };
      }
      where.id = In(classIds);
    }

    const [list, total] = await this.classRepository.findAndCount({
      where,
      order: { id: 'DESC' },
      relations: { teacher: true },
      skip:
        query.page && query.pageSize
          ? (query.page - 1) * query.pageSize
          : undefined,
      take: query.pageSize,
    });

    return {
      list,
      total,
      page: query.page || 1,
      pageSize: query.pageSize || 20,
    };
  }

  async findOne(
    id: number,
    currentUser: RequestUser,
  ): Promise<ClassEntity & { students?: User[] }> {
    const cls = await this.classRepository.findOne({
      where: { id, status: 1 },
      relations: { teacher: true, classStudents: { student: true } },
    });

    if (!cls) {
      throw new NotFoundException(`班级 ID ${id} 不存在`);
    }

    await this.checkClassPermission(cls, currentUser);

    const result = cls as any;
    result.students = cls.classStudents
      .filter((cs) => cs.isActive === 1)
      .map((cs) => {
        const student = { ...cs.student };
        if (
          currentUser.role === UserRole.STUDENT &&
          currentUser.id !== student.id
        ) {
          delete (student as any).email;
          delete (student as any).phone;
        }
        return student;
      });
    delete result.classStudents;

    await this.auditService.log(
      currentUser,
      '查看班级详情',
      'class',
      id,
      `查看班级 "${cls.name}" 详情`,
    );

    return result;
  }

  async create(
    dto: CreateClassDto,
    currentUser: RequestUser,
  ): Promise<ClassEntity> {
    if (dto.teacherId) {
      const teacher = await this.userRepository.findOne({
        where: { id: dto.teacherId, role: UserRole.TEACHER, status: 1 },
      });
      if (!teacher) {
        throw new NotFoundException(`教师 ID ${dto.teacherId} 不存在或不是教师`);
      }
    }

    const existing = await this.classRepository.findOne({
      where: { name: dto.name, grade: dto.grade, status: 1 },
    });
    if (existing) {
      throw new ConflictException(`同年级下班级名称 "${dto.name}" 已存在`);
    }

    const cls = this.classRepository.create({
      ...dto,
      teacherId: dto.teacherId || (currentUser.role === UserRole.TEACHER ? currentUser.id : undefined),
    });

    const saved = await this.classRepository.save(cls);

    await this.auditService.log(
      currentUser,
      '创建班级',
      'class',
      saved.id,
      `创建班级 "${saved.name}"`,
      dto,
    );

    return saved;
  }

  async update(
    id: number,
    dto: UpdateClassDto,
    currentUser: RequestUser,
  ): Promise<ClassEntity> {
    const cls = await this.validateClassExists(id);
    await this.checkClassPermission(cls, currentUser);

    if (dto.teacherId && dto.teacherId !== cls.teacherId) {
      const teacher = await this.userRepository.findOne({
        where: { id: dto.teacherId, role: UserRole.TEACHER, status: 1 },
      });
      if (!teacher) {
        throw new NotFoundException(`教师 ID ${dto.teacherId} 不存在或不是教师`);
      }
    }

    if (dto.name && dto.grade && (dto.name !== cls.name || dto.grade !== cls.grade)) {
      const existing = await this.classRepository.findOne({
        where: { name: dto.name, grade: dto.grade || cls.grade, status: 1 },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(`同年级下班级名称 "${dto.name}" 已存在`);
      }
    }

    Object.assign(cls, dto);
    const updated = await this.classRepository.save(cls);

    await this.auditService.log(
      currentUser,
      '更新班级',
      'class',
      id,
      `更新班级 "${updated.name}" 信息`,
      dto,
    );

    return updated;
  }

  async remove(id: number, currentUser: RequestUser): Promise<void> {
    const cls = await this.validateClassExists(id);

    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('只有管理员可以删除班级');
    }

    const activeStudents = await this.classStudentRepository.count({
      where: { classId: id, isActive: 1 },
    });
    if (activeStudents > 0) {
      throw new ConflictException('班级中还有学生，无法删除');
    }

    await this.classRepository.softRemove(cls);

    await this.auditService.log(
      currentUser,
      '删除班级',
      'class',
      id,
      `删除班级 "${cls.name}"`,
    );
  }

  async addStudents(
    classId: number,
    dto: AddStudentDto,
    currentUser: RequestUser,
  ): Promise<{ added: number; alreadyExists: number; failed: number }> {
    const cls = await this.validateClassExists(classId);
    await this.checkClassPermission(cls, currentUser);

    const result = { added: 0, alreadyExists: 0, failed: 0 };

    for (const studentId of dto.studentIds) {
      try {
        const student = await this.userRepository.findOne({
          where: { id: studentId, role: UserRole.STUDENT, status: 1 },
        });
        if (!student) {
          result.failed++;
          continue;
        }

        const existing = await this.classStudentRepository.findOne({
          where: { classId, studentId },
        });

        if (existing) {
          if (existing.isActive === 1) {
            result.alreadyExists++;
          } else {
            existing.isActive = 1;
            existing.joinDate = new Date();
            existing.leaveDate = undefined;
            await this.classStudentRepository.save(existing);
            result.added++;
          }
        } else {
          const classStudent = this.classStudentRepository.create({
            classId,
            studentId,
            joinDate: new Date(),
            isActive: 1,
          });
          await this.classStudentRepository.save(classStudent);
          result.added++;
        }
      } catch {
        result.failed++;
      }
    }

    if (result.added > 0) {
      await this.updateStudentCount(classId);
    }

    await this.auditService.log(
      currentUser,
      '添加学生到班级',
      'class',
      classId,
      `向班级 "${cls.name}" 添加学生，成功 ${result.added} 人，已存在 ${result.alreadyExists} 人，失败 ${result.failed} 人`,
      dto,
    );

    return result;
  }

  async removeStudent(
    classId: number,
    studentId: number,
    currentUser: RequestUser,
  ): Promise<void> {
    const cls = await this.validateClassExists(classId);
    await this.checkClassPermission(cls, currentUser);

    const classStudent = await this.classStudentRepository.findOne({
      where: { classId, studentId, isActive: 1 },
    });

    if (!classStudent) {
      throw new NotFoundException('该学生不在此班级中');
    }

    classStudent.isActive = 0;
    classStudent.leaveDate = new Date();
    await this.classStudentRepository.save(classStudent);

    await this.updateStudentCount(classId);

    const student = await this.userRepository.findOne({
      where: { id: studentId },
      select: { realName: true },
    });

    await this.auditService.log(
      currentUser,
      '从班级移除学生',
      'class',
      classId,
      `从班级 "${cls.name}" 移除学生 "${student?.realName || studentId}"`,
      { studentId },
    );
  }

  async getMyClasses(currentUser: RequestUser): Promise<ClassEntity[]> {
    if (currentUser.role === UserRole.TEACHER) {
      const classes = await this.classRepository.find({
        where: { teacherId: currentUser.id, status: 1 },
        order: { id: 'DESC' },
      });

      await this.auditService.log(
        currentUser,
        '查看我管理的班级',
        'class',
        undefined,
        `教师查看自己管理的 ${classes.length} 个班级`,
      );

      return classes;
    } else if (currentUser.role === UserRole.STUDENT) {
      const classStudents = await this.classStudentRepository.find({
        where: { studentId: currentUser.id, isActive: 1 },
        relations: { class: true },
        order: { id: 'DESC' },
      });

      const classes = classStudents
        .filter((cs) => cs.class.status === 1)
        .map((cs) => cs.class);

      await this.auditService.log(
        currentUser,
        '查看我所在的班级',
        'class',
        undefined,
        `学生查看自己所在的 ${classes.length} 个班级`,
      );

      return classes;
    }

    return this.classRepository.find({
      where: { status: 1 },
      order: { id: 'DESC' },
    });
  }

  async getClassStudents(classId: number, currentUser: RequestUser): Promise<User[]> {
    const cls = await this.validateClassExists(classId);
    await this.checkClassPermission(cls, currentUser);

    const classStudents = await this.classStudentRepository.find({
      where: { classId, isActive: 1 },
      relations: { student: true },
    });

    return classStudents.map((cs) => {
      const student = { ...cs.student };
      if (
        currentUser.role === UserRole.STUDENT &&
        currentUser.id !== student.id
      ) {
        delete (student as any).email;
        delete (student as any).phone;
        delete (student as any).password;
      }
      delete (student as any).password;
      return student;
    });
  }

  private async validateClassExists(id: number): Promise<ClassEntity> {
    const cls = await this.classRepository.findOne({
      where: { id, status: 1 },
    });
    if (!cls) {
      throw new NotFoundException(`班级 ID ${id} 不存在`);
    }
    return cls;
  }

  private async checkClassPermission(cls: ClassEntity, currentUser: RequestUser): Promise<void> {
    if (currentUser.role === UserRole.ADMIN) {
      return;
    }

    if (currentUser.role === UserRole.TEACHER) {
      if (cls.teacherId !== currentUser.id) {
        throw new ForbiddenException('您无权管理此班级');
      }
    } else if (currentUser.role === UserRole.STUDENT) {
      const isInClass = await this.classStudentRepository.findOne({
        where: { classId: cls.id, studentId: currentUser.id, isActive: 1 },
      });
      if (!isInClass) {
        throw new ForbiddenException('您无权查看此班级');
      }
    }
  }

  private async updateStudentCount(classId: number): Promise<void> {
    const count = await this.classStudentRepository.count({
      where: { classId, isActive: 1 },
    });
    await this.classRepository.update(classId, { studentCount: count });
  }
}
