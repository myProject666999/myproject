import request from './request'

export const authApi = {
  login: (data) => request.post('/auth/login', data),
  register: (data) => request.post('/auth/register', data)
}

export const userApi = {
  getInfo: () => request.get('/user/info'),
  updateInfo: (data) => request.put('/user/info', data),
  getBalance: () => request.get('/user/balance')
}

export const productApi = {
  getList: (params) => request.get('/products', { params }),
  getDetail: (id) => request.get(`/products/${id}`)
}

export const groupApi = {
  create: (data) => request.post('/groups', data),
  getList: (params) => request.get('/groups', { params }),
  getDetail: (id) => request.get(`/groups/${id}`),
  join: (id) => request.post(`/groups/${id}/join`),
  cancel: (id) => request.post(`/groups/${id}/cancel`),
  getMyGroups: (params) => request.get('/my/groups', { params })
}

export const orderApi = {
  getList: (params) => request.get('/orders', { params }),
  getMyOrders: (params) => request.get('/orders', { params }),
  getDetail: (id) => request.get(`/orders/${id}`),
  refund: (id, data) => request.post(`/orders/${id}/refund`, data)
}

export const adminApi = {
  getUsers: (params) => request.get('/admin/users', { params }),
  getGroups: (params) => request.get('/admin/groups', { params }),
  getOrders: (params) => request.get('/admin/orders', { params }),
  getStatistics: () => request.get('/admin/statistics'),
  getProducts: (params) => request.get('/admin/products', { params })
}
