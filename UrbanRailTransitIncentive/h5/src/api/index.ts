import api from '../utils/request'

export const authApi = {
  register: (data: any) => api.post('/auth/user/register', data),
  login: (data: any) => api.post('/auth/user/login', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/user/me')
}

export const homeApi = {
  getBanners: () => api.get('/home/banners'),
  getAnnouncements: () => api.get('/home/announcements'),
  getRecommendedTasks: () => api.get('/home/recommended-tasks'),
  getTaskTypes: () => api.get('/home/task-types')
}

export const taskApi = {
  getList: (params: any) => api.get('/tasks', { params }),
  getDetail: (id: number) => api.get(`/tasks/${id}`),
  accept: (id: number) => api.post(`/tasks/${id}/accept`),
  toggleFavorite: (id: number) => api.post(`/tasks/${id}/favorite`),
  addComment: (id: number, data: any) => api.post(`/tasks/${id}/comment`, data),
  getComments: (id: number, params: any) => api.get(`/tasks/${id}/comments`, { params })
}

export const userApi = {
  getAssignments: (params: any) => api.get('/my/assignments', { params }),
  getResults: (params: any) => api.get('/my/results', { params }),
  getFavorites: (params: any) => api.get('/my/favorites', { params }),
  submitResult: (assignmentId: number, data: any) => api.post(`/my/assignments/${assignmentId}/submit`, data)
}
