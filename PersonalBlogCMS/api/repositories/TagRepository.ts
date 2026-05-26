import { BaseRepository } from './BaseRepository.js';
import { Tag } from '../entities/Tag.js';

export class TagRepository extends BaseRepository<Tag> {
  constructor() {
    super(Tag);
  }

  async findAllWithCount(): Promise<Tag[]> {
    return this.repository
      .createQueryBuilder('tag')
      .orderBy('tag.article_count', 'DESC')
      .getMany();
  }

  async findBySlug(slug: string): Promise<Tag | null> {
    return this.repository.findOneBy({ slug });
  }

  async findByIds(ids: number[]): Promise<Tag[]> {
    return this.repository.findByIds(ids);
  }

  async incrementArticleCount(id: number, delta = 1): Promise<void> {
    await this.repository.increment({ id }, 'articleCount', delta);
  }

  async updateArticleCountBatch(ids: number[]): Promise<void> {
    for (const id of ids) {
      const count = await this.repository
        .createQueryBuilder('tag')
        .innerJoin('tag.articles', 'article', 'article.status = :status', { status: 'published' })
        .where('tag.id = :id', { id })
        .getCount();

      await this.repository.update(id, { articleCount: count });
    }
  }
}
