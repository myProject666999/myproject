import { Repository, DataSource, FindOptionsWhere, FindManyOptions } from 'typeorm';
import { AppDataSource } from '../config/data-source.js';
import type { PaginatedResult } from '../../shared/types';

export abstract class BaseRepository<T extends { id: number }> {
  protected repository: Repository<T>;
  protected dataSource: DataSource = AppDataSource;

  constructor(entity: new () => T) {
    this.repository = this.dataSource.getRepository(entity);
  }

  async findById(id: number): Promise<T | null> {
    return this.repository.findOneBy({ id } as FindOptionsWhere<T>);
  }

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  async paginate(
    page: number,
    pageSize: number,
    options?: FindManyOptions<T>
  ): Promise<PaginatedResult<T>> {
    const [list, total] = await this.repository.findAndCount({
      ...options,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async create(data: Partial<T>): Promise<T> {
    const entity = this.repository.create(data as T);
    return this.repository.save(entity);
  }

  async update(id: number, data: Partial<T>): Promise<T | null> {
    const entity = await this.findById(id);
    if (!entity) return null;
    Object.assign(entity, data);
    return this.repository.save(entity);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async count(where?: FindOptionsWhere<T>): Promise<number> {
    return this.repository.count(where ? { where } : undefined);
  }
}
