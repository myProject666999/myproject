import { get, post, put, del } from '../utils/request';
import type {
  User,
  Subject,
  KnowledgePoint,
  KnowledgeRelation,
  Question,
  Exercise,
  AnswerRecord,
  ExerciseSession,
  KnowledgeMastery,
  WeakPoint,
  Recommendation,
  LearningReport,
  ClassEntity,
  ExportRecord,
  PaginationResult,
  LoginParams,
  LoginResult,
  RegisterParams,
  GraphData,
} from '../types';

export const authApi = {
  login: (data: LoginParams) => post<LoginResult>('/auth/login', data),
  register: (data: RegisterParams) => post<User>('/auth/register', data),
  getProfile: () => get<User>('/auth/profile'),
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    post<void>('/auth/change-password', data),
  logout: () => post<void>('/auth/logout'),
};

export const subjectApi = {
  getList: () => get<Subject[]>('/subjects'),
  getById: (id: number) => get<Subject>(`/subjects/${id}`),
  create: (data: Partial<Subject>) => post<Subject>('/subjects', data),
  update: (id: number, data: Partial<Subject>) => put<Subject>(`/subjects/${id}`, data),
  remove: (id: number) => del<void>(`/subjects/${id}`),
};

export const knowledgeApi = {
  getTree: (subjectId: number) => get<KnowledgePoint[]>(`/knowledge-points/tree/${subjectId}`),
  getList: (params?: object) => get<PaginationResult<KnowledgePoint> | KnowledgePoint[]>('/knowledge-points', params),
  getById: (id: number) => get<KnowledgePoint>(`/knowledge-points/${id}`),
  getGraph: (id: number, depth?: number) => get<GraphData>(`/knowledge-points/${id}/graph`, { depth }),
  create: (data: Partial<KnowledgePoint>) => post<KnowledgePoint>('/knowledge-points', data),
  update: (id: number, data: Partial<KnowledgePoint>) => put<KnowledgePoint>(`/knowledge-points/${id}`, data),
  remove: (id: number) => del<void>(`/knowledge-points/${id}`),
};

export const knowledgeRelationApi = {
  getByKpId: (kpId: number) => get<KnowledgeRelation[]>(`/knowledge-relations/${kpId}`),
  create: (data: { fromKpId: number; toKpId: number; relationType: string; weight?: number; description?: string }) =>
    post<KnowledgeRelation>('/knowledge-relations', data),
  remove: (id: number) => del<void>(`/knowledge-relations/${id}`),
};

export const questionApi = {
  getList: (params?: object) => get<PaginationResult<Question>>('/questions', params),
  getById: (id: number) => get<Question>(`/questions/${id}`),
  create: (data: Partial<Question>) => post<Question>('/questions', data),
  update: (id: number, data: Partial<Question>) => put<Question>(`/questions/${id}`, data),
  remove: (id: number) => del<void>(`/questions/${id}`),
  batchImport: (data: { questions: Partial<Question>[]; subjectId: number }) =>
    post<{ imported: number; failed: number }>('/questions/batch-import', data),
  addKnowledgePoint: (id: number, data: { knowledgePointId: number; weight?: number }[]) =>
    post<void>(`/questions/${id}/knowledge-points`, data),
  removeKnowledgePoint: (id: number, kpId: number) =>
    del<void>(`/questions/${id}/knowledge-points/${kpId}`),
};

export const exerciseApi = {
  getList: (params?: object) => get<PaginationResult<Exercise>>('/exercises', params),
  getById: (id: number) => get<Exercise>(`/exercises/${id}`),
  create: (data: Partial<Exercise>) => post<Exercise>('/exercises', data),
  update: (id: number, data: Partial<Exercise>) => put<Exercise>(`/exercises/${id}`, data),
  remove: (id: number) => del<void>(`/exercises/${id}`),
  addQuestion: (id: number, data: { questionId: number; sortOrder?: number; score?: number }[]) =>
    post<void>(`/exercises/${id}/questions`, data),
  removeQuestion: (id: number, qId: number) =>
    del<void>(`/exercises/${id}/questions/${qId}`),
};

export const answerApi = {
  submit: (data: { questionId: number; studentAnswer: string; exerciseId?: number; timeSpent?: number }) =>
    post<AnswerRecord>('/answers/submit', data),
  getMyList: (params?: object) => get<PaginationResult<AnswerRecord>>('/answers', params),
  getById: (id: number) => get<AnswerRecord>(`/answers/${id}`),
  getHistory: (questionId: number) => get<AnswerRecord[]>(`/answers/question/${questionId}/history`),
  getWrongBook: (params?: object) => get<PaginationResult<AnswerRecord>>('/answers/wrong', params),
  redo: (id: number) => post<AnswerRecord>(`/answers/${id}/redo`),
};

export const exerciseSessionApi = {
  start: (data: { exerciseId: number; classId?: number }) =>
    post<ExerciseSession>('/exercise-sessions/start', data),
  submit: (id: number) => post<ExerciseSession>(`/exercise-sessions/${id}/submit`),
  getMyList: (params?: object) => get<PaginationResult<ExerciseSession>>('/exercise-sessions', params),
  getById: (id: number) => get<ExerciseSession>(`/exercise-sessions/${id}`),
  getAnswers: (id: number) => get<AnswerRecord[]>(`/exercise-sessions/${id}/answers`),
};

export const masteryApi = {
  getMyList: (params?: object) => get<PaginationResult<KnowledgeMastery>>('/mastery', params),
  getBySubject: (subjectId: number, studentId?: number) =>
    get<unknown>(`/mastery/subject/${subjectId}`, studentId ? { studentId } : undefined),
  getByKp: (kpId: number, studentId?: number) =>
    get<unknown>(`/mastery/knowledge-point/${kpId}`, studentId ? { studentId } : undefined),
  getHeatmap: (subjectId: number, studentId?: number) =>
    get<unknown>(`/mastery/heatmap/${subjectId}`, studentId ? { studentId } : undefined),
  recalculate: (studentId: number) =>
    post<{ updated: number; message: string }>(`/mastery/recalculate/${studentId}`),
  getHistory: (kpId: number, params?: { studentId?: number; days?: number }) =>
    get<unknown>(`/mastery/history/${kpId}`, params),
};

export const weakPointApi = {
  getMyList: (params?: object) => get<PaginationResult<WeakPoint>>('/weak-points', params),
  getById: (id: number) => get<WeakPoint>(`/weak-points/${id}`),
  refresh: (studentId?: number) =>
    post<{ updated: number; message: string }>('/weak-points/refresh' + (studentId ? `?studentId=${studentId}` : '')),
  getStatistics: (studentId?: number) =>
    get<unknown>('/weak-points/statistics', studentId ? { studentId } : undefined),
};

export const recommendationApi = {
  getMyList: (params?: object) => get<PaginationResult<Recommendation>>('/recommendations', params),
  getById: (id: number) => get<Recommendation>(`/recommendations/${id}`),
  generate: (data: { subjectId: number; type: string; targetKnowledgePointIds?: number[] }) =>
    post<Recommendation>('/recommendations/generate', data),
  complete: (id: number) => post<Recommendation>(`/recommendations/${id}/complete`),
  getStatistics: () => get<unknown>('/recommendations/statistics'),
};

export const reportApi = {
  getList: (params?: object) => get<PaginationResult<LearningReport>>('/reports', params),
  getById: (id: number) => get<LearningReport>(`/reports/${id}`),
  generate: (data: { type: string; subjectId: number; studentId?: number; classId?: number; periodStart?: string; periodEnd?: string }) =>
    post<LearningReport>('/reports/generate', data),
  remove: (id: number) => del<void>(`/reports/${id}`),
  share: (id: number) => post<{ shareUrl: string; shareToken: string }>(`/reports/${id}/share`),
  getByShareToken: (token: string) => get<LearningReport>(`/reports/share/${token}`),
  getDiagnosis: (exerciseSessionId: number) =>
    get<LearningReport>(`/reports/diagnosis/${exerciseSessionId}`),
};

export const classApi = {
  getList: (params?: object) => get<PaginationResult<ClassEntity>>('/classes', params),
  getById: (id: number) => get<ClassEntity & { students?: unknown[] }>(`/classes/${id}`),
  create: (data: { name: string; grade: string; subject?: string; description?: string }) =>
    post<ClassEntity>('/classes', data),
  update: (id: number, data: Partial<ClassEntity>) => put<ClassEntity>(`/classes/${id}`, data),
  remove: (id: number) => del<void>(`/classes/${id}`),
  addStudent: (id: number, data: { studentIds: number[] }) =>
    post<{ added: number; alreadyExists: number; failed: number }>(`/classes/${id}/students`, data),
  removeStudent: (id: number, studentId: number) =>
    del<void>(`/classes/${id}/students/${studentId}`),
  getMy: () => get<ClassEntity[]>('/classes/my'),
  getStatistics: (id: number) => get<unknown>(`/classes/${id}/statistics`),
  getSubjectStatistics: (id: number, subjectId: number) =>
    get<unknown>(`/classes/${id}/statistics/${subjectId}`),
  getStudentRanking: (id: number, subjectId: number) =>
    get<unknown[]>(`/classes/${id}/student-ranking/${subjectId}`),
  getMasteryDistribution: (id: number, subjectId: number) =>
    get<unknown>(`/classes/${id}/mastery-distribution/${subjectId}`),
  getWeakPoints: (id: number) => get<unknown[]>(`/classes/${id}/weak-points`),
  refreshStatistics: (id: number) =>
    post<{ success: boolean; message: string; updatedCount: number }>(`/classes/${id}/statistics/refresh`),
  comparison: (data: { classIds: number[]; subjectId?: number }) =>
    post<unknown[]>('/classes/comparison', data),
  comparisonTrend: (params: { classIds: number[]; subjectId?: number; days?: number }) =>
    get<unknown[]>('/classes/comparison/trend', params),
};

export const exportApi = {
  create: (data: { type: string; format: string; parameters?: Record<string, unknown> }) =>
    post<ExportRecord>('/exports', data),
  getList: (params?: { page?: number; pageSize?: number }) =>
    get<PaginationResult<ExportRecord>>('/exports', params),
  getById: (id: number) => get<ExportRecord>(`/exports/${id}`),
  download: (id: number) => `/api/exports/${id}/download`,
  remove: (id: number) => del<void>(`/exports/${id}`),
};
