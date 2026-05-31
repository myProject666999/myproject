import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from '../../entities/subject.entity';

@Injectable()
export class SubjectService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
  ) {}

  async findAll(): Promise<Subject[]> {
    return this.subjectRepository.find({
      where: { status: 1 },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Subject> {
    const subject = await this.subjectRepository.findOne({
      where: { id, status: 1 },
      relations: { knowledgePoints: true },
    });
    if (!subject) {
      throw new NotFoundException(`学科 ID ${id} 不存在`);
    }
    return subject;
  }

  async create(createSubjectDto: Partial<Subject>): Promise<Subject> {
    const existing = await this.subjectRepository.findOne({
      where: { code: createSubjectDto.code },
    });
    if (existing) {
      throw new ConflictException(`学科编码 ${createSubjectDto.code} 已存在`);
    }
    const subject = this.subjectRepository.create(createSubjectDto);
    return this.subjectRepository.save(subject);
  }

  async update(
    id: number,
    updateSubjectDto: Partial<Subject>,
  ): Promise<Subject> {
    const subject = await this.findOne(id);
    if (updateSubjectDto.code && updateSubjectDto.code !== subject.code) {
      const existing = await this.subjectRepository.findOne({
        where: { code: updateSubjectDto.code },
      });
      if (existing) {
        throw new ConflictException(`学科编码 ${updateSubjectDto.code} 已存在`);
      }
    }
    Object.assign(subject, updateSubjectDto);
    return this.subjectRepository.save(subject);
  }

  async remove(id: number): Promise<void> {
    const subject = await this.findOne(id);
    await this.subjectRepository.softRemove(subject);
  }
}
