import request from './request';

export const authApi = {
  login: (data) => request.post('/auth/login', data),
  register: (data) => request.post('/auth/register', data),
  getCurrentUser: () => request.get('/auth/me')
};

export const userApi = {
  list: (params) => request.get('/users', { params }),
  get: (id) => request.get(`/users/${id}`),
  create: (data) => request.post('/users', data),
  update: (id, data) => request.put(`/users/${id}`, data),
  delete: (id) => request.delete(`/users/${id}`),
  getDoctors: () => request.get('/doctors')
};

export const roleApi = {
  list: () => request.get('/roles'),
  get: (id) => request.get(`/roles/${id}`),
  create: (data) => request.post('/roles', data),
  update: (id, data) => request.put(`/roles/${id}`, data),
  delete: (id) => request.delete(`/roles/${id}`)
};

export const menuApi = {
  list: () => request.get('/menus'),
  tree: () => request.get('/menus/tree'),
  get: (id) => request.get(`/menus/${id}`),
  create: (data) => request.post('/menus', data),
  update: (id, data) => request.put(`/menus/${id}`, data),
  delete: (id) => request.delete(`/menus/${id}`)
};

export const insuranceApi = {
  list: (params) => request.get('/insurances', { params }),
  get: (id) => request.get(`/insurances/${id}`),
  create: (data) => request.post('/insurances', data),
  update: (id, data) => request.put(`/insurances/${id}`, data),
  delete: (id) => request.delete(`/insurances/${id}`)
};

export const medicineApi = {
  list: (params) => request.get('/medicines', { params }),
  get: (id) => request.get(`/medicines/${id}`),
  create: (data) => request.post('/medicines', data),
  update: (id, data) => request.put(`/medicines/${id}`, data),
  delete: (id) => request.delete(`/medicines/${id}`)
};

export const healthApi = {
  list: (params) => request.get('/health', { params }),
  get: (id) => request.get(`/health/${id}`),
  create: (data) => request.post('/health', data),
  update: (id, data) => request.put(`/health/${id}`, data),
  delete: (id) => request.delete(`/health/${id}`)
};

export const appointmentApi = {
  list: (params) => request.get('/appointments', { params }),
  get: (id) => request.get(`/appointments/${id}`),
  create: (data) => request.post('/appointments', data),
  update: (id, data) => request.put(`/appointments/${id}`, data),
  delete: (id) => request.delete(`/appointments/${id}`)
};

export const visitApi = {
  list: (params) => request.get('/visits', { params }),
  get: (id) => request.get(`/visits/${id}`),
  create: (data) => request.post('/visits', data),
  update: (id, data) => request.put(`/visits/${id}`, data),
  delete: (id) => request.delete(`/visits/${id}`)
};
