import api from './index';
import type { Category, Tag, CreateCategoryRequest, CreateTagRequest } from '../../shared/types';

export const categoryApi = {
  getAllCategories: () =>
    api.get<never, Category[]>('/categories'),

  createCategory: (data: CreateCategoryRequest) =>
    api.post<never, Category>('/categories/admin', data),

  updateCategory: (id: number, data: Partial<CreateCategoryRequest>) =>
    api.put<never, Category>(`/categories/admin/${id}`, data),

  deleteCategory: (id: number) =>
    api.delete<never, void>(`/categories/admin/${id}`),

  getAllTags: () =>
    api.get<never, Tag[]>('/categories/tags'),

  createTag: (data: CreateTagRequest) =>
    api.post<never, Tag>('/categories/admin/tags', data),

  updateTag: (id: number, data: Partial<CreateTagRequest>) =>
    api.put<never, Tag>(`/categories/admin/tags/${id}`, data),

  deleteTag: (id: number) =>
    api.delete<never, void>(`/categories/admin/tags/${id}`),
};
