import request from './request'

export const customerApi = {
  list: () => request.get('/customer/list'),
  getById: (id) => request.get(`/customer/${id}`),
  add: (data) => request.post('/customer/add', data),
  update: (data) => request.put('/customer/update', data),
  delete: (id) => request.delete(`/customer/${id}`)
}

export const projectApi = {
  list: () => request.get('/project/list'),
  getById: (id) => request.get(`/project/${id}`),
  add: (data) => request.post('/project/add', data),
  update: (data) => request.put('/project/update', data),
  delete: (id) => request.delete(`/project/${id}`)
}

export const workerApi = {
  list: () => request.get('/worker/list'),
  getById: (id) => request.get(`/worker/${id}`),
  add: (data) => request.post('/worker/add', data),
  update: (data) => request.put('/worker/update', data),
  delete: (id) => request.delete(`/worker/${id}`)
}

export const materialApi = {
  list: () => request.get('/material/list'),
  getById: (id) => request.get(`/material/${id}`),
  add: (data) => request.post('/material/add', data),
  update: (data) => request.put('/material/update', data),
  delete: (id) => request.delete(`/material/${id}`)
}

export const progressApi = {
  list: () => request.get('/customerProgress/list'),
  getById: (id) => request.get(`/customerProgress/${id}`),
  add: (data) => request.post('/customerProgress/add', data),
  update: (data) => request.put('/customerProgress/update', data),
  delete: (id) => request.delete(`/customerProgress/${id}`)
}

export const acceptanceApi = {
  list: () => request.get('/acceptance/list'),
  getById: (id) => request.get(`/acceptance/${id}`),
  add: (data) => request.post('/acceptance/add', data),
  update: (data) => request.put('/acceptance/update', data),
  delete: (id) => request.delete(`/acceptance/${id}`)
}
