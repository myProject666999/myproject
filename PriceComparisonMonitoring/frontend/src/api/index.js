import request from '@/utils/request'

export const userApi = {
  login: (data) => request.post('/auth/login', data),
  register: (data) => request.post('/auth/register', data),
  getProfile: () => request.get('/user/profile'),
  updateProfile: (data) => request.put('/user/profile', data),
  changePassword: (data) => request.put('/user/password', data)
}

export const productApi = {
  create: (data) => request.post('/products', data),
  getList: (params) => request.get('/products', { params }),
  getDetail: (id) => request.get(`/products/${id}`),
  update: (id, data) => request.put(`/products/${id}`, data),
  delete: (id) => request.delete(`/products/${id}`),
  toggleFavorite: (id) => request.post(`/products/${id}/favorite`),
  getHistory: (id, params) => request.get(`/products/${id}/history`, { params }),
  getTrend: (id, params) => request.get(`/products/${id}/trend`, { params })
}

export const groupApi = {
  create: (data) => request.post('/groups', data),
  getList: () => request.get('/groups'),
  getDetail: (id) => request.get(`/groups/${id}`),
  update: (id, data) => request.put(`/groups/${id}`, data),
  delete: (id) => request.delete(`/groups/${id}`)
}

export const alertApi = {
  create: (data) => request.post('/alerts', data),
  getList: (params) => request.get('/alerts', { params }),
  getDetail: (id) => request.get(`/alerts/${id}`),
  update: (id, data) => request.put(`/alerts/${id}`, data),
  delete: (id) => request.delete(`/alerts/${id}`),
  getLogs: (params) => request.get('/alerts/logs/list', { params }),
  markAsRead: (id) => request.put(`/alerts/logs/${id}/read`),
  markAllAsRead: () => request.put('/alerts/logs/read-all'),
  getUnreadCount: () => request.get('/alerts/logs/unread-count')
}
