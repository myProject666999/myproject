import axios from 'axios';
import type { Student, Course, Grade, ApiResponse } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
});

export const studentApi = {
  getAll: (params?: { studentNo?: string; name?: string }) =>
    api.get<ApiResponse<Student[]>>('/students', { params }),
  create: (data: Omit<Student, 'id'>) =>
    api.post<ApiResponse<Student>>('/students', data),
  update: (id: number, data: Student) =>
    api.put<ApiResponse<Student>>(`/students/${id}`, data),
  delete: (id: number) => api.delete(`/students/${id}`),
  batchDelete: (ids: number[]) =>
    api.post<ApiResponse<null>>('/students/batch-delete', { ids }),
};

export const courseApi = {
  getAll: (params?: { courseNo?: string; name?: string }) =>
    api.get<ApiResponse<Course[]>>('/courses', { params }),
  create: (data: Omit<Course, 'id'>) =>
    api.post<ApiResponse<Course>>('/courses', data),
  update: (id: number, data: Course) =>
    api.put<ApiResponse<Course>>(`/courses/${id}`, data),
  delete: (id: number) => api.delete(`/courses/${id}`),
  batchDelete: (ids: number[]) =>
    api.post<ApiResponse<null>>('/courses/batch-delete', { ids }),
};

export const gradeApi = {
  getAll: (params?: { studentNo?: string; courseNo?: string }) =>
    api.get<ApiResponse<Grade[]>>('/grades', { params }),
  create: (data: Omit<Grade, 'id'>) =>
    api.post<ApiResponse<Grade>>('/grades', data),
  update: (id: number, data: Grade) =>
    api.put<ApiResponse<Grade>>(`/grades/${id}`, data),
  delete: (id: number) => api.delete(`/grades/${id}`),
  batchDelete: (ids: number[]) =>
    api.post<ApiResponse<null>>('/grades/batch-delete', { ids }),
};

export default api;
