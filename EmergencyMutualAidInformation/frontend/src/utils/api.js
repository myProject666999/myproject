import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code === 200) {
      return res.data;
    }
    return Promise.reject(new Error(res.message || '请求失败'));
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const noticeAPI = {
  getList: (params) => api.get('/notices', { params }),
  getDetail: (id) => api.get(`/notices/${id}`),
  create: (data) => api.post('/admin/notices', data),
  update: (id, data) => api.put(`/admin/notices/${id}`, data),
  delete: (id) => api.delete(`/admin/notices/${id}`),
};

export const materialAPI = {
  getList: (params) => api.get('/materials', { params }),
  getDetail: (id) => api.get(`/materials/${id}`),
  create: (data) => api.post('/admin/materials', data),
  update: (id, data) => api.put(`/admin/materials/${id}`, data),
  delete: (id) => api.delete(`/admin/materials/${id}`),
  apply: (data) => api.post('/user/apply-material', data),
  allocate: (data) => api.post('/admin/materials/allocate', data),
};

export const knowledgeAPI = {
  getList: (params) => api.get('/knowledge', { params }),
  getDetail: (id) => api.get(`/knowledge/${id}`),
  create: (data) => api.post('/admin/knowledge', data),
  update: (id, data) => api.put(`/admin/knowledge/${id}`, data),
  delete: (id) => api.delete(`/admin/knowledge/${id}`),
};

export const rumorAPI = {
  getList: (params) => api.get('/rumors', { params }),
  getDetail: (id) => api.get(`/rumors/${id}`),
  create: (data) => api.post('/admin/rumors', data),
  update: (id, data) => api.put(`/admin/rumors/${id}`, data),
  delete: (id) => api.delete(`/admin/rumors/${id}`),
};

export const recruitmentAPI = {
  getList: (params) => api.get('/recruitments', { params }),
  getDetail: (id) => api.get(`/recruitments/${id}`),
  create: (data) => api.post('/admin/recruitments', data),
  update: (id, data) => api.put(`/admin/recruitments/${id}`, data),
  delete: (id) => api.delete(`/admin/recruitments/${id}`),
  like: (id) => api.post(`/recruitments/${id}/like`),
  dislike: (id) => api.post(`/recruitments/${id}/dislike`),
  apply: (data) => api.post('/user/apply-recruitment', data),
};

export const userAPI = {
  updateProfile: (data) => api.put('/user/profile', data),
  getFavorites: () => api.get('/user/favorites'),
  addFavorite: (data) => api.post('/user/favorites', data),
  removeFavorite: (id) => api.delete(`/user/favorites/${id}`),
  changePassword: (data) => api.put('/admin/change-password', data),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  
  getVolunteers: (params) => api.get('/admin/volunteers', { params }),
  getVolunteer: (id) => api.get(`/admin/volunteers/${id}`),
  createVolunteer: (data) => api.post('/admin/volunteers', data),
  updateVolunteer: (id, data) => api.put(`/admin/volunteers/${id}`, data),
  deleteVolunteer: (id) => api.delete(`/admin/volunteers/${id}`),
  
  getHelpRequests: (params) => api.get('/admin/help-requests', { params }),
  approveHelpRequest: (id, data) => api.put(`/admin/help-requests/${id}/approve`, data),
  getHelpRequestStats: () => api.get('/admin/help-requests/stats'),
  
  getApplications: (params) => api.get('/admin/applications', { params }),
  approveApplication: (id, data) => api.put(`/admin/applications/${id}/approve`, data),
  
  getRecruitmentApplications: (params) => api.get('/admin/recruitment-applications', { params }),
  approveRecruitmentApplication: (id, data) => api.put(`/admin/recruitment-applications/${id}/approve`, data),
  
  getMedicalAids: (params) => api.get('/admin/medical-aids', { params }),
  getMedicalAid: (id) => api.get(`/admin/medical-aids/${id}`),
  approveMedicalAid: (id, data) => api.put(`/admin/medical-aids/${id}/approve`, data),
  deleteMedicalAid: (id) => api.delete(`/admin/medical-aids/${id}`),
};

export default api;
