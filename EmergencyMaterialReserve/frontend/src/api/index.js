import request from '@/utils/request'

export const authApi = {
  login: (data) => request.post('/auth/login', data),
  getUserInfo: () => request.get('/auth/userinfo'),
  logout: () => request.post('/auth/logout'),
  updatePassword: (data) => request.put('/auth/password', data)
}

export const materialApi = {
  getList: (params) => request.get('/materials', { params }),
  getById: (id) => request.get(`/materials/${id}`),
  create: (data) => request.post('/materials', data),
  update: (id, data) => request.put(`/materials/${id}`, data),
  delete: (id) => request.delete(`/materials/${id}`),
  getCategories: (params) => request.get('/materials/categories', { params }),
  createCategory: (data) => request.post('/materials/categories', data),
  updateCategory: (id, data) => request.put(`/materials/categories/${id}`, data),
  deleteCategory: (id) => request.delete(`/materials/categories/${id}`)
}

export const warehouseApi = {
  getList: (params) => request.get('/warehouses', { params }),
  getById: (id) => request.get(`/warehouses/${id}`),
  create: (data) => request.post('/warehouses', data),
  update: (id, data) => request.put(`/warehouses/${id}`, data),
  delete: (id) => request.delete(`/warehouses/${id}`),
  getAll: () => request.get('/warehouses/all')
}

export const inventoryApi = {
  getList: (params) => request.get('/inventory', { params }),
  getSummary: (params) => request.get('/inventory/summary', { params }),
  getByWarehouse: (warehouseId, params) => request.get(`/inventory/warehouse/${warehouseId}`, { params }),
  getByMaterial: (materialId, params) => request.get(`/inventory/material/${materialId}`, { params }),
  updateBatch: (id, data) => request.put(`/inventory/${id}`, data),
  freeze: (id) => request.put(`/inventory/${id}/freeze`),
  unfreeze: (id) => request.put(`/inventory/${id}/unfreeze`)
}

export const stockApi = {
  getList: (params) => request.get('/stock/records', { params }),
  getDetail: (id) => request.get(`/stock/records/${id}`),
  stockIn: (data) => request.post('/stock/in', data),
  stockOut: (data) => request.post('/stock/out', data),
  getStatistics: (params) => request.get('/stock/statistics', { params })
}

export const expiryApi = {
  getList: (params) => request.get('/expiry/alerts', { params }),
  handle: (id, data) => request.put(`/expiry/alerts/${id}/handle`, data),
  getStatistics: () => request.get('/expiry/statistics'),
  refreshWarnings: () => request.post('/expiry/refresh')
}

export const transferApi = {
  getList: (params) => request.get('/transfers', { params }),
  getById: (id) => request.get(`/transfers/${id}`),
  create: (data) => request.post('/transfers', data),
  submit: (id) => request.put(`/transfers/${id}/submit`),
  approve: (id, data) => request.put(`/transfers/${id}/approve`, data),
  reject: (id, data) => request.put(`/transfers/${id}/reject`, data),
  send: (id, data) => request.put(`/transfers/${id}/send`, data),
  receive: (id, data) => request.put(`/transfers/${id}/receive`, data),
  cancel: (id) => request.put(`/transfers/${id}/cancel`),
  delete: (id) => request.delete(`/transfers/${id}`)
}

export const demandApi = {
  getList: (params) => request.get('/demands', { params }),
  getById: (id) => request.get(`/demands/${id}`),
  create: (data) => request.post('/demands', data),
  submit: (id) => request.put(`/demands/${id}/submit`),
  approve: (id, data) => request.put(`/demands/${id}/approve`, data),
  reject: (id, data) => request.put(`/demands/${id}/reject`, data),
  cancel: (id) => request.put(`/demands/${id}/cancel`),
  delete: (id) => request.delete(`/demands/${id}`)
}

export const dashboardApi = {
  getOverview: () => request.get('/dashboard/overview'),
  getMaterialDistribution: () => request.get('/dashboard/material-distribution'),
  getWarehouseStatus: () => request.get('/dashboard/warehouse-status'),
  getExpiryStats: () => request.get('/dashboard/expiry-stats'),
  getRecentTransfers: () => request.get('/dashboard/recent-transfers'),
  getStockTrend: (params) => request.get('/dashboard/stock-trend', { params })
}
