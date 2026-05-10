import api from '../utils/request'

export interface LoginParams {
  username: string
  password: string
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export const authApi = {
  login: (params: LoginParams) => api.post<any, ApiResponse<any>>('/auth/admin/login', params),
  logout: () => api.post('/auth/logout'),
  getCurrentAdmin: () => api.get<any, ApiResponse<any>>('/admin/me'),
  updateProfile: (data: any) => api.put('/admin/profile', data),
  changePassword: (data: any) => api.put('/admin/password', data)
}

export const userApi = {
  getList: (params: any) => api.get<any, ApiResponse<any>>('/admin/users', { params }),
  getDetail: (id: number) => api.get<any, ApiResponse<any>>(`/admin/users/${id}`),
  create: (data: any) => api.post('/admin/users', data),
  update: (id: number, data: any) => api.put(`/admin/users/${id}`, data),
  delete: (id: number) => api.delete(`/admin/users/${id}`)
}

export const publisherApi = {
  getList: (params: any) => api.get<any, ApiResponse<any>>('/admin/publishers', { params }),
  getAll: () => api.get<any, ApiResponse<any>>('/admin/publishers/all'),
  getDetail: (id: number) => api.get<any, ApiResponse<any>>(`/admin/publishers/${id}`),
  create: (data: any) => api.post('/admin/publishers', data),
  update: (id: number, data: any) => api.put(`/admin/publishers/${id}`, data),
  delete: (id: number) => api.delete(`/admin/publishers/${id}`)
}

export const taskTypeApi = {
  getList: (params: any) => api.get<any, ApiResponse<any>>('/admin/task-types', { params }),
  getAll: () => api.get<any, ApiResponse<any>>('/admin/task-types/all'),
  getDetail: (id: number) => api.get<any, ApiResponse<any>>(`/admin/task-types/${id}`),
  create: (data: any) => api.post('/admin/task-types', data),
  update: (id: number, data: any) => api.put(`/admin/task-types/${id}`, data),
  delete: (id: number) => api.delete(`/admin/task-types/${id}`)
}

export const taskApi = {
  getList: (params: any) => api.get<any, ApiResponse<any>>('/admin/tasks', { params }),
  getDetail: (id: number) => api.get<any, ApiResponse<any>>(`/admin/tasks/${id}`),
  create: (data: any) => api.post('/admin/tasks', data),
  update: (id: number, data: any) => api.put(`/admin/tasks/${id}`, data),
  delete: (id: number) => api.delete(`/admin/tasks/${id}`),
  audit: (id: number, data: any) => api.put(`/admin/tasks/${id}/audit`, data),
  getComments: (id: number, params: any) => api.get<any, ApiResponse<any>>(`/admin/tasks/${id}/comments`, { params }),
  deleteComment: (id: number) => api.delete(`/admin/tasks/comments/${id}`)
}

export const taskResultApi = {
  getList: (params: any) => api.get<any, ApiResponse<any>>('/admin/results', { params }),
  getDetail: (id: number) => api.get<any, ApiResponse<any>>(`/admin/results/${id}`),
  delete: (id: number) => api.delete(`/admin/results/${id}`),
  audit: (id: number, data: any) => api.put(`/admin/results/${id}/audit`, data)
}

export const bannerApi = {
  getList: (params: any) => api.get<any, ApiResponse<any>>('/admin/banners', { params }),
  getDetail: (id: number) => api.get<any, ApiResponse<any>>(`/admin/banners/${id}`),
  create: (data: any) => api.post('/admin/banners', data),
  update: (id: number, data: any) => api.put(`/admin/banners/${id}`, data),
  delete: (id: number) => api.delete(`/admin/banners/${id}`)
}

export const announcementApi = {
  getList: (params: any) => api.get<any, ApiResponse<any>>('/admin/announcements', { params }),
  getDetail: (id: number) => api.get<any, ApiResponse<any>>(`/admin/announcements/${id}`),
  create: (data: any) => api.post('/admin/announcements', data),
  update: (id: number, data: any) => api.put(`/admin/announcements/${id}`, data),
  delete: (id: number) => api.delete(`/admin/announcements/${id}`)
}
