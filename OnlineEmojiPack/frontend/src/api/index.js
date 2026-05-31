import request from './request'

export const authApi = {
  login: (data) => request.post('/auth/login', data),
  register: (data) => request.post('/auth/register', data)
}

export const categoryApi = {
  list: () => request.get('/categories')
}

export const tagApi = {
  list: () => request.get('/tags'),
  search: (name) => request.get('/tags/search', { params: { name } })
}

export const materialApi = {
  list: (params) => request.get('/materials/public/list', { params }),
  getById: (id) => request.get(`/materials/public/${id}`),
  myList: (params) => request.get('/materials/my', { params }),
  upload: (formData) => request.post('/materials/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => request.delete(`/materials/${id}`),
  favorite: (id) => request.post(`/materials/${id}/favorite`),
  favoriteStatus: (id) => request.get(`/materials/${id}/favorite-status`),
  download: (id) => request.post(`/materials/${id}/download`)
}

export const collectionApi = {
  list: (params) => request.get('/collections/public/list', { params }),
  getById: (id) => request.get(`/collections/public/${id}`),
  myList: (params) => request.get('/collections/my', { params }),
  create: (data) => request.post('/collections', data),
  delete: (id) => request.delete(`/collections/${id}`),
  addMaterial: (id, materialId) => request.post(`/collections/${id}/materials/${materialId}`),
  removeMaterial: (id, materialId) => request.delete(`/collections/${id}/materials/${materialId}`),
  favorite: (id) => request.post(`/collections/${id}/favorite`)
}

export const userApi = {
  getCurrent: () => request.get('/users/me'),
  update: (data) => request.put('/users/me', data)
}
