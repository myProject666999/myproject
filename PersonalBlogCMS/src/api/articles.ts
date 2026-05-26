import api from './index';
import type { Article, ArticleListQuery, PaginatedResult, CreateArticleRequest, UpdateArticleRequest } from '../../shared/types';

export const articleApi = {
  getPublished: (query?: ArticleListQuery) =>
    api.get<never, PaginatedResult<Article>>('/articles', { params: query }),

  getAll: (query?: ArticleListQuery) =>
    api.get<never, PaginatedResult<Article>>('/articles/admin/all', { params: query }),

  getDetail: (id: number) =>
    api.get<never, { article: Article; prev: Article | null; next: Article | null }>(`/articles/${id}`),

  getAdminDetail: (id: number) =>
    api.get<never, { article: Article }>(`/articles/admin/${id}`),

  getHot: (limit = 10) =>
    api.get<never, Article[]>('/articles/hot', { params: { limit } }),

  getArchive: () =>
    api.get<never, { year: number; month: number; count: number }[]>('/articles/archive'),

  search: (keyword: string, page = 1, pageSize = 10) =>
    api.get<never, PaginatedResult<Article>>('/articles/search', { params: { keyword, page, pageSize } }),

  create: (data: CreateArticleRequest) =>
    api.post<never, Article>('/articles/admin', data),

  update: (id: number, data: UpdateArticleRequest) =>
    api.put<never, Article>(`/articles/admin/${id}`, { ...data, id }),

  delete: (id: number) =>
    api.delete<never, void>(`/articles/admin/${id}`),
};
