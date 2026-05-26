import { BaseRepository } from './BaseRepository.js';
import { Category } from '../entities/Category.js';

export class CategoryRepository extends BaseRepository<Category> {
  constructor() {
    super(Category);
  }

  async findAllWithCount(): Promise<Category[]> {
    return this.repository
      .createQueryBuilder('category')
      .orderBy('category.article_count', 'DESC')
      .getMany();
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return this.repository.findOneBy({ slug });
  }

  async incrementArticleCount(id: number, delta = 1): Promise<void> {
    await this.repository.increment({ id }, 'articleCount', delta);
  }
}
