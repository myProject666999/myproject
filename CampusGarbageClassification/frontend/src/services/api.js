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
  delete: (id) => api.delete(`/admin/advocates/${id}`),
};

export const bagAPI = {
  getTypes: () => api.get('/bag-types'),
  getList: (params) => api.get('/bags', { params }),
  getDetail: (id) => api.get(`/bags/${id}`),
  purchase: (data) => api.post('/bags/purchase', data),
  getMyPurchases: (params) => api.get('/my-purchases', { params }),
  getAdminTypes: () => api.get('/admin/bag-types'),
  createType: (data) => api.post('/admin/bag-types', data),
  updateType: (id, data) => api.put(`/admin/bag-types/${id}`, data),
  deleteType: (id) => api.delete(`/admin/bag-types/${id}`),
  getAdminList: (params) => api.get('/admin/bags', { params }),
  create: (data) => api.post('/admin/bags', data),
  update: (id, data) => api.put(`/admin/bags/${id}`, data),
  delete: (id) => api.delete(`/admin/bags/${id}`),
  getPurchases: (params) => api.get('/admin/purchases', { params }),
};

export const productAPI = {
  getList: (params) => api.get('/products', { params }),
  getDetail: (id) => api.get(`/products/${id}`),
  exchange: (data) => api.post('/products/exchange', data),
  getMyExchanges: (params) => api.get('/my-exchanges', { params }),
  getAdminList: (params) => api.get('/admin/products', { params }),
  create: (data) => api.post('/admin/products', data),
  update: (id, data) => api.put(`/admin/products/${id}`, data),
  delete: (id) => api.delete(`/admin/products/${id}`),
  getExchanges: (params) => api.get('/admin/exchanges', { params }),
};

export const binAPI = {
  getList: () => api.get('/admin/bins'),
  create: (data) => api.post('/admin/bins', data),
  update: (id, data) => api.put(`/admin/bins/${id}`, data),
  delete: (id) => api.delete(`/admin/bins/${id}`),
};

export const throwAPI = {
  add: (data) => api.post('/throws', data),
  getMyRecords: (params) => api.get('/my-throws', { params }),
  getAdminList: (params) => api.get('/admin/throws', { params }),
};

export const creativeAPI = {
  getTypes: () => api.get('/creative-types'),
  getMyList: () => api.get('/my-creatives'),
  create: (data) => api.post('/creatives', data),
  update: (id, data) => api.put(`/creatives/${id}`, data),
  delete: (id) => api.delete(`/creatives/${id}`),
  getAdminTypes: () => api.get('/admin/creative-types'),
  createType: (data) => api.post('/admin/creative-types', data),
  updateType: (id, data) => api.put(`/admin/creative-types/${id}`, data),
  deleteType: (id) => api.delete(`/admin/creative-types/${id}`),
  getAdminList: (params) => api.get('/admin/creatives', { params }),
};

export const adminAPI = {
  getStudents: (params) => api.get('/admin/students', { params }),
  getSiteInfo: (type) => api.get('/siteinfo', { params: { type } }),
  updateSiteInfo: (data) => api.post('/admin/siteinfo', data),
};
