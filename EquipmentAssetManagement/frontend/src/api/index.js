import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    return Promise.reject(error)
  }
)

export const assets = {
  getList: (params) => request.get('/assets', { params }),
  getDetail: (id) => request.get(`/assets/${id}`),
  create: (data) => request.post('/assets', data),
  update: (id, data) => request.put(`/assets/${id}`, data),
  delete: (id) => request.delete(`/assets/${id}`),
  generateCode: () => request.get('/assets/code/generate')
}

export const categories = {
  getList: () => request.get('/categories'),
  create: (data) => request.post('/categories', data),
  update: (id, data) => request.put(`/categories/${id}`, data),
  delete: (id) => request.delete(`/categories/${id}`)
}

export const users = {
  getList: () => request.get('/users'),
  create: (data) => request.post('/users', data),
  update: (id, data) => request.put(`/users/${id}`, data),
  delete: (id) => request.delete(`/users/${id}`)
}

export const departments = {
  getList: () => request.get('/departments'),
  create: (data) => request.post('/departments', data),
  update: (id, data) => request.put(`/departments/${id}`, data),
  delete: (id) => request.delete(`/departments/${id}`)
}

export const borrows = {
  getList: (params) => request.get('/borrows', { params }),
  getByAsset: (assetId) => request.get(`/borrows/asset/${assetId}`),
  create: (data) => request.post('/borrows', data),
  return: (id, data) => request.put(`/borrows/${id}/return`, data)
}

export const maintenance = {
  getList: (params) => request.get('/maintenance', { params }),
  getByAsset: (assetId) => request.get(`/maintenance/asset/${assetId}`),
  create: (data) => request.post('/maintenance', data),
  process: (id, data) => request.put(`/maintenance/${id}/process`, data),
  complete: (id, data) => request.put(`/maintenance/${id}/complete`, data)
}

export const scraps = {
  getList: (params) => request.get('/scraps', { params }),
  create: (data) => request.post('/scraps', data),
  approve: (id, data) => request.put(`/scraps/${id}/approve`, data),
  reject: (id, data) => request.put(`/scraps/${id}/reject`, data)
}

export const inventory = {
  getList: (params) => request.get('/inventory', { params }),
  getDetail: (id) => request.get(`/inventory/${id}`),
  getDetails: (id) => request.get(`/inventory/${id}/details`),
  create: (data) => request.post('/inventory', data),
  start: (id) => request.put(`/inventory/${id}/start`),
  complete: (id) => request.put(`/inventory/${id}/complete`),
  scan: (id, data) => request.post(`/inventory/${id}/scan`, data)
}

export const transfers = {
  getList: (params) => request.get('/transfers', { params }),
  getByAsset: (assetId) => request.get(`/transfers/asset/${assetId}`),
  create: (data) => request.post('/transfers', data)
}

export const qrcode = {
  generate: (data) => request.post('/qrcode/generate', data),
  getAssetQR: (id) => request.get(`/qrcode/asset/${id}`),
  decode: (data) => request.post('/qrcode/decode', data)
}

export const stats = {
  getOverview: () => request.get('/stats/overview'),
  getByCategory: () => request.get('/stats/by-category'),
  getByDepartment: () => request.get('/stats/by-department')
}
