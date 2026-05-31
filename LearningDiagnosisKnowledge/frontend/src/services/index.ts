import api from './api';
import type { User, Subject, KnowledgePoint, KnowledgeMastery, WeakPoint, Recommendation, LearningReport, ClassEntity, ExportRecord, PaginationResult } from '../types';

export const authApi = {
  login: (data: { username: string; password: string }) =>
    api.post<any, { accessToken: string; user: User }>('/auth/login', data),
  register: (data: { username: string; password: string; realName: string; email?: string }) =>
    api.post<any, User>('/auth/register', data),
  getProfile: () => api.get<any, User>('/auth/profile'),
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),
  logout: () => api.post('/auth/logout'),
};

export const subjectApi = {
  getList: () => api.get<any, Subject[]>('/subjects'),
  get: (id: string) => api.get<any, Subject>(`/subjects/${id}`),
  create: (data: Partial<Subject>) => api.post('/subjects', data),
  update: (id: string, data: Partial<Subject>) => api.put(`/subjects/${id}`, data),
  delete: (id: string) => api.delete(`/subjects/${id}`),
};

export const knowledgeApi = {
  getTree: (subjectId: string) => api.get<any, KnowledgePoint[]>(`/knowledge-points/tree/${subjectId}`),
  getList: (params: { subjectId: string; parentId?: string }) =>
    api.get<any, KnowledgePoint[]>('/knowledge-points', { params }),
  get: (id: string) => api.get<any, KnowledgePoint>(`/knowledge-points/${id}`),
  getGraph: (id: string) =>
    api.get<any, { nodes: KnowledgePoint[]; edges: any[] }>(`/knowledge-points/${id}/graph`),
  create: (data: Partial<KnowledgePoint>) => api.post('/knowledge-points', data),
  update: (id: string, data: Partial<KnowledgePoint>) => api.put(`/knowledge-points/${id}`, data),
  delete: (id: string) => api.delete(`/knowledge-points/${id}`),
};

export const masteryApi = {
  getMyMastery: (params?: { subjectId?: string }) =>
    api.get<any, KnowledgeMastery[]>('/mastery', { params }),
  getSubjectMastery: (subjectId: string) =>
    api.get<any, KnowledgeMastery[]>(`/mastery/subject/${subjectId}`),
  getPointMastery: (kpId: string) =>
    api.get<any, KnowledgeMastery>(`/mastery/knowledge-point/${kpId}`),
  getHeatmap: (subjectId: string) =>
    api.get<any, any[]>(`/mastery/heatmap/${subjectId}`),
  getHistory: (kpId: string) =>
    api.get<any, any[]>(`/mastery/history/${kpId}`),
};

export const weakPointApi = {
  getMyWeakPoints: () => api.get<any, WeakPoint[]>('/weak-points'),
  get: (id: string) => api.get<any, WeakPoint>(`/weak-points/${id}`),
  refresh: () => api.post('/weak-points/refresh'),
  getStatistics: () => api.get<any, any>('/weak-points/statistics'),
};

export const recommendationApi = {
  getMyRecommendations: (params?: { status?: string; type?: string }) =>
    api.get<any, PaginationResult<Recommendation>>('/recommendations', { params }),
  get: (id: string) => api.get<any, Recommendation>(`/recommendations/${id}`),
  generate: (data?: { subjectId?: string; type?: string; count?: number }) =>
    api.post<any, Recommendation>('/recommendations/generate', data),
  complete: (id: string) => api.post(`/recommendations/${id}/complete`),
  getStatistics: () => api.get<any, any>('/recommendations/statistics'),
};

export const reportApi = {
  getMyReports: (params?: { type?: string }) =>
    api.get<any, PaginationResult<LearningReport>>('/reports', { params }),
  get: (id: string) => api.get<any, LearningReport>(`/reports/${id}`),
  generate: (data: { type: string; subjectId?: string; classId?: string; studentId?: string }) =>
    api.post<any, LearningReport>('/reports/generate', data),
  delete: (id: string) => api.delete(`/reports/${id}`),
  share: (id: string) =>
    api.post<any, { shareUrl: string; shareToken: string }>(`/reports/${id}/share`),
  getByShareToken: (token: string) =>
    api.get<any, LearningReport>(`/reports/share/${token}`),
};

export const classApi = {
  getMyClasses: () => api.get<any, ClassEntity[]>('/classes/my'),
  getList: (params?: any) =>
    api.get<any, PaginationResult<ClassEntity>>('/classes', { params }),
  get: (id: string) => api.get<any, ClassEntity>(`/classes/${id}`),
  create: (data: Partial<ClassEntity>) => api.post('/classes', data),
  update: (id: string, data: Partial<ClassEntity>) => api.put(`/classes/${id}`, data),
  delete: (id: string) => api.delete(`/classes/${id}`),
  getStatistics: (id: string) => api.get<any, any>(`/classes/${id}/statistics`),
  getSubjectStatistics: (id: string, subjectId: string) =>
    api.get<any, any>(`/classes/${id}/statistics/${subjectId}`),
  getStudentRanking: (id: string, subjectId: string) =>
    api.get<any, any[]>(`/classes/${id}/student-ranking/${subjectId}`),
  getMasteryDistribution: (id: string, subjectId: string) =>
    api.get<any, any>(`/classes/${id}/mastery-distribution/${subjectId}`),
  getClassWeakPoints: (id: string) =>
    api.get<any, any[]>(`/classes/${id}/weak-points`),
  refreshStatistics: (id: string) => api.post(`/classes/${id}/statistics/refresh`),
  compareClasses: (data: { classIds: string[]; subjectId: string }) =>
    api.post<any, any>('/classes/comparison', data),
};

export const exportApi = {
  getMyExports: () => api.get<any, PaginationResult<ExportRecord>>('/exports'),
  get: (id: string) => api.get<any, ExportRecord>(`/exports/${id}`),
  create: (data: { type: string; format: string; filters?: any }) =>
    api.post<any, ExportRecord>('/exports', data),
  download: (id: string) => {
    window.open(`/api/exports/${id}/download`, '_blank');
  },
  delete: (id: string) => api.delete(`/exports/${id}`),
};
