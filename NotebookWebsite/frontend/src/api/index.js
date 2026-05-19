import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

export const notebookApi = {
  getAll: () => api.get('/notebooks'),
  getById: (id) => api.get(`/notebooks/${id}`),
  create: (data) => api.post('/notebooks', data),
  update: (id, data) => api.put(`/notebooks/${id}`, data),
  delete: (id) => api.delete(`/notebooks/${id}`)
}

export const sectionApi = {
  getByNotebook: (notebookId) => api.get(`/sections/notebook/${notebookId}`),
  getSubSections: (parentId) => api.get(`/sections/parent/${parentId}`),
  getById: (id) => api.get(`/sections/${id}`),
  create: (data) => api.post('/sections', data),
  update: (id, data) => api.put(`/sections/${id}`, data),
  delete: (id) => api.delete(`/sections/${id}`)
}

export const pageApi = {
  getBySection: (sectionId) => api.get(`/pages/section/${sectionId}`),
  getFavorites: () => api.get('/pages/favorites'),
  search: (keyword) => api.get(`/pages/search?keyword=${keyword}`),
  getById: (id) => api.get(`/pages/${id}`),
  create: (data) => api.post('/pages', data),
  update: (id, data) => api.put(`/pages/${id}`, data),
  delete: (id) => api.delete(`/pages/${id}`),
  toggleFavorite: (id) => api.put(`/pages/${id}/favorite`)
}

export const recycleBinApi = {
  getAll: () => api.get('/recycle-bin'),
  restore: (id) => api.post(`/recycle-bin/${id}/restore`),
  permanentDelete: (id) => api.delete(`/recycle-bin/${id}`),
  clearAll: () => api.delete('/recycle-bin/clear')
}

export default api
