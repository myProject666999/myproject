import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Template } from './entities/template.entity';
import { CreateTemplateDto } from './dto/create-template.dto';
import { QueryTemplateDto } from './dto/query-template.dto';

@Injectable()
export class TemplateService {
  constructor(
    @InjectRepository(Template)
    private templateRepository: Repository<Template>,
  ) {}

  async create(dto: CreateTemplateDto, userId: number) {
    const template = this.templateRepository.create({
      ...dto,
      created_by: userId,
    });
    return this.templateRepository.save(template);
  }

  async findAll(query: QueryTemplateDto) {
    const { page = 1, limit = 20, category, keyword, status } = query;
    const where: any = {};
    if (category) where.category = category;
    if (status) where.status = status;
    if (keyword) where.name = Like(`%${keyword}%`);

    const [items, total] = await this.templateRepository.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total, page, limit };
  }

  async findById(id: number) {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    return template;
  }

  async update(id: number, dto: Partial<CreateTemplateDto>) {
    const template = await this.findById(id);
    Object.assign(template, dto);
    return this.templateRepository.save(template);
  }

  async remove(id: number) {
    const template = await this.findById(id);
    await this.templateRepository.remove(template);
    return { message: 'Template deleted successfully' };
  }

  async getCategories() {
    const result = await this.templateRepository
      .createQueryBuilder('template')
      .select('template.category', 'category')
      .where('template.category IS NOT NULL')
      .distinct(true)
      .getRawMany();
    return result.map((r) => r.category);
  }
}
