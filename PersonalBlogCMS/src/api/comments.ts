import api from './index';
import type { Comment, CommentStatus, CreateCommentRequest, PaginatedResult } from '../../shared/types';

export const commentApi = {
  getApproved: (articleId: number) =>
    api.get<never, Comment[]>(`/comments/article/${articleId}`),

  getAll: (status?: CommentStatus, page = 1, pageSize = 20) =>
    api.get<never, PaginatedResult<Comment & { articleTitle?: string }>>('/comments/admin', { params: { status, page, pageSize } }),

  create: (articleId: number, data: CreateCommentRequest) =>
    api.post<never, Comment>(`/comments/article/${articleId}`, data),

  approve: (id: number) =>
    api.put<never, Comment>(`/comments/admin/${id}/approve`),

  reject: (id: number) =>
    api.put<never, Comment>(`/comments/admin/${id}/reject`),

  reply: (id: number, content: string) =>
    api.post<never, Comment>(`/comments/admin/${id}/reply`, { content }),

  delete: (id: number) =>
    api.delete<never, void>(`/comments/admin/${id}`),
};
