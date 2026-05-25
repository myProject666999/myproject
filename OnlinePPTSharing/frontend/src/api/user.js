import request from '../utils/request'

export const userApi = {
  register: (data) => request.post('/users/register', data),

  login: (data) => request.post('/users/login', data),

  getProfile: () => request.get('/users/profile'),

  updateProfile: (data) => request.put('/users/profile', data),

  changePassword: (data) => request.put('/users/password', data),

  getUserDocuments: (userId, params) =>
    request.get(`/users/${userId}/documents`, { params }),

  getMyDocuments: (params) =>
    request.get('/documents/my', { params }),

  getMyFavorites: (params) =>
    request.get('/documents/my/favorites', { params })
}
