import { CategoryRepository } from '../repositories/CategoryRepository.js';
import { TagRepository } from '../repositories/TagRepository.js';
import { redis, cacheKeys } from '../config/redis.js';
import type {
  Category,
  Tag,
  CreateCategoryRequest,
  CreateTagRequest,
} from '../../shared/types.js';

export class CategoryService {
  private categoryRepository: CategoryRepository;
  private tagRepository: TagRepository;

  constructor() {
    this.categoryRepository = new CategoryRepository();
    this.tagRepository = new TagRepository();
  }

  async getAllCategories(): Promise<Category[]> {
    const cached = await redis.get(cacheKeys.categoryList);
    if (cached) {
      return JSON.parse(cached) as Category[];
    }

    const categories = await this.categoryRepository.findAllWithCount();
    await redis.set(cacheKeys.categoryList, JSON.stringify(categories), 'EX', 86400);
    return categories;
  }

  async getAllTags(): Promise<Tag[]> {
    const cached = await redis.get(cacheKeys.tagCloud);
    if (cached) {
      return JSON.parse(cached) as Tag[];
    }

    const tags = await this.tagRepository.findAllWithCount();
    await redis.set(cacheKeys.tagCloud, JSON.stringify(tags), 'EX', 86400);
    return tags;
  }

  async createCategory(request: CreateCategoryRequest): Promise<Category> {
    const category = await this.categoryRepository.create(request);
    await this.invalidateCache();
    return category;
  }

  async updateCategory(id: number, request: Partial<CreateCategoryRequest>): Promise<Category | null> {
    const category = await this.categoryRepository.update(id, request);
    if (category) {
      await this.invalidateCache();
    }
    return category;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const success = await this.categoryRepository.delete(id);
    if (success) {
      await this.invalidateCache();
    }
    return success;
  }

  async createTag(request: CreateTagRequest): Promise<Tag> {
    const tag = await this.tagRepository.create({
      ...request,
      color: request.color || '#10b981',
    });
    await this.invalidateCache();
    return tag;
  }

  async updateTag(id: number, request: Partial<CreateTagRequest>): Promise<Tag | null> {
    const tag = await this.tagRepository.update(id, request);
    if (tag) {
      await this.invalidateCache();
    }
    return tag;
  }

  async deleteTag(id: number): Promise<boolean> {
    const success = await this.tagRepository.delete(id);
    if (success) {
      await this.invalidateCache();
    }
    return success;
  }

  private async invalidateCache(): Promise<void> {
    await redis.del(cacheKeys.categoryList);
    await redis.del(cacheKeys.tagCloud);
    await redis.del(cacheKeys.statsOverview);
  }
}
