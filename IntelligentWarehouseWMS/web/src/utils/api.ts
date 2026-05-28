import request from './request'

export const authApi = {
  login: (data) => request.post('/auth/login', data),
}

export const userApi = {
  list: (params) => request.get('/user/list', { params }),
  create: (data) => request.post('/user/create', data),
  update: (data) => request.post('/user/update', data),
  delete: (data) => request.post('/user/delete', data),
}

export const warehouseApi = {
  list: (params) => request.get('/warehouse/list', { params }),
  create: (data) => request.post('/warehouse/create', data),
  update: (data) => request.post('/warehouse/update', data),
  delete: (data) => request.post('/warehouse/delete', data),
}

export const shelfApi = {
  list: (params) => request.get('/shelf/list', { params }),
  create: (data) => request.post('/shelf/create', data),
  update: (data) => request.post('/shelf/update', data),
  delete: (data) => request.post('/shelf/delete', data),
}

export const locationApi = {
  list: (params) => request.get('/location/list', { params }),
  create: (data) => request.post('/location/create', data),
  update: (data) => request.post('/location/update', data),
  delete: (data) => request.post('/location/delete', data),
}

export const productApi = {
  list: (params) => request.get('/product/list', { params }),
  create: (data) => request.post('/product/create', data),
  update: (data) => request.post('/product/update', data),
  delete: (data) => request.post('/product/delete', data),
}

export const inventoryApi = {
  list: (params) => request.get('/inventory/list', { params }),
  logList: (params) => request.get('/report/inventorylog', { params }),
}

export const inboundApi = {
  list: (params) => request.get('/inbound/list', { params }),
  create: (data) => request.post('/inbound/create', data),
  audit: (data) => request.post('/inbound/audit', data),
}

export const outboundApi = {
  list: (params) => request.get('/outbound/list', { params }),
  create: (data) => request.post('/outbound/create', data),
  audit: (data) => request.post('/outbound/audit', data),
}

export const pickingApi = {
  list: (params) => request.get('/picking/list', { params }),
  complete: (data) => request.post('/picking/complete', data),
}

export const stocktakeApi = {
  list: (params) => request.get('/stocktake/list', { params }),
  create: (data) => request.post('/stocktake/create', data),
  start: (data) => request.post('/stocktake/start', data),
  complete: (data) => request.post('/stocktake/complete', data),
  detail: (id) => request.get(`/stocktake/detail?id=${id}`),
}

export const reportApi = {
  dashboard: () => request.get('/report/dashboard'),
  inventoryLog: (params) => request.get('/report/inventorylog', { params }),
}
