import request from '@/utils/request'

export const authApi = {
  login: (data) => request.post('/auth/login', data),
  register: (data) => request.post('/auth/register', data),
  getMe: () => request.get('/auth/me')
}

export const categoryApi = {
  getParentList: () => request.get('/category/list'),
  getChildren: (parentId) => request.get(`/category/children/${parentId}`),
  getById: (id) => request.get(`/category/${id}`)
}

export const estimateApi = {
  getFactors: (categoryId) => request.get(`/estimate/factors/${categoryId}`),
  calculate: (data) => request.post('/estimate/calculate', data)
}

export const orderApi = {
  create: (data) => request.post('/order/create', data),
  list: (status) => request.get('/order/list', { params: { status } }),
  detail: (id) => request.get(`/order/${id}`),
  cancel: (id, reason) => request.post(`/order/cancel/${id}`, null, { params: { reason } })
}

export const addressApi = {
  list: () => request.get('/address/list'),
  getDefault: () => request.get('/address/default'),
  add: (data) => request.post('/address/add', data),
  update: (data) => request.post('/address/update', data),
  setDefault: (id) => request.post(`/address/setDefault/${id}`),
  delete: (id) => request.delete(`/address/${id}`)
}

export const walletApi = {
  get: () => request.get('/wallet'),
  transactions: (type) => request.get('/wallet/transactions', { params: { type } }),
  withdraw: (amount) => request.post('/wallet/withdraw', null, { params: { amount } })
}

export const collectorApi = {
  orders: (status) => request.get('/collector/orders', { params: { status } }),
  accept: (orderId) => request.post(`/collector/order/accept/${orderId}`),
  updateStatus: (orderId, status) => request.post(`/collector/order/status/${orderId}`, null, { params: { status } }),
  negotiate: (orderId, finalPrice) => request.post(`/collector/order/negotiate/${orderId}`, null, { params: { finalPrice } }),
  complete: (orderId, finalPrice) => request.post(`/collector/order/complete/${orderId}`, null, { params: { finalPrice } })
}
