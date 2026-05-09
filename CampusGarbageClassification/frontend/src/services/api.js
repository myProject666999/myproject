import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  login: (data) => api.post('/login', data),
  register: (data) => api.post('/register', data),
  getCurrentUser: () => api.get('/user/me'),
  updateProfile: (data) => api.put('/user/profile', data),
  updatePassword: (data) => api.put('/user/password', data),
  getAdminProfile: () => api.get('/admin/me'),
  updateAdminProfile: (data) => api.put('/admin/profile', data),
  updateAdminPassword: (data) => api.put('/admin/password', data),
};

export const noticeAPI = {
  getList: (params) => api.get('/notices', { params }),
  getDetail: (id) => api.get(`/notices/${id}`),
  getAdminList: (params) => api.get('/admin/notices', { params }),
  create: (data) => api.post('/admin/notices', data),
  update: (id, data) => api.put(`/admin/notices/${id}`, data),
  delete: (id) => api.delete(`/admin/notices/${id}`),
};

export const advocateAPI = {
  getCategories: () => api.get('/advocate-categories'),
  getList: (params) => api.get('/advocates', { params }),
  getDetail: (id) => api.get(`/advocates/${id}`),
  getAdminCategories: () => api.get('/admin/advocate-categories'),
  createCategory: (data) => api.post('/admin/advocate-categories', data),
  updateCategory: (id, data) => api.put(`/admin/advocate-categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/advocate-categories/${id}`),
  getAdminList: (params) => api.get('/admin/advocates', { params }),
  create: (data) => api.post('/admin/advocates', data),
  update: (id, data) => api.put(`/admin/advocates/${id}`, data),
  delete: (id) => api.delete(`/admin/adv